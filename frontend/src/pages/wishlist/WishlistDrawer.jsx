import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { toCartProduct } from '../shop/ProductCard'
import { formatINR } from '../../utils/formatCurrency'
import { useWishlist } from '../../hooks/useWishlist'
import Drawer from '../../components/Drawer'

// One saved item: pick a size right on the card, then it moves to the bag.
const SavedItem = ({ item, index, leaving, onClose, onGone }) => {
    const dispatch = useDispatch();
    const [picking, setPicking] = useState(false);
    const [moved, setMoved] = useState(false);
    const to = `/shop/${item.slug || item._id}`;
    const image = (item.images && item.images[0]) || item.image;
    const off = item.oldPrice > item.price ? Math.round((1 - item.price / item.oldPrice) * 100) : 0;
    const sizes = item.sizes?.length > 1 ? item.sizes : null;
    const soldOut = item.stock != null && item.stock < 1;

    const move = (size) => {
        dispatch(addToCart({ ...toCartProduct(item), ...(size && { size }), ...(item.colors?.[0] && { color: item.colors[0] }) }));
        setMoved(true);
        setTimeout(() => onGone(item), 500); // show "Moved", then the card slides away
    };

    return (
        <article className={`wf-wl ${leaving ? 'out' : ''}`} style={{ '--i': index }}>
            <Link to={to} onClick={onClose} className='wf-wl__ph'>
                <img src={image} alt='' loading='lazy' />
                {off > 0 && <span className='wf-wl__off'>{off}% off</span>}
            </Link>
            <button type='button' className='wf-wl__x' onClick={() => onGone(item)} aria-label={`Remove ${item.name} from wishlist`}><i className='ri-close-line'></i></button>
            {item.brand && <small>{item.brand}</small>}
            <h3><Link to={to} onClick={onClose}>{item.name}</Link></h3>
            <div className='wf-wl__price'>{formatINR(item.price)}{off > 0 && <s>{formatINR(item.oldPrice)}</s>}</div>
            {picking && sizes && !moved && (
                <div className='wf-wl__sizes' role='group' aria-label={`Choose a size for ${item.name}`}>
                    {sizes.map((s) => <button key={s} type='button' onClick={() => move(s)}>{s}</button>)}
                </div>
            )}
            <button
                type='button'
                className={`wf-wl__move ${moved ? 'is-ok' : ''}`}
                onClick={() => (sizes ? setPicking((v) => !v) : move(item.sizes?.[0]))}
                aria-expanded={sizes ? picking : undefined}
                disabled={moved || soldOut}
            >
                {soldOut ? 'Out of stock' : moved ? 'Moved to bag ✓' : picking ? 'Choose a size' : 'Move to bag'}
            </button>
        </article>
    );
};

const WishlistDrawer = ({ isOpen, onClose }) => {
    const { items, toggle, isLoggedIn } = useWishlist();
    const [leaving, setLeaving] = useState([]);
    const gone = (item) => {
        setLeaving((l) => [...l, item._id]);
        setTimeout(() => { toggle(item); setLeaving((l) => l.filter((x) => x !== item._id)); }, 320);
    };

    return (
        <Drawer isOpen={isOpen} onClose={onClose} label='Wishlist' title='Wishlist' count={items.length}>
            {items.length === 0 ? (
                <div className='wf-drawer__empty'>
                    <i className='ri-heart-line'></i>
                    <b>Nothing saved yet</b>
                    <p>Tap the heart on any product to keep it here for later.</p>
                    <Link to='/' onClick={onClose} className='wf-btn'>Start shopping</Link>
                </div>
            ) : (
                <>
                    <div className='wf-wl-grid'>
                        {items.map((item, i) => (
                            <SavedItem key={item._id} item={item} index={i} leaving={leaving.includes(item._id)} onClose={onClose} onGone={gone} />
                        ))}
                    </div>
                    <div className='wf-drawer__foot'>
                        {isLoggedIn ? (
                            <p className='wf-muted' style={{ fontSize: 13, textAlign: 'center' }}>Saved to your account. Prices update automatically.</p>
                        ) : (
                            <p className='wf-muted' style={{ fontSize: 13, textAlign: 'center' }}>Saved on this device. <Link to='/login' onClick={onClose} className='wf-u' style={{ color: 'var(--wf-ink)', fontWeight: 700 }}>Sign in</Link> to keep them on every device.</p>
                        )}
                        <button type='button' className='wf-linkbtn wf-u' onClick={onClose}>Continue shopping</button>
                    </div>
                </>
            )}
        </Drawer>
    );
};

export default WishlistDrawer;
