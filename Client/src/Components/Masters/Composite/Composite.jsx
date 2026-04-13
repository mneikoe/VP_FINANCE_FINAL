import React, { useState, useEffect } from "react";
import { Tab, Tabs, Modal, Button, Table, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AddTask from "./Addtask";
import { useDispatch, useSelector } from "react-redux";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import DOMPurify from "dompurify";
import {
  deleteCompositeTask,
  fetchAllCompositeTasks,
  fetchCompositeTaskById,
} from "../../../redux/feature/CompositeTask/CompositeThunx";

const Composite = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error, successMessage } = useSelector(
    (state) => state.compositeTask
  );

  console.log(tasks, "tasks");
  console.log(loading, "loading");
  console.log(error, "error");
  console.log(successMessage, "successMessage");

  const [activeTab, setActiveTab] = useState("view");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [update, setUpdate] = useState(null);

  useEffect(() => {
    dispatch(fetchAllCompositeTasks());
  }, [dispatch, successMessage]);

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
    console.log("68baa5339c24d4341164582d");
    console.log(id);
    setActiveTab("add");
    const res = await dispatch(fetchCompositeTaskById(id)).unwrap();
    setUpdate(res);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteCompositeTask(id));
    }
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const displayedTasks = tasks || { tasks: [] } || 1;
  console.log(displayedTasks);

  const currentEntries = (displayedTasks?.tasks || []).slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  console.log(currentEntries);

  const totalPages = Math.ceil(
    (displayedTasks?.tasks?.length || 0) / entriesPerPage
  );
  console.log(activeTab);

  return (
    <div className="mt-2 mb-2">
      <div className="row">
        <div className="col-md-12">
          <div className="card card-outline shadow-sm rounded-lg border-0">
            <div style={{ backgroundColor: "#F3F4F6" }} className="card-header py-2 px-3">
              <Tabs
                id="task-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-0 compact-tabs"
                mountOnEnter={false}
                unmountOnExit={false}
              >
                <Tab eventKey="view" title="View Data" />
                <Tab eventKey="add" title="Add Task Template" />
              </Tabs>
            </div>

            <div className="card-body p-3">
              {activeTab === "view" && (
                <>
                  {loading ? (
                    <p>Loading tasks...</p>
                  ) : error ? (
                    <p>Error: {error} </p>
                  ) : (
                    <div className="border rounded-md overflow-x-auto">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mx-0 px-2 py-1 border-bottom">
                        <div className="dataTables_length d-flex align-items-center">
                          <label>
                            Show
                            <select
                              className="form-control form-control-sm h-8 text-sm"
                              value={entriesPerPage}
                              onChange={(e) =>
                                setEntriesPerPage(Number(e.target.value))
                              }
                            >
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                            entries
                          </label>
                        </div>
                        <div className="dataTables_filter">
                          <label>
                            Search:
                            <input
                              type="search"
                              className="form-control form-control-sm h-8 px-2 text-sm"
                              placeholder=""
                            />
                          </label>
                        </div>
                      </div>

                      <Table striped bordered hover responsive className="mb-0 compact-table">
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>Financial Product</th>
                            <th>Co. Name</th>
                            <th>Emp</th>
                            <th>Task</th>
                            <th>Description</th>
                            <th>Checklist</th>
                            <th>Sms</th>
                            <th>Email</th>
                            <th>Whatsapp</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEntries.map((task, index) => (
                            <tr key={task._id || index}>
                              <td className="whitespace-nowrap">{indexOfFirstEntry + index + 1}</td>
                              <td className="whitespace-nowrap">{task.cat.name}</td>
                              <td className="whitespace-nowrap">{task.sub}</td>
                              <td className="whitespace-nowrap">{task.depart}</td>
                              <td className="whitespace-nowrap">{task.name}</td>
                              <td>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="px-2 py-1 text-xs rounded-md compact-btn"
                                  onClick={() => openModal("detail", task)}
                                >
                                  View
                                </Button>
                              </td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="px-2 py-1 text-xs rounded-md compact-btn"
                                  onClick={() => openModal("checklist", task)}
                                >
                                  View
                                </Button>
                              </td>
                              <td>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="px-2 py-1 text-xs rounded-md compact-btn"
                                  onClick={() => openModal("sms", task)}
                                >
                                  View
                                </Button>
                              </td>
                              <td>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="px-2 py-1 text-xs rounded-md compact-btn"
                                  onClick={() => openModal("email", task)}
                                >
                                  View
                                </Button>
                              </td>
                              <td className="text-center">
                                <a
                                  href={`https://api.whatsapp.com/send?phone=+919425009228&text=${encodeURIComponent(
                                    task.whatsapp_descp || "."
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src="https://static.cdnlogo.com/logos/w/35/whatsapp-icon.svg"
                                    width="18"
                                    alt="WhatsApp"
                                  />
                                </a>
                              </td>
                              <td>
                                <div className="btn-group d-flex gap-2" role="group">
                                  <Button
                                    variant="link"
                                    className="text-primary p-0 compact-icon-btn"
                                    onClick={() => handleEdit(task._id)}
                                  >
                                    <MdEdit color="blue" size={16} />
                                  </Button>
                                  <Button
                                    variant="link"
                                    className="text-danger p-0 compact-icon-btn"
                                    onClick={() => handleDelete(task._id)}
                                  >
                                    <MdDelete color="red" size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      <div className="row mx-0 px-3 py-2 border-top align-items-center">
                        <div className="col-sm-5 px-0">
                          <div className="dataTables_info text-sm">
                            Showing {indexOfFirstEntry + 1} to{" "}
                            {Math.min(
                              indexOfLastEntry,
                              displayedTasks?.tasks?.length
                            )}{" "}
                            of {displayedTasks?.tasks?.length} entries
                          </div>
                        </div>
                        <div className="col-sm-7 px-0">
                          <Pagination className="float-sm-right mb-0 pagination-sm">
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
                  <AddTask
                    on={setActiveTab}
                    data={update}
                    onSuccess={() => setUpdate(null)}
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
          {/* {currentTask?.descp?.text || "No description available"} */}
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
          {/* {currentTask?.sms_descp || "No SMS template available"} */}
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
      <style>{`
        .compact-tabs .nav-link {
          background: #f3f4f6;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid transparent;
          margin-right: 0.375rem;
        }
        .compact-tabs .nav-link.active {
          background: #2563eb;
          color: #fff;
        }
        .compact-table thead th {
          background: #f3f4f6;
          color: #374151;
          font-weight: 500;
          font-size: 0.875rem;
          white-space: nowrap;
          padding: 0.5rem 0.75rem;
        }
        .compact-table tbody td {
          font-size: 0.875rem;
          white-space: nowrap;
          padding: 0.5rem 0.75rem;
          vertical-align: middle;
        }
        .compact-btn {
          transition: all 150ms ease-in-out;
        }
        .compact-btn:hover {
          opacity: 0.9;
        }
        .compact-icon-btn {
          transition: transform 150ms ease-in-out;
        }
        .compact-icon-btn:hover {
          transform: scale(1.1);
        }
        .dataTables_length label,
        .dataTables_filter label {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0;
          font-size: 0.875rem;
          line-height: 1.2;
        }
        .dataTables_filter input {
          width: 170px;
        }
      `}</style>
    </div>
  );
};

export default Composite;
