import { MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { DmThreadCard } from "@/components/dms/dm-thread-card";
import { getDmThreads } from "@/lib/dm";

export const dynamic = "force-dynamic";

export default async function DmsPage() {
  const threads = await getDmThreads();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        icon={MessageCircle}
        color="magenta"
        title="DMs"
        description="Drafted replies for your review — nothing is ever sent automatically."
      />

      <Alert>
        <MessageCircle />
        <AlertTitle>Requires a one-time webhook setup</AlertTitle>
        <AlertDescription>
          Instagram pushes DMs to this app via a webhook rather than a pollable endpoint, so it
          needs a publicly reachable URL — not available on plain localhost. To receive real DMs:
          run a tunnel (e.g. <code>ngrok http 3000</code>), add{" "}
          <code>&lt;your-tunnel-url&gt;/api/instagram/webhook</code> as a webhook callback URL in
          your Meta app&apos;s Instagram product settings, set a verify token there and put the
          same value in <code>.env.local</code> as <code>IG_WEBHOOK_VERIFY_TOKEN</code>. Your
          stored connection also needs the <code>instagram_business_manage_messages</code>{" "}
          permission, which the initial Settings connection didn&apos;t request — you&apos;ll
          need to reconnect once that scope is added to the app&apos;s login flow. Until all of
          that&apos;s done this page will stay empty, and the DM agent (disabled by default on
          the Agents page) has nothing to draft against.
        </AlertDescription>
      </Alert>

      {threads.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          color="magenta"
          title="No DM threads yet"
          description="Once the webhook above is receiving messages and the DM agent has run, drafted replies will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {threads.map((thread) => (
            <DmThreadCard
              key={thread.id}
              thread={{
                id: thread.id,
                igThreadId: thread.igThreadId,
                participantUsername: thread.participantUsername,
                category: thread.category,
                draftReply: thread.draftReply,
                draftStatus: thread.draftStatus,
                lastMessageAt: thread.lastMessageAt.toISOString(),
                messages: thread.messages.map((m) => ({
                  id: m.id,
                  fromUser: m.fromUser,
                  text: m.text,
                  sentAt: m.sentAt.toISOString(),
                })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
