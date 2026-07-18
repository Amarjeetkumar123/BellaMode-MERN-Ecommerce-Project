// API base URL — configurable per environment (VITE_API_URL), falls back to local dev.
export const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || "http://localhost:5000";
};
