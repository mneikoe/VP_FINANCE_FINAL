import React from "react";
import {
  Card,
  Tabs,
  Tab,
  Alert,
  Row,
  Col,
  Badge,
  ProgressBar,
  ListGroup,
  Form,
} from "react-bootstrap";
import {
  FaFileAlt,
  FaListAlt,
  FaPaperclip,
  FaEnvelope,
  FaSms,
  FaWhatsapp,
  FaUserFriends,
  FaUsers,
  FaStickyNote,
  FaHistory,
  FaMobileAlt,
  FaCalendarCheck,
} from "react-icons/fa";
import { formatDate } from "../../../../utils/formatter";
import EntitiesTable from "./EntitiesTable";

const TaskTabs = ({
  task,
  activeTab,
  setActiveTab,
  checklistStatus,
  handleChecklistToggle,
  entityStatuses,
  openStatusModal,
  openHistoryModal,
  employeeName,
}) => {
  return (
    <Card className="border-light shadow-sm">
      <Card.Body className="p-0">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="px-3 pt-3 border-bottom"
        >
          {/* Overview Tab */}
          <Tab eventKey="overview" title="Overview">
            <div className="p-3">
              {/* Description */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-3 text-dark">
                  <FaFileAlt className="me-2 text-primary" />
                  Task Description
                </h5>
                <div className="bg-light p-3 rounded border">
                  <p className="mb-0">
                    {task.descp?.text || "No description provided."}
                  </p>
                </div>
                {task.descp?.image && (
                  <div className="mt-3">
                    <img
                      src={`/uploads/${task.descp.image}`}
                      alt="Task"
                      className="img-fluid rounded border"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                )}
              </div>

              {/* Checklists */}
              {task.checklists && task.checklists.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-semibold mb-0 text-dark">
                      <FaListAlt className="me-2 text-primary" />
                      Checklists
                    </h5>
                    <div className="d-flex align-items-center">
                      <span className="text-muted me-2">
                        {Object.values(checklistStatus).filter(Boolean).length}/
                        {task.checklists.length}
                      </span>
                      <ProgressBar
                        now={
                          (Object.values(checklistStatus).filter(Boolean)
                            .length /
                            task.checklists.length) *
                          100
                        }
                        style={{ width: "100px", height: "8px" }}
                      />
                    </div>
                  </div>
                  <ListGroup className="border">
                    {task.checklists.map((item, index) => (
                      <ListGroup.Item
                        key={index}
                        className="border-0 border-bottom py-3"
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#f8f9fa" : "white",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <Form.Check
                            type="checkbox"
                            checked={checklistStatus[index] || false}
                            onChange={() => handleChecklistToggle(index)}
                            className="me-3"
                            id={`checklist-${index}`}
                          />
                          <label
                            htmlFor={`checklist-${index}`}
                            className={`mb-0 flex-grow-1 ${
                              checklistStatus[index]
                                ? "text-decoration-line-through text-muted"
                                : ""
                            }`}
                            style={{ cursor: "pointer" }}
                          >
                            {item}
                          </label>
                          <Badge
                            bg={
                              checklistStatus[index] ? "success-light" : "light"
                            }
                            text={checklistStatus[index] ? "success" : "dark"}
                            className="border"
                          >
                            {checklistStatus[index] ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}

              {/* Forms */}
              {task.formChecklists && task.formChecklists.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-semibold mb-3 text-dark">
                    <FaPaperclip className="me-2 text-primary" />
                    Required Forms
                  </h5>
                  <Row>
                    {task.formChecklists.map((form, index) => (
                      <Col md={6} key={index}>
                        <Card className="mb-3 border-light shadow-sm">
                          <Card.Body>
                            <h6 className="fw-semibold mb-2">{form.name}</h6>
                            <div className="d-flex gap-2">
                              {form.downloadFormUrl && (
                                <a
                                  href={`/uploads/${form.downloadFormUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-primary btn-sm"
                                >
                                  Download
                                </a>
                              )}
                              {form.sampleFormUrl && (
                                <a
                                  href={`/uploads/${form.sampleFormUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-secondary btn-sm"
                                >
                                  View Sample
                                </a>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Communication Templates */}
              <div className="mb-4">
                <h5 className="fw-semibold mb-3 text-dark">
                  <FaEnvelope className="me-2 text-primary" />
                  Communication Templates
                </h5>
                <Tabs defaultActiveKey="email" className="mb-3">
                  <Tab eventKey="email" title="Email">
                    <div className="bg-light p-3 rounded border">
                      <pre
                        className="mb-0"
                        style={{
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                        }}
                      >
                        {task.email_descp || "No email template provided."}
                      </pre>
                    </div>
                  </Tab>
                  <Tab eventKey="sms" title="SMS">
                    <div className="bg-light p-3 rounded border">
                      <pre
                        className="mb-0"
                        style={{
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                        }}
                      >
                        {task.sms_descp || "No SMS template provided."}
                      </pre>
                    </div>
                  </Tab>
                  <Tab eventKey="whatsapp" title="WhatsApp">
                    <div className="bg-light p-3 rounded border">
                      <pre
                        className="mb-0"
                        style={{
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                        }}
                      >
                        {task.whatsapp_descp ||
                          "No WhatsApp template provided."}
                      </pre>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </div>
          </Tab>

          {/* Clients & Prospects Tab */}
          <Tab eventKey="clients" title="Clients & Prospects">
            <div className="p-3">
              {/* Stats Summary */}
              <div className="mb-4">
                <Card className="border-light shadow-sm mb-3">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="fw-semibold mb-0 text-dark">
                      <FaUserFriends className="me-2 text-primary" />
                      Status Summary
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3} className="text-center mb-3">
                        <div className="p-3 border rounded">
                          <h3 className="fw-bold text-dark mb-1">
                            {task.assignedClients?.length || 0}
                          </h3>
                          <p className="text-muted mb-0">Total Clients</p>
                        </div>
                      </Col>
                      <Col md={3} className="text-center mb-3">
                        <div className="p-3 border rounded">
                          <h3 className="fw-bold text-dark mb-1">
                            {task.assignedProspects?.length || 0}
                          </h3>
                          <p className="text-muted mb-0">Total Prospects</p>
                        </div>
                      </Col>
                      <Col md={3} className="text-center mb-3">
                        <div className="p-3 border rounded">
                          <h3 className="fw-bold text-dark mb-1">
                            {(task.assignedClients?.length || 0) +
                              (task.assignedProspects?.length || 0)}
                          </h3>
                          <p className="text-muted mb-0">Total Entities</p>
                        </div>
                      </Col>
                      <Col md={3} className="text-center mb-3">
                        <div className="p-3 border rounded">
                          <h3 className="fw-bold text-dark mb-1">
                            {
                              Object.values(entityStatuses).filter(
                                (s) => s?.status === "completed"
                              ).length
                            }
                          </h3>
                          <p className="text-muted mb-0">Completed</p>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>

              {/* Clients Table */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold mb-0 text-dark">
                    <FaUserFriends className="me-2 text-success" />
                    Assigned Clients ({task.assignedClients?.length || 0})
                  </h5>
                </div>

                {task.assignedClients?.length > 0 ? (
                  <EntitiesTable
                    entities={task.assignedClients}
                    entityType="client"
                    entityStatuses={entityStatuses}
                    openStatusModal={openStatusModal}
                    openHistoryModal={openHistoryModal}
                    employeeName={employeeName}
                    task={task}
                  />
                ) : (
                  <Alert variant="light" className="border text-center py-5">
                    <FaUserFriends size={40} className="text-muted mb-3" />
                    <h5 className="text-muted mb-2">No clients assigned</h5>
                    <p className="text-muted mb-0">
                      This task is not assigned to any specific clients.
                    </p>
                  </Alert>
                )}
              </div>

              {/* Prospects Table */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold mb-0 text-dark">
                    <FaUsers className="me-2 text-info" />
                    Assigned Prospects ({task.assignedProspects?.length || 0})
                  </h5>
                </div>

                {task.assignedProspects?.length > 0 ? (
                  <EntitiesTable
                    entities={task.assignedProspects}
                    entityType="prospect"
                    entityStatuses={entityStatuses}
                    openStatusModal={openStatusModal}
                    openHistoryModal={openHistoryModal}
                    employeeName={employeeName}
                    task={task}
                  />
                ) : (
                  <Alert variant="light" className="border text-center py-5">
                    <FaUsers size={40} className="text-muted mb-3" />
                    <h5 className="text-muted mb-2">No prospects assigned</h5>
                    <p className="text-muted mb-0">
                      This task is not assigned to any specific prospects.
                    </p>
                  </Alert>
                )}
              </div>

              {/* Assignment Remarks */}
              {(task.clientAssignmentRemarks ||
                task.prospectAssignmentRemarks) && (
                <div className="mb-4">
                  <h5 className="fw-semibold mb-3 text-dark">
                    <FaStickyNote className="me-2 text-primary" />
                    Assignment Remarks
                  </h5>
                  <Row>
                    {task.clientAssignmentRemarks && (
                      <Col md={6}>
                        <Card className="border-light shadow-sm h-100">
                          <Card.Body>
                            <h6 className="fw-semibold mb-2 text-success">
                              Client Remarks
                            </h6>
                            <p className="mb-0">
                              {task.clientAssignmentRemarks}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}
                    {task.prospectAssignmentRemarks && (
                      <Col md={6}>
                        <Card className="border-light shadow-sm h-100">
                          <Card.Body>
                            <h6 className="fw-semibold mb-2 text-info">
                              Prospect Remarks
                            </h6>
                            <p className="mb-0">
                              {task.prospectAssignmentRemarks}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </div>
          </Tab>

          {/* History Tab */}
          <Tab eventKey="history" title="Activity History">
            <div className="p-3">
              <h5 className="fw-semibold mb-3 text-dark">
                <FaHistory className="me-2 text-primary" />
                Task Activity
              </h5>
              <Card className="border-light shadow-sm">
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between py-3 border-bottom">
                      <div>
                        <strong>Task Created</strong>
                      </div>
                      <div className="text-muted">
                        {formatDate(task.createdAt)}
                      </div>
                    </ListGroup.Item>

                    {task.assignmentDetails?.assignedAt && (
                      <ListGroup.Item className="d-flex justify-content-between py-3 border-bottom">
                        <div>
                          <strong>Task Assigned</strong>
                        </div>
                        <div className="text-muted">
                          {formatDate(task.assignmentDetails.assignedAt)}
                        </div>
                      </ListGroup.Item>
                    )}

                    {task.assignmentDetails?.dueDate && (
                      <ListGroup.Item className="d-flex justify-content-between py-3 border-bottom">
                        <div>
                          <strong>Due Date Set</strong>
                        </div>
                        <div className="text-muted">
                          {formatDate(task.assignmentDetails.dueDate)}
                        </div>
                      </ListGroup.Item>
                    )}

                    {task.completedAt && (
                      <ListGroup.Item className="d-flex justify-content-between py-3">
                        <div>
                          <strong>Task Completed</strong>
                        </div>
                        <div className="text-muted">
                          {formatDate(task.completedAt)}
                        </div>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default TaskTabs;
