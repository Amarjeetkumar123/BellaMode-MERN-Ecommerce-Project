import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} from '../redux/features/wishlist/wishlistApi';

// Single source of truth for wishlist state in the UI.
// The wishlist lives on the user's account, so the query is skipped entirely
// when logged out and a heart click routes to /login instead.
export const useWishlist = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // RTK Query dedupes this, so every card can call the hook and still issue one request.
    const { data } = useGetWishlistQuery(undefined, { skip: !user });
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    const items = data?.data?.wishlist || [];
    const ids = useMemo(() => new Set(items.map((p) => p._id)), [items]);

    const isWished = (id) => ids.has(id);

    const toggle = async (id) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (ids.has(id)) await removeFromWishlist(id);
        else await addToWishlist(id);
    };

    return { items, ids, count: items.length, isWished, toggle, isLoggedIn: !!user };
};
