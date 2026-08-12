import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Instagram Messaging is webhook-push, not pollable, under the Business
// Login flow this app uses — Meta calls this endpoint when a DM arrives.
// It is NOT reachable until you register a public URL for it (e.g. an
// ngrok tunnel in dev) in the Meta app's webhook settings, with
// IG_WEBHOOK_VERIFY_TOKEN set to whatever verify token you configure there.
// See the DM Manager page for the rest of the setup steps.

// Meta's one-time subscription handshake.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.IG_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !process.env.IG_APP_SECRET) return false;
  const expected = createHmac("sha256", process.env.IG_APP_SECRET).update(rawBody).digest("hex");
  const provided = signatureHeader.replace("sha256=", "");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false; // length mismatch etc.
  }
}

interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: { mid: string; text?: string };
    }>;
  }>;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!isValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody) as WebhookPayload;
  const account = await db.account.findFirst();

  for (const entry of payload.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      if (!event.message) continue; // ignore read receipts, reactions, etc.

      const fromUser = event.sender.id !== account?.igUserId;
      const otherPartyId = fromUser ? event.sender.id : event.recipient.id;

      const thread = await db.dmThread.upsert({
        where: { igThreadId: otherPartyId },
        create: { igThreadId: otherPartyId, lastMessageAt: new Date(event.timestamp) },
        update: { lastMessageAt: new Date(event.timestamp) },
      });

      await db.dmMessage.upsert({
        where: { igMessageId: event.message.mid },
        create: {
          threadId: thread.id,
          igMessageId: event.message.mid,
          fromUser,
          text: event.message.text ?? null,
          sentAt: new Date(event.timestamp),
        },
        update: {},
      });
    }
  }

  return NextResponse.json({ received: true });
}
