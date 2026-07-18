import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];

const DashboardLayout = () => {
    const { user } = useSelector((s) => s.auth);
    const isAdmin = user && ADMIN_ROLES.includes(user.role);
    const isSuperadmin = user && user.role === 'SUPERADMIN';

    const userLinks = [
        { to: '/dashboard', label: 'Overview', end: true },
        { to: '/dashboard/profile', label: 'Profile' },
        { to: '/dashboard/orders', label: 'My Orders' },
    ];
    const adminLinks = [
        { to: '/dashboard/admin', label: 'Admin Overview' },
        { to: '/dashboard/manage-products', label: 'Products' },
        { to: '/dashboard/manage-categories', label: 'Categories' },
        { to: '/dashboard/manage-orders', label: 'Orders' },
        { to: '/dashboard/add-new-post', label: 'Blog Posts' },
        { to: '/dashboard/settings', label: 'Settings' },
    ];
    if (isSuperadmin) adminLinks.push({ to: '/dashboard/manage-users', label: 'Users' });

    const links = isAdmin ? adminLinks : userLinks;

    return (
        <section className='section__container'>
            <div className='flex flex-col md:flex-row gap-8'>
                <aside className='md:w-56 flex-shrink-0'>
                    <h3 className='font-semibold mb-3'>{isAdmin ? 'Admin' : 'My Account'}</h3>
                    <nav className='flex md:flex-col gap-2 flex-wrap'>
                        {links.map((l) => (
                            <NavLink key={l.to} to={l.to} end={l.end}
                                className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>
                <div className='flex-1 min-w-0'>
                    <Outlet />
                </div>
            </div>
        </section>
    );
};

export default DashboardLayout;
