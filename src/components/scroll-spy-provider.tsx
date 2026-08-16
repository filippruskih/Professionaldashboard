"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ScrollSpyContext = createContext<string | null>(null);

export function useActiveSection(): string | null {
  return useContext(ScrollSpyContext);
}

// Tracks which <section id="..."> is currently in view on the home page,
// so the sidebar/header can highlight "you are here" while scrolling
// instead of only on click. Finds nothing (and stays null) on any other
// page, since those don't have section ids to observe — callers fall back
// to pathname-based matching in that case.
export function ScrollSpyProvider({
  sectionIds,
  children,
}: {
  sectionIds: string[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (elements.length === 0) return;

    // A section counts as "active" once it's crossed into the upper band
    // of the viewport (just below the sticky header) and hasn't yet
    // scrolled past the lower band — picks the topmost qualifying section
    // when several are tall enough to overlap that band.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sectionIds]);

  return <ScrollSpyContext.Provider value={active}>{children}</ScrollSpyContext.Provider>;
}
