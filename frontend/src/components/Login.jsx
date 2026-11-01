import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../redux/features/auth/authApi';
import { setUser } from '../redux/features/auth/authSlice';
import { useDispatch } from 'react-redux';
import { womenFashion } from '../assets/images';

const Login = () => {
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loginUser, { isLoading: loginLoading }] = useLoginUserMutation();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password }).unwrap();
            const { token, user } = response.data;
            dispatch(setUser({ user, token }));
            navigate("/")
        } catch (error) {
            setMessage(error?.data?.message || "Please provide valid email or password.")
        }
    }

    return (
        <section className='auth'>
            <div className='auth__visual'>
                <img src={womenFashion} alt='' />
                <div className='auth__visual-overlay'>
                    <Link to='/' className='auth__brand'>Wearly<span>.</span></Link>
                    <div>
                        <h2>Welcome back</h2>
                        <p>Sign in to track orders, save favourites and check out faster.</p>
                    </div>
                </div>
            </div>
            <div className='auth__form-wrap'>
                <div className='auth__form'>
                    <Link to='/' className='auth__brand auth__brand--dark'>Wearly<span>.</span></Link>
                    <h1>Sign in</h1>
                    <p className='auth__hint'>Enter your details to access your account.</p>
                    <form onSubmit={handleLogin} className='space-y-4 mt-6'>
                        <div>
                            <label className='auth__label'>Email address</label>
                            <input type='email' placeholder='you@example.com' required
                                onChange={(e) => setEmail(e.target.value)} className='auth__input' />
                        </div>
                        <div>
                            <label className='auth__label'>Password</label>
                            <input type='password' placeholder='••••••••' required
                                onChange={(e) => setPassword(e.target.value)} className='auth__input' />
                        </div>
                        {message && <p className='text-primary text-sm'>{message}</p>}
                        <button type='submit' disabled={loginLoading} className='btn w-full !rounded-lg'>
                            {loginLoading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>
                    <p className='auth__switch'>Don&apos;t have an account? <Link to='/register'>Create one</Link></p>
                </div>
            </div>
        </section>
    )
}

export default Login
