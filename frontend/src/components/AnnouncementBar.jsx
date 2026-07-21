import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetSettingsQuery } from '../redux/features/settings/settingsApi'

const DISMISS_KEY = 'wearly_announce_dismissed';
const ROTATE_MS = 5000;

// Slim service/promo strip above the navbar. Admin-controlled via Settings.
// The navbar is position:sticky (not fixed), so this bar simply sits above it in
// normal flow: it scrolls away and the nav then sticks to the top. No offset math needed.
const AnnouncementBar = () => {
    const { data } = useGetSettingsQuery();
    const announcement = data?.data?.settings?.announcement;

    const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');
    const [index, setIndex] = useState(0);

    const messages = (announcement?.messages || []).filter((m) => m && m.trim());
    const visible = !!announcement?.enabled && messages.length > 0 && !dismissed;

    // Cross-fade between messages (no marquee) — only when there's more than one.
    useEffect(() => {
        if (!visible || messages.length < 2) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), ROTATE_MS);
        return () => clearInterval(id);
    }, [visible, messages.length]);

    if (!visible) return null;

    const message = messages[index % messages.length];
    const style = {
        backgroundColor: announcement.bgColor || '#0f172a',
        color: announcement.textColor || '#ffffff',
    };

    const body = <span key={index} className='announce__msg'>{message}</span>;

    return (
        <div className='announce' style={style} role='status'>
            <div className='announce__inner'>
                {announcement.link
                    ? <Link to={announcement.link} className='announce__link'>{body}</Link>
                    : body}
            </div>
            <button
                type='button'
                className='announce__close'
                aria-label='Dismiss announcement'
                onClick={() => {
                    sessionStorage.setItem(DISMISS_KEY, '1');
                    setDismissed(true);
                }}
            >
                <i className='ri-close-line'></i>
            </button>
        </div>
    );
};

export default AnnouncementBar;
