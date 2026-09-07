import { MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { DmThreadCard } from "@/components/dms/dm-thread-card";
import { getDmThreads } from "@/lib/dm";

export const dynamic = "force-dynamic";

export default async function DmsPage() {
  const threads = await getDmThreads();

  // IG_REDIRECT_URI is "https://<host>/api/instagram/callback" — reusing
  // its origin means this always shows the *actual* webhook URL for
  // wherever the app is currently running, local or hosted, instead of a
  // placeholder the user has to hand-edit.
  let webhookUrl = "<your-domain>/api/instagram/webhook";
  try {
    if (process.env.IG_REDIRECT_URI) {
      webhookUrl = `${new URL(process.env.IG_REDIRECT_URI).origin}/api/instagram/webhook`;
    }
  } catch {
    // malformed IG_REDIRECT_URI — fall back to the placeholder above
  }

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
          Instagram pushes DMs to this app via a webhook, registered once in your Meta app&apos;s
          dashboard. In Meta&apos;s Instagram product settings → Webhooks: add{" "}
          <code>{webhookUrl}</code> as the callback URL, set a verify token of your choosing, and
          put that same value in your environment as <code>IG_WEBHOOK_VERIFY_TOKEN</code> — then
          subscribe to the <code>messages</code> field. Your connection also needs the{" "}
          <code>instagram_business_manage_messages</code> permission — use the &quot;Reconnect
          Instagram&quot; button in Profile to re-authorize with it if you haven&apos;t already.
          Until both are done this page stays empty, and the DM agent (disabled by default on the
          Agents page) has nothing to draft against.
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
