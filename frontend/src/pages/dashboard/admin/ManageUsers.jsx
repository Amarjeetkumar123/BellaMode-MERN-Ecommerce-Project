import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation } from '../../../redux/features/auth/authApi'
import { card, input, statusPill, linkBtn } from './adminUI'
import { AdminHead } from './AdminParts'
import { initialOf } from '../../../utils/user'
import AdminPager from './AdminPager'

const ROLES = ['USER', 'ADMIN', 'SUPERADMIN'];

const ManageUsers = () => {
    const { user: me } = useSelector((s) => s.auth);
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetUsersQuery({ limit: 20, page });
    const [updateRole] = useUpdateUserRoleMutation();
    const [deleteUser] = useDeleteUserMutation();
    const users = data?.data?.users || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total || users.length;

    if (isLoading) return <p className='wf-muted'>Loading…</p>;

    return (
        <div>
            <AdminHead title='Users' sub='Change who can manage the store. You can’t change or delete your own account here.' />
            <div className={`${card} !p-0 overflow-hidden`}>
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead><tr>
                            <th className='text-left'>User</th><th className='text-left'>Role</th><th className='text-left'>Change role</th><th className='text-left'><span className='sr-only'>Actions</span></th>
                        </tr></thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td>
                                        <div className='flex items-center gap-3'>
                                            {u.profileImage ? <img src={u.profileImage} alt='' className='w-9 h-9 rounded-full object-cover' /> : <span className='wf-mono' aria-hidden='true'>{initialOf(u)}</span>}
                                            <div>
                                                <div className='font-bold'>{u.username}{u._id === me?._id && <span className='text-xs wf-muted ml-1'>(you)</span>}</div>
                                                <div className='text-xs wf-muted'>{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={statusPill(u.role)}>{(u.role || '').toLowerCase()}</span>
                                    </td>
                                    <td>
                                        <select defaultValue={u.role} aria-label={`Role for ${u.username}`} disabled={u._id === me?._id}
                                            onChange={(e) => updateRole({ userId: u._id, role: e.target.value })}
                                            className={`${input} !min-h-0 !py-1.5 !w-auto text-sm`}>
                                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td className='text-right'>
                                        {u._id !== me?._id && (
                                            <button type='button' onClick={() => window.confirm(`Delete ${u.username}? This can’t be undone.`) && deleteUser(u._id)} className={`${linkBtn} wf-danger`}>Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <AdminPager page={page} totalPages={totalPages} total={total} onChange={setPage} label='users' />
            </div>
        </div>
    );
};

export default ManageUsers;
