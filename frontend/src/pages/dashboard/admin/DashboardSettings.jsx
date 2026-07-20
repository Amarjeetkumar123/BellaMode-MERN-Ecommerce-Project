import React, { useEffect, useState } from 'react'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../../redux/features/settings/settingsApi'
import {
    useGetBannersQuery,
    useCreateBannerMutation,
    useDeleteBannerMutation,
} from '../../../redux/features/banners/bannersApi'
import ImageInput from '../../../components/ImageInput'
import { card, input, primaryBtn, titleFont } from './adminUI'

const bannerBlank = { title: '', subtitle: '', image: '', link: '/shop', ctaText: 'Shop Now', position: 'hero' };

const AUDIENCE_OPTS = ['women', 'men', 'kids', 'boys', 'girls'];
const PRESETS = [
    { label: 'All', keys: ['women', 'men', 'kids', 'boys', 'girls'] },
    { label: 'Men only', keys: ['men'] },
    { label: 'Women only', keys: ['women'] },
    { label: 'Men + Boys', keys: ['men', 'boys'] },
    { label: 'Women + Girls', keys: ['women', 'girls'] },
    { label: 'Kids only', keys: ['kids', 'boys', 'girls'] },
    { label: 'Women + Girls + Kids', keys: ['women', 'girls', 'kids'] },
    { label: 'Men + Boys + Kids', keys: ['men', 'boys', 'kids'] },
];

const DashboardSettings = () => {
    const { data: settingsData } = useGetSettingsQuery();
    const [updateSettings] = useUpdateSettingsMutation();
    const { data: bannerData } = useGetBannersQuery({ all: 'true' });
    const [createBanner] = useCreateBannerMutation();
    const [deleteBanner] = useDeleteBannerMutation();

    const [brand, setBrand] = useState({ brandName: '', heroTagline: '', logoUrl: '', contactEmail: '', contactPhone: '' });
    const [audienceImages, setAudienceImages] = useState({ women: '', men: '', girls: '', boys: '', kids: '', footwear: '' });
    const [audienceHeroImages, setAudienceHeroImages] = useState({ women: '', men: '', girls: '', boys: '', kids: '' });
    const [activeAudiences, setActiveAudiences] = useState([...AUDIENCE_OPTS]);
    const [banner, setBanner] = useState(bannerBlank);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const s = settingsData?.data?.settings;
        if (s) {
            setBrand({ brandName: s.brandName || '', heroTagline: s.heroTagline || '', logoUrl: s.logoUrl || '', contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '' });
            setAudienceImages({ women: '', men: '', girls: '', boys: '', kids: '', footwear: '', ...(s.audienceImages || {}) });
            setAudienceHeroImages({ women: '', men: '', girls: '', boys: '', kids: '', ...(s.audienceHeroImages || {}) });
            if (Array.isArray(s.activeAudiences) && s.activeAudiences.length) setActiveAudiences(s.activeAudiences);
        }
    }, [settingsData]);

    const banners = bannerData?.data?.banners || [];

    const toggleAudience = (key) => setActiveAudiences((cur) =>
        cur.includes(key) ? cur.filter((k) => k !== key) : AUDIENCE_OPTS.filter((k) => cur.includes(k) || k === key));

    const saveBrand = async (e) => {
        e.preventDefault();
        setMsg('');
        const active = activeAudiences.length ? activeAudiences : [...AUDIENCE_OPTS];
        try {
            await updateSettings({ ...brand, audienceImages, audienceHeroImages, activeAudiences: active }).unwrap();
            setMsg('Brand settings saved.');
        }
        catch (err) { setMsg(err?.data?.message || 'Failed.'); }
    };

    const addBanner = async (e) => {
        e.preventDefault();
        try { await createBanner(banner).unwrap(); setBanner(bannerBlank); }
        catch (err) { setMsg(err?.data?.message || 'Failed.'); }
    };

    return (
        <div className='space-y-8'>
            <div>
                <h2 className='text-2xl font-bold mb-4' style={titleFont}>Brand Settings</h2>
                <form onSubmit={saveBrand} className={`${card} max-w-2xl space-y-3`}>
                    <input placeholder='Brand name' value={brand.brandName} onChange={(e) => setBrand({ ...brand, brandName: e.target.value })} className={input} />
                    <input placeholder='Hero tagline' value={brand.heroTagline} onChange={(e) => setBrand({ ...brand, heroTagline: e.target.value })} className={input} />
                    <input placeholder='Contact email' value={brand.contactEmail} onChange={(e) => setBrand({ ...brand, contactEmail: e.target.value })} className={input} />
                    <input placeholder='Contact phone' value={brand.contactPhone} onChange={(e) => setBrand({ ...brand, contactPhone: e.target.value })} className={input} />
                    <ImageInput label='Logo' value={brand.logoUrl} onChange={(url) => setBrand({ ...brand, logoUrl: url })} />

                    {/* Store audiences */}
                    <h3 className='font-semibold pt-4' style={titleFont}>Store Audiences</h3>
                    <p className='text-sm text-text-light'>Choose which audiences your store serves. The storefront (nav, home, filters, footer &amp; hero) adapts automatically. Footwear, watches, perfumes &amp; accessories stay available for everyone.</p>
                    <div className='flex flex-wrap gap-2'>
                        {PRESETS.map((p) => {
                            const on = p.keys.length === activeAudiences.length && p.keys.every((k) => activeAudiences.includes(k));
                            return (
                                <button type='button' key={p.label} onClick={() => setActiveAudiences(p.keys)}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition ${on ? 'bg-text-dark text-white border-text-dark' : 'border-gray-200 hover:border-text-dark'}`}>
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className='flex flex-wrap gap-4 pt-1'>
                        {AUDIENCE_OPTS.map((aud) => (
                            <label key={aud} className='flex items-center gap-2 text-sm capitalize cursor-pointer'>
                                <input type='checkbox' className='accent-primary w-4 h-4'
                                    checked={activeAudiences.includes(aud)} onChange={() => toggleAudience(aud)} />
                                {aud}
                            </label>
                        ))}
                    </div>
                    {activeAudiences.length === 0 && <p className='text-primary text-xs'>Select at least one audience (empty = all audiences).</p>}

                    {/* Per-audience hero images */}
                    <h3 className='font-semibold pt-4' style={titleFont}>Audience Hero Images</h3>
                    <p className='text-sm text-text-light'>Wide banner image shown on the homepage hero when the store is set to that audience (uploads to Cloudinary). Falls back to the default hero if empty.</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {AUDIENCE_OPTS.filter((a) => activeAudiences.includes(a)).map((aud) => (
                            <ImageInput key={aud} label={`${aud.charAt(0).toUpperCase() + aud.slice(1)} hero`}
                                value={audienceHeroImages[aud]}
                                onChange={(url) => setAudienceHeroImages((a) => ({ ...a, [aud]: url }))} />
                        ))}
                    </div>

                    <h3 className='font-semibold pt-4' style={titleFont}>Homepage Category Tile Images</h3>
                    <p className='text-sm text-text-light'>Override the "Shop by Category" tile images (Women is the large featured tile).</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {['women', 'men', 'kids', 'girls', 'boys'].map((aud) => (
                            <ImageInput key={aud} label={aud.charAt(0).toUpperCase() + aud.slice(1)}
                                value={audienceImages[aud]}
                                onChange={(url) => setAudienceImages((a) => ({ ...a, [aud]: url }))} />
                        ))}
                    </div>

                    {msg && <p className='text-primary text-sm'>{msg}</p>}
                    <button className={primaryBtn}>Save Brand</button>
                </form>
            </div>

            <div>
                <h2 className='text-2xl font-bold mb-4' style={titleFont}>Homepage Banners</h2>
                <form onSubmit={addBanner} className={`${card} space-y-3 max-w-2xl mb-6`}>
                    <div className='grid grid-cols-2 gap-3'>
                        <input placeholder='Title' value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} className={input} />
                        <input placeholder='Subtitle' value={banner.subtitle} onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })} className={input} />
                        <input placeholder='Link' value={banner.link} onChange={(e) => setBanner({ ...banner, link: e.target.value })} className={input} />
                        <input placeholder='CTA text' value={banner.ctaText} onChange={(e) => setBanner({ ...banner, ctaText: e.target.value })} className={input} />
                        <select value={banner.position} onChange={(e) => setBanner({ ...banner, position: e.target.value })} className={`${input} col-span-2`}>
                            <option value='hero'>Hero</option><option value='promo'>Promo</option><option value='deal'>Deal</option>
                        </select>
                    </div>
                    <ImageInput value={banner.image} onChange={(url) => setBanner({ ...banner, image: url })} />
                    <button className={primaryBtn}>Add Banner</button>
                </form>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                    {banners.map((b) => (
                        <div key={b._id} className='bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm'>
                            {b.image && <img src={b.image} alt='' className='w-full h-24 object-cover' />}
                            <div className='p-3'>
                                <p className='text-sm font-medium'>{b.title}</p>
                                <p className='text-xs text-text-light capitalize'>{b.position}</p>
                                <button onClick={() => window.confirm('Delete banner?') && deleteBanner(b._id)} className='text-primary text-sm hover:underline mt-1'>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSettings;
