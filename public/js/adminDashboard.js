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
    scrollToSection("message", "allMessages");
})();



function attachDownloadLoading() {
    document.querySelectorAll(".download-btn").forEach(btn => {
        if (btn.dataset.loadingAttached === "true") return;

        btn.dataset.loadingAttached = "true";

        btn.addEventListener("click", function (e) {
            e.preventDefault();

            const text = this.querySelector(".btn-text");
            const loading = this.querySelector(".loading-text");

            if (text && loading) {
                text.classList.add("d-none");
                loading.classList.remove("d-none");
            }

            this.classList.add("disabled");

            setTimeout(() => {
                window.location.href = this.href;
            }, 300);

            setTimeout(() => {
                if (text && loading) {
                    text.classList.remove("d-none");
                    loading.classList.add("d-none");
                }

                this.classList.remove("disabled");
            }, 6000);
        });
    });
}

function updateCountdowns() {
    const countdowns = document.querySelectorAll(".countdown-text");

    countdowns.forEach(item => {
        const unlockTime = Number(item.dataset.unlock);

        if (!unlockTime || isNaN(unlockTime)) {
            console.log("Invalid unlock time:", item.dataset.unlock);
            return;
        }

        const now = Date.now();
        const diff = unlockTime - now;

        const card = item.closest(".card");
        const lockedBtn = card ? card.querySelector(".locked-download-btn") : null;

        if (diff <= 0) {
            item.innerHTML = `
                <i class="fa-regular fa-clock me-1"></i>
                ${item.dataset.uploaded || "No date"}
            `;

            if (lockedBtn) {
                const url = lockedBtn.dataset.downloadUrl;

                lockedBtn.outerHTML = `
                    <a href="${url}"
                        class="btn btn-outline-primary btn-premium mt-auto download-btn">

                        <span class="btn-text">
                            <i class="bi bi-download"></i> Pay & Download
                        </span>

                        <span class="loading-text d-none">
                            <span class="spinner-border spinner-border-sm me-2"></span>
                            Downloading...
                        </span>
                    </a>
                `;

                attachDownloadLoading();
            }

            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.ceil((diff / 1000) % 60);

        if (days > 0) {
            item.innerHTML = `
                <i class="fa-solid fa-lock me-1"></i>
                Unlock in ${days}d ${hours}h ${minutes}m ${seconds}s
            `;
        } else {
            item.innerHTML = `
                <i class="fa-solid fa-lock me-1"></i>
                Unlock in ${hours}h ${minutes}m ${seconds}s
            `;
        }
    });
}

attachDownloadLoading();
setInterval(updateCountdowns, 1000);
updateCountdowns();
