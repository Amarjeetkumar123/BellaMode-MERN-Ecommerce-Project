import { Link } from 'react-router-dom'
import { useActiveAudiences } from '../hooks/useActiveAudiences'

// Sign in / create account: a photo on one side, the form on the other (photo hidden on phones).
const AuthShell = ({ image, note, children }) => {
    const { settings } = useActiveAudiences();
    const [first, ...rest] = (settings?.brandName || 'Wearly Fashion').split(' ');
    return (
        <main className='wf-auth'>
            <div className='wf-auth__ph' aria-hidden='true'>
                <img src={image} alt='' />
                <p className='wf-auth__note'><b>{note[0]}</b><span>{note[1]}</span></p>
            </div>
            <div className='wf-auth__side'>
                <div className='wf-auth__top'>
                    <Link to='/' className='wf-logo' aria-label={`${settings?.brandName || 'Wearly Fashion'} home`}><span>{first}</span>{rest.length ? ` ${rest.join(' ')}` : ''}</Link>
                    <Link to='/' className='wf-back wf-u'><i className='ri-arrow-left-line'></i>Back to shop</Link>
                </div>
                {children}
            </div>
        </main>
    );
};

export default AuthShell;
