document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const navActions = document.querySelector('.nav-actions');

    if (userId && navActions) {
        // User is logged in
        const dashLink = userRole === 'admin' ? 'admin-dashboard.html' : 'Sdash.html';
        navActions.innerHTML = `
            <a class="button secondary" href="${dashLink}">Dashboard</a>
            <button class="button primary" id="logoutBtnMain">Log Out</button>
        `;

        document.getElementById('logoutBtnMain').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
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
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        const passwordInput = profileForm.querySelector('input[name="password"]');
        const confirmPasswordInput = profileForm.querySelector('input[name="confirmPassword"]');
        const statusEl = profileForm.querySelector('[data-profile-status]');

        profileForm.addEventListener('submit', (event) => {
            if (!profileForm.checkValidity()) {
                return;
            }

            if (passwordInput && confirmPasswordInput && passwordInput.value !== confirmPasswordInput.value) {
                event.preventDefault();
                if (statusEl) {
                    statusEl.textContent = 'Passwords do not match. Please re-enter them.';
                }
                confirmPasswordInput.focus();
                return;
            }

            event.preventDefault();
            if (statusEl) {
                statusEl.textContent = 'Profile created. Redirecting to the application...';
            }

            window.location.href = 'apply.html';
        });
    }

    // Programs Tab Functionality
    const programTabs = document.querySelectorAll('.program-tab');
    const programLists = document.querySelectorAll('.program-list');

    programTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            programTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Get the program type from data attribute
            const programType = tab.getAttribute('data-program');

            // Hide all program lists
            programLists.forEach(list => list.classList.remove('active'));
            // Show the selected program list
            const targetList = document.querySelector(`[data-program-content="${programType}"]`);
            if (targetList) {
                targetList.classList.add('active');
            }
        });
    });

    // Stream and Program Selection Dropdown Logic
    const programsByStream = {
        btech: [
            'Computer Science & Engineering',
            'Artificial Intelligence & Machine Learning',
            'CSE (Data Science)',
            'Electronics & Communication Engineering',
            'Electrical & Electronics Engineering',
            'Civil Engineering',
            'Mechanical Engineering',
            'Petroleum Technology',
            'Agricultural Engineering',
            'Mining Engineering',
            'CSE in association with SAP',
            'CSE in association with Google Cloud',
            'AIML in association with Microsoft',
            'AIML in association with Google Cloud',
            'CSE (Data Science) in association with Google Cloud'
        ],
        bba: [
            'BBA in association with Deloitte',
            'BBA (Business Analytics) in association with KPMG',
            'BBA (Global Finance) in association with PWC',
            'BBA (FinTech) in association with EY',
            'BBA (FinTech) in association with Red Varsity'
        ],
        bsc: [
            'Forensic Science',
            'Cyber Security & Digital Forensics'
        ],
        bca: [
            'Bachelor of Computer Applications'
        ],
        pharmacy: [
            'B.Pharmacy',
            'Pharma-D',
            'M.Pharmacy - Pharmaceutics',
            'M.Pharmacy - Pharmaceutical Analysis'
        ],
        mtech: [
            'Structural Engineering',
            'Valuation in Real Estate and Buildings',
            'Power Electronics & Drives',
            'Energy Science & Technology',
            'VLSI Design',
            'CSE (AI&ML)',
            'Computer Science & Engineering',
            'Artificial Intelligence & Data Science',
            'Mining Engineering (Research)'
        ],
        mba: [
            'MBA in association with Deloitte',
            'MBA (Business Analytics) in association with KPMG',
            'MBA (Global Finance) in association with PWC',
            'MBA (FinTech) in association with EY',
            'MBA (Health Care Management) in association with Red Varsity',
            'MBA for Working Professionals'
        ],
        mca: [
            'Master of Computer Applications'
        ],
        msc: [
            'Forensic Science',
            'Cyber Security & Digital Forensics'
        ],
        phd: [
            'Civil Engineering',
            'Electrical & Electronics Engineering',
            'Mechanical Engineering',
            'Electronics & Communication Engineering',
            'Computer Science & Engineering',
            'Petroleum Engineering',
            'Mining Engineering',
            'Agricultural Engineering',
            'Mathematics',
            'Physics',
            'Chemistry',
            'English',
            'Management',
            'Pharmaceutical Sciences'
        ]
    };

    const streamSelect = document.getElementById('streamSelect');
    const programSelect = document.getElementById('programSelect');

    if (streamSelect && programSelect) {
        streamSelect.addEventListener('change', function() {
            const selectedStream = this.value;
            programSelect.innerHTML = '<option value="">-- Select Program --</option>';
            
            if (selectedStream && programsByStream[selectedStream]) {
                programSelect.disabled = false;
                programsByStream[selectedStream].forEach(program => {
                    const option = document.createElement('option');
                    option.value = program;
                    option.textContent = program;
                    programSelect.appendChild(option);
                });
            } else {
                programSelect.disabled = true;
                programSelect.innerHTML = '<option value="">-- First select a stream --</option>';
            }
        });

        // Reset program select when form is reset
        const form = streamSelect.closest('form');
        if (form) {
            form.addEventListener('reset', function() {
                setTimeout(() => {
                    programSelect.disabled = true;
                    programSelect.innerHTML = '<option value="">-- First select a stream --</option>';
                }, 0);
            });
        }
    }

    // Hostel Service Toggle
    const hostelYes = document.getElementById('hostelYes');
    const hostelNo = document.getElementById('hostelNo');
    const hostelOptions = document.getElementById('hostelOptions');
    const hostelTypeSelect = document.getElementById('hostelTypeSelect');

    if (hostelYes && hostelNo && hostelOptions) {
        hostelYes.addEventListener('change', function() {
            if (this.checked) {
                hostelOptions.style.display = 'block';
                hostelTypeSelect.required = true;
            }
        });

        hostelNo.addEventListener('change', function() {
            if (this.checked) {
                hostelOptions.style.display = 'none';
                hostelTypeSelect.required = false;
                hostelTypeSelect.value = '';
            }
        });
    }
});
