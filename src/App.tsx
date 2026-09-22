import React, { useState, useEffect } from 'react';
import { 
  Student, 
  SedeId, 
  PaymentRecord, 
  ExpenseRecord,
  AdditionalIncomeRecord,
  FreeEvaluationAppointment, 
  ScheduleClass, 
  StaffMember, 
  NotificationTemplate,
  PaymentAgreement
} from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_SEDES, 
  INITIAL_CLASSES, 
  INITIAL_PAYMENTS, 
  INITIAL_EXPENSES,
  INITIAL_STAFF, 
  INITIAL_EVALUATIONS, 
  INITIAL_TEMPLATES 
} from './data/initialData';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { AgendaModule } from './components/AgendaModule';
import { StudentsModule } from './components/StudentsModule';
import { AcademicModule } from './components/AcademicModule';
import { PaymentsModule } from './components/PaymentsModule';
import { ExpensesModule } from './components/ExpensesModule';
import { SettingsModule } from './components/SettingsModule';
import { QuickSearchModal } from './components/Modals/QuickSearchModal';
import { StudentDetailModal } from './components/Modals/StudentDetailModal';
import { StudentFormModal } from './components/Modals/StudentFormModal';
import { PaymentModal } from './components/Modals/PaymentModal';
import { ReceiptModal } from './components/Modals/ReceiptModal';
import { EvaluationModal } from './components/Modals/EvaluationModal';
import { ScheduleClassModal } from './components/Modals/ScheduleClassModal';
import { StaffManagementModal } from './components/Modals/StaffManagementModal';
import { SecurityModal } from './components/Modals/SecurityModal';
import { AdditionalTransactionModal } from './components/Modals/AdditionalTransactionModal';
import { LoginScreen } from './components/Auth/LoginScreen';
import { AuthUser } from './types';
import { getCurrentSession, saveCurrentSession } from './utils/authUtils';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => {
  // Authentication & Private Access Control
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentSession());
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Navigation & Sede selection
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedSede, setSelectedSede] = useState<SedeId | 'todas'>('todas');

  // Persistence in LocalStorage - Pure, safe persistence that never wipes user data
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('semillas_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('semillas_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [additionalIncomes, setAdditionalIncomes] = useState<AdditionalIncomeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('semillas_additional_incomes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [evaluations, setEvaluations] = useState<FreeEvaluationAppointment[]>(() => {
    try {
      const saved = localStorage.getItem('semillas_evaluations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('semillas_expenses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [classes, setClasses] = useState<ScheduleClass[]>(() => {
    try {
      const saved = localStorage.getItem('semillas_classes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('semillas_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [templates, setTemplates] = useState<NotificationTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('semillas_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_TEMPLATES;
    } catch {
      return INITIAL_TEMPLATES;
    }
  });

  // Save to LocalStorage with direct persistence
  useEffect(() => {
    localStorage.setItem('semillas_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('semillas_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('semillas_additional_incomes', JSON.stringify(additionalIncomes));
  }, [additionalIncomes]);

  useEffect(() => {
    localStorage.setItem('semillas_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('semillas_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('semillas_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('semillas_staff', JSON.stringify(staff));
  }, [staff]);

  // Modals state
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalStudent, setPaymentModalStudent] = useState<Student | null>(null);

  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false);
  const [additionalModalType, setAdditionalModalType] = useState<'income' | 'expense'>('income');
  const [receiptAdditionalIncome, setReceiptAdditionalIncome] = useState<AdditionalIncomeRecord | null>(null);

  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);
  const [receiptStudent, setReceiptStudent] = useState<Student | null>(null);

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<ScheduleClass | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Global Keyboard shortcut: Ctrl+K / Cmd+K for quick student search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // CRUD for Students
  const handleSaveStudent = (savedStudent: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === savedStudent.id);
      if (exists) {
        return prev.map((s) => (s.id === savedStudent.id ? savedStudent : s));
      }
      return [savedStudent, ...prev];
    });

    // If student had a detail view open, update it
    if (selectedStudentDetail && selectedStudentDetail.id === savedStudent.id) {
      setSelectedStudentDetail(savedStudent);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setPayments((prev) => prev.filter((p) => p.studentId !== studentId));
    if (selectedStudentDetail && selectedStudentDetail.id === studentId) {
      setSelectedStudentDetail(null);
    }
  };

  // Register Payment
  const handleRegisterPayment = (
    newPayment: PaymentRecord,
    newStatus: 'al_dia' | 'proximo' | 'pendiente' | 'vencido',
    agreement?: PaymentAgreement
  ) => {
    setPayments((prev) => [newPayment, ...prev]);

    // Update student payment status and last payment date
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === newPayment.studentId) {
          return {
            ...s,
            paymentStatus: newStatus,
            lastPaymentDate: newPayment.date,
            activeAgreement: agreement || s.activeAgreement,
          };
        }
        return s;
      })
    );
  };

  // Free evaluation
  const handleSaveEvaluation = (newEval: FreeEvaluationAppointment) => {
    setEvaluations((prev) => [newEval, ...prev]);
  };

  // Schedule class
  const handleSaveSchedule = (savedSchedule: ScheduleClass) => {
    setClasses((prev) => {
      const exists = prev.some((c) => c.id === savedSchedule.id);
      if (exists) {
        return prev.map((c) => (c.id === savedSchedule.id ? savedSchedule : c));
      }
      return [...prev, savedSchedule];
    });
  };

  const handleDeleteSchedule = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  // Staff members
  const handleAddStaff = (newStaff: StaffMember) => {
    setStaff((prev) => [...prev, newStaff]);
  };

  const handleDeleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((st) => st.id !== id));
  };

  // Template update
  const handleUpdateTemplate = (updated: NotificationTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Income and Expense Handlers
  const handleSaveAdditionalIncome = (newIncome: AdditionalIncomeRecord) => {
    setAdditionalIncomes((prev) => {
      const exists = prev.some((i) => i.id === newIncome.id);
      if (exists) {
        return prev.map((i) => (i.id === newIncome.id ? newIncome : i));
      }
      return [newIncome, ...prev];
    });
  };

  const handleDeleteAdditionalIncome = (id: string) => {
    setAdditionalIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDeletePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  };

  const handleAddExpense = (expense: ExpenseRecord) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleUpdateExpense = (updated: ExpenseRecord) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Reset and Export
  const handleResetData = () => {
    if (confirm('¿Deseas reiniciar la base de datos a un estado limpio (sin alumnos ni registros de prueba)?')) {
      setStudents([]);
      setPayments([]);
      setAdditionalIncomes([]);
      setExpenses(INITIAL_EXPENSES);
      setEvaluations([]);
      setClasses(INITIAL_CLASSES);
      setStaff(INITIAL_STAFF);
      setTemplates(INITIAL_TEMPLATES);
      localStorage.setItem('semillas_students', JSON.stringify([]));
      localStorage.setItem('semillas_payments', JSON.stringify([]));
      localStorage.setItem('semillas_additional_incomes', JSON.stringify([]));
      localStorage.setItem('semillas_expenses', JSON.stringify(INITIAL_EXPENSES));
      localStorage.setItem('semillas_evaluations', JSON.stringify([]));
      localStorage.setItem('semillas_classes', JSON.stringify(INITIAL_CLASSES));
      alert('Sistema preparado. La base de datos está lista para tu gestión.');
    }
  };

  const handleExportData = () => {
    const fullBackup = {
      semillas_version: '2.0-produccion',
      exportedAt: new Date().toISOString(),
      students,
      payments,
      additionalIncomes,
      expenses,
      evaluations,
      classes,
      staff,
      templates,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `semillas_del_reino_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentReceiptSede = INITIAL_SEDES.find(
    (s) => s.id === (receiptStudent?.sede || receiptAdditionalIncome?.sede || (selectedSede === 'todas' ? 'mi_peru' : selectedSede))
  ) || INITIAL_SEDES[0];

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    saveCurrentSession(null);
    setCurrentUser(null);
  };

  // Auth Guard: If not logged in, show strictly the private Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ErrorBoundary fallbackTitle="Inconveniente al cargar la plataforma">
      <div className="min-h-screen bg-[#FAF7F2] text-[#2C2721] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
        {/* Top Brand Header */}
        <Header
          sedes={INITIAL_SEDES}
          selectedSede={selectedSede}
          onSelectSede={setSelectedSede}
          onOpenSearch={() => setIsQuickSearchOpen(true)}
          onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
          currentUser={currentUser}
          onOpenSecurity={() => setIsSecurityModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Tab Navigation */}
        <Navigation
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onTabChange={setActiveTab}
          studentsCount={students.length}
          pendingPaymentsCount={students.filter((s) => s.paymentStatus === 'pendiente').length}
          evaluationsCount={evaluations.filter((e) => e.status === 'programada').length}
          expensesCount={expenses.length}
        />

        {/* Main Viewport Container - Ancho completo maximizado para ocupar toda la pantalla cómodamente */}
        <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              students={students}
              evaluations={evaluations}
              classes={classes}
              payments={payments}
              additionalIncomes={additionalIncomes}
              expenses={expenses}
              staff={staff}
              selectedSede={selectedSede}
              sedes={INITIAL_SEDES}
              onOpenNewStudent={() => {
                setStudentToEdit(null);
                setIsStudentFormOpen(true);
              }}
              onOpenPayment={(st) => {
                setPaymentModalStudent(st || null);
                setIsPaymentModalOpen(true);
              }}
              onOpenEvaluation={() => setIsEvaluationModalOpen(true)}
              onOpenScheduleModal={(sch) => {
                setScheduleToEdit(sch || null);
                setIsScheduleModalOpen(true);
              }}
              onNavigateTab={setActiveTab}
              onSelectStudent={(st) => setSelectedStudentDetail(st)}
              onOpenSearch={() => setIsQuickSearchOpen(true)}
              onOpenStaffModal={() => setIsStaffModalOpen(true)}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaModule
              classes={classes}
              students={students}
              evaluations={evaluations}
              payments={payments}
              selectedSede={selectedSede}
              onOpenScheduleModal={(sch) => {
                setScheduleToEdit(sch || null);
                setIsScheduleModalOpen(true);
              }}
              onOpenEvaluation={() => setIsEvaluationModalOpen(true)}
              onOpenPayment={(st) => {
                setPaymentModalStudent(st || null);
                setIsPaymentModalOpen(true);
              }}
              onSelectStudent={(st) => setSelectedStudentDetail(st)}
              onBackToHall={() => setActiveTab('dashboard')}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'students' && (
            <StudentsModule
              students={students}
              selectedSede={selectedSede}
              onOpenNewStudent={() => {
                setStudentToEdit(null);
                setIsStudentFormOpen(true);
              }}
              onOpenEditStudent={(st) => {
                setStudentToEdit(st);
                setIsStudentFormOpen(true);
              }}
              onSelectStudent={(st) => setSelectedStudentDetail(st)}
              onOpenPayment={(st) => {
                setPaymentModalStudent(st);
                setIsPaymentModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onBackToHall={() => setActiveTab('dashboard')}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'academic' && (
            <AcademicModule
              students={students}
              classes={classes}
              selectedSede={selectedSede}
              onSelectStudent={(st) => setSelectedStudentDetail(st)}
              onOpenNewSchedule={() => {
                setScheduleToEdit(null);
                setIsScheduleModalOpen(true);
              }}
              onEditSchedule={(sch) => {
                setScheduleToEdit(sch);
                setIsScheduleModalOpen(true);
              }}
              onDeleteSchedule={handleDeleteSchedule}
              onBackToHall={() => setActiveTab('dashboard')}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsModule
              students={students}
              payments={payments}
              additionalIncomes={additionalIncomes}
              expenses={expenses}
              selectedSede={selectedSede}
              sedes={INITIAL_SEDES}
              onOpenPaymentModal={(st) => {
                setPaymentModalStudent(st || null);
                setIsPaymentModalOpen(true);
              }}
              onOpenAdditionalModal={(defaultType) => {
                setAdditionalModalType(defaultType || 'income');
                setIsAdditionalModalOpen(true);
              }}
              onOpenReceipt={(pay, st) => {
                setReceiptAdditionalIncome(null);
                setReceiptPayment(pay);
                setReceiptStudent(st || students.find((s) => s.id === pay.studentId) || null);
              }}
              onOpenIncomeReceipt={(inc) => {
                setReceiptPayment(null);
                setReceiptStudent(null);
                setReceiptAdditionalIncome(inc);
              }}
              onDeletePayment={handleDeletePayment}
              onDeleteAdditionalIncome={handleDeleteAdditionalIncome}
              onDeleteExpense={handleDeleteExpense}
              onSelectStudent={(st) => setSelectedStudentDetail(st)}
              onBackToHall={() => setActiveTab('dashboard')}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesModule
              expenses={expenses}
              payments={payments}
              staff={staff}
              sedes={INITIAL_SEDES}
              selectedSede={selectedSede}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onDeleteStaff={handleDeleteStaff}
              onOpenStaffModal={() => setIsStaffModalOpen(true)}
              onBackToHall={() => setActiveTab('dashboard')}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsModule
              staff={staff}
              sedes={INITIAL_SEDES}
              templates={templates}
              students={students}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
              onUpdateTemplate={handleUpdateTemplate}
              onResetData={handleResetData}
              onExportData={handleExportData}
              onBackToHall={() => setActiveTab('dashboard')}
              onNavigateTab={setActiveTab}
            />
          )}
        </main>

        {/* Modals Layer */}

        {/* 1. Quick Search Modal (Ctrl+K) */}
        <QuickSearchModal
          isOpen={isQuickSearchOpen}
          onClose={() => setIsQuickSearchOpen(false)}
          students={students}
          onSelectStudent={(st) => {
            setSelectedStudentDetail(st);
            setIsQuickSearchOpen(false);
          }}
          onOpenPaymentForStudent={(st) => {
            setPaymentModalStudent(st);
            setIsPaymentModalOpen(true);
          }}
        />

        {/* 2. Student Detail Institutional Sheet */}
        <StudentDetailModal
          student={selectedStudentDetail}
          paymentRecords={payments}
          onClose={() => setSelectedStudentDetail(null)}
          onOpenPayment={(st) => {
            setPaymentModalStudent(st);
            setIsPaymentModalOpen(true);
          }}
          onEdit={(st) => {
            setStudentToEdit(st);
            setIsStudentFormOpen(true);
          }}
          onOpenEdit={(st) => {
            setStudentToEdit(st);
            setIsStudentFormOpen(true);
          }}
        />

        {/* 3. Student Form Modal (Create & Edit with Auto-Age calculation) */}
        <StudentFormModal
          isOpen={isStudentFormOpen}
          onClose={() => {
            setIsStudentFormOpen(false);
            setStudentToEdit(null);
          }}
          onSave={handleSaveStudent}
          studentToEdit={studentToEdit}
          defaultSede={selectedSede}
        />

        {/* 4. Payment Registration Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentModalStudent(null);
          }}
          students={students}
          preselectedStudent={paymentModalStudent}
          onRegisterPayment={handleRegisterPayment}
          onSuccessOpenReceipt={(pay) => {
            const foundStudent = students.find((s) => s.id === pay.studentId) || null;
            setReceiptStudent(foundStudent);
            setReceiptPayment(pay);
          }}
        />

        {/* 5. Printable Receipt Voucher Modal */}
        <ErrorBoundary fallbackTitle="Inconveniente al mostrar el comprobante de pago">
          <ReceiptModal
            payment={receiptPayment}
            student={receiptStudent}
            additionalIncome={receiptAdditionalIncome}
            sede={currentReceiptSede}
            onClose={() => {
              setReceiptPayment(null);
              setReceiptStudent(null);
              setReceiptAdditionalIncome(null);
            }}
          />
        </ErrorBoundary>

        {/* 5.1 Additional Income & Cash Outflow Modal */}
        <AdditionalTransactionModal
          isOpen={isAdditionalModalOpen}
          onClose={() => setIsAdditionalModalOpen(false)}
          defaultType={additionalModalType}
          selectedSede={selectedSede}
          sedes={INITIAL_SEDES}
          onSaveIncome={handleSaveAdditionalIncome}
          onSaveExpense={handleAddExpense}
        />

        {/* 6. Free Trial Evaluation Modal */}
        <EvaluationModal
          isOpen={isEvaluationModalOpen}
          onClose={() => setIsEvaluationModalOpen(false)}
          onSave={handleSaveEvaluation}
          defaultSede={selectedSede}
        />

        {/* 7. Schedule & Classroom Editor Modal */}
        <ScheduleClassModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setScheduleToEdit(null);
          }}
          onSave={handleSaveSchedule}
          onDelete={handleDeleteSchedule}
          initialSchedule={scheduleToEdit}
          students={students}
          defaultSede={selectedSede}
        />

        {/* 8. Staff Management Modal (Agregar / Quitar Profesoras y Trabajadores) */}
        <StaffManagementModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
          staff={staff}
          onAddStaff={handleAddStaff}
          onDeleteStaff={handleDeleteStaff}
          onOpenPaymentToTeacher={(teacherName) => {
            setIsStaffModalOpen(false);
            setActiveTab('expenses');
          }}
        />

        {/* 9. Security & Access Management Modal (Máximo 2 cuentas) */}
        {currentUser && (
          <SecurityModal
            isOpen={isSecurityModalOpen}
            onClose={() => setIsSecurityModalOpen(false)}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        {/* Global Minimal Footer */}
        <footer className="mt-auto border-t border-[#ECE5DA] bg-white/70 py-4 text-center text-xs text-[#7D7569] print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Semillas del Reino • Plataforma de Gestión Institucional</span>
            <span>Sede Principal: Mi Perú | Sede Deportiva: Ventanilla</span>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
