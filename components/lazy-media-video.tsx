"use client";

import { useEffect, useRef } from "react";

export type MediaVideoSource = {
  src: string;
  type: "video/mp4" | "video/webm";
  media?: string;
};

type LazyMediaVideoProps = {
  sources: MediaVideoSource[];
  poster: string;
  label: string;
  className?: string;
};

type NetworkInformation = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

export default function LazyMediaVideo({ sources, poster, label, className }: LazyMediaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const network = (navigator as NetworkInformation).connection;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slowConnection = network?.saveData || ["slow-2g", "2g", "3g"].includes(network?.effectiveType ?? "");
    const posterOnly = Boolean(slowConnection || reducedMotion);
    const sourceElements = Array.from(video.querySelectorAll<HTMLSourceElement>("source[data-src]"));

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          video.pause();
          continue;
        }
        if (posterOnly) {
          video.poster = poster;
          continue;
        }

        let assigned = false;
        for (const source of sourceElements) {
          const media = source.dataset.media;
          const matches = !media || window.matchMedia(media).matches;
          if (!matches || !source.dataset.src || !video.canPlayType(source.type)) continue;
          source.src = source.dataset.src;
          delete source.dataset.src;
          assigned = true;
        }
        if (assigned) video.load();
        void video.play().catch(() => {});
      }
    }, { rootMargin: "0px", threshold: 0.1 });

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [poster]);

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      autoPlay
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-label={label}
      tabIndex={-1}
    >
      {sources.map((source) => (
        <source key={`${source.type}-${source.media ?? "all"}`} data-src={source.src} data-media={source.media} type={source.type} />
      ))}
    </video>
  );
}
