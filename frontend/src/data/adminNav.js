// Admin panel pages, shared by the admin sidebar, the account sidebar and the header menu.
export const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];
export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
export const adminLinks = (role) => [
    { to: '/dashboard/admin', label: 'Admin overview', icon: 'ri-dashboard-line' },
    { to: '/dashboard/manage-products', label: 'Products', icon: 'ri-t-shirt-line' },
    { to: '/dashboard/manage-categories', label: 'Categories', icon: 'ri-price-tag-3-line' },
    { to: '/dashboard/manage-orders', label: 'All orders', icon: 'ri-file-list-3-line' },
    { to: '/dashboard/help-requests', label: 'Help requests', icon: 'ri-customer-service-2-line' },
    { to: '/dashboard/add-new-post', label: 'Blog posts', icon: 'ri-article-line' },
    { to: '/dashboard/settings', label: 'Settings', icon: 'ri-settings-3-line' },
    ...(role === 'SUPERADMIN' ? [{ to: '/dashboard/manage-users', label: 'Users', icon: 'ri-group-line' }] : []),
];
