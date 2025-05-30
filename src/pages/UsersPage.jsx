import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, UserIcon, UserPlus, UserX } from 'lucide-react'
import { customersApi } from '../core/api'
import { toast } from 'react-toastify'

import Header from '../components/common_components/Header'
import StatCards from '../components/common_components/StatCards'
import UsersPageTable from '../components/users/UsersPageTable'

const UsersPage = () => {
    const [users, setUsers] = useState([])
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        socialUsers: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(0)
    const [perPage, setPerPage] = useState(50)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                const response = await customersApi.getAll({
                    page: currentPage,
                    per_page: perPage
                })
                setUsers(response.customers)

                // 計算用戶統計數據
                const total = response.total
                const active = response.customers.filter(user => 
                    new Date(user.last_login) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length
                const verified = response.customers.filter(user => user.email_verified).length
                const social = response.customers.filter(user => 
                    user.identities.some(identity => identity.isSocial)
                ).length

                setUserStats({
                    totalUsers: total,
                    activeUsers: active,
                    verifiedUsers: verified,
                    socialUsers: social
                })
            } catch (error) {
                setError(error.message)
                console.error('獲取用戶數據失敗:', error)
                toast.error(error.response?.data?.message || '獲取用戶數據失敗')
                if (error.response?.status === 401) {
                    localStorage.clear()
                    window.location.href = '/'
                }
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [currentPage, perPage])

    if (loading) return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            <Header title="用戶管理" />
            <div className="flex justify-center items-center h-full">
                <div className="text-gray-300">載入中...</div>
            </div>
        </div>
    )

    if (error) return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
            <Header title="用戶管理" />
            <div className="flex justify-center items-center h-full">
                <div className="text-red-500">錯誤: {error}</div>
            </div>
        </div>
    )

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="用戶管理" />

            {/* 統計數據卡片 */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCards 
                        name="總用戶數" 
                        icon={UserIcon} 
                        value={userStats.totalUsers.toLocaleString()} 
                        color="#6366f1" 
                    />
                    <StatCards 
                        name="活躍用戶" 
                        icon={UserCheck} 
                        value={userStats.activeUsers.toLocaleString()} 
                        color="#10b981" 
                    />
                    <StatCards 
                        name="已驗證用戶" 
                        icon={UserPlus} 
                        value={userStats.verifiedUsers.toLocaleString()} 
                        color="#f59e0b" 
                    />
                    <StatCards 
                        name="社交登入用戶" 
                        icon={UserX} 
                        value={userStats.socialUsers.toLocaleString()} 
                        color="#ef4444" 
                    />
                </motion.div>

                {/* 用戶數據表格 */}
                <UsersPageTable 
                    users={users} 
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    totalUsers={userStats.totalUsers}
                />
                
            </main>
        </div>
    )
}

export default UsersPage