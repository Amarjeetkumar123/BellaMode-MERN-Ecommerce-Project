import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import StoreHome from '../store/StoreHome';
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi';
import { useActiveAudiences } from '../../hooks/useActiveAudiences';
import { listingLink } from '../../data/catalog';
import { PageLoader } from '../../components/Loaders'

// `/` and `/categories/men|women|kids` are store home pages. Any other `/categories/<slug>`
// (old links, bookmarks) opens the listing with that category selected.
const CategoryPage = () => {
    const { categoryName } = useParams();
    const { isActive, keys } = useActiveAudiences();
    const { data, isLoading } = useGetCategoriesQuery();
    const name = (categoryName || keys[0] || 'men').toLowerCase();

    useEffect(() => { window.scrollTo(0, 0); }, [name]);

    if (['men', 'women', 'kids'].includes(name)) {
        return isActive(name) ? <StoreHome store={name} /> : <Navigate to='/shop' replace />;
    }
    if (name === 'unisex') return <Navigate to='/shop?audience=unisex' replace />;
    if (isLoading) return <main className='wf-wrap'><PageLoader /></main>;
    const cat = (data?.data?.categories || []).find((c) => c.slug === name);
    if (!cat) return <Navigate to='/shop' replace />;
    return <Navigate to={listingLink(cat.audience === 'unisex' ? null : cat.audience, cat)} replace />;
};

export default CategoryPage;
