import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useChangePasswordMutation, useEditProfileMutation } from '../../../redux/features/auth/authApi'
import { setUser } from '../../../redux/features/auth/authSlice'
import { Field, PasswordMeter } from '../../../components/Field'
import { invalidFields } from '../../../utils/forms'
import { initialOf } from '../../../utils/user'

const ADDRESS_FIELDS = [
    ['fullName', 'Full name', { placeholder: 'e.g. Priya Sharma',autoComplete: 'name' }, 'Enter a name'],
    ['phone', 'Mobile number', { placeholder: '10 digits, e.g. 9876543210',inputMode: 'numeric', pattern: '[6-9][0-9]{9}', autoComplete: 'tel-national' }, 'Enter a 10-digit mobile number'],
    ['line1', 'House no., building, street', { placeholder: 'e.g. Flat 12B, Sunrise Apartments, MG Road',autoComplete: 'address-line1', wide: true }, 'Enter the address'],
    ['line2', 'Area, landmark (optional)', { placeholder: 'e.g. Near City Mall',autoComplete: 'address-line2', wide: true, optional: true }],
    ['postalCode', 'PIN code', { placeholder: 'e.g. 560001',inputMode: 'numeric', pattern: '[1-9][0-9]{5}', autoComplete: 'postal-code' }, 'Enter a 6-digit PIN code'],
    ['city', 'City', { placeholder: 'e.g. Bengaluru',autoComplete: 'address-level2' }, 'Enter the city'],
    ['state', 'State', { placeholder: 'e.g. Karnataka',autoComplete: 'address-level1' }, 'Enter the state'],
    ['label', 'Label, e.g. Home or Work (optional)', { optional: true, maxLength: 30 }],
];
const blankAddress = Object.fromEntries(ADDRESS_FIELDS.map(([k]) => [k, '']));

// Fields marked bad, cleared as soon as the person edits them.
const useBad = () => {
    const [bad, setBad] = useState([]);
    return [bad, setBad, (k) => setBad((b) => b.filter((x) => x !== k))];
};
const check = (e, setBad) => {
    const invalid = invalidFields(e.currentTarget);
    setBad(invalid);
    if (invalid.length) e.currentTarget.querySelector(`[name="${invalid[0]}"]`).focus();
    return !invalid.length;
};

const AddressForm = ({ initial, busy, onSave, onCancel }) => {
    const [a, setA] = useState({ ...blankAddress, ...initial });
    const [bad, setBad, ok] = useBad();
    return (
        <form className='wf-addr-form' noValidate onSubmit={(e) => { e.preventDefault(); if (check(e, setBad)) onSave(a); }}>
            <div className='wf-fields'>
                {ADDRESS_FIELDS.map(([k, label, { wide, optional, ...attrs }, err]) => (
                    <Field key={k} id={`ad-${k}`} label={label} wide={wide} required={!optional} {...attrs} error={err}
                        bad={bad.includes(`ad-${k}`)} value={a[k]} onChange={(e) => { setA({ ...a, [k]: e.target.value }); ok(`ad-${k}`); }} />
                ))}
            </div>
            <div className='wf-acts'>
                <button type='submit' className='wf-btn wf-btn--sm' disabled={busy}>{busy ? <><span className='wf-spinner'></span>Saving</> : 'Save address'}</button>
                <button type='button' className='wf-linkbtn wf-u' onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);
    const [editProfile, { isLoading: saving }] = useEditProfileMutation();
    const [changePassword, { isLoading: changing }] = useChangePasswordMutation();

    const save = async (patch) => {
        const res = await editProfile(patch).unwrap();
        dispatch(setUser({ user: res.data.user }));
    };

    // ---- details ----
    const [me, setMe] = useState({ username: user?.username || '', phone: user?.phone || '' });
    const [bad, setBad, ok] = useBad();
    const [meMsg, setMeMsg] = useState(null);
    const saveMe = async (e) => {
        e.preventDefault();
        setMeMsg(null);
        if (!check(e, setBad)) return;
        try { await save(me); setMeMsg({ ok: 'Saved' }); setTimeout(() => setMeMsg(null), 2400); }
        catch (err) { setMeMsg({ err: err?.data?.message || 'Could not save. Try again.' }); }
    };

    // ---- addresses (the first one is the default) ----
    const addresses = user?.addresses || [];
    const [editing, setEditing] = useState(null); // index, 'new' or null
    const [addrErr, setAddrErr] = useState('');
    const saveAddresses = async (next) => {
        setAddrErr('');
        // drop empty optional fields so they pass the server's checks
        const clean = next.map((a) => Object.fromEntries(Object.entries(a).filter(([k, v]) => v && k in blankAddress)));
        try { await save({ addresses: clean }); setEditing(null); }
        catch (err) { setAddrErr(err?.data?.message || 'Could not save the address. Try again.'); }
    };
    const upsert = (a) => saveAddresses(editing === 'new' ? [...addresses, a] : addresses.map((x, i) => (i === editing ? a : x)));
    const remove = (i) => saveAddresses(addresses.filter((_, k) => k !== i));
    const makeDefault = (i) => saveAddresses([addresses[i], ...addresses.filter((_, k) => k !== i)]);

    // ---- password ----
    const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
    const [pwBad, setPwBad, pwOk] = useBad();
    const [pwMsg, setPwMsg] = useState(null);
    const savePw = async (e) => {
        e.preventDefault();
        setPwMsg(null);
        if (!check(e, setPwBad)) return;
        try { await changePassword(pw).unwrap(); setPw({ currentPassword: '', newPassword: '' }); setPwMsg({ ok: 'Password changed' }); }
        catch (err) { setPwMsg({ err: err?.data?.message || 'Could not change the password.' }); }
    };

    return (
        <>
            <p className='wf-kick'>Profile</p>
            <h1 style={{ marginBottom: 28 }}>Profile and addresses</h1>

            <form className='wf-blk wf-prof' noValidate onSubmit={saveMe}>
                <div className='wf-photo' aria-hidden='true'>{user?.profileImage ? <img src={user.profileImage} alt='' /> : initialOf(user)}</div>
                <div>
                    <div className='wf-fields'>
                        <Field id='p-username' label='Name' placeholder='e.g. Priya Sharma' required minLength={2} maxLength={40} autoComplete='name' error='Use at least 2 characters'
                            bad={bad.includes('p-username')} value={me.username} onChange={(e) => { setMe({ ...me, username: e.target.value }); ok('p-username'); }} />
                        <Field id='p-phone' label='Mobile number' placeholder='10 digits, e.g. 9876543210' inputMode='numeric' pattern='[6-9][0-9]{9}' autoComplete='tel-national' error='Enter a 10-digit mobile number'
                            bad={bad.includes('p-phone')} value={me.phone} onChange={(e) => { setMe({ ...me, phone: e.target.value }); ok('p-phone'); }} />
                        <Field id='p-email' label='Email' wide value={user?.email || ''} disabled readOnly />
                    </div>
                    <div className='wf-savebar'>
                        <button className='wf-btn' type='submit' disabled={saving}>{saving ? <><span className='wf-spinner'></span>Saving</> : 'Save changes'}</button>
                        {meMsg?.ok && <span className='wf-note-ok' role='status'><i className='ri-check-line'></i>{meMsg.ok}</span>}
                        {meMsg?.err && <p className='wf-alert' role='alert'>{meMsg.err}</p>}
                    </div>
                </div>
            </form>

            <section className='wf-blk' aria-labelledby='addr-h'>
                <h2 id='addr-h'>Saved addresses</h2>
                <div className='wf-addrs'>
                    {addresses.map((a, i) => (editing === i ? (
                        <AddressForm key={i} initial={a} busy={saving} onSave={upsert} onCancel={() => setEditing(null)} />
                    ) : (
                        <div key={i} className={`wf-addr ${i === 0 ? 'def' : ''}`}>
                            {i === 0 && <span className='wf-addr__tag'>Default</span>}
                            <b>{a.label || `Address ${i + 1}`}</b>
                            {a.fullName}<br />{[a.line1, a.line2].filter(Boolean).join(', ')}<br />{a.city}, {a.state} {a.postalCode}<br />{a.phone}
                            <div className='wf-acts'>
                                <button type='button' className='wf-linkbtn wf-u' onClick={() => setEditing(i)}>Edit</button>
                                <button type='button' className='wf-linkbtn wf-u' onClick={() => remove(i)}>Remove</button>
                                {i > 0 && <button type='button' className='wf-linkbtn wf-u' onClick={() => makeDefault(i)}>Make default</button>}
                            </div>
                        </div>
                    )))}
                    {editing === 'new' ? (
                        <AddressForm initial={{ fullName: user?.username || '', phone: user?.phone || '' }} busy={saving} onSave={upsert} onCancel={() => setEditing(null)} />
                    ) : addresses.length < 5 && (
                        <button type='button' className='wf-addr-new' onClick={() => setEditing('new')}><i className='ri-add-line'></i>Add an address</button>
                    )}
                </div>
                {addrErr && <p className='wf-alert' role='alert'>{addrErr}</p>}
                <p className='wf-muted' style={{ fontSize: 13, marginTop: 12 }}>Your default address fills in at checkout.</p>
            </section>

            <form className='wf-blk' noValidate onSubmit={savePw} aria-labelledby='pw-h'>
                <h2 id='pw-h'>Change password</h2>
                <div className='wf-fields'>
                    <Field id='pw-current' label='Current password' placeholder='The one you use now' password required autoComplete='current-password' error='Enter your current password'
                        bad={pwBad.includes('pw-current')} value={pw.currentPassword} onChange={(e) => { setPw({ ...pw, currentPassword: e.target.value }); pwOk('pw-current'); }} />
                    <Field id='pw-new' label='New password' placeholder='At least 8 characters' password required minLength={8} autoComplete='new-password' error='Use at least 8 characters'
                        bad={pwBad.includes('pw-new')} value={pw.newPassword} onChange={(e) => { setPw({ ...pw, newPassword: e.target.value }); pwOk('pw-new'); }}>
                        <PasswordMeter value={pw.newPassword} />
                    </Field>
                </div>
                <div className='wf-savebar'>
                    <button className='wf-btn wf-btn--line' type='submit' disabled={changing}>{changing ? 'Changing…' : 'Change password'}</button>
                    {pwMsg?.ok && <span className='wf-note-ok' role='status'><i className='ri-check-line'></i>{pwMsg.ok}</span>}
                    {pwMsg?.err && <p className='wf-alert' role='alert'>{pwMsg.err}</p>}
                </div>
            </form>
        </>
    );
};

export default Profile;
