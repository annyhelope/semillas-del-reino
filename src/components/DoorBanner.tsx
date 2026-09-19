import React from 'react';
import { ArrowLeft, ChevronRight, Home, Calendar, Users, BookOpen, Wallet, Settings } from 'lucide-react';
import { NavTab } from './Navigation';

interface DoorBannerProps {
  doorNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  onBackToHall: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

const MODULE_NAMES: Record<number, { tag: string; name: string }> = {
  1: { tag: 'Módulo Agenda', name: 'Agenda y Citas' },
  2: { tag: 'Módulo Alumnos', name: 'Alumnos y Matrículas' },
  3: { tag: 'Módulo Aulas', name: 'Aulas y Horarios' },
  4: { tag: 'Módulo Caja', name: 'Caja y Cobranzas' },
  5: { tag: 'Módulo Dirección', name: 'Dirección y Sedes' },
};

const MODULES_LIST: { id: NavTab; num: 1 | 2 | 3 | 4 | 5; name: string; icon: React.ElementType }[] = [
  { id: 'agenda', num: 1, name: 'Agenda', icon: Calendar },
  { id: 'students', num: 2, name: 'Alumnos', icon: Users },
  { id: 'academic', num: 3, name: 'Aulas', icon: BookOpen },
  { id: 'payments', num: 4, name: 'Caja', icon: Wallet },
  { id: 'settings', num: 5, name: 'Dirección', icon: Settings },
];

export const DoorBanner: React.FC<DoorBannerProps> = ({
  doorNumber,
  title,
  subtitle,
  onBackToHall,
  onNavigateTab,
}) => {
  const currentModule = MODULE_NAMES[doorNumber] || { tag: 'Módulo', name: title };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 sm:p-5 mb-6 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left side: Back to Dashboard & Module Info */}
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={onBackToHall}
            id="btn-back-to-panel"
            className="flex items-center gap-1.5 text-xs font-bold text-[#6D6558] hover:text-[#25201A] bg-[#F7F3EC] hover:bg-[#EFE8DC] border border-[#E3DCCE] px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0"
            title="Volver al Panel Principal"
          >
            <ArrowLeft className="w-4 h-4 text-rose-700" />
            <span className="hidden sm:inline">← Volver al Panel</span>
            <span className="sm:hidden">Panel</span>
          </button>

          <div className="border-l border-[#EDE6DC] pl-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-rose-200">
                {currentModule.tag}
              </span>
              <span className="text-xs text-[#8A8174] font-medium hidden md:inline">
                Sección organizada e independiente
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[#26211B] mt-0.5 tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-[#736A5E] mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right side: Module switcher tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none self-start lg:self-auto border-t lg:border-t-0 pt-2 lg:pt-0 border-[#F0EAE0]">
          <button
            onClick={onBackToHall}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#7A7164] hover:bg-[#F6F1EA] transition-colors cursor-pointer"
            title="Ir al Panel Principal"
          >
            <Home className="w-3.5 h-3.5 text-[#8A8072]" />
            <span className="hidden xl:inline">Inicio</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-[#C4BCB0] shrink-0" />

          {MODULES_LIST.map((mod) => {
            const Icon = mod.icon;
            const isCurrent = mod.num === doorNumber;
            return (
              <button
                key={mod.id}
                onClick={() => onNavigateTab(mod.id)}
                id={`module-switch-${mod.id}`}
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-[#665E52] hover:text-[#25201A] hover:bg-[#F6F1EA]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mod.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
