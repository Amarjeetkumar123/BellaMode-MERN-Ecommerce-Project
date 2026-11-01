import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} from '../redux/features/wishlist/wishlistApi';
import { toggleGuestWish, clearGuestWishlist } from '../redux/features/wishlist/guestWishlistSlice';

const NONE = [];

// Single source of truth for wishlist state in the UI.
// Signed in: the list lives on the account. Signed out: hearts still work and are
// kept in this browser, then moved onto the account the next time you sign in.
export const useWishlist = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const guestItems = useSelector((state) => state.guestWishlist.items);

    // RTK Query dedupes this, so every card can call the hook and still issue one request.
    const { data, isSuccess } = useGetWishlistQuery(undefined, { skip: !user });
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    const items = user ? data?.data?.wishlist || NONE : guestItems;
    const ids = useMemo(() => new Set(items.map((p) => p._id)), [items]);

    // After sign-in, move hearts saved as a guest onto the account (once the account list is in).
    useEffect(() => {
        if (!user || !isSuccess || !guestItems.length) return;
        guestItems.filter((p) => !ids.has(p._id)).forEach((p) => addToWishlist(p));
        dispatch(clearGuestWishlist());
    }, [user, isSuccess, guestItems, ids, addToWishlist, dispatch]);

    const isWished = (id) => ids.has(id);

    // takes the product itself, so the heart can fill before the server answers
    const toggle = (product) => {
        if (!user) return dispatch(toggleGuestWish(product));
        return ids.has(product._id) ? removeFromWishlist(product) : addToWishlist(product);
    };

    return { items, ids, count: items.length, isWished, toggle, isLoggedIn: !!user };
};
