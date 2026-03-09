import { useEffect, useRef, useState } from "react";

export function useAnimatedNumber(target:number){

  const [value,setValue] = useState(target);

  const raf = useRef<number | null>(null);

  useEffect(()=>{

    const start = value;
    const diff = target - start;

    if(diff === 0) return;

    const duration = 600; // animation time ms
    const startTime = Date.now();

    const animate = () => {

      const now = Date.now();
      const progress = Math.min((now - startTime)/duration,1);

      const next = start + diff * progress;

      setValue(next);

      if(progress < 1){
        raf.current = requestAnimationFrame(animate);
      }

    };

    raf.current = requestAnimationFrame(animate);

    return ()=>{
      if(raf.current) cancelAnimationFrame(raf.current);
    };

  },[target]);

  return value;
}