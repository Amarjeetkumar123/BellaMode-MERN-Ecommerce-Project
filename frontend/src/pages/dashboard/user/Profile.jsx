import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEditProfileMutation } from '../../../redux/features/auth/authApi'
import { setUser } from '../../../redux/features/auth/authSlice'
import ImageInput from '../../../components/ImageInput'

const Profile = () => {
    const dispatch = useDispatch();
    const { user, token } = useSelector((s) => s.auth);
    const [editProfile, { isLoading }] = useEditProfileMutation();
    const [form, setForm] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
        profession: user?.profession || '',
        phone: user?.phone || '',
        profileImage: user?.profileImage || '',
    });
    const [msg, setMsg] = useState('');

    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const res = await editProfile(form).unwrap();
            dispatch(setUser({ user: res.data.user, token }));
            setMsg('Profile updated.');
        } catch (err) {
            setMsg(err?.data?.message || 'Update failed.');
        }
    };

    return (
        <div>
            <h2 className='text-2xl font-semibold mb-6'>My Profile</h2>
            <form onSubmit={handleSubmit} className='max-w-lg space-y-4'>
                <ImageInput label='Profile Image' value={form.profileImage} onChange={(url) => setField('profileImage', url)} />
                <input placeholder='Username' value={form.username} onChange={(e) => setField('username', e.target.value)} className='border p-2 rounded w-full' />
                <input placeholder='Phone' value={form.phone} onChange={(e) => setField('phone', e.target.value)} className='border p-2 rounded w-full' />
                <input placeholder='Profession' value={form.profession} onChange={(e) => setField('profession', e.target.value)} className='border p-2 rounded w-full' />
                <textarea placeholder='Bio' value={form.bio} onChange={(e) => setField('bio', e.target.value)} className='border p-2 rounded w-full' rows={3} />
                <p className='text-sm text-gray-500'>Email: {user?.email} · Role: {user?.role}</p>
                {msg && <p className='text-primary text-sm'>{msg}</p>}
                <button disabled={isLoading} className='px-6 py-2 bg-primary text-white rounded'>{isLoading ? 'Saving…' : 'Save Changes'}</button>
            </form>
        </div>
    );
};

export default Profile;
