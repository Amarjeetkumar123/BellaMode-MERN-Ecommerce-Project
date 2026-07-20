import React from 'react'
import { Link } from 'react-router-dom'
import instaImg1 from "../assets/instagram-1.jpg"
import instaImg2 from "../assets/instagram-2.jpg"
import instaImg3 from "../assets/instagram-3.jpg"
import instaImg4 from "../assets/instagram-4.jpg"
import instaImg5 from "../assets/instagram-5.jpg"
import instaImg6 from "../assets/instagram-6.jpg"
import { AUDIENCES } from '../data/catalog'
import { useActiveAudiences } from '../hooks/useActiveAudiences'

const insta = [instaImg1, instaImg2, instaImg3, instaImg4, instaImg5, instaImg6];

const Footer = () => {
    const { isActive, settings, copy } = useActiveAudiences();
    const brandName = settings?.brandName || 'Wearly';
    const [brandFirst, ...brandRest] = brandName.split(' ');
    const shopLinks = AUDIENCES.filter((a) => isActive(a.key));

    return (
        <>
            {/* Newsletter band */}
            <section className='newsletter'>
                <div className='newsletter__inner'>
                    <div>
                        <h3>Join the Wearly list</h3>
                        <p>Get early access to new drops, exclusive offers & style tips — straight to your inbox.</p>
                    </div>
                    <form className='newsletter__form' onSubmit={(e) => e.preventDefault()}>
                        <input type='email' placeholder='Enter your email' aria-label='Email address' required />
                        <button type='submit' className='btn'>Subscribe</button>
                    </form>
                </div>
            </section>

            <footer className='section__container footer__container'>
                <div className='footer__col'>
                    <h4 className='footer__brand'>{brandFirst}{brandRest.length ? ` ${brandRest.join(' ')}` : ''}<span>.</span></h4>
                    <p className='footer__about'>Curated fashion for {copy} — clothing, footwear, watches, perfumes and accessories, all in one place.</p>
                    <div className='footer__social'>
                        <a href='https://instagram.com' aria-label='Instagram'><i className='ri-instagram-line'></i></a>
                        <a href='https://facebook.com' aria-label='Facebook'><i className='ri-facebook-circle-line'></i></a>
                        <a href='https://twitter.com' aria-label='Twitter'><i className='ri-twitter-x-line'></i></a>
                        <a href='https://youtube.com' aria-label='YouTube'><i className='ri-youtube-line'></i></a>
                    </div>
                </div>
                <div className='footer__col'>
                    <h4>SHOP</h4>
                    {shopLinks.map((a) => (
                        <Link key={a.key} to={a.to}>{a.label}</Link>
                    ))}
                    <Link to='/categories/footwear-unisex'>Footwear</Link>
                    <Link to='/categories/perfumes-unisex'>Perfumes</Link>
                </div>
                <div className='footer__col'>
                    <h4>HELP</h4>
                    <Link to='/shop'>Track your order</Link>
                    <Link to='/shop'>Shipping & Returns</Link>
                    <Link to='/shop'>Size Guide</Link>
                    <Link to='/shop'>FAQs</Link>
                    <a href='mailto:support@wearly.com'>Contact Us</a>
                </div>
                <div className='footer__col'>
                    <h4>FOLLOW US</h4>
                    <div className='instagram__grid'>
                        {insta.map((src, i) => (
                            <img key={i} src={src} alt='' loading='lazy' />
                        ))}
                    </div>
                </div>
            </footer>
            <div className='footer__bar'>
                <span>© 2025 {brandName}. All Rights Reserved.</span>
                <span className='footer__pay'><i className='ri-visa-line'></i><i className='ri-mastercard-line'></i><i className='ri-secure-payment-line'></i> Secure payments</span>
            </div>
        </>
    )
}

export default Footer
