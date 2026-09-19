import React from 'react';
import { LogoSemillas } from './LogoSemillas';
import { SedeId, Sede, AuthUser } from '../types';
import { INITIAL_SEDES } from '../data/initialData';
import { MapPin, Search, Calendar, ShieldCheck, LogOut, Lock } from 'lucide-react';

interface HeaderProps {
  sedes?: Sede[];
  selectedSede: SedeId | 'todas';
  onSelectSede: (sede: SedeId | 'todas') => void;
  onOpenSearch?: () => void;
  onOpenQuickSearch?: () => void;
  currentUser?: AuthUser | null;
  onOpenSecurity?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sedes = INITIAL_SEDES,
  selectedSede,
  onSelectSede,
  onOpenSearch,
  onOpenQuickSearch,
  currentUser,
  onOpenSecurity,
  onLogout,
}) => {
  const triggerSearch = onOpenSearch || onOpenQuickSearch || (() => {});
  const safeSedes = Array.isArray(sedes) && sedes.length > 0 ? sedes : INITIAL_SEDES;
  const todayFormatted = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Capitalize first letter of day
  const displayDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D7]" id="app-header">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <LogoSemillas size="md" />
            <div className="hidden sm:block border-l border-[#E2DAD0] pl-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                Plataforma Institucional
              </span>
              <p className="text-xs text-[#7A7268] mt-0.5">Semillas del Reino • Estimulación & Refuerzo</p>
            </div>
          </div>

          {/* Center: Sede Filter & Search */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Sede Selector */}
            <div className="flex items-center bg-white border border-[#E5DFD4] rounded-xl p-1 shadow-2xs">
              <MapPin className="w-4 h-4 text-[#8C8377] ml-2 hidden sm:inline" />
              <select
                id="sede-selector"
                value={selectedSede}
                onChange={(e) => onSelectSede(e.target.value as SedeId | 'todas')}
                className="text-xs md:text-sm font-medium text-[#3E3830] bg-transparent border-none py-1.5 px-2 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="todas">📍 Todas las Sedes</option>
                {safeSedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Search trigger */}
            <button
              id="header-quick-search-btn"
              onClick={triggerSearch}
              className="flex items-center gap-2 bg-white hover:bg-[#F3EFE9] text-[#635B50] hover:text-[#2E2922] border border-[#E5DFD4] px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors shadow-2xs cursor-pointer"
              title="Buscar por Nombre o DNI"
            >
              <Search className="w-4 h-4 text-rose-600" />
              <span className="hidden md:inline">Buscar alumno o DNI...</span>
              <span className="text-[10px] bg-[#EBE5DA] text-[#696156] px-1.5 py-0.5 rounded font-mono hidden lg:inline">
                Ctrl + K
              </span>
            </button>
          </div>

          {/* Right: Date Pill & User Security */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-[#5D554A] bg-white px-3 py-2 rounded-xl border border-[#E6E0D5] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-semibold">{displayDate}</span>
            </div>

            {currentUser && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {onOpenSecurity && (
                  <button
                    id="header-security-btn"
                    onClick={onOpenSecurity}
                    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title="Seguridad: Administrar las 2 cuentas autorizadas y copias de seguridad"
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-700" />
                    <span className="hidden sm:inline">
                      {currentUser.role === 'owner' ? '👑 Propietario' : '🔑 Acceso'}
                    </span>
                    <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-black hidden md:inline">
                      Privado
                    </span>
                  </button>
                )}

                {onLogout && (
                  <button
                    id="header-logout-btn"
                    onClick={() => {
                      if (window.confirm('¿Deseas cerrar la sesión y bloquear la pantalla?')) {
                        onLogout();
                      }
                    }}
                    className="p-1.5 sm:p-2 text-[#7C7365] hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                    title="Cerrar Sesión (Bloquear Sistema)"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
