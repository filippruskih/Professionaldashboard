import { redirect } from "next/navigation";

// Settings is now a section on the single scrolling home page rather than
// its own route — this only exists to catch old bookmarks/links. The
// Instagram OAuth callback redirects straight to /#settings itself, so
// this path only matters for stale links.
export default function SettingsRedirect() {
  redirect("/#settings");
}
