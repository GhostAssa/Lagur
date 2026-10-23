"use client";

import { useEffect } from "react";

export default function ClientMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let dispose = () => {};

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]).then(([gsapModule, scrollModule, lenisModule]) => {
      if (cancelled) return;
      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollModule;
      const { default: Lenis } = lenisModule;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ autoRaf: false });
      const updateScroll = () => ScrollTrigger.update();
      const raf = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", updateScroll);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element, index) => {
        gsap.fromTo(element, { opacity: 0, y: 28 }, {
          opacity: 1, y: 0, duration: 0.7, delay: index * 0.035, ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });

      const route = document.querySelector<SVGPathElement>(".journey-route-progress");
      if (route && window.innerWidth > 760) {
        const length = route.getTotalLength();
        gsap.set(route, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(route, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: ".journey-track", start: "top 72%", end: "bottom 72%", scrub: true },
        });
      }

      if (window.innerWidth > 760) {
        const track = document.querySelector<HTMLElement>(".services-track");
        if (track) {
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);
          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: ".services-section",
              start: "top top+=80",
              end: () => `+=${distance()}`,
              pin: ".services-pin",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
        }
      }

      if (window.innerWidth > 760) {
        gsap.utils.toArray<HTMLElement>(".meme-card").forEach((card, index) => {
          gsap.fromTo(card, { y: index % 2 === 0 ? 16 : -12 }, {
            y: index % 2 === 0 ? -16 : 12,
            ease: "none",
            scrollTrigger: { trigger: ".memes-section", start: "top bottom", end: "bottom top", scrub: 1 },
          });
        });
      }

      dispose = () => {
        lenis.off("scroll", updateScroll);
        lenis.destroy();
        gsap.ticker.remove(raf);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        gsap.killTweensOf(".reveal");
      };
    }).catch(() => {
      // CSS remains the static fallback if an animation chunk cannot load.
    });

    return () => { cancelled = true; dispose(); };
  }, []);

  return null;
}
