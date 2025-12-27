import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import
import {
  FaSearch,
  FaSync,
  FaPhoneAlt,
  FaUser,
  FaIdCard,
  FaBuilding,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaInfoCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import axios from "axios";

const AssignedTasks = ({ user }) => {
  const navigate = useNavigate(); // ✅ Initialize
  const [assignedSuspects, setAssignedSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  const navigateToSuspectDetails = (suspect) => {
    console.log("Navigating to suspect details:", suspect);

    // Check which ID field is available
    const suspectId = suspect.suspectId || suspect.id || suspect._id;

    if (suspectId && suspectId !== "undefined" && suspectId !== undefined) {
      // ✅ RM के लिए अलग route use करो
      navigate(`/rm/suspect/details/${suspectId}`);
    } else {
      console.error("❌ Invalid suspect ID:", suspectId);
      alert("Suspect ID not found or invalid");
    }
  };

  const fetchAssignedSuspects = async () => {
    try {
      setLoading(true);

      const rmId = user?.id;

      if (!rmId) {
        console.error("❌ No RM ID found!");
        setAssignedSuspects([]);
        setLoading(false);
        return;
      }

      console.log("📡 Making API call with RM ID:", rmId);

      const response = await axios.get("/api/rm/assigned-suspects", {
        params: { rmId: rmId },
      });

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        setAssignedSuspects(response.data.data || []);
      } else {
        console.error("❌ API Error:", response.data.message);
        setAssignedSuspects([]);
      }
    } catch (error) {
      console.error("❌ Error fetching assigned suspects:", error);
      console.error("❌ Error response:", error.response?.data);
      setAssignedSuspects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAssignedSuspects();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  // Format time in AM/PM
  const formatTimeAMPM = (timeString) => {
    if (!timeString || timeString === "-" || timeString === "N/A") return "-";

    try {
      const timeParts = timeString.split(":");
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1] || "00";

      const ampm = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;

      return `${hours12}:${minutes} ${ampm}`;
    } catch (error) {
      return "-";
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      suspect: "bg-warning text-dark",
      prospect: "bg-info text-white",
      client: "bg-success text-white",
    };
    return (
      <span className={`badge ${config[status] || "bg-secondary"}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  // Handle phone click
  const handlePhoneClick = (phoneNumber, type = "mobile") => {
    if (!phoneNumber || phoneNumber === "-" || phoneNumber === "N/A") return;

    if (window.confirm(`Call ${type} number: ${phoneNumber}?`)) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const filteredSuspects = assignedSuspects.filter((suspect) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        (suspect.suspectName?.toLowerCase() || "").includes(searchTerm) ||
        (suspect.groupCode?.toLowerCase() || "").includes(searchTerm) ||
        (suspect.mobileNo?.toLowerCase() || "").includes(searchTerm) ||
        (suspect.city?.toLowerCase() || "").includes(searchTerm) ||
        (suspect.organisation?.toLowerCase() || "").includes(searchTerm)
      );
    }
    return true;
  });

  return (
    <div
      className="assigned-tasks-page"
      style={{ padding: "20px", backgroundColor: "#f8f9fa" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between relative bottom-5 align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex gap-2 flex-wrap">
          <div className="input-group" style={{ minWidth: "250px" }}>
            <span className="input-group-text bg-white">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search suspects..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <button
            className="btn btn-dark d-flex align-items-center gap-2"
            onClick={fetchAssignedSuspects}
            disabled={loading}
          >
            <FaSync className={loading ? "fa-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading assigned suspects...</p>
        </div>
      ) : assignedSuspects.length === 0 ? (
        <div className="text-center py-5 bg-light rounded">
          <FaCalendarAlt size={48} className="text-muted mb-3" />
          <h4>No Assigned Suspects</h4>
          <p className="text-muted">
            You don't have any suspects assigned to you yet.
          </p>
          <button
            className="btn btn-primary mt-3"
            onClick={fetchAssignedSuspects}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="table-container-wrapper">
          {/* Mobile Alert */}
          <div className="d-md-none alert alert-info mb-3">
            <small>
              <FaInfoCircle className="me-1" />
              <strong>Swipe left/right</strong> to view all columns. Tap on{" "}
              <strong>Group Code</strong> to view details.
            </small>
          </div>

          {/* Responsive Table Container */}
          <div
            className="table-responsive bg-white rounded shadow-sm"
            style={{
              overflowX: "auto",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
            }}
          >
            <table
              className="table table-hover mb-0"
              style={{ minWidth: "1300px" }}
            >
              <thead className="bg-light">
                <tr>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "120px" }}
                  >
                    <div className="d-flex align-items-center">
                      <FaIdCard className="me-2 text-primary" />
                      Group Code
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "150px" }}
                  >
                    Group Name
                  </th>

                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "120px" }}
                  >
                    <div className="d-flex align-items-center">
                      <FaPhoneAlt className="me-2" />
                      Mobile No
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "120px" }}
                  >
                    Contact No
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "150px" }}
                  >
                    <div className="d-flex align-items-center">
                      <FaBuilding className="me-2 text-secondary" />
                      Organisation
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "120px" }}
                  >
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-danger" />
                      City/Area
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "120px" }}
                  >
                    Lead Source
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "150px" }}
                  >
                    <div className="d-flex align-items-center">
                      <FaBriefcase className="me-2 text-warning" />
                      Lead Occupation
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "140px" }}
                  >
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-primary" />
                      Appointment Date
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "100px" }}
                  >
                    Time
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "100px" }}
                  >
                    Status
                  </th>
                  <th
                    className="py-3 px-3 text-nowrap"
                    style={{ minWidth: "200px" }}
                  >
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSuspects.map((suspect, index) => (
                  <tr key={suspect.suspectId || index} className="align-middle">
                    {/* Group Code - CLICKABLE */}
                    <td className="px-3">
                      <div
                        className="group-code-link d-inline-flex align-items-center"
                        onClick={() => navigateToSuspectDetails(suspect)}
                        style={{
                          cursor: "pointer",
                          color: "#007bff",
                          fontWeight: "500",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          backgroundColor: "#e7f1ff",
                          transition: "all 0.2s",
                          border: "1px solid #b3d4ff",
                          fontSize: "13px",
                          minWidth: "100px",
                        }}
                        title="Click to view full details"
                      >
                        <FaIdCard
                          className="text-primary me-2"
                          style={{ fontSize: "12px" }}
                        />
                        <span className="fw-medium font-monospace">
                          {suspect.groupCode || "N/A"}
                        </span>
                        <FaExternalLinkAlt
                          className="ms-2"
                          style={{ fontSize: "10px", opacity: 0.7 }}
                        />
                      </div>
                    </td>

                    {/* Group Name */}
                    <td className="px-3 fw-medium">
                      {suspect.groupName || "N/A"}
                    </td>

                    {/* Mobile No */}
                    <td className="px-3">
                      <div
                        className="d-flex align-items-center text-primary"
                        onClick={() =>
                          handlePhoneClick(suspect.mobileNo, "mobile")
                        }
                        style={{
                          cursor:
                            suspect.mobileNo &&
                            suspect.mobileNo !== "-" &&
                            suspect.mobileNo !== "N/A"
                              ? "pointer"
                              : "default",
                        }}
                      >
                        <span
                          className={
                            suspect.mobileNo &&
                            suspect.mobileNo !== "-" &&
                            suspect.mobileNo !== "N/A"
                              ? "text-decoration-underline phone-number"
                              : ""
                          }
                          style={{
                            fontFamily: "monospace",
                            fontSize: "13px",
                          }}
                        >
                          {suspect.mobileNo || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Contact No */}
                    <td className="px-3">
                      <div
                        className="d-flex align-items-center text-primary"
                        onClick={() =>
                          handlePhoneClick(suspect.contactNo, "contact")
                        }
                        style={{
                          cursor:
                            suspect.contactNo &&
                            suspect.contactNo !== "-" &&
                            suspect.contactNo !== "N/A"
                              ? "pointer"
                              : "default",
                        }}
                      >
                        <span
                          className={
                            suspect.contactNo &&
                            suspect.contactNo !== "-" &&
                            suspect.contactNo !== "N/A"
                              ? "text-decoration-underline phone-number"
                              : ""
                          }
                          style={{
                            fontFamily: "monospace",
                            fontSize: "13px",
                          }}
                        >
                          {suspect.contactNo || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Organisation */}
                    <td className="px-3">
                      <div className="d-flex align-items-center">
                        <span>{suspect.organisation || "N/A"}</span>
                      </div>
                    </td>

                    {/* City/Area */}
                    <td className="px-3">
                      <div className="d-flex align-items-center">
                        <FaMapMarkerAlt
                          className="text-danger me-2"
                          style={{ fontSize: "12px" }}
                        />
                        <span>{suspect.city || suspect.area || "N/A"}</span>
                      </div>
                    </td>

                    {/* Lead Source */}
                    <td className="px-3">{suspect.leadSource || "N/A"}</td>

                    {/* Lead Occupation */}
                    <td className="px-3">
                      <div className="d-flex align-items-center">
                        <FaBriefcase
                          className="text-warning me-2"
                          style={{ fontSize: "12px" }}
                        />
                        <span>{suspect.leadOccupation || "N/A"}</span>
                      </div>
                    </td>

                    {/* Appointment Date */}
                    <td className="px-3">
                      {suspect.appointmentDate ? (
                        <div className="fw-medium">
                          {formatDate(suspect.appointmentDate)}
                        </div>
                      ) : (
                        <span className="text-muted">Not scheduled</span>
                      )}
                    </td>

                    {/* Time */}
                    <td className="px-3">
                      {suspect.appointmentTime ? (
                        <div className="bg-light rounded p-2 text-center fw-medium">
                          {formatTimeAMPM(suspect.appointmentTime)}
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3">{getStatusBadge(suspect.status)}</td>

                    {/* Remarks */}
                    <td className="px-3">
                      <div
                        className="text-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {suspect.remark || suspect.appointmentRemarks || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info */}
      {filteredSuspects.length > 0 && (
        <div className="mt-3 d-flex justify-content-between align-items-center text-muted">
          <div className="small">
            Showing <strong>{filteredSuspects.length}</strong> of{" "}
            <strong>{assignedSuspects.length}</strong> suspects
          </div>
          <div className="small">
            <FaInfoCircle className="me-1" />
            Click on <strong>Group Code</strong> or <strong>Details</strong>{" "}
            button to view full information
          </div>
        </div>
      )}

      {/* Add some CSS for better scrolling */}
      <style>
        {`
          .table-responsive::-webkit-scrollbar {
            height: 8px;
          }
          .table-responsive::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .table-responsive::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .table-responsive::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          .group-code-link:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0,123,255,0.2);
          }
          .suspect-name-link:hover {
            text-decoration: underline;
            color: #218838 !important;
          }
          .phone-number:hover {
            color: #096dd9 !important;
          }
          @media (max-width: 768px) {
            .assigned-tasks-page {
              padding: 10px !important;
            }
            .table-responsive {
              border-radius: 6px;
            }
            table {
              font-size: 12px;
            }
            .btn-sm {
              padding: 0.2rem 0.4rem;
              font-size: 11px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AssignedTasks;
