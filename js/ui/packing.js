// Packing Checklist UI (Multi-Trip)
export function mountPacking(root, store) {
  const container = root.querySelector("[data-packing-container]");
  const countBadge = document.querySelector("[data-badge-packing]");

  store.subscribe((state) => {
    const activeTrip = state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
    if (!activeTrip) return;

    const items = activeTrip.packingList;
    if (countBadge) {
      const doneCount = items.filter((i) => i.done).length;
      countBadge.textContent = `${doneCount}/${items.length}`;
    }

    const categories = ["Documents", "Health", "Gear", "Activities", "Clothing", "General"];
    const grouped = {};
    categories.forEach((cat) => (grouped[cat] = []));

    items.forEach((item) => {
      const cat = item.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    const activeCategories = Object.entries(grouped).filter(([_, list]) => list.length > 0);

    if (activeCategories.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted); background: var(--surface); border-radius: var(--radius);">
          Checklist is currently empty. Add your essential travel gear and shared items!
        </div>
      `;
      return;
    }

    container.innerHTML = activeCategories.map(([category, list]) => `
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">${category}</h4>
          <span class="badge badge-blue">${list.filter((x) => x.done).length}/${list.length}</span>
        </div>
        <div>
          ${list.map((item) => {
            const assignee = activeTrip.friends.find((f) => f.id === item.assignedTo);
            return `
              <div class="check-item ${item.done ? "is-done" : ""}" data-id="${item.id}">
                <input type="checkbox" ${item.done ? "checked" : ""} data-action="toggle-pack">
                <span class="check-title">${escapeHtml(item.item)}</span>
                ${assignee ? `<span class="check-assignee" title="Brought by ${escapeHtml(assignee.name)}">👤 ${escapeHtml(assignee.name.split(" ")[0])}</span>` : ""}
                <button type="button" class="btn btn-ghost btn-sm btn-icon" data-action="delete-pack" title="Delete">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `).join("");
  });

  container.addEventListener("click", (e) => {
    const itemEl = e.target.closest("[data-id]");
    if (!itemEl) return;
    const id = itemEl.dataset.id;

    if (e.target.matches("input[type='checkbox']")) {
      const checked = e.target.checked;
      store.set((state) => ({
        trips: state.trips.map((t) => t.id === state.activeTripId ? {
          ...t,
          packingList: t.packingList.map((item) => item.id === id ? { ...item, done: checked } : item)
        } : t)
      }));
    } else if (e.target.closest("[data-action='delete-pack']")) {
      store.set((state) => ({
        trips: state.trips.map((t) => t.id === state.activeTripId ? {
          ...t,
          packingList: t.packingList.filter((item) => item.id !== id)
        } : t)
      }));
    }
  });
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}