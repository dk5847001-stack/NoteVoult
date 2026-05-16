window.addEventListener("load", () => {
            document.querySelectorAll(".skeleton-wrapper").forEach((skeleton) => {
                const panel = skeleton.closest(".tab-panel");
                const realData = panel.querySelector(".real-data");

                if (skeleton && realData) {
                    skeleton.style.display = "none";
                    realData.classList.remove("d-none");
                }
            });
        });

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

        attachDownloadLoading();

        const tabs = document.querySelectorAll("#tabMenu li");
        const sections = document.querySelectorAll(".tab-panel");
        const indicator = document.getElementById("indicator");

        function moveIndicator(el) {
            if (!indicator || !el) return;

            indicator.style.width = el.offsetWidth + "px";
            indicator.style.left = el.offsetLeft + "px";
        }

        window.addEventListener("load", () => {
            moveIndicator(document.querySelector("#tabMenu li.active"));
        });

        tabs.forEach((tab, index) => {
            tab.addEventListener("click", (e) => {
                e.preventDefault();

                tabs.forEach(t => t.classList.remove("active"));
                sections.forEach(s => s.classList.remove("active"));

                tab.classList.add("active");
                sections[index].classList.add("active");

                moveIndicator(tab);
            });
        });

        window.addEventListener("resize", () => {
            moveIndicator(document.querySelector("#tabMenu li.active"));
        });

        const microFilterForm = document.getElementById("microFilterForm");
        const microData = document.getElementById("microData");

        microFilterForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const branch = this.branch.value;
            const semester = this.semester.value;
            const minPrice = this.minPrice.value;

            const params = new URLSearchParams();
            params.append("category", "micro");

            if (branch) params.append("branch", branch);
            if (semester) params.append("semester", semester);
            if (minPrice) params.append("minPrice", minPrice);

            microData.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-light"></div>
                <p class="text-light mt-2">Filtering...</p>
            </div>
        `;

            const res = await fetch(`/pdfs/api/filter?${params.toString()}`);
            const pdfs = await res.json();

            if (!pdfs.length) {
                microData.innerHTML = `
                <div class="col-12 text-center">
                    <h4 class="text-muted">No PDFs found</h4>
                </div>
            `;
                return;
            }

            microData.innerHTML = pdfs.map(pdf => `
            <div class="col-6 col-sm-6 col-md-4 col-lg-3">
                <div class="card pdf-card h-100 text-center p-3">
                    <img src="https://www.freeiconspng.com/thumbs/pdf-icon-png/pdf-word-icon-31.png"
                        class="pdf-icon" alt="pdf">

                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-2">${pdf.title}</h5>

                        <p>
                            <span class="badge rounded-pill text-bg-warning">${pdf.branch || ""}</span>
                            <span class="badge rounded-pill text-bg-success">Semester : ${pdf.semester || ""}</span>
                        </p>

                        <div class="mb-3">
                            <div class="price-pill">
                                <i class="fa-regular fa-circle-check"></i>
                                <span>Rs. ${pdf.price}</span>
                            </div>
                        </div>

                        <a href="/pdfs/download/${pdf._id}"
                            class="btn btn-outline-primary btn-premium mt-auto download-btn">

                            <span class="btn-text">
                                <i class="bi bi-download"></i> Pay & Download
                            </span>

                            <span class="loading-text d-none">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                Downloading...
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        `).join("");

            attachDownloadLoading();
        });