import { useEffect, useState } from 'react'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../../redux/features/settings/settingsApi'
import {
    useGetBannersQuery,
    useCreateBannerMutation,
    useDeleteBannerMutation,
} from '../../../redux/features/banners/bannersApi'
import ImageInput from '../../../components/ImageInput'
import { card, input, primaryBtn, ghostBtn, titleFont, linkBtn } from './adminUI'
import { AdminHead, L } from './AdminParts'
import HeroSlidesEditor from './HeroSlidesEditor'

const bannerBlank = { title: '', subtitle: '', image: '', link: '/shop', ctaText: 'Shop Now', position: 'hero' };

const AUDIENCE_OPTS = ['men', 'women', 'kids'];
const PRESETS = [
    { label: 'All', keys: ['men', 'women', 'kids'] },
    { label: 'Men only', keys: ['men'] },
    { label: 'Women only', keys: ['women'] },
    { label: 'Kids only', keys: ['kids'] },
    { label: 'Men + Women', keys: ['men', 'women'] },
    { label: 'Women + Kids', keys: ['women', 'kids'] },
    { label: 'Men + Kids', keys: ['men', 'kids'] },
];

const DashboardSettings = () => {
    const { data: settingsData } = useGetSettingsQuery();
    const [updateSettings] = useUpdateSettingsMutation();
    const { data: bannerData } = useGetBannersQuery({ all: 'true' });
    const [createBanner] = useCreateBannerMutation();
    const [deleteBanner] = useDeleteBannerMutation();

    const [brand, setBrand] = useState({ brandName: '', heroTagline: '', logoUrl: '', contactEmail: '', contactPhone: '' });
    const [audienceImages, setAudienceImages] = useState({ men: '', women: '', kids: '', footwear: '' });
    const [activeAudiences, setActiveAudiences] = useState([...AUDIENCE_OPTS]);
    const [announcement, setAnnouncement] = useState({ enabled: false, messages: [''], link: '', bgColor: '#0f172a', textColor: '#ffffff' });
    const [banner, setBanner] = useState(bannerBlank);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const s = settingsData?.data?.settings;
        if (s) {
            setBrand({ brandName: s.brandName || '', heroTagline: s.heroTagline || '', logoUrl: s.logoUrl || '', contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '' });
            setAudienceImages({ men: '', women: '', kids: '', footwear: '', ...(s.audienceImages || {}) });
            if (Array.isArray(s.activeAudiences) && s.activeAudiences.length) setActiveAudiences(s.activeAudiences);
            const a = s.announcement || {};
            setAnnouncement({
                enabled: !!a.enabled,
                // keep one empty row so there's always something to type into
                messages: a.messages && a.messages.length ? a.messages : [''],
                link: a.link || '',
                bgColor: a.bgColor || '#0f172a',
                textColor: a.textColor || '#ffffff',
            });
        }
    }, [settingsData]);

    const banners = bannerData?.data?.banners || [];

    const toggleAudience = (key) => setActiveAudiences((cur) =>
        cur.includes(key) ? cur.filter((k) => k !== key) : AUDIENCE_OPTS.filter((k) => cur.includes(k) || k === key));

    const saveBrand = async (e) => {
        e.preventDefault();
        setMsg('');
        const active = activeAudiences.length ? activeAudiences : [...AUDIENCE_OPTS];
        // Drop blank message rows so the storefront never renders an empty strip.
        const cleanAnnouncement = {
            ...announcement,
            messages: announcement.messages.map((m) => m.trim()).filter(Boolean),
        };
        try {
            await updateSettings({ ...brand, audienceImages, activeAudiences: active, announcement: cleanAnnouncement }).unwrap();
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
        <div className='space-y-6'>
            <div>
                <AdminHead title='Settings' sub='Brand, stores, the store hero slides, home page images, the announcement bar and banners.' />
                <form onSubmit={saveBrand} className={`${card} max-w-3xl space-y-4`}>
                    <h3 style={titleFont}>Brand</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <L t='Brand name (two words show in two colours)'><input placeholder='e.g. Wearly Fashion' value={brand.brandName} onChange={(e) => setBrand({ ...brand, brandName: e.target.value })} className={input} /></L>
                        <L t='Hero tagline'><input placeholder='e.g. Everyday clothes, made to last' value={brand.heroTagline} onChange={(e) => setBrand({ ...brand, heroTagline: e.target.value })} className={input} /></L>
                        <L t='Contact email'><input placeholder='e.g. hello@yourstore.com' type='email' value={brand.contactEmail} onChange={(e) => setBrand({ ...brand, contactEmail: e.target.value })} className={input} /></L>
                        <L t='Contact phone'><input placeholder='e.g. +91 98765 43210' value={brand.contactPhone} onChange={(e) => setBrand({ ...brand, contactPhone: e.target.value })} className={input} /></L>
                    </div>
                    <ImageInput label='Logo (optional; replaces the wordmark)' value={brand.logoUrl} onChange={(url) => setBrand({ ...brand, logoUrl: url })} />

                    {/* Store audiences */}
                    <h3 className='pt-6 mt-2 border-t border-gray-200' style={titleFont}>Stores</h3>
                    <p className='text-sm wf-muted'>Choose which audiences your store serves. The storefront (nav, home, filters, footer &amp; hero) adapts automatically. Footwear, watches, perfumes &amp; accessories stay available for everyone.</p>
                    <div className='flex flex-wrap gap-2'>
                        {PRESETS.map((p) => {
                            const on = p.keys.length === activeAudiences.length && p.keys.every((k) => activeAudiences.includes(k));
                            return (
                                <button type='button' key={p.label} onClick={() => setActiveAudiences(p.keys)}
                                    aria-pressed={on}
                                    className={`px-3.5 py-2 text-sm font-semibold border-[1.5px] transition ${on ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}>
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className='flex flex-wrap gap-4 pt-1'>
                        {AUDIENCE_OPTS.map((aud) => (
                            <label key={aud} className='flex items-center gap-2 text-sm capitalize cursor-pointer'>
                                <input type='checkbox' className='w-4 h-4'
                                    checked={activeAudiences.includes(aud)} onChange={() => toggleAudience(aud)} />
                                {aud}
                            </label>
                        ))}
                    </div>
                    {activeAudiences.length === 0 && <p className='wf-danger text-xs font-bold'>Select at least one audience (empty = all audiences).</p>}

                    <h3 className='pt-6 mt-2 border-t border-gray-200' style={titleFont}>Home page store tiles</h3>
                    <p className='text-sm wf-muted'>Override the &ldquo;Shop by Category&rdquo; tile images (Women is the large featured tile).</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {AUDIENCE_OPTS.map((aud) => (
                            <ImageInput key={aud} aspect={[4, 5]} note='It will fill the store tile exactly.' label={aud.charAt(0).toUpperCase() + aud.slice(1)}
                                value={audienceImages[aud]}
                                onChange={(url) => setAudienceImages((a) => ({ ...a, [aud]: url }))} />
                        ))}
                    </div>

                    {/* Announcement bar */}
                    <h3 className='pt-6 mt-2 border-t border-gray-200' style={titleFont}>Announcement bar</h3>
                    <p className='text-sm wf-muted'>A slim strip above the navigation. Add more than one message and they cross-fade. Shoppers can dismiss it for their session.</p>
                    <label className='flex items-center gap-2 text-sm cursor-pointer'>
                        <input type='checkbox' className='w-4 h-4'
                            checked={announcement.enabled}
                            onChange={(e) => setAnnouncement((a) => ({ ...a, enabled: e.target.checked }))} />
                        Show the announcement bar
                    </label>

                    <div className='space-y-2'>
                        {announcement.messages.map((m, i) => (
                            <div key={i} className='flex gap-2'>
                                <input
                                    aria-label={`Announcement message ${i + 1}`}
                                    placeholder={`Message ${i + 1}, e.g. Free delivery over ₹999`}
                                    value={m}
                                    onChange={(e) => setAnnouncement((a) => ({
                                        ...a,
                                        messages: a.messages.map((x, xi) => (xi === i ? e.target.value : x)),
                                    }))}
                                    className={`${input} flex-1`}
                                />
                                {announcement.messages.length > 1 && (
                                    <button type='button' aria-label='Remove message'
                                        onClick={() => setAnnouncement((a) => ({ ...a, messages: a.messages.filter((_, xi) => xi !== i) }))}
                                        className='px-3 border border-gray-300 hover:border-black hover:text-primary'>
                                        <i className='ri-delete-bin-6-line'></i>
                                    </button>
                                )}
                            </div>
                        ))}
                        {announcement.messages.length < 6 && (
                            <button type='button' className={ghostBtn}
                                onClick={() => setAnnouncement((a) => ({ ...a, messages: [...a.messages, ''] }))}>
                                <i className='ri-add-line'></i>Add message
                            </button>
                        )}
                    </div>

                    <L t='Link (optional), e.g. /sale'><input placeholder='e.g. /sale' value={announcement.link}
                        onChange={(e) => setAnnouncement((a) => ({ ...a, link: e.target.value }))} className={input} /></L>

                    <div className='flex flex-wrap gap-6'>
                        <label className='flex items-center gap-2 text-sm'>
                            Background
                            <input type='color' value={announcement.bgColor}
                                onChange={(e) => setAnnouncement((a) => ({ ...a, bgColor: e.target.value }))}
                                className='w-10 h-8 border border-gray-300 bg-white cursor-pointer' />
                        </label>
                        <label className='flex items-center gap-2 text-sm'>
                            Text
                            <input type='color' value={announcement.textColor}
                                onChange={(e) => setAnnouncement((a) => ({ ...a, textColor: e.target.value }))}
                                className='w-10 h-8 border border-gray-300 bg-white cursor-pointer' />
                        </label>
                    </div>

                    {/* Live preview so colours can be judged before saving */}
                    {announcement.enabled && announcement.messages.some((m) => m.trim()) && (
                        <div className='overflow-hidden border border-gray-200'>
                            <div className='text-center py-2 text-[0.72rem] uppercase tracking-[0.09em] font-medium'
                                style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}>
                                {announcement.messages.find((m) => m.trim())}
                            </div>
                        </div>
                    )}

                    {msg && <p className='wf-alert' role='status'>{msg}</p>}
                    <button className={primaryBtn}>Save settings</button>
                </form>
            </div>

            <HeroSlidesEditor />

            <div>
                <form onSubmit={addBanner} className={`${card} space-y-4 max-w-3xl mb-6`}>
                    <h3 style={titleFont}>Banners</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <L t='Title'><input placeholder='e.g. The summer edit' value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} className={input} /></L>
                        <L t='Subtitle'><input placeholder='e.g. Up to 40% off linen' value={banner.subtitle} onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })} className={input} /></L>
                        <L t='Link'><input placeholder='e.g. /categories/shirts' value={banner.link} onChange={(e) => setBanner({ ...banner, link: e.target.value })} className={input} /></L>
                        <L t='Button text'><input placeholder='e.g. Shop now' value={banner.ctaText} onChange={(e) => setBanner({ ...banner, ctaText: e.target.value })} className={input} /></L>
                        <L t='Where it shows' className='sm:col-span-2'><select value={banner.position} onChange={(e) => setBanner({ ...banner, position: e.target.value })} className={input}>
                            <option value='hero'>Hero</option><option value='promo'>Promo</option><option value='deal'>Deal</option>
                        </select></L>
                    </div>
                    <ImageInput label='Image' aspect={[16, 9]} note='It will fill the banner exactly.' value={banner.image} onChange={(url) => setBanner({ ...banner, image: url })} />
                    <button className={primaryBtn}>Add banner</button>
                </form>
                <div className='wf-atiles max-w-3xl'>
                    {banners.map((b) => (
                        <div key={b._id} className='wf-atile'>
                            {b.image ? <img src={b.image} alt='' loading='lazy' /> : <div className='aspect-[4/3] bg-gray-100' />}
                            <div>
                                <b>{b.title || 'Untitled banner'}</b>
                                <small>{b.position}</small>
                                <div className='wf-acts'>
                                    <button type='button' onClick={() => window.confirm('Delete this banner?') && deleteBanner(b._id)} className={`${linkBtn} wf-danger`}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSettings;
