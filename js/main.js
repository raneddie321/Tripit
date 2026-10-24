// Main Entry Point & Multi-Trip App Wiring
import { createStore } from "./store.js";
import { loadAllTrips, saveAllTrips, loadActiveTripId, saveActiveTripId } from "./storage.js";
import { getCurrentUser, setCurrentUser, onAuthChange, initGoogleAuth, DEMO_USERS } from "./auth.js";
import { getOAuthConfig, saveOAuthConfig } from "./config.js";
import { mountTripHeader } from "./ui/header.js";
import { mountItinerary } from "./ui/itinerary.js";
import { mountExpenses } from "./ui/expenses.js";
import { mountPacking } from "./ui/packing.js";
import { mountFriends } from "./ui/friends.js";
import { mountTripSelector } from "./ui/trips.js";

function start() {
  const trips = loadAllTrips();
  const activeTripId = loadActiveTripId(trips);

  const store = createStore({
    trips,
    activeTripId
  });

  // Autosave trips on change
  store.subscribe((state) => {
    saveAllTrips(state.trips);
    saveActiveTripId(state.activeTripId);
  });

  // Mount Trip Selector Dropdown & Creator
  mountTripSelector(document.body, store);

  // Mount Active Trip Views
  mountTripHeader(document.querySelector("#trip-header-view"), store);
  mountItinerary(document.querySelector("#itinerary-view"), store);
  mountExpenses(document.querySelector("#expenses-view"), store);
  mountPacking(document.querySelector("#packing-view"), store);
  mountFriends(document.querySelector("#friends-view"), store);

  // Tab navigation setup
  setupTabs();

  // Authentication UI setup
  setupAuthUI(store);

  // Modals & Action Forms setup
  setupModals(store);

  // Invite link copy handler
  setupInviteCopy();
}

function setupTabs() {
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  const panels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tabTarget;
      tabButtons.forEach((b) => b.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));

      btn.classList.add("is-active");
      const activePanel = document.getElementById(target);
      if (activePanel) activePanel.classList.add("is-active");
    });
  });
}

function setupAuthUI(store) {
  const userButton = document.getElementById("auth-user-btn");
  const userAvatar = document.getElementById("auth-user-avatar");
  const userName = document.getElementById("auth-user-name");
  const authModal = document.getElementById("auth-modal");
  const googleBtnContainer = document.getElementById("google-signin-btn-container");
  const googleStatusNotice = document.getElementById("google-status-notice");

  const config = getOAuthConfig();
  const clientIdInput = document.getElementById("cfg-google-client-id");
  const secretIdInput = document.getElementById("cfg-google-secret-id");
  if (clientIdInput) clientIdInput.value = config.googleClientId;
  if (secretIdInput) secretIdInput.value = config.googleClientSecret;

  updateGoogleButtonState();

  function updateGoogleButtonState() {
    const curConfig = getOAuthConfig();
    if (curConfig.googleClientId && curConfig.googleClientId.trim()) {
      googleStatusNotice.innerHTML = `<span style="color: var(--secondary);">✓ Google Client ID configured!</span>`;
      initGoogleAuth({
        buttonContainerId: "google-signin-btn-container",
        onLoginSuccess: (user) => {
          showToast(`Signed in with Google as ${user.name}!`);
          closeModal(authModal);
        }
      });
    } else {
      googleStatusNotice.innerHTML = `<span>Google Client ID not yet entered. Test freely with demo profiles below or enter your Client ID in settings!</span>`;
      googleBtnContainer.innerHTML = `
        <button type="button" class="btn btn-secondary" style="width: 100%;" id="open-oauth-cfg-btn">
          ⚙️ Setup Google OAuth Client & Secret ID
        </button>
      `;
      const cfgBtn = document.getElementById("open-oauth-cfg-btn");
      if (cfgBtn) {
        cfgBtn.addEventListener("click", () => {
          document.getElementById("oauth-config-details").removeAttribute("hidden");
        });
      }
    }
  }

  const saveConfigForm = document.getElementById("oauth-config-form");
  if (saveConfigForm) {
    saveConfigForm.addEventListener("submit", (e) => {
      e.preventDefault();
      saveOAuthConfig({ googleClientId: clientIdInput.value.trim(), googleClientSecret: secretIdInput.value.trim() });
      showToast("Google Credentials saved!");
      updateGoogleButtonState();
    });
  }

  onAuthChange((user) => {
    if (user) {
      userAvatar.src = user.avatar;
      userAvatar.alt = user.name;
      userName.textContent = user.name.split(" ")[0];
    }
  });

  userButton.addEventListener("click", () => openModal(authModal));

  const demoPicker = document.getElementById("demo-user-picker");
  if (demoPicker) {
    demoPicker.innerHTML = DEMO_USERS.map((u) => `
      <button type="button" class="btn btn-secondary btn-sm" data-demo-id="${u.id}" style="display: flex; gap: 0.5rem; justify-content: flex-start; text-align: left;">
        <img src="${u.avatar}" class="avatar" style="width: 24px; height: 24px;" alt="${u.name}">
        <span>${u.name}</span>
      </button>
    `).join("");

    demoPicker.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-demo-id]");
      if (!btn) return;
      const chosen = DEMO_USERS.find((u) => u.id === btn.dataset.demoId);
      if (chosen) {
        setCurrentUser(chosen);
        showToast(`Switched user to ${chosen.name}`);
        closeModal(authModal);
      }
    });
  }
}

function setupModals(store) {
  // Activity Modal
  const activityModal = document.getElementById("activity-modal");
  const openActivityBtn = document.getElementById("open-add-activity");
  const activityForm = document.getElementById("activity-form");

  if (openActivityBtn) openActivityBtn.addEventListener("click", () => openModal(activityModal));
  if (activityForm) {
    activityForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(activityForm);
      const newAct = {
        id: "act_" + Date.now().toString(36),
        day: Number(data.get("day")) || 1,
        time: data.get("time") || "12:00",
        title: data.get("title") || "Untitled Activity",
        location: data.get("location") || "",
        category: data.get("category") || "General",
        notes: data.get("notes") || "",
        completed: false
      };

      store.set((state) => {
        const trips = state.trips.map((t) => {
          if (t.id === state.activeTripId) {
            return { ...t, itinerary: [...t.itinerary, newAct] };
          }
          return t;
        });
        return { trips };
      });

      activityForm.reset();
      closeModal(activityModal);
      showToast("New activity scheduled!");
    });
  }

  // Expense Modal
  const expenseModal = document.getElementById("expense-modal");
  const openExpenseBtn = document.getElementById("open-add-expense");
  const expenseForm = document.getElementById("expense-form");
  const payerSelect = document.getElementById("exp-payer");
  const splitCheckboxes = document.getElementById("exp-split-container");

  if (openExpenseBtn) {
    openExpenseBtn.addEventListener("click", () => {
      const state = store.get();
      const activeTrip = state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
      if (payerSelect) {
        payerSelect.innerHTML = activeTrip.friends.map((f) => `<option value="${f.id}">${f.name}</option>`).join("");
      }
      if (splitCheckboxes) {
        splitCheckboxes.innerHTML = activeTrip.friends.map((f) => `
          <label style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; margin-right: 0.75rem; margin-bottom: 0.4rem; cursor: pointer;">
            <input type="checkbox" name="splitAmong" value="${f.id}" checked>
            <span>${f.name.split(" ")[0]}</span>
          </label>
        `).join("");
      }
      openModal(expenseModal);
    });
  }

  if (expenseForm) {
    expenseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(expenseForm);
      const splitList = data.getAll("splitAmong");

      const state = store.get();
      const activeTrip = state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];

      const newExp = {
        id: "exp_" + Date.now().toString(36),
        title: data.get("title") || "General Bill",
        amount: parseFloat(data.get("amount")) || 0,
        paidById: data.get("paidById") || activeTrip.friends[0]?.id,
        splitAmong: splitList.length ? splitList : activeTrip.friends.map((f) => f.id),
        category: data.get("category") || "Food",
        date: new Date().toISOString().split("T")[0]
      };

      store.set((st) => ({
        trips: st.trips.map((t) => t.id === st.activeTripId ? { ...t, expenses: [...t.expenses, newExp] } : t)
      }));

      expenseForm.reset();
      closeModal(expenseModal);
      showToast("Expense recorded & balances updated!");
    });
  }

  // Packing Modal
  const packModal = document.getElementById("pack-modal");
  const openPackBtn = document.getElementById("open-add-pack");
  const packForm = document.getElementById("pack-form");
  const packAssigneeSelect = document.getElementById("pack-assignee");

  if (openPackBtn) {
    openPackBtn.addEventListener("click", () => {
      const state = store.get();
      const activeTrip = state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
      if (packAssigneeSelect) {
        packAssigneeSelect.innerHTML = `
          <option value="">Anyone / Shared</option>
          ${activeTrip.friends.map((f) => `<option value="${f.id}">${f.name}</option>`).join("")}
        `;
      }
      openModal(packModal);
    });
  }

  if (packForm) {
    packForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(packForm);
      const newPack = {
        id: "pk_" + Date.now().toString(36),
        item: data.get("item") || "Packing item",
        category: data.get("category") || "General",
        assignedTo: data.get("assignedTo") || "",
        done: false
      };

      store.set((st) => ({
        trips: st.trips.map((t) => t.id === st.activeTripId ? { ...t, packingList: [...t.packingList, newPack] } : t)
      }));

      packForm.reset();
      closeModal(packModal);
      showToast("Item added to checklist!");
    });
  }

  // Edit Trip Details Modal
  const editTripModal = document.getElementById("edit-trip-modal");
  const openEditTripBtn = document.getElementById("open-edit-trip");
  const editTripForm = document.getElementById("edit-trip-form");

  if (openEditTripBtn) {
    openEditTripBtn.addEventListener("click", () => {
      const state = store.get();
      const activeTrip = state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
      document.getElementById("trip-f-title").value = activeTrip.title;
      document.getElementById("trip-f-destination").value = activeTrip.destination;
      document.getElementById("trip-f-cover").value = activeTrip.coverImage;
      document.getElementById("trip-f-start").value = activeTrip.startDate;
      document.getElementById("trip-f-end").value = activeTrip.endDate;
      openModal(editTripModal);
    });
  }

  if (editTripForm) {
    editTripForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(editTripForm);
      store.set((st) => ({
        trips: st.trips.map((t) => t.id === st.activeTripId ? {
          ...t,
          title: data.get("title"),
          destination: data.get("destination"),
          coverImage: data.get("coverImage"),
          startDate: data.get("startDate"),
          endDate: data.get("endDate")
        } : t)
      }));
      closeModal(editTripModal);
      showToast("Trip details updated!");
    });
  }

  // Add Companion Modal
  const companionModal = document.getElementById("companion-modal");
  const openCompanionBtn = document.getElementById("open-add-companion");
  const companionForm = document.getElementById("companion-form");

  if (openCompanionBtn) openCompanionBtn.addEventListener("click", () => openModal(companionModal));
  if (companionForm) {
    companionForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(companionForm);
      const name = data.get("name") || "Friend";
      const newFriend = {
        id: "user_" + Date.now().toString(36),
        name: name,
        email: data.get("email") || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
        role: data.get("role") || "Traveler",
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces`,
        color: "#3b82f6"
      };

      store.set((st) => ({
        trips: st.trips.map((t) => t.id === st.activeTripId ? { ...t, friends: [...t.friends, newFriend] } : t)
      }));

      companionForm.reset();
      closeModal(companionModal);
      showToast(`${name} added to the squad!`);
    });
  }

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", (e) => closeModal(e.target.closest(".modal-backdrop")));
  });
  document.querySelectorAll(".modal-backdrop").forEach((modal) => {
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(modal); });
  });
}

function setupInviteCopy() {
  const inviteBtn = document.getElementById("copy-invite-link");
  if (inviteBtn) {
    inviteBtn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard) await navigator.clipboard.writeText(window.location.href);
        showToast("🔗 Squad invite link copied!");
      } catch {
        showToast("🔗 Link: " + window.location.href);
      }
    });
  }
}

function openModal(el) { if (el) el.classList.add("is-open"); }
function closeModal(el) { if (el) el.classList.remove("is-open"); }

export function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    toast.style.transition = "all 200ms ease";
    setTimeout(() => toast.remove(), 200);
  }, 3200);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}