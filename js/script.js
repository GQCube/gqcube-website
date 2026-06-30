(() => {
  "use strict";

  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  };

  const revealOnIntersect = (elements) => {
    const targets = Array.from(elements);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (
      targets.length === 0
      || prefersReducedMotion
      || !("IntersectionObserver" in window)
    ) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    targets.forEach((target) => target.classList.add("is-reveal-ready"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.2,
      },
    );

    targets.forEach((target) => observer.observe(target));
  };

  onReady(() => {
    document.querySelectorAll("[data-site-header]").forEach((header) => {
      const menuToggle = header.querySelector("[data-menu-toggle]");
      const mobileMenu = header.querySelector("[data-mobile-menu]");
      const logo = header.querySelector("[data-header-logo]");
      const desktopMedia = window.matchMedia("(min-width: 50.0625rem)");
      let nextLogoRotation = "clockwise";
      let scrollFrame = null;

      const updateScrolledState = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 12);
        scrollFrame = null;
      };

      const requestScrollUpdate = () => {
        if (scrollFrame === null) {
          scrollFrame = window.requestAnimationFrame(updateScrolledState);
        }
      };

      const setMenuState = (isOpen, returnFocus = false) => {
        if (!menuToggle || !mobileMenu) {
          return;
        }

        header.classList.toggle("is-menu-open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
          "aria-label",
          isOpen ? "Close navigation menu" : "Open navigation menu",
        );
        mobileMenu.hidden = !isOpen;
        document.body.classList.toggle("has-open-menu", isOpen);

        if (isOpen) {
          mobileMenu.querySelector("a")?.focus();
        } else if (returnFocus) {
          menuToggle.focus();
        }
      };

      menuToggle?.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        setMenuState(!isOpen);
      });

      mobileMenu?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenuState(false));
      });

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape"
          && menuToggle?.getAttribute("aria-expanded") === "true"
        ) {
          setMenuState(false, true);
        }
      });

      desktopMedia.addEventListener("change", (event) => {
        if (event.matches) {
          setMenuState(false);
        }
      });

      logo?.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") {
          return;
        }

        logo.classList.remove(
          "is-rotating-clockwise",
          "is-rotating-counterclockwise",
        );
        logo.classList.add(`is-rotating-${nextLogoRotation}`);
        nextLogoRotation = nextLogoRotation === "clockwise"
          ? "counterclockwise"
          : "clockwise";
      });

      logo?.addEventListener("pointerleave", () => {
        logo.classList.remove(
          "is-rotating-clockwise",
          "is-rotating-counterclockwise",
        );
      });

      window.addEventListener("scroll", requestScrollUpdate, { passive: true });
      updateScrolledState();
    });

    revealOnIntersect(document.querySelectorAll("[data-reveal]"));
  });
})();
