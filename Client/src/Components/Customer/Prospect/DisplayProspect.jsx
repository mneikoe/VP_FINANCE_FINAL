import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Container,
  InputGroup,
  FormControl,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import {
  FiEye,
  FiEdit,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import ProspectAppointmentList from "../../Reports/ProspectAppointmentList"; // ✅ Import

const DisplayProspect = ({ setActiveTab, setEditId }) => {
  const [viewMode, setViewMode] = useState("prospects"); // 'prospects' or 'appointments'
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch prospects
  const fetchProspects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/prospect/all");

      if (response.data.success && response.data.prospects) {
        const prospectData = response.data.prospects.map((prospect) => ({
          _id: prospect._id,
          name: prospect.personalDetails?.name || "N/A",
          groupCode: prospect.personalDetails?.groupCode || "N/A",
          mobileNo: prospect.personalDetails?.mobileNo || "N/A",
          emailId: prospect.personalDetails?.emailId || "N/A",
          leadSource: prospect.personalDetails?.leadSource || "N/A",
          city: prospect.personalDetails?.city || "N/A",
          occupation: prospect.personalDetails?.occupation || "N/A",
          latestAppointment:
            prospect.callTasks?.length > 0
              ? prospect.callTasks
                  .filter((task) => task.taskStatus === "Appointment Done")
                  .sort(
                    (a, b) => new Date(b.taskDate) - new Date(a.taskDate)
                  )[0]
              : null,
          createdAt: prospect.createdAt,
        }));

        setProspects(prospectData);
      } else {
        setProspects([]);
      }
    } catch (err) {
      console.error("❌ Error fetching prospects:", err);
      setError(err.response?.data?.message || "Failed to load prospects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const handleEdit = (id) => {
    setEditId(id);
    setActiveTab("add");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const filteredProspects = prospects.filter(
    (prospect) =>
      prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.groupCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.mobileNo.includes(searchTerm) ||
      prospect.emailId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" />
        <span className="ms-3">Loading prospects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchProspects}>
          <FiRefreshCw className="me-2" />
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Container fluid className="p-0">
      {/* Header with View Toggle */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="text-dark fw-bold mb-1">
              {viewMode === "prospects"
                ? "Prospect Leads"
                : "Prospect/Appointment List"}
            </h4>
            <p className="text-muted mb-0">
              {viewMode === "prospects"
                ? "Manage all prospect leads"
                : "View prospects with appointment details"}
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              className={`btn ${
                viewMode === "prospects"
                  ? "btn-dark text-white"
                  : "btn-outline-dark"
              }`}
              onClick={() => setViewMode("prospects")}
              style={{
                fontSize: "0.75rem",
                padding: "6px 12px",
              }}
            >
              📋 Prospect Leads
            </button>

            <button
              className={`btn ${
                viewMode === "appointments"
                  ? "btn-dark text-white"
                  : "btn-outline-dark"
              }`}
              onClick={() => setViewMode("appointments")}
              style={{
                fontSize: "0.75rem",
                padding: "6px 12px",
              }}
            >
              📅 Appointment List
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-3">
            <Row>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <FiSearch className="text-muted" />
                  </InputGroup.Text>
                  <FormControl
                    placeholder={`Search ${
                      viewMode === "prospects" ? "prospects" : "appointments"
                    }...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </Col>
              <Col md={6} className="text-end">
                <Button
                  variant="outline-dark"
                  onClick={fetchProspects}
                  className="d-flex align-items-center"
                  style={{ fontSize: "0.75rem" }}
                >
                  <FiRefreshCw className="me-2" />
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>

      {/* Content based on view mode */}
      {viewMode === "prospects" ? (
        // Original Prospect Leads View
        <div className="table-responsive">
          <Table hover className="border">
            <thead className="bg-light">
              <tr>
                <th className="ps-4 py-3 text-dark fw-semibold">
                  Prospect Details
                </th>
                <th className="py-3 text-dark fw-semibold">Contact Info</th>
                <th className="py-3 text-dark fw-semibold">Lead Source</th>
                <th className="py-3 text-dark fw-semibold">Created Date</th>
                <th className="pe-4 py-3 text-dark fw-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProspects.map((prospect) => (
                <tr key={prospect._id} className="border-top">
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "40px",
                          height: "40px",
                          fontSize: "16px",
                          fontWeight: "600",
                        }}
                      >
                        {prospect.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="mb-1 text-dark fw-semibold">
                          {prospect.name}
                        </h6>
                        <small className="text-muted">
                          {prospect.groupCode}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="mb-2">
                      <div className="d-flex align-items-center">
                        <FiPhone size={14} className="text-muted me-2" />
                        <span className="text-dark">{prospect.mobileNo}</span>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex align-items-center">
                        <FiMail size={14} className="text-muted me-2" />
                        <span className="text-dark">{prospect.emailId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge bg="light" text="dark" className="px-3 py-1">
                      {prospect.leadSource}
                    </Badge>
                    <div className="mt-2">
                      <small className="text-muted">{prospect.city}</small>
                    </div>
                  </td>
                  <td className="py-3">{formatDate(prospect.createdAt)}</td>
                  <td className="pe-4 py-3 text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        variant="dark"
                        size="sm"
                        onClick={() => handleEdit(prospect._id)}
                        className="d-flex align-items-center px-3"
                        style={{ fontSize: "0.75rem" }}
                      >
                        <FiEdit size={14} className="me-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        as={Link}
                        to={`/prospect/${prospect._id}`}
                        className="d-flex align-items-center px-3"
                        style={{ fontSize: "0.75rem" }}
                      >
                        <FiEye size={14} className="me-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        // Appointment List View
        <ProspectAppointmentList
          showAppointmentInfo={true}
          showActions={true}
          compactView={true}
        />
      )}

      {/* Stats Summary */}
      {filteredProspects.length > 0 && viewMode === "prospects" && (
        <div className="mt-4 pt-3 border-top">
          <Row>
            <Col md={3}>
              <Card className="border text-center py-2">
                <h5 className="mb-0 text-dark">{filteredProspects.length}</h5>
                <small className="text-muted">Total Prospects</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border text-center py-2">
                <h5 className="mb-0 text-dark">
                  {filteredProspects.filter((p) => p.latestAppointment).length}
                </h5>
                <small className="text-muted">With Appointments</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border text-center py-2">
                <h5 className="mb-0 text-dark">
                  {filteredProspects.filter((p) => !p.latestAppointment).length}
                </h5>
                <small className="text-muted">Without Appointments</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border text-center py-2">
                <h5 className="mb-0 text-dark">
                  {new Set(filteredProspects.map((p) => p.city)).size}
                </h5>
                <small className="text-muted">Cities</small>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
};

export default DisplayProspect;
