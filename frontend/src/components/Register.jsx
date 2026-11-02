import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLoginUserMutation, useRegisterUserMutation } from '../redux/features/auth/authApi'
import { setUser } from '../redux/features/auth/authSlice'
import { menFashion } from '../assets/images'
import AuthShell from './AuthShell'
import { Field, PasswordMeter } from './Field'
import { invalidFields } from '../utils/forms'

const Register = () => {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [bad, setBad] = useState([]);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [registerUser, { isLoading: creating }] = useRegisterUserMutation();
    const [loginUser, { isLoading: signingIn }] = useLoginUserMutation();
    const busy = creating || signingIn;

    const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setBad((b) => b.filter((x) => x !== k)); };

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        const invalid = invalidFields(e.currentTarget);
        setBad(invalid);
        if (invalid.length) return e.currentTarget.querySelector(`[name="${invalid[0]}"]`).focus();
        const body = { username: form.username.trim(), email: form.email.trim(), password: form.password };
        try {
            await registerUser(body).unwrap();
        } catch (error) {
            return setMessage(error?.data?.message || 'Could not create the account. Try again.');
        }
        // signed in straight away; if that fails, the account still exists, so send them to sign in
        try {
            const res = await loginUser({ email: body.email, password: body.password }).unwrap();
            dispatch(setUser({ user: res.data.user }));
            navigate(state?.from || '/', { replace: true });
        } catch {
            navigate('/login', { replace: true, state });
        }
    };

    return (
        <AuthShell image={menFashion} note={['Members get early sale access', 'Plus order tracking and a wishlist that follows you.']}>
            <form className='wf-auth__form' onSubmit={handleRegister} noValidate>
                <p className='wf-kick'>Join Wearly Fashion</p>
                <h1>Create account</h1>
                <p className='wf-intro'>Takes a minute. Anything you saved as a guest comes with you.</p>
                <Field id='username' label='Name' placeholder='e.g. Priya Sharma' required minLength={2} maxLength={40} autoComplete='name' error='Use at least 2 characters'
                    bad={bad.includes('username')} value={form.username} onChange={set('username')} />
                <Field id='email' label='Email' placeholder='you@example.com' type='email' required autoComplete='email' error='Enter a valid email'
                    bad={bad.includes('email')} value={form.email} onChange={set('email')} />
                <Field id='password' label='Password' placeholder='At least 8 characters' password required minLength={8} maxLength={128} autoComplete='new-password' error='Use at least 8 characters'
                    bad={bad.includes('password')} value={form.password} onChange={set('password')}>
                    <PasswordMeter value={form.password} />
                </Field>
                <ul className='wf-benefits'>
                    <li><i className='ri-check-line'></i>Track every order from your account</li>
                    <li><i className='ri-check-line'></i>Wishlist saved on every device</li>
                    <li><i className='ri-check-line'></i>Faster checkout with saved addresses</li>
                </ul>
                {message && <p className='wf-alert' role='alert'>{message}</p>}
                <button type='submit' disabled={busy} className='wf-btn wf-btn--block'>
                    {busy ? <><span className='wf-spinner'></span>{signingIn ? 'Signing you in' : 'Creating account'}</> : 'Create account'}
                </button>
                <p className='wf-auth__switch'>Already have an account? <Link to='/login' state={state} className='wf-u'>Sign in</Link></p>
            </form>
        </AuthShell>
    );
};

export default Register;
