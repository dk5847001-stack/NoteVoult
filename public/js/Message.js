const contactForm = document.querySelector(".needs-validation");
    const messageBtn = document.getElementById("messageBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            if (!contactForm.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                contactForm.classList.add("was-validated");
                return;
            }

            btnSpinner.classList.remove("d-none");
            btnText.innerHTML = `<i class="fa-solid fa-paper-plane me-2"></i> Sending...`;
            messageBtn.disabled = true;
            messageBtn.style.cursor = "not-allowed";

            contactForm.classList.add("was-validated");
        });
    }