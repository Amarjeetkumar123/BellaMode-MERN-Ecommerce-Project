import { useState } from 'react'
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

    const inputCls = 'border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm w-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition';

    return (
        <div>
            <h2 className='text-2xl font-bold mb-6' style={{ fontFamily: 'var(--header-font)' }}>My Profile</h2>
            <form onSubmit={handleSubmit} className='max-w-xl bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4'>
                <ImageInput label='Profile Image' value={form.profileImage} onChange={(url) => setField('profileImage', url)} />
                <div>
                    <label className='block text-sm font-medium mb-1'>Username</label>
                    <input placeholder='Username' value={form.username} onChange={(e) => setField('username', e.target.value)} className={inputCls} />
                </div>
                <div className='grid sm:grid-cols-2 gap-4'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Phone</label>
                        <input placeholder='Phone' value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Profession</label>
                        <input placeholder='Profession' value={form.profession} onChange={(e) => setField('profession', e.target.value)} className={inputCls} />
                    </div>
                </div>
                <div>
                    <label className='block text-sm font-medium mb-1'>Bio</label>
                    <textarea placeholder='Tell us about yourself' value={form.bio} onChange={(e) => setField('bio', e.target.value)} className={inputCls} rows={3} />
                </div>
                <div className='flex items-center gap-2 text-sm text-text-light bg-extra-light rounded-lg px-3 py-2.5'>
                    <i className='ri-mail-line'></i> {user?.email}
                    <span className='mx-1'>·</span>
                    <i className='ri-shield-user-line'></i> <span className='capitalize'>{(user?.role || 'user').toLowerCase()}</span>
                </div>
                {msg && <p className='text-primary text-sm'>{msg}</p>}
                <button disabled={isLoading} className='btn !rounded-lg'>{isLoading ? 'Saving…' : 'Save Changes'}</button>
            </form>
        </div>
    );
};

export default Profile;
