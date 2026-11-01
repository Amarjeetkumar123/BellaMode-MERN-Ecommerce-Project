
// Shared pager for the admin lists, so long tables page instead of silently
// truncating at the query limit.
const AdminPager = ({ page, totalPages, total, onChange, label = 'records' }) => {
    if (!totalPages || totalPages <= 1) return null;

    return (
        <div className='flex items-center justify-between flex-wrap gap-3 mt-5'>
            <span className='text-sm text-text-light'>
                Page {page} of {totalPages}
                {total ? <> · {total} {label}</> : null}
            </span>
            <div className='flex items-center gap-2'>
                <button
                    type='button'
                    onClick={() => onChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className='px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-text-dark transition'
                >
                    <i className='ri-arrow-left-s-line'></i> Prev
                </button>
                <button
                    type='button'
                    onClick={() => onChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className='px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-text-dark transition'
                >
                    Next <i className='ri-arrow-right-s-line'></i>
                </button>
            </div>
        </div>
    );
};

export default AdminPager;
