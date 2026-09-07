import { redirect } from "next/navigation";

// Renamed to /profile, matching Instagram's own convention of keeping
// account/settings under the profile tab rather than a separate one. This
// only exists to catch old bookmarks/links.
export default async function SettingsRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = new URLSearchParams(await searchParams);
  const query = params.toString();
  redirect(query ? `/profile?${query}` : "/profile");
}
