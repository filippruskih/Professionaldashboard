import { redirect } from "next/navigation";

// Content DNA is now folded into the Insights page rather than being its
// own destination — this only exists to catch old bookmarks/links.
export default function ContentDnaRedirect() {
  redirect("/insights");
}
