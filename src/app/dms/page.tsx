import { redirect } from "next/navigation";

// DMs is now a section on the single scrolling home page rather than its
// own route — this only exists to catch old bookmarks/links.
export default function DmsRedirect() {
  redirect("/#dms");
}
