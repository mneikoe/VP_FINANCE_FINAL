import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSuspects } from "../../redux/feature/SuspectRedux/SuspectThunx";
import { toast } from "react-toastify";
import axiosInstance from "/src/config/axios";
import "./TaskAssign.css";

const TaskAssign = () => {
  const [employees, setEmployees] = useState({
    Telecaller: [],
    HR: [],
    Manager: [],
    OE: [],
    OA: [],
    Telemarketer: [],
    RM: []
  });

  const [role, setRole] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedSuspects, setSelectedSuspects] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedMap, setAssignedMap] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const dispatch = useDispatch();
  const { suspects = [], loading, error } = useSelector((state) => state.suspect);

  // ✅ Fetch suspects
  useEffect(() => {
    dispatch(getAllSuspects());
  }, [dispatch]);

  // ✅ Fetch telecallers and assignments
  useEffect(() => {
    fetchAllEmployees();
    refreshAssignments();
  }, []);

 // ✅ SUPER SIMPLE VERSION
const fetchAllEmployees = async () => {
  try {
    setLoadingEmployees(true);
    console.log("🔄 Fetching telecallers...");
    
    const response = await axiosInstance.get("/api/telecaller");
    console.log("API Response:", response.data);

    // Direct access - no complex conditions
    const telecallers = response.data.telecallers || [];
    console.log(`Found ${telecallers.length} telecallers`);

    const groupedEmployees = {
      Telecaller: telecallers.map(tc => ({
        id: tc._id,
        name: tc.username,
        employeeCode: tc.employeeCode || `TC-${tc._id.slice(-4)}`,
        email: tc.email,
        mobileNo: tc.mobileno,
        designation: "Telecaller"
      })),
      HR: [], Manager: [], OE: [], OA: [], Telemarketer: [], RM: []
    };

    setEmployees(groupedEmployees);
      
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to load telecallers");
    setEmployees({
      Telecaller: [], HR: [], Manager: [], OE: [], OA: [], Telemarketer: [], RM: []
    });
  } finally {
    setLoadingEmployees(false);
  }
};

  // ✅ Fixed: Fetch assignments
  const refreshAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await axiosInstance.get("/api/telecaller/assignments");
      const result = response.data;

      if (response.ok && result.success) {
        const newAssignedMap = {};
        result.data.forEach(assignment => {
          newAssignedMap[assignment.suspectId] = {
            telecallerName: assignment.telecallerName,
            assignedAt: assignment.assignedAt,
            status: assignment.status
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

  // 🔥 Get today's suspects only
  const getTodaysSuspects = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return suspects.filter(suspect => {
      if (!suspect.createdAt) return false;
      const suspectDate = new Date(suspect.createdAt);
      return suspectDate >= today;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // 🔥 Get available suspects (unassigned) from today's only
  const getAvailableSuspects = () => {
    const todaysSuspects = getTodaysSuspects();
    return todaysSuspects.filter(suspect => !assignedMap[suspect._id]);
  };

  // 🔥 Select All functionality
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSuspects([]);
      setSelectAll(false);
    } else {
      const availableSuspectIds = getAvailableSuspects().map(suspect => suspect._id);
      setSelectedSuspects(availableSuspectIds);
      setSelectAll(true);
    }
  };

  // ✅ Checkbox handler with assignment check
  const handleSuspectSelect = (suspectId) => {
    if (assignedMap[suspectId]) {
      toast.warning(`This suspect is already assigned to ${assignedMap[suspectId].telecallerName}`);
      return;
    }

    setSelectedSuspects(prev => {
      const newSelection = prev.includes(suspectId) 
        ? prev.filter(s => s !== suspectId)
        : [...prev, suspectId];
      
      const availableCount = getAvailableSuspects().length;
      setSelectAll(newSelection.length === availableCount && availableCount > 0);
      
      return newSelection;
    });
  };

  // 🔥 Range selection with Shift key
  const handleRangeSelect = (suspectId, index, event) => {
    const todaysSuspects = getTodaysSuspects();
    
    if (event.shiftKey && selectedSuspects.length > 0) {
      const lastSelectedIndex = todaysSuspects.findIndex(s => s._id === selectedSuspects[selectedSuspects.length - 1]);
      
      if (lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        
        const rangeSuspects = todaysSuspects.slice(start, end + 1)
          .filter(suspect => !assignedMap[suspect._id])
          .map(suspect => suspect._id);
        
        const newSelection = [...new Set([...selectedSuspects, ...rangeSuspects])];
        setSelectedSuspects(newSelection);
        return;
      }
    }
    
    handleSuspectSelect(suspectId);
  };

  // ✅ Get assignment info
  const getAssignmentInfo = (suspectId) => {
    return assignedMap[suspectId] || null;
  };

  // ✅ Get person name with employee code
  const getPersonName = () => {
    if (!role || !selectedPerson) return "-";
    const roleEmployees = employees[role];
    const person = roleEmployees.find(emp => emp.id === selectedPerson);
    return person ? `${person.name} (${person.employeeCode})` : "-";
  };

  // ✅ Assign suspects
  const handleAssign = async () => {
    if (!role || !selectedPerson || selectedSuspects.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const alreadyAssigned = selectedSuspects.filter(id => assignedMap[id]);
    if (alreadyAssigned.length > 0) {
      toast.error("Some suspects are already assigned. Please refresh the page.");
      return;
    }

    setIsAssigning(true);

    try {
      const selectedEmployee = employees[role].find(emp => emp.id === selectedPerson);
      
      if (!selectedEmployee) {
        toast.error("Selected employee not found");
        return;
      }

      const response = await axiosInstance.post("/api/telecaller/assign-suspects", {
        role: role,
        selectedPerson: selectedPerson,
        selectedPersonName: selectedEmployee.name,
        selectedPersonCode: selectedEmployee.employeeCode,
        suspects: selectedSuspects,
      });

      const result = response.data;

      if (result.success) {
        toast.success(`✅ ${selectedSuspects.length} suspects assigned to ${selectedEmployee.name}!`);

        // ✅ Update local assignment map
        const newAssignments = {};
        const personDisplayName = `${selectedEmployee.name} (${selectedEmployee.employeeCode})`;
        
        selectedSuspects.forEach(suspectId => {
          newAssignments[suspectId] = {
            telecallerName: personDisplayName,
            assignedAt: new Date().toISOString(),
            status: "assigned"
          };
        });

        setAssignedMap(prev => ({ ...prev, ...newAssignments }));
        setSelectedSuspects([]);
        setSelectAll(false);
        setRole("");
        setSelectedPerson("");

        dispatch(getAllSuspects());
        refreshAssignments(); // Refresh assignments after successful assignment
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

  // ✅ Statistics
  const todaysSuspects = getTodaysSuspects();
  const availableSuspects = getAvailableSuspects();
  const stats = {
    total: todaysSuspects.length,
    assigned: todaysSuspects.filter(suspect => assignedMap[suspect._id]).length,
    unassigned: availableSuspects.length,
    selected: selectedSuspects.length
  };

  // ✅ Employee counts for each role
  const employeeCounts = {
    Telecaller: employees.Telecaller.length,
    HR: employees.HR.length,
    Manager: employees.Manager.length,
    OE: employees.OE.length,
    OA: employees.OA.length,
    Telemarketer: employees.Telemarketer.length,
    RM: employees.RM.length
  };

  return (
    <div className="task-container">
      {/* Statistics Banner */}
      <div className="stats-banner">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Today's Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#28a745' }}>{stats.assigned}</span>
          <span className="stat-label">Assigned</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#007bff' }}>{stats.unassigned}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#ffc107' }}>{stats.selected}</span>
          <span className="stat-label">Selected</span>
        </div>
      </div>

      {/* Selection Tips */}
      <div className="selection-tips">
        <span>💡 <strong>Selection Tips:</strong> </span>
        <span>• Click checkboxes to select individually</span>
        <span>• Use <kbd>Shift + Click</kbd> for range selection</span>
        <span>• Use "Select All Available" for bulk selection</span>
      </div>

      {/* Employee Loading State */}
      {loadingEmployees && (
        <div className="loading-assignments">
          <span>🔄 Loading telecallers...</span>
        </div>
      )}

      {/* Employee Role Counts */}
      {!loadingEmployees && (
        <div className="employee-role-counts">
          <span><strong>Available Telecallers:</strong></span>
          <span className="role-count-badge">
            Telecaller: {employeeCounts.Telecaller}
          </span>
          {employeeCounts.Telecaller === 0 && (
            <span className="no-employees-warning">❌ No telecallers found. Please add telecaller employees first.</span>
          )}
        </div>
      )}

      {/* Loading State */}
      {loadingAssignments && (
        <div className="loading-assignments">
          <span>🔄 Loading assignments...</span>
        </div>
      )}

      {/* Dropdowns */}
      <div className="task-dropdowns">
        <select 
          value={role} 
          onChange={(e) => {
            setRole(e.target.value);
            setSelectedPerson("");
          }} 
          disabled={isAssigning || loadingEmployees}
        >
          <option value="">Select Role</option>
          <option value="Telecaller">
            Telecaller ({employees.Telecaller.length})
          </option>
        </select>

        <select 
          value={selectedPerson} 
          onChange={(e) => setSelectedPerson(e.target.value)} 
          disabled={!role || isAssigning || loadingEmployees}
        >
          <option value="">Select Telecaller</option>
          {employees.Telecaller.map(tc => (
            <option key={tc.id} value={tc.id}>
              {tc.name} - {tc.employeeCode} 
            </option>
          ))}
        </select>
      </div>

      {/* Selection Summary */}
      {(role || selectedPerson || selectedSuspects.length > 0) && (
        <div className="selection-summary">
          <div className="summary-item">
            <strong>Role:</strong> {role || "-"}
          </div>
          <div className="summary-item">
            <strong>Person:</strong> {getPersonName()}
          </div>
          <div className="summary-item">
            <strong>Selected:</strong> 
            <span className="selected-count">{selectedSuspects.length}</span> 
            out of {stats.unassigned} available
          </div>
          <div className="summary-item">
            <button 
              className="select-all-btn"
              onClick={handleSelectAll}
              disabled={stats.unassigned === 0}
            >
              {selectAll ? "❌ Deselect All" : "✅ Select All Available"}
            </button>
          </div>
        </div>
      )}

      {/* Suspect Table with Auto Width */}
      <div className="task-table-container">
        <div className="table-header">
          <h3>Today's Suspects List ({stats.total} total, {stats.unassigned} available)</h3>
          <div className="table-controls">
            <span className="selection-info">
              {selectedSuspects.length > 0 && `${selectedSuspects.length} selected`}
            </span>
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

        <div className="table-scroll-wrapper">
          <div className="table-scroll-container">
            <table className="task-table">
              <thead>
                <tr>
                  <th>
                    <div className="select-all-header">
                      <input
                        type="checkbox"
                        checked={selectAll && stats.unassigned > 0}
                        onChange={handleSelectAll}
                        disabled={stats.unassigned === 0}
                        title={stats.unassigned === 0 ? "No available suspects" : "Select all available"}
                      />
                      <span>Select</span>
                    </div>
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
                    <td colSpan="12" className="loading-row">
                      <div className="loading-spinner">Loading suspects...</div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="12" className="error-row">
                      Error loading suspects
                    </td>
                  </tr>
                ) : todaysSuspects.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="empty-row">
                      No suspects found for today
                    </td>
                  </tr>
                ) : (
                  todaysSuspects.map((suspect, index) => {
                    const isSelected = selectedSuspects.includes(suspect._id);
                    const assignment = getAssignmentInfo(suspect._id);
                    const isAssigned = !!assignment;
                    const isAvailable = !isAssigned;
                    const personal = suspect.personalDetails || {};

                    return (
                      <tr 
                        key={suspect._id} 
                        className={`
                          ${isAssigned ? "assigned-row" : ""} 
                          ${isSelected ? "selected-row" : ""}
                          ${isAvailable ? "available-row" : ""}
                        `}
                        onClick={(e) => {
                          if (e.target.type !== 'checkbox' && isAvailable) {
                            handleRangeSelect(suspect._id, index, e);
                          }
                        }}
                        style={{ cursor: isAvailable ? 'pointer' : 'default' }}
                      >
                        <td className="checkbox-cell">
                          <div className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSuspectSelect(suspect._id)}
                              disabled={isAssigning || isAssigned}
                              title={isAssigned ? `Assigned to: ${assignment.telecallerName}` : "Select for assignment"}
                            />
                          </div>
                        </td>
                        <td className="index-cell">{index + 1}</td>
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
                          <div className="cell-content" style={{ whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                            {personal.mobileNo && `Mobile: ${personal.mobileNo}`}
                            {personal.mobileNo && personal.contactNo && '\n'}
                            {personal.contactNo && `Contact: ${personal.contactNo}`}
                            {!personal.mobileNo && !personal.contactNo && "-"}
                          </div>
                        </td>
                        <td className="lead-source-cell">
                          <div className="cell-content">{personal.leadSource || "-"}</div>
                        </td>
                        <td className="lead-name-cell">
                          <div className="cell-content">{personal.leadName || "-"}</div>
                        </td>
                        <td className="calling-purpose-cell">
                          <div className="cell-content">{personal.callingPurpose || "-"}</div>
                        </td>
                        <td className="status-cell">
                          <div className="cell-content">
                            <span className={`status-badge ${suspect.status || 'suspect'}`}>
                              {suspect.status || "Suspect"}
                            </span>
                          </div>
                        </td>
                        <td className="assigned-cell">
                          <div className="cell-content">
                            {assignment ? (
                              <span className="assigned-person">
                                ✅ {assignment.telecallerName}
                                <br />
                                <small>{new Date(assignment.assignedAt).toLocaleDateString()}</small>
                              </span>
                            ) : isSelected ? (
                              <span className="to-assign-person">
                                ⏳ {getPersonName()}
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
      {selectedSuspects.length > 0 && (
        <div className="action-buttons">
          <div className="action-info">
            <span className="selection-count">
              🎯 <strong>{selectedSuspects.length}</strong> suspects selected for assignment
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

      {/* No Employees Warning */}
      {!loadingEmployees && employeeCounts.Telecaller === 0 && (
        <div className="no-employees-alert">
          <div className="alert alert-warning">
            <strong>⚠️ No Telecallers Found</strong>
            <p>Please add telecaller employees in the system before assigning suspects.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAssign;