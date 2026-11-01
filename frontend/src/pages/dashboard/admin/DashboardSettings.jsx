import { useEffect, useState } from 'react'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../../redux/features/settings/settingsApi'
import {
    useGetBannersQuery,
    useCreateBannerMutation,
    useDeleteBannerMutation,
} from '../../../redux/features/banners/bannersApi'
import ImageInput from '../../../components/ImageInput'
import { card, input, primaryBtn, ghostBtn, titleFont } from './adminUI'

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
    const [audienceHeroImages, setAudienceHeroImages] = useState({ men: '', women: '', kids: '' });
    const [activeAudiences, setActiveAudiences] = useState([...AUDIENCE_OPTS]);
    const [announcement, setAnnouncement] = useState({ enabled: false, messages: [''], link: '', bgColor: '#0f172a', textColor: '#ffffff' });
    const [banner, setBanner] = useState(bannerBlank);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const s = settingsData?.data?.settings;
        if (s) {
            setBrand({ brandName: s.brandName || '', heroTagline: s.heroTagline || '', logoUrl: s.logoUrl || '', contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '' });
            setAudienceImages({ men: '', women: '', kids: '', footwear: '', ...(s.audienceImages || {}) });
            setAudienceHeroImages({ men: '', women: '', kids: '', ...(s.audienceHeroImages || {}) });
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
            await updateSettings({ ...brand, audienceImages, audienceHeroImages, activeAudiences: active, announcement: cleanAnnouncement }).unwrap();
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
                    <p className='text-sm text-text-light'>Override the &ldquo;Shop by Category&rdquo; tile images (Women is the large featured tile).</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {AUDIENCE_OPTS.map((aud) => (
                            <ImageInput key={aud} label={aud.charAt(0).toUpperCase() + aud.slice(1)}
                                value={audienceImages[aud]}
                                onChange={(url) => setAudienceImages((a) => ({ ...a, [aud]: url }))} />
                        ))}
                    </div>

                    {/* Announcement bar */}
                    <h3 className='font-semibold pt-4' style={titleFont}>Announcement Bar</h3>
                    <p className='text-sm text-text-light'>A slim strip above the navigation. Add more than one message and they cross-fade. Shoppers can dismiss it for their session.</p>
                    <label className='flex items-center gap-2 text-sm cursor-pointer'>
                        <input type='checkbox' className='accent-primary w-4 h-4'
                            checked={announcement.enabled}
                            onChange={(e) => setAnnouncement((a) => ({ ...a, enabled: e.target.checked }))} />
                        Show the announcement bar
                    </label>

                    <div className='space-y-2'>
                        {announcement.messages.map((m, i) => (
                            <div key={i} className='flex gap-2'>
                                <input
                                    placeholder={`Message ${i + 1} — e.g. Complimentary shipping over ₹999`}
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
                                        className='px-3 rounded-lg border border-gray-200 hover:border-primary hover:text-primary'>
                                        <i className='ri-delete-bin-6-line'></i>
                                    </button>
                                )}
                            </div>
                        ))}
                        {announcement.messages.length < 6 && (
                            <button type='button' className={ghostBtn}
                                onClick={() => setAnnouncement((a) => ({ ...a, messages: [...a.messages, ''] }))}>
                                + Add message
                            </button>
                        )}
                    </div>

                    <input placeholder='Link (optional) — e.g. /shop' value={announcement.link}
                        onChange={(e) => setAnnouncement((a) => ({ ...a, link: e.target.value }))} className={input} />

                    <div className='flex flex-wrap gap-6'>
                        <label className='flex items-center gap-2 text-sm'>
                            Background
                            <input type='color' value={announcement.bgColor}
                                onChange={(e) => setAnnouncement((a) => ({ ...a, bgColor: e.target.value }))}
                                className='w-10 h-8 rounded border border-gray-200 bg-white' />
                        </label>
                        <label className='flex items-center gap-2 text-sm'>
                            Text
                            <input type='color' value={announcement.textColor}
                                onChange={(e) => setAnnouncement((a) => ({ ...a, textColor: e.target.value }))}
                                className='w-10 h-8 rounded border border-gray-200 bg-white' />
                        </label>
                    </div>

                    {/* Live preview so colours can be judged before saving */}
                    {announcement.enabled && announcement.messages.some((m) => m.trim()) && (
                        <div className='rounded-lg overflow-hidden border border-gray-200'>
                            <div className='text-center py-2 text-[0.72rem] uppercase tracking-[0.09em] font-medium'
                                style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}>
                                {announcement.messages.find((m) => m.trim())}
                            </div>
                        </div>
                    )}

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
