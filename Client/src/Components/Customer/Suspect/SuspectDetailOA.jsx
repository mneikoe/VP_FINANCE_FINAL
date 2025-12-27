import React, { useEffect, useState } from "react";
import { Button, Spinner, Card, Row, Col, Badge } from "react-bootstrap";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiPhoneCall,
  FiCalendar,
  FiDollarSign,
  FiHome,
} from "react-icons/fi";
import { FaIdCardAlt } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getSuspectById } from "../../../redux/feature/SuspectRedux/SuspectThunx";

const SuspectDetailOA = () => {
  const [userData, setUserData] = useState(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Fetch suspect data
  useEffect(() => {
    fetchSuspectData();
  }, [id]);

  const fetchSuspectData = async () => {
    setLoading(true);
    try {
      const res = await dispatch(getSuspectById(id)).unwrap();
      setUserData(res?.suspect);
    } catch (error) {
      console.error("Error fetching suspect:", error);
      toast.error("Failed to load suspect details");
    } finally {
      setLoading(false);
    }
  };

  // Format functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading suspect details...</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="alert alert-danger m-4">
        <h4>❌ Error Loading Data</h4>
        <p>Failed to load suspect details. Please try again.</p>
        <Button variant="primary" onClick={fetchSuspectData}>
          Retry
        </Button>
      </div>
    );
  }

  const personal = userData?.personalDetails || {};

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-primary mb-2">
            <FiUser className="me-2" />
            {personal.groupName || "Suspect Profile"}
          </h1>
          <div className="d-flex gap-2 flex-wrap">
            <Badge bg="info">
              ID: {personal.groupCode || id?.substring(0, 8)}
            </Badge>
            <Badge bg="secondary">
              Status: {userData?.status || "suspect"}
            </Badge>
            {personal.grade && (
              <Badge bg="warning" text="dark">
                Grade: {personal.grade}
              </Badge>
            )}
            {personal.leadSource && (
              <Badge bg="success">Source: {personal.leadSource}</Badge>
            )}
          </div>
        </div>
      </div>

      <Row>
        {/* Left Column: Contact & Basic Info */}
        <Col md={5} lg={4}>
          {/* Profile Card */}
          <Card className="shadow-sm mb-4">
            <Card.Body className="text-center">
              <div
                className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "100px", height: "100px" }}
              >
                <FiUser size={40} color="white" />
              </div>
              <h4 className="mb-1">{personal.groupName || "N/A"}</h4>
              <p className="text-muted mb-2">
                {personal.organisation || "N/A"}
              </p>
              <p className="text-muted mb-3">{personal.designation || "N/A"}</p>

              <div className="border-top pt-3">
                <h6 className="text-muted mb-3">
                  <FiPhoneCall className="me-2" />
                  Contact Information
                </h6>

                <div className="mb-3">
                  <small className="text-muted d-block">Mobile</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <FiPhone size={16} className="text-primary" />
                    <span className="fw-semibold">
                      {personal.mobileNo || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Email</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <FiMail size={16} className="text-primary" />
                    <span className="fw-semibold">
                      {personal.emailId || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">WhatsApp</small>
                  <span className="fw-semibold">
                    {personal.whatsappNo || "N/A"}
                  </span>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Phone</small>
                  <span className="fw-semibold">
                    {personal.contactNo || "N/A"}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Detailed Information */}
        <Col md={7} lg={8}>
          {/* Professional Information */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <FiBriefcase className="me-2" />
                Professional Information
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Organization</small>
                  <p className="fw-semibold mb-1">
                    {personal.organisation || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Designation</small>
                  <p className="fw-semibold mb-1">
                    {personal.designation || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Annual Income</small>
                  <p className="fw-semibold mb-1">
                    {personal.annualIncome || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Grade</small>
                  <Badge bg="warning" text="dark">
                    {personal.grade || "N/A"}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Address Information */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <FiMapPin className="me-2" />
                Address Information
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">
                    <FiHome className="me-1" />
                    Residential Address
                  </small>
                  <p className="mb-1">{personal.resiAddr || "N/A"}</p>
                  {personal.resiLandmark && (
                    <small className="text-muted">
                      Landmark: {personal.resiLandmark}
                    </small>
                  )}
                  <br />
                  {personal.resiPincode && (
                    <small className="text-muted">
                      Pincode: {personal.resiPincode}
                    </small>
                  )}
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Office Address</small>
                  <p className="mb-1">{personal.officeAddr || "N/A"}</p>
                  {personal.officeLandmark && (
                    <small className="text-muted">
                      Landmark: {personal.officeLandmark}
                    </small>
                  )}
                  <br />
                  {personal.officePincode && (
                    <small className="text-muted">
                      Pincode: {personal.officePincode}
                    </small>
                  )}
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">
                    Preferred Meeting Address
                  </small>
                  <p className="fw-semibold mb-1">
                    {personal.preferredMeetingAddr || "N/A"}
                  </p>
                </Col>
                <Col md={3} className="mb-3">
                  <small className="text-muted d-block">Area</small>
                  <p className="fw-semibold mb-1">
                    {personal.preferredMeetingArea || "N/A"}
                  </p>
                </Col>
                <Col md={3} className="mb-3">
                  <small className="text-muted d-block">City</small>
                  <p className="fw-semibold mb-1">{personal.city || "N/A"}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">
                    Best Time to Contact
                  </small>
                  <p className="fw-semibold mb-1">
                    {personal.bestTime || "N/A"}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Lead & Personal Information */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <FaIdCardAlt className="me-2" />
                Lead & Personal Information
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Lead Source</small>
                  <p className="fw-semibold mb-1">
                    {personal.leadSource || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Lead Name</small>
                  <p className="fw-semibold mb-1">
                    {personal.leadName || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Lead Occupation</small>
                  <p className="fw-semibold mb-1">
                    {personal.leadOccupation || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Occupation Type</small>
                  <p className="fw-semibold mb-1">
                    {personal.leadOccupationType || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Calling Purpose</small>
                  <p className="fw-semibold mb-1">
                    {personal.callingPurpose || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <small className="text-muted d-block">Purpose Name</small>
                  <p className="fw-semibold mb-1">{personal.name || "N/A"}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuspectDetailOA;
