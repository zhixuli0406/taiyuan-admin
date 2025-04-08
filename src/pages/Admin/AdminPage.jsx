import { motion } from 'framer-motion'
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

import Header from '../../components/common_components/Header'
import StatCards from '../../components/common_components/StatCards'
import AdminTable from '../../components/admin/AdminTable'
import { adminApi } from '../../core/api'

const AdminPage = () => {
    const [adminStats, setAdminStats] = useState({
        totalAdmins: "0",
        superAdmins: "0",
    })

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await adminApi.getAll()
                const admins = response.admins || []
                setAdminStats({
                    totalAdmins: admins.length.toString(),
                    superAdmins: admins.filter(a => a.role === 'SuperAdmin').length.toString(),
                })
            } catch (error) {
                console.error('獲取管理員數據失敗:', error)
                toast.error(error.response?.data?.message || '獲取管理員數據失敗')
                if (error.response?.status === 401) {
                    localStorage.clear()
                    window.location.href = '/'
                }
            }
        }

        fetchAdmins()
    }, [])

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="管理員管理" />
            
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCards name="總管理員數" icon={Users} value={adminStats.totalAdmins} color="#6366f1" />
                    <StatCards name="超級管理員" icon={UserCheck} value={adminStats.superAdmins} color="#10b981" />
                </motion.div>

                <AdminTable />
            </main>
        </div>
    )
}

export default AdminPage 