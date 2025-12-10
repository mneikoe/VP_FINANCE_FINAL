import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import {
  deleteSuspectById,
  updateSuspectStatus,
} from "../../../redux/feature/SuspectRedux/SuspectThunx";
import { useNavigate } from "react-router-dom";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import axios from "../../../config/axios"; // Import axios directly

function DisplaySuspect() {
  const dispatch = useDispatch();
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Function to fetch appointment scheduled suspects directly from API
  const fetchAppointmentSuspects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/suspect/allappointmentscheduled`);
      console.log("API Response:", response.data);

      // Handle different response structures
      let suspectsData;
      if (response.data.data?.appointments) {
        suspectsData = response.data.data.appointments;
      } else if (response.data.suspects) {
        suspectsData = response.data.suspects;
      } else if (response.data.success) {
        suspectsData = response.data.data || [];
      } else {
        suspectsData = [];
      }

      setSuspects(suspectsData);
    } catch (err) {
      console.error("Error fetching appointment suspects:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch suspects"
      );
      toast.error("Failed to fetch appointment scheduled suspects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentSuspects();
  }, []);

  useEffect(() => {
    // Process and filter data
    const mappedData = suspects.map((suspect) => {
      const personal = suspect.personalDetails || {};

      // Get appointment scheduled information
      const appointmentTasks =
        suspect.callTasks?.filter(
          (task) => task.taskStatus === "Appointment Scheduled"
        ) || [];

      // Get the latest appointment
      const latestAppointment = appointmentTasks.reduce((latest, task) => {
        if (!latest) return task;
        const taskDate = new Date(task.taskDate || 0);
        const latestDate = new Date(latest.taskDate || 0);
        return taskDate > latestDate ? task : latest;
      }, null);

      // Get telecaller information
      const telecallerName =
        suspect.assignedTo?.username ||
        (suspect.assignedTo && typeof suspect.assignedTo === "object"
          ? suspect.assignedTo.username
          : "Unassigned");
      const telecallerMobile = suspect.assignedTo?.mobileno || "-";

      return {
        id: suspect._id,
        groupCode: personal.groupCode || "-",
        grade: personal.grade || "-",
        groupName: personal.groupName || "-",
        name: personal.name || "-",
        gender: personal.gender || "-",
        mobile: personal.mobileNo ? `Mobile: ${personal.mobileNo}` : "",
        contactNo: personal.contactNo ? `Contact: ${personal.contactNo}` : "",
        leadSource: personal.leadSource || "-",
        leadName: personal.leadName || "-",
        area: personal.preferredMeetingArea || "-",
        callingPurpose: personal.callingPurpose || "-",
        createdAt: suspect.createdAt || new Date().toISOString(),

        // Appointment related fields
        appointmentDate: latestAppointment?.nextAppointmentDate
          ? new Date(latestAppointment.nextAppointmentDate).toLocaleDateString()
          : "Not set",
        appointmentTime: latestAppointment?.nextAppointmentTime || "Not set",
        scheduledDate: latestAppointment?.taskDate
          ? new Date(latestAppointment.taskDate).toLocaleDateString()
          : "Not set",

        appointmentRemarks: latestAppointment?.taskRemarks || "-",
        rawAppointmentDate: latestAppointment?.nextAppointmentDate, // For sorting
        rawSuspectData: suspect, // Keep original data for reference
      };
    });

    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      const filtered = mappedData.filter((item) => {
        const mobileString = item.mobile ? item.mobile.toString() : "";
        const contactString = item.contactNo ? item.contactNo.toString() : "";
        const telecallerString = item.telecallerName
          ? item.telecallerName.toLowerCase()
          : "";

        return (
          (item.groupCode &&
            item.groupCode.toLowerCase().includes(lowerCaseSearch)) ||
          (item.grade &&
            item.grade.toString().toLowerCase().includes(lowerCaseSearch)) ||
          (item.groupName &&
            item.groupName.toLowerCase().includes(lowerCaseSearch)) ||
          (item.name && item.name.toLowerCase().includes(lowerCaseSearch)) ||
          mobileString.toLowerCase().includes(lowerCaseSearch) ||
          contactString.toLowerCase().includes(lowerCaseSearch) ||
          (item.leadSource &&
            item.leadSource.toLowerCase().includes(lowerCaseSearch)) ||
          (item.leadName &&
            item.leadName.toLowerCase().includes(lowerCaseSearch)) ||
          (item.appointmentDate &&
            item.appointmentDate.toLowerCase().includes(lowerCaseSearch)) ||
          telecallerString.includes(lowerCaseSearch)
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(mappedData);
    }
  }, [suspects, searchText]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this suspect?")) {
      try {
        await dispatch(deleteSuspectById(id)).unwrap();
        toast.success("Suspect deleted successfully");
        // Refresh the list
        fetchAppointmentSuspects();
      } catch (err) {
        toast.error(err || "Failed to delete suspect");
      }
    }
  };

  const handleEdit = (suspect) => {
    navigate(`/suspect/edit/${suspect.id}`);
  };

  const handleView = (id) => {
    navigate(`/suspect/detail/${id}`);
  };

  const handleConvertStatus = (id, status) => {
    dispatch(updateSuspectStatus({ id, status }))
      .unwrap()
      .then(() => {
        toast.success("Suspect status updated successfully");
        // Refresh the list
        fetchAppointmentSuspects();
      })
      .catch((err) => {
        toast.error(err || "Failed to update suspect status");
      });
  };

  const handleRefresh = () => {
    fetchAppointmentSuspects();
  };

  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
      sortable: false,
      width: "60px",
    },
    {
      name: "Group Code",
      selector: (row) => row.groupCode,
      sortable: false,
      width: "120px",
    },
    {
      name: "Grade",
      selector: (row) => row.grade,
      sortable: false,
      width: "80px",
      center: true,
    },
    {
      name: "Group Head",
      selector: (row) => row.groupName,
      sortable: false,
      width: "150px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: false,
      width: "150px",
    },
    {
      name: "Gender",
      selector: (row) => row.gender,
      sortable: false,
      width: "100px",
    },
    {
      name: "Contact Numbers",
      cell: (row) => (
        <div style={{ whiteSpace: "pre-line", lineHeight: "1.4" }}>
          {row.mobile && <div>{row.mobile}</div>}
          {row.contactNo && <div>{row.contactNo}</div>}
          {!row.mobile && !row.contactNo && "-"}
        </div>
      ),
      sortable: false,
      width: "180px",
    },
    {
      name: "Lead Source",
      selector: (row) => row.leadSource,
      sortable: false,
      width: "150px",
    },
    {
      name: "Lead Name",
      selector: (row) => row.leadName,
      sortable: false,
      width: "150px",
    },
    {
      name: "Area",
      selector: (row) => row.area,
      sortable: false,
      width: "150px",
    },
    {
      name: "Calling Purpose",
      selector: (row) => row.callingPurpose,
      sortable: false,
      width: "150px",
    },
    {
      name: "Appointment Date",
      selector: (row) => row.appointmentDate,
      sortable: true,
      sortFunction: (a, b) => {
        return (
          new Date(a.rawAppointmentDate || 0) -
          new Date(b.rawAppointmentDate || 0)
        );
      },
      width: "190px",
    },
    {
      name: "Appointment Time",
      selector: (row) => row.appointmentTime,
      sortable: false,
      width: "190px",
    },
    {
      name: "Scheduled Date",
      selector: (row) => row.scheduledDate,
      sortable: false,
      width: "190px",
    },

    {
      name: "Appointment Remarks",
      selector: (row) => row.appointmentRemarks,
      sortable: false,
      width: "180px",
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex flex-wrap gap-1">
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-nowrap"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="text-nowrap"
          >
            Delete
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => handleView(row.id)}
            className="text-nowrap"
          >
            View
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      width: "220px",
    },
    {
      name: "Convert",
      cell: (row) => (
        <Dropdown as={ButtonGroup}>
          <Dropdown.Toggle variant="primary" size="sm" className="text-nowrap">
            Convert Status
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => handleConvertStatus(row.id, "client")}
            >
              Client
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handleConvertStatus(row.id, "prospect")}
            >
              Prospect
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ),
      ignoreRowClick: true,
      width: "140px",
    },
  ];

  if (loading)
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
        <p>Loading appointment scheduled suspects...</p>
      </div>
    );

  if (error) return <p className="text-danger">Error: {error}</p>;

  return (
    <div className="w-100 p-2 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Appointment Scheduled Suspect List</h3>
          <p className="text-muted mb-0">
            Showing {filteredData.length} suspects with "Appointment Scheduled"
            status
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="info"
            onClick={handleRefresh}
            className="text-nowrap"
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </Button>
        </div>
      </div>

      <div className="card shadow-sm">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          defaultSortFieldId="appointmentDate"
          defaultSortAsc={true}
          highlightOnHover
          responsive
          striped
          bordered
          fixedHeader
          fixedHeaderScrollHeight="600px"
          progressPending={loading}
          progressComponent={
            <div className="py-5">
              <Spinner animation="border" />
            </div>
          }
          subHeader
          subHeaderComponent={
            <div className="w-100 d-flex justify-content-between">
              <input
                type="text"
                placeholder="Search by Group Code, Grade, Name, Contact, Telecaller, or Appointment Date..."
                className="form-control"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div className="d-flex gap-2 ms-2">
                <Button
                  variant="secondary"
                  onClick={() => setSearchText("")}
                  disabled={!searchText}
                >
                  Clear
                </Button>
              </div>
            </div>
          }
          customStyles={{
            headCells: {
              style: {
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
                fontSize: "14px",
              },
            },
            cells: {
              style: {
                padding: "8px",
                verticalAlign: "middle",
                fontSize: "13px",
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default DisplaySuspect;
