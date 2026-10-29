import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MapPin, Sprout, FlaskConical, Layers, ShoppingBag, ClipboardList } from 'lucide-react';
import { useT } from '../i18n/useT';

export const MobileTabBar: React.FC = () => {
  const { t } = useT();

  const tabs = [
    { to: '/dashboard', label: t('nav_home'), icon: Home },
    { to: '/farm', label: t('nav_farm'), icon: MapPin },
    { to: '/crops', label: t('nav_crops'), icon: Sprout },
    { to: '/make', label: t('nav_make'), icon: FlaskConical },
    { to: '/batches', label: t('nav_batches'), icon: Layers },
    { to: '/market', label: t('nav_market'), icon: ShoppingBag },
    { to: '/orders', label: t('nav_orders'), icon: ClipboardList },
  ];

  return (
    <div className="xl:hidden fixed bottom-3 inset-x-0 z-40 px-3 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto liquid-glass-pill py-2 px-3 rounded-full border border-lime/25 shadow-2xl flex items-center justify-between gap-1 max-w-lg w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-lime text-ink font-bold shadow-glow-lime'
                    : 'text-neutral-400 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 whitespace-nowrap leading-tight">
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
