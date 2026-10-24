// Itinerary UI (Multi-Trip)
export function mountItinerary(root, store) {
  const dayFilters = root.querySelector("[data-day-filters]");
  const timeline = root.querySelector("[data-timeline]");
  const countBadge = document.querySelector("[data-badge-itinerary]");

  let activeDay = "all";

  function getActiveTrip(state) {
    return state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
  }

  function renderDays(activeTrip) {
    const days = [...new Set(activeTrip.itinerary.map((i) => i.day))].sort((a, b) => a - b);
    dayFilters.innerHTML = `
      <button type="button" class="day-pill ${activeDay === "all" ? "is-active" : ""}" data-day="all">All Days</button>
    `;
    days.forEach((d) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `day-pill ${activeDay === String(d) ? "is-active" : ""}`;
      btn.dataset.day = String(d);
      btn.textContent = `Day ${d}`;
      dayFilters.appendChild(btn);
    });
  }

  function renderTimeline(activeTrip) {
    const filtered = activeTrip.itinerary.filter((item) => {
      if (activeDay === "all") return true;
      return String(item.day) === String(activeDay);
    }).sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return (a.time || "").localeCompare(b.time || "");
    });

    if (countBadge) countBadge.textContent = activeTrip.itinerary.length;

    if (filtered.length === 0) {
      timeline.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius); color: var(--text-muted);">
          <p style="margin: 0 0 0.5rem; font-weight: 600;">No activities for this selection yet</p>
          <span style="font-size: 0.85rem;">Click "+ Add Activity" to plan your adventures!</span>
        </div>
      `;
      return;
    }

    timeline.innerHTML = filtered.map((item) => `
      <div class="timeline-item" data-id="${item.id}">
        <div class="timeline-time">
          <span>${item.time || "Flexible"}</span>
          <span class="timeline-day-tag">Day ${item.day}</span>
        </div>
        <div class="timeline-content">
          <h4>${escapeHtml(item.title)}</h4>
          ${item.location ? `
            <div class="timeline-location">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>${escapeHtml(item.location)}</span>
            </div>
          ` : ""}
          ${item.notes ? `<p class="timeline-notes">${escapeHtml(item.notes)}</p>` : ""}
          <div style="margin-top: 0.5rem;">
            <span class="badge ${getCategoryBadgeClass(item.category)}">${item.category || "General"}</span>
          </div>
        </div>
        <div class="timeline-actions">
          <button type="button" class="btn btn-ghost btn-sm btn-icon" data-action="toggle-complete" title="Mark done">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="${item.completed ? '#10b981' : 'currentColor'}">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.completed ? 'M5 13l4 4L19 7' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}" />
            </svg>
          </button>
          <button type="button" class="btn btn-ghost btn-sm btn-icon" data-action="delete" title="Delete">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    `).join("");
  }

  function getCategoryBadgeClass(cat) {
    switch (cat) {
      case "Food": return "badge-amber";
      case "Stay": return "badge-purple";
      case "Tour": case "Activity": return "badge-blue";
      case "Transport": return "badge-green";
      default: return "badge-blue";
    }
  }

  dayFilters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day]");
    if (!btn) return;
    activeDay = btn.dataset.day;
    const activeTrip = getActiveTrip(store.get());
    renderDays(activeTrip);
    renderTimeline(activeTrip);
  });

  timeline.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const itemEl = btn.closest("[data-id]");
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    const action = btn.dataset.action;

    store.set((state) => {
      const trips = state.trips.map((t) => {
        if (t.id === state.activeTripId) {
          let itinerary = t.itinerary;
          if (action === "toggle-complete") {
            itinerary = itinerary.map((item) => item.id === id ? { ...item, completed: !item.completed } : item);
          } else if (action === "delete") {
            if (confirm("Delete this activity?")) itinerary = itinerary.filter((item) => item.id !== id);
          }
          return { ...t, itinerary };
        }
        return t;
      });
      return { trips };
    });
  });

  store.subscribe((state) => {
    const activeTrip = getActiveTrip(state);
    renderDays(activeTrip);
    renderTimeline(activeTrip);
  });
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}