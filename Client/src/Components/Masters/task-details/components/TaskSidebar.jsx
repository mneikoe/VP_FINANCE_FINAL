import React from "react";
import { Card, ListGroup, Button, ProgressBar } from "react-bootstrap";
import {
  FaBuilding,
  FaUserTie,
  FaCheckCircle,
  FaClock,
  FaListAlt,
  FaUserFriends,
  FaFileUpload,
  FaHistory,
  FaBox,
  FaUsers,
} from "react-icons/fa";
import { formatDate } from "../../../../utils/formatter";

const TaskSidebar = ({ task, checklistStatus, employeeName, setActiveTab }) => {
  const calculateDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    try {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return diff;
    } catch {
      return null;
    }
  };

  const calculateOverallProgress = () => {
    if (!task) return 0;
    const checklistProgress =
      Object.values(checklistStatus).filter(Boolean).length;
    const totalChecklists = task.checklists?.length || 0;
    const totalEntities =
      (task.assignedClients?.length || 0) +
      (task.assignedProspects?.length || 0);

    // Simple calculation - adjust as needed
    return totalChecklists > 0
      ? Math.round((checklistProgress / totalChecklists) * 100)
      : 0;
  };

  const daysLeft = calculateDaysLeft(task.assignmentDetails?.dueDate);
  const overallProgress = calculateOverallProgress();

  return (
    <div
      style={{
        maxHeight: "calc(100vh - 150px)",
        overflowY: "auto",
        position: "sticky",
        top: "20px",
      }}
      className="pe-2"
    >
      {/* Task Summary Card */}
      <Card className="mb-4 border-light shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="fw-semibold mb-0 text-dark">
            <FaBuilding className="me-2 text-primary" />
            Task Summary
          </h5>
        </Card.Header>
        <Card.Body className="py-3">
          <ListGroup variant="flush" className="small">
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Company</span>
              <strong className="text-dark">
                {task.company || task.sub || "N/A"}
              </strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Product</span>
              <strong className="text-dark">
                {task.product || task.cat?.name || "N/A"}
              </strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Department</span>
              <strong className="text-dark">
                {Array.isArray(task.depart)
                  ? task.depart.join(", ")
                  : task.depart || "N/A"}
              </strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Estimated Days</span>
              <strong className="text-dark">
                {task.estimatedDays || 1} day(s)
              </strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Progress</span>
              <strong className="text-dark">{overallProgress}%</strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Checklists</span>
              <strong className="text-dark">
                {Object.values(checklistStatus).filter(Boolean).length}/
                {task.checklists?.length || 0}
              </strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Clients</span>
              <strong className="text-dark">
                {task.assignedClients?.length || 0}
              </strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Prospects</span>
              <strong className="text-dark">
                {task.assignedProspects?.length || 0}
              </strong>
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Assignment Details Card */}
      <Card className="mb-4 border-light shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="fw-semibold mb-0 text-dark">
            <FaUserTie className="me-2 text-primary" />
            Assignment Details
          </h5>
        </Card.Header>
        <Card.Body className="py-3">
          <ListGroup variant="flush" className="small">
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Assigned To</span>
              <strong className="text-dark">{employeeName}</strong>
            </ListGroup.Item>
            {task.assignmentDetails?.assignedBy && (
              <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
                <span className="text-muted">Assigned By</span>
                <strong className="text-dark">
                  {task.assignmentDetails.assignedBy.name}
                </strong>
              </ListGroup.Item>
            )}
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Due Date</span>
              <strong
                className={
                  daysLeft !== null && daysLeft < 0
                    ? "text-danger"
                    : "text-dark"
                }
              >
                {formatDate(task.assignmentDetails?.dueDate) || "Not set"}
              </strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2 px-0 border-0">
              <span className="text-muted">Days Left</span>
              <strong
                className={
                  daysLeft !== null
                    ? daysLeft < 0
                      ? "text-danger"
                      : "text-success"
                    : "text-dark"
                }
              >
                {daysLeft !== null
                  ? daysLeft < 0
                    ? `${Math.abs(daysLeft)} days overdue`
                    : `${daysLeft} days left`
                  : "N/A"}
              </strong>
            </ListGroup.Item>
            {task.assignmentDetails?.remarks && (
              <ListGroup.Item className="py-2 px-0 border-0">
                <div>
                  <span className="text-muted d-block mb-1">Remarks</span>
                  <div className="bg-light p-2 rounded">
                    <p className="mb-0 small">
                      {task.assignmentDetails.remarks}
                    </p>
                  </div>
                </div>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Quick Actions Card */}
      <Card className="mb-4 border-light shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="fw-semibold mb-0 text-dark">
            <FaCheckCircle className="me-2 text-primary" />
            Quick Actions
          </h5>
        </Card.Header>
        <Card.Body className="py-3">
          <div className="d-grid gap-2">
            <Button
              variant={overallProgress === 100 ? "success" : "outline-primary"}
              size="sm"
              className="py-2"
              onClick={() => {
                if (overallProgress === 100) {
                  alert("All items completed! Task can be marked as done.");
                } else {
                  alert(
                    `Complete all items first! Current progress: ${overallProgress}%`
                  );
                }
              }}
            >
              {overallProgress === 100 ? (
                <>
                  <FaCheck className="me-2" />
                  Mark Task Complete
                </>
              ) : (
                <>
                  <FaClock className="me-2" />
                  {overallProgress}% Complete
                </>
              )}
            </Button>

            <Button
              variant="outline-secondary"
              size="sm"
              className="py-2"
              onClick={() => setActiveTab("overview")}
            >
              <FaListAlt className="me-2" />
              Work on Checklists
            </Button>

            <Button
              variant="outline-dark"
              size="sm"
              className="py-2"
              onClick={() => setActiveTab("clients")}
            >
              <FaUserFriends className="me-2" />
              Update Status
            </Button>

            <Button
              variant="outline-info"
              size="sm"
              className="py-2"
              onClick={() => setActiveTab("files")}
            >
              <FaFileUpload className="me-2" />
              Upload Documents
            </Button>

            <Button
              variant="outline-warning"
              size="sm"
              className="py-2"
              onClick={() => setActiveTab("history")}
            >
              <FaHistory className="me-2" />
              View History
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TaskSidebar;
