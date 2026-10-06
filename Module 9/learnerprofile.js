const sidebar = document.querySelector("#sidebar");
const toast = document.querySelector("#toast");
let toastTimer;

document.querySelector("#menu-toggle").addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

document.querySelectorAll("[data-message]").forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.message));
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    if (tab.dataset.tab !== "overview") {
      showToast(`${tab.textContent.trim()} section selected.`);
    }
  });
});

document.querySelectorAll(".sidebar nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".sidebar nav a").forEach((item) => item.classList.remove("selected"));
    link.classList.add("selected");
    sidebar.classList.remove("open");
  });
});
