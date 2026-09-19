import React from 'react';
import { LayoutGrid, Calendar, Users, BookOpen, Wallet, Receipt, Settings } from 'lucide-react';

export type NavTab = 'dashboard' | 'agenda' | 'students' | 'academic' | 'payments' | 'expenses' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onChangeTab?: (tab: NavTab) => void;
  onTabChange?: (tab: NavTab) => void;
  pendingPaymentsCount?: number;
  evaluationsCount?: number;
  studentsCount?: number;
  expensesCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  onTabChange,
  pendingPaymentsCount = 0,
  evaluationsCount = 0,
  studentsCount = 0,
  expensesCount = 0,
}) => {
  const handleTabChange = (tab: NavTab) => {
    if (onChangeTab) onChangeTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Panel Principal',
      shortLabel: 'Inicio',
      icon: LayoutGrid,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'agenda' as NavTab,
      label: 'Agenda y Citas',
      shortLabel: 'Agenda',
      icon: Calendar,
      badge: evaluationsCount > 0 ? evaluationsCount : null,
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'students' as NavTab,
      label: 'Alumnos y Matrículas',
      shortLabel: 'Alumnos',
      icon: Users,
      badge: studentsCount > 0 ? studentsCount : null,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200',
    },
    {
      id: 'academic' as NavTab,
      label: 'Aulas y Horarios',
      shortLabel: 'Aulas',
      icon: BookOpen,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'payments' as NavTab,
      label: 'Caja y Cobranzas',
      shortLabel: 'Caja',
      icon: Wallet,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'expenses' as NavTab,
      label: 'Gastos y Planilla',
      shortLabel: 'Gastos',
      icon: Receipt,
      badge: expensesCount > 0 ? expensesCount : null,
      badgeColor: 'bg-amber-700 text-white',
    },
    {
      id: 'settings' as NavTab,
      label: 'Dirección y Sedes',
      shortLabel: 'Dirección',
      icon: Settings,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <nav className="bg-white border-b border-[#ECE6DC] sticky top-20 z-20 shadow-2xs" id="main-navigation">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm font-extrabold'
                    : 'text-[#645C4F] hover:text-[#201C17] hover:bg-[#F6F2EC]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-white scale-110' : 'text-[#857B6E]'
                  }`}
                />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.shortLabel}</span>

                {item.badge !== null && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none ${
                      isActive ? 'bg-white text-rose-700' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
