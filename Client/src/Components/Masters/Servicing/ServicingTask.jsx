import React, { useState, useEffect } from "react";
import { Tab, Tabs, Modal, Button, Table, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
// import AddTask from "./AddTask";
import ServicingAddtask from "./ServicingAddtask";
import { useDispatch, useSelector } from "react-redux";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
// import {
//   deleteMarketingTask,
//   fetchAllMarketingTasks,
//   fetchMarketingTaskById,
// } from "../../../redux/feature/MarketingTask/MarketingThunx";
import DOMPurify from "dompurify";
import {
  deleteServiceTask,
  fetchAllServiceTasks,
  fetchServiceTaskById,
} from "../../../redux/feature/ServiceTask/ServiceThunx";

const ServicingTask = () => {
  const dispatch = useDispatch();

  // Redux state
  const { tasks, loading, error, successMessage } = useSelector(
    (state) => state.ServiceTask
  );
  // const hhh = useSelector((state) => state.MarketingTask.tasks);
  // console.log(hhh, "yyy");

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
    dispatch(fetchAllServiceTasks());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      // alert(successMessage);
      dispatch(fetchAllServiceTasks());
    }
  }, [successMessage]);

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
    const res = await dispatch(fetchServiceTaskById(id)).unwrap();
    setUpdate(res);
    // console.log(res, "RES");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteServiceTask(id));
    }
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const displayedTasks = tasks || [];
  const currentEntries = displayedTasks.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(displayedTasks.length / entriesPerPage);

  return (
    <div className="mt-2 mb-4">
      <h4>Servicing Task</h4>
      <div className="row">
        <div className="col-md-12">
          <div className="card card-outline">
            <div style={{ backgroundColor: "#ECECEC" }} className="card-header">
              <Tabs
                id="task-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
                mountOnEnter={false}
                unmountOnExit={false}
              >
                <Tab eventKey="view" title={<b>View Data</b>} />
                <Tab eventKey="add" title={<b>Add Task Template</b>} />
              </Tabs>
            </div>

            <div className="card-body">
              {activeTab === "view" && (
                <>
                  {loading ? (
                    <p>Loading tasks...</p>
                  ) : error ? (
                    <p>Error: {error}</p>
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
                        <div className="col-sm-6">
                          <div className="dataTables_filter float-right">
                            <label>
                              Search:
                              <input
                                type="search"
                                className="form-control form-control-sm"
                                placeholder=""
                              />
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
                              <td>{indexOfFirstEntry + index + 1}</td>
                              <td>{task.cat}</td>
                              <td>{task.sub}</td>
                              <td>{task.depart}</td>
                              <td>{task.name}</td>
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
                                    width="25"
                                    alt="WhatsApp"
                                  />
                                </a>
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
                            {Math.min(indexOfLastEntry, displayedTasks.length)}{" "}
                            of {displayedTasks.length} entries
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
                  <ServicingAddtask on={setActiveTab} data={update} />
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
              __html: currentTask?.email_descp || "No email template available",
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

export default ServicingTask;
