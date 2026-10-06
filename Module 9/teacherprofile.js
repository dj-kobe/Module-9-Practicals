const learners = [
  {
    roll: "10A-01",
    name: "Kagiso Molefe",
    id: "44029",
    detail: "Bus Route 4",
    status: "L",
    note: "⚠ 2nd day late this week",
    arrival: "Arrived 08:07",
  },
  {
    roll: "10A-02",
    name: "Amanda Khanyile",
    id: "44030",
    detail: "Class Representative",
    status: "P",
    note: "No remarks",
    arrival: "08:00",
  },
  {
    roll: "10A-03",
    name: "Sipho Ndlovu",
    id: "44031",
    detail: "Medical note pending",
    status: "A",
    note: "Unexcused absent",
    arrival: "Not marked",
  },
  {
    roll: "10A-04",
    name: "Thandiwe Zungu",
    id: "44032",
    detail: "Homework Completed",
    status: "P",
    note: "Math Olympiad Participant",
    arrival: "08:02",
  },
  {
    roll: "10A-05",
    name: "Lerato Mokoena",
    id: "44033",
    detail: "",
    status: "P",
    note: "No remarks",
    arrival: "08:01",
  },
  {
    roll: "10A-06",
    name: "Musa Dlamini",
    id: "44034",
    detail: "",
    status: "P",
    note: "No remarks",
    arrival: "08:00",
  },
];
const rosterBody = document.querySelector("#roster-body");
const draftKey = "edusync.teacher.attendance.10A";
try {
  const saved = JSON.parse(localStorage.getItem(draftKey) || "{}");
  learners.forEach((learner) => {
    if (saved[learner.roll]) learner.status = saved[learner.roll];
  });
} catch {
  /* Start with the sample register if stored data is unavailable. */
}

function renderRoster() {
  const query = document.querySelector("#filter").value.trim().toLowerCase();
  const visible = learners.filter((learner) =>
    `${learner.roll} ${learner.name} ${learner.id}`
      .toLowerCase()
      .includes(query),
  );
  rosterBody.innerHTML = visible
    .map((learner) => {
      const initials = learner.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("");
      const buttons = ["P", "A", "L", "E"]
        .map(
          (status) =>
            `<button type="button" data-roll="${learner.roll}" data-status="${status}" class="${learner.status === status ? "selected" : ""}" aria-label="Mark ${learner.name} ${{ P: "present", A: "absent", L: "late", E: "excused" }[status]}">${status}</button>`,
        )
        .join("");
      return `<tr class="${learner.status === "A" ? "absent-row" : ""}"><td>${learner.roll}</td><td><div class="learner"><i>${initials}</i><span><b>${learner.name}</b><small>Roll ID ${learner.id}${learner.detail ? ` • ${learner.detail}` : ""}</small></span></div></td><td><div class="status-group">${buttons}</div></td><td>${learner.note === "No remarks" ? `<i>${learner.note}</i>` : `<span class="note">${learner.note}</span>`}</td><td>${learner.arrival}</td></tr>`;
    })
    .join("");
  rosterBody.querySelectorAll("[data-roll]").forEach((button) =>
    button.addEventListener("click", () => {
      const learner = learners.find(
        (item) => item.roll === button.dataset.roll,
      );
      learner.status = button.dataset.status;
      learner.arrival =
        learner.status === "P"
          ? "08:00"
          : learner.status === "A"
            ? "Not marked"
            : learner.status === "L"
              ? "Arrived 08:07"
              : "Excused";
      persistDraft();
      renderRoster();
    }),
  );
  const count = (status) =>
    learners.filter((learner) => learner.status === status).length;
  document.querySelector("#learners").textContent =
    `${learners.length} Learners`;
  document.querySelector("#present-count").textContent = count("P");
  document.querySelector("#absent-count").textContent = count("A");
  document.querySelector("#late-count").textContent = count("L");
}

function persistDraft() {
  try {
    localStorage.setItem(
      draftKey,
      JSON.stringify(
        Object.fromEntries(learners.map(({ roll, status }) => [roll, status])),
      ),
    );
    document.querySelector("#saved-status").textContent =
      "✓ Autosaved locally just now. Final register requires office submission.";
  } catch {
    document.querySelector("#saved-status").textContent =
      "Draft could not be saved in this browser.";
  }
}

renderRoster();
document.querySelector("#filter").addEventListener("input", renderRoster);
document.querySelector("#mark-all").addEventListener("click", () => {
  learners.forEach((learner) => {
    learner.status = "P";
    learner.arrival = "08:00";
  });
  persistDraft();
  renderRoster();
});
document.querySelector("#sort").addEventListener("click", () => {
  learners.reverse();
  renderRoster();
});
document.querySelector("#save-draft").addEventListener("click", () => {
  persistDraft();
  showToast("Attendance draft saved in this browser.");
});
document.querySelector("#submit-register").addEventListener("click", () => {
  persistDraft();
  showToast("Register saved. Submit it to the admin office for final review.");
});

let toastTimer;
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
document
  .querySelectorAll("[data-action]")
  .forEach((button) =>
    button.addEventListener("click", () => showToast(button.dataset.action)),
  );
document
  .querySelector("#menu")
  .addEventListener("click", () =>
    document.querySelector("#sidebar").classList.toggle("open"),
  );
document.querySelector("#send").addEventListener("click", () => {
  const reply = document.querySelector("#reply");
  if (!reply.value.trim()) return showToast("Type a reply before sending.");
  showToast("Reply saved to the parent communication draft.");
});
