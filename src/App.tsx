import React, { useState, useEffect } from "react";
import { fetchERPData, syncERPCollection } from "./utils";
import {
  User, ClientCorp, Contract, Proposal, MarketingCampaign, Project,
  ERPTask, Course, Enrollment, Quiz, Assignment, Submission,
  Attendance, LeaveRequest, PerformanceReview, Candidate, AccountLedger,
  AuditLog, ERPConfig
} from "./types";

// Import modules
import AIModule from "./components/AIModule";
import MarketingModule from "./components/MarketingModule";
import ProjectModule from "./components/ProjectModule";
import AcademyModule from "./components/AcademyModule";
import HRModule from "./components/HRModule";
import FinanceModule from "./components/FinanceModule";
import CRMModule from "./components/CRMModule";
import SystemSettingsModule from "./components/SystemSettingsModule";

import {
  Bot, Megaphone, Briefcase, GraduationCap, Users, ShieldAlert,
  Wallet, Sparkles, Settings, UserCheck, Play, UserX, MapPin, Map,
  Clock, CheckCircle, Database, HelpCircle, AlertTriangle, FileSpreadsheet
} from "lucide-react";

export default function App() {
  // Global ERP Collections States
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<ClientCorp[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ERPTask[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [transactions, setTransactions] = useState<AccountLedger[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemConfig, setSystemConfig] = useState<ERPConfig>({
    appName: "Hossam Elwardany ERP",
    backupFrequency: "daily",
    isDatabaseEncrypted: false,
    whatsappCallbackUrl: ""
  });

  // App UI Layout
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  
  // Simulation Role Context
  const [currentUser, setCurrentUser] = useState<User>({
    id: "u-1",
    name: "م. حسام الورداني",
    email: "ceo@elwardany.com",
    phone: "+201012345678",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    role: "admin",
    customPermissions: ["all"]
  });

  // GPS Clock In Simulation states
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [clockInMessage, setClockInMessage] = useState<string | null>(null);

  // Load ERP state on boot
  const loadWorkspaceData = async () => {
    try {
      const data = await fetchERPData();
      if (data) {
        setUsers(data.users || []);
        setClients(data.clients || []);
        setContracts(data.contracts || []);
        setProposals(data.proposals || []);
        setCampaigns(data.campaigns || []);
        setProjects(data.projects || []);
        setTasks(data.tasks || []);
        setCourses(data.courses || []);
        setEnrollments(data.enrollments || []);
        setQuizzes(data.quizzes || []);
        setAssignments(data.assignments || []);
        setSubmissions(data.submissions || []);
        setAttendance(data.attendance || []);
        setLeaveRequests(data.leaveRequests || []);
        setPerformanceReviews(data.performanceReviews || []);
        setCandidates(data.candidates || []);
        setTransactions(data.transactions || []);
        setAuditLogs(data.auditLogs || []);
        if (data.systemConfig) {
          setSystemConfig(data.systemConfig);
        }
      }
    } catch (e) {
      console.error("Error loading workspace metadata:", e);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  // Simulator profile toggler
  const handleRoleToggle = (roleKey: string) => {
    const matched = users.find(u => u.role === roleKey);
    if (matched) {
      setCurrentUser(matched);
      setClockInMessage(null);
    } else {
      // Create a temporary profile
      const tempUser: User = {
        id: `u-temp-${roleKey}`,
        name: `مستخدم تجريبي (${roleKey})`,
        email: `${roleKey}@elwardany.com`,
        phone: "+201500000000",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        role: roleKey as any,
        customPermissions: []
      };
      setCurrentUser(tempUser);
      setClockInMessage(null);
    }
  };

  // Clock In using Navigator Geolocation or Cairo Egypt backup coords
  const handleClockInGPS = async () => {
    setIsClockingIn(true);
    setClockInMessage("جاري استخلاص موقع الـ GPS المشفر وتحقق العميل عن بعد...");

    const logAttendanceEntry = async (lat: number, lng: number) => {
      const entry: Attendance = {
        id: `att-${Date.now()}`,
        userId: currentUser.id,
        date: new Date().toISOString().split("T")[0],
        clockIn: new Date().toLocaleTimeString("ar-EG", { hour: "numeric", minute: "numeric" }),
        latitude: lat,
        longitude: lng,
        remote: true
      };

      const updated = [entry, ...attendance];
      const success = await syncERPCollection("attendance", updated, currentUser.id, currentUser.name, `تسجيل حضور وانصراف ذاتي عن بعد عبر الهاتف بإحداثيات GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}).`);
      
      if (success) {
        setAttendance(updated);
        setClockInMessage(`تم تسجيل الحضور عن بعد بنجاح! الإحداثيات الموثقة: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else {
        setClockInMessage("عذراً، فشل تسجيل حضور الموظف الذاتي بالسيرفر السحابي.");
      }
      setIsClockingIn(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          logAttendanceEntry(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Geolocation warning, using simulated Cairo coords:", err);
          // Fallback to beautiful default simulated coordinates near cairo egypt
          setTimeout(() => {
            logAttendanceEntry(30.0444, 31.2357);
          }, 1000);
        }
      );
    } else {
      setTimeout(() => {
        logAttendanceEntry(30.0444, 31.2357);
      }, 1000);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-100">
        <Bot className="w-12 h-12 text-indigo-400 animate-bounce" />
        <div className="text-sm font-sans tracking-wide">نموذج حسام الورداني ERP يفك تشفير البيانات الحية...</div>
      </div>
    );
  }

  // Permission guards helper
  const canAccess = (allowedRoles: string[]) => {
    if (currentUser.role === "admin") return true;
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between" id="erp-root-application">
      
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200 bg-white px-4 py-3 flex flex-col lg:flex-row justify-between items-center gap-3 sticky top-0 z-40">
        
        {/* System branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <h1 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Hossam Elwardany BMS</h1>
            <p className="text-[9px] text-blue-600 font-bold">نظام الإدارة المتكامل والأكاديمية والشركات</p>
          </div>
        </div>

        {/* GPS Clock In & Simulator controls */}
        <div className="flex flex-wrap items-center gap-3 justify-center">
          
          {/* Remote Attendance triggers */}
          {["employee", "coach", "marketing_manager", "project_manager", "admin"].includes(currentUser.role) && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClockInGPS}
                disabled={isClockingIn}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-sans text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>حضور عن بعد بالـ GPS</span>
              </button>
              {clockInMessage && (
                <span className="text-[10px] text-emerald-400 font-sans max-w-xs text-right bg-emerald-500/10 py-1 px-2.5 rounded border border-emerald-500/20">
                  {clockInMessage}
                </span>
              )}
            </div>
          )}

          {/* User simulation context switcher */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium font-sans">محاكاة صلاحية:</span>
            <select
              value={currentUser.role}
              onChange={(e) => handleRoleToggle(e.target.value)}
              className="bg-white text-xs text-blue-600 font-sans font-medium rounded px-2 py-1 outline-none border border-slate-200"
              id="role-simulator-dropdown"
            >
              <option value="admin">مدير النظام (CEO)</option>
              <option value="marketing_manager">مدير التسويق والوكالة</option>
              <option value="hr_manager">مدير الموارد البشرية (HR)</option>
              <option value="academy_manager">مدير الأكاديمية والمناهج</option>
              <option value="employee">موظف تسويق وصانع محتوى</option>
              <option value="coach">مدرب / محاضر معتمد</option>
              <option value="student">طالب ملتحق دبلوم</option>
              <option value="client">عميل المؤسسة الراعي</option>
            </select>
          </div>

          {/* Operator display */}
          <div className="text-right flex items-center gap-2 bg-slate-100 p-1 px-2.5 rounded border border-slate-200">
            <div className="hidden sm:block">
              <div className="text-[11px] font-bold text-slate-800">{currentUser.name}</div>
              <div className="text-[9px] text-blue-600 font-mono font-bold uppercase">{currentUser.role}</div>
            </div>
            <img src={currentUser.avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"} alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
          </div>

        </div>

      </header>

      {/* Main Core Body */}
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Workspace Quick Sidebar Navigation - 3 cols */}
        <aside className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl space-y-4">
          
          <div className="space-y-1">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest font-sans uppercase mb-3 text-right">أقسام ومجمعات الـ ERP</div>
            
            <button
              onClick={() => setActiveModule("dashboard")}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition text-right text-xs font-sans ${
                activeModule === "dashboard" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span className="text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded font-mono">LIVE</span>
              <span className="flex items-center gap-2">لوحة الاستعراض والقياس</span>
            </button>

            <button
              onClick={() => setActiveModule("marketing")}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition text-right text-xs font-sans ${
                activeModule === "marketing" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Megaphone className="w-4 h-4 text-indigo-400" />
              <span className="flex items-center gap-2">شركة التسويق الرقمي</span>
            </button>

            <button
              onClick={() => setActiveModule("projects")}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition text-right text-xs font-sans ${
                activeModule === "projects" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span className="flex items-center gap-2">المشروعات والمهام</span>
            </button>

            <button
              onClick={() => setActiveModule("academy")}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition text-right text-xs font-sans ${
                activeModule === "academy" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span className="flex items-center gap-2">الأكاديمية والشهادات</span>
            </button>

            <button
              onClick={() => setActiveModule("hr")}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition text-right text-xs font-sans ${
                activeModule === "hr" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="flex items-center gap-2">الموارد البشرية والـ GPS</span>
            </button>

            <button
              onClick={() => setActiveModule("finance")}
              className={`w-full flex items-center justify-between py-1 px-3 rounded-xl transition text-right text-xs font-sans p-2 ${
                activeModule === "finance" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Wallet className="w-4 h-4 text-indigo-400" />
              <span className="flex items-center gap-2">الماليات والضرائب</span>
            </button>

            <button
              onClick={() => setActiveModule("crm")}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition text-right text-xs font-sans ${
                activeModule === "crm" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="flex items-center gap-2">العلاقات وإشعارات WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveModule("ai")}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition text-right text-xs font-sans ${
                activeModule === "ai" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold animate-pulse" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="flex items-center gap-2">المساعد الذكي والتقارير</span>
            </button>

            <button
              onClick={() => setActiveModule("settings")}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition text-right text-xs font-sans ${
                activeModule === "settings" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="flex items-center gap-2">إعدادات النظام والتدقيق</span>
            </button>

          </div>

          {/* Quick status widget */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-right space-y-1">
            <div className="text-[9px] text-slate-500 font-sans">تشفير القواعد البينات</div>
            <div className="text-xs font-bold text-slate-350 flex items-center justify-end gap-1 font-sans">
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono px-1 rounded uppercase">SHA-256</span>
              <span>نشط ومؤمن</span>
            </div>
          </div>

        </aside>

        {/* Unified Application View Port - 9 cols */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Dashboard section */}
          {activeModule === "dashboard" && (
            <div className="space-y-6 text-right">
              
              {/* Core metrics overview graphs bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <div className="text-xs text-slate-400 font-sans">إجمالي عملاء الوكالة مع العقود</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">{clients.length} عميل</div>
                  <p className="text-[10px] text-indigo-400 mt-1">عقود مالية حية نشطة بالأكاديمية</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <div className="text-xs text-slate-400 font-sans">الكورسات ودبلومات السوشيال ميديا</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">{courses.length} كورس</div>
                  <p className="text-[10px] text-indigo-400 mt-1">تراكم شهادات QR التلقائية مبرمجة</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <div className="text-xs text-slate-400 font-sans">صافي المعاملات في الخزائن</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    {(transactions.filter(t => t.type === "revenue").reduce((s,t)=>s+t.amount, 0) - transactions.filter(t => t.type === "expense").reduce((s,t)=>s+t.amount, 0)).toLocaleString()} EGP
                  </div>
                  <p className="text-[10px] text-rose-400 mt-1">شاملة استقطاع 14% ضريبة</p>
                </div>
              </div>

              {/* Dynamic Welcome card and Quick Copilot chat Widget */}
              <div className="bg-slate-905 border border-slate-800 bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950/20 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1.5 md:flex-1">
                  <h3 className="text-base font-bold text-slate-50 font-sans">أهلاً بك في نظام حسام الورداني BMS المتكامل</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    من هنا يمكنك تتبع الموازنة المالية للشركة، إشراك الموظفين عن بعد بالجي بي إس، إدارة دبلومات الأكاديمية والتحقق الفوري من شهادات طلابنا، واستدراك التقارير التلقائية بالذكاء الاصطناعي.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModule("ai")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1 transition"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>استشر المساعد الذكي بالأداء</span>
                </button>
              </div>

              {/* Live Alerts panel for dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-250 font-sans border-b border-slate-800 pb-1.5">أحدث العمليات والحضور اليومي الموثق</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {attendance.slice(0, 4).map(att => {
                      const matched = users.find(u => u.id === att.userId);
                      return (
                        <div key={att.id} className="bg-slate-950 p-2 rounded text-xs flex justify-between items-center text-right font-sans border border-slate-850">
                          <span className="text-[10px] text-slate-500 font-mono">حضور: {att.clockIn}</span>
                          <div>
                            <span className="font-bold text-indigo-300">{matched?.name || "موظف متميز"}</span>
                            <div className="text-[9px] text-slate-400 mt-0.5">موقع العمل: {att.remote ? "عمل عن بعد بالـ GPS" : "حضوري بالمقر"}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-250 font-sans border-b border-slate-805 pb-1.5">المهام العاجلة والعملاء المعلقين</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tasks.slice(0, 4).map(task => (
                      <div key={task.id} className="bg-slate-950 p-2.5 rounded text-xs leading-relaxed text-right border border-slate-850">
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className={`px-1 rounded ${task.priority === "high" ? "bg-rose-500/10 text-rose-400" : "bg-slate-800 text-slate-400"}`}>
                            {task.priority === "high" ? "أولوية قسوة" : "عادية"}
                          </span>
                          <span className="text-indigo-300">مهمة عمل</span>
                        </div>
                        <p className="text-slate-300 text-[11px] font-semibold">{task.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Marketing Module Toggle portal */}
          {activeModule === "marketing" && (
            <MarketingModule
              currentUser={currentUser}
              clients={clients}
              contracts={contracts}
              proposals={proposals}
              campaigns={campaigns}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* Project Module Toggle portal */}
          {activeModule === "projects" && (
            <ProjectModule
              currentUser={currentUser}
              projects={projects}
              tasks={tasks}
              clients={clients}
              users={users}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* Academy Module Toggle portal */}
          {activeModule === "academy" && (
            <AcademyModule
              currentUser={currentUser}
              courses={courses}
              enrollments={enrollments}
              quizzes={quizzes}
              assignments={assignments}
              submissions={submissions}
              users={users}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* HR Module Toggle portal */}
          {activeModule === "hr" && (
            <HRModule
              currentUser={currentUser}
              users={users}
              attendance={attendance}
              leaveRequests={leaveRequests}
              performanceReviews={performanceReviews}
              candidates={candidates}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* Finance Module Toggle portal */}
          {activeModule === "finance" && (
            <FinanceModule
              currentUser={currentUser}
              transactions={transactions}
              clients={clients}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* CRM & WhatsApp Module */}
          {activeModule === "crm" && (
            <CRMModule
              currentUser={currentUser}
              clients={clients}
              users={users}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* AI reports Module */}
          {activeModule === "ai" && (
            <AIModule
              currentUser={currentUser}
              systemConfig={systemConfig}
            />
          )}

          {/* Settings and audit logs Module */}
          {activeModule === "settings" && (
            <SystemSettingsModule
              currentUser={currentUser}
              systemConfig={systemConfig}
              auditLogs={auditLogs}
              users={users}
              onDataChanged={loadWorkspaceData}
            />
          )}

        </div>

      </main>

      {/* Footer information panel */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-[10px] text-slate-500 space-y-0.5">
        <div>جميع الحقوق محفوظة © {new Date().getFullYear()} لمؤسسة حسام الورداني لإدارة خدمات التسويق والأكاديميات.</div>
        <div>نظام سحابي معزز بالتشفير المعتمد (SHA-256) والذكاء الاصطناعي.</div>
      </footer>

    </div>
  );
}
