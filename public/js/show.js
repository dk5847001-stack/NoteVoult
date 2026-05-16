let order = document.getElementById("order");
let plan = document.getElementById("plan");

order.addEventListener("click", () => {
    plan.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});
