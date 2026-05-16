const form = document.querySelector("form");
    const btn = document.getElementById("uploadBtn");
    const spinner = document.getElementById("spinner");
    const text = document.getElementById("btnText");

    form.addEventListener("submit", (e) => {
        if (!form.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
            form.classList.add("was-validated");
            return;
        }

        spinner.classList.remove("d-none");
        text.innerHTML = `<i class="fa-solid fa-cloud-arrow-up me-2"></i> Uploading...`;
        btn.disabled = true;
        btn.style.cursor = "not-allowed";

        form.classList.add("was-validated");
    });
