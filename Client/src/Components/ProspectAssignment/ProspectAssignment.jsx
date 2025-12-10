import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axios";
import "./ProspectAssignment.css";

const ProspectAssignment = () => {
  const [rms, setRms] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [selectedRM, setSelectedRM] = useState("");
  const [selectedProspects, setSelectedProspects] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedMap, setAssignedMap] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingRMs, setLoadingRMs] = useState(false);
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [activeTab, setActiveTab] = useState("assign"); // assign, assigned

  // Statistics
  const [stats, setStats] = useState({
    totalProspects: 0,
    availableProspects: 0,
    assignedProspects: 0,
    todayAssignments: 0,
    totalRMs: 0,
  });

  // ✅ Fetch RMs
  const fetchRMs = async () => {
    try {
      setLoadingRMs(true);
      console.log("🔄 Fetching Relationship Managers...");

      const response = await axiosInstance.get("/api/rm/all");
      console.log("RM Response:", response.data);

      setRms(response.data.data || []);

      if (response.data.data && response.data.data.length === 0) {
        toast.warning("No Relationship Managers found. Please add RMs first.");
      }
    } catch (error) {
      console.error("Error fetching RMs:", error);
      toast.error("Failed to load Relationship Managers");
      setRms([]);
    } finally {
      setLoadingRMs(false);
    }
  };

  // ✅ Fetch prospects for assignment
  const fetchProspects = async () => {
    try {
      setLoadingProspects(true);
      console.log("🔄 Fetching prospects with appointments...");

      const response = await axiosInstance.get(
        "/api/rm/prospects-for-assignment"
      );
      console.log("Prospects Response:", response.data);

      const prospectsData = response.data.data || [];
      setProspects(prospectsData);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalProspects: prospectsData.length,
        availableProspects: prospectsData.filter((p) => !p.isAssigned).length,
      }));
    } catch (error) {
      console.error("Error fetching prospects:", error);
      toast.error("Failed to load prospects");
      setProspects([]);
    } finally {
      setLoadingProspects(false);
    }
  };

  // ✅ Fetch assignments
  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await axiosInstance.get("/api/rm/assignments");

      if (response.data.success) {
        const newAssignedMap = {};
        response.data.data.forEach((assignment) => {
          newAssignedMap[assignment.prospectId] = {
            rmName: assignment.rmName,
            rmCode: assignment.rmCode,
            assignedAt: assignment.assignedAt,
          };
        });
        setAssignedMap(newAssignedMap);

        // Update stats
        setStats((prev) => ({
          ...prev,
          assignedProspects: response.data.count || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to refresh assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  // ✅ Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get("/api/rm/statistics");
      if (response.data.success) {
        setStats((prev) => ({
          ...prev,
          totalRMs: response.data.data.totalRMs,
          todayAssignments: response.data.data.todayAssignments,
          assignedProspects: response.data.data.totalAssignedProspects,
          availableProspects: response.data.data.availableProspects,
        }));
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRMs();
    fetchProspects();
    fetchAssignments();
    fetchStatistics();
  }, []);

  // ✅ Get available prospects (unassigned)
  const getAvailableProspects = () => {
    return prospects.filter((prospect) => !assignedMap[prospect.id]);
  };

  // ✅ Select All functionality
  const handleSelectAll = () => {
    const availableProspects = getAvailableProspects();

    if (selectAll) {
      setSelectedProspects([]);
      setSelectAll(false);
    } else {
      const availableIds = availableProspects.map((p) => p.id);
      setSelectedProspects(availableIds);
      setSelectAll(true);
    }
  };

  // ✅ Checkbox handler
  const handleProspectSelect = (prospectId) => {
    if (assignedMap[prospectId]) {
      toast.warning(
        `This prospect is already assigned to ${assignedMap[prospectId].rmName}`
      );
      return;
    }

    setSelectedProspects((prev) => {
      const newSelection = prev.includes(prospectId)
        ? prev.filter((id) => id !== prospectId)
        : [...prev, prospectId];

      const availableCount = getAvailableProspects().length;
      setSelectAll(
        newSelection.length === availableCount && availableCount > 0
      );

      return newSelection;
    });
  };

  // ✅ Range selection with Shift key
  const handleRangeSelect = (prospectId, index, event) => {
    const availableProspects = getAvailableProspects();

    if (event.shiftKey && selectedProspects.length > 0) {
      const lastSelectedIndex = availableProspects.findIndex(
        (p) => p.id === selectedProspects[selectedProspects.length - 1]
      );

      if (lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);

        const rangeProspects = availableProspects
          .slice(start, end + 1)
          .map((prospect) => prospect.id);

        const newSelection = [
          ...new Set([...selectedProspects, ...rangeProspects]),
        ];
        setSelectedProspects(newSelection);
        return;
      }
    }

    handleProspectSelect(prospectId);
  };

  // ✅ Get assignment info
  const getAssignmentInfo = (prospectId) => {
    return assignedMap[prospectId] || null;
  };

  // ✅ Get RM name with employee code
  const getRMName = () => {
    if (!selectedRM) return "-";
    const rm = rms.find((r) => r.id === selectedRM);
    return rm ? `${rm.name} (${rm.employeeCode})` : "-";
  };

  // ✅ Assign prospects
  const handleAssign = async () => {
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
      const response = await axiosInstance.post("/api/rm/assign-prospects", {
        rmId: selectedRM,
        rmName: selectedRMData.name,
        rmCode: selectedRMData.employeeCode,
        prospects: selectedProspects,
        assignmentNotes: assignmentNotes,
      });

      if (response.data.success) {
        toast.success(
          `✅ ${selectedProspects.length} prospects assigned to ${selectedRMData.name}!`
        );

        // Update local assignment map
        const newAssignments = {};
        selectedProspects.forEach((prospectId) => {
          newAssignments[prospectId] = {
            rmName: `${selectedRMData.name} (${selectedRMData.employeeCode})`,
            assignedAt: new Date().toISOString(),
          };
        });

        setAssignedMap((prev) => ({ ...prev, ...newAssignments }));
        setSelectedProspects([]);
        setSelectAll(false);
        setSelectedRM("");
        setAssignmentNotes("");

        // Refresh data
        fetchProspects();
        fetchAssignments();
        fetchStatistics();
      } else {
        toast.error(response.data.message || "Assignment failed");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Format time
  const formatTime = (timeString) => {
    if (!timeString || timeString === "-") return "-";
    return timeString;
  };

  return (
    <div className="prospect-assignment-container">
      {/* Tabs */}
      <div className="assignment-tabs">
        <button
          className={`tab-btn ${activeTab === "assign" ? "active" : ""}`}
          onClick={() => setActiveTab("assign")}
        >
          🔄 Assign Prospects to RM
        </button>
        <button
          className={`tab-btn ${activeTab === "assigned" ? "active" : ""}`}
          onClick={() => setActiveTab("assigned")}
        >
          📋 Assigned Prospects
        </button>
      </div>

      {/* Statistics Banner */}
      <div className="stats-banner">
        <div className="stat-item">
          <span className="stat-number">{stats.totalRMs}</span>
          <span className="stat-label">Total RMs</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: "#007bff" }}>
            {stats.availableProspects}
          </span>
          <span className="stat-label">Available Prospects</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: "#28a745" }}>
            {stats.assignedProspects}
          </span>
          <span className="stat-label">Assigned</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: "#17a2b8" }}>
            {stats.todayAssignments}
          </span>
          <span className="stat-label">Today's</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: "#ffc107" }}>
            {selectedProspects.length}
          </span>
          <span className="stat-label">Selected</span>
        </div>
      </div>

      {/* Assignment Tab Content */}
      {activeTab === "assign" && (
        <>
          {/* Loading States */}
          {loadingRMs && (
            <div className="loading-state">
              <span>🔄 Loading Relationship Managers...</span>
            </div>
          )}

          {loadingProspects && (
            <div className="loading-state">
              <span>🔄 Loading prospects with appointments...</span>
            </div>
          )}

          {/* RM Selection */}
          <div className="rm-selection-section">
            <h3>Select Relationship Manager</h3>
            <div className="rm-dropdown-container">
              <select
                value={selectedRM}
                onChange={(e) => setSelectedRM(e.target.value)}
                disabled={isAssigning || loadingRMs}
                className="rm-select"
              >
                <option value="">Select RM</option>
                {rms.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    {rm.name} - {rm.employeeCode} ({rm.designation || "RM"})
                  </option>
                ))}
              </select>

              {selectedRM && (
                <div className="rm-info">
                  <strong>Selected:</strong> {getRMName()}
                </div>
              )}
            </div>
          </div>

          {/* Assignment Notes */}
          {selectedRM && (
            <div className="notes-section">
              <h4>Assignment Notes (Optional)</h4>
              <textarea
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                placeholder="Add any specific notes or instructions for this assignment..."
                rows={3}
                className="notes-textarea"
              />
            </div>
          )}

          {/* Selection Tips */}
          <div className="selection-tips">
            <span>
              💡 <strong>Selection Tips:</strong>
            </span>
            <span>• Click checkboxes to select individually</span>
            <span>
              • Use <kbd>Shift + Click</kbd> for range selection
            </span>
            <span>• Use "Select All Available" for bulk selection</span>
          </div>

          {/* Prospects Table */}
          <div className="prospect-table-container">
            <div className="table-header">
              <h3>
                Prospects with Appointments ({stats.availableProspects}{" "}
                available)
                {selectedRM && (
                  <span className="assign-to-text">
                    → Assigning to: <strong>{getRMName()}</strong>
                  </span>
                )}
              </h3>

              <div className="table-controls">
                <button
                  className="select-all-btn"
                  onClick={handleSelectAll}
                  disabled={stats.availableProspects === 0 || !selectedRM}
                >
                  {selectAll ? "❌ Deselect All" : "✅ Select All Available"}
                </button>

                <button
                  className="refresh-btn"
                  onClick={() => {
                    fetchProspects();
                    fetchAssignments();
                    fetchStatistics();
                  }}
                  disabled={loadingProspects || loadingAssignments}
                >
                  {loadingProspects || loadingAssignments ? "🔄" : "↻"} Refresh
                </button>
              </div>
            </div>

            <div className="table-scroll-wrapper">
              <div className="table-scroll-container">
                <table className="prospect-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="select-all-header">
                          <input
                            type="checkbox"
                            checked={selectAll && stats.availableProspects > 0}
                            onChange={handleSelectAll}
                            disabled={
                              stats.availableProspects === 0 || !selectedRM
                            }
                            title={
                              !selectedRM
                                ? "Select an RM first"
                                : "Select all available"
                            }
                          />
                          <span>Select</span>
                        </div>
                      </th>
                      <th>#</th>
                      <th>Prospect Name</th>
                      <th>Group Code</th>
                      <th>Organisation</th>
                      <th>Contact</th>
                      <th>Appointment Date</th>
                      <th>Appointment Time</th>
                      <th>City</th>
                      <th>Lead Source</th>
                      <th>Assigned To</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingProspects ? (
                      <tr>
                        <td colSpan="11" className="loading-row">
                          <div className="loading-spinner">
                            Loading prospects...
                          </div>
                        </td>
                      </tr>
                    ) : prospects.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="empty-row">
                          No prospects with appointments found
                        </td>
                      </tr>
                    ) : (
                      getAvailableProspects().map((prospect, index) => {
                        const isSelected = selectedProspects.includes(
                          prospect.id
                        );
                        const assignment = getAssignmentInfo(prospect.id);
                        const isAssigned = !!assignment;

                        return (
                          <tr
                            key={prospect.id}
                            className={`
                              ${isAssigned ? "assigned-row" : ""} 
                              ${isSelected ? "selected-row" : ""}
                            `}
                            onClick={(e) => {
                              if (
                                e.target.type !== "checkbox" &&
                                !isAssigned &&
                                selectedRM
                              ) {
                                handleRangeSelect(prospect.id, index, e);
                              }
                            }}
                            style={{
                              cursor:
                                !isAssigned && selectedRM
                                  ? "pointer"
                                  : "default",
                            }}
                          >
                            <td className="checkbox-cell">
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
                                    ? `Already assigned to ${assignment.rmName}`
                                    : !selectedRM
                                    ? "Select an RM first"
                                    : "Select for assignment"
                                }
                              />
                            </td>
                            <td className="index-cell">{index + 1}</td>
                            <td className="name-cell">
                              <div className="cell-content">
                                <strong>{prospect.name || "N/A"}</strong>
                                <div className="sub-text">
                                  {prospect.groupName}
                                </div>
                              </div>
                            </td>
                            <td className="group-code-cell">
                              <div className="cell-content">
                                {prospect.groupCode}
                              </div>
                            </td>
                            <td className="org-cell">
                              <div className="cell-content">
                                {prospect.organisation}
                              </div>
                            </td>
                            <td className="contact-cell">
                              <div
                                className="cell-content"
                                style={{
                                  whiteSpace: "pre-line",
                                  lineHeight: "1.4",
                                }}
                              >
                                <div>📱 {prospect.mobileNo || "N/A"}</div>
                                {prospect.contactNo &&
                                  prospect.contactNo !== prospect.mobileNo && (
                                    <div>📞 {prospect.contactNo}</div>
                                  )}
                              </div>
                            </td>
                            <td className="appointment-date-cell">
                              <div className="cell-content">
                                <span className="date-badge">
                                  {formatDate(prospect.appointmentDate)}
                                </span>
                              </div>
                            </td>
                            <td className="appointment-time-cell">
                              <div className="cell-content">
                                {formatTime(prospect.appointmentTime)}
                              </div>
                            </td>
                            <td className="city-cell">
                              <div className="cell-content">
                                <span className="city-badge">
                                  {prospect.city}
                                </span>
                              </div>
                            </td>
                            <td className="lead-source-cell">
                              <div className="cell-content">
                                {prospect.leadSource}
                              </div>
                            </td>
                            <td className="assigned-cell">
                              <div className="cell-content">
                                {assignment ? (
                                  <span className="assigned-info">
                                    ✅ {assignment.rmName}
                                    <br />
                                    <small>
                                      {formatDate(assignment.assignedAt)}
                                    </small>
                                  </span>
                                ) : isSelected ? (
                                  <span className="to-assign-info">
                                    ⏳ {getRMName()}
                                  </span>
                                ) : (
                                  <span className="not-assigned">-</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {selectedProspects.length > 0 && (
            <div className="action-buttons">
              <div className="action-info">
                <span className="selection-count">
                  🎯 <strong>{selectedProspects.length}</strong> prospects
                  selected
                </span>
                <span className="assign-to-info">
                  → Assigning to: <strong>{getRMName()}</strong>
                </span>
              </div>

              <div className="button-group">
                <button
                  className="clear-btn"
                  onClick={() => {
                    setSelectedProspects([]);
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
                    `🚀 Assign ${selectedProspects.length} Prospects`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* No RMs Warning */}
          {!loadingRMs && rms.length === 0 && (
            <div className="no-rms-alert">
              <div className="alert alert-warning">
                <strong>⚠️ No Relationship Managers Found</strong>
                <p>
                  Please add RM employees in the Employee Management system
                  before assigning prospects.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Assigned Prospects Tab Content */}
      {activeTab === "assigned" && (
        <div className="assigned-prospects-container">
          <div className="section-header">
            <h3>📋 Assigned Prospects to RMs</h3>
            <button
              className="refresh-btn"
              onClick={fetchAssignments}
              disabled={loadingAssignments}
            >
              {loadingAssignments ? "🔄" : "↻"} Refresh
            </button>
          </div>

          {loadingAssignments ? (
            <div className="loading-state">
              <span>🔄 Loading assigned prospects...</span>
            </div>
          ) : Object.keys(assignedMap).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No prospects assigned to RMs yet</h4>
              <p>
                Go to the "Assign" tab to assign prospects to Relationship
                Managers
              </p>
            </div>
          ) : (
            <div className="assigned-list">
              {Object.entries(assignedMap).map(
                ([prospectId, assignment], index) => {
                  const prospect = prospects.find((p) => p.id === prospectId);

                  return (
                    <div key={prospectId} className="assigned-item">
                      <div className="assigned-header">
                        <span className="item-index">#{index + 1}</span>
                        <span className="prospect-name">
                          <strong>
                            {prospect?.name || "Unknown Prospect"}
                          </strong>
                          <span className="group-code">
                            ({prospect?.groupCode})
                          </span>
                        </span>
                        <span className="rm-name">
                          <span className="badge rm-badge">RM</span>
                          {assignment.rmName}
                        </span>
                      </div>

                      <div className="assigned-details">
                        <div className="detail-item">
                          <span className="detail-label">Organisation:</span>
                          <span>{prospect?.organisation || "N/A"}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Contact:</span>
                          <span>{prospect?.mobileNo || "N/A"}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Appointment:</span>
                          <span>
                            {formatDate(prospect?.appointmentDate)} at{" "}
                            {formatTime(prospect?.appointmentTime)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Assigned On:</span>
                          <span>{formatDate(assignment.assignedAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProspectAssignment;
