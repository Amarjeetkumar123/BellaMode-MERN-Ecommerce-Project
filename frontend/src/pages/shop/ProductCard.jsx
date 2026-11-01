import { useState } from 'react'
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { formatINR } from '../../utils/formatCurrency';
import { useWishlist } from '../../hooks/useWishlist';

// Normalizes an API product into the shape the cart expects (single `image`).
export const toCartProduct = (product) => ({
    _id: product._id,
    slug: product.slug,
    brand: product.brand,
    name: product.name,
    price: product.price,
    image: (product.images && product.images[0]) || product.image,
});

const canTilt = typeof window !== 'undefined'
    && window.matchMedia('(hover: hover)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Photo tilts toward the pointer and a soft light follows it; both reset on leave.
const tilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.classList.add('tilting');
    el.style.setProperty('--ry', `${(px - .5) * 8}deg`);
    el.style.setProperty('--rx', `${(.5 - py) * 8}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
};
const untilt = (e) => {
    const el = e.currentTarget;
    el.classList.remove('tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
};

// A single product tile, used by every product grid so sale badges, pricing,
// quick-add and the wishlist heart are identical everywhere.
export const ProductCardItem = ({ product, index = 0 }) => {
    const dispatch = useDispatch();
    const { isWished, toggle } = useWishlist();
    const [added, setAdded] = useState('');

    const to = `/shop/${product.slug || product._id}`;
    const image = (product.images && product.images[0]) || product.image;
    const onSale = product.oldPrice && product.oldPrice > product.price;
    const discount = onSale ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    const wished = isWished(product._id);
    const sizes = product.sizes?.length ? product.sizes : null;
    const colours = product.colors?.length || 0;

    const add = (size) => {
        dispatch(addToCart({ ...toCartProduct(product), ...(size && { size }) }));
        setAdded(size ? `Added size ${size} to bag` : 'Added to bag');
    };

    return (
        <article className='wf-card' style={{ '--i': index }}>
            <div className='wf-card__media' {...(canTilt && { onPointerMove: tilt, onPointerLeave: untilt })}>
                <Link to={to} className='wf-card__ph' aria-label={product.name}>
                    <img src={image} alt='' loading='lazy' />
                    {onSale && <span className='wf-card__badge'>{discount}% off</span>}
                </Link>
                <button
                    type='button'
                    className='wf-card__wish'
                    onClick={() => toggle(product)}
                    aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                    aria-pressed={wished}
                >
                    <i className={wished ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                </button>
                <div className='wf-card__quick'>
                    <small><span>Quick add</span>{sizes && <Link to={to} className='wf-u'>Size guide</Link>}</small>
                    {added ? (
                        <span className='wf-card__done' role='status'>{added}</span>
                    ) : (
                        <div className='wf-card__sizes'>
                            {sizes
                                ? sizes.map((s) => (
                                    <button key={s} type='button' onClick={() => add(s)} aria-label={`Add ${product.name}, size ${s}, to bag`}>{s}</button>
                                ))
                                : <button type='button' onClick={() => add()}>Add to bag</button>}
                        </div>
                    )}
                </div>
            </div>
            <div className='wf-card__info'>
                <div>
                    {product.brand && <div className='wf-card__brand'>{product.brand}</div>}
                    <h3><Link to={to}>{product.name}</Link></h3>
                    {colours > 0 && <div className='wf-card__colours'>{colours} colour{colours > 1 ? 's' : ''}</div>}
                </div>
                <div className='wf-card__price'>
                    {formatINR(product.price)}
                    {onSale && <s aria-label={`was ${formatINR(product.oldPrice)}`}>{formatINR(product.oldPrice)}</s>}
                </div>
            </div>
        </article>
    );
};

const ProductCard = ({ products = [], className = '' }) => (
    <div className={`wf-grid ${className}`}>
        {products.map((product, i) => (
            <ProductCardItem key={product._id} product={product} index={i} />
        ))}
    </div>
);

export default ProductCard;
