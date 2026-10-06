// Shared role selection and demo profile autofill for signup/sign-in pages.
const roleButtons = [...document.querySelectorAll(".role")];
roleButtons.forEach((button) => {
  button.setAttribute("aria-pressed", button.classList.contains("active"));
  button.addEventListener("click", () => {
    roleButtons.forEach((role) => {
      const active = role === button;
      role.classList.toggle("active", active);
      role.setAttribute("aria-pressed", String(active));
    });
  });
});

document.querySelectorAll(".chip").forEach((button) =>
  button.addEventListener("click", () => {
    const email = document.querySelector("#email");
    const name = document.querySelector("#full-name");
    if (email) email.value = button.dataset.email;
    if (name && button.dataset.name) name.value = button.dataset.name;
    const role = roleButtons.find((item) =>
      item.textContent.includes(button.dataset.role),
    );
    if (role) role.click();
  }),
);

const signupForm = document.querySelector("#signup-form");
function destinationForRole(roleName) {
  const role = roleName.toLowerCase();
  // Parent and learner accounts open the learner view; school staff open administration.
  return role.includes("parent") || role.includes("learner")
    ? "../learnerprofile.html"
    : "../admin.html";
}

const ACCOUNTS_KEY = "edusync.accounts";
function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

async function hashPassword(value) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure password storage is unavailable. Open this page through localhost or HTTPS, then try again.");
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.querySelector("#password");
    const confirm = document.querySelector("#confirm-password");
    if (password.value !== confirm.value) {
      confirm.setCustomValidity("Passwords do not match.");
      confirm.reportValidity();
      return;
    }
    confirm.setCustomValidity("");
    const selectedRole = roleButtons.find((button) => button.classList.contains("active"));
    const email = document.querySelector("#email").value.trim().toLowerCase();
    try {
      const accounts = readAccounts();
      accounts[email] = {
        name: document.querySelector("#full-name").value.trim(),
        staffId: document.querySelector("#staff-id")?.value.trim() ?? "",
        role: selectedRole?.textContent.trim() ?? "Principal",
        passwordHash: await hashPassword(password.value),
      };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      alert("Your details have been saved. You can now sign in with this email and password.");
      window.location.href = "signin.html";
    } catch (error) {
      alert(error.message || "Your details could not be saved. Please try again.");
    }
  });
  document
    .querySelector("#confirm-password")
    ?.addEventListener("input", (event) => event.target.setCustomValidity(""));
}

const password = document.querySelector("#password");
const passwordToggle = document.querySelector(".toggle-password");
passwordToggle?.addEventListener("click", () => {
  const visible = password.type === "password";
  password.type = visible ? "text" : "password";
  passwordToggle.setAttribute(
    "aria-label",
    visible ? "Hide password" : "Show password",
  );
  passwordToggle.title = visible ? "Hide password" : "Show password";
});

const signinForm = document.querySelector("#signin-form");
signinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.querySelector("#email").value.trim().toLowerCase();
  const passwordInput = document.querySelector("#password");
  const account = readAccounts()[email];
  if (!account) {
    alert("No saved account was found for that email. Create an account first.");
    return;
  }
  try {
    const enteredHash = await hashPassword(passwordInput.value);
    if (enteredHash !== account.passwordHash) {
      alert("Incorrect password. Please try again.");
      passwordInput.focus();
      passwordInput.select();
      return;
    }
    window.location.href = destinationForRole(account.role);
  } catch (error) {
    alert(error.message || "Sign-in could not be completed. Please try again.");
  }
});
