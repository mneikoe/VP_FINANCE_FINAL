import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../../config/axios";
import {
  Card,
  Button,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  FaPhoneAlt,
  FaArrowLeft,
  FaUser,
  FaList,
} from "react-icons/fa";
import { format } from "date-fns";

const TelecallerReportDateActivities = () => {
  const { telecallerId, date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const [telecaller, setTelecaller] = useState(state.telecaller || null);
  const [dayData, setDayData] = useState(state.dayData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!telecallerId || !date) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `/api/telecaller/report/detail/${telecallerId}`,
          { params: { startDate: date, endDate: date } }
        );
        console.log("API Response (full):", res.data);
        if (res.data?.success && res.data?.data) {
          setTelecaller(res.data.data.telecaller);
          const dateWise = res.data.data.dateWise || [];
          const day = dateWise.find((d) => d.date === date) || dateWise[0];
          const dayDataFromApi = day || { date, activities: [] };
          setDayData(dayDataFromApi);
          console.log("API Response (data) - activities with groupCode/groupName:", res.data.data);
        } else {
          setError("Data not found");
        }
      } catch (e) {
        console.error("Error fetching date activities:", e);
        setError(e.response?.data?.message || "Failed to load activities");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [telecallerId, date]);

  const handleBack = () => {
    navigate(`/reports/telecaller-report/${telecallerId}`, {
      state: state.startDate && state.endDate
        ? { startDate: state.startDate, endDate: state.endDate }
        : {},
    });
  };

  if (loading && !dayData) {
    return (
      <div className="container-fluid py-4 d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading activities...</span>
      </div>
    );
  }

  if (error || (!dayData && !loading)) {
    return (
      <div className="container-fluid py-4">
        <Card className="border border-danger">
          <Card.Body className="text-center py-5">
            <p className="text-danger mb-2">{error || "No data for this date."}</p>
            <Button variant="primary" onClick={() => navigate("/reports/telecaller-report")}>
              Back to Telecaller Report
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  const activities = dayData?.activities || [];

  return (
    <div className="container-fluid py-4">
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleBack}
            className="d-flex align-items-center gap-1"
          >
            <FaArrowLeft />
            Back to Calling Detail
          </Button>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <FaPhoneAlt className="text-info" />
            {telecaller?.name} — Activities for {dayData?.date}
          </h5>
          {telecaller && (
            <p className="text-muted small mb-0 mt-1">
              <FaUser className="me-1" /> {telecaller.employeeCode} • {telecaller.designation}
            </p>
          )}
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Badge bg="primary">Assigned: {dayData?.assigned ?? 0}</Badge>
            <Badge bg="info">Contacted: {dayData?.contacted ?? 0}</Badge>
            <Badge bg="warning" text="dark">Forwarded: {dayData?.forwarded ?? 0}</Badge>
            <Badge bg="success">Appt: {dayData?.appointmentScheduled ?? 0}</Badge>
          </div>
          <h6 className="fw-semibold text-dark mb-3">
            <FaList className="me-2" />
            Activity list
          </h6>
          {activities.length === 0 ? (
            <p className="text-muted">No activities for this date.</p>
          ) : (
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Suspect / Remarks</th>
                  <th>Group Code</th>
                  <th>Group Head / Name</th>
                  
                </tr>
              </thead>
              <tbody>
                {activities.map((act, i) => {
                  const groupCodeVal = act.groupCode != null ? String(act.groupCode).trim() : "";
                  const groupHeadVal = act.groupHead != null ? String(act.groupHead).trim() : "";
                  const groupNameVal = act.groupName != null ? String(act.groupName).trim() : "";
                  const groupHeadOrName = groupHeadVal || groupNameVal || "-";
                  return (
                  <tr key={i}>
                    <td><Badge bg="light" text="dark">{act.type}</Badge></td>
                    <td>
                      <span className="fw-medium">{act.suspectName || "-"}</span>
                      {(act.mobileNo && String(act.mobileNo).trim() !== "") && (
                        <small className="d-block text-muted">{act.mobileNo}</small>
                      )}
                      {(act.remarks && String(act.remarks).trim() !== "") && (
                        <small className="d-block text-secondary mt-1">• {act.remarks}</small>
                      )}
                    </td>
                    <td>{groupCodeVal || "-"}</td>
                    <td>{groupHeadOrName}</td>
                   
                  </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TelecallerReportDateActivities;
