import React, { useEffect, useState } from 'react'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../../redux/features/settings/settingsApi'
import {
    useGetBannersQuery,
    useCreateBannerMutation,
    useDeleteBannerMutation,
} from '../../../redux/features/banners/bannersApi'
import ImageInput from '../../../components/ImageInput'

const bannerBlank = { title: '', subtitle: '', image: '', link: '/shop', ctaText: 'Shop Now', position: 'hero' };

const DashboardSettings = () => {
    const { data: settingsData } = useGetSettingsQuery();
    const [updateSettings] = useUpdateSettingsMutation();
    const { data: bannerData } = useGetBannersQuery({ all: 'true' });
    const [createBanner] = useCreateBannerMutation();
    const [deleteBanner] = useDeleteBannerMutation();

    const [brand, setBrand] = useState({ brandName: '', heroTagline: '', logoUrl: '', contactEmail: '', contactPhone: '' });
    const [banner, setBanner] = useState(bannerBlank);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const s = settingsData?.data?.settings;
        if (s) setBrand({ brandName: s.brandName || '', heroTagline: s.heroTagline || '', logoUrl: s.logoUrl || '', contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '' });
    }, [settingsData]);

    const banners = bannerData?.data?.banners || [];

    const saveBrand = async (e) => {
        e.preventDefault();
        setMsg('');
        try { await updateSettings(brand).unwrap(); setMsg('Brand settings saved.'); }
        catch (err) { setMsg(err?.data?.message || 'Failed.'); }
    };

    const addBanner = async (e) => {
        e.preventDefault();
        try { await createBanner(banner).unwrap(); setBanner(bannerBlank); }
        catch (err) { setMsg(err?.data?.message || 'Failed.'); }
    };

    return (
        <div className='space-y-10'>
            <div>
                <h2 className='text-2xl font-semibold mb-4'>Brand Settings</h2>
                <form onSubmit={saveBrand} className='max-w-lg space-y-3'>
                    <input placeholder='Brand name' value={brand.brandName} onChange={(e) => setBrand({ ...brand, brandName: e.target.value })} className='border p-2 rounded w-full' />
                    <input placeholder='Hero tagline' value={brand.heroTagline} onChange={(e) => setBrand({ ...brand, heroTagline: e.target.value })} className='border p-2 rounded w-full' />
                    <input placeholder='Contact email' value={brand.contactEmail} onChange={(e) => setBrand({ ...brand, contactEmail: e.target.value })} className='border p-2 rounded w-full' />
                    <input placeholder='Contact phone' value={brand.contactPhone} onChange={(e) => setBrand({ ...brand, contactPhone: e.target.value })} className='border p-2 rounded w-full' />
                    <ImageInput label='Logo' value={brand.logoUrl} onChange={(url) => setBrand({ ...brand, logoUrl: url })} />
                    {msg && <p className='text-primary text-sm'>{msg}</p>}
                    <button className='px-5 py-2 bg-primary text-white rounded'>Save Brand</button>
                </form>
            </div>

            <div>
                <h2 className='text-2xl font-semibold mb-4'>Homepage Banners</h2>
                <form onSubmit={addBanner} className='bg-primary-light p-4 rounded space-y-3 max-w-lg mb-6'>
                    <div className='grid grid-cols-2 gap-3'>
                        <input placeholder='Title' value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} className='border p-2 rounded' />
                        <input placeholder='Subtitle' value={banner.subtitle} onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })} className='border p-2 rounded' />
                        <input placeholder='Link' value={banner.link} onChange={(e) => setBanner({ ...banner, link: e.target.value })} className='border p-2 rounded' />
                        <input placeholder='CTA text' value={banner.ctaText} onChange={(e) => setBanner({ ...banner, ctaText: e.target.value })} className='border p-2 rounded' />
                        <select value={banner.position} onChange={(e) => setBanner({ ...banner, position: e.target.value })} className='border p-2 rounded col-span-2'>
                            <option value='hero'>Hero</option><option value='promo'>Promo</option><option value='deal'>Deal</option>
                        </select>
                    </div>
                    <ImageInput value={banner.image} onChange={(url) => setBanner({ ...banner, image: url })} />
                    <button className='px-5 py-2 bg-primary text-white rounded'>Add Banner</button>
                </form>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                    {banners.map((b) => (
                        <div key={b._id} className='border rounded p-2'>
                            {b.image && <img src={b.image} alt='' className='w-full h-20 object-cover rounded mb-1' />}
                            <p className='text-sm font-medium'>{b.title}</p>
                            <p className='text-xs text-gray-500'>{b.position}</p>
                            <button onClick={() => window.confirm('Delete banner?') && deleteBanner(b._id)} className='text-red-600 text-sm'>Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSettings;
