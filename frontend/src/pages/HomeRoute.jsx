import React from 'react'
import CategoryPage from './category/CategoryPage'
import StorefrontPage from './storefront/StorefrontPage'
import { useHostStore } from '../hooks/useHostStore'

// The site root behaves differently by host: on a store subdomain (acme.wearly.com)
// it renders that seller's storefront; on the marketplace apex it renders the default
// department page.
const HomeRoute = () => {
    const { store, isStorefront, isLoading } = useHostStore();
    if (isLoading) return <div className='section__container !py-20 text-text-light'>Loading…</div>;
    if (isStorefront) return <StorefrontPage slug={store.slug} />;
    return <CategoryPage />;
};

export default HomeRoute;
