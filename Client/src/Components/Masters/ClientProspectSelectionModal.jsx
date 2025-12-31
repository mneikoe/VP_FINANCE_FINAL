import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  FormControl,
  Row,
  Col,
  Badge,
  Alert,
  ListGroup,
  Spinner,
  Card,
  Tab,
  Tabs,
} from "react-bootstrap";
import axios from "axios";
import {
  FaUserFriends,
  FaUsers,
  FaSearch,
  FaTimes,
  FaCheck,
  FaUserCheck,
  FaSync,
  FaExclamationCircle,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaFilter,
  FaChevronRight,
} from "react-icons/fa";

// ✅ यहां default export करें
const ClientProspectSelectionModal = ({
  show,
  onHide,
  onConfirm,
  selectedTask,
  loading = false,
  initialSelections = { clients: [], prospects: [] },
  title = "Select Clients & Prospects",
}) => {
  // Main state
  const [activeTab, setActiveTab] = useState("clients");
  const [clients, setClients] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredProspects, setFilteredProspects] = useState([]);

  // Loading states
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProspects, setLoadingProspects] = useState(false);

  // Search states
  const [clientSearch, setClientSearch] = useState("");
  const [prospectSearch, setProspectSearch] = useState("");

  // Selection states
  const [selectedClients, setSelectedClients] = useState(
    initialSelections.clients || []
  );
  const [selectedProspects, setSelectedProspects] = useState(
    initialSelections.prospects || []
  );

  // Remarks
  const [clientRemarks, setClientRemarks] = useState("");
  const [prospectRemarks, setProspectRemarks] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProspects: 0,
    loadedClients: 0,
    loadedProspects: 0,
  });

  // Error state
  const [error, setError] = useState("");

  // Initialize when modal opens
  useEffect(() => {
    if (show) {
      // Reset states
      setError("");
      fetchClients();
      fetchProspects();
    } else {
      // Reset selections on close
      resetSelections();
    }
  }, [show]);

  // Filter clients based on search
  useEffect(() => {
    if (clientSearch.trim() === "") {
      setFilteredClients(clients);
    } else {
      const searchLower = clientSearch.toLowerCase();
      const filtered = clients.filter((client) => {
        const name = client.personalDetails?.name?.toLowerCase() || "";
        const mobile = client.personalDetails?.mobileNo?.toLowerCase() || "";
        const email = client.personalDetails?.emailId?.toLowerCase() || "";
        const company =
          client.personalDetails?.organisation?.toLowerCase() || "";

        return (
          name.includes(searchLower) ||
          mobile.includes(searchLower) ||
          email.includes(searchLower) ||
          company.includes(searchLower)
        );
      });
      setFilteredClients(filtered);
    }
  }, [clientSearch, clients]);

  // Filter prospects based on search
  useEffect(() => {
    if (prospectSearch.trim() === "") {
      setFilteredProspects(prospects);
    } else {
      const searchLower = prospectSearch.toLowerCase();
      const filtered = prospects.filter((prospect) => {
        const name = prospect.personalDetails?.name?.toLowerCase() || "";
        const mobile = prospect.personalDetails?.mobileNo?.toLowerCase() || "";
        const email = prospect.personalDetails?.emailId?.toLowerCase() || "";
        const leadSource =
          prospect.personalDetails?.leadSource?.toLowerCase() || "";

        return (
          name.includes(searchLower) ||
          mobile.includes(searchLower) ||
          email.includes(searchLower) ||
          leadSource.includes(searchLower)
        );
      });
      setFilteredProspects(filtered);
    }
  }, [prospectSearch, prospects]);

  // Fetch clients from API
  const fetchClients = async () => {
    setLoadingClients(true);
    setError("");
    try {
      const response = await axios.get("/api/client/all");

      let clientData = [];

      // Handle different response structures
      if (response.data?.success && response.data?.clients) {
        clientData = response.data.clients;
      } else if (Array.isArray(response.data)) {
        clientData = response.data;
      } else if (response.data?.data) {
        clientData = response.data.data;
      }

      setClients(clientData);
      setFilteredClients(clientData);

      setStats((prev) => ({
        ...prev,
        totalClients: clientData.length,
        loadedClients: clientData.length,
      }));

      console.log(`✅ Loaded ${clientData.length} clients`);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Failed to load clients. Please try again.");
    } finally {
      setLoadingClients(false);
    }
  };

  // Fetch prospects from API
  const fetchProspects = async () => {
    setLoadingProspects(true);
    setError("");
    try {
      const response = await axios.get("/api/prospect/all");

      let prospectData = [];

      // Handle different response structures
      if (response.data?.success && response.data?.prospects) {
        prospectData = response.data.prospects;
      } else if (Array.isArray(response.data)) {
        prospectData = response.data;
      } else if (response.data?.data) {
        prospectData = response.data.data;
      }

      setProspects(prospectData);
      setFilteredProspects(prospectData);

      setStats((prev) => ({
        ...prev,
        totalProspects: prospectData.length,
        loadedProspects: prospectData.length,
      }));

      console.log(`✅ Loaded ${prospectData.length} prospects`);
    } catch (error) {
      console.error("Error fetching prospects:", error);
      setError("Failed to load prospects. Please try again.");
    } finally {
      setLoadingProspects(false);
    }
  };

  // Reset all selections
  const resetSelections = () => {
    setSelectedClients([]);
    setSelectedProspects([]);
    setClientRemarks("");
    setProspectRemarks("");
    setClientSearch("");
    setProspectSearch("");
    setError("");
    setActiveTab("clients");
  };

  // Toggle client selection
  const toggleClientSelection = (clientId) => {
    setSelectedClients((prev) => {
      if (prev.includes(clientId)) {
        return prev.filter((id) => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  // Toggle prospect selection
  const toggleProspectSelection = (prospectId) => {
    setSelectedProspects((prev) => {
      if (prev.includes(prospectId)) {
        return prev.filter((id) => id !== prospectId);
      } else {
        return [...prev, prospectId];
      }
    });
  };

  // Select all filtered clients
  const selectAllClients = () => {
    const allIds = filteredClients.map((c) => c._id);
    setSelectedClients((prev) => {
      // If all already selected, clear
      const allSelected = allIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !allIds.includes(id));
      }
      // Otherwise add all
      const newSelection = [...prev];
      allIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Select all filtered prospects
  const selectAllProspects = () => {
    const allIds = filteredProspects.map((p) => p._id);
    setSelectedProspects((prev) => {
      // If all already selected, clear
      const allSelected = allIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !allIds.includes(id));
      }
      // Otherwise add all
      const newSelection = [...prev];
      allIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Clear all selections
  const clearAllSelections = () => {
    if (window.confirm("Clear all selected clients and prospects?")) {
      setSelectedClients([]);
      setSelectedProspects([]);
    }
  };

  // Handle confirm button click
  const handleConfirm = () => {
    if (selectedClients.length === 0 && selectedProspects.length === 0) {
      setError("Please select at least one client or prospect");
      return;
    }

    const selectionData = {
      clients: selectedClients,
      prospects: selectedProspects,
      clientRemarks: clientRemarks.trim(),
      prospectRemarks: prospectRemarks.trim(),
      totalSelected: selectedClients.length + selectedProspects.length,
    };

    console.log("✅ Selection data:", selectionData);

    if (onConfirm) {
      onConfirm(selectionData);
      onHide();
    }
  };

  // Check if client is selected
  const isClientSelected = (clientId) => selectedClients.includes(clientId);

  // Check if prospect is selected
  const isProspectSelected = (prospectId) =>
    selectedProspects.includes(prospectId);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get client/prospect name
  const getName = (item) => {
    return item.personalDetails?.name || "Unnamed";
  };

  // Get client/prospect mobile
  const getMobile = (item) => {
    return item.personalDetails?.mobileNo || "No mobile";
  };

  // Get client/prospect email
  const getEmail = (item) => {
    return item.personalDetails?.emailId || "No email";
  };

  // Get client company
  const getCompany = (client) => {
    return client.personalDetails?.organisation || "No company";
  };

  // Get prospect lead source
  const getLeadSource = (prospect) => {
    return prospect.personalDetails?.leadSource || "Unknown";
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      className="client-prospect-modal"
    >
      <Modal.Header className="bg-light border-bottom py-3">
        <Modal.Title className="d-flex align-items-center w-100">
          <FaUsers className="me-3 text-primary" />
          <div className="flex-grow-1">
            <h5 className="mb-0 fw-bold">{title}</h5>
            <small className="text-muted">
              Select clients and prospects for this task assignment
            </small>
          </div>
          <Button variant="link" onClick={onHide} className="p-0 ms-auto">
            <FaTimes size={20} />
          </Button>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {/* Stats Bar */}
        <div className="bg-light border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-4">
              <div className="text-center">
                <Badge bg="success" className="px-3 py-2">
                  <FaUserFriends className="me-2" />
                  {selectedClients.length} Client(s)
                </Badge>
                <small className="d-block text-muted mt-1">Selected</small>
              </div>
              <div className="text-center">
                <Badge bg="info" className="px-3 py-2">
                  <FaUsers className="me-2" />
                  {selectedProspects.length} Prospect(s)
                </Badge>
                <small className="d-block text-muted mt-1">Selected</small>
              </div>
              <div className="text-center">
                <Badge bg="dark" className="px-3 py-2">
                  {selectedClients.length + selectedProspects.length} Total
                </Badge>
                <small className="d-block text-muted mt-1">Selected</small>
              </div>
            </div>

            <div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={clearAllSelections}
                disabled={
                  selectedClients.length === 0 && selectedProspects.length === 0
                }
                className="me-2"
              >
                Clear All
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={
                  activeTab === "clients" ? fetchClients : fetchProspects
                }
              >
                <FaSync
                  className={`me-1 ${
                    loadingClients || loadingProspects ? "spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="px-3 pt-3 border-bottom"
          fill
        >
          <Tab
            eventKey="clients"
            title={
              <div className="d-flex align-items-center">
                <FaUserFriends className="me-2 text-success" />
                Clients
                <Badge bg="success" className="ms-2">
                  {selectedClients.length}
                </Badge>
              </div>
            }
          >
            {/* Client Tab Content */}
            <div className="p-3">
              {/* Client Search */}
              <div className="mb-3">
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <FaSearch />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search clients by name, mobile, email or company..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                  {clientSearch && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setClientSearch("")}
                    >
                      <FaTimes />
                    </Button>
                  )}
                  <Button
                    variant={
                      filteredClients.length > 0 &&
                      filteredClients.every((c) => isClientSelected(c._id))
                        ? "success"
                        : "outline-success"
                    }
                    onClick={selectAllClients}
                    disabled={filteredClients.length === 0}
                  >
                    <FaCheck className="me-1" />
                    {filteredClients.length > 0 &&
                    filteredClients.every((c) => isClientSelected(c._id))
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </InputGroup>
                <div className="d-flex justify-content-between mt-2">
                  <small className="text-muted">
                    Showing {filteredClients.length} of {clients.length} clients
                  </small>
                  <small className="text-muted">
                    {selectedClients.length} selected
                  </small>
                </div>
              </div>

              {/* Client List */}
              <div
                className="client-list-container"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {loadingClients ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status" variant="success">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2 text-muted">Loading clients...</p>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-5">
                    <FaUserFriends size={48} className="text-muted mb-3" />
                    <h6 className="text-dark mb-2">No Clients Found</h6>
                    <p className="text-muted">
                      {clientSearch
                        ? "No clients match your search"
                        : "No clients available"}
                    </p>
                    <Button variant="outline-success" onClick={fetchClients}>
                      <FaSync className="me-2" />
                      Reload Clients
                    </Button>
                  </div>
                ) : (
                  <div className="row g-2">
                    {filteredClients.map((client) => (
                      <div key={client._id} className="col-md-6">
                        <Card
                          className={`border ${
                            isClientSelected(client._id)
                              ? "border-success bg-success-light"
                              : ""
                          }`}
                          onClick={() => toggleClientSelection(client._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex align-items-start">
                              <div className="me-3">
                                <div
                                  className={`rounded-circle p-2 ${
                                    isClientSelected(client._id)
                                      ? "bg-success text-white"
                                      : "bg-light"
                                  }`}
                                >
                                  <FaUserCheck />
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="mb-1 fw-bold text-dark">
                                      {getName(client)}
                                      {isClientSelected(client._id) && (
                                        <Badge bg="success" className="ms-2">
                                          Selected
                                        </Badge>
                                      )}
                                    </h6>
                                    <div className="d-flex flex-wrap gap-2">
                                      <small className="text-muted">
                                        <FaBuilding className="me-1" />
                                        {getCompany(client)}
                                      </small>
                                      <small className="text-muted">
                                        <FaPhone className="me-1" />
                                        {getMobile(client)}
                                      </small>
                                    </div>
                                  </div>
                                  <Badge bg="light" text="dark">
                                    Client
                                  </Badge>
                                </div>
                                <div className="mt-2">
                                  <small className="text-muted">
                                    <FaEnvelope className="me-1" />
                                    {getEmail(client)}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Remarks */}
              <div className="mt-3">
                <Form.Label className="fw-semibold">
                  <FaChevronRight className="me-2 text-success" />
                  Remarks for Clients (Optional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Add any notes or instructions specific to selected clients..."
                  value={clientRemarks}
                  onChange={(e) => setClientRemarks(e.target.value)}
                />
                <small className="text-muted">
                  These remarks will be added to the task assignment
                </small>
              </div>
            </div>
          </Tab>

          <Tab
            eventKey="prospects"
            title={
              <div className="d-flex align-items-center">
                <FaUsers className="me-2 text-info" />
                Prospects
                <Badge bg="info" className="ms-2">
                  {selectedProspects.length}
                </Badge>
              </div>
            }
          >
            {/* Prospect Tab Content */}
            <div className="p-3">
              {/* Prospect Search */}
              <div className="mb-3">
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <FaSearch />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search prospects by name, mobile, email or lead source..."
                    value={prospectSearch}
                    onChange={(e) => setProspectSearch(e.target.value)}
                  />
                  {prospectSearch && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setProspectSearch("")}
                    >
                      <FaTimes />
                    </Button>
                  )}
                  <Button
                    variant={
                      filteredProspects.length > 0 &&
                      filteredProspects.every((p) => isProspectSelected(p._id))
                        ? "info"
                        : "outline-info"
                    }
                    onClick={selectAllProspects}
                    disabled={filteredProspects.length === 0}
                  >
                    <FaCheck className="me-1" />
                    {filteredProspects.length > 0 &&
                    filteredProspects.every((p) => isProspectSelected(p._id))
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </InputGroup>
                <div className="d-flex justify-content-between mt-2">
                  <small className="text-muted">
                    Showing {filteredProspects.length} of {prospects.length}{" "}
                    prospects
                  </small>
                  <small className="text-muted">
                    {selectedProspects.length} selected
                  </small>
                </div>
              </div>

              {/* Prospect List */}
              <div
                className="prospect-list-container"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {loadingProspects ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status" variant="info">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2 text-muted">Loading prospects...</p>
                  </div>
                ) : filteredProspects.length === 0 ? (
                  <div className="text-center py-5">
                    <FaUsers size={48} className="text-muted mb-3" />
                    <h6 className="text-dark mb-2">No Prospects Found</h6>
                    <p className="text-muted">
                      {prospectSearch
                        ? "No prospects match your search"
                        : "No prospects available"}
                    </p>
                    <Button variant="outline-info" onClick={fetchProspects}>
                      <FaSync className="me-2" />
                      Reload Prospects
                    </Button>
                  </div>
                ) : (
                  <div className="row g-2">
                    {filteredProspects.map((prospect) => (
                      <div key={prospect._id} className="col-md-6">
                        <Card
                          className={`border ${
                            isProspectSelected(prospect._id)
                              ? "border-info bg-info-light"
                              : ""
                          }`}
                          onClick={() => toggleProspectSelection(prospect._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex align-items-start">
                              <div className="me-3">
                                <div
                                  className={`rounded-circle p-2 ${
                                    isProspectSelected(prospect._id)
                                      ? "bg-info text-white"
                                      : "bg-light"
                                  }`}
                                >
                                  <FaUserCheck />
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="mb-1 fw-bold text-dark">
                                      {getName(prospect)}
                                      {isProspectSelected(prospect._id) && (
                                        <Badge bg="info" className="ms-2">
                                          Selected
                                        </Badge>
                                      )}
                                    </h6>
                                    <div className="d-flex flex-wrap gap-2">
                                      <small className="text-muted">
                                        <FaFilter className="me-1" />
                                        {getLeadSource(prospect)}
                                      </small>
                                      <small className="text-muted">
                                        <FaPhone className="me-1" />
                                        {getMobile(prospect)}
                                      </small>
                                    </div>
                                  </div>
                                  <Badge bg="warning" text="dark">
                                    Prospect
                                  </Badge>
                                </div>
                                <div className="mt-2">
                                  <small className="text-muted">
                                    <FaCalendarAlt className="me-1" />
                                    Created: {formatDate(prospect.createdAt)}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prospect Remarks */}
              <div className="mt-3">
                <Form.Label className="fw-semibold">
                  <FaChevronRight className="me-2 text-info" />
                  Remarks for Prospects (Optional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Add any notes or instructions specific to selected prospects..."
                  value={prospectRemarks}
                  onChange={(e) => setProspectRemarks(e.target.value)}
                />
                <small className="text-muted">
                  These remarks will be added to the task assignment
                </small>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer className="bg-light border-top py-3">
        {/* Error Message */}
        {error && (
          <Alert variant="danger" className="w-100 mb-0">
            <FaExclamationCircle className="me-2" />
            {error}
          </Alert>
        )}

        <div className="d-flex justify-content-between w-100 align-items-center">
          <div>
            <h6 className="mb-0 text-dark">
              Total Selected:{" "}
              <strong>
                {selectedClients.length + selectedProspects.length}
              </strong>
            </h6>
            <small className="text-muted">
              {selectedClients.length} client(s) • {selectedProspects.length}{" "}
              prospect(s)
            </small>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={onHide}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={
                selectedClients.length === 0 && selectedProspects.length === 0
              }
              className="px-4"
            >
              <FaCheck className="me-2" />
              Confirm Selection
              <Badge bg="light" text="dark" className="ms-2">
                {selectedClients.length + selectedProspects.length}
              </Badge>
            </Button>
          </div>
        </div>
      </Modal.Footer>

      <style jsx global>{`
        .client-prospect-modal .modal-xl {
          max-width: 1200px;
        }

        .bg-success-light {
          background-color: rgba(25, 135, 84, 0.05) !important;
        }

        .bg-info-light {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }

        .client-list-container::-webkit-scrollbar,
        .prospect-list-container::-webkit-scrollbar {
          width: 6px;
        }

        .client-list-container::-webkit-scrollbar-track,
        .prospect-list-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .client-list-container::-webkit-scrollbar-thumb,
        .prospect-list-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }

        .client-list-container::-webkit-scrollbar-thumb:hover,
        .prospect-list-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .nav-tabs .nav-link {
          font-weight: 600;
          padding: 12px 24px;
        }

        .nav-tabs .nav-link.active {
          border-bottom: 3px solid var(--bs-primary);
        }
      `}</style>
    </Modal>
  );
};

// ✅ यहां default export करें
export default ClientProspectSelectionModal;
