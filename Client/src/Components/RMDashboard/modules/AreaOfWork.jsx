import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Spinner,
  ListGroup,
  Button,
} from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaSync,
  FaBuilding,
  FaLocationArrow,
  FaCity,
  FaHashtag,
} from "react-icons/fa";
import axios from "axios";

const AreaOfWork = () => {
  // States
  const [rmData, setRmData] = useState(null);
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rmSubAreas, setRmSubAreas] = useState([]);

  // Fetch RM data and areas
  useEffect(() => {
    fetchRmData();
  }, []);

  const fetchRmData = async () => {
    setLoading(true);
    try {
      // Get current RM data (assuming you have RM ID in localStorage or context)
      const rmId = localStorage.getItem("rmId") || "694fce3b18e5add83d0379f2"; // Hardcoded for demo

      // Fetch RM details
      const rmResponse = await axios.get(
        `/api/employee/getEmployeeById?employeeId=${rmId}`
      );
      if (rmResponse.data.success) {
        setRmData(rmResponse.data.data);

        // Now fetch areas and subareas based on RM's workArea
        await fetchAreasAndSubAreas(rmResponse.data.data.workArea);
      }
    } catch (error) {
      console.error("Error fetching RM data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreasAndSubAreas = async (workArea) => {
    try {
      // Fetch all areas
      const areaResponse = await axios.get("/api/leadarea");
      setAreas(areaResponse.data || []);

      // Fetch all subareas
      const subAreaResponse = await axios.get("/api/leadsubarea");
      setSubAreas(subAreaResponse.data || []);

      // Find RM's specific area
      const rmArea = areaResponse.data.find((area) => area.name === workArea);

      if (rmArea) {
        // Get subareas for RM's area
        const filteredSubAreas = subAreaResponse.data.filter(
          (sub) =>
            sub.areaId &&
            (sub.areaId._id === rmArea._id || sub.areaId === rmArea._id)
        );
        setRmSubAreas(filteredSubAreas);
      }
    } catch (error) {
      console.error("Error fetching areas/subareas:", error);
    }
  };

  // Get RM's assigned area object
  const getRmAreaDetails = () => {
    if (!rmData || !rmData.workArea) return null;

    return areas.find((area) => area.name === rmData.workArea);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your work area...</p>
      </Container>
    );
  }

  const rmAreaDetails = getRmAreaDetails();

  return (
    <Container fluid className="p-4">
      <div className="border rounded bg-light p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <FaMapMarkerAlt className="text-primary me-2" />
              My Assigned Work Area
            </h2>
            <p className="text-muted mb-0">
              View your designated work area and sub-areas
            </p>
          </div>

          <Button variant="dark" onClick={fetchRmData}>
            <FaSync /> Refresh
          </Button>
        </div>

        {/* RM Info Card */}
        {rmData && (
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaBuilding className="me-2" />
                RM Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="mb-3">
                    <strong>RM Code:</strong>
                    <Badge bg="info" className="ms-2">
                      {rmData.employeeCode}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <strong>Name:</strong>
                    <div className="fw-bold mt-1">{rmData.name}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <strong>Mobile:</strong>
                    <div className="mt-1">{rmData.mobileNo}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Email:</strong>
                    <div className="mt-1">{rmData.emailId}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <strong>Designation:</strong>
                    <div className="mt-1">{rmData.designation}</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Assigned Area Section */}
        <Card className="mb-4">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">
              <FaLocationArrow className="me-2" />
              My Designated Work Area
            </h5>
          </Card.Header>
          <Card.Body>
            {rmAreaDetails ? (
              <Row>
                <Col md={8}>
                  <div className="border rounded p-4 bg-light">
                    <div className="d-flex align-items-center mb-3">
                      <FaMapMarkerAlt className="text-success fs-3 me-3" />
                      <div>
                        <h3 className="mb-1">{rmAreaDetails.name}</h3>
                        <div className="text-muted">
                          <FaHashtag className="me-1" />
                          Pincode: {rmAreaDetails.pincode}
                        </div>
                      </div>
                    </div>

                    <Row className="mt-4">
                      <Col md={6}>
                        <div className="d-flex align-items-center mb-3">
                          <FaCity className="text-primary me-3" />
                          <div>
                            <strong>City:</strong>
                            <div className="fw-bold">{rmAreaDetails.city}</div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex align-items-center mb-3">
                          <FaBuilding className="text-warning me-3" />
                          <div>
                            <strong>Short Code:</strong>
                            <div className="fw-bold">
                              {rmAreaDetails.shortcode}
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>

                <Col md={4}>
                  <Card className="h-100 border-warning">
                    <Card.Header className="bg-warning text-white">
                      <h6 className="mb-0">Area Summary</h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                      <div className="display-4 text-warning mb-2">
                        {rmSubAreas.length}
                      </div>
                      <div className="text-muted">Sub-Areas</div>
                      <div className="mt-3 small">
                        {rmSubAreas.length > 0 ? (
                          <span className="text-success">
                            ✅ Sub-areas assigned
                          </span>
                        ) : (
                          <span className="text-danger">
                            ⚠️ No sub-areas defined
                          </span>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Alert variant="warning">
                <strong>No area assigned!</strong> Please contact admin to
                assign a work area.
              </Alert>
            )}
          </Card.Body>
        </Card>

        {/* Sub-Areas List */}
        <Card>
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">
              <FaMapMarkerAlt className="me-2" />
              Sub-Areas under {rmAreaDetails?.name || "My Area"}
              <Badge bg="light" text="dark" className="ms-2">
                {rmSubAreas.length}
              </Badge>
            </h5>
          </Card.Header>
          <Card.Body>
            {rmSubAreas.length > 0 ? (
              <Row>
                {rmSubAreas.map((subArea, index) => (
                  <Col md={4} key={subArea._id} className="mb-3">
                    <Card className="h-100 border-info">
                      <Card.Header className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>
                            <FaMapMarkerAlt className="text-info me-2" />
                            {subArea.subAreaName}
                          </strong>
                          <Badge bg="primary">#{index + 1}</Badge>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className="small text-muted">
                          <div className="mb-2">
                            <strong>Area:</strong> {rmAreaDetails?.name}
                          </div>
                          <div className="mb-2">
                            <strong>City:</strong> {rmAreaDetails?.city}
                          </div>
                          <div>
                            <strong>Pincode:</strong> {rmAreaDetails?.pincode}
                          </div>
                        </div>
                      </Card.Body>
                      <Card.Footer className="bg-light">
                        <small className="text-muted">
                          ID: {subArea._id.substring(18, 24)}...
                        </small>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info">
                <strong>No sub-areas defined!</strong> This area doesn't have
                any sub-areas assigned yet.
                {rmAreaDetails && (
                  <div className="mt-2">
                    Area: <strong>{rmAreaDetails.name}</strong> | Pincode:{" "}
                    <strong>{rmAreaDetails.pincode}</strong> | City:{" "}
                    <strong>{rmAreaDetails.city}</strong>
                  </div>
                )}
              </Alert>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default AreaOfWork;
