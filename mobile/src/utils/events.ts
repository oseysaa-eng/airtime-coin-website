type Listener = () => void;

const listeners = new Set<Listener>();

export const subscribeDashboard = (cb: Listener) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const emitDashboardUpdate = () => {
  listeners.forEach(cb => cb());
};
