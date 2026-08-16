import { redirect } from "next/navigation";

// Agents is now a section on the single scrolling home page rather than
// its own route — this only exists to catch old bookmarks/links.
export default function AgentsRedirect() {
  redirect("/#agents");
}
