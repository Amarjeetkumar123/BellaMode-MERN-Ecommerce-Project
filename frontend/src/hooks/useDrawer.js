import { useEffect } from 'react';

// Shared behaviour for every slide-in panel (cart, wishlist, mobile menu):
//  - Escape closes it
//  - the page behind it stops scrolling while it's open
// Kept in one place so the panels can't drift apart.
export const useDrawer = (isOpen, onClose) => {
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        // Compensate for the vanishing scrollbar so the layout doesn't jump.
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        const prevOverflow = document.body.style.overflow;
        const prevPadding = document.body.style.paddingRight;
        document.body.style.overflow = 'hidden';
        if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = prevOverflow;
            document.body.style.paddingRight = prevPadding;
        };
    }, [isOpen, onClose]);
};

export default useDrawer;
