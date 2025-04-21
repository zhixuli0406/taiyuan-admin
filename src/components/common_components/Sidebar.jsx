import { useEffect, useState } from "react";
import { BarChart2, Settings, ShoppingBag, ShoppingCart, Users, Menu, ChartBarStacked, Image, Truck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const SIDEBAR_ITEMS = [
    { name: "總覽", icon: BarChart2, color: "#8B5CF6", href: "/" },
    { name: "產品", icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
    { name: "分類", icon: ChartBarStacked, color: "#8B5CF6", href: "/categories" },
    { name: "客戶", icon: Users, color: "#8B5CF6", href: "/users" },
    { name: "訂單", icon: ShoppingCart, color: "#8B5CF6", href: "/orders" },
    { name: "圖片", icon: Image, color: "#8B5CF6", href: "/images" },
    { name: "運輸方式", icon: Truck, color: "#8B5CF6", href: "/transport" },
    { name: "管理員", icon: Users, color: "#8B5CF6", href: "/admin" },
    { name: "設定", icon: Settings, color: "#8B5CF6", href: "/settings" },
];

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false); // State to track mobile devices

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");

        const handleMediaQueryChange = (e) => {
            setIsMobile(e.matches);
            setIsSidebarOpen(!e.matches);
        };

        handleMediaQueryChange(mediaQuery);
        mediaQuery.addEventListener("change", handleMediaQueryChange);

        return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
    }, []);

    return (
        <>
            <motion.div
                className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
                animate={{ width: isSidebarOpen ? 220 : 80 }}
            >
                <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
                    <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
                        disabled={isMobile} // Disable button on mobile devices
                    >
                        <Menu size={26} />
                    </motion.button>

                    <nav className="mt-8 flex-grow">
                        {SIDEBAR_ITEMS.map((item) => (
                            <Link key={item.href} to={item.href}>
                                <motion.div
                                    className="flex items-center font-medium p-4 mb-2 text-sm rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                                    <AnimatePresence>
                                        {isSidebarOpen && (
                                            <motion.span
                                                className="ml-4 whitespace-nowrap"
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2, delay: 0.3 }}
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        ))}
                    </nav>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
