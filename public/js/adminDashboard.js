// File: public/js/adminDashboard.js
// Admin dashboard interactions. Existing route logic is unchanged.

(function () {
    function scrollToSection(buttonId, targetId) {
        const button = document.getElementById(buttonId);
        const target = document.getElementById(targetId);

        if (!button || !target) return;

        button.addEventListener("click", () => {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

    function bindDownloadButtons() {
        document.querySelectorAll(".download-btn").forEach(btn => {
            if (btn.dataset.bound === "true") return;
            btn.dataset.bound = "true";

            btn.addEventListener("click", function (e) {
                e.preventDefault();

                const text = this.querySelector(".btn-text");
                const loading = this.querySelector(".loading-text");

                if (text) text.classList.add("d-none");
                if (loading) loading.classList.remove("d-none");
                this.classList.add("disabled");

                setTimeout(() => {
                    window.location.href = this.href;
                }, 350);
            });
        });
    }

    window.addEventListener("load", () => {
        const skeleton = document.querySelector(".pdf-admin-section .skeleton-wrapper");
        const realData = document.querySelector(".pdf-admin-section .real-data");

        setTimeout(() => {
            if (skeleton && realData) {
                skeleton.style.display = "none";
                realData.classList.remove("d-none");
            }
        }, 700);

        bindDownloadButtons();
    });

    scrollToSection("manageUsersBtn", "section1");
    scrollToSection("subscriberBtn", "subscriber");
    scrollToSection("pdfs", "allPdfs");
})();
