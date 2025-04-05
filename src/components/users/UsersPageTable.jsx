import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Search, Trash2, UserPlus, X } from 'lucide-react';
import PropTypes from 'prop-types';


const UsersPageTable = ({ users, currentPage, setCurrentPage, perPage, setPerPage, totalUsers }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", role: "", status: ""});
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / perPage);

    // Handle Search
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = users.filter(user =>
            user.name?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.nickname?.toLowerCase().includes(term)
        );
        setFilteredUsers(filtered);
    };

    // Add User Function
    const handleAdd = () => {
        const newId = filteredUsers.length > 0 ? Math.max   (...filteredUsers.map(user => user.id)) + 1 : 1;
        const UserToAdd = { ...newUser, id: newId, price: String(newUser.email), role: String(newUser.role), status: String(newUser.status) };
        setFilteredUsers([UserToAdd, ...filteredUsers]);
        setAddModalOpen(false);
        setNewUser({ name: "", email: "", role: "", status: "" }); // Reset new user state
    };

    // Edit user function
    const handleEdit = (user) => {
        setEditUser(user);
        setEditModalOpen(true);
    };

    // Delete user function
    const handleDelete = (userId) => {
        const updatedUsers = filteredUsers.filter(user => user.id !== userId);
        setFilteredUsers(updatedUsers);
    };

    // Save function after editing user details
    const handleSave = () => {
        const updatedUsers = filteredUsers.map(user =>
            user.id === editUser.id ? editUser : user
        );
        setFilteredUsers(updatedUsers);
        setEditModalOpen(false);
    };

    // Pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            {/* Header and Search */}
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>用戶列表</h2>

                <div className='relative flex items-center'>
                    <Search className='absolute left-3 text-gray-400 sm:left-2.5 top-2.5' size={20} />
                    <input
                        type="text"
                        placeholder='搜尋用戶...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                </div>

            </div>

            {/* Table */}
            <div className='overflow-x-auto' style={{ minHeight: '400px' }}>
                <table className='min-w-full divide-y divide-gray-400'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>用戶資料</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>登入方式</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>最後登入</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>登入次數</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>狀態</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-500'>
                        {filteredUsers.map((user) => (
                            <motion.tr
                                key={user.user_id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.1, delay: 0.2 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                            {user.picture ? (
                                                <img className='h-10 w-10 rounded-full' src={user.picture} alt={user.name} />
                                            ) : (
                                                <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className='ml-4'>
                                            <div className='text-sm font-semibold text-gray-100'>{user.name}</div>
                                            <div className='text-sm text-gray-400'>{user.email}</div>
                                            {user.nickname && (
                                                <div className='text-sm text-gray-500'>暱稱: {user.nickname}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>
                                        {user.identities.map(identity => (
                                            <span
                                                key={identity.provider}
                                                className={`px-2 py-1 rounded-full text-xs mr-2 
                                                    ${identity.isSocial ? 'bg-blue-600 text-blue-100' : 'bg-gray-600 text-gray-100'}`}
                                            >
                                                {identity.provider}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>
                                        {new Date(user.last_login).toLocaleString('zh-TW')}
                                    </div>
                                    <div className='text-xs text-gray-500'>
                                        IP: {user.last_ip}
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{user.logins_count} 次</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex flex-col space-y-1'>
                                        <span className={`px-2 py-1 inline-flex text-xs rounded-full font-semibold
                                            ${user.email_verified ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'}`}>
                                            {user.email_verified ? '已驗證' : '未驗證'}
                                        </span>
                                        {user.statusMessage && (
                                            <span className='text-xs text-gray-400'>{user.statusMessage}</span>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className='flex flex-col md:flex-row justify-between mt-4 space-x-2 items-center'>
                <div className='flex items-center'>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`text-sm px-3 py-1 border rounded-md ${currentPage === 0 ? 'text-gray-400 border-gray-600' : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className='mx-2 text-sm font-medium text-gray-100'>第 {currentPage + 1} 頁，共 {totalPages} 頁</span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`text-sm px-3 py-1 border rounded-md ${currentPage === totalPages - 1 ? 'text-gray-400 border-gray-600' : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className='text-sm font-medium text-gray-300 tracking-wider mt-5 md:mt-0'>
                    總用戶數: {totalUsers}
                </div>
            </div>

            {/* Popup Window for Editing */}
            {isEditModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <motion.div
                        className='bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-xl'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >

                        <h1 className='text-2xl font-semibold text-gray-100 mb-3 underline tracking-wider'>Edit User</h1>

                        {/* Responsive grid layout for fields */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>User Name</label>
                                <input
                                    type='text'
                                    value={editUser.name}
                                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Email</label>
                                <input
                                    type='email'
                                    value={editUser.email}
                                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Role</label>
                                <input
                                    type='text'
                                    value={editUser.role}
                                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Status</label>
                                <input
                                    type='text'
                                    value={editUser.status}
                                    onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                        </div>

                        <div className='flex justify-end mt-5 space-x-2'>
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className='bg-gray-600 hover:bg-red-500 text-gray-100 px-4 py-2 rounded-md'
                            >
                                <X size={22} />
                            </button>
                            <button
                                onClick={handleSave}
                                className='bg-blue-600 hover:bg-blue-800 text-white text-md px-4 py-2 rounded-md w-24'
                            >
                                Save
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <motion.div
                        className='bg-gray-800 rounded-lg shadow-lg p-6 max-w-xl w-full'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1 className='text-2xl font-semibold text-gray-100 mb-6 underline tracking-wider'>Add New User</h1>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>User Name</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder='User Name'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>User Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder='Email'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>User Role</label>
                                <input
                                    type='text'
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    placeholder='Role'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>


                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'> User Status</label>
                                <input
                                    type="text"
                                    value={newUser.status}
                                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                                    placeholder='Status'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                        </div>

                        <div className='flex justify-end mt-6 space-x-2'>
                            <button onClick={() => setAddModalOpen(false)} className='bg-gray-600 hover:bg-red-500 text-gray-100 px-4 py-2 rounded-md'>
                                <X size={22} />
                            </button>
                            <button onClick={handleAdd} className='bg-blue-600 hover:bg-blue-800 text-white text-md px-4 py-3 rounded-md w-28'>
                                Add User
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

        </motion.div>
    );
};

UsersPageTable.propTypes = {
    users: PropTypes.arrayOf(
        PropTypes.shape({
            user_id: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            email_verified: PropTypes.bool.isRequired,
            name: PropTypes.string,
            nickname: PropTypes.string,
            picture: PropTypes.string,
            identities: PropTypes.arrayOf(
                PropTypes.shape({
                    provider: PropTypes.string.isRequired,
                    isSocial: PropTypes.bool.isRequired
                })
            ).isRequired,
            last_login: PropTypes.string.isRequired,
            last_ip: PropTypes.string.isRequired,
            logins_count: PropTypes.number.isRequired,
            statusMessage: PropTypes.string
        })
    ).isRequired,
    currentPage: PropTypes.number.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    perPage: PropTypes.number.isRequired,
    setPerPage: PropTypes.func.isRequired,
    totalUsers: PropTypes.number.isRequired
};

export default UsersPageTable;
