"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export function useScrollAnchor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const lastScrollTop = useRef(0);

  // Detect manual scroll up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const st = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const isNearBottom = maxScroll - st < 80;

      if (!isNearBottom && st < lastScrollTop.current) {
        setUserScrolledUp(true);
      } else if (isNearBottom) {
        setUserScrolledUp(false);
      }

      lastScrollTop.current = st;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToAnchor = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (userScrolledUp) return; // Respect user's manual scroll

    const anchor = anchorRef.current;
    const container = containerRef.current;
    if (!anchor || !container) return;

    const containerRect = container.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const relativeTop = anchorRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({
      top: relativeTop + anchor.offsetHeight - container.clientHeight + 40,
      behavior,
    });
  }, [userScrolledUp]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (userScrolledUp) return;

    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, [userScrolledUp]);

  return {
    containerRef,
    anchorRef,
    userScrolledUp,
    scrollToAnchor,
    scrollToBottom,
  };
}
