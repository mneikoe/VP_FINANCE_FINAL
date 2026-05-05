import React, { useState, useEffect } from "react";
import {
  Card, Table, Badge, Button, Modal, Form,
  Row, Col, Spinner, ListGroup, Alert,
} from "react-bootstrap";
import axios from "axios";
import {
  FaSync, FaTasks, FaShareAlt, FaCheckCircle, FaClock,
  FaUser, FaMapMarkerAlt, FaPhone, FaIdCard, FaStickyNote,
  FaEye, FaUserTie, FaUserFriends, FaFlag, FaInfoCircle,
  FaCalendarAlt, FaHistory, FaArrowRight,
} from "react-icons/fa";
import { format, parseISO } from "date-fns";

const statusColors = {
  assigned: "secondary",
  "in-progress": "info",
  completed: "success",
  overdue: "danger",
  pending: "warning",
};

const priorityColors = {
  urgent: "danger",
  high: "warning",
  medium: "primary",
  low: "secondary",
};

const OETaskSummary = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  });
  const oeId = user?.id;

  // Detail Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Forward to RM Modal
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardTask, setForwardTask] = useState(null);
  const [forwardRemark, setForwardRemark] = useState("");
  const [forwardStatus, setForwardStatus] = useState("in-progress");
  const [forwardRmId, setForwardRmId] = useState("");
  const [rmList, setRmList] = useState([]);
  const [loadingRMs, setLoadingRMs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch tasks ───────────────────────────────────────────
  const fetchTasks = async () => {
    const id = oeId || JSON.parse(localStorage.getItem("user") || "{}")?.id;
    if (!id) { setTasks([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await axios.get("/api/OE/assigned-tasks", { params: { oeId: id } });
      setTasks(res.data?.success && Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  };

  // ─── Fetch RM list ─────────────────────────────────────────
  const fetchRMList = async () => {
    if (rmList.length > 0) return;
    setLoadingRMs(true);
    try {
      const res = await axios.get("/api/OE/rm-list");
      setRmList(res.data?.data || []);
    } catch { setRmList([]); }
    finally { setLoadingRMs(false); }
  };

  useEffect(() => { fetchTasks(); }, [oeId]);

  // ─── Helpers ───────────────────────────────────────────────
  const fmt = (d) => {
    if (!d) return "—";
    try { return format(d instanceof Date ? d : parseISO(d), "dd MMM yyyy"); }
    catch { return "—"; }
  };

  const isForwardedByRM = (t) =>
    t?.forwardedFromRM && (t.forwardedFromRM.forwardedAt || t.forwardedFromRM.remark);

  const isForwardedByOE = (t) =>
    t?.oeForwardedToRM && t.oeForwardedToRM.forwardedAt;

  // ─── Open Detail Modal ─────────────────────────────────────
  const openDetail = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // ─── Open Forward Modal ────────────────────────────────────
  const openForward = (task) => {
    setForwardTask(task);
    setForwardStatus(task?.status === "completed" ? "completed" : "in-progress");
    setForwardRemark("");
    setForwardRmId("");
    setShowForwardModal(true);
    fetchRMList();
  };

  // ─── Submit Forward ────────────────────────────────────────
  const handleForwardToRM = async () => {
    if (!forwardTask || !oeId) return;
    if (!forwardRmId) { alert("Please select an RM to forward to."); return; }
    setSubmitting(true);
    try {
      const res = await axios.put("/api/OE/forward-to-rm", {
        taskId: forwardTask._id,
        oeId,
        rmId: forwardRmId,
        status: forwardStatus,
        remark: forwardRemark,
      });
      if (res.data?.success) {
        alert("✅ Task forwarded to RM successfully.");
        setShowForwardModal(false);
        fetchTasks();
      } else {
        alert(res.data?.message || "Failed to forward.");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to forward.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Client / Prospect display helper ─────────────────────
  const EntityCard = ({ entities, type, color }) => {
    if (!entities?.length) return null;
    return (
      <Card className={`border-${color} mb-2`}>
        <Card.Header className={`bg-${color} text-white py-2 d-flex align-items-center gap-2`}>
          {type === "Client" ? <FaUserTie size={12} /> : <FaUserFriends size={12} />}
          <small className="fw-bold">{type}s ({entities.length})</small>
        </Card.Header>
        <ListGroup variant="flush" style={{ maxHeight: 160, overflowY: "auto" }}>
          {entities.map((e, i) => {
            const pd = e?.personalDetails || e;
            return (
              <ListGroup.Item key={i} className="py-2 px-3">
                <div className="fw-semibold small">
                  {pd?.groupName || pd?.name || `${type} ${i + 1}`}
                </div>
                {pd?.mobileNo && (
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    <FaPhone size={9} className="me-1" />{pd.mobileNo}
                  </div>
                )}
                {pd?.preferredMeetingArea && (
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    <FaMapMarkerAlt size={9} className="me-1" />{pd.preferredMeetingArea}
                  </div>
                )}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card>
    );
  };

  // ─── Forwarding Chain Banner ───────────────────────────────
  const ForwardingChain = ({ task }) => {
    const fwdByRM = isForwardedByRM(task);
    const fwdByOE = isForwardedByOE(task);
    if (!fwdByRM && !fwdByOE) return null;
    return (
      <div className="px-0 pb-2">
        {fwdByRM && (
          <Alert variant="primary" className="py-2 mb-2 d-flex align-items-start gap-2">
            <FaShareAlt className="mt-1 flex-shrink-0" />
            <div>
              <strong>Forwarded by RM</strong>
              {task.forwardedFromRM?.forwardedBy?.name && (
                <span className="ms-1 text-muted small">
                  ({task.forwardedFromRM.forwardedBy.name})
                </span>
              )}
              {task.forwardedFromRM?.forwardedAt && (
                <span className="ms-2 text-muted small">
                  on {fmt(task.forwardedFromRM.forwardedAt)}
                </span>
              )}
              {task.forwardedFromRM?.remark && (
                <div className="mt-1 small fst-italic">"{task.forwardedFromRM.remark}"</div>
              )}
            </div>
          </Alert>
        )}
        {fwdByOE && (
          <Alert variant="warning" className="py-2 mb-2 d-flex align-items-start gap-2">
            <FaHistory className="mt-1 flex-shrink-0" />
            <div>
              <strong>Previously forwarded to RM</strong>
              {task.oeForwardedToRM?.forwardedAt && (
                <span className="ms-2 text-muted small">on {fmt(task.oeForwardedToRM.forwardedAt)}</span>
              )}
              {task.oeForwardedToRM?.remark && (
                <div className="mt-1 small fst-italic">"{task.oeForwardedToRM.remark}"</div>
              )}
            </div>
          </Alert>
        )}
      </div>
    );
  };

  // ─── Loading ───────────────────────────────────────────────
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

  // ─── Stats ─────────────────────────────────────────────────
  const stats = {
    total: tasks.length,
    fromRM: tasks.filter(isForwardedByRM).length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  };

  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold text-dark mb-0">Task Summary (OE)</h5>
          <small className="text-muted">All assigned &amp; forwarded tasks</small>
        </div>
        <Button variant="outline-primary" size="sm" onClick={fetchTasks}>
          <FaSync className="me-1" />Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <Row className="g-2 mb-3">
        {[
          { label: "Total Tasks", val: stats.total, color: "primary", icon: <FaTasks /> },
          { label: "Forwarded by RM", val: stats.fromRM, color: "info", icon: <FaShareAlt /> },
          { label: "In Progress", val: stats.inProgress, color: "warning", icon: <FaClock /> },
          { label: "Overdue", val: stats.overdue, color: "danger", icon: <FaFlag /> },
        ].map((s) => (
          <Col xs={6} md={3} key={s.label}>
            <Card className={`border-0 shadow-sm border-start border-${s.color} border-3`}>
              <Card.Body className="py-2 px-3 d-flex align-items-center gap-3">
                <div className={`text-${s.color} fs-4`}>{s.icon}</div>
                <div>
                  <div className="fw-bold fs-5">{s.val}</div>
                  <small className="text-muted">{s.label}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Task Table */}
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
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Task</th>
                  <th>Company / Product</th>
                  <th>Due</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Clients/Prospects</th>
                  <th>Source</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={task._id || task.id}>
                    <td className="text-muted small">{idx + 1}</td>
                    <td>
                      <div className="fw-semibold">{task.name}</div>
                      {isForwardedByRM(task) && (
                        <span className="badge bg-primary" style={{ fontSize: 10 }}>
                          <FaShareAlt className="me-1" />Fwd by RM
                        </span>
                      )}
                      {isForwardedByOE(task) && (
                        <span className="badge bg-warning text-dark ms-1" style={{ fontSize: 10 }}>
                          <FaHistory className="me-1" />Prev. Fwd to RM
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="small">{task.company || "—"}</div>
                      {task.product && <div className="text-muted" style={{ fontSize: 11 }}>{task.product}</div>}
                    </td>
                    <td className="small">{fmt(task.dueDate)}</td>
                    <td>
                      <Badge bg={priorityColors[task.priority] || "secondary"} pill>
                        {(task.priority || "medium").toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={statusColors[task.status] || "secondary"}>
                        {task.status || "assigned"}
                      </Badge>
                    </td>
                    <td>
                      <div className="small">
                        {task.assignedClients?.length > 0 && (
                          <span className="me-2 text-success fw-semibold">
                            C: {task.assignedClients.length}
                          </span>
                        )}
                        {task.assignedProspects?.length > 0 && (
                          <span className="text-primary fw-semibold">
                            P: {task.assignedProspects.length}
                          </span>
                        )}
                        {!task.assignedClients?.length && !task.assignedProspects?.length && (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {isForwardedByRM(task) ? (
                        <Badge bg="primary">
                          <FaShareAlt className="me-1" />RM
                          {task.forwardedFromRM?.forwardedBy?.name && (
                            <span className="ms-1">({task.forwardedFromRM.forwardedBy.name})</span>
                          )}
                        </Badge>
                      ) : (
                        <span className="text-muted small">Direct</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => openDetail(task)}
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openForward(task)}
                          title="Forward to RM"
                        >
                          <FaShareAlt className="me-1" />Fwd RM
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* ─── Detail Modal ──────────────────────────────────────── */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered size="lg" scrollable
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">{selectedTask?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              {/* Forwarding Chain */}
              <ForwardingChain task={selectedTask} />

              {/* Task Info */}
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Card className="border h-100">
                    <Card.Body>
                      <h6 className="fw-bold text-dark mb-3">Task Info</h6>
                      {[
                        ["Company", selectedTask.company],
                        ["Product", selectedTask.product],
                        ["Due Date", fmt(selectedTask.dueDate)],
                        ["Priority", (
                          <Badge bg={priorityColors[selectedTask.priority] || "secondary"} pill>
                            {(selectedTask.priority || "medium").toUpperCase()}
                          </Badge>
                        )],
                        ["Status", (
                          <Badge bg={statusColors[selectedTask.status] || "secondary"}>
                            {selectedTask.status || "assigned"}
                          </Badge>
                        )],
                      ].map(([label, val]) => (
                        <div key={label} className="mb-2">
                          <small className="text-muted d-block">{label}</small>
                          <span className="fw-semibold">{val || "—"}</span>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border h-100">
                    <Card.Body>
                      <h6 className="fw-bold text-dark mb-3">Assignment Details</h6>
                      {[
                        ["Assigned At", fmt(selectedTask.assignedAt)],
                        ["Remarks", selectedTask.remarks],
                        ["Checklist Items", selectedTask.checklists?.length || 0],
                        ["Estimated Days", selectedTask.estimatedDays],
                        ["OE Type", selectedTask.oeType || "—"],
                      ].map(([label, val]) => (
                        <div key={label} className="mb-2">
                          <small className="text-muted d-block">{label}</small>
                          <span className="fw-semibold">{val || "—"}</span>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Clients & Prospects */}
              {(selectedTask.assignedClients?.length > 0 || selectedTask.assignedProspects?.length > 0) && (
                <>
                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                    <FaUserFriends /> Associated Clients &amp; Prospects
                    <Badge bg="secondary" pill>
                      {(selectedTask.assignedClients?.length || 0) + (selectedTask.assignedProspects?.length || 0)}
                    </Badge>
                  </h6>
                  <Row className="g-2">
                    <Col md={6}>
                      <EntityCard
                        entities={selectedTask.assignedClients}
                        type="Client"
                        color="success"
                      />
                    </Col>
                    <Col md={6}>
                      <EntityCard
                        entities={selectedTask.assignedProspects}
                        type="Prospect"
                        color="primary"
                      />
                    </Col>
                  </Row>
                </>
              )}

              {/* Checklists */}
              {selectedTask.checklists?.length > 0 && (
                <Card className="border mt-3">
                  <Card.Header className="bg-light py-2">
                    <small className="fw-bold">Checklist Items</small>
                  </Card.Header>
                  <ListGroup variant="flush">
                    {selectedTask.checklists.map((item, i) => (
                      <ListGroup.Item key={i} className="py-2 small">
                        <span className="me-2">•</span>{item}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowDetailModal(false)}>Close</Button>
          <Button
            variant="primary"
            onClick={() => { setShowDetailModal(false); openForward(selectedTask); }}
          >
            <FaShareAlt className="me-2" />Forward to RM
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ─── Forward to RM Modal ───────────────────────────────── */}
      <Modal
        show={showForwardModal}
        onHide={() => setShowForwardModal(false)}
        centered size="lg" scrollable
      >
        <Modal.Header
          closeButton
          style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)", color: "white" }}
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaShareAlt />Forward Task to RM
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          {forwardTask && (
            <>
              {/* Task Banner */}
              <div className="bg-light border-bottom px-4 py-3">
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">{forwardTask.name}</h6>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge bg="light" text="dark" className="border">{forwardTask.company}</Badge>
                      <Badge bg={priorityColors[forwardTask.priority] || "secondary"} pill>
                        {(forwardTask.priority || "medium").toUpperCase()}
                      </Badge>
                      <Badge bg={statusColors[forwardTask.status] || "secondary"}>
                        Current: {forwardTask.status || "assigned"}
                      </Badge>
                    </div>
                  </div>
                  {forwardTask.dueDate && (
                    <Badge bg="warning" text="dark">
                      <FaCalendarAlt className="me-1" />Due: {fmt(forwardTask.dueDate)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Forwarding Chain History */}
              {isForwardedByRM(forwardTask) && (
                <div className="px-4 pt-3">
                  <Alert variant="primary" className="py-2 d-flex align-items-start gap-2">
                    <FaHistory className="mt-1 flex-shrink-0" />
                    <div>
                      <strong>Originally forwarded by RM</strong>
                      {forwardTask.forwardedFromRM?.forwardedBy?.name && (
                        <span className="ms-1 text-muted small">({forwardTask.forwardedFromRM.forwardedBy.name})</span>
                      )}
                      {forwardTask.forwardedFromRM?.remark && (
                        <div className="mt-1 small fst-italic">"{forwardTask.forwardedFromRM.remark}"</div>
                      )}
                    </div>
                  </Alert>
                </div>
              )}

              {/* Clients & Prospects Preview */}
              {(forwardTask.assignedClients?.length > 0 || forwardTask.assignedProspects?.length > 0) && (
                <div className="px-4 pt-2 pb-1">
                  <div className="fw-semibold small text-dark mb-2 d-flex align-items-center gap-1">
                    <FaUserFriends size={12} />
                    Associated Clients &amp; Prospects (will be forwarded with task)
                    <Badge bg="secondary" pill className="ms-1">
                      {(forwardTask.assignedClients?.length || 0) + (forwardTask.assignedProspects?.length || 0)}
                    </Badge>
                  </div>
                  <Row className="g-2">
                    <Col md={6}>
                      <EntityCard entities={forwardTask.assignedClients} type="Client" color="success" />
                    </Col>
                    <Col md={6}>
                      <EntityCard entities={forwardTask.assignedProspects} type="Prospect" color="primary" />
                    </Col>
                  </Row>
                </div>
              )}

              {/* Form Fields */}
              <div className="px-4 py-3">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        <FaUserTie className="me-1 text-primary" />
                        Select RM <span className="text-danger">*</span>
                      </Form.Label>
                      {loadingRMs ? (
                        <div className="d-flex align-items-center gap-2 p-2 border rounded">
                          <Spinner size="sm" animation="border" />
                          <small className="text-muted">Loading RM list...</small>
                        </div>
                      ) : (
                        <Form.Select
                          value={forwardRmId}
                          onChange={(e) => setForwardRmId(e.target.value)}
                          isInvalid={!forwardRmId}
                        >
                          <option value="">-- Select RM --</option>
                          {rmList.map((rm) => (
                            <option key={rm.id || rm._id} value={rm.id || rm._id}>
                              {rm.name}
                              {rm.employeeCode ? ` [${rm.employeeCode}]` : ""}
                              {rm.designation ? ` — ${rm.designation}` : ""}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        <FaFlag className="me-1 text-warning" />
                        Task Status
                      </Form.Label>
                      <Form.Select
                        value={forwardStatus}
                        onChange={(e) => setForwardStatus(e.target.value)}
                      >
                        <option value="in-progress">In Progress</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="assigned">Assigned</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        <FaStickyNote className="me-1 text-secondary" />
                        Remark / Message for RM
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Add your remarks, update, or instructions for the RM..."
                        value={forwardRemark}
                        onChange={(e) => setForwardRemark(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info" className="mt-3 mb-0 py-2">
                  <FaInfoCircle className="me-2" />
                  <strong>Note:</strong> The full task with all clients &amp; prospects will be forwarded
                  to the selected RM. The RM will see this task in their Task Summary.
                </Alert>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top">
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
            disabled={submitting || !forwardRmId}
          >
            {submitting ? (
              <><Spinner animation="border" size="sm" className="me-2" />Forwarding...</>
            ) : (
              <><FaShareAlt className="me-2" />Forward to RM</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OETaskSummary;
