import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAllSuspects } from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../../config/axios";
import AssignmentAnalytics from "./AssignmentAnalytics";
import "./Dashboard.css";

const DashboardPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    suspects = [],
    loading,
    error,
  } = useSelector((state) => state.suspect);

  const [actionPanel, setActionPanel] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    nextCallDate: "",
    time: "",
    remark: "",
    nextAppointmentDate: "",
    nextAppointmentTime: "",
  });

  const [assignedSuspects, setAssignedSuspects] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [assignedError, setAssignedError] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [todaysActiveSuspects, setTodaysActiveSuspects] = useState([]);
  const [scheduledSuspects, setScheduledSuspects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [realTimeStats, setRealTimeStats] = useState({
    total: 0,
    notContacted: 0,
    forwarded: 0,
    callback: 0,
    appointmentDone: 0,
    notInterested: 0,
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  useEffect(() => {
    fetchInitialData();

    const handleFocus = () => {
      fetchInitialData();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [dispatch, telecallerId]);

  const fetchInitialData = async () => {
    await Promise.all([
      dispatch(getAllSuspects()),
      fetchAssignedSuspects(),
      fetchTodaysActiveSuspects(),
      fetchTelecallerStats(),
    ]);
  };

  const fetchAssignedSuspects = async () => {
    if (!telecallerId) return;

    setAssignedLoading(true);
    setAssignedError(null);

    try {
      const response = await axiosInstance.get(
        `/api/telecaller/${telecallerId}/assigned-suspects?t=${new Date().getTime()}`
      );

      if (response.data && response.data.success) {
        const suspectsData = response.data.data.assignedSuspects || [];
        const sortedData = suspectsData.sort(
          (a, b) => new Date(b.assignedAt) - new Date(a.assignedAt)
        );
        setAssignedSuspects(sortedData);
        calculateRealTimeStats(sortedData);
      } else {
        setAssignedError(
          response.data.message || "Failed to fetch assigned suspects"
        );
      }
    } catch (error) {
      console.error("Error fetching assigned suspects:", error);
      setAssignedError(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setAssignedLoading(false);
    }
  };

  const fetchTelecallerStats = async () => {
    if (!telecallerId) return;

    try {
      const response = await axiosInstance.get(
        `/api/telecaller/${telecallerId}/stats?t=${new Date().getTime()}`
      );

      if (response.data && response.data.success) {
        setRealTimeStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleQuickStatusChange = (suspect) => {
    setActionPanel({
      type: "update",
      suspect,
    });

    setFormData({
      status: "",
      nextCallDate: "",
      time: "",
      remark: "",
      nextAppointmentDate: "",
      nextAppointmentTime: "",
    });
  };

  const fetchTodaysActiveSuspects = async () => {
    if (!telecallerId) return;

    setAssignedLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/telecaller/${telecallerId}/todays-active?t=${new Date().getTime()}`
      );

      if (response.data && response.data.success) {
        const suspectsData = response.data.data.assignedSuspects || [];
        setTodaysActiveSuspects(suspectsData);
      }
    } catch (error) {
      console.error("Error fetching today's active suspects:", error);
    } finally {
      setAssignedLoading(false);
    }
  };

  const fetchScheduledCalls = async (
    date = new Date().toISOString().split("T")[0]
  ) => {
    if (!telecallerId) return;

    setAssignedLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/telecaller/${telecallerId}/date/${date}?t=${new Date().getTime()}`
      );

      if (response.data && response.data.success) {
        setScheduledSuspects(response.data.data.suspects || []);
        setSelectedDate(date);
      }
    } catch (error) {
      console.error("Error fetching scheduled calls:", error);
    } finally {
      setAssignedLoading(false);
    }
  };

  const calculateRealTimeStats = (suspectsData) => {
    const stats = {
      total: suspectsData.length,
      notContacted: 0,
      forwarded: 0,
      callback: 0,
      appointmentDone: 0,
      notInterested: 0,
    };

    suspectsData.forEach((suspect) => {
      const status = getLatestCallStatus(suspect);
      switch (status) {
        case "Not Contacted":
          stats.notContacted++;
          break;
        case "Call Not Picked":
        case "Call After Sometimes":
        case "Busy on Another Call":
        case "Others":
          stats.forwarded++;
          break;
        case "Callback":
          stats.callback++;
          break;
        case "Appointment Done":
          stats.appointmentDone++;
          break;
        case "Not Interested":
        case "Not Reachable":
        case "Wrong Number":
          stats.notInterested++;
          break;
      }
    });

    setRealTimeStats(stats);
  };

  const getLatestCallStatus = (suspect) => {
    if (!suspect.callTasks || suspect.callTasks.length === 0) {
      return "Not Contacted";
    }

    try {
      const sortedTasks = [...suspect.callTasks].sort((a, b) => {
        const dateA = new Date(a.taskDate || 0);
        const dateB = new Date(b.taskDate || 0);
        return dateB - dateA;
      });

      return sortedTasks[0]?.taskStatus || "Not Contacted";
    } catch (error) {
      console.error("Error getting latest status:", error);
      return "Not Contacted";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Appointment Done":
        return "status-badge success";
      case "Callback":
        return "status-badge warning";
      case "Not Interested":
      case "Not Reachable":
      case "Wrong Number":
        return "status-badge danger";
      case "Call Not Picked":
      case "Busy on Another Call":
      case "Call After Sometimes":
      case "Others":
        return "status-badge info";
      case "Not Contacted":
        return "status-badge secondary";
      default:
        return "status-badge secondary";
    }
  };

  const getNextActionInfo = (suspect) => {
    if (!suspect || !suspect.callTasks || suspect.callTasks.length === 0) {
      return {
        type: "none",
        date: "-",
        time: "-",
        displayText: "-",
      };
    }

    try {
      const sortedTasks = [...suspect.callTasks].sort((a, b) => {
        const dateA = new Date(a.taskDate || 0);
        const dateB = new Date(b.taskDate || 0);
        return dateB - dateA;
      });

      const latestTask = sortedTasks[0];
      const latestStatus = latestTask.taskStatus;

      if (
        latestStatus === "Appointment Done" &&
        latestTask.nextAppointmentDate
      ) {
        const appointmentDate =
          latestTask.nextAppointmentDate instanceof Date
            ? latestTask.nextAppointmentDate
            : new Date(latestTask.nextAppointmentDate);

        return {
          type: "appointment",
          date: appointmentDate.toLocaleDateString("en-GB"),
          time: latestTask.nextAppointmentTime || "-",
          displayText: `Appointment on ${appointmentDate.toLocaleDateString(
            "en-GB"
          )} ${latestTask.nextAppointmentTime || ""}`,
        };
      }

      const forwardedStatuses = [
        "Call Not Picked",
        "Busy on Another Call",
        "Call After Sometimes",
        "Others",
        "Callback",
      ];

      if (
        forwardedStatuses.includes(latestStatus) &&
        latestTask.nextFollowUpDate
      ) {
        const followUpDate =
          latestTask.nextFollowUpDate instanceof Date
            ? latestTask.nextFollowUpDate
            : new Date(latestTask.nextFollowUpDate);

        return {
          type: "call",
          date: followUpDate.toLocaleDateString("en-GB"),
          time: latestTask.nextFollowUpTime || "-",
          displayText: `Call on ${followUpDate.toLocaleDateString("en-GB")} ${
            latestTask.nextFollowUpTime || ""
          }`,
        };
      }

      return {
        type: "none",
        date: "-",
        time: "-",
        displayText: "-",
      };
    } catch (error) {
      console.error("Error getting next action info:", error);
      return {
        type: "none",
        date: "-",
        time: "-",
        displayText: "-",
      };
    }
  };

  // Check if suspect is assigned before today
  const isOldAssigned = (suspect) => {
    if (!suspect.assignedAt) return false;
    
    const assignedDate = new Date(suspect.assignedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return assignedDate < today;
  };

  // Filter only "Not Contacted" suspects for Today's tab
  const getTodaysNotContactedSuspects = (suspects) => {
    return suspects.filter(suspect => getLatestCallStatus(suspect) === "Not Contacted");
  };

  const updateStatus = async (suspectId, actionType) => {
    const {
      status,
      nextCallDate,
      time,
      remark,
      nextAppointmentDate,
      nextAppointmentTime,
    } = formData;

    if (!status) {
      alert("Please select a status");
      return;
    }

    const forwardedStatuses = [
      "Call Not Picked",
      "Call After Sometimes",
      "Busy on Another Call",
      "Others",
    ];
    const closedStatuses = ["Not Reachable", "Wrong Number", "Not Interested"];

    if (forwardedStatuses.includes(status) && (!nextCallDate || !time)) {
      alert("Please select next call date and time for forwarded status");
      return;
    }

    if (status === "Callback" && (!nextCallDate || !time)) {
      alert("Please select callback date and time");
      return;
    }

    if (
      status === "Appointment Done" &&
      (!nextAppointmentDate || !nextAppointmentTime)
    ) {
      alert("Please select next appointment date and time");
      return;
    }

    if (closedStatuses.includes(status) && !remark) {
      alert("Please provide remarks for closing the call");
      return;
    }

    setIsAssigning(true);

    try {
      const endpoint = `/api/suspect/${suspectId}/call-task`;

      let body = {
        taskDate: new Date().toISOString().split("T")[0],
        taskTime:
          time ||
          new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          }),
        taskRemarks: remark || "",
        taskStatus: status,
      };

      if (forwardedStatuses.includes(status) || status === "Callback") {
        body.nextFollowUpDate = nextCallDate;
        body.nextFollowUpTime = time;
      }

      if (status === "Appointment Done") {
        body.nextAppointmentDate = nextAppointmentDate;
        body.nextAppointmentTime = nextAppointmentTime;
      }

      const response = await axiosInstance.post(endpoint, body);

      if (response.data && response.data.success === true) {
        alert(`✅ Status updated to: ${status}`);

        await Promise.all([
          fetchAssignedSuspects(),
          fetchTodaysActiveSuspects(),
          fetchTelecallerStats(),
          dispatch(getAllSuspects()),
          fetchScheduledCalls(selectedDate),
        ]);

        setActionPanel(null);
        setFormData({
          status: "",
          nextCallDate: "",
          time: "",
          remark: "",
          nextAppointmentDate: "",
          nextAppointmentTime: "",
        });
      } else {
        throw new Error(response.data?.message || "Status update failed");
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      alert(
        `❌ Status update failed: ${
          error.response?.data?.message || "Something went wrong"
        }`
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (actionPanel?.suspect?._id && actionPanel.type) {
      updateStatus(actionPanel.suspect._id, actionPanel.type);
    }
  };

  // Contact component with icons
  const ContactInfo = ({ personal }) => {
    const hasMobile = personal.mobileNo && personal.mobileNo.trim() !== '';
    const hasContact = personal.contactNo && personal.contactNo.trim() !== '';

    if (!hasMobile && !hasContact) {
      return <div className="cell-content">-</div>;
    }

    return (
      <div className="contact-info">
        {hasMobile && (
          <div className="contact-item">
            <span className="contact-icon mobile-icon">📱</span>
            <span className="contact-number">{personal.mobileNo}</span>
            <a 
              href={`tel:${personal.mobileNo}`} 
              className="call-link"
              title={`Call ${personal.mobileNo}`}
            >
              📞 Call
            </a>
          </div>
        )}
        {hasContact && (
          <div className="contact-item">
            <span className="contact-icon phone-icon">📞</span>
            <span className="contact-number">{personal.contactNo}</span>
            <a 
              href={`tel:${personal.contactNo}`} 
              className="call-link"
              title={`Call ${personal.contactNo}`}
            >
              📞 Call
            </a>
          </div>
        )}
      </div>
    );
  };

  // Table rendering function
  const renderTable = (suspectsData, showNextAction = false, showOnlyNotContacted = false) => {
    // Filter data based on requirement
    let filteredData = suspectsData;
    if (showOnlyNotContacted) {
      filteredData = getTodaysNotContactedSuspects(suspectsData);
    }

    return (
      <table className="task-table">
        <thead>
          <tr>
            <th>Group Code</th>
            <th>Grade</th>
            <th>Group Name</th>
            <th>Name</th>
            <th>Contact Numbers</th>
            <th>Lead Source</th>
            <th>Lead Name</th>
            <th>Area</th>
            <th>Current Status</th>
            {showNextAction && <th>Next Action</th>}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((suspect) => {
            const personal = suspect.personalDetails || {};
            const latestStatus = getLatestCallStatus(suspect);
            const statusBadgeClass = getStatusBadgeColor(latestStatus);
            const nextActionInfo = getNextActionInfo(suspect);
            const isOld = isOldAssigned(suspect);

            return (
              <tr key={suspect._id} className={isOld ? "old-assigned" : ""}>
                <td className="group-code-cell">
                  <div className="cell-content">{personal.groupCode || "-"}</div>
                </td>
                <td className="grade-cell">
                  <div className="cell-content">{personal.grade || "-"}</div>
                </td>
                <td className="group-name-cell">
                  <div className="cell-content">{personal.groupName || "-"}</div>
                </td>
                <td className="name-cell">
                  <div className="cell-content">{personal.name || "-"}</div>
                </td>
                <td className="contact-cell">
                  <ContactInfo personal={personal} />
                </td>
                <td className="lead-source-cell">
                  <div className="cell-content">{personal.leadSource || "-"}</div>
                </td>
                <td className="lead-name-cell">
                  <div className="cell-content">{personal.leadName || "-"}</div>
                </td>
                <td>
                  <span className="area-badge">
                    {personal.city || "-"}
                  </span>
                </td>
                <td>
                  <span className={statusBadgeClass}>
                    {latestStatus}
                  </span>
                </td>
                {showNextAction && (
                  <td>
                    {nextActionInfo.type !== "none" ? (
                      <div className={`next-action-info ${nextActionInfo.type}`}>
                        {nextActionInfo.type === "appointment" && (
                          <div className="appointment-action">
                            <span className="action-icon" title="Next Appointment">
                              📅
                            </span>
                            <span className="action-date">
                              {nextActionInfo.date}
                            </span>
                            <span className="action-time">
                              {nextActionInfo.time}
                            </span>
                          </div>
                        )}
                        {nextActionInfo.type === "call" && (
                          <div className="call-action">
                            <span className="action-icon" title="Next Call">
                              📞
                            </span>
                            <span className="action-date">
                              {nextActionInfo.date}
                            </span>
                            <span className="action-time">
                              {nextActionInfo.time}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="no-action">-</span>
                    )}
                  </td>
                )}
                <td>
                  <button
                    className="action-button"
                    onClick={() => handleQuickStatusChange(suspect)}
                  >
                    Update Status
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="dashboard-page">
      <h2 className="table-title">
        Today's Calls -{" "}
        {new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </h2>

      <div className="today-call-cards">
        <div
          className="card total"
          onClick={() => navigate("/telecaller/total-leads")}
        >
          <h3>{realTimeStats.total}</h3>
          <p>Total Assigned</p>
          <div className="card-subtitle">All Leads</div>
        </div>
        <div
          className="card balance"
          onClick={() => navigate("/telecaller/balance-leads?filter=today")}
        >
          <h3>{realTimeStats.notContacted}</h3>
          <p>Balance Leads</p>
          <div className="card-subtitle">Not Contacted Today</div>
        </div>
        <div
          className="card forwarded"
          onClick={() => navigate("/telecaller/forwarded-leads?filter=today")}
        >
          <h3>{realTimeStats.forwarded}</h3>
          <p>Forwarded Leads</p>
          <div className="card-subtitle">Today's Follow-ups</div>
        </div>
        <div
          className="card callback"
          onClick={() => navigate("/telecaller/callback?filter=today")}
        >
          <h3>{realTimeStats.callback}</h3>
          <p>Callbacks</p>
          <div className="card-subtitle">Today's Scheduled</div>
        </div>
        <div
          className="card closed"
          onClick={() => navigate("/telecaller/closed-calls")}
        >
          <h3>{realTimeStats.notInterested}</h3>
          <p>Closed Calls</p>
          <div className="card-subtitle">All Time</div>
        </div>
        <div
          className="card success"
          onClick={() => navigate("/telecaller/appointments-done?filter=today")}
        >
          <h3>{realTimeStats.appointmentDone}</h3>
          <p>Successful</p>
          <div className="card-subtitle">Today's Appointments</div>
        </div>
      </div>

      <div className="tab-nav">
        <button
          className={activeTab === "today" ? "active" : ""}
          onClick={() => {
            setActiveTab("today");
            fetchTodaysActiveSuspects();
          }}
        >
          Today's Calls ({getTodaysNotContactedSuspects(todaysActiveSuspects).length})
        </button>
        <button
          className={activeTab === "scheduled" ? "active" : ""}
          onClick={() => {
            setActiveTab("scheduled");
            fetchScheduledCalls(selectedDate);
          }}
        >
          📅 Scheduled Calls ({scheduledSuspects.length})
        </button>
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => {
            setActiveTab("all");
            fetchAssignedSuspects();
          }}
        >
          All Assigned ({assignedSuspects.length})
        </button>
        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analytics
        </button>
      </div>

      {/* TODAY'S TAB - Show only Not Contacted */}
      {activeTab === "today" && (
        <div className="todays-calls">
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="refresh-btn"
              onClick={fetchTodaysActiveSuspects}
              disabled={assignedLoading}
            >
              {assignedLoading ? "🔄 Loading..." : "↻ Refresh Today's Calls"}
            </button>
            <div className="summary-info">
              <strong>Today's Not Contacted:</strong> {getTodaysNotContactedSuspects(todaysActiveSuspects).length} suspects
            </div>
          </div>

          <div className="table-container mt-3">
            {assignedLoading ? (
              <div className="text-center mt-4">
                <Spinner animation="border" />
                <p>Loading today's active suspects...</p>
              </div>
            ) : getTodaysNotContactedSuspects(todaysActiveSuspects).length === 0 ? (
              <div className="text-center mt-4">
                <p>No not contacted suspects for today.</p>
              </div>
            ) : (
              renderTable(todaysActiveSuspects, false, true)
            )}
          </div>
        </div>
      )}

      {/* ALL ASSIGNED TAB - Show all with old assigned highlighting */}
      {activeTab === "all" && (
        <div className="assigned-suspects">
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="refresh-btn"
              onClick={fetchAssignedSuspects}
              disabled={assignedLoading}
            >
              {assignedLoading ? "🔄 Loading..." : "↻ Refresh"}
            </button>
            <div className="summary-info">
              <strong>Today's Stats:</strong> {realTimeStats.notContacted} Pending • {realTimeStats.forwarded} Forwarded • {realTimeStats.callback} Callbacks • {realTimeStats.appointmentDone} Success
            </div>
          </div>

          <div className="table-container mt-3">
            {assignedLoading ? (
              <div className="text-center mt-4">
                <Spinner animation="border" />
                <p>Loading assigned suspects...</p>
              </div>
            ) : assignedError ? (
              <div className="text-center mt-4">
                <p className="text-danger">{assignedError}</p>
              </div>
            ) : assignedSuspects.length === 0 ? (
              <div className="text-center mt-4">
                <p>No suspects assigned to you yet.</p>
              </div>
            ) : (
              renderTable(assignedSuspects, true, false)
            )}
          </div>
        </div>
      )}

      {/* SCHEDULED TAB */}
      {activeTab === "scheduled" && (
        <div className="scheduled-calls">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="date-selector">
              <label>Select Date: </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => fetchScheduledCalls(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="summary-info">
              <strong>Scheduled Calls:</strong> {scheduledSuspects.length} suspects
            </div>
          </div>

          <div className="table-container">
            {assignedLoading ? (
              <div className="text-center mt-4">
                <Spinner animation="border" />
                <p>Loading scheduled calls...</p>
              </div>
            ) : scheduledSuspects.length === 0 ? (
              <div className="text-center mt-4">
                <p>No scheduled calls for {selectedDate}.</p>
              </div>
            ) : (
              renderTable(scheduledSuspects, true, false)
            )}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div className="analytics-tab">
          <AssignmentAnalytics assignedSuspects={assignedSuspects} />
        </div>
      )}

      {/* ACTION PANEL */}
      {actionPanel && (
        <div className="action-panel">
          <div className="action-header">
            <span>
              📩{" "}
              {actionPanel.suspect.personalDetails?.groupName ||
                actionPanel.suspect.personalDetails?.name ||
                "-"}
              {isAssigning && (
                <span style={{ marginLeft: "10px", color: "#f59e0b" }}>
                  🔄 Processing...
                </span>
              )}
            </span>
            <button
              className="close-btn"
              onClick={() => setActionPanel(null)}
              disabled={isAssigning}
            >
              ✖
            </button>
          </div>
          <div className="action-body">
            <div className="form-row">
              <label>Select New Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
                disabled={isAssigning}
              >
                <option value="">-- Select New Status --</option>
                <optgroup label="📞 Forwarded Statuses">
                  <option value="Call Not Picked">Call Not Picked</option>
                  <option value="Call After Sometimes">Call After Sometimes</option>
                  <option value="Busy on Another Call">Busy on Another Call</option>
                  <option value="Others">Others</option>
                </optgroup>
                <optgroup label="❌ Closed Statuses">
                  <option value="Not Reachable">Not Reachable</option>
                  <option value="Wrong Number">Wrong Number</option>
                  <option value="Not Interested">Not Interested</option>
                </optgroup>
                <optgroup label="✅ Success Status">
                  <option value="Appointment Done">Appointment Done</option>
                </optgroup>
                <optgroup label="🔔 Active Status">
                  <option value="Callback">Callback</option>
                </optgroup>
              </select>
            </div>

            {[
              "Call Not Picked",
              "Call After Sometimes",
              "Busy on Another Call",
              "Others",
            ].includes(formData.status) && (
              <>
                <div className="form-row">
                  <label>Next Call Date *</label>
                  <input
                    type="date"
                    name="nextCallDate"
                    value={formData.nextCallDate}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    disabled={isAssigning}
                  />
                </div>
                <div className="form-row">
                  <label>Next Call Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    required
                    disabled={isAssigning}
                  />
                </div>
              </>
            )}

            {formData.status === "Callback" && (
              <>
                <div className="form-row">
                  <label>Callback Date *</label>
                  <input
                    type="date"
                    name="nextCallDate"
                    value={formData.nextCallDate}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    disabled={isAssigning}
                  />
                </div>
                <div className="form-row">
                  <label>Callback Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    required
                    disabled={isAssigning}
                  />
                </div>
              </>
            )}

            {formData.status === "Appointment Done" && (
              <>
                <div className="form-row">
                  <label>Next Appointment Date *</label>
                  <input
                    type="date"
                    name="nextAppointmentDate"
                    value={formData.nextAppointmentDate}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    disabled={isAssigning}
                  />
                </div>
                <div className="form-row">
                  <label>Next Appointment Time *</label>
                  <input
                    type="time"
                    name="nextAppointmentTime"
                    value={formData.nextAppointmentTime}
                    onChange={handleFormChange}
                    required
                    disabled={isAssigning}
                  />
                </div>
              </>
            )}

            <div className="form-row">
              <label>
                Remarks{" "}
                {["Not Reachable", "Wrong Number", "Not Interested"].includes(
                  formData.status
                )
                  ? "*"
                  : ""}
              </label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleFormChange}
                placeholder={
                  formData.status === "Not Interested"
                    ? "Please specify reason for not interest..."
                    : formData.status === "Wrong Number"
                    ? "Please provide details..."
                    : formData.status === "Not Reachable"
                    ? "Please specify reachability issues..."
                    : "Enter remarks..."
                }
                style={{ width: "100%", minHeight: "80px", resize: "vertical" }}
                required={[
                  "Not Reachable",
                  "Wrong Number",
                  "Not Interested",
                ].includes(formData.status)}
                disabled={isAssigning}
              />
            </div>

            <div className="current-status-info">
              <small>
                <strong>Current Status:</strong>{" "}
                {getLatestCallStatus(actionPanel.suspect)}
              </small>
            </div>

            <div className="action-buttons-panel">
              <button
                className="cancel-btn"
                onClick={() => setActionPanel(null)}
                disabled={isAssigning}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isAssigning}
              >
                {isAssigning ? (
                  <>
                    <span className="spinner"></span>
                    Updating Status...
                  </>
                ) : (
                  `Update to ${formData.status || "New Status"}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;