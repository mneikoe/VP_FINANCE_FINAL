import React, { useState, useEffect } from "react";
import { Tab, Tabs, Modal, Button, Table, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { MdEdit, MdDelete } from "react-icons/md";
import DOMPurify from "dompurify";
import AddTaskService from "./Addtask";
import axios from "axios";

const Service = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("view");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [update, setUpdate] = useState(null);

  // Fetch all service tasks
  const fetchAllServiceTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/Task?type=service");
      if (response.data.success) {
        setTasks(response.data.tasks || []);
      } else {
        setError(response.data.message || "Failed to fetch tasks");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single service task by ID
  const fetchServiceTaskById = async (id) => {
    try {
      const response = await axios.get(`/api/Task/service/${id}`);
      if (response.data.success) {
        return response.data.task;
      }
      return null;
    } catch (error) {
      console.error("Error fetching task:", error);
      return null;
    }
  };

  // Delete service task
  const deleteServiceTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this service task?")) {
      try {
        const response = await axios.delete(`/api/Task/service/${id}`);
        if (response.data.success) {
          alert("Service task deleted successfully");
          fetchAllServiceTasks();
        } else {
          alert("Failed to delete: " + response.data.message);
        }
      } catch (error) {
        alert("Error deleting task: " + error.message);
      }
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchAllServiceTasks();
    }
  }, [activeTab]);

  const openModal = (type, task) => {
    setCurrentTask(task);
    switch (type) {
      case "detail":
        setShowDetailModal(true);
        break;
      case "checklist":
        setShowChecklistModal(true);
        break;
      case "sms":
        setShowSmsModal(true);
        break;
      case "email":
        setShowEmailModal(true);
        break;
      default:
        break;
    }
  };

  const handleEdit = async (id) => {
    setActiveTab("add");
    const task = await fetchServiceTaskById(id);
    setUpdate(task);
  };

  const handleDelete = (id) => {
    deleteServiceTask(id);
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = tasks.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(tasks.length / entriesPerPage);

  return (
    <div className="mt-2 mb-4">
      <h4>Service Tasks</h4>
      <div className="row">
        <div className="col-md-12">
          <div className="card card-outline">
            <div style={{ backgroundColor: "#ECECEC" }} className="card-header">
              <Tabs
                id="service-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="view" title={<b>View Service Tasks</b>} />
                <Tab eventKey="add" title={<b>Add Service Task Template</b>} />
              </Tabs>
            </div>

            <div className="card-body">
              {activeTab === "view" && (
                <>
                  {loading ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-dark" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading service tasks...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                  ) : (
                    <div className="table-responsive">
                      <div className="row mb-3">
                        <div className="col-sm-6">
                          <div className="dataTables_length">
                            <label>
                              Show{" "}
                              <select
                                className="form-control form-control-sm"
                                value={entriesPerPage}
                                onChange={(e) =>
                                  setEntriesPerPage(Number(e.target.value))
                                }
                              >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                              </select>{" "}
                              entries
                            </label>
                          </div>
                        </div>
                      </div>

                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>Financial Product</th>
                            <th>Co. Name</th>
                            <th>Emp Role</th>
                            <th>Task</th>
                            <th>Priority</th>
                            <th>Days</th>
                            <th>Assignments</th>
                            <th>Description</th>
                            <th>Checklist</th>
                            <th>SMS</th>
                            <th>Email</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEntries.map((task, index) => (
                            <tr key={task._id || index}>
                              <td>{indexOfFirstEntry + index + 1}</td>
                              <td>{task.cat?.name || "N/A"}</td>
                              <td>{task.sub}</td>
                              <td>
                                {task.depart?.map((role, i) => (
                                  <span
                                    key={i}
                                    className="badge bg-secondary me-1"
                                  >
                                    {role}
                                  </span>
                                ))}
                              </td>
                              <td>{task.name}</td>
                              <td>
                                <span
                                  className={`badge bg-${
                                    task.templatePriority === "urgent"
                                      ? "danger"
                                      : task.templatePriority === "high"
                                      ? "warning"
                                      : task.templatePriority === "medium"
                                      ? "primary"
                                      : "secondary"
                                  }`}
                                >
                                  {task.templatePriority}
                                </span>
                              </td>
                              <td>{task.estimatedDays}</td>
                              <td>
                                <span className="badge bg-info">
                                  {task.assignments?.length || 0}
                                </span>
                              </td>
                              <td>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => openModal("detail", task)}
                                >
                                  View
                                </Button>
                              </td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => openModal("checklist", task)}
                                >
                                  View
                                </Button>
                              </td>
                              <td>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => openModal("sms", task)}
                                >
                                  View
                                </Button>
                              </td>
                              <td>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => openModal("email", task)}
                                >
                                  View
                                </Button>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <Button
                                    variant="link"
                                    className="text-primary"
                                    onClick={() => handleEdit(task._id)}
                                  >
                                    <MdEdit color="blue" size={25} />
                                  </Button>
                                  <Button
                                    variant="link"
                                    className="text-danger"
                                    onClick={() => handleDelete(task._id)}
                                  >
                                    <MdDelete color="red" size={25} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      <div className="row">
                        <div className="col-sm-5">
                          <div className="dataTables_info">
                            Showing {indexOfFirstEntry + 1} to{" "}
                            {Math.min(indexOfLastEntry, tasks.length)} of{" "}
                            {tasks.length} entries
                          </div>
                        </div>
                        <div className="col-sm-7">
                          <Pagination className="float-right">
                            <Pagination.Prev
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(currentPage - 1)}
                            />
                            {[...Array(totalPages)].map((_, i) => (
                              <Pagination.Item
                                key={i + 1}
                                active={i + 1 === currentPage}
                                onClick={() => setCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </Pagination.Item>
                            ))}
                            <Pagination.Next
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(currentPage + 1)}
                            />
                          </Pagination>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "add" && (
                <div>
                  <AddTaskService
                    on={setActiveTab}
                    data={update}
                    onSuccess={() => {
                      setUpdate(null);
                      fetchAllServiceTasks();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Modals */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <b>{currentTask?.name || ""} Description</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                currentTask?.descp?.text || "No description available"
              ),
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showChecklistModal}
        onHide={() => setShowChecklistModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <b>{currentTask?.name || ""} Checklist</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTask?.checklists && currentTask.checklists.length > 0 ? (
            <ul>
              {currentTask.checklists.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No checklist available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowChecklistModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSmsModal} onHide={() => setShowSmsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <b>{currentTask?.name || ""} SMS</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                currentTask?.sms_descp || "No SMS template available"
              ),
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSmsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <b>{currentTask?.name || ""} EMAIL</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                currentTask?.email_descp || "No email template available"
              ),
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Service;
