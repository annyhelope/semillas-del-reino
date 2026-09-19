import { SubProgramId, ProgramId, Student } from '../types';

export function calculateAge(birthDateStr: string): { years: number; months: number; text: string } {
  if (!birthDateStr) return { years: 0, months: 0, text: 'No especificada' };
  
  const birth = new Date(birthDateStr);
  const now = new Date();
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years < 0) {
    return { years: 0, months: 0, text: 'Recién nacido' };
  }
  
  if (years === 0) {
    return { years: 0, months, text: `${months} ${months === 1 ? 'mes' : 'meses'}` };
  }
  
  if (months === 0) {
    return { years, months: 0, text: `${years} ${years === 1 ? 'año' : 'años'}` };
  }
  
  return {
    years,
    months,
    text: `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`,
  };
}

export function recommendGroup(birthDateStr: string): { program: ProgramId; subProgram: SubProgramId; label: string } {
  const { years, months } = calculateAge(birthDateStr);
  const totalMonths = years * 12 + months;
  
  if (totalMonths <= 12) {
    return {
      program: 'estimulacion',
      subProgram: 'gateadores',
      label: 'Estimulación Temprana: Gateadores (6-12m)',
    };
  }
  
  if (totalMonths <= 35) {
    return {
      program: 'estimulacion',
      subProgram: 'caminantes',
      label: 'Estimulación Temprana: Caminantes (1-2 años)',
    };
  }
  
  if (years >= 3 && years <= 5) {
    return {
      program: 'prekinder',
      subProgram: 'prekinder_general',
      label: 'Prekínder (3-5 años)',
    };
  }
  
  if (years >= 6 && years <= 11) {
    return {
      program: 'refuerzo',
      subProgram: 'refuerzo_primaria',
      label: 'Refuerzo Académico: Primaria (6-11 años)',
    };
  }
  
  return {
    program: 'refuerzo',
    subProgram: 'refuerzo_secundaria',
    label: 'Refuerzo Académico: Secundaria (12+ años)',
  };
}

export function calculateTimeInCenter(registrationDateStr: string): string {
  if (!registrationDateStr) return 'Reciente';
  const reg = new Date(registrationDateStr);
  const now = new Date();
  
  let months = (now.getFullYear() - reg.getFullYear()) * 12 + (now.getMonth() - reg.getMonth());
  if (now.getDate() < reg.getDate()) months--;
  
  if (months <= 0) return 'Nuevo ingreso (este mes)';
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }
  return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
}

export function formatSoles(amount?: number | string | null): string {
  if (amount === undefined || amount === null) return 'S/ 0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num)) return 'S/ 0.00';
  return `S/ ${num.toFixed(2)}`;
}

export function getCleanPhone(phone?: string | null): string {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

export function generateWhatsAppUrl(phone?: string | null, message: string = ''): string {
  const clean = getCleanPhone(phone);
  if (!clean) return '#';
  // Default to Peru +51 if 9 digits
  const fullPhone = clean.length === 9 ? `51${clean}` : clean;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

export function isUpcomingBirthday(birthDateStr: string): { isThisMonth: boolean; daysRemaining: number } {
  if (!birthDateStr) return { isThisMonth: false, daysRemaining: -1 };
  const birth = new Date(birthDateStr);
  const now = new Date();
  
  const thisYearBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  const diffTime = thisYearBirthday.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isThisMonth = birth.getMonth() === now.getMonth();
  return { isThisMonth, daysRemaining: diffDays };
}

export function getUpcomingBirthdays(students: Student[] = []): { student: Student; daysRemaining: number }[] {
  if (!Array.isArray(students) || students.length === 0) return [];
  return students
    .map((s) => {
      const bday = isUpcomingBirthday(s.birthDate);
      return {
        student: s,
        isThisMonth: bday.isThisMonth,
        daysRemaining: bday.daysRemaining,
      };
    })
    .filter((b) => b.isThisMonth && b.daysRemaining >= 0 && b.daysRemaining <= 31)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .map(({ student, daysRemaining }) => ({ student, daysRemaining }));
}
