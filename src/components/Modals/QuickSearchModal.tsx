import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../../types';
import { calculateAge, formatSoles, generateWhatsAppUrl } from '../../utils/dateUtils';
import { Search, X, MessageCircle, DollarSign, User, ArrowRight } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  students?: Student[];
  onSelectStudent: (student: Student) => void;
  onOpenPaymentForStudent?: (student: Student) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  students = [],
  onSelectStudent,
  onOpenPaymentForStudent,
}) => {
  const safeStudents = Array.isArray(students) ? students : [];
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredStudents = safeStudents.filter((s) => {
    const q = query.toLowerCase().trim();
    if (!q) return false;
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.dni.includes(q) ||
      s.guardianName.toLowerCase().includes(q) ||
      s.guardianPhone.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/45 backdrop-blur-xs" id="quick-search-modal">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E8E1D5] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#EFE9DF] bg-[#FAF7F2]">
          <Search className="w-5 h-5 text-rose-600 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="quick-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por DNI, nombre del alumno o teléfono del apoderado..."
            className="w-full bg-transparent text-base text-[#2E2A24] placeholder-[#8F877B] outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#989083] hover:text-[#423C33] p-1 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-[#ECE5DB] text-[#696155] px-2 py-1 rounded-md font-mono hover:bg-[#DFD7CC]"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {!query.trim() && (
            <div className="text-center py-8 text-[#7D7569]">
              <p className="text-sm font-medium">Comienza a escribir para buscar en el sistema</p>
              <p className="text-xs text-[#9E9588] mt-1">
                Puedes buscar por: DNI (ej. 78912345), Nombre (ej. Liam, Sofía), o Apoderado.
              </p>
            </div>
          )}

          {query.trim() && filteredStudents.length === 0 && (
            <div className="text-center py-8 text-[#7D7569]">
              <p className="text-sm font-medium">No se encontraron alumnos con "{query}"</p>
              <p className="text-xs text-[#9E9588] mt-1">
                Verifica el DNI o intenta con el primer nombre del alumno.
              </p>
            </div>
          )}

          {filteredStudents.map((student) => {
            const ageInfo = calculateAge(student.birthDate);
            const statusBg =
              student.paymentStatus === 'al_dia'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : student.paymentStatus === 'proximo'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';

            const statusText =
              student.paymentStatus === 'al_dia'
                ? '🟢 Al día'
                : student.paymentStatus === 'proximo'
                ? '🟡 Próximo'
                : '🔴 Pendiente';

            const waMsg = `Estimada ${student.guardianName}, le saludamos de Semillas del Reino. Nos comunicamos sobre ${student.fullName}.`;
            const waUrl = generateWhatsAppUrl(student.guardianPhone, waMsg);

            return (
              <div
                key={student.id}
                id={`search-result-${student.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-[#ECE5DB] hover:border-rose-300 hover:bg-[#FDFBF7] transition-colors gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${student.avatarColor || 'bg-rose-100 text-rose-700'}`}
                  >
                    {student.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#2D2821]">
                        {student.fullName}
                      </span>
                      <span className="text-xs bg-[#EFE9DE] text-[#696155] px-2 py-0.5 rounded font-mono">
                        DNI: {student.dni}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusBg}`}>
                        {statusText}
                      </span>
                    </div>
                    <div className="text-xs text-[#70685D] mt-1 flex items-center gap-2 flex-wrap">
                      <span>👶 {ageInfo.text}</span>
                      <span>•</span>
                      <span>📍 {student.sede === 'mi_peru' ? 'Sede Mi Perú' : 'Sede Ventanilla'}</span>
                      <span>•</span>
                      <span>
                        Apoderado: {student.guardianName} ({student.guardianRelation})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Enviar WhatsApp al apoderado"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      if (onOpenPaymentForStudent) {
                        onOpenPaymentForStudent(student);
                      } else {
                        onSelectStudent(student);
                      }
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                    title="Registrar pago"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Pago</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectStudent(student);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    <span>Ficha</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#FAF7F2] border-t border-[#EFE9DF] text-[11px] text-[#867E72] flex justify-between items-center">
          <span>Semillas del Reino • Búsqueda rápida de registros</span>
          <span>Doble clic o ESC para salir</span>
        </div>
      </div>
    </div>
  );
};
