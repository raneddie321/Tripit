// Multi-Trip Switcher & Creator Modal UI
import { showToast } from "../main.js";

export function mountTripSelector(root, store) {
  const tripDropdownBtn = document.getElementById("active-trip-dropdown-btn");
  const tripDropdownMenu = document.getElementById("active-trip-dropdown-menu");
  const tripModal = document.getElementById("new-trip-modal");
  const openNewTripBtn = document.getElementById("open-new-trip-modal");
  const newTripForm = document.getElementById("new-trip-form");

  // Render dropdown items & trip title in header
  store.subscribe((state) => {
    const activeTrip = state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
    if (!activeTrip) return;

    if (tripDropdownBtn) {
      tripDropdownBtn.innerHTML = `
        <span style="font-weight: 700; color: var(--text);">${escapeHtml(activeTrip.title)}</span>
        <span style="font-size: 0.75rem; color: var(--text-muted);">(${escapeHtml(activeTrip.destination)})</span>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      `;
    }

    if (tripDropdownMenu) {
      tripDropdownMenu.innerHTML = `
        <div style="padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-dim); border-bottom: 1px solid var(--border);">
          Your Trips (${state.trips.length})
        </div>
        ${state.trips.map((t) => `
          <button type="button" class="dropdown-item ${t.id === activeTrip.id ? "is-active" : ""}" data-switch-trip="${t.id}">
            <span style="font-weight: 600;">✈️ ${escapeHtml(t.title)}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(t.destination)}</span>
          </button>
        `).join("")}
        <div style="padding: 0.5rem; border-top: 1px solid var(--border);">
          <button type="button" class="btn btn-primary btn-sm" id="trigger-create-trip" style="width: 100%;">
            + Create New Trip
          </button>
        </div>
      `;
    }
  });

  // Toggle Dropdown menu
  if (tripDropdownBtn && tripDropdownMenu) {
    tripDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = tripDropdownMenu.style.display === "block";
      tripDropdownMenu.style.display = isOpen ? "none" : "block";
    });

    document.addEventListener("click", () => {
      tripDropdownMenu.style.display = "none";
    });

    tripDropdownMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      const switchBtn = e.target.closest("[data-switch-trip]");
      if (switchBtn) {
        const newId = switchBtn.dataset.switchTrip;
        store.set({ activeTripId: newId });
        tripDropdownMenu.style.display = "none";
        showToast("Switched trip successfully!");
      }

      if (e.target.closest("#trigger-create-trip")) {
        tripDropdownMenu.style.display = "none";
        openModal(tripModal);
      }
    });
  }

  if (openNewTripBtn) {
    openNewTripBtn.addEventListener("click", () => {
      openModal(tripModal);
    });
  }

  if (newTripForm) {
    newTripForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(newTripForm);
      const newTrip = {
        id: "trip_" + Date.now().toString(36),
        title: data.get("title") || "Epic Getaway",
        destination: data.get("destination") || "World",
        coverImage: data.get("coverImage") || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&auto=format&fit=crop&q=80",
        startDate: data.get("startDate") || new Date().toISOString().split("T")[0],
        endDate: data.get("endDate") || new Date().toISOString().split("T")[0],
        currency: "USD",
        currencySymbol: "$",
        friends: [
          { id: "user_alex", name: "Alex Rivera", email: "alex.travels@example.com", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", role: "Organizer", color: "#3b82f6" },
          { id: "user_sam", name: "Sam Chen", email: "sam.c@example.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces", role: "Companion", color: "#10b981" }
        ],
        itinerary: [
          { id: "it_new_1", day: 1, date: data.get("startDate"), time: "10:00", title: "Arrive & Check In", location: data.get("destination"), category: "Stay", notes: "Welcome day!", completed: false }
        ],
        expenses: [],
        packingList: [
          { id: "pk_new_1", item: "Passports & Tickets", category: "Documents", assignedTo: "user_alex", done: true }
        ]
      };

      store.set((state) => ({
        trips: [...state.trips, newTrip],
        activeTripId: newTrip.id
      }));

      newTripForm.reset();
      closeModal(tripModal);
      showToast(`Created new trip: ${newTrip.title}! ✈️`);
    });
  }
}

function openModal(el) {
  if (el) el.classList.add("is-open");
}

function closeModal(el) {
  if (el) el.classList.remove("is-open");
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}