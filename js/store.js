// Simple Observable Store
export function createStore(initial) {
  let state = initial;
  const subs = new Set();

  return {
    get: () => state,
    set(change) {
      const patch = typeof change === "function" ? change(state) : change;
      state = { ...state, ...patch };
      subs.forEach((fn) => fn(state));
    },
    subscribe(fn) {
      subs.add(fn);
      fn(state);
      return () => subs.delete(fn);
    }
  };
}