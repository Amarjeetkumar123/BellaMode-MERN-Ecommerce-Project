import { useSelector } from 'react-redux';

// The logged-in seller's own store id (null for customers / users without a store).
// Used to address the id-driven /api/stores/:storeId/… endpoints from the dashboard.
export const useMyStoreId = () => useSelector((state) => state.auth.user?.store || null);

export default useMyStoreId;
