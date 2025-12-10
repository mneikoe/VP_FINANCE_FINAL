import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSuspects } from "../../redux/feature/SuspectRedux/SuspectThunx";
import { toast } from "react-toastify";
import axiosInstance from "/src/config/axios";
import "./TaskAssign.css";

const TaskAssign = () => {
  const [activeTab, setActiveTab] = useState("suspects");
  const [employees, setEmployees] = useState({
    Telecaller: [],
    HR: [],
    Manager: [],
    OE: [],
    OA: [],
    Telemarketer: [],
    RM: [],
  });

  const [role, setRole] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedSuspects, setSelectedSuspects] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedMap, setAssignedMap] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState("");

  // RM assignment states
  const [rms, setRms] = useState([]);
  const [selectedRM, setSelectedRM] = useState("");
  const [selectedProspects, setSelectedProspects] = useState([]);
  const [rmAssignedMap, setRmAssignedMap] = useState({});
  const [loadingRMs, setLoadingRMs] = useState(false);
  const [rmSelectAll, setRmSelectAll] = useState(false);
  const [rmAssignmentNotes, setRmAssignmentNotes] = useState("");
  const [prospectsData, setProspectsData] = useState([]);
  const [loadingProspects, setLoadingProspects] = useState(false);

  const dispatch = useDispatch();
  const {
    suspects = [],
    loading,
    error,
  } = useSelector((state) => state.suspect);

  useEffect(() => {
    dispatch(getAllSuspects());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "suspects") {
      fetchAllEmployees();
      refreshAssignments();
    } else if (activeTab === "prospects") {
      fetchRMs();
      fetchRMAssignments();
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAllEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await axiosInstance.get("/api/telecaller");
      const telecallers = response.data.telecallers || [];

      const groupedEmployees = {
        Telecaller: telecallers.map((tc) => ({
          id: tc._id,
          name: tc.username,
          employeeCode: tc.employeeCode || `TC-${tc._id.slice(-4)}`,
          email: tc.email,
          mobileNo: tc.mobileno,
          designation: "Telecaller",
        })),
        HR: [],
        Manager: [],
        OE: [],
        OA: [],
        Telemarketer: [],
        RM: [],
      };

      setEmployees(groupedEmployees);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load telecallers");
      setEmployees({
        Telecaller: [],
        HR: [],
        Manager: [],
        OE: [],
        OA: [],
        Telemarketer: [],
        RM: [],
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchRMs = async () => {
    try {
      setLoadingRMs(true);
      console.log("🔄 Fetching Relationship Managers...");

      // First try the RM endpoint
      try {
        const response = await axiosInstance.get("/api/rm/all");
        if (response.data.success) {
          setRms(response.data.data || []);
          console.log(
            `Found ${response.data.data?.length || 0} RMs from /api/rm/all`
          );
          return;
        }
      } catch (rmError) {
        console.log("RM endpoint failed, trying employee endpoint...");
      }

      // Fallback to employee endpoint
      const response = await axiosInstance.get("/api/employee/getAllEmployees");
      if (response.data && response.data.data) {
        const allEmployees = response.data.data;
        const rms = allEmployees.filter((emp) => emp.role === "RM");
        setRms(
          rms.map((rm) => ({
            id: rm._id,
            name: rm.name,
            employeeCode: rm.employeeCode,
            email: rm.emailId,
            mobileNo: rm.mobileNo,
            designation: rm.designation || "Relationship Manager",
          }))
        );
        console.log(`Found ${rms.length} RMs from employee list`);
      } else {
        setRms([]);
      }
    } catch (error) {
      console.error("Error fetching RMs:", error);
      toast.error("Failed to load Relationship Managers");
      setRms([]);
    } finally {
      setLoadingRMs(false);
    }
  };

  // ✅ Fetch appointments (same as ProspectAppointmentList)
  const fetchAppointments = async () => {
    try {
      setLoadingProspects(true);
      console.log("📡 Fetching Appointment Scheduled prospects...");

      const response = await axiosInstance.get(
        "/api/suspect/appointments/scheduled"
      );

      if (response.data && response.data.success) {
        const appointmentsData = response.data.data.appointments || [];

        const processedProspects = appointmentsData.map(
          (appointment, index) => {
            const personalDetails = appointment.personalDetails || {};
            const telecallerInfo = appointment.assignedTo || {}; // यही use करना है

            return {
              key: appointment._id || index,
              id: appointment._id,
              sn: index + 1,
              groupCode:
                appointment.groupCode || personalDetails.groupCode || "-",
              groupName: personalDetails.groupName || "-",
              name: personalDetails.name || "Unknown",
              mobileNo: personalDetails.mobileNo || "-",
              contactNo: personalDetails.contactNo || "-",
              organisation: personalDetails.organisation || "-",
              city: personalDetails.city || "-",
              leadSource: personalDetails.leadSource || "-",
              leadName: personalDetails.leadName || "-",
              callingPurpose: personalDetails.callingPurpose || "-",
              grade: personalDetails.grade || "-",

              // ✅ PROSPECT STATUS
              prospectStatus: appointment.status || "suspect",

              // ✅ SCHEDULED ON
              scheduledOn: appointment.scheduledOn
                ? new Date(appointment.scheduledOn)
                : null,

              // ✅ SCHEDULED BY - assignedTo से लेना है
              scheduledBy: {
                name: telecallerInfo.username || "Unassigned", // यहाँ change
                employeeCode: telecallerInfo.employeeCode || "-",
                id: telecallerInfo._id,
              },

              appointmentDate: appointment.appointmentDate
                ? new Date(appointment.appointmentDate)
                : null,
              appointmentTime: appointment.appointmentTime || "-",
              assignedTo: appointment.assignedTo || null,
              assignedRole: appointment.assignedRole || null,
            };
          }
        );

        console.log(
          `✅ Processed ${processedProspects.length} prospects with appointments`
        );
        setProspectsData(processedProspects);
      } else {
        console.error("Failed to fetch appointments:", response.data?.message);
        toast.error(response.data?.message || "Failed to fetch appointments");
        setProspectsData([]);
      }
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      toast.error(
        error.response?.data?.message || "Error loading appointments."
      );
      setProspectsData([]);
    } finally {
      setLoadingProspects(false);
    }
  };

  const refreshAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await axiosInstance.get("/api/telecaller/assignments");
      const result = response.data;

      if (response.ok && result.success) {
        const newAssignedMap = {};
        result.data.forEach((assignment) => {
          newAssignedMap[assignment.suspectId] = {
            telecallerName: assignment.telecallerName,
            assignedAt: assignment.assignedAt,
            status: assignment.status,
          };
        });
        setAssignedMap(newAssignedMap);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to refresh assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchRMAssignments = async () => {
    try {
      setLoadingAssignments(true);

      // ✅ SIRF RMAssignment endpoint se data lao
      const response = await axiosInstance.get("/api/rm/assignments");

      if (response.data.success) {
        const newRmAssignedMap = {};
        response.data.data.forEach((assignment) => {
          if (assignment.prospectId) {
            newRmAssignedMap[assignment.prospectId] = {
              rmName: assignment.rmName,
              rmCode: assignment.rmCode,
              assignedAt: assignment.assignedAt,
            };
          }
        });
        setRmAssignedMap(newRmAssignedMap);
      }
    } catch (error) {
      console.error("Error fetching RM assignments:", error);
      // Silent fail - assignment map empty rahega
    } finally {
      setLoadingAssignments(false);
    }
  };

  // ✅ handleRMAssign - FIXED
  const handleRMAssign = async () => {
    if (!selectedRM || selectedProspects.length === 0) {
      toast.error("Please select an RM and at least one prospect");
      return;
    }

    const selectedRMData = rms.find((r) => r.id === selectedRM);
    if (!selectedRMData) {
      toast.error("Selected RM not found");
      return;
    }

    setIsAssigning(true);

    try {
      // ✅ SIRF RM endpoint use karo
      const response = await axiosInstance.post("/api/rm/assign-prospects", {
        rmId: selectedRM,
        rmName: selectedRMData.name,
        rmCode: selectedRMData.employeeCode,
        prospects: selectedProspects,
        assignmentNotes: rmAssignmentNotes,
      });

      if (response.data.success) {
        toast.success(
          `✅ ${selectedProspects.length} prospects assigned to ${selectedRMData.name}!`
        );

        // Update local state
        const newAssignments = {};
        selectedProspects.forEach((prospectId) => {
          newAssignments[prospectId] = {
            rmName: `${selectedRMData.name} (${selectedRMData.employeeCode})`,
            assignedAt: new Date().toISOString(),
          };
        });

        setRmAssignedMap((prev) => ({ ...prev, ...newAssignments }));
        setSelectedProspects([]);
        setRmSelectAll(false);
        setSelectedRM("");
        setRmAssignmentNotes("");

        // Refresh data
        fetchAppointments();
        fetchRMAssignments();

        console.log(
          "✅ RM assignment successful - RMAssignment collection updated"
        );
      } else {
        toast.error(response.data.message || "Assignment failed");
      }
    } catch (error) {
      console.error("RM Assignment error:", error);
      toast.error(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const getTodaysSuspects = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return suspects
      .filter((suspect) => {
        if (!suspect.createdAt) return false;
        const suspectDate = new Date(suspect.createdAt);
        return suspectDate >= today;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getProspectsWithAppointments = () => {
    return prospectsData.filter((prospect) => {
      return prospect.prospectStatus === "prospect" && prospect.appointmentDate;
    });
  };

  const getAvailableSuspects = () => {
    const todaysSuspects = getTodaysSuspects();
    return todaysSuspects.filter((suspect) => !assignedMap[suspect._id]);
  };

  const getAvailableProspects = () => {
    const prospects = getProspectsWithAppointments();
    return prospects.filter((prospect) => !rmAssignedMap[prospect.id]);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSuspects([]);
      setSelectAll(false);
    } else {
      const availableSuspectIds = getAvailableSuspects().map(
        (suspect) => suspect._id
      );
      setSelectedSuspects(availableSuspectIds);
      setSelectAll(true);
    }
  };

  const handleRMSelectAll = () => {
    if (rmSelectAll) {
      setSelectedProspects([]);
      setRmSelectAll(false);
    } else {
      const availableProspectIds = getAvailableProspects().map(
        (prospect) => prospect.id
      );
      setSelectedProspects(availableProspectIds);
      setRmSelectAll(true);
    }
  };

  const handleSuspectSelect = (suspectId) => {
    if (assignedMap[suspectId]) {
      toast.warning(
        `This suspect is already assigned to ${assignedMap[suspectId].telecallerName}`
      );
      return;
    }

    setSelectedSuspects((prev) => {
      const newSelection = prev.includes(suspectId)
        ? prev.filter((s) => s !== suspectId)
        : [...prev, suspectId];

      const availableCount = getAvailableSuspects().length;
      setSelectAll(
        newSelection.length === availableCount && availableCount > 0
      );

      return newSelection;
    });
  };

  const handleProspectSelect = (prospectId) => {
    if (rmAssignedMap[prospectId]) {
      toast.warning(
        `This prospect is already assigned to ${rmAssignedMap[prospectId].rmName}`
      );
      return;
    }

    setSelectedProspects((prev) => {
      const newSelection = prev.includes(prospectId)
        ? prev.filter((s) => s !== prospectId)
        : [...prev, prospectId];

      const availableCount = getAvailableProspects().length;
      setRmSelectAll(
        newSelection.length === availableCount && availableCount > 0
      );

      return newSelection;
    });
  };

  const getAssignmentInfo = (suspectId) => {
    return assignedMap[suspectId] || null;
  };

  const getRMAssignmentInfo = (prospectId) => {
    return rmAssignedMap[prospectId] || null;
  };

  const getPersonName = () => {
    if (!role || !selectedPerson) return "-";
    const roleEmployees = employees[role];
    const person = roleEmployees.find((emp) => emp.id === selectedPerson);
    return person ? `${person.name} (${person.employeeCode})` : "-";
  };

  const getRMName = () => {
    if (!selectedRM) return "-";
    const rm = rms.find((r) => r.id === selectedRM);
    return rm ? `${rm.name} (${rm.employeeCode})` : "-";
  };

  const handleAssign = async () => {
    if (!role || !selectedPerson || selectedSuspects.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const alreadyAssigned = selectedSuspects.filter((id) => assignedMap[id]);
    if (alreadyAssigned.length > 0) {
      toast.error(
        "Some suspects are already assigned. Please refresh the page."
      );
      return;
    }

    setIsAssigning(true);

    try {
      const selectedEmployee = employees[role].find(
        (emp) => emp.id === selectedPerson
      );

      if (!selectedEmployee) {
        toast.error("Selected employee not found");
        return;
      }

      const response = await axiosInstance.post(
        "/api/telecaller/assign-suspects",
        {
          role: role,
          selectedPerson: selectedPerson,
          selectedPersonName: selectedEmployee.name,
          selectedPersonCode: selectedEmployee.employeeCode,
          suspects: selectedSuspects,
          assignmentNotes: assignmentNotes,
        }
      );

      const result = response.data;

      if (result.success) {
        toast.success(
          `✅ ${selectedSuspects.length} suspects assigned to ${selectedEmployee.name}!`
        );

        const newAssignments = {};
        const personDisplayName = `${selectedEmployee.name} (${selectedEmployee.employeeCode})`;

        selectedSuspects.forEach((suspectId) => {
          newAssignments[suspectId] = {
            telecallerName: personDisplayName,
            assignedAt: new Date().toISOString(),
            status: "assigned",
          };
        });

        setAssignedMap((prev) => ({ ...prev, ...newAssignments }));
        setSelectedSuspects([]);
        setSelectAll(false);
        setRole("");
        setSelectedPerson("");
        setAssignmentNotes("");

        dispatch(getAllSuspects());
        refreshAssignments();
      } else {
        toast.error(result.message || "Assignment failed");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  // ✅ Format date
  const formatDate = (date) => {
    if (!date) return "-";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Format time
  const formatTime = (time) => {
    if (!time || time === "-") return "-";
    return time;
  };

  // ✅ Get prospect status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      suspect: { color: "#1890ff", bg: "#e6f7ff", label: "Suspect" },
      prospect: { color: "#52c41a", bg: "#f6ffed", label: "Prospect" },
      client: { color: "#722ed1", bg: "#f9f0ff", label: "Client" },
      lead: { color: "#fa8c16", bg: "#fff7e6", label: "Lead" },
    };

    const config = statusConfig[status] || statusConfig["suspect"];

    return (
      <span
        className="status-badge"
        style={{
          background: config.bg,
          color: config.color,
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.3px",
        }}
      >
        {config.label}
      </span>
    );
  };

  // ✅ Statistics
  const todaysSuspects = getTodaysSuspects();
  const availableSuspects = getAvailableSuspects();
  const prospectsWithAppointments = getProspectsWithAppointments();
  const availableProspects = getAvailableProspects();

  const suspectStats = {
    total: todaysSuspects.length,
    assigned: todaysSuspects.filter((suspect) => assignedMap[suspect._id])
      .length,
    unassigned: availableSuspects.length,
    selected: selectedSuspects.length,
  };

  const prospectStats = {
    total: prospectsWithAppointments.length,
    assigned: prospectsWithAppointments.filter(
      (prospect) => rmAssignedMap[prospect.id]
    ).length,
    unassigned: availableProspects.length,
    selected: selectedProspects.length,
  };

  return (
    <div className="task-assign-container">
      {/* Header with Tabs */}
      <div className="task-assign-header">
        <h1 className="page-title">📋 Task Assignment</h1>
        <p className="page-subtitle">
          Assign tasks to telecallers and relationship managers
        </p>

        <div className="task-tabs">
          <button
            className={`task-tab ${activeTab === "suspects" ? "active" : ""}`}
            onClick={() => setActiveTab("suspects")}
          >
            <span className="tab-icon">📞</span>
            <span className="tab-label">Suspects to Telecaller</span>
            <span className="tab-badge">{suspectStats.total}</span>
          </button>

          <button
            className={`task-tab ${activeTab === "prospects" ? "active" : ""}`}
            onClick={() => setActiveTab("prospects")}
          >
            <span className="tab-icon">🤝</span>
            <span className="tab-label">Prospects to RM</span>
            <span className="tab-badge">{prospectStats.total}</span>
          </button>
        </div>
      </div>

      {/* Suspects to Telecaller Tab */}
      {activeTab === "suspects" && (
        <div className="assignment-section">
          {/* Statistics Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon total">📊</div>
              <div className="stat-content">
                <div className="stat-value">{suspectStats.total}</div>
                <div className="stat-label">Today's Total</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon assigned">✅</div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: "#28a745" }}>
                  {suspectStats.assigned}
                </div>
                <div className="stat-label">Assigned</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon available">📋</div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: "#007bff" }}>
                  {suspectStats.unassigned}
                </div>
                <div className="stat-label">Available</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon selected">🎯</div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: "#ffc107" }}>
                  {suspectStats.selected}
                </div>
                <div className="stat-label">Selected</div>
              </div>
            </div>
          </div>

          {/* Assignment Panel */}
          <div className="assignment-panel">
            <div className="panel-header">
              <h3>📞 Assign Suspects to Telecaller</h3>
              <div className="panel-actions">
                <button
                  className="refresh-btn"
                  onClick={() => {
                    refreshAssignments();
                    fetchAllEmployees();
                  }}
                  disabled={loadingAssignments}
                >
                  {loadingAssignments ? "🔄" : "↻"} Refresh
                </button>
              </div>
            </div>

            {/* Employee Selection */}
            <div className="selection-filters">
              <div className="filter-group">
                <label>Select Role</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setSelectedPerson("");
                  }}
                  disabled={isAssigning || loadingEmployees}
                  className="filter-select"
                >
                  <option value="">Choose Role</option>
                  <option value="Telecaller">
                    Telecaller ({employees.Telecaller.length})
                  </option>
                </select>
              </div>

              <div className="filter-group">
                <label>Select Telecaller</label>
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  disabled={!role || isAssigning || loadingEmployees}
                  className="filter-select"
                >
                  <option value="">Choose Telecaller</option>
                  {employees.Telecaller.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.name} ({tc.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Assignment Notes (Optional)</label>
                <input
                  type="text"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Add notes for this assignment..."
                  className="notes-input"
                  disabled={isAssigning}
                />
              </div>
            </div>

            {/* Selection Summary */}
            {(role || selectedPerson || selectedSuspects.length > 0) && (
              <div className="selection-summary-card">
                <div className="summary-item">
                  <span className="summary-label">Role:</span>
                  <span className="summary-value">{role || "-"}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Telecaller:</span>
                  <span className="summary-value">{getPersonName()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Selected:</span>
                  <span className="summary-value">
                    <span className="selected-count">
                      {selectedSuspects.length}
                    </span>
                    out of {suspectStats.unassigned} available
                  </span>
                </div>
                <div className="summary-item">
                  <button
                    className="select-all-btn"
                    onClick={handleSelectAll}
                    disabled={suspectStats.unassigned === 0}
                  >
                    {selectAll ? "❌ Deselect All" : "✅ Select All Available"}
                  </button>
                </div>
              </div>
            )}

            {/* Suspects List Table */}
            <div className="table-container">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="checkbox-column">
                        <input
                          type="checkbox"
                          checked={selectAll && suspectStats.unassigned > 0}
                          onChange={handleSelectAll}
                          disabled={suspectStats.unassigned === 0}
                          title={
                            suspectStats.unassigned === 0
                              ? "No available suspects"
                              : "Select all available"
                          }
                        />
                      </th>
                      <th>#</th>
                      <th>Group Code</th>
                      <th>Grade</th>
                      <th>Group Name</th>
                      <th>Name</th>
                      <th>Contact Numbers</th>
                      <th>Lead Source</th>
                      <th>Lead Name</th>
                      <th>Calling Purpose</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="12" className="loading-cell">
                          <div className="loading-indicator">
                            <div className="loading-spinner"></div>
                            Loading suspects...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="12" className="error-cell">
                          ❌ Error loading suspects
                        </td>
                      </tr>
                    ) : todaysSuspects.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="empty-cell">
                          📭 No suspects found for today
                        </td>
                      </tr>
                    ) : (
                      todaysSuspects.map((suspect, index) => {
                        const isSelected = selectedSuspects.includes(
                          suspect._id
                        );
                        const assignment = getAssignmentInfo(suspect._id);
                        const isAssigned = !!assignment;
                        const personal = suspect.personalDetails || {};

                        return (
                          <tr
                            key={suspect._id}
                            className={`
                              ${isAssigned ? "assigned" : ""} 
                              ${isSelected ? "selected" : ""}
                            `}
                          >
                            <td className="checkbox-column">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleSuspectSelect(suspect._id)
                                }
                                disabled={isAssigning || isAssigned}
                                title={
                                  isAssigned
                                    ? `Assigned to: ${assignment.telecallerName}`
                                    : "Select for assignment"
                                }
                              />
                            </td>
                            <td className="index-column">{index + 1}</td>
                            <td>{personal.groupCode || "-"}</td>
                            <td>{personal.grade || "-"}</td>
                            <td>{personal.groupName || "-"}</td>
                            <td>{personal.name || "-"}</td>
                            <td>
                              <div className="contact-info">
                                {personal.mobileNo && (
                                  <div>📱 {personal.mobileNo}</div>
                                )}
                                {personal.contactNo &&
                                  personal.contactNo !== personal.mobileNo && (
                                    <div>📞 {personal.contactNo}</div>
                                  )}
                              </div>
                            </td>
                            <td>{personal.leadSource || "-"}</td>
                            <td>{personal.leadName || "-"}</td>
                            <td>{personal.callingPurpose || "-"}</td>
                            <td>
                              {getStatusBadge(suspect.status || "suspect")}
                            </td>
                            <td>
                              {assignment ? (
                                <div className="assigned-info">
                                  <div className="assigned-person">
                                    ✅ {assignment.telecallerName}
                                  </div>
                                  <div className="assigned-date">
                                    {formatDate(assignment.assignedAt)}
                                  </div>
                                </div>
                              ) : isSelected ? (
                                <div className="to-assign-info">
                                  ⏳ {getPersonName()}
                                </div>
                              ) : (
                                <span className="not-assigned">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedSuspects.length > 0 && (
              <div className="action-buttons">
                <div className="action-info">
                  <span className="selection-count">
                    🎯 <strong>{selectedSuspects.length}</strong> suspects
                    selected for assignment
                  </span>
                  <span className="assign-to-info">
                    to <strong>{getPersonName()}</strong> ({role})
                  </span>
                </div>
                <div className="button-group">
                  <button
                    className="clear-btn"
                    onClick={() => {
                      setSelectedSuspects([]);
                      setSelectAll(false);
                    }}
                  >
                    🗑️ Clear Selection
                  </button>
                  <button
                    className="assign-btn"
                    onClick={handleAssign}
                    disabled={isAssigning}
                  >
                    {isAssigning ? (
                      <>
                        <span className="spinner"></span>
                        Assigning...
                      </>
                    ) : (
                      `🚀 Assign ${selectedSuspects.length} Suspects`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prospects to RM Tab */}
      {activeTab === "prospects" && (
        <div className="assignment-section">
          {/* Statistics Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon total">📊</div>
              <div className="stat-content">
                <div className="stat-value">{prospectStats.total}</div>
                <div className="stat-label">Total Prospects</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon assigned">✅</div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: "#28a745" }}>
                  {prospectStats.assigned}
                </div>
                <div className="stat-label">Assigned to RM</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon available">📋</div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: "#007bff" }}>
                  {prospectStats.unassigned}
                </div>
                <div className="stat-label">Available</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon selected">🎯</div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: "#ffc107" }}>
                  {prospectStats.selected}
                </div>
                <div className="stat-label">Selected</div>
              </div>
            </div>
          </div>

          {/* Assignment Panel */}
          <div className="assignment-panel">
            <div className="panel-header">
              <h3>🤝 Assign Prospects to Relationship Manager</h3>
              <div className="panel-actions">
                <button
                  className="refresh-btn"
                  onClick={() => {
                    fetchRMAssignments();
                    fetchRMs();
                    fetchAppointments();
                  }}
                  disabled={loadingAssignments || loadingProspects}
                >
                  {loadingAssignments || loadingProspects ? "🔄" : "↻"} Refresh
                </button>
              </div>
            </div>

            {/* RM Selection */}
            <div className="selection-filters">
              <div className="filter-group">
                <label>Select Relationship Manager</label>
                <select
                  value={selectedRM}
                  onChange={(e) => setSelectedRM(e.target.value)}
                  disabled={isAssigning || loadingRMs}
                  className="filter-select"
                >
                  <option value="">Choose RM</option>
                  {rms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} ({rm.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Assignment Notes (Optional)</label>
                <input
                  type="text"
                  value={rmAssignmentNotes}
                  onChange={(e) => setRmAssignmentNotes(e.target.value)}
                  placeholder="Add notes for this assignment..."
                  className="notes-input"
                  disabled={isAssigning}
                />
              </div>
            </div>

            {/* Selection Summary */}
            {(selectedRM || selectedProspects.length > 0) && (
              <div className="selection-summary-card">
                <div className="summary-item">
                  <span className="summary-label">Selected RM:</span>
                  <span className="summary-value">{getRMName()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Selected:</span>
                  <span className="summary-value">
                    <span className="selected-count">
                      {selectedProspects.length}
                    </span>
                    out of {prospectStats.unassigned} available
                  </span>
                </div>
                <div className="summary-item">
                  <button
                    className="select-all-btn"
                    onClick={handleRMSelectAll}
                    disabled={prospectStats.unassigned === 0}
                  >
                    {rmSelectAll
                      ? "❌ Deselect All"
                      : "✅ Select All Available"}
                  </button>
                </div>
              </div>
            )}

            {/* Prospects List Table - WITH ALL REQUIRED COLUMNS */}
            <div className="table-container">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="checkbox-column">
                        <input
                          type="checkbox"
                          checked={rmSelectAll && prospectStats.unassigned > 0}
                          onChange={handleRMSelectAll}
                          disabled={prospectStats.unassigned === 0}
                          title={
                            prospectStats.unassigned === 0
                              ? "No available prospects"
                              : "Select all available"
                          }
                        />
                      </th>
                      <th>#</th>
                      <th>Group Code</th>
                      <th>Grade</th>
                      <th>Group Name</th>
                      <th>Name</th>
                      <th>Contact Numbers</th>
                      <th>Lead Source</th>
                      <th>Lead Name</th>
                      <th>Calling Purpose</th>

                      {/* ✅ APPOINTMENT DATE COLUMN */}
                      <th>Appointment Date</th>

                      {/* ✅ SCHEDULED ON COLUMN */}
                      <th>Scheduled On</th>

                      {/* ✅ SCHEDULED BY COLUMN */}
                      <th>Scheduled By</th>

                      {/* ✅ PROSPECT STATUS COLUMN */}
                      <th>Status</th>

                      <th>Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProspects ? (
                      <tr>
                        <td colSpan="16" className="loading-cell">
                          <div className="loading-indicator">
                            <div className="loading-spinner"></div>
                            Loading prospects...
                          </div>
                        </td>
                      </tr>
                    ) : prospectsWithAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="16" className="empty-cell">
                          📭 No prospects with appointments found
                        </td>
                      </tr>
                    ) : (
                      prospectsWithAppointments.map((prospect, index) => {
                        const isSelected = selectedProspects.includes(
                          prospect.id
                        );
                        const assignment = getRMAssignmentInfo(prospect.id);
                        const isAssigned = !!assignment;

                        return (
                          <tr
                            key={prospect.id}
                            className={`
                  ${isAssigned ? "assigned" : ""} 
                  ${isSelected ? "selected" : ""}
                `}
                          >
                            <td className="checkbox-column">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleProspectSelect(prospect.id)
                                }
                                disabled={
                                  isAssigning || isAssigned || !selectedRM
                                }
                                title={
                                  isAssigned
                                    ? `Assigned to: ${assignment.rmName}`
                                    : !selectedRM
                                    ? "Select an RM first"
                                    : "Select for assignment"
                                }
                              />
                            </td>
                            <td className="index-column">{index + 1}</td>
                            <td>{prospect.groupCode}</td>
                            <td>{prospect.grade}</td>
                            <td>{prospect.groupName}</td>
                            <td>{prospect.name}</td>
                            <td>
                              <div className="contact-info">
                                {prospect.mobileNo &&
                                  prospect.mobileNo !== "-" && (
                                    <div>📱 {prospect.mobileNo}</div>
                                  )}
                                {prospect.contactNo &&
                                  prospect.contactNo !== "-" &&
                                  prospect.contactNo !== prospect.mobileNo && (
                                    <div>📞 {prospect.contactNo}</div>
                                  )}
                              </div>
                            </td>
                            <td>{prospect.leadSource}</td>
                            <td>{prospect.leadName}</td>
                            <td>{prospect.callingPurpose}</td>

                            {/* ✅ APPOINTMENT DATE CELL */}
                            <td>
                              {prospect.appointmentDate ? (
                                <div className="appointment-info">
                                  <div className="appointment-date">
                                    📅 {formatDate(prospect.appointmentDate)}
                                  </div>
                                  <div className="appointment-time">
                                    🕒 {formatTime(prospect.appointmentTime)}
                                  </div>
                                </div>
                              ) : (
                                <span className="no-appointment">-</span>
                              )}
                            </td>

                            {/* ✅ SCHEDULED ON CELL */}
                            <td>
                              {prospect.scheduledOn ? (
                                <div className="scheduled-on-info">
                                  <div className="scheduled-date">
                                    {formatDate(prospect.scheduledOn)}
                                  </div>
                                </div>
                              ) : (
                                <span className="not-scheduled">-</span>
                              )}
                            </td>

                            {/* ✅ SCHEDULED BY CELL (यह add करना था) */}
                            <td>
                              {prospect.scheduledBy ? (
                                <div className="scheduled-by-info">
                                  <div className="telecaller-name">
                                    <span className="telecaller-icon">📞</span>
                                    {prospect.scheduledBy.name === "Unassigned"
                                      ? "Unknown"
                                      : prospect.scheduledBy.name}
                                  </div>
                                  {prospect.scheduledBy.employeeCode &&
                                    prospect.scheduledBy.employeeCode !==
                                      "-" && (
                                      <div className="employee-code">
                                        ({prospect.scheduledBy.employeeCode})
                                      </div>
                                    )}
                                </div>
                              ) : (
                                <span className="unknown-telecaller">
                                  Unknown
                                </span>
                              )}
                            </td>

                            {/* ✅ PROSPECT STATUS CELL */}
                            <td>
                              {getStatusBadge(
                                prospect.prospectStatus || "prospect"
                              )}
                            </td>

                            <td>
                              {assignment ? (
                                <div className="assigned-info">
                                  <div className="assigned-person">
                                    ✅ {assignment.rmName}
                                  </div>
                                  <div className="assigned-date">
                                    {formatDate(assignment.assignedAt)}
                                  </div>
                                </div>
                              ) : isSelected ? (
                                <div className="to-assign-info">
                                  ⏳ {getRMName()}
                                </div>
                              ) : (
                                <span className="not-assigned">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedProspects.length > 0 && (
              <div className="action-buttons">
                <div className="action-info">
                  <span className="selection-count">
                    🎯 <strong>{selectedProspects.length}</strong> prospects
                    selected for assignment
                  </span>
                  <span className="assign-to-info">
                    to <strong>{getRMName()}</strong>
                  </span>
                </div>
                <div className="button-group">
                  <button
                    className="clear-btn"
                    onClick={() => {
                      setSelectedProspects([]);
                      setRmSelectAll(false);
                    }}
                  >
                    🗑️ Clear Selection
                  </button>
                  <button
                    className="assign-btn"
                    onClick={handleRMAssign}
                    disabled={isAssigning}
                  >
                    {isAssigning ? (
                      <>
                        <span className="spinner"></span>
                        Assigning...
                      </>
                    ) : (
                      `🚀 Assign ${selectedProspects.length} Prospects`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAssign;
