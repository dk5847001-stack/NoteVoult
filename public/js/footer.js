const form = document.getElementById("subscribeForm");
const btn = document.getElementById("subBtn");
const text = document.getElementById("subText");
const spinner = document.getElementById("subSpinner");

if (form && btn && text && spinner) {
    form.addEventListener("submit", () => {
        spinner.classList.remove("d-none");
        text.innerHTML = "Subscribing...";
        btn.disabled = true;
    });
}