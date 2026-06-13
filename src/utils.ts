import { LogEntry } from "./types";

// Base helper for standard server API requests
export async function fetchERPData() {
  try {
    const res = await fetch("/api/db");
    if (!res.ok) throw new Error("فشل في مزامنة البيانات السحابية");
    return await res.json();
  } catch (error) {
    console.error("ERP Sync error:", error);
    return null;
  }
}

// Global update dispatcher
export async function syncERPCollection(
  collectionName: string,
  items: any[],
  userId: string,
  userName: string,
  actionLogText: string
) {
  try {
    const res = await fetch("/api/update-collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectionName,
        items,
        userId,
        userName,
        actionLogText
      })
    });
    return res.ok;
  } catch (error) {
    console.error(`Error updating collection ${collectionName}:`, error);
    return false;
  }
}

// Request AI response for Chat assistant
export async function askAICopilot(message: string, userName: string, userRole: string, history: Array<{ role: string; text: string }>) {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userName, userRole, history })
    });
    const data = await res.json();
    return data.response || "عذراً لم أستطع فهم طلبك حالياً.";
  } catch (e) {
    console.error("AI assistant error:", e);
    return "نواجه مشكلة مؤقتة في الاتصال بنظام الذكاء الاصطناعي.";
  }
}

// Request AI Analysed Report
export async function requestAIReport(reportType: string, filters?: any) {
  try {
    const res = await fetch("/api/ai/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportType, filters })
    });
    const data = await res.json();
    return data.report || "تقرير فارغ.";
  } catch (e) {
    console.error("AI report compilation error:", e);
    return "فشل في توليد التقارير الذكية بالوقت الحالي.";
  }
}

// Dispatch WhatsApp Notifications
export async function sendWhatsAppNotification(recipient: string, message: string, userId: string, userName: string) {
  try {
    const res = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, message, userId, userName })
    });
    if (res.ok) {
      const data = await res.json();
      return data.log;
    }
  } catch (e) {
    console.error("WhatsApp delivery simulation failed:", e);
  }
  return null;
}

// Trigger Cloud Backup
export async function triggerCloudBackup(userId: string, userName: string) {
  try {
    const res = await fetch("/api/system/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userName })
    });
    if (res.ok) {
      const data = await res.json();
      return data.config;
    }
  } catch (e) {
    console.error("Cloud backup execution failed:", e);
  }
  return null;
}

// Persist global configuration adjustments
export async function syncERPConfig(config: any, userId: string, userName: string) {
  try {
    const res = await fetch("/api/update-collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectionName: "systemConfig",
        items: [config],
        userId,
        userName,
        actionLogText: "تحديث متغيرات وربط نظام الـ ERP الأساسية."
      })
    });
    return res.ok;
  } catch (error) {
    console.error("Error saving ERP config:", error);
    return false;
  }
}

// Fetch complete backup JSON DB structure
export async function requestBackupDB() {
  try {
    const res = await fetch("/api/db");
    if (!res.ok) throw new Error("فشل النسخ الاحتياطي");
    return await res.json();
  } catch (error) {
    console.error("Backup DB error:", error);
    return null;
  }
}

// Client Side Table Exporter to CSV / Excel
export function exportTableToCSV(headers: string[], rows: any[][], fileName: string) {
  const content = [
    headers.join(","),
    ...rows.map(row => row.map(val => {
      const cellText = typeof val === "string" ? val.replace(/"/g, '""') : String(val);
      return `"${cellText}"`;
    }).join(","))
  ].join("\n");

  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
