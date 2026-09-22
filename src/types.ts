export type SedeId = 'mi_peru' | 'ventanilla';

export interface Sede {
  id: SedeId;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  color: string;
}

export type ProgramId = 'estimulacion' | 'prekinder' | 'refuerzo' | 'guarderia';

export type SubProgramId = 
  | 'gateadores' // 6 - 12 meses
  | 'caminantes' // 1 - 2 años
  | 'prekinder_general' // 3 - 5 años
  | 'refuerzo_inicial' // 4 - 5 años
  | 'refuerzo_primaria' // 6 - 11 años
  | 'refuerzo_secundaria' // 12 - 16 años
  | 'guarderia_medio' // Medio tiempo
  | 'guarderia_completo'; // Completo

export type SpecialCondition = 'TEA' | 'TDA' | 'TDAH' | 'Ninguna' | 'Otro';

export type Turno = 'Mañana' | 'Tarde';

export type PaymentStatus = 'al_dia' | 'proximo' | 'pendiente' | 'vencido';

export type PaymentMethod = 'Yape' | 'Plin' | 'Efectivo' | 'Transferencia BCP' | 'Transferencia BBVA' | 'Interbank';

export type MatriculaTarifa = 'General S/100' | 'Promo Mi Perú S/30' | 'Promo Especial S/20' | 'Beca Exonerada';

export type ExpenseCategory = 
  | 'profesores'
  | 'alquiler'
  | 'servicios'
  | 'materiales'
  | 'mantenimiento'
  | 'otros';

export type AdditionalIncomeCategory =
  | 'uniformes'
  | 'materiales'
  | 'talleres'
  | 'alquiler_espacio'
  | 'eventos'
  | 'certificados'
  | 'otros';

export interface AdditionalIncomeRecord {
  id: string;
  concept: string;
  category: AdditionalIncomeCategory;
  amount: number;
  date: string;
  sede: SedeId;
  paymentMethod: PaymentMethod;
  payerName: string;
  referenceNumber?: string;
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number; // in PEN S/.
  date: string; // YYYY-MM-DD
  sede: SedeId | 'ambas';
  paymentMethod: PaymentMethod;
  beneficiaryName: string; // e.g. "Lic. Andrea Salas", "Alquiler Local Sede Mi Perú", etc.
  receiptNumber?: string; // e.g. "RHE-0012", "Fac-102", "Voucher"
  notes?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  concept: string; // e.g. "Mensualidad Septiembre 2026", "Matrícula 2026"
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  receivedBy: string;
  notes?: string;
}

export interface PaymentAgreement {
  id: string;
  studentId: string;
  description: string; // e.g. "Pago fraccionado en 3 semanas"
  agreedAmount: number;
  installments: {
    week: number;
    amount: number;
    dueDate: string;
    paid: boolean;
  }[];
  status: 'en_curso' | 'completado' | 'reprogramado';
  createdAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  dni: string;
  birthDate: string; // YYYY-MM-DD
  registrationDate: string; // YYYY-MM-DD
  sede: SedeId;
  program: ProgramId;
  subProgram: SubProgramId;
  turno: Turno;
  assignedDays: string; // e.g. "Martes y Jueves", "Lunes y Miércoles", "Sábados"
  assignedTime: string; // e.g. "09:30 - 10:30 AM"
  specialConditions: SpecialCondition[];
  medicalNotes?: string;
  
  // Apoderado
  guardianName: string;
  guardianPhone: string; // Peru format
  guardianRelation: 'Mamá' | 'Papá' | 'Abuelo/a' | 'Tutor';
  guardianEmail?: string;

  // Financiero
  matriculaType: MatriculaTarifa;
  matriculaPaid: boolean;
  monthlyFee: number; // in PEN S/.
  paymentStatus: PaymentStatus;
  nextDueDate: string; // YYYY-MM-DD
  lastPaymentDate?: string;
  activeAgreement?: PaymentAgreement;
  paymentHistory?: PaymentRecord[];
  
  // Extra
  avatarColor?: string;
  notes?: string;
}

export interface ScheduleClass {
  id: string;
  program: ProgramId;
  subProgramName: string;
  sede: SedeId;
  dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  teacherName: string;
  room: string;
  maxCapacity: number;
  enrolledStudentIds: string[];
}

export interface FreeEvaluationAppointment {
  id: string;
  childName: string;
  ageText: string;
  guardianName: string;
  guardianPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // "11:00 AM"
  sede: SedeId;
  programInterest: string; // "Clase modelo de Gateadores"
  status: 'programada' | 'asistio' | 'matriculado' | 'no_asistio';
  notes?: string;
}

export type StaffRole = 
  | 'Profesora Estimulación'
  | 'Profesor/a Refuerzo'
  | 'Auxiliar de Aula'
  | 'Terapista de Lenguaje'
  | 'Psicóloga'
  | 'Secretaría / Recepción'
  | 'Mantenimiento y Limpieza'
  | 'Administrador'
  | 'Otro';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole | string;
  sede: SedeId | 'todas';
  phone: string;
  email?: string;
  salaryReference?: number;
  active: boolean;
  notes?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: 'pago' | 'evaluacion' | 'cumpleanos' | 'general';
  text: string;
  variables: string[]; // e.g. ["{nombre_alumno}", "{apoderado}", "{monto}"]
}

export interface AuthUser {
  id: string;
  username: string; // email or unique username
  name: string;
  role: 'owner' | 'admin';
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
}
