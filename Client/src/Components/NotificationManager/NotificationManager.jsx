import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../config/axios";

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  container: { maxWidth: 1200, margin: "0 auto", padding: "24px 16px", fontFamily: "'Inter', system-ui, sans-serif" },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  tabs: { display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #e2e8f0", paddingBottom: 0 },
  tab: (active) => ({
    padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600, border: "none",
    borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
    color: active ? "#3b82f6" : "#64748b", background: "none", marginBottom: -2,
    transition: "all 0.2s",
  }),
  card: { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  badge: (color) => ({
    display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
    background: color === "green" ? "#dcfce7" : color === "red" ? "#fee2e2" : color === "blue" ? "#dbeafe" : color === "yellow" ? "#fef9c3" : "#f1f5f9",
    color: color === "green" ? "#166534" : color === "red" ? "#991b1b" : color === "blue" ? "#1e40af" : color === "yellow" ? "#854d0e" : "#475569",
  }),
  btn: (variant) => ({
    padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
    background: variant === "primary" ? "#3b82f6" : variant === "danger" ? "#ef4444" : variant === "success" ? "#22c55e" : "#f1f5f9",
    color: variant === "primary" || variant === "danger" || variant === "success" ? "#fff" : "#334155",
    transition: "all 0.2s",
  }),
  input: { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", minHeight: 80, resize: "vertical", boxSizing: "border-box" },
  select: { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", boxSizing: "border-box" },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  flexBetween: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  toggleBtn: (active) => ({
    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative",
    background: active ? "#22c55e" : "#d1d5db", transition: "all 0.3s",
  }),
  toggleCircle: (active) => ({
    width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute",
    top: 3, left: active ? 23 : 3, transition: "all 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  }),
  modal: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modalContent: { background: "#fff", borderRadius: 16, padding: 24, width: "90%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto" },
  empty: { textAlign: "center", padding: 40, color: "#94a3b8" },
  statsCard: (color) => ({
    padding: 16, borderRadius: 10, background: color === "green" ? "#f0fdf4" : color === "red" ? "#fef2f2" : color === "blue" ? "#eff6ff" : "#f8fafc",
    border: `1px solid ${color === "green" ? "#bbf7d0" : color === "red" ? "#fecaca" : color === "blue" ? "#bfdbfe" : "#e2e8f0"}`,
    textAlign: "center",
  }),
  statsNumber: { fontSize: 28, fontWeight: 700, color: "#1e293b", margin: 0 },
  statsLabel: { fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 },
  varTag: {
    display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500,
    background: "#ede9fe", color: "#6d28d9", margin: "2px 3px", cursor: "pointer",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────
const NotificationManager = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logStats, setLogStats] = useState({ sent: 0, failed: 0, queued: 0 });
  const [logPagination, setLogPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [testPhone, setTestPhone] = useState("");
  const [testEventKey, setTestEventKey] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testSending, setTestSending] = useState(false);
  const [logFilters, setLogFilters] = useState({ eventKey: "", status: "", page: 1 });
  const [formData, setFormData] = useState({
    eventKey: "", label: "", description: "", recipientType: "assignedTo",
    messageTemplate: "", availableVariables: "", channel: "whatsapp", isActive: true,
  });

  // ─── Fetch Templates ──────────────────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/notifications/templates");
      if (res.data.success) setTemplates(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
    setLoading(false);
  }, []);

  // ─── Fetch Logs ────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: logFilters.page, limit: 20 };
      if (logFilters.eventKey) params.eventKey = logFilters.eventKey;
      if (logFilters.status) params.status = logFilters.status;
      const res = await axiosInstance.get("/api/notifications/logs", { params });
      if (res.data.success) {
        setLogs(res.data.data || []);
        setLogStats(res.data.stats || { sent: 0, failed: 0, queued: 0 });
        setLogPagination(res.data.pagination || { current: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
    setLoading(false);
  }, [logFilters]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { if (activeTab === "logs") fetchLogs(); }, [activeTab, fetchLogs]);

  // ─── Seed Defaults ─────────────────────────────────────────────────────────
  const handleSeed = async () => {
    try {
      const res = await axiosInstance.post("/api/notifications/templates/seed");
      if (res.data.success) {
        alert(`✅ ${res.data.message}`);
        fetchTemplates();
      }
    } catch (err) {
      alert("❌ Failed to seed templates");
    }
  };

  // ─── Toggle Template ───────────────────────────────────────────────────────
  const handleToggle = async (id) => {
    try {
      await axiosInstance.patch(`/api/notifications/templates/${id}/toggle`);
      fetchTemplates();
    } catch (err) {
      alert("❌ Failed to toggle template");
    }
  };

  // ─── Delete Template ───────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await axiosInstance.delete(`/api/notifications/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      alert("❌ Failed to delete template");
    }
  };

  // ─── Open Modal for Create/Edit ────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      eventKey: "", label: "", description: "", recipientType: "assignedTo",
      messageTemplate: "", availableVariables: "", channel: "whatsapp", isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (tpl) => {
    setEditingTemplate(tpl);
    setFormData({
      eventKey: tpl.eventKey,
      label: tpl.label,
      description: tpl.description || "",
      recipientType: tpl.recipientType || "assignedTo",
      messageTemplate: tpl.messageTemplate,
      availableVariables: (tpl.availableVariables || []).join(", "),
      channel: tpl.channel || "whatsapp",
      isActive: tpl.isActive,
    });
    setShowModal(true);
  };

  // ─── Save Template ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.eventKey || !formData.label || !formData.messageTemplate) {
      alert("Event Key, Label, aur Message Template required hai!");
      return;
    }
    const payload = {
      ...formData,
      availableVariables: formData.availableVariables
        ? formData.availableVariables.split(",").map((v) => v.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editingTemplate) {
        await axiosInstance.put(`/api/notifications/templates/${editingTemplate._id}`, payload);
      } else {
        await axiosInstance.post("/api/notifications/templates", payload);
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || "Failed to save template"}`);
    }
  };

  // ─── Send Test ─────────────────────────────────────────────────────────────
  const handleSendTest = async () => {
    if (!testEventKey || !testPhone) {
      alert("Event Key aur Phone number dono required hain!");
      return;
    }
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await axiosInstance.post("/api/notifications/test", {
        eventKey: testEventKey,
        phone: testPhone,
      });
      setTestResult(res.data);
    } catch (err) {
      setTestResult({ success: false, message: err.response?.data?.message || "Test failed" });
    }
    setTestSending(false);
  };

  // ─── RENDER: Templates Tab ─────────────────────────────────────────────────
  const renderTemplates = () => (
    <div>
      <div style={{ ...styles.flexBetween, marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: "#64748b" }}>{templates.length} templates</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btn()} onClick={handleSeed}>🌱 Seed Defaults</button>
          <button style={styles.btn("primary")} onClick={openCreateModal}>+ New Template</button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: 16 }}>No templates yet</p>
          <p style={{ fontSize: 13 }}>Click "Seed Defaults" to create starter templates</p>
        </div>
      ) : (
        templates.map((tpl) => (
          <div key={tpl._id} style={styles.card}>
            <div style={styles.flexBetween}>
              <div>
                <span style={{ ...styles.badge("blue"), marginRight: 8 }}>{tpl.eventKey}</span>
                <span style={styles.badge(tpl.isActive ? "green" : "red")}>
                  {tpl.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={styles.toggleBtn(tpl.isActive)} onClick={() => handleToggle(tpl._id)}>
                  <div style={styles.toggleCircle(tpl.isActive)} />
                </button>
                <button style={styles.btn()} onClick={() => openEditModal(tpl)}>✏️ Edit</button>
                <button style={styles.btn("danger")} onClick={() => handleDelete(tpl._id)}>🗑️</button>
              </div>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: "10px 0 4px" }}>{tpl.label}</h3>
            {tpl.description && <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px" }}>{tpl.description}</p>}
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, fontSize: 13, color: "#334155", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {tpl.messageTemplate}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#94a3b8", marginRight: 4 }}>Variables:</span>
              {(tpl.availableVariables || []).map((v, i) => (
                <span key={i} style={styles.varTag}>{`{{${v}}}`}</span>
              ))}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <span style={{ ...styles.badge("blue"), fontSize: 10 }}>📨 {tpl.channel}</span>
              <span style={{ ...styles.badge("yellow"), fontSize: 10 }}>👤 {tpl.recipientType}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // ─── RENDER: Logs Tab ──────────────────────────────────────────────────────
  const renderLogs = () => (
    <div>
      {/* Stats */}
      <div style={{ ...styles.grid3, marginBottom: 20 }}>
        <div style={styles.statsCard("green")}>
          <p style={styles.statsNumber}>{logStats.sent || 0}</p>
          <p style={styles.statsLabel}>✅ Sent</p>
        </div>
        <div style={styles.statsCard("red")}>
          <p style={styles.statsNumber}>{logStats.failed || 0}</p>
          <p style={styles.statsLabel}>❌ Failed</p>
        </div>
        <div style={styles.statsCard("blue")}>
          <p style={styles.statsNumber}>{logPagination.total || 0}</p>
          <p style={styles.statsLabel}>📊 Total Logs</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...styles.grid3, marginBottom: 16 }}>
        <select
          style={styles.select}
          value={logFilters.eventKey}
          onChange={(e) => setLogFilters({ ...logFilters, eventKey: e.target.value, page: 1 })}
        >
          <option value="">All Events</option>
          {templates.map((t) => <option key={t._id} value={t.eventKey}>{t.eventKey}</option>)}
        </select>
        <select
          style={styles.select}
          value={logFilters.status}
          onChange={(e) => setLogFilters({ ...logFilters, status: e.target.value, page: 1 })}
        >
          <option value="">All Status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
        <button style={styles.btn("primary")} onClick={fetchLogs}>🔄 Refresh</button>
      </div>

      {/* Log entries */}
      {logs.length === 0 ? (
        <div style={styles.empty}><p>No notification logs yet</p></div>
      ) : (
        logs.map((log) => (
          <div key={log._id} style={{ ...styles.card, padding: 14 }}>
            <div style={styles.flexBetween}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={styles.badge("blue")}>{log.eventKey}</span>
                <span style={styles.badge(log.status === "sent" ? "green" : "red")}>{log.status}</span>
                <span style={styles.badge()}>{log.channel}</span>
              </div>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                {new Date(log.createdAt).toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>📱 {log.recipientPhone}</span>
              {log.recipientName && <span style={{ color: "#64748b" }}> — {log.recipientName}</span>}
            </div>
            <div style={{ marginTop: 6, background: "#f8fafc", borderRadius: 6, padding: 8, fontSize: 12, color: "#475569", whiteSpace: "pre-wrap" }}>
              {log.messageContent}
            </div>
            {log.errorMessage && (
              <div style={{ marginTop: 4, fontSize: 11, color: "#dc2626" }}>⚠️ {log.errorMessage}</div>
            )}
          </div>
        ))
      )}

      {/* Pagination */}
      {logPagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <button
            style={styles.btn()}
            disabled={!logPagination.hasPrev}
            onClick={() => setLogFilters({ ...logFilters, page: logFilters.page - 1 })}
          >← Prev</button>
          <span style={{ padding: "8px 12px", fontSize: 13 }}>
            Page {logPagination.current} of {logPagination.pages}
          </span>
          <button
            style={styles.btn()}
            disabled={!logPagination.hasNext}
            onClick={() => setLogFilters({ ...logFilters, page: logFilters.page + 1 })}
          >Next →</button>
        </div>
      )}
    </div>
  );

  // ─── RENDER: Test Tab ──────────────────────────────────────────────────────
  const renderTest = () => (
    <div>
      <div style={styles.card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🧪 Send Test Notification</h3>
        <div style={{ ...styles.grid2, marginBottom: 12 }}>
          <div>
            <label style={styles.label}>Event Key *</label>
            <select style={styles.select} value={testEventKey} onChange={(e) => setTestEventKey(e.target.value)}>
              <option value="">Select Event...</option>
              {templates.filter((t) => t.isActive).map((t) => (
                <option key={t._id} value={t.eventKey}>{t.eventKey} — {t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Phone Number *</label>
            <input style={styles.input} placeholder="e.g. 9876543210" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} />
          </div>
        </div>
        <button style={styles.btn("primary")} onClick={handleSendTest} disabled={testSending}>
          {testSending ? "Sending..." : "📤 Send Test Message"}
        </button>
        {testResult && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: testResult.success ? "#f0fdf4" : "#fef2f2", border: `1px solid ${testResult.success ? "#bbf7d0" : "#fecaca"}` }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: testResult.success ? "#166534" : "#991b1b" }}>
              {testResult.success ? "✅ " : "❌ "}{testResult.message}
            </p>
          </div>
        )}
      </div>

      {/* Info card */}
      <div style={{ ...styles.card, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e40af", marginBottom: 8 }}>ℹ️ Twilio Setup Guide</h4>
        <ul style={{ fontSize: 12, color: "#1e40af", lineHeight: 2, paddingLeft: 20, margin: 0 }}>
          <li>Twilio account banao: <strong>twilio.com</strong></li>
          <li>WhatsApp Sandbox activate karo (Messaging → Try it out → WhatsApp)</li>
          <li>Sandbox number pe <strong>"join &lt;sandbox-code&gt;"</strong> message bhejo apne WhatsApp se</li>
          <li><strong>.env</strong> mein <code>TWILIO_ACCOUNT_SID</code> aur <code>TWILIO_AUTH_TOKEN</code> daalo</li>
          <li>Test message bhejo — agar aaye to sab set hai! ✅</li>
        </ul>
      </div>
    </div>
  );

  // ─── RENDER: Modal ─────────────────────────────────────────────────────────
  const renderModal = () => showModal && (
    <div style={styles.modal} onClick={() => setShowModal(false)}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.flexBetween}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{editingTemplate ? "Edit Template" : "Create Template"}</h3>
          <button style={{ ...styles.btn(), padding: "4px 10px" }} onClick={() => setShowModal(false)}>✕</button>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ ...styles.grid2, marginBottom: 12 }}>
            <div>
              <label style={styles.label}>Event Key *</label>
              <input style={styles.input} placeholder="e.g. TASK_ASSIGNED" value={formData.eventKey}
                onChange={(e) => setFormData({ ...formData, eventKey: e.target.value.toUpperCase() })}
                disabled={!!editingTemplate} />
            </div>
            <div>
              <label style={styles.label}>Label *</label>
              <input style={styles.input} placeholder="e.g. Task Assigned to Employee" value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Description</label>
            <input style={styles.input} placeholder="When does this event fire?" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div style={{ ...styles.grid2, marginBottom: 12 }}>
            <div>
              <label style={styles.label}>Recipient Type</label>
              <select style={styles.select} value={formData.recipientType}
                onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}>
                <option value="assignedTo">Assigned To (Employee)</option>
                <option value="assignedBy">Assigned By (Manager)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Channel</label>
              <select style={styles.select} value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Message Template * <span style={{ fontWeight: 400, color: "#94a3b8" }}>(Use {`{{variable}}`} for placeholders)</span></label>
            <textarea style={styles.textarea} rows={5} placeholder={"Namaskar {{name}}, aapko task '{{taskName}}' assign hua hai.\nDue Date: {{dueDate}}\nPriority: {{priority}}"} value={formData.messageTemplate}
              onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Available Variables <span style={{ fontWeight: 400, color: "#94a3b8" }}>(comma separated)</span></label>
            <input style={styles.input} placeholder="name, taskName, dueDate, priority, assignedBy" value={formData.availableVariables}
              onChange={(e) => setFormData({ ...formData, availableVariables: e.target.value })} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={styles.btn()} onClick={() => setShowModal(false)}>Cancel</button>
            <button style={styles.btn("primary")} onClick={handleSave}>
              {editingTemplate ? "💾 Update" : "✅ Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📱 Notification Manager</h1>
        <p style={styles.subtitle}>WhatsApp & SMS notifications manage karein — templates, logs aur testing</p>
      </div>

      <div style={styles.tabs}>
        {[
          { key: "templates", label: "📋 Templates" },
          { key: "logs", label: "📊 Logs" },
          { key: "test", label: "🧪 Test" },
        ].map((t) => (
          <button key={t.key} style={styles.tab(activeTab === t.key)}
            onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>Loading...</div>}

      {activeTab === "templates" && renderTemplates()}
      {activeTab === "logs" && renderLogs()}
      {activeTab === "test" && renderTest()}

      {renderModal()}
    </div>
  );
};

export default NotificationManager;
