import { Sede, Student, ScheduleClass, FreeEvaluationAppointment, StaffMember, PaymentRecord, NotificationTemplate, ExpenseRecord } from '../types';

export const INITIAL_SEDES: Sede[] = [
  {
    id: 'mi_peru',
    name: 'Sede Principal (Mi Perú)',
    shortName: 'Mi Perú',
    address: 'Av. Trujillo Mz. B Lt. 14, Distrito de Mi Perú, Callao',
    phone: '987 654 321',
    color: '#E6007A',
  },
  {
    id: 'ventanilla',
    name: 'Sede Ventanilla (Deporte)',
    shortName: 'Ventanilla',
    address: 'Calle Los Cedros s/n, Urb. Antonia Moreno de Cáceres (Ciudad del Deporte)',
    phone: '976 543 210',
    color: '#0891B2',
  },
];

// Lista limpia de alumnos lista para el ingreso de información real por el usuario
export const INITIAL_STUDENTS: Student[] = [];

// Evaluaciones gratuitas limpias
export const INITIAL_EVALUATIONS: FreeEvaluationAppointment[] = [];

// Aulas y Horarios de referencia listos para recibir alumnos reales
export const INITIAL_CLASSES: ScheduleClass[] = [
  {
    id: 'cls-001',
    program: 'estimulacion',
    subProgramName: 'Gateadores (6 - 12 meses)',
    sede: 'mi_peru',
    dayOfWeek: 'Martes',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    teacherName: 'Lic. Andrea Salas',
    room: 'Sala Sensorial Arcoíris',
    maxCapacity: 8,
    enrolledStudentIds: [],
  },
  {
    id: 'cls-002',
    program: 'estimulacion',
    subProgramName: 'Gateadores (6 - 12 meses)',
    sede: 'mi_peru',
    dayOfWeek: 'Jueves',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    teacherName: 'Lic. Andrea Salas',
    room: 'Sala Sensorial Arcoíris',
    maxCapacity: 8,
    enrolledStudentIds: [],
  },
  {
    id: 'cls-003',
    program: 'estimulacion',
    subProgramName: 'Caminantes (1 - 2 años)',
    sede: 'ventanilla',
    dayOfWeek: 'Lunes',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    teacherName: 'Lic. Nicole Cabrera',
    room: 'Aula Psicomotriz',
    maxCapacity: 8,
    enrolledStudentIds: [],
  },
  {
    id: 'cls-004',
    program: 'prekinder',
    subProgramName: 'Prekínder (3 a 5 años)',
    sede: 'mi_peru',
    dayOfWeek: 'Lunes',
    startTime: '08:30 AM',
    endTime: '12:30 PM',
    teacherName: 'Prof. Gladys Espinoza',
    room: 'Aula Prekínder Amarilla',
    maxCapacity: 12,
    enrolledStudentIds: [],
  },
  {
    id: 'cls-005',
    program: 'refuerzo',
    subProgramName: 'Refuerzo Primaria (Atención Especial y Regular)',
    sede: 'mi_peru',
    dayOfWeek: 'Lunes',
    startTime: '03:30 PM',
    endTime: '05:00 PM',
    teacherName: 'Lic. Rosa Morales (Psicopedagoga)',
    room: 'Aula de Aprendizaje 1',
    maxCapacity: 6,
    enrolledStudentIds: [],
  },
  {
    id: 'cls-006',
    program: 'refuerzo',
    subProgramName: 'Refuerzo Primaria (Atención TDAH y Lectura)',
    sede: 'ventanilla',
    dayOfWeek: 'Martes',
    startTime: '04:00 PM',
    endTime: '05:30 PM',
    teacherName: 'Prof. Carlos Huamán',
    room: 'Sala de Estudio Ventanilla',
    maxCapacity: 6,
    enrolledStudentIds: [],
  },
  {
    id: 'cls-007',
    program: 'guarderia',
    subProgramName: 'Guardería Infantil (Medio y Completo)',
    sede: 'mi_peru',
    dayOfWeek: 'Lunes',
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    teacherName: 'Aux. Miriam Paredes',
    room: 'Espacio Guardería & Descanso',
    maxCapacity: 10,
    enrolledStudentIds: [],
  },
  {
    id: 'cls-008',
    program: 'guarderia',
    subProgramName: 'Guardería Infantil (Medio Tiempo)',
    sede: 'ventanilla',
    dayOfWeek: 'Lunes',
    startTime: '08:30 AM',
    endTime: '01:00 PM',
    teacherName: 'Aux. Lucía Benítez',
    room: 'Módulo Guardería Ventanilla',
    maxCapacity: 8,
    enrolledStudentIds: [],
  },
];

// Historial limpio de pagos listo para emitir los comprobantes reales
export const INITIAL_PAYMENTS: PaymentRecord[] = [];

// Historial limpio de gastos institucionales (alquiler, profesoras, servicios)
export const INITIAL_EXPENSES: ExpenseRecord[] = [];

// Las dos profesoras actuales del centro
export const DEFAULT_ACTIVE_TEACHERS = [
  { id: 'prof-01', name: 'Lic. Andrea Salas (Estimulación Temprana)', defaultSubject: 'Estimulación y Psicomotricidad', sede: 'mi_peru' as const },
  { id: 'prof-02', name: 'Lic. Rosa Morales (Refuerzo y Primaria)', defaultSubject: 'Refuerzo Escolar y TDAH', sede: 'mi_peru' as const },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf-001',
    name: 'Directora General / Dirección',
    role: 'Administrador',
    sede: 'todas',
    phone: '987 000 111',
    email: 'direccion@semillasdelreino.pe',
    active: true,
  },
  {
    id: 'stf-002',
    name: 'Lic. Andrea Salas (Docente 1)',
    role: 'Profesora Estimulación',
    sede: 'mi_peru',
    phone: '991 223 344',
    email: 'andrea.salas@semillasdelreino.pe',
    active: true,
  },
  {
    id: 'stf-003',
    name: 'Lic. Rosa Morales (Docente 2)',
    role: 'Profesor/a Refuerzo',
    sede: 'mi_peru',
    phone: '992 334 455',
    email: 'rosa.morales@semillasdelreino.pe',
    active: true,
  },
];

export const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Recordatorio Amable de Pago',
    category: 'pago',
    variables: ['{apoderado}', '{nombre_alumno}', '{monto}', '{fecha_vencimiento}'],
    text: `¡Hola {apoderado}! 🌈 Le saludamos con mucho cariño desde *Semillas del Reino*. Le recordamos amablemente que la cuota de {nombre_alumno} por un monto de S/ {monto} vence el próximo {fecha_vencimiento}. Puede realizar su abono por Yape, Plin o Transferencia y enviarnos su constancia. ¡Muchas gracias por confiar en la educación de su pequeño/a! ❤️🌱`,
  },
  {
    id: 'tpl-002',
    name: 'Aviso de Cuota Pendiente / Vencida',
    category: 'pago',
    variables: ['{apoderado}', '{nombre_alumno}', '{monto}'],
    text: `Estimada familia de {nombre_alumno}: 🌸 Les escribimos de *Semillas del Reino* para consultarles con mucho respeto sobre la cuota pendiente de S/ {monto}. Si necesitan coordinar una facilidad de pago o fraccionamiento, por favor comuníquense con nosotros para brindarles todo el apoyo. ¡Que tengan un bendecido día! ✨`,
  },
  {
    id: 'tpl-003',
    name: 'Confirmación y Agradecimiento de Pago',
    category: 'pago',
    variables: ['{apoderado}', '{nombre_alumno}', '{monto}', '{concepto}'],
    text: `¡Pago recibido con éxito! ✅ Muchas gracias estimado/a {apoderado}. Hemos registrado el abono de S/ {monto} por concepto de *{concepto}* para {nombre_alumno}. ¡Seguimos trabajando con mucho amor en su desarrollo en *Semillas del Reino*! 🎈`,
  },
  {
    id: 'tpl-004',
    name: 'Invitación / Confirmación de Clase Modelo Gratuita',
    category: 'evaluacion',
    variables: ['{apoderado}', '{nombre_alumno}', '{fecha}', '{hora}', '{sede}'],
    text: `¡Bienvenido a la familia de *Semillas del Reino*! 🌈 Confirmamos la clase modelo y evaluación gratuita para el/la pequeño/a {nombre_alumno} el día {fecha} a las {hora} en nuestra {sede}. Por favor asistir con ropa cómoda. ¡Les esperamos con los brazos abiertos! 🥰🌱`,
  },
  {
    id: 'tpl-005',
    name: 'Felicitación de Cumpleaños',
    category: 'cumpleanos',
    variables: ['{apoderado}', '{nombre_alumno}'],
    text: `¡Feliz Cumpleaños {nombre_alumno}! 🎂🎈🎉 Toda la familia de *Semillas del Reino* te envía un fuerte abrazo lleno de amor y bendiciones en tu día especial. ¡Que Dios guíe siempre tus pasitos y sigas floreciendo cada día! ✨`,
  },
];
