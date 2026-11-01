import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation } from '../../../redux/features/auth/authApi'
import avatarImg from '../../../assets/avatar.png'
import { card, input, titleFont } from './adminUI'
import AdminPager from './AdminPager'

const ROLES = ['USER', 'ADMIN', 'SUPERADMIN'];
const ROLE_PILL = {
    SUPERADMIN: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    USER: 'bg-gray-100 text-gray-600',
};

const ManageUsers = () => {
    const { user: me } = useSelector((s) => s.auth);
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetUsersQuery({ limit: 20, page });
    const [updateRole] = useUpdateUserRoleMutation();
    const [deleteUser] = useDeleteUserMutation();
    const users = data?.data?.users || [];
    const totalPages = data?.data?.totalPages || 1;
    const total = data?.data?.total || users.length;

    if (isLoading) return <p>Loading…</p>;

    return (
        <div>
            <h2 className='text-2xl font-bold mb-6' style={titleFont}>Manage Users</h2>
            <div className={`${card} !p-0 overflow-hidden`}>
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead className='bg-gray-50 text-text-light'><tr>
                            <th className='p-3 text-left font-medium'>User</th><th className='p-3 font-medium'>Current Role</th><th className='p-3 font-medium'>Change Role</th><th className='p-3 font-medium'>Actions</th>
                        </tr></thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className='border-t border-gray-100 hover:bg-gray-50/50'>
                                    <td className='p-3'>
                                        <div className='flex items-center gap-3'>
                                            <img src={u.profileImage || avatarImg} alt='' className='w-9 h-9 rounded-full object-cover' />
                                            <div>
                                                <div className='font-medium'>{u.username}{u._id === me?._id && <span className='text-xs text-text-light ml-1'>(you)</span>}</div>
                                                <div className='text-xs text-text-light'>{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='p-3 text-center'>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_PILL[u.role] || 'bg-gray-100'}`}>{u.role}</span>
                                    </td>
                                    <td className='p-3 text-center'>
                                        <select defaultValue={u.role} disabled={u._id === me?._id}
                                            onChange={(e) => updateRole({ userId: u._id, role: e.target.value })}
                                            className={`${input} !py-1.5 !w-auto disabled:opacity-50`}>
                                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td className='p-3 text-center'>
                                        {u._id !== me?._id ? (
                                            <button onClick={() => window.confirm('Delete user?') && deleteUser(u._id)} className='text-primary hover:underline'>Delete</button>
                                        ) : <span className='text-text-light'>—</span>}
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
