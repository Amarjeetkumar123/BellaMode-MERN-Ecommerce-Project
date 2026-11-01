// First letter of the name (or email) for the monogram avatar.
export const initialOf = (user) => ((user?.username || user?.email || '?').trim()[0] || '?').toUpperCase();
