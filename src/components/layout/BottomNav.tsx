import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Plus, List, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dasbor' },
    { to: '/add', icon: Plus, label: 'Tambah', isLarge: true },
    { to: '/history', icon: List, label: 'Riwayat' },
    { to: '/settings', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="max-width-[480px] mx-auto h-16 flex items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  'flex flex-col items-center justify-center transition-colors',
                  isActive ? 'text-indigo-600' : 'text-gray-400',
                  item.isLarge && 'relative -top-3'
                )
              )
            }
          >
            {item.isLarge ? (
              <div className="bg-indigo-600 p-3 rounded-full text-white shadow-lg active:scale-95 transition-transform">
                <item.icon size={28} />
              </div>
            ) : (
              <>
                <item.icon size={22} />
                <span className="text-[10px] sm:text-xs mt-1 font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
