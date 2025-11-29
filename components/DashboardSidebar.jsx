'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TbLayoutSidebarRightCollapse, TbLayoutSidebarLeftCollapse } from 'react-icons/tb';
import { FaHome } from 'react-icons/fa';
import { MdManageAccounts } from 'react-icons/md';
import { HiMiniUsers } from 'react-icons/hi2';
import { FaCartShopping } from 'react-icons/fa6';
import { LuPackageSearch } from 'react-icons/lu';
import { MdOutlineRateReview } from 'react-icons/md';
import { IoNotifications } from 'react-icons/io5';
import { GiClothes } from "react-icons/gi";
import { FaHeart } from "react-icons/fa";
import { IoStar } from "react-icons/io5";
import { MdImage } from "react-icons/md";
import { useLanguage } from "@/context/LanguageContext";


const DashboardSidebar = ({ isCollapsed, toggleSidebar }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { translations } = useLanguage();

  const allMenuItems = [
    { href: '/dashboard', label: translations.dashboard, icon: FaHome, roles: ['admin', 'user'] },
    { href: '/dashboard/account', label: translations.userSettings, icon: MdManageAccounts, roles: ['admin', 'user'] },
    { href: '/dashboard/users', label: translations.users, icon: HiMiniUsers, roles: ['admin'] },
    { href: '/dashboard/cart', label: translations.cart, icon: FaCartShopping, roles: [ 'user'] },
    { href: '/dashboard/collections', label: translations.collections, icon: GiClothes, roles: [ 'admin'] },
    { href: '/dashboard/hero', label: 'Hero Section', icon: MdImage, roles: ['admin'] },
    { href: '/dashboard/orders', label: translations.orders, icon: LuPackageSearch, roles: ['admin', 'user'] },
    { href: '/dashboard/likes', label: translations.likes, icon: FaHeart, roles: ['user'] },
    { href: '/dashboard/reviews', label: translations.reviews, icon: MdOutlineRateReview, roles: ['admin', 'user'] },
    { href: '/dashboard/notifications', label: translations.notifications, icon: IoNotifications, roles: ['admin', 'user'] },
  ];

  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(session?.user?.role || 'user')
  );

  return (
    <div className={`bg-white shadow-lg fixed left-0 top-24 bottom-0 transition-all duration-300 flex flex-col z-40 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header  */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b h-16">
        {!isCollapsed && (
          <h2 className="text-xl font-semibold text-gray-800">{translations.dashboard}</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <TbLayoutSidebarLeftCollapse className="w-5 h-5 text-gray-600" />
          ) : (
            <TbLayoutSidebarRightCollapse className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto p-4 space-y-2 sidebar-scroll"
        tabIndex={0}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center p-3 rounded-lg transition-colors group ${
                isActive
                  ? 'bg-blue-50 text-gray-700 border border-gray-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon
                className={`flex-shrink-0 ${
                  isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
                }`}
              />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}

              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardSidebar;