document.addEventListener("DOMContentLoaded", () => {
    const year = new Date().getFullYear();
    const footer = document.querySelector(".footer");
    if (!footer) {
        return;
    }

    const note = footer.querySelector(".footer-note");
    if (note) {
        note.textContent = `© ${year} College Admission Portal. All rights reserved.`;
    }

    // Lightweight smooth scrolling for same-page anchors.
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const href = a.getAttribute("href");
            if (!href || href === "#") return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            history.pushState(null, "", href);
        });
    });

    // Minimal slider (no libraries).
    document.querySelectorAll("[data-slider]").forEach((slider) => {
        const slidesEl = slider.querySelector("[data-slides]");
        const slideEls = Array.from(slider.querySelectorAll("[data-slide]"));
        const prevBtn = slider.querySelector("[data-prev]");
        const nextBtn = slider.querySelector("[data-next]");
        const dotsEl = slider.querySelector("[data-dots]");

        if (!slidesEl || slideEls.length === 0) return;

        let index = 0;
        let timer = null;

        const dots = slideEls.map((_, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "dot";
            b.setAttribute("aria-label", `Go to slide ${i + 1}`);
            b.addEventListener("click", () => goTo(i));
            dotsEl?.appendChild(b);
            return b;
        });

        function render() {
            slidesEl.style.transform = `translateX(${-index * 100}%)`;
            dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
        }

        function goTo(nextIndex) {
            index = (nextIndex + slideEls.length) % slideEls.length;
            render();
        }

        function next() {
            goTo(index + 1);
        }

        function prev() {
            goTo(index - 1);
        }

        prevBtn?.addEventListener("click", prev);
        nextBtn?.addEventListener("click", next);

        const wantsAutoplay = slider.getAttribute("data-autoplay") === "true";
        if (wantsAutoplay) {
            const start = () => {
                stop();
                timer = window.setInterval(next, 4500);
            };
            const stop = () => {
                if (timer) window.clearInterval(timer);
                timer = null;
            };

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            slider.addEventListener("focusin", stop);
            slider.addEventListener("focusout", start);
            start();
        }

        render();
    });

    // Masthead background image slider (contained, not full-screen).
    document.querySelectorAll("[data-bg-slider]").forEach((el) => {
        const images = Array.from(el.querySelectorAll("img"));
        if (images.length === 0) return;

        let index = 0;
        let timer = null;

        function render() {
            images.forEach((img, i) => img.classList.toggle("is-active", i === index));
        }

        function next() {
            index = (index + 1) % images.length;
            render();
        }

        const wantsAutoplay = el.getAttribute("data-autoplay") === "true";
        if (wantsAutoplay && images.length > 1) {
            const start = () => {
                stop();
                timer = window.setInterval(next, 5000);
            };
            const stop = () => {
                if (timer) window.clearInterval(timer);
                timer = null;
            };

            el.addEventListener("mouseenter", stop);
            el.addEventListener("mouseleave", start);
            el.addEventListener("focusin", stop);
            el.addEventListener("focusout", start);
            start();
        }

        render();
    });
});
