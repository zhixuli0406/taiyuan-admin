import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Edit, Trash2, Search, X, Save } from 'lucide-react'
import { adminApi } from '../../core/api'
import { toast } from 'react-toastify'

const AdminTable = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [admins, setAdmins] = useState([])
    const [filteredAdmins, setFilteredAdmins] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState(null)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'Admin',
    })
    const itemsPerPage = 6

    useEffect(() => {
        fetchAdmins()
    }, [])

    const fetchAdmins = async () => {
        try {
            const response = await adminApi.getAll()
            if (response.admins) {
                setAdmins(response.admins)
                setFilteredAdmins(response.admins)
            } else {
                console.error('API 響應格式錯誤:', response)
                setAdmins([])
                setFilteredAdmins([])
            }
        } catch (error) {
            console.error('獲取管理員列表失敗:', error)
            toast.error(error.response?.data?.message || '獲取管理員列表失敗')
            if (error.response?.status === 401) {
                localStorage.clear()
                window.location.href = '/'
            }
        }
    }

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        const filtered = admins.filter(admin =>
            admin.username.toLowerCase().includes(term) ||
            admin.email.toLowerCase().includes(term)
        )
        setFilteredAdmins(filtered)
        setCurrentPage(1)
    }

    const handleOpenModal = (admin = null) => {
        if (admin) {
            setSelectedAdmin(admin)
            setFormData({
                username: admin.username,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive
            })
        } else {
            setSelectedAdmin(null)
            setFormData({
                username: '',
                email: '',
                role: 'Admin',
                isActive: true
            })
        }
        setShowModal(true)
    }

    const handleSave = async () => {
        try {
            if (selectedAdmin) {
                await adminApi.update(selectedAdmin._id, formData)
                toast.success('管理員更新成功')
            } else {
                await adminApi.create(formData)
                toast.success('管理員創建成功')
            }
            fetchAdmins()
            setShowModal(false)
        } catch (error) {
            console.error('保存管理員失敗:', error)
            toast.error(error.response?.data?.message || '保存管理員失敗')
            if (error.response?.status === 401) {
                localStorage.clear()
                window.location.href = '/'
            }
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('確定要刪除這個管理員嗎？')) {
            try {
                await adminApi.delete(id)
                toast.success('管理員刪除成功')
                fetchAdmins()
            } catch (error) {
                console.error('刪除管理員失敗:', error)
                toast.error(error.response?.data?.message || '刪除管理員失敗')
                if (error.response?.status === 401) {
                    localStorage.clear()
                    window.location.href = '/'
                }
            }
        }
    }

    const paginate = (pageNumber) => setCurrentPage(pageNumber)
    const getCurrentPageAdmins = () => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAdmins.slice(start, start + itemsPerPage)
    }

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>管理員列表</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md'
                >
                    添加管理員
                </button>
            </div>

            <div className='relative flex items-center mb-6'>
                <Search className='absolute left-3 text-gray-400 sm:left-2.5 top-2.5' size={20} />
                <input
                    type="text"
                    placeholder='搜索管理員...'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500'
                    onChange={handleSearch}
                    value={searchTerm}
                />
            </div>

            <div className='overflow-x-auto' style={{ minHeight: '400px' }}>
                <table className='min-w-full divide-y divide-gray-400'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>用戶名</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>郵箱</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>角色</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>操作</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-500'>
                        {getCurrentPageAdmins().map((admin) => (
                            <motion.tr
                                key={admin.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.1, delay: 0.2 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm font-semibold text-gray-100'>{admin.username}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{admin.email}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className={`px-3 inline-flex rounded-full text-xs leading-5 font-semibold ${
                                        admin.role === 'SuperAdmin' ? 'bg-purple-700 text-purple-100' : 'bg-blue-700 text-blue-100'
                                    }`}>
                                        {admin.role === 'SuperAdmin' ? '超級管理員' : '管理員'}
                                    </span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex space-x-2'>
                                        <button onClick={() => handleOpenModal(admin)}>
                                            <Edit className='text-blue-500 cursor-pointer' size={20} />
                                        </button>
                                        <button onClick={() => handleDelete(admin.id)}>
                                            <Trash2 className='text-red-500 cursor-pointer' size={20} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <motion.div
                        className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-100">
                                {selectedAdmin ? '編輯管理員' : '添加管理員'}
                            </h2>
                            <button onClick={() => setShowModal(false)}>
                                <X className="text-gray-400 hover:text-gray-300" size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">用戶名</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">郵箱</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">角色</label>
                                <select
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Admin">管理員</option>
                                    <option value="SuperAdmin">超級管理員</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 flex items-center"
                            >
                                <Save className="mr-2" size={18} />
                                保存
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className='flex flex-col md:flex-row justify-between mt-4 space-x-2 items-center'>
                <div className='flex items-center'>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`text-sm px-3 py-1 border rounded-md ${
                            currentPage === 1 ? 'text-gray-400 border-gray-600' : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'
                        }`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className='mx-2 text-sm font-medium text-gray-100'>
                        第 {currentPage} 頁，共 {Math.ceil(filteredAdmins.length / itemsPerPage)} 頁
                    </span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredAdmins.length / itemsPerPage)}
                        className={`text-sm px-3 py-1 border rounded-md ${
                            currentPage === Math.ceil(filteredAdmins.length / itemsPerPage)
                                ? 'text-gray-400 border-gray-600'
                                : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'
                        }`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className='text-sm font-medium text-gray-300 tracking-wider mt-5 md:mt-0'>
                    總管理員數: {filteredAdmins.length}
                </div>
            </div>
        </motion.div>
    )
}

export default AdminTable 