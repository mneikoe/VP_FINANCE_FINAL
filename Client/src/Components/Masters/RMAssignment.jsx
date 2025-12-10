// RMAssignment.jsx (Updated - Only shows suspects)
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "/src/config/axios";
import "./TaskAssign.css";

const RMAssignment = () => {
  const [rms, setRms] = useState([]);
  const [selectedRM, setSelectedRM] = useState("");
  const [selectedSuspects, setSelectedSuspects] = useState([]);
  const [rmAssignedMap, setRmAssignedMap] = useState({});
  const [loadingRMs, setLoadingRMs] = useState(false);
  const [rmSelectAll, setRmSelectAll] = useState(false);
  const [rmAssignmentNotes, setRmAssignmentNotes] = useState("");
  const [suspectsData, setSuspectsData] = useState([]);
  const [loadingSuspects, setLoadingSuspects] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  useEffect(() => {
    fetchRMs();
    fetchRMAssignments(); // ✅ यह फंक्शन अब नीचे परिभाषित है
    fetchAppointmentSuspects();
  }, []);

  const fetchRMAssignments = async () => {
    try {
      setLoadingAssignments(true);
      console.log("📡 Fetching existing RM assignments...");

      // ये endpoint तुम्हारे backend के according change करना
      const response = await axiosInstance.get("/api/rm/assignments");

      if (response.data && response.data.success) {
        const assignments = response.data.data || [];

        // assignments को map में convert करो
        const assignmentMap = {};
        assignments.forEach((assignment) => {
          if (assignment.suspectId) {
            assignmentMap[assignment.suspectId] = {
              rmName: assignment.rmName || "Unknown RM",
              rmCode: assignment.rmCode || "-",
              assignedAt: assignment.assignedAt || new Date().toISOString(),
            };
          }
        });

        setRmAssignedMap(assignmentMap);
        console.log(
          `✅ Loaded ${Object.keys(assignmentMap).length} assignments`
        );
      } else {
        console.log("No existing assignments found");
        setRmAssignedMap({});
      }
    } catch (error) {
      console.error("❌ Error fetching assignments:", error);
      // Silently fail, don't show error to user
      setRmAssignedMap({});
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchRMs = async () => {
    try {
      setLoadingRMs(true);
      console.log("🔄 Fetching Relationship Managers...");

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

  const fetchAppointmentSuspects = async () => {
    try {
      setLoadingSuspects(true);
      console.log("📡 Fetching Appointment Scheduled SUSPECTS...");

      const response = await axiosInstance.get("/api/rm/suspects");

      if (response.data && response.data.success) {
        const suspectsData = response.data.data || [];

        const processedSuspects = suspectsData.map((suspect, index) => {
          const assignedTo = suspect.assignedTo || {};
          return {
            key: suspect.id || index,
            id: suspect.id,
            sn: index + 1,
            groupCode: suspect.groupCode || "-",
            groupName: suspect.groupName || "-",
            name: suspect.name || "Unknown",
            mobileNo: suspect.mobileNo || "-",
            contactNo: suspect.contactNo || "-",
            organisation: suspect.organisation || "-",
            city: suspect.city || "-",
            leadSource: suspect.leadSource || "-",
            leadName: suspect.leadName || "-",
            callingPurpose: suspect.callingPurpose || "-",
            grade: suspect.grade || "-",
            gender: suspect.gender || "-",
            area: suspect.area || "-",
            status: "suspect",
            scheduledOn: suspect.scheduledOn
              ? new Date(suspect.scheduledOn)
              : null,
            appointmentDate: suspect.appointmentDate
              ? new Date(suspect.appointmentDate)
              : null,
            appointmentTime: suspect.appointmentTime || "-",
            appointmentRemarks: suspect.appointmentRemarks || "-",
            scheduledBy: {
              name: assignedTo.username || "Unassigned",
              employeeCode: assignedTo.employeeCode || "-",
              _id: assignedTo._id || null,
            },
          };
        });

        console.log(
          `✅ Processed ${processedSuspects.length} SUSPECTS with appointments`
        );
        setSuspectsData(processedSuspects);
      } else {
        console.error("Failed to fetch suspects:", response.data?.message);
        toast.error(response.data?.message || "Failed to fetch suspects");
        setSuspectsData([]);
      }
    } catch (error) {
      console.error("❌ Error fetching suspects:", error);
      toast.error(error.response?.data?.message || "Error loading suspects.");
      setSuspectsData([]);
    } finally {
      setLoadingSuspects(false);
    }
  };

  const handleRMAssign = async () => {
    if (!selectedRM || selectedSuspects.length === 0) {
      toast.error("Please select an RM and at least one suspect");
      return;
    }

    const selectedRMData = rms.find((r) => r.id === selectedRM);
    if (!selectedRMData) {
      toast.error("Selected RM not found");
      return;
    }

    setIsAssigning(true);

    try {
      const response = await axiosInstance.post("/api/rm/assign-suspects", {
        rmId: selectedRM,
        rmName: selectedRMData.name,
        rmCode: selectedRMData.employeeCode,
        suspects: selectedSuspects,
        assignmentNotes: rmAssignmentNotes,
      });

      if (response.data.success) {
        toast.success(
          `✅ ${selectedSuspects.length} suspects assigned to ${selectedRMData.name}!`
        );

        // Update local state
        const newAssignments = {};
        selectedSuspects.forEach((suspectId) => {
          newAssignments[suspectId] = {
            rmName: `${selectedRMData.name} (${selectedRMData.employeeCode})`,
            rmCode: selectedRMData.employeeCode,
            assignedAt: new Date().toISOString(),
          };
        });

        setRmAssignedMap((prev) => ({ ...prev, ...newAssignments }));
        setSelectedSuspects([]);
        setRmSelectAll(false);
        setSelectedRM("");
        setRmAssignmentNotes("");

        // Refresh data
        fetchAppointmentSuspects();
        fetchRMAssignments();

        console.log("✅ RM assignment successful for suspects");
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

  const getSuspectsWithAppointments = () => {
    return suspectsData.filter((suspect) => {
      return suspect.status === "suspect" && suspect.appointmentDate;
    });
  };

  const getAvailableSuspects = () => {
    const suspects = getSuspectsWithAppointments();
    return suspects.filter((suspect) => !rmAssignedMap[suspect.id]);
  };

  const handleRMSelectAll = () => {
    if (rmSelectAll) {
      setSelectedSuspects([]);
      setRmSelectAll(false);
    } else {
      const availableSuspectIds = getAvailableSuspects().map(
        (suspect) => suspect.id
      );
      setSelectedSuspects(availableSuspectIds);
      setRmSelectAll(true);
    }
  };

  const handleSuspectSelect = (suspectId) => {
    if (rmAssignedMap[suspectId]) {
      toast.warning(
        `This suspect is already assigned to ${rmAssignedMap[suspectId].rmName}`
      );
      return;
    }

    setSelectedSuspects((prev) => {
      const newSelection = prev.includes(suspectId)
        ? prev.filter((s) => s !== suspectId)
        : [...prev, suspectId];

      const availableCount = getAvailableSuspects().length;
      setRmSelectAll(
        newSelection.length === availableCount && availableCount > 0
      );

      return newSelection;
    });
  };

  const getRMAssignmentInfo = (suspectId) => {
    return rmAssignedMap[suspectId] || null;
  };

  const getRMName = () => {
    if (!selectedRM) return "-";
    const rm = rms.find((r) => r.id === selectedRM);
    return rm ? `${rm.name} (${rm.employeeCode})` : "-";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  const formatTime = (time) => {
    if (!time || time === "-") return "-";
    return time;
  };

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

  const suspectsWithAppointments = getSuspectsWithAppointments();
  const availableSuspects = getAvailableSuspects();

  const suspectStats = {
    total: suspectsWithAppointments.length,
    assigned: suspectsWithAppointments.filter(
      (suspect) => rmAssignedMap[suspect.id]
    ).length,
    unassigned: availableSuspects.length,
    selected: selectedSuspects.length,
  };

  return (
    <div className="rm-assignment-container">
      <div className="assignment-header">
        <h2 className="page-title">
          🤝 Assign Appointment Scheduled Suspects to Relationship Manager
        </h2>
        <p className="page-subtitle">
          Assign suspects with appointments to Relationship Managers
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-content">
            <div className="stat-value">{suspectStats.total}</div>
            <div className="stat-label">Total Suspects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon assigned">✅</div>
          <div className="stat-content">
            <div className="stat-value" style={{ color: "#28a745" }}>
              {suspectStats.assigned}
            </div>
            <div className="stat-label">Assigned to RM</div>
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

      {/* RM Selection Section */}
      <div className="selection-section">
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

          <div className="filter-group">
            <button
              className="refresh-btn"
              onClick={() => {
                fetchRMAssignments();
                fetchRMs();
                fetchAppointmentSuspects();
              }}
              disabled={loadingAssignments || loadingSuspects}
            >
              {loadingAssignments || loadingSuspects ? "🔄" : "↻"} Refresh
            </button>
          </div>
        </div>

        {/* Selection Summary */}
        {(selectedRM || selectedSuspects.length > 0) && (
          <div className="selection-summary-card">
            <div className="summary-item">
              <span className="summary-label">Selected RM:</span>
              <span className="summary-value">{getRMName()}</span>
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
                onClick={handleRMSelectAll}
                disabled={suspectStats.unassigned === 0}
              >
                {rmSelectAll ? "❌ Deselect All" : "✅ Select All Available"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suspects Table - ONLY SUSPECTS */}
      <div className="table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={rmSelectAll && suspectStats.unassigned > 0}
                    onChange={handleRMSelectAll}
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
                <th>Gender</th>
                <th>Contact Numbers</th>
                <th>Lead Source</th>
                <th>Lead Name</th>
                <th>Area</th>
                <th>Calling Purpose</th>
                <th>Appointment Date</th>
                <th>Appointment Time</th>
                <th>Scheduled On</th>

                <th>Status</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {loadingSuspects ? (
                <tr>
                  <td colSpan="18" className="loading-cell">
                    <div className="loading-indicator">
                      <div className="loading-spinner"></div>
                      Loading suspects with appointments...
                    </div>
                  </td>
                </tr>
              ) : suspectsWithAppointments.length === 0 ? (
                <tr>
                  <td colSpan="18" className="empty-cell">
                    📭 No suspects with appointments found
                  </td>
                </tr>
              ) : (
                suspectsWithAppointments.map((suspect, index) => {
                  const isSelected = selectedSuspects.includes(suspect.id);
                  const assignment = getRMAssignmentInfo(suspect.id);
                  const isAssigned = !!assignment;

                  return (
                    <tr
                      key={suspect.id}
                      className={`
                        ${isAssigned ? "assigned" : ""} 
                        ${isSelected ? "selected" : ""}
                      `}
                    >
                      <td className="checkbox-column">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSuspectSelect(suspect.id)}
                          disabled={isAssigning || isAssigned || !selectedRM}
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
                      <td>{suspect.groupCode}</td>
                      <td>{suspect.grade}</td>
                      <td>{suspect.groupName}</td>
                      <td>{suspect.name}</td>
                      <td>{suspect.gender}</td>
                      <td>
                        <div className="contact-info">
                          {suspect.mobileNo && suspect.mobileNo !== "-" && (
                            <div>📱 {suspect.mobileNo}</div>
                          )}
                          {suspect.contactNo &&
                            suspect.contactNo !== "-" &&
                            suspect.contactNo !== suspect.mobileNo && (
                              <div>📞 {suspect.contactNo}</div>
                            )}
                        </div>
                      </td>
                      <td>{suspect.leadSource}</td>
                      <td>{suspect.leadName}</td>
                      <td>{suspect.area}</td>
                      <td>{suspect.callingPurpose}</td>
                      <td>
                        {suspect.appointmentDate ? (
                          <div className="appointment-info">
                            <div className="appointment-date">
                              📅 {formatDate(suspect.appointmentDate)}
                            </div>
                          </div>
                        ) : (
                          <span className="no-appointment">-</span>
                        )}
                      </td>
                      <td>
                        {suspect.appointmentTime ? (
                          <div className="appointment-time">
                            🕒 {formatTime(suspect.appointmentTime)}
                          </div>
                        ) : (
                          <span className="no-time">-</span>
                        )}
                      </td>
                      <td>
                        {suspect.scheduledOn ? (
                          <div className="scheduled-on-info">
                            <div className="scheduled-date">
                              {formatDate(suspect.scheduledOn)}
                            </div>
                          </div>
                        ) : (
                          <span className="not-scheduled">-</span>
                        )}
                      </td>

                      <td>{getStatusBadge(suspect.status || "suspect")}</td>
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
                          <div className="to-assign-info">⏳ {getRMName()}</div>
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
              🎯 <strong>{selectedSuspects.length}</strong> suspects selected
              for assignment
            </span>
            <span className="assign-to-info">
              to <strong>{getRMName()}</strong>
            </span>
          </div>
          <div className="button-group">
            <button
              className="clear-btn"
              onClick={() => {
                setSelectedSuspects([]);
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
                `🚀 Assign ${selectedSuspects.length} Suspects`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RMAssignment;
