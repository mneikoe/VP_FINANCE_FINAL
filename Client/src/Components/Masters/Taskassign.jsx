// TaskAssign.jsx (Updated)
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSuspects } from "../../redux/feature/SuspectRedux/SuspectThunx";
import { toast } from "react-toastify";
import axiosInstance from "/src/config/axios";
import "./TaskAssign.css";

const TaskAssign = () => {
  const [employees, setEmployees] = useState({
    Telecaller: [],
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
  const [todaysSuspectsData, setTodaysSuspectsData] = useState([]);

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
    fetchAllEmployees();
    fetchAssignments();
  }, []);

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
      };

      setEmployees(groupedEmployees);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load telecallers");
      setEmployees({
        Telecaller: [],
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  // ✅ UPDATED: Fetch assignments properly
  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);

      // First get all assignments from telecaller endpoint
      const assignmentsResponse = await axiosInstance.get(
        "/api/telecaller/assignments"
      );
      console.log("Assignments response:", assignmentsResponse.data);

      if (assignmentsResponse.data.success) {
        const newAssignedMap = {};
        assignmentsResponse.data.data.forEach((assignment) => {
          newAssignedMap[assignment.suspectId] = {
            telecallerId: assignment.telecallerId,
            telecallerName: assignment.telecallerName,
            assignedAt: assignment.assignedAt,
            status: assignment.status || "assigned",
          };
        });
        setAssignedMap(newAssignedMap);
      }

      // Also fetch today's suspects with assignment info
      fetchTodaysSuspects();
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to refresh assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  // ✅ NEW: Fetch today's suspects with assignment info
  const fetchTodaysSuspects = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all suspects and filter for today
      const response = await axiosInstance.get("/api/suspect/all");
      if (response.data && response.data.suspects) {
        const allSuspects = response.data.suspects;

        const todaysSuspects = allSuspects
          .filter((suspect) => {
            if (!suspect.createdAt) return false;
            const suspectDate = new Date(suspect.createdAt);
            suspectDate.setHours(0, 0, 0, 0);
            return suspectDate.getTime() === today.getTime();
          })
          .map((suspect) => {
            // Get telecaller info
            let telecallerInfo = {};
            if (suspect.assignedTo) {
              if (typeof suspect.assignedTo === "object") {
                telecallerInfo = {
                  id: suspect.assignedTo._id,
                  name: suspect.assignedTo.username || "Unassigned",
                  employeeCode: suspect.assignedTo.employeeCode || "-",
                };
              } else {
                telecallerInfo = {
                  id: suspect.assignedTo,
                  name: "Assigned",
                  employeeCode: "-",
                };
              }
            }

            return {
              ...suspect,
              telecallerInfo,
              assignedAt: suspect.assignedAt,
            };
          });

        setTodaysSuspectsData(todaysSuspects);
        console.log("Today's suspects with assignment:", todaysSuspects);
      }
    } catch (error) {
      console.error("Error fetching today's suspects:", error);
    }
  };

  const getTodaysSuspects = () => {
    return todaysSuspectsData;
  };

  const getAvailableSuspects = () => {
    const todaysSuspects = getTodaysSuspects();
    return todaysSuspects.filter((suspect) => !assignedMap[suspect._id]);
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

  const handleSuspectSelect = (suspectId) => {
    if (assignedMap[suspectId]) {
      const assignment = assignedMap[suspectId];
      toast.warning(
        `This suspect is already assigned to ${assignment.telecallerName}`
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

  const getAssignmentInfo = (suspectId) => {
    return assignedMap[suspectId] || null;
  };

  const getPersonName = () => {
    if (!role || !selectedPerson) return "-";
    const roleEmployees = employees[role];
    const person = roleEmployees.find((emp) => emp.id === selectedPerson);
    return person ? `${person.name} (${person.employeeCode})` : "-";
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
          suspects: selectedSuspects,
          assignmentNotes: assignmentNotes,
        }
      );

      const result = response.data;

      if (result.success) {
        toast.success(
          `✅ ${selectedSuspects.length} suspects assigned to ${selectedEmployee.name}!`
        );

        // Update local state
        const newAssignments = {};
        selectedSuspects.forEach((suspectId) => {
          newAssignments[suspectId] = {
            telecallerId: selectedPerson,
            telecallerName: `${selectedEmployee.name} (${selectedEmployee.employeeCode})`,
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

        // Refresh data
        dispatch(getAllSuspects());
        fetchAssignments();
        fetchTodaysSuspects();
      } else {
        toast.error(result.message || "Assignment failed");
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

  const formatDate = (date) => {
    if (!date) return "-";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      suspect: { color: "#1890ff", bg: "#e6f7ff", label: "Suspect" },
      prospect: { color: "#52c41a", bg: "#f6ffed", label: "Prospect" },
      client: { color: "#722ed1", bg: "#f9f0ff", label: "Client" },
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

  const getTelecallerBadge = (telecallerInfo) => {
    if (!telecallerInfo || !telecallerInfo.name) return null;

    const isUnassigned =
      telecallerInfo.name === "Unassigned" ||
      telecallerInfo.name === "Assigned" ||
      !telecallerInfo.name;

    if (isUnassigned) {
      return (
        <span className="text-warning">
          <small>⏳ Not Assigned</small>
        </span>
      );
    }

    return (
      <div className="telecaller-badge">
        <span className="badge bg-success">
          ✅ {telecallerInfo.name}
          {telecallerInfo.employeeCode &&
            telecallerInfo.employeeCode !== "-" &&
            ` (${telecallerInfo.employeeCode})`}
        </span>
      </div>
    );
  };

  const todaysSuspects = getTodaysSuspects();
  const availableSuspects = getAvailableSuspects();

  const suspectStats = {
    total: todaysSuspects.length,
    assigned: todaysSuspects.filter(
      (suspect) => suspect.assignedTo || assignedMap[suspect._id]
    ).length,
    unassigned: availableSuspects.length,
    selected: selectedSuspects.length,
  };

  console.log("Assignments data:", assignedMap);
  console.log("Today's suspects:", todaysSuspects);

  return (
    <div className="task-assign-container">
      <div className="task-assign-header">
        <h1 className="page-title">📋 Task Assignment - Telecaller</h1>
        <p className="page-subtitle">
          Assign today's suspects to telecallers for calling
        </p>
      </div>

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
                fetchAssignments();
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
                  <th>Assigned At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="13" className="loading-cell">
                      <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        Loading suspects...
                      </div>
                    </td>
                  </tr>
                ) : todaysSuspects.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="empty-cell">
                      📭 No suspects found for today
                    </td>
                  </tr>
                ) : (
                  todaysSuspects.map((suspect, index) => {
                    const isSelected = selectedSuspects.includes(suspect._id);
                    const assignment = getAssignmentInfo(suspect._id);
                    const isAssigned = !!assignment || suspect.assignedTo;
                    const personal = suspect.personalDetails || {};

                    // Get telecaller info from multiple sources
                    let telecallerDisplay = "Not Assigned";
                    let assignedDate = null;

                    if (assignment) {
                      telecallerDisplay = assignment.telecallerName;
                      assignedDate = assignment.assignedAt;
                    } else if (suspect.telecallerInfo) {
                      telecallerDisplay = suspect.telecallerInfo.name;
                      assignedDate = suspect.assignedAt;
                    }

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
                            onChange={() => handleSuspectSelect(suspect._id)}
                            disabled={isAssigning || isAssigned}
                            title={
                              isAssigned
                                ? `Assigned to: ${telecallerDisplay}`
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
                        <td>{getStatusBadge(suspect.status || "suspect")}</td>
                        <td>
                          {isAssigned ? (
                            <div className="assigned-info">
                              <div className="assigned-person">
                                {telecallerDisplay}
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
                        <td>
                          {assignedDate ? (
                            <div className="assigned-date">
                              {formatDate(assignedDate)}
                            </div>
                          ) : (
                            <span className="no-date">-</span>
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
  );
};

export default TaskAssign;
