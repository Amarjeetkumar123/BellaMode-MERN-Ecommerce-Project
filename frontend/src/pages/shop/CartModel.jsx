import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { removeFromCart, updateQuantity } from '../../redux/features/cart/cartSlice'
import { formatINR } from '../../utils/formatCurrency'
import Drawer from '../../components/Drawer'

export const FREE_DELIVERY = 999;

// Subtotal / tax / delivery / total, shared by the bag and checkout.
export const Totals = () => {
    const { tax, taxRate, totalPrice, grandTotal } = useSelector((s) => s.cart);
    const free = totalPrice >= FREE_DELIVERY;
    return (
        <dl className='wf-sum'>
            <dt>Subtotal</dt><dd>{formatINR(totalPrice)}</dd>
            <dt>Tax ({Math.round(taxRate * 100)}%)</dt><dd>{formatINR(tax)}</dd>
            <dt>Delivery</dt><dd className={free ? 'free' : ''}>{free ? 'Free' : 'Paid on delivery'}</dd>
            <dt className='total'>Total</dt><dd className='total'>{formatINR(grandTotal)}</dd>
        </dl>
    );
};

const CartModel = ({ products, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);
    const { totalPrice } = useSelector((s) => s.cart);
    const [leaving, setLeaving] = useState(null);
    const count = products.reduce((n, p) => n + p.quantity, 0);
    const keyOf = (item) => item.key || item._id;

    // the line slides out, then leaves the bag
    const remove = (item) => {
        setLeaving(keyOf(item));
        setTimeout(() => { dispatch(removeFromCart({ key: keyOf(item) })); setLeaving(null); }, 320);
    };
    const checkout = () => { onClose(); navigate(user ? '/checkout' : '/login'); };

    return (
        <Drawer isOpen={isOpen} onClose={onClose} label='Bag' title='Your bag' count={count}>
            {products.length === 0 ? (
                <div className='wf-drawer__empty'>
                    <i className='ri-shopping-bag-line'></i>
                    <b>Your bag is empty</b>
                    <p>Add something you love and it will show up here.</p>
                    <Link to='/' className='wf-btn' onClick={onClose}>Start shopping</Link>
                </div>
            ) : (
                <>
                    <div className='wf-ship'>
                        <p>{totalPrice >= FREE_DELIVERY
                            ? <>You have unlocked <b>free delivery</b></>
                            : <>Add <b>{formatINR(FREE_DELIVERY - totalPrice)}</b> more for free delivery</>}</p>
                        <div className='wf-meter'><i style={{ width: `${Math.min(100, (totalPrice / FREE_DELIVERY) * 100)}%` }}></i></div>
                    </div>
                    <ul className='wf-lines'>
                        {products.map((item, i) => {
                            const to = `/shop/${item.slug || item._id}`;
                            return (
                                <li key={keyOf(item)} className={`wf-line ${leaving === keyOf(item) ? 'out' : ''}`} style={{ '--i': i }}>
                                    <Link to={to} onClick={onClose}><img src={item.image} alt='' /></Link>
                                    <div>
                                        <div className='wf-line__top'>
                                            <div>
                                                {item.brand && <small>{item.brand}</small>}
                                                <h3><Link to={to} onClick={onClose}>{item.name}</Link></h3>
                                                {(item.color || item.size) && <div className='wf-line__opts'>{[item.color, item.size].filter(Boolean).join(' · ')}</div>}
                                            </div>
                                            <button type='button' className='wf-rm' onClick={() => remove(item)} aria-label={`Remove ${item.name}`}><i className='ri-delete-bin-6-line'></i></button>
                                        </div>
                                        <div className='wf-line__bottom'>
                                            <div className='wf-qty'>
                                                <button type='button' onClick={() => dispatch(updateQuantity({ type: 'decrement', key: keyOf(item) }))} aria-label={`One less ${item.name}`}>−</button>
                                                <output>{item.quantity}</output>
                                                <button type='button' onClick={() => dispatch(updateQuantity({ type: 'increment', key: keyOf(item) }))} aria-label={`One more ${item.name}`}>+</button>
                                            </div>
                                            <span className='wf-line__price'>{formatINR(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <div className='wf-drawer__foot'>
                        <Totals />
                        <button type='button' className='wf-btn wf-btn--block' onClick={checkout}>Checkout <i className='ri-arrow-right-line'></i></button>
                        <button type='button' className='wf-linkbtn wf-u' onClick={onClose}>Continue shopping</button>
                    </div>
                </>
            )}
        </Drawer>
    );
};

export default CartModel;
