import React from 'react'
import { useSelector } from 'react-redux'
import { useGetUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation } from '../../../redux/features/auth/authApi'

const ROLES = ['USER', 'ADMIN', 'SUPERADMIN'];

const ManageUsers = () => {
    const { user: me } = useSelector((s) => s.auth);
    const { data, isLoading } = useGetUsersQuery({ limit: 100 });
    const [updateRole] = useUpdateUserRoleMutation();
    const [deleteUser] = useDeleteUserMutation();
    const users = data?.data?.users || [];

    if (isLoading) return <p>Loading…</p>;

    return (
        <div>
            <h2 className='text-2xl font-semibold mb-6'>Manage Users</h2>
            <div className='overflow-x-auto'>
                <table className='w-full text-sm border'>
                    <thead className='bg-gray-100'><tr>
                        <th className='p-2 text-left'>Email</th><th className='p-2'>Role</th><th className='p-2'>Actions</th>
                    </tr></thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id} className='border-t'>
                                <td className='p-2'>{u.email}</td>
                                <td className='p-2 text-center'>
                                    <select defaultValue={u.role} disabled={u._id === me?._id}
                                        onChange={(e) => updateRole({ userId: u._id, role: e.target.value })}
                                        className='border p-1 rounded'>
                                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </td>
                                <td className='p-2 text-center'>
                                    {u._id !== me?._id && (
                                        <button onClick={() => window.confirm('Delete user?') && deleteUser(u._id)} className='text-red-600'>Delete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
