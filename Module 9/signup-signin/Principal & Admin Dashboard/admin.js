const sidebar = document.querySelector("#sidebar");
document
  .querySelector("#menu-toggle")
  .addEventListener("click", () => sidebar.classList.toggle("open"));
document.querySelectorAll(".nav-item").forEach((link) =>
  link.addEventListener("click", () => {
    if (link.hash && !["#dashboard", "#attendance"].includes(link.hash)) {
      const label = link.textContent.trim();
      if (!document.querySelector(link.hash)) {
        alert(
          `${label} section selected. This dashboard preview is ready to connect to that module.`,
        );
      }
    }
    document
      .querySelectorAll(".nav-item")
      .forEach((item) => item.classList.remove("active"));
    if (link.closest(".nav")) link.classList.add("active");
    sidebar.classList.remove("open");
  }),
);
function updatePending() {
  const count = document.querySelectorAll(".approval:not(.removed)").length;
  document.querySelector("#pending-count").textContent = `${count} Pending`;
}
document.querySelectorAll(".dismiss").forEach((button) =>
  button.addEventListener("click", () => {
    button.closest(".approval").classList.add("removed");
    updatePending();
  }),
);
document.querySelectorAll(".approve").forEach((button) =>
  button.addEventListener("click", () => {
    button.closest(".approval").classList.add("removed");
    updatePending();
  }),
);
document
  .querySelector("#export-report")
  .addEventListener("click", () => window.print());
document
  .querySelector("#helpdesk")
  .addEventListener("click", () =>
    alert(
      "Executive Help Desk: contact your school administrator for escalation support.",
    ),
  );
