import { useEffect, useState } from 'react'
import Header from '../components/common_components/Header'
import AnalyticsStatCards from '../components/analytics/AnalyticsStatCards'
import RevenueChart from '../components/analytics/RevenueChart'
import ChannelPerformance from '../components/analytics/ChannelPerformance'
import ProductPerformance from '../components/analytics/ProductPerformance'
import UserRetention from '../components/analytics/UserRetention'
import CustomerSegmentation from '../components/analytics/CustomerSegmentation'
import AIPoweredInsights from '../components/analytics/AIPoweredInsights'
import analyticsApi from '../core/api/analytics'

const AnalyticsPage = () => {
    const [overview, setOverview] = useState(null)
    const [dailyOrders, setDailyOrders] = useState([])
    const [statusDistribution, setStatusDistribution] = useState(null)
    const [revenue, setRevenue] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [customerStats, setCustomerStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date()
                const thirtyDaysAgo = new Date(today)
                thirtyDaysAgo.setDate(today.getDate() - 30)

                const [
                    overviewData,
                    ordersData,
                    statusData,
                    revenueData,
                    productsData,
                    customerData
                ] = await Promise.all([
                    analyticsApi.getOverview(),
                    analyticsApi.getDailyOrders(thirtyDaysAgo, today),
                    analyticsApi.getStatusDistribution(),
                    analyticsApi.getRevenue(thirtyDaysAgo, today),
                    analyticsApi.getTopProducts(),
                    analyticsApi.getCustomerStats()
                ])

                setOverview(overviewData)
                setDailyOrders(ordersData)
                setStatusDistribution(statusData)
                setRevenue(revenueData)
                setTopProducts(productsData)
                setCustomerStats(customerData)
            } catch (error) {
                console.error('Error fetching analytics data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="Analytics Dashboard" />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <AnalyticsStatCards 
                    overview={overview}
                    statusDistribution={statusDistribution}
                />

                <RevenueChart 
                    revenueData={revenue}
                    dailyOrders={dailyOrders}
                />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7'>
                    <ChannelPerformance
                        statusDistribution={statusDistribution}
                    />
                    <ProductPerformance 
                        topProducts={topProducts}
                    />
                    <UserRetention 
                        customerStats={customerStats}
                    />
                    <CustomerSegmentation
                        customerStats={customerStats}
                    />
                </div>

                <AIPoweredInsights 
                    overview={overview}
                    revenueData={revenue}
                    topProducts={topProducts}
                />
            </main>
        </div>
    )
}

export default AnalyticsPage