import React from "react";
import { Modal, Button, Card, Badge } from "react-bootstrap";
import { FaHistory, FaCalendarAlt } from "react-icons/fa";
import { formatDate } from "../../../../utils/formatter";

const HistoryModal = ({
  show,
  onHide,
  selectedEntity,
  entityHistory,
  entityType,
}) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "#6c757d",
      "in-progress": "#0dcaf0",
      completed: "#198754",
      cancelled: "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton className="border-bottom py-3">
        <Modal.Title className="fw-semibold">
          <FaHistory className="me-2" />
          Task History for {selectedEntity?.personalDetails?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        {entityHistory.length > 0 ? (
          <div className="timeline">
            {entityHistory.map((historyItem, index) => (
              <div key={index} className="mb-4">
                <div className="d-flex">
                  <div className="flex-shrink-0 me-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: getStatusColor(
                          historyItem.currentStatus
                        ),
                        color: "white",
                      }}
                    >
                      <FaHistory size={18} />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-semibold mb-0">
                        {historyItem.taskName}
                      </h6>
                      <Badge
                        style={{
                          backgroundColor: getStatusColor(
                            historyItem.currentStatus
                          ),
                        }}
                      >
                        {historyItem.currentStatus?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="d-flex align-items-center mb-2 text-muted small">
                      <FaCalendarAlt className="me-1" />
                      <span className="me-3">
                        Assigned: {formatDate(historyItem.assignedAt)}
                      </span>
                      <span>Due: {formatDate(historyItem.dueDate)}</span>
                    </div>

                    {historyItem.statusUpdates?.map((update, updateIndex) => (
                      <Card
                        key={updateIndex}
                        className="mb-2 border-start border-3"
                        style={{
                          borderLeftColor: getStatusColor(update.status),
                        }}
                      >
                        <Card.Body className="py-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <Badge
                                style={{
                                  backgroundColor: getStatusColor(
                                    update.status
                                  ),
                                }}
                                className="mb-1"
                              >
                                {update.status?.toUpperCase()}
                              </Badge>
                              <p className="mb-1 small">{update.remarks}</p>
                              <small className="text-muted">
                                Updated by: {update.updatedByName || "System"}{" "}
                                on {formatDate(update.updatedAt)}
                              </small>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
                {index < entityHistory.length - 1 && (
                  <div
                    className="border-start ms-4"
                    style={{
                      height: "20px",
                      marginLeft: "20px",
                      borderColor: "#dee2e6",
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <FaHistory size={48} className="text-muted mb-3" />
            <h5 className="text-muted mb-2">No history found</h5>
            <p className="text-muted">
              No status updates have been recorded for this {entityType}.
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top py-3">
        <Button variant="light" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HistoryModal;
