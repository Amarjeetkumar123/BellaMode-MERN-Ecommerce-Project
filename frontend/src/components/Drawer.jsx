import { useDrawer } from '../hooks/useDrawer'

// Slide-in panel from the right (bag, wishlist). Stays mounted so it can slide both ways;
// while closed it is hidden from the keyboard and screen readers.
const Drawer = ({ isOpen, onClose, label, title, count = 0, children }) => {
    useDrawer(isOpen, onClose);
    return (
        <>
            <div className={`wf-scrim ${isOpen ? 'is-open' : ''}`} onClick={onClose} />
            <aside className={`wf-drawer ${isOpen ? 'is-open' : ''}`} role='dialog' aria-modal='true' aria-label={label} aria-hidden={!isOpen}>
                <div className='wf-drawer__head'>
                    <h2>{title} {count > 0 && <span>({count})</span>}</h2>
                    <button type='button' className='wf-x' onClick={onClose} aria-label={`Close ${label.toLowerCase()}`}><i className='ri-close-line'></i></button>
                </div>
                {children}
            </aside>
        </>
    );
};

export default Drawer;
