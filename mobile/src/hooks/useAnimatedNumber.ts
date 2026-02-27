import { useEffect, useRef, useState } from "react";

/**
 * Smooth number animation hook
 * Used for balances, minutes, prices
 */
export function useAnimatedNumber(target: number, duration = 500) {
  const [value, setValue] = useState(target);
  const startValue = useRef(target);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startValue.current = value;
    startTime.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - (startTime.current || 0);
      const progress = Math.min(elapsed / duration, 1);

      const next =
        startValue.current +
        (target - startValue.current) * progress;

      setValue(next);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [target]);

  return value;
}