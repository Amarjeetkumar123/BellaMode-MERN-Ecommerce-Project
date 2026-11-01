import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLoginUserMutation } from '../redux/features/auth/authApi'
import { setUser } from '../redux/features/auth/authSlice'
import { womenFashion } from '../assets/images'
import AuthShell from './AuthShell'
import { Field } from './Field'
import { invalidFields } from '../utils/forms'

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [bad, setBad] = useState([]);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [loginUser, { isLoading }] = useLoginUserMutation();

    const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setBad((b) => b.filter((x) => x !== k)); };

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        const invalid = invalidFields(e.currentTarget);
        setBad(invalid);
        if (invalid.length) return e.currentTarget.querySelector(`[name="${invalid[0]}"]`).focus();
        try {
            const res = await loginUser({ email: form.email.trim(), password: form.password }).unwrap();
            dispatch(setUser({ user: res.data.user }));
            navigate(state?.from || '/', { replace: true }); // back to where sign-in was needed (e.g. checkout)
        } catch (error) {
            setMessage(error?.data?.message || 'That email and password don’t match.');
        }
    };

    return (
        <AuthShell image={womenFashion} note={['New this week', 'Linen shirts, wide-leg trousers and summer dresses.']}>
            <form className='wf-auth__form' onSubmit={handleLogin} noValidate>
                <p className='wf-kick'>Welcome back</p>
                <h1>Sign in</h1>
                <p className='wf-intro'>Your bag, wishlist and orders, on every device.</p>
                <Field id='email' label='Email' type='email' required autoComplete='email' error='Enter the email you signed up with'
                    bad={bad.includes('email')} value={form.email} onChange={set('email')} />
                <Field id='password' label='Password' password required autoComplete='current-password' error='Enter your password'
                    bad={bad.includes('password')} value={form.password} onChange={set('password')} />
                {message && <p className='wf-alert' role='alert'>{message}</p>}
                <button type='submit' disabled={isLoading} className='wf-btn wf-btn--block'>
                    {isLoading ? <><span className='wf-spinner'></span>Signing in</> : 'Sign in'}
                </button>
                <p className='wf-auth__switch'>New to Wearly Fashion? <Link to='/register' state={state} className='wf-u'>Create an account</Link></p>
            </form>
        </AuthShell>
    );
};

export default Login;
