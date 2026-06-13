import React, { useState } from "react";
import { Course, Enrollment, User, Quiz, Assignment, Submission } from "../types";
import { syncERPCollection } from "../utils";
import { BookOpen, GraduationCap, Award, CheckCircle, Video, ListChecks, FileInput, Plus, Star, Search, CheckSquare } from "lucide-react";

interface AcademyModuleProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
  quizzes: Quiz[];
  assignments: Assignment[];
  submissions: Submission[];
  users: User[];
  onDataChanged: () => void;
}

export default function AcademyModule({
  currentUser,
  courses,
  enrollments,
  quizzes,
  assignments,
  submissions,
  users,
  onDataChanged
}: AcademyModuleProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "quizzes" | "certificates">("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Verification code scanner state
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [scannedResult, setScannedResult] = useState<any>(null);

  // New Course modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    coachId: "",
    description: "",
    price: 0,
    duration: "4 أسابيع",
    videos: [] as Array<{ title: string; duration: string; url: string }>,
    files: [] as Array<{ name: string; url: string }>
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.coachId) return;

    const updated = [
      ...courses,
      {
        ...newCourse,
        id: `crs-${Date.now()}`,
        averageReview: 5.0
      }
    ];

    const success = await syncERPCollection("courses", updated, currentUser.id, currentUser.name, `إنشاء دورة تعليمية جديدة بالأكاديمية بعنوان "${newCourse.title}".`);
    if (success) {
      setShowCourseModal(false);
      setNewCourse({ title: "", coachId: "", description: "", price: 0, duration: "4 أسابيع", videos: [], files: [] });
      onDataChanged();
    }
  };

  const handleVerifyCertificate = () => {
    if (!verificationCodeInput.trim()) return;
    
    // Find enrollment with this certificate verification code
    const found = enrollments.find(e => e.certificateId?.toLowerCase() === verificationCodeInput.toLowerCase().trim());
    if (found) {
      const student = users.find(u => u.id === found.studentId);
      const course = courses.find(c => c.id === found.courseId);
      setScannedResult({
        isValid: true,
        studentName: student ? student.name : "طالب غير معروف",
        courseTitle: course ? course.title : "دورة تعليمية غير معروفة",
        grade: found.grade || 100,
        id: found.certificateId
      });
    } else {
      setScannedResult({
        isValid: false,
        message: "عذراً، كود التحقق المدخل غير مسجل بسجلات الأكاديمية المعتمدة."
      });
    }
  };

  const coaches = users.filter(u => u.role === "coach" || u.role === "admin");

  return (
    <div className="space-y-6" id="academy-module-main">
      
      {/* Upper sub tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "courses" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>المناهج والكورسات ({courses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "quizzes" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>الاختبارات والواجبات</span>
        </button>
        <button
          onClick={() => setActiveTab("certificates")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "certificates" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>منظومة الشهادات والتحقق بالـ QR</span>
        </button>
      </div>

      {/* 1. Courses List Tab */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
            <p className="text-xs text-slate-300 font-sans">
              لوحة إدارة وتعديل مناهج الأكاديمية التعليمية وربطها بالمدربين والطلاب.
            </p>
            {["admin", "academy_manager"].includes(currentUser.role) && (
              <button
                onClick={() => setShowCourseModal(true)}
                className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg transition font-sans"
              >
                <Plus className="w-4 h-4" />
                <span>إدراج كورس جديد</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => (
              <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] bg-slate-950 font-mono text-indigo-400 px-2 py-0.5 rounded border border-slate-800">
                      {course.duration}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-bold">{course.averageReview || 5.0}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 font-sans mb-1 text-right">{course.title}</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">{course.description}</p>
                </div>

                <div className="border-t border-slate-850 pt-3 mt-2 flex justify-between items-center text-xs font-sans">
                  <div>
                    <div className="text-[10px] text-slate-500">المدرب المسؤول</div>
                    <div className="font-medium text-slate-300">{users.find(u => u.id === course.coachId)?.name || "مدرب متميز"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">سعر الاشتراك</div>
                    <div className="text-emerald-400 font-bold font-mono">{course.price.toLocaleString()} EGP</div>
                  </div>
                </div>

                {/* Simulated watch link */}
                <div className="mt-4 pt-2.5 border-t border-slate-800/40 flex justify-end">
                  <button
                    onClick={() => setSelectedCourseId(selectedCourseId === course.id ? null : course.id)}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>عرض المحاضرات ({course.videos ? course.videos.length : 0})</span>
                  </button>
                </div>

                {/* Lectures Drawer */}
                {selectedCourseId === course.id && (
                  <div className="mt-3 bg-slate-950 p-2.5 border border-slate-850 rounded-lg space-y-1.5 transition-all text-xs">
                    <div className="font-bold text-indigo-300 mb-1">الفيديوهات وملفات التعلم المتاحة:</div>
                    {course.videos && course.videos.length > 0 ? (
                      course.videos.map((vid, vi) => (
                        <div key={vi} className="flex justify-between items-center p-1.5 bg-slate-900 text-slate-300 rounded">
                          <span className="font-mono text-[10px] text-slate-500">{vid.duration}</span>
                          <span>{vid.title}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-[10px]">بانتظار رفع ملفات الدورة بواسطة الكوتش.</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Quizzes & Submissions Tab */}
      {activeTab === "quizzes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Homework list & creation details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span>الواجبات والتسليمات المدرسية المفتوحة</span>
            </h3>
            
            {assignments.map(as => {
              const matchedCrs = courses.find(c => c.id === as.courseId);
              return (
                <div key={as.id} className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-indigo-300 font-sans">
                      {matchedCrs ? matchedCrs.title : "أكاديمية الورداني"}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">ينتهي: {as.dueDate}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 text-right">{as.title}</h4>
                  <p className="text-xs text-slate-400 text-right">{as.description}</p>
                </div>
              );
            })}
          </div>

          {/* Test Answers dashboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <ListChecks className="w-4 h-4 text-indigo-400" />
              <span>نتائج وتقييم كراسات الطلاب</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-2">اسم الطالب</th>
                    <th className="pb-2">الواجب العملي</th>
                    <th className="pb-2">الدرجة الممنوحة</th>
                    <th className="pb-2">رأي الكوتش والتقييم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-200">
                  {submissions.map(sub => {
                    const stu = users.find(u => u.id === sub.studentId);
                    return (
                      <tr key={sub.id}>
                        <td className="py-2.5 text-indigo-300 font-sans hover:underline">{stu ? stu.name : "طالب جديد"}</td>
                        <td className="py-2.5 font-bold">{sub.fileName}</td>
                        <td className="py-2.5 font-mono text-emerald-400 font-bold">{sub.grade ? `${sub.grade}/100` : "بانتظار القياس"}</td>
                        <td className="py-2.5 text-slate-400 italic text-[11px]">{sub.feedback || "قيد المراجعة الفنية"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Certificate Check by QR Verify Code */}
      {activeTab === "certificates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Verifier engine panel */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-start space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">محرك التحقق من كود الشهادة ورقم التتبع QR</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              يدعم نظام الورداني التعليمي إصدار شهادات إتمام رقمية برقم تتبع فريد لمكافحة التزوير. أدخل الكود بالأسفل لمحاكاة المسح الضوئي لكود الـ QR.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="مثال: HE-992384"
                value={verificationCodeInput}
                onChange={e => setVerificationCodeInput(e.target.value)}
                className="w-full text-center tracking-widest uppercase bg-slate-950 border border-slate-800 font-mono text-slate-100 p-2 rounded text-sm focus:outline-none focus:border-indigo-500"
                id="cert-verify-id"
              />
              <button
                onClick={handleVerifyCertificate}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 rounded font-sans transition"
              >
                مسح وتحقق الآن
              </button>
            </div>

            {scannedResult && (
              <div className={`p-4 rounded-lg border text-xs text-right space-y-2 ${
                scannedResult.isValid 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-300"
              }`}>
                {scannedResult.isValid ? (
                  <>
                    <h4 className="font-bold flex items-center justify-end gap-1 font-sans text-emerald-400">
                      <GraduationCap className="w-4 h-4" />
                      الشهادة مسجلة ومعتمدة رسمياً!
                    </h4>
                    <p className="text-[11px] space-y-1">
                      <div>اسم الخريج: <b className="text-slate-100 font-sans">{scannedResult.studentName}</b></div>
                      <div>الدورة التعليمية: <b className="text-slate-100 font-sans">{scannedResult.courseTitle}</b></div>
                      <div>الدرجة النهائية: <b className="text-slate-100 font-mono">{scannedResult.grade}/100</b></div>
                      <div>الرقم المسلسل: <b className="text-slate-100 font-mono">{scannedResult.id}</b></div>
                    </p>
                  </>
                ) : (
                  <p className="font-semibold text-[11px]">{scannedResult.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Graphical Certificate visual template */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-850 pb-2 mb-4 w-full">معاينة نموذج الشهادة المعتمدة والـ QR للطلاب المتخرجين</h3>

            {/* Template visual mock */}
            <div className="border-[8px] border-amber-600/35 bg-slate-950 p-6 rounded-lg text-center max-w-lg w-full relative space-y-4 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/15 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start text-right">
                <span className="text-[9px] text-slate-500 font-mono">ID: HE-992384</span>
                <span className="text-[10px] text-slate-400">Hossam Elwardany Academy</span>
              </div>

              <div className="text-amber-500 font-bold tracking-widest">شهادة إتمام معتمدة</div>
              <p className="text-xs text-slate-300">تمنح الأكاديمية هذه الشهادة الفخرية للطالب المجتهد</p>
              
              <div className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3 font-sans">
                رامي خالد
              </div>

              <p className="text-[11px] text-slate-400 italic">
                لاجتيازه بنجاح دبلومة التسويق الرقمي المتكاملة والذكاء الاصطناعي بمعدل نجاح 88% وتأهيله للعمل الاحترافي بالأسواق والقيام بالتحليلات التجارية.
              </p>

              <div className="flex justify-between items-center pt-3 text-[9px] text-slate-400 border-t border-slate-900 font-sans">
                <div className="text-center bg-slate-900 p-2 rounded">
                  <div className="font-bold text-slate-300">التحقق بالـ QR</div>
                  <div className="font-mono text-indigo-400 mt-1 uppercase font-bold text-[10px]">VERIFIED 100%</div>
                </div>
                <div className="text-center font-sans pr-4">
                  <div>تاريخ المأذونية</div>
                  <div className="font-mono font-semibold text-slate-500 mt-1">2026-06-13</div>
                </div>
                <div className="text-center font-sans text-right">
                  <div>رئيس مجلس الإدارة</div>
                  <div className="text-amber-500 font-semibold font-sans mt-1">حسام الورداني</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODALS */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateCourse} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إدراج كورس تعليمي جديد بالأكاديمية</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم الكورس بالتفصيل</label>
                <input required type="text" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">المدرب المسؤول</label>
                  <select required value={newCourse.coachId} onChange={e => setNewCourse({...newCourse, coachId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2">
                    <option value="">-- اختر --</option>
                    {coaches.map(co => <option key={co.id} value={co.id}>{co.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">سعر الكورس (EGP)</label>
                  <input required type="number" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">وصف كفايات التعلم والمهارات</label>
                <textarea rows={3} value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">تأسيس الدورة</button>
              <button type="button" onClick={() => setShowCourseModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
