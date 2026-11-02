// Shared pager for the admin lists, so long tables page instead of silently
// truncating at the query limit.
const AdminPager = ({ page, totalPages, total, onChange, label = 'records' }) => {
    if (!totalPages || totalPages <= 1) return null;
    return (
        <div className='wf-apager'>
            <span>Page {page} of {totalPages}{total ? <> · {total} {label}</> : null}</span>
            <span className='flex gap-2'>
                <button type='button' onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1}><i className='ri-arrow-left-s-line'></i>Prev</button>
                <button type='button' onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next<i className='ri-arrow-right-s-line'></i></button>
            </span>
        </div>
    );
};

export default AdminPager;
