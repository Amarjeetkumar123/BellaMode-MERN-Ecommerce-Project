// Moves a sliding underline (`ind`) under `el`; both must share an offsetParent.
export const slideTo = (ind, el) => {
    if (!ind || !el) return;
    ind.style.width = `${el.offsetWidth}px`;
    ind.style.transform = `translateX(${el.offsetLeft}px)`;
};
