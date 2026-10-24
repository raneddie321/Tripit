// Trip Banner, Summary Stats and Countdown UI (Multi-Trip reactive)
export function mountTripHeader(root, store) {
  const backdrop = root.querySelector("[data-hero-backdrop]");
  const title = root.querySelector("[data-trip-title]");
  const dates = root.querySelector("[data-trip-dates]");
  const location = root.querySelector("[data-trip-location]");
  const countdown = root.querySelector("[data-trip-countdown]");
  const squadAvatars = root.querySelector("[data-squad-avatars]");

  const statBudget = document.querySelector("[data-stat-total-spent]");
  const statActivities = document.querySelector("[data-stat-activities]");
  const statPacking = document.querySelector("[data-stat-packing]");
  const statSquad = document.querySelector("[data-stat-squad]");

  store.subscribe((state) => {
    const activeTrip = state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
    if (!activeTrip) return;

    backdrop.style.backgroundImage = `url('${activeTrip.coverImage}')`;
    title.textContent = activeTrip.title;
    location.textContent = activeTrip.destination;

    const start = new Date(activeTrip.startDate + "T00:00:00");
    const end = new Date(activeTrip.endDate + "T00:00:00");
    const options = { month: "short", day: "numeric", year: "numeric" };
    dates.textContent = `${start.toLocaleDateString("en-US", options)} – ${end.toLocaleDateString("en-US", options)}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      countdown.textContent = `🚀 In ${diffDays} day${diffDays === 1 ? "" : "s"}!`;
      countdown.className = "badge badge-blue";
    } else if (diffDays === 0) {
      countdown.textContent = `🎉 Trip is today!`;
      countdown.className = "badge badge-green";
    } else {
      countdown.textContent = `🏖️ Ongoing / Active`;
      countdown.className = "badge badge-purple";
    }

    squadAvatars.innerHTML = "";
    activeTrip.friends.slice(0, 5).forEach((f) => {
      const img = document.createElement("img");
      img.src = f.avatar;
      img.alt = f.name;
      img.title = `${f.name} (${f.role})`;
      img.className = "avatar";
      squadAvatars.appendChild(img);
    });
    if (activeTrip.friends.length > 5) {
      const extra = document.createElement("div");
      extra.className = "avatar";
      extra.style.background = "#2a364f";
      extra.textContent = `+${activeTrip.friends.length - 5}`;
      squadAvatars.appendChild(extra);
    }

    if (statBudget) {
      const totalExpense = activeTrip.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      statBudget.textContent = `${activeTrip.currencySymbol || "€"}${totalExpense.toLocaleString()}`;
    }
    if (statActivities) {
      const completed = activeTrip.itinerary.filter((i) => i.completed).length;
      statActivities.textContent = `${completed}/${activeTrip.itinerary.length}`;
    }
    if (statPacking) {
      const done = activeTrip.packingList.filter((p) => p.done).length;
      const pct = activeTrip.packingList.length ? Math.round((done / activeTrip.packingList.length) * 100) : 0;
      statPacking.textContent = `${pct}%`;
    }
    if (statSquad) {
      statSquad.textContent = `${activeTrip.friends.length} Travelers`;
    }
  });
}