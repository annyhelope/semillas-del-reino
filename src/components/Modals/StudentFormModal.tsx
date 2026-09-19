import React, { useState, useEffect } from 'react';
import { Student, SedeId, ProgramId, SubProgramId, Turno, MatriculaTarifa, SpecialCondition } from '../../types';
import { calculateAge, recommendGroup, calculateTimeInCenter } from '../../utils/dateUtils';
import { X, Sparkles, User, Phone, MapPin, Calendar, Clock, DollarSign, Check } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  initialStudent?: Student | null;
  studentToEdit?: Student | null;
  defaultSede?: SedeId | 'todas';
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStudent,
  studentToEdit,
  defaultSede,
}) => {
  const currentStudent = studentToEdit || initialStudent;
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [birthDate, setBirthDate] = useState('2025-10-15');
  const [registrationDate, setRegistrationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sede, setSede] = useState<SedeId>(
    defaultSede && defaultSede !== 'todas' ? defaultSede : 'mi_peru'
  );
  const [program, setProgram] = useState<ProgramId>('estimulacion');
  const [subProgram, setSubProgram] = useState<SubProgramId>('gateadores');
  const [turno, setTurno] = useState<Turno>('Mañana');
  const [assignedDays, setAssignedDays] = useState('Martes y Jueves');
  const [assignedTime, setAssignedTime] = useState('10:00 - 11:00 AM');
  const [specialConditions, setSpecialConditions] = useState<SpecialCondition[]>(['Ninguna']);
  const [medicalNotes, setMedicalNotes] = useState('');

  // Apoderado
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState<'Mamá' | 'Papá' | 'Abuelo/a' | 'Tutor'>('Mamá');
  const [guardianEmail, setGuardianEmail] = useState('');

  // Financiero
  const [matriculaType, setMatriculaType] = useState<MatriculaTarifa>('Promo Mi Perú S/30');
  const [matriculaPaid, setMatriculaPaid] = useState(true);
  const [monthlyFee, setMonthlyFee] = useState<number>(160);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentStudent) {
      setFullName(currentStudent.fullName);
      setDni(currentStudent.dni);
      setBirthDate(currentStudent.birthDate);
      setRegistrationDate(currentStudent.registrationDate);
      setSede(currentStudent.sede);
      setProgram(currentStudent.program);
      setSubProgram(currentStudent.subProgram);
      setTurno(currentStudent.turno);
      setAssignedDays(currentStudent.assignedDays);
      setAssignedTime(currentStudent.assignedTime);
      setSpecialConditions(currentStudent.specialConditions || ['Ninguna']);
      setMedicalNotes(currentStudent.medicalNotes || '');
      setGuardianName(currentStudent.guardianName);
      setGuardianPhone(currentStudent.guardianPhone);
      setGuardianRelation(currentStudent.guardianRelation);
      setGuardianEmail(currentStudent.guardianEmail || '');
      setMatriculaType(currentStudent.matriculaType);
      setMatriculaPaid(currentStudent.matriculaPaid);
      setMonthlyFee(currentStudent.monthlyFee);
      setNotes(currentStudent.notes || '');
    } else {
      // Reset for new student
      setFullName('');
      setDni('');
      setBirthDate('2025-10-15');
      setRegistrationDate(new Date().toISOString().split('T')[0]);
      setSede(defaultSede && defaultSede !== 'todas' ? defaultSede : 'mi_peru');
      setProgram('estimulacion');
      setSubProgram('gateadores');
      setTurno('Mañana');
      setAssignedDays('Martes y Jueves');
      setAssignedTime('10:00 - 11:00 AM');
      setSpecialConditions(['Ninguna']);
      setMedicalNotes('');
      setGuardianName('');
      setGuardianPhone('');
      setGuardianRelation('Mamá');
      setGuardianEmail('');
      setMatriculaType('Promo Mi Perú S/30');
      setMatriculaPaid(true);
      setMonthlyFee(160);
      setNotes('');
    }
  }, [currentStudent, isOpen, defaultSede]);

  // Live calculations
  const calculatedAge = calculateAge(birthDate);
  const calculatedTimeInCenter = calculateTimeInCenter(registrationDate);
  const autoRecommendation = recommendGroup(birthDate);

  const handleApplyRecommendation = () => {
    setProgram(autoRecommendation.program);
    setSubProgram(autoRecommendation.subProgram);
    if (autoRecommendation.subProgram === 'gateadores') {
      setAssignedDays('Martes y Jueves');
      setAssignedTime('10:00 - 11:00 AM');
      setMonthlyFee(160);
    } else if (autoRecommendation.subProgram === 'caminantes') {
      setAssignedDays('Lunes y Miércoles');
      setAssignedTime('09:00 - 10:00 AM');
      setMonthlyFee(180);
    } else if (autoRecommendation.program === 'prekinder') {
      setAssignedDays('Lunes a Viernes');
      setAssignedTime('08:30 - 12:30 PM');
      setMonthlyFee(220);
    } else if (autoRecommendation.program === 'refuerzo') {
      setAssignedDays('Lunes, Miércoles y Viernes');
      setAssignedTime('03:30 - 05:00 PM');
      setTurno('Tarde');
      setMonthlyFee(150);
    }
  };

  const toggleSpecialCondition = (cond: SpecialCondition) => {
    if (cond === 'Ninguna') {
      setSpecialConditions(['Ninguna']);
      return;
    }
    const filtered = specialConditions.filter((c) => c !== 'Ninguna');
    if (filtered.includes(cond)) {
      const next = filtered.filter((c) => c !== cond);
      setSpecialConditions(next.length ? next : ['Ninguna']);
    } else {
      setSpecialConditions([...filtered, cond]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dni.trim()) {
      alert('Por favor completa el nombre completo y el DNI del alumno.');
      return;
    }

    const newOrUpdatedStudent: Student = {
      id: initialStudent ? initialStudent.id : `alu-${Date.now()}`,
      fullName: fullName.trim(),
      dni: dni.trim(),
      birthDate,
      registrationDate,
      sede,
      program,
      subProgram,
      turno,
      assignedDays,
      assignedTime,
      specialConditions,
      medicalNotes: medicalNotes.trim(),
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      guardianRelation,
      guardianEmail: guardianEmail.trim(),
      matriculaType,
      matriculaPaid,
      monthlyFee: Number(monthlyFee) || 150,
      paymentStatus: initialStudent ? initialStudent.paymentStatus : 'al_dia',
      nextDueDate: initialStudent ? initialStudent.nextDueDate : '2026-10-05',
      lastPaymentDate: initialStudent ? initialStudent.lastPaymentDate : registrationDate,
      notes: notes.trim(),
      avatarColor:
        initialStudent?.avatarColor ||
        (program === 'estimulacion'
          ? 'bg-rose-100 text-rose-700'
          : program === 'prekinder'
          ? 'bg-amber-100 text-amber-700'
          : program === 'refuerzo'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-teal-100 text-teal-700'),
    };

    onSave(newOrUpdatedStudent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs overflow-y-auto" id="student-form-modal">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#ECE5DA] w-full max-w-3xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Form Header */}
        <div className="bg-[#FAF7F2] p-5 border-b border-[#EFE8DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2A2620]">
                {initialStudent ? 'Editar Registro de Alumno' : 'Nuevo Registro de Alumno'}
              </h2>
              <p className="text-xs text-[#787064]">
                Ficha institucional de matrícula • Semillas del Reino
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Sede Selection Banner */}
          <div className="bg-[#FFFBF5] border border-amber-200/80 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-[#423C32] block">Sede Asignada para el Alumno</span>
                <span className="text-xs text-[#7A7266]">
                  Selecciona la sede donde asiste habitualmente
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSede('mi_peru')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  sede === 'mi_peru'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white text-[#574F44] border border-[#DDD5CA]'
                }`}
              >
                Sede Mi Perú
              </button>
              <button
                type="button"
                onClick={() => setSede('ventanilla')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  sede === 'ventanilla'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-white text-[#574F44] border border-[#DDD5CA]'
                }`}
              >
                Sede Ventanilla (Deporte)
              </button>
            </div>
          </div>

          {/* Section 1: Datos del Menor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EFE9DE]">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                1. Datos del Menor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Nombre Completo del Niño/a *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Liam Sebastián Gómez Castro"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white focus:border-rose-500 text-sm text-[#2C2721] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  DNI del Menor *
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="Ej. 78912345"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white focus:border-rose-500 text-sm text-[#2C2721] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white focus:border-rose-500 text-sm text-[#2C2721] outline-none"
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-rose-700 font-medium">
                    Edad calculada: {calculatedAge.text}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Fecha de Inscripción en Centro *
                </label>
                <input
                  type="date"
                  required
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white focus:border-rose-500 text-sm text-[#2C2721] outline-none"
                />
                <span className="text-xs text-[#7A7266] block mt-1">
                  Tiempo en centro: {calculatedTimeInCenter}
                </span>
              </div>
            </div>

            {/* Smart Recommendation Banner based on calculated age */}
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#0369A1]">
                <Sparkles className="w-4 h-4 shrink-0 text-cyan-600" />
                <span>
                  Sugerencia por edad: <strong>{autoRecommendation.label}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyRecommendation}
                className="bg-cyan-700 hover:bg-cyan-800 text-white font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Aplicar sugerencia
              </button>
            </div>

            {/* Special Conditions Checkboxes */}
            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1.5">
                Atención Pedagógica Especial / Neurodivergencia:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {(['Ninguna', 'TEA', 'TDA', 'TDAH', 'Otro'] as SpecialCondition[]).map((cond) => {
                  const isSelected = specialConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleSpecialCondition(cond)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? cond === 'TEA'
                            ? 'bg-blue-600 text-white'
                            : cond === 'TDA' || cond === 'TDAH'
                            ? 'bg-purple-600 text-white'
                            : 'bg-stone-800 text-white'
                          : 'bg-[#F4EFE6] text-[#554D41] hover:bg-[#EAE3D5]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{cond === 'Ninguna' ? 'Desarrollo Regular' : cond}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                Observaciones Médicas / Alergias / Indicaciones de los padres
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Alergia a ciertos alimentos, sensibilidad a ruidos, toma medicamento..."
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white focus:border-rose-500 text-xs text-[#2C2721] outline-none"
              />
            </div>
          </div>

          {/* Section 2: Datos del Apoderado */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EFE9DE]">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                2. Datos del Apoderado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Nombre del Padre, Madre o Tutor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carla Castro Ruiz"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white focus:border-rose-500 text-sm text-[#2C2721] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Parentesco *
                </label>
                <select
                  value={guardianRelation}
                  onChange={(e) =>
                    setGuardianRelation(e.target.value as 'Mamá' | 'Papá' | 'Abuelo/a' | 'Tutor')
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white focus:border-rose-500 text-sm text-[#2C2721] outline-none"
                >
                  <option value="Mamá">Mamá</option>
                  <option value="Papá">Papá</option>
                  <option value="Abuelo/a">Abuelo/a</option>
                  <option value="Tutor">Tutor / Familiar</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Teléfono de Contacto (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  placeholder="Ej. 981234567"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white focus:border-rose-500 text-sm text-[#2C2721] outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="apoderado@gmail.com"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] focus:bg-white focus:border-rose-500 text-sm text-[#2C2721] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Asignación Académica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EFE9DE]">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                3. Programa, Horario y Modalidad
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Programa Principal
                </label>
                <select
                  value={program}
                  onChange={(e) => {
                    const p = e.target.value as ProgramId;
                    setProgram(p);
                    if (p === 'estimulacion') setSubProgram('gateadores');
                    if (p === 'prekinder') setSubProgram('prekinder_general');
                    if (p === 'refuerzo') setSubProgram('refuerzo_primaria');
                    if (p === 'guarderia') setSubProgram('guarderia_medio');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none font-medium"
                >
                  <option value="estimulacion">Estimulación Temprana (Bebés)</option>
                  <option value="prekinder">Prekínder (3 a 5 años)</option>
                  <option value="refuerzo">Refuerzo Académico (Inicial / Primaria / Secundaria)</option>
                  <option value="guarderia">Guardería Infantil</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Sub-Grupo o Modalidad
                </label>
                <select
                  value={subProgram}
                  onChange={(e) => setSubProgram(e.target.value as SubProgramId)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none"
                >
                  {program === 'estimulacion' && (
                    <>
                      <option value="gateadores">Gateadores (6 - 12 meses)</option>
                      <option value="caminantes">Caminantes (1 - 2 años)</option>
                    </>
                  )}
                  {program === 'prekinder' && (
                    <option value="prekinder_general">Prekínder Aula Regular (3 a 5 años)</option>
                  )}
                  {program === 'refuerzo' && (
                    <>
                      <option value="refuerzo_inicial">Refuerzo Inicial (4 - 5 años)</option>
                      <option value="refuerzo_primaria">Refuerzo Primaria (1ro a 6to de Primaria)</option>
                      <option value="refuerzo_secundaria">Refuerzo Secundaria</option>
                    </>
                  )}
                  {program === 'guarderia' && (
                    <>
                      <option value="guarderia_medio">Guardería Medio Tiempo (Mañana)</option>
                      <option value="guarderia_completo">Guardería Tiempo Completo (Todo el día)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Días Asignados
                </label>
                <input
                  type="text"
                  value={assignedDays}
                  onChange={(e) => setAssignedDays(e.target.value)}
                  placeholder="Ej. Martes y Jueves / Lunes a Viernes"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                    Turno
                  </label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value as Turno)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none"
                  >
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                    Horario
                  </label>
                  <input
                    type="text"
                    value={assignedTime}
                    onChange={(e) => setAssignedTime(e.target.value)}
                    placeholder="10:00 - 11:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Caja y Matrícula */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EFE9DE]">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                4. Control de Matrícula y Cuota Mensual
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Tarifa de Matrícula Aplicada
                </label>
                <select
                  value={matriculaType}
                  onChange={(e) => setMatriculaType(e.target.value as MatriculaTarifa)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none font-medium"
                >
                  <option value="Promo Mi Perú S/30">Promo Mi Perú S/ 30</option>
                  <option value="Promo Especial S/20">Promo Especial S/ 20</option>
                  <option value="General S/100">Tarifa General S/ 100</option>
                  <option value="Beca Exonerada">Beca Exonerada (S/ 0)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Estado Matrícula
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="mat-paid"
                    checked={matriculaPaid}
                    onChange={(e) => setMatriculaPaid(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <label htmlFor="mat-paid" className="text-xs font-medium text-[#2E2922] cursor-pointer">
                    Matrícula ya abonada
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3D372E] block mb-1">
                  Mensualidad Acordada (S/.)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-sm text-[#2C2721] outline-none font-bold"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#EFE8DF] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-[#EBE5DB] hover:bg-[#DDD6CB] text-[#3D372E] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {initialStudent ? 'Guardar Cambios' : 'Registrar Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
