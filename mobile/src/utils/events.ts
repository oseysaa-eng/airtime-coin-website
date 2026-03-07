type Listener = () => void;

let listeners: Listener[] = [];

/**
 * Subscribe to dashboard updates
 */
export const subscribeDashboard = (cb: Listener) => {
  listeners.push(cb);

  return () => {
    listeners = listeners.filter(l => l !== cb);
  };
};

/**
 * Emit dashboard update event
 */
export const emitDashboardUpdate = () => {
  listeners.forEach(cb => cb());
};