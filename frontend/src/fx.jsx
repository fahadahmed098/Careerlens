import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

// Scroll par neeche se upar slide hota hua section/card
export function Reveal({ children, delay = 0, className = '' }) {
  const [ref, seen] = useInView();
  return <div ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` }}>{children}</div>;
}

// 0 se number tak ginti
export function CountUp({ to, suffix = '', duration = 1400 }) {
  const [ref, seen] = useInView(0.4);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf, start;
    const tick = (ts) => {
      if (start === undefined) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);
  return <span ref={ref}>{v}{suffix}</span>;
}
