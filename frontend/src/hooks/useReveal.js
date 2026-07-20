import { useEffect, useRef } from 'react';

// Lightweight scroll-reveal: adds `.in` to the ref element when it enters the
// viewport, then stops observing. Respects prefers-reduced-motion (reveals
// immediately, no animation). No animation library.
export const useReveal = ({ threshold = 0.15, once = true } = {}) => {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || typeof IntersectionObserver === 'undefined') {
            el.classList.add('in');
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        if (once) io.unobserve(entry.target);
                    } else if (!once) {
                        entry.target.classList.remove('in');
                    }
                });
            },
            { threshold }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold, once]);

    return ref;
};

export default useReveal;
