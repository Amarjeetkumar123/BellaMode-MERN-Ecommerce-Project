import { Link, useLocation } from 'react-router-dom'
import { AUDIENCES } from '../data/catalog'
import { useActiveAudiences } from '../hooks/useActiveAudiences'

const Footer = () => {
    const { isActive, settings, copy } = useActiveAudiences();
    const { pathname } = useLocation();
    const brandName = settings?.brandName || 'Wearly Fashion';
    const [brandFirst, ...brandRest] = brandName.split(' ');
    const shopLinks = AUDIENCES.filter((a) => isActive(a.key));
    // The newsletter is storefront marketing — it has no place in the dashboard.
    const isDashboard = pathname.startsWith('/dashboard');

    return (
        <footer className='wf-footer'>
            <div className='wf-wrap'>
                <div className='wf-foot'>
                    <div>
                        <Link to='/' className='wf-logo' aria-label={`${brandName} home`}>
                            <span>{brandFirst}</span>{brandRest.length ? ` ${brandRest.join(' ')}` : ''}
                        </Link>
                        <p>Curated fashion for {copy}: clothing, footwear, watches, perfumes and accessories, all in one place.</p>
                        {!isDashboard && (
                            <form className='wf-news' onSubmit={(e) => e.preventDefault()}>
                                <label className='wf-sr' htmlFor='wf-em'>Email address</label>
                                <input id='wf-em' type='email' placeholder='Email for new arrivals and offers' required autoComplete='email' />
                                <button type='submit'>Subscribe</button>
                            </form>
                        )}
                    </div>
                    <div>
                        <h4>Shop</h4>
                        <ul>
                            {shopLinks.map((a) => <li key={a.key}><Link to={a.to}>{a.label}</Link></li>)}
                            <li><Link to='/sale'>Sale</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Help</h4>
                        <ul>
                            <li><Link to='/dashboard/orders'>Track your order</Link></li>
                            <li><Link to='/shop'>Shipping and returns</Link></li>
                            <li><Link to='/shop'>Size guide</Link></li>
                            <li><a href='mailto:support@wearly.com'>Contact us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Follow us</h4>
                        <ul>
                            <li><a href='https://instagram.com' target='_blank' rel='noreferrer'>Instagram</a></li>
                            <li><a href='https://facebook.com' target='_blank' rel='noreferrer'>Facebook</a></li>
                            <li><a href='https://twitter.com' target='_blank' rel='noreferrer'>X (Twitter)</a></li>
                            <li><a href='https://youtube.com' target='_blank' rel='noreferrer'>YouTube</a></li>
                        </ul>
                    </div>
                </div>
                <div className='wf-legal'>
                    <span>© {new Date().getFullYear()} {brandName}. All prices in INR, inclusive of GST.</span>
                    <span>UPI, cards, net banking and cash on delivery</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer
