import React, { useState } from "react";
import { Project, ERPTask, ClientCorp, User } from "../types";
import { syncERPCollection } from "../utils";
import { Briefcase, FolderPlus, ListTodo, Plus, DollarSign, Calendar, Users, Eye, Trash, Clock, CheckSquare } from "lucide-react";

interface ProjectModuleProps {
  currentUser: User;
  projects: Project[];
  tasks: ERPTask[];
  clients: ClientCorp[];
  users: User[];
  onDataChanged: () => void;
}

export default function ProjectModule({
  currentUser,
  projects,
  tasks,
  clients,
  users,
  onDataChanged
}: ProjectModuleProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "tasks">("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // New Project modal/form states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    clientId: "",
    value: 0,
    costEstimate: 0,
    startDate: "",
    endDate: "",
    team: [] as string[],
    status: "active" as const
  });

  // Track hours modal/form states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    projectId: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium" as const,
    status: "todo" as const
  });

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.clientId) return;

    const updated = [
      ...projects,
      {
        ...newProject,
        id: `p-${Date.now()}`,
        progress: 0,
        timeSpent: 0,
        files: []
      }
    ];

    const success = await syncERPCollection("projects", updated, currentUser.id, currentUser.name, `إنشاء مشروع جديد "${newProject.name}" وإسناد المهام لفريق العمل.`);
    if (success) {
      setShowProjectModal(false);
      setNewProject({ name: "", clientId: "", value: 0, costEstimate: 0, startDate: "", endDate: "", team: [], status: "active" });
      onDataChanged();
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId) return;

    const updated = [
      ...tasks,
      {
        ...newTask,
        id: `t-${Date.now()}`,
        timeLogged: 0
      }
    ];

    const success = await syncERPCollection("tasks", updated, currentUser.id, currentUser.name, `إسناد مهمة جديدة: "${newTask.title}" للمطور في لوحة المهام.`);
    if (success) {
      setShowTaskModal(false);
      setNewTask({ title: "", projectId: "", assignedTo: "", dueDate: "", priority: "medium", status: "todo" });
      onDataChanged();
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'todo' | 'in_progress' | 'review' | 'done') => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    const success = await syncERPCollection("tasks", updated, currentUser.id, currentUser.name, `تحديث حالة المهمة رقم ${taskId} إلى "${status}".`);
    if (success) onDataChanged();
  };

  const updateProjectProgress = async (projId: string, progress: number) => {
    const updated = projects.map(p => p.id === projId ? { ...p, progress } : p);
    const success = await syncERPCollection("projects", updated, currentUser.id, currentUser.name, `تعديل نسبة إنجاز المشروع بمعدل ${progress}%.`);
    if (success) onDataChanged();
  };

  const handleDeleteProject = async (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    const success = await syncERPCollection("projects", updated, currentUser.id, currentUser.name, "حذف كارت مشروع تسويق مؤقتاً.");
    if (success) onDataChanged();
  };

  const developers = users.filter(u => ["employee", "coach", "marketing_manager", "project_manager", "admin"].includes(u.role));

  return (
    <div className="space-y-6" id="projects-module-main">
      
      {/* Tab controls */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "projects" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>المشروعات ({projects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "tasks" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>لوحة المهام المشتركة ({tasks.length})</span>
        </button>
      </div>

      {/* Projects view */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-sans transition"
            >
              <FolderPlus className="w-4 h-4" />
              <span>إنشاء مشروع جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map(proj => {
              const cli = clients.find(c => c.id === proj.clientId);
              const profitEstim = proj.value - proj.costEstimate;
              
              return (
                <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-800 text-slate-400 font-sans rounded">
                        {cli ? cli.company : "عميل عابر"}
                      </span>
                      <span className="text-xs text-indigo-400 font-mono font-bold">صافي الربح المتوقع: <span className="text-emerald-400">{profitEstim.toLocaleString()} ج.م</span></span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 font-sans mb-2 text-right">{proj.name}</h3>

                    {/* Progress tracking */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[11px] font-sans">
                        <span className="text-slate-400">مستوى الإنجاز والعمل</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={proj.progress}
                          onChange={e => updateProjectProgress(proj.id, Number(e.target.value))}
                          className="w-24 sm:w-36 h-1 bg-slate-950 rounded bg-indigo-500/10 cursor-pointer accent-indigo-500"
                        />
                        <span className="text-indigo-400 font-mono font-bold">{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs border border-slate-800/40 p-2.5 rounded-lg bg-slate-950/45 mb-4 font-sans">
                      <div>
                        <div className="text-[10px] text-slate-500">ميزانية المشروع</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{proj.value.toLocaleString()} j.m</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">التكاليف المقدرة</div>
                        <div className="text-xs font-bold text-rose-400 mt-0.5">{proj.costEstimate.toLocaleString()} j.m</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-sans">فريق العمل</div>
                        <div className="text-[10px] font-bold text-indigo-400 mt-0.5">{proj.team ? proj.team.length : 0} طاقم</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>ساعات العمل الإجمالية: {proj.timeSpent} ساعة</span>
                    </div>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="text-xs text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/5 px-2 py-1 rounded"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Kanban board inside list */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400 font-sans">اسحب المهام أو حدث حالتها مباشرة لمتابعة مؤشرات الإنجاز.</p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-sans transition"
            >
              <Plus className="w-4 h-4" />
              <span>إسناد مهمة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* TODO column */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-3 min-h-[400px]">
              <div className="text-slate-400 font-bold text-xs flex justify-between stroke-slate-400 pb-1.5 border-b border-slate-900">
                <span>المستلمة (مستودع)</span>
                <span className="bg-slate-900 text-[10px] text-indigo-300 font-bold py-0.5 px-1.5 rounded">{tasks.filter(t => t.status === "todo").length}</span>
              </div>
              {tasks.filter(t => t.status === "todo").map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-indigo-500/40 transition">
                  <h4 className="text-xs font-semibold text-slate-200 mb-2">{task.title}</h4>
                  <div className="flex justify-between items-center">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                      className="bg-slate-950 text-[10px] text-indigo-400 font-sans py-0.5 px-1 rounded focus:outline-none border border-slate-800"
                    >
                      <option value="todo">جديدة</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="review">مراجعة</option>
                      <option value="done">مكتملة</option>
                    </select>
                    <span className="text-[10px] text-slate-500">{users.find(u => u.id === task.assignedTo)?.name || "غير محدد"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* IN PROGRESS column */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-3 min-h-[400px]">
              <div className="text-amber-500 font-bold text-xs flex justify-between stroke-amber-500 pb-1.5 border-b border-slate-900">
                <span>قيد التنفيذ الإعلاني</span>
                <span className="bg-amber-500/10 text-amber-400 font-bold py-0.5 px-1.5 rounded">{tasks.filter(t => t.status === "in_progress").length}</span>
              </div>
              {tasks.filter(t => t.status === "in_progress").map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-amber-500/40 transition">
                  <h4 className="text-xs font-semibold text-slate-200 mb-2">{task.title}</h4>
                  <div className="flex justify-between items-center">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                      className="bg-slate-950 text-[10px] text-amber-500 font-sans py-0.5 px-1 rounded focus:outline-none border border-slate-800"
                    >
                      <option value="todo">جديدة</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="review">مراجعة</option>
                      <option value="done">مكتملة</option>
                    </select>
                    <span className="text-[10px] text-slate-500">{users.find(u => u.id === task.assignedTo)?.name || "غير محدد"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* REVIEW column */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-3 min-h-[400px]">
              <div className="text-indigo-400 font-bold text-xs flex justify-between stroke-indigo-400 pb-1.5 border-b border-slate-900">
                <span>جاهز للمراجعة الفنية</span>
                <span className="bg-indigo-500/10 text-indigo-300 font-bold py-0.5 px-1.5 rounded">{tasks.filter(t => t.status === "review").length}</span>
              </div>
              {tasks.filter(t => t.status === "review").map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-indigo-500/40 transition">
                  <h4 className="text-xs font-semibold text-slate-200 mb-2">{task.title}</h4>
                  <div className="flex justify-between items-center">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                      className="bg-slate-950 text-[10px] text-indigo-400 font-sans py-0.5 px-1 rounded focus:outline-none border border-slate-800"
                    >
                      <option value="todo">جديدة</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="review">مراجعة</option>
                      <option value="done">مكتملة</option>
                    </select>
                    <span className="text-[10px] text-slate-500">{users.find(u => u.id === task.assignedTo)?.name || "غير محدد"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DONE column */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-3 min-h-[400px]">
              <div className="text-emerald-500 font-bold text-xs flex justify-between stroke-emerald-500 pb-1.5 border-b border-slate-900">
                <span>منتهية ومكتملة</span>
                <span className="bg-emerald-500/10 text-emerald-400 font-bold py-0.5 px-1.5 rounded">{tasks.filter(t => t.status === "done").length}</span>
              </div>
              {tasks.filter(t => t.status === "done").map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-emerald-500/40 transition">
                  <h4 className="text-xs font-semibold text-slate-200 mb-2">{task.title}</h4>
                  <div className="flex justify-between items-center">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                      className="bg-slate-950 text-[10px] text-emerald-400 font-sans py-0.5 px-1 rounded focus:outline-none border border-slate-800"
                    >
                      <option value="todo">جديدة</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="review">مراجعة</option>
                      <option value="done">مكتملة</option>
                    </select>
                    <span className="text-[10px] text-slate-500">{users.find(u => u.id === task.assignedTo)?.name || "غير محدد"}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* MODALS */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddProject} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إنشاء وإسناد مشروع جديد</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم المشروع بالتفصيل</label>
                <input required type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">اختر العميل المستفيد</label>
                <select required value={newProject.clientId} onChange={e => setNewProject({...newProject, clientId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200">
                  <option value="">-- اختر --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">قيمة تمويل العقد (EGP)</label>
                  <input required type="number" value={newProject.value} onChange={e => setNewProject({...newProject, value: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">التكلفة التشغيلية (EGP)</label>
                  <input required type="number" value={newProject.costEstimate} onChange={e => setNewProject({...newProject, costEstimate: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ البدء</label>
                  <input required type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ التسليم المتوقع</label>
                  <input required type="date" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">إنشاء وتأسيس</button>
              <button type="button" onClick={() => setShowProjectModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddTask} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إسناد مهمة جديدة للموظفين</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">عنوان المهمة</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="تصميم كاروسيل فيس بوك لمشروع الشفاء..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">اختر المشروع</label>
                <select required value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none">
                  <option value="">-- اختر المشروع --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">الموظف المسؤول</label>
                  <select required value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2">
                    <option value="">-- اختر الموظف --</option>
                    {developers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ التسليم</label>
                  <input required type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono" />
                </div>
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">تأكيد الإسناد المجدول</button>
              <button type="button" onClick={() => setShowTaskModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
