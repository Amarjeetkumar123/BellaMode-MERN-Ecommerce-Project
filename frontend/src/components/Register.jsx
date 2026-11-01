import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../redux/features/auth/authApi';
import { menFashion } from '../assets/images';

const Register = () => {
    const [message, setMessage] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [registerUser, { isLoading: registerLoading }] = useRegisterUserMutation();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await registerUser({ email, password, username }).unwrap();
            alert(response.message);
            navigate("/login");
        } catch (error) {
            setMessage(error?.data?.message || "Registration failed. Please try again.")
        }
    }

    return (
        <section className='auth'>
            <div className='auth__visual'>
                <img src={menFashion} alt='' />
                <div className='auth__visual-overlay'>
                    <Link to='/' className='auth__brand'>Wearly<span>.</span></Link>
                    <div>
                        <h2>Join Wearly</h2>
                        <p>Create an account for faster checkout, order tracking and members-only offers.</p>
                    </div>
                </div>
            </div>
            <div className='auth__form-wrap'>
                <div className='auth__form'>
                    <Link to='/' className='auth__brand auth__brand--dark'>Wearly<span>.</span></Link>
                    <h1>Create account</h1>
                    <p className='auth__hint'>It only takes a minute.</p>
                    <form onSubmit={handleRegister} className='space-y-4 mt-6'>
                        <div>
                            <label className='auth__label'>Username</label>
                            <input type='text' placeholder='Your name' required
                                onChange={(e) => setUsername(e.target.value)} className='auth__input' />
                        </div>
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
                        <button type='submit' disabled={registerLoading} className='btn w-full !rounded-lg'>
                            {registerLoading ? 'Creating…' : 'Create Account'}
                        </button>
                    </form>
                    <p className='auth__switch'>Already have an account? <Link to='/login'>Sign in</Link></p>
                </div>
            </div>
        </section>
    )
}

export default Register
