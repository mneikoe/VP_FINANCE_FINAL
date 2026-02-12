import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import axios from "axios";
import {
  FaSync,
  FaTasks,
  FaShareAlt,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaIdCard,
  FaStickyNote,
  FaPaperclip,
} from "react-icons/fa";
import { format, parseISO } from "date-fns";

const OETaskSummary = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });
  const oeId = user?.id;

  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardRemark, setForwardRemark] = useState("");
  const [forwardStatus, setForwardStatus] = useState("pending");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    const id = oeId || JSON.parse(localStorage.getItem("user") || "{}")?.id;
    if (!id) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("/api/OE/assigned-tasks", {
        params: { oeId: id },
      });
      if (response.data?.success && Array.isArray(response.data?.data)) {
        setTasks(response.data.data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching OE tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(u);
  }, []);

  useEffect(() => {
    const id = oeId || JSON.parse(localStorage.getItem("user") || "{}")?.id;
    if (id) fetchTasks();
  }, [oeId]);

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      if (date instanceof Date) return format(date, "dd MMM yyyy");
      return format(parseISO(date), "dd MMM yyyy");
    } catch {
      return "—";
    }
  };

  const isForwardedByRM = (task) =>
    task?.forwardedFromRM && (task.forwardedFromRM.forwardedAt || task.forwardedFromRM.remark);

  const getClientDisplayFields = (entity, oeType) => {
    if (!entity) return {};
    const pd = entity.personalDetails || entity;
    if (oeType === "onfield") {
      return {
        name: pd.name || pd.groupName || "—",
        meetingArea: pd.preferredMeetingArea || "—",
        mobileNo: pd.mobileNo || pd.contactNo || "—",
        groupCode: pd.groupCode || "—",
        groupName: pd.groupName || pd.familyHead || "—",
      };
    }
    return { full: entity };
  };

  const handleForwardToRM = async () => {
    if (!selectedTask || !oeId) return;
    setSubmitting(true);
    try {
      const response = await axios.put("/api/OE/forward-to-rm", {
        taskId: selectedTask._id,
        oeId,
        status: forwardStatus,
        remark: forwardRemark,
      });
      if (response.data?.success) {
        alert("Task forwarded to RM successfully.");
        setShowForwardModal(false);
        setForwardRemark("");
        setSelectedTask(null);
        fetchTasks();
      } else {
        alert(response.data?.message || "Failed to forward.");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to forward.");
    } finally {
      setSubmitting(false);
    }
  };

  const openForwardModal = (task) => {
    setSelectedTask(task);
    setForwardStatus(task?.status || "pending");
    setForwardRemark("");
    setShowForwardModal(true);
  };

  const openDetailModal = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5 className="text-dark mb-2">Loading tasks...</h5>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-dark mb-0">Task Summary (OE)</h5>
        <Button variant="outline-primary" size="sm" onClick={fetchTasks}>
          <FaSync className="me-2" />
          Refresh
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <h6 className="fw-bold text-dark mb-0">
            Assigned / Forwarded Tasks ({tasks.length})
          </h6>
        </Card.Header>
        <Card.Body className="p-0">
          {tasks.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FaTasks size={40} className="mb-2" />
              <p className="mb-0">No tasks assigned or forwarded yet.</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Task</th>
                  <th>Company / Product</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id || task.id}>
                    <td>
                      <strong>{task.name}</strong>
                      {task.priority && (
                        <Badge
                          bg={
                            task.priority === "urgent"
                              ? "danger"
                              : task.priority === "high"
                              ? "warning"
                              : "secondary"
                          }
                          className="ms-2"
                        >
                          {task.priority}
                        </Badge>
                      )}
                    </td>
                    <td>
                      {task.company} {task.product && ` / ${task.product}`}
                    </td>
                    <td>{formatDate(task.dueDate)}</td>
                    <td>
                      <Badge
                        bg={
                          task.status === "completed"
                            ? "success"
                            : task.status === "in-progress"
                            ? "info"
                            : "secondary"
                        }
                      >
                        {task.status || "assigned"}
                      </Badge>
                    </td>
                    <td>
                      {isForwardedByRM(task) ? (
                        <Badge bg="primary">
                          <FaShareAlt className="me-1" />
                          Forwarded by RM
                          {task.forwardedFromRM?.forwardedBy?.name && (
                            <span className="ms-1">
                              ({task.forwardedFromRM.forwardedBy.name})
                            </span>
                          )}
                        </Badge>
                      ) : (
                        <span className="text-muted">Assigned</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-1"
                        onClick={() => openDetailModal(task)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openForwardModal(task)}
                      >
                        <FaShareAlt className="me-1" />
                        Forward to RM
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Task detail modal: Forwarded by RM remark + client/prospect by oeType */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedTask?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              {isForwardedByRM(selectedTask) && (
                <Card className="mb-3 border-primary">
                  <Card.Header className="bg-primary text-white py-2">
                    <FaShareAlt className="me-2" />
                    Forwarded by RM
                    {selectedTask.forwardedFromRM?.forwardedBy?.name && (
                      <span className="ms-2">
                        ({selectedTask.forwardedFromRM.forwardedBy.name})
                      </span>
                    )}
                  </Card.Header>
                  <Card.Body className="py-2">
                    {selectedTask.forwardedFromRM?.remark ? (
                      <p className="mb-0">
                        <FaStickyNote className="me-2 text-muted" />
                        {selectedTask.forwardedFromRM.remark}
                      </p>
                    ) : (
                      <p className="mb-0 text-muted">No remark from RM.</p>
                    )}
                  </Card.Body>
                </Card>
              )}
              <h6 className="fw-bold">Clients / Prospects</h6>
              <ListGroup>
                {[
                  ...(selectedTask.assignedClients || []).map((c) => ({
                    ...getClientDisplayFields(c, selectedTask.oeType),
                    type: "Client",
                  })),
                  ...(selectedTask.assignedProspects || []).map((p) => ({
                    ...getClientDisplayFields(p, selectedTask.oeType),
                    type: "Prospect",
                  })),
                ].map((item, idx) =>
                  selectedTask.oeType === "onfield" ? (
                    <ListGroup.Item key={idx}>
                      <Badge bg="light" text="dark" className="me-2">
                        {item.type}
                      </Badge>
                      <strong>{item.name}</strong>
                      <div className="small text-muted mt-1">
                        <span className="me-3">
                          <FaMapMarkerAlt className="me-1" />
                          {item.meetingArea}
                        </span>
                        <span className="me-3">
                          <FaPhone className="me-1" />
                          {item.mobileNo}
                        </span>
                        <span className="me-3">
                          <FaIdCard className="me-1" />
                          Group: {item.groupCode} / {item.groupName}
                        </span>
                      </div>
                    </ListGroup.Item>
                  ) : (
                    <ListGroup.Item key={idx}>
                      <Badge bg="light" text="dark" className="me-2">
                        {item.type}
                      </Badge>
                      {item.full?.personalDetails?.name ||
                        item.full?.personalDetails?.groupName ||
                        "—"}
                      <div className="small mt-1">
                        {item.full?.personalDetails?.mobileNo && (
                          <span className="me-3">
                            <FaPhone className="me-1" />
                            {item.full.personalDetails.mobileNo}
                          </span>
                        )}
                        {item.full?.personalDetails?.emailId && (
                          <span className="me-3">
                            {item.full.personalDetails.emailId}
                          </span>
                        )}
                        {item.full?.personalDetails?.preferredMeetingArea && (
                          <span className="me-3">
                            <FaMapMarkerAlt className="me-1" />
                            {item.full.personalDetails.preferredMeetingArea}
                          </span>
                        )}
                        {item.full?.personalDetails?.groupCode && (
                          <span className="me-3">
                            Group: {item.full.personalDetails.groupCode} /{" "}
                            {item.full.personalDetails.groupName ||
                              item.full.personalDetails.familyHead}
                          </span>
                        )}
                      </div>
                    </ListGroup.Item>
                  )
                )}
              </ListGroup>
              {(!selectedTask.assignedClients?.length &&
                !selectedTask.assignedProspects?.length) && (
                <p className="text-muted small mb-0">No clients/prospects.</p>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Forward to RM modal */}
      <Modal
        show={showForwardModal}
        onHide={() => setShowForwardModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Forward to RM</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Task status</Form.Label>
                <Form.Select
                  value={forwardStatus}
                  onChange={(e) => setForwardStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Remark / Message for RM</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add your remark or message..."
                  value={forwardRemark}
                  onChange={(e) => setForwardRemark(e.target.value)}
                />
              </Form.Group>
              <p className="small text-muted mb-0">
                You can attach files in a future update. For now, add your
                remark and set status, then forward.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setShowForwardModal(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleForwardToRM}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              <>
                <FaShareAlt className="me-2" />
                Forward to RM
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OETaskSummary;
