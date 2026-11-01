import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DELIVERY_FEE, FREE_DELIVERY } from '../../redux/features/cart/cartSlice'
import { formatINR } from '../../utils/formatCurrency'

const SECTIONS = [['delivery', 'Delivery'], ['returns', 'Returns'], ['refunds', 'Refunds'], ['questions', 'Questions']];
const FAQ = [
    ['Can I exchange for a different size?', 'Yes. Write to us from the order and we’ll send the new size as soon as the pickup is done, at no extra cost.'],
    ['Can I change my address after ordering?', 'Until the order ships, yes. Write to support@wearly.com with your order number.'],
    ['Do you deliver outside India?', 'Not yet. We only deliver to Indian PIN codes for now.'],
    ['My order is late. What now?', 'Check its status under Orders in your account. If it hasn’t moved in 48 hours, write to us and we’ll chase the courier.'],
];

// /help/shipping — the contents list follows the section you're reading.
const Shipping = () => {
    const { hash } = useLocation();
    const [on, setOn] = useState('delivery');

    useEffect(() => {
        const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setOn(e.target.id)), { rootMargin: '-40% 0px -55% 0px' });
        SECTIONS.forEach(([id]) => io.observe(document.getElementById(id)));
        return () => io.disconnect();
    }, []);
    useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView(); else window.scrollTo(0, 0); }, [hash]);

    const fee = `Free over ${formatINR(FREE_DELIVERY)}, else ${formatINR(DELIVERY_FEE)}`;
    return (
        <main className='wf-wrap wf-page wf-pagehead'>
            <p className='wf-kick'>Help</p>
            <h1>Shipping and returns</h1>
            <p className='wf-intro'>Free delivery over {formatINR(FREE_DELIVERY)}, and 30 days to change your mind.</p>
            <div className='wf-facts'>
                <div className='wf-fact'><i className='ri-truck-line'></i><b>Free over {formatINR(FREE_DELIVERY)}</b><span>{formatINR(DELIVERY_FEE)} delivery on smaller orders.</span></div>
                <div className='wf-fact'><i className='ri-time-line'></i><b>3–6 days</b><span>Metro cities usually sooner.</span></div>
                <div className='wf-fact'><i className='ri-loop-left-line'></i><b>30-day returns</b><span>Unworn, with the tags on.</span></div>
            </div>
            <div className='wf-help'>
                <ul className='wf-toc'>
                    {SECTIONS.map(([id, l]) => <li key={id}><a href={`#${id}`} className={on === id ? 'on' : ''} onClick={(e) => { e.preventDefault(); document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); }}>{l}</a></li>)}
                </ul>
                <div>
                    <section id='delivery'>
                        <h2>Delivery</h2>
                        <p>We pack most orders within a day. You can follow every order under <Link to='/dashboard/orders' className='wf-u'>Orders</Link> in your account.</p>
                        <div className='wf-tblwrap'><table className='wf-tbl'>
                            <thead><tr><th>Where</th><th>Usually arrives in</th><th>Cost</th></tr></thead>
                            <tbody>
                                <tr><td>Metro cities</td><td>2–4 days</td><td>{fee}</td></tr>
                                <tr><td>Rest of India</td><td>3–6 days</td><td>{fee}</td></tr>
                                <tr><td>North-east and islands</td><td>6–9 days</td><td>{fee}</td></tr>
                            </tbody>
                        </table></div>
                    </section>
                    <section id='returns'>
                        <h2>Returns</h2>
                        <p>Return anything unworn with its tags within 30 days of delivery. Innerwear, perfumes and earrings can’t be returned for hygiene reasons.</p>
                        <ol className='wf-rsteps'>
                            <li><b>Tell us</b>Write to support@wearly.com with your order number and the items.</li>
                            <li><b>Pack it up</b>Use any bag or box. Keep the tags on.</li>
                            <li><b>We pick it up</b>A courier collects it from your address.</li>
                        </ol>
                    </section>
                    <section id='refunds'>
                        <h2>Refunds</h2>
                        <p>Once the item reaches us and passes a quick check, we refund within 5–7 working days. Card and UPI payments go back to the same account. Cash on delivery orders are refunded to your bank account.</p>
                    </section>
                    <section id='questions' className='wf-faq'>
                        <h2>Questions</h2>
                        {FAQ.map(([qn, a]) => <details key={qn}><summary>{qn}<span className='wf-pm'></span></summary><p>{a}</p></details>)}
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Shipping;
