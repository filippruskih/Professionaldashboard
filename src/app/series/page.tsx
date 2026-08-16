import { redirect } from "next/navigation";

// Series is now a section on the single scrolling home page rather than
// its own route — this only exists to catch old bookmarks/links. Series
// *detail* pages (/series/[id]) are unaffected and still stand alone.
export default function SeriesRedirect() {
  redirect("/#series");
}
