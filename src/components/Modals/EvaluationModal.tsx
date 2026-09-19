import React, { useState } from 'react';
import { FreeEvaluationAppointment, SedeId } from '../../types';
import { Sparkles, X, Calendar, Clock, MapPin, User, Phone } from 'lucide-react';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evalAppt: FreeEvaluationAppointment) => void;
  defaultSede?: SedeId | 'todas';
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultSede,
}) => {
  const [childName, setChildName] = useState('');
  const [ageText, setAgeText] = useState('10 meses');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00 AM');
  const [sede, setSede] = useState<SedeId>(
    defaultSede && defaultSede !== 'todas' ? defaultSede : 'mi_peru'
  );
  const [programInterest, setProgramInterest] = useState('Clase modelo de Gateadores (6-12m)');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !guardianName.trim() || !guardianPhone.trim()) {
      alert('Por favor completa los datos del menor y del apoderado.');
      return;
    }

    const newAppt: FreeEvaluationAppointment = {
      id: `eval-${Date.now()}`,
      childName: childName.trim(),
      ageText: ageText.trim(),
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      date,
      time,
      sede,
      programInterest,
      status: 'programada',
      notes: notes.trim(),
    };

    onSave(newAppt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs" id="evaluation-modal">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#ECE5DA] w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#FAF7F2] p-5 border-b border-[#EFE8DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2A2620]">Agendar Clase Modelo / Evaluación</h2>
              <p className="text-xs text-[#787064]">
                Evaluación gratuita para nuevos postulantes • Semillas del Reino
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#999184] hover:text-[#332E27] p-1.5 rounded-lg hover:bg-[#EFE9DE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                Nombre del Menor *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Gael Silva Morales"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                Edad o Meses del Bebé *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 10 meses / 4 años"
                value={ageText}
                onChange={(e) => setAgeText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                Nombre del Apoderado *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Roxana Morales"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                WhatsApp del Apoderado *
              </label>
              <input
                type="tel"
                required
                placeholder="Ej. 987112233"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">Sede *</label>
              <select
                value={sede}
                onChange={(e) => setSede(e.target.value as SedeId)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs font-medium outline-none"
              >
                <option value="mi_peru">Mi Perú</option>
                <option value="ventanilla">Ventanilla (Deporte)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">Fecha *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">Hora *</label>
              <input
                type="text"
                placeholder="11:00 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#3D372E] block mb-1">
              Programa / Taller de Interés *
            </label>
            <select
              value={programInterest}
              onChange={(e) => setProgramInterest(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm outline-none font-medium"
            >
              <option value="Clase modelo de Gateadores (6-12m)">Clase modelo de Gateadores (6-12m)</option>
              <option value="Clase modelo de Caminantes (1-2 años)">Clase modelo de Caminantes (1-2 años)</option>
              <option value="Evaluación Prekínder (3-5 años)">Evaluación Prekínder (3-5 años)</option>
              <option value="Evaluación de Refuerzo Académico (Lectura y Matemáticas)">
                Evaluación de Refuerzo Académico (Lectura y Matemáticas)
              </option>
              <option value="Visita guiada Guardería Infantil">Visita guiada Guardería Infantil</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#3D372E] block mb-1">Notas de la Cita</label>
            <textarea
              rows={2}
              placeholder="Ej. La mamá consultó por motricidad fina, asistir con ropa cómoda..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-xs outline-none"
            />
          </div>

          <div className="pt-4 border-t border-[#EFE8DF] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-[#EBE5DB] hover:bg-[#DDD6CB] text-[#3D372E] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Guardar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
