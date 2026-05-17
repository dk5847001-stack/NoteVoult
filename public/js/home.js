document.querySelectorAll(".faq-question").forEach((question) => {
            question.addEventListener("click", () => {
                const currentBox = question.closest(".faq-box");

                document.querySelectorAll(".faq-box").forEach((box) => {
                    if (box !== currentBox) {
                        box.classList.remove("active");
                    }
                });

                currentBox.classList.toggle("active");
            });
        });
