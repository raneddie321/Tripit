// Squad Members UI (Multi-Trip)
export function mountFriends(root, store) {
  const grid = root.querySelector("[data-friends-grid]");
  const countBadge = document.querySelector("[data-badge-squad]");

  store.subscribe((state) => {
    const activeTrip = state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
    if (!activeTrip) return;

    if (countBadge) countBadge.textContent = activeTrip.friends.length;

    grid.innerHTML = activeTrip.friends.map((friend) => `
      <div class="friend-card" data-id="${friend.id}">
        <img src="${friend.avatar}" class="avatar" style="width: 44px; height: 44px;" alt="${friend.name}">
        <div class="friend-details">
          <div class="friend-name">
            ${escapeHtml(friend.name)}
            ${friend.role === "Organizer" ? '<span class="badge badge-purple" style="font-size: 0.65rem;">Host</span>' : ""}
          </div>
          <div class="friend-role">${escapeHtml(friend.role || "Member")}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">${escapeHtml(friend.email)}</div>
        </div>
        ${friend.role !== "Organizer" ? `
          <button type="button" class="btn btn-ghost btn-sm btn-icon" data-action="remove-friend" title="Remove">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ` : ""}
      </div>
    `).join("");
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='remove-friend']");
    if (!btn) return;
    const card = btn.closest("[data-id]");
    if (!card) return;
    const id = card.dataset.id;

    if (confirm("Remove this companion from the squad?")) {
      store.set((state) => ({
        trips: state.trips.map((t) => t.id === state.activeTripId ? {
          ...t,
          friends: t.friends.filter((f) => f.id !== id)
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