import React from "react";
import { Modal, Button, Form, ListGroup, Badge } from "react-bootstrap";
import { FaCheck, FaTimes, FaUserEdit, FaFileUpload } from "react-icons/fa";

const StatusUpdateModal = ({
  show,
  onHide,
  selectedEntity,
  entityType,
  entityStatus,
  setEntityStatus,
  entityRemarks,
  setEntityRemarks,
  selectedFiles,
  handleFileSelect,
  setSelectedFiles,
  saveStatus,
}) => {
  const statusOptions = [
    { value: "pending", label: "Pending", variant: "outline-secondary" },
    { value: "in-progress", label: "In Progress", variant: "outline-info" },
    { value: "completed", label: "Completed", variant: "outline-success" },
    { value: "cancelled", label: "Cancelled", variant: "outline-danger" },
  ];

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom py-3">
        <Modal.Title className="fw-semibold">
          <FaUserEdit className="me-2" />
          Update {entityType === "client" ? "Client" : "Prospect"} Status
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        {selectedEntity && (
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Details:</h6>
            <div className="bg-light p-3 rounded border">
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Name:</strong>{" "}
                    {selectedEntity.personalDetails?.groupName ||
                      selectedEntity.personalDetails?.name ||
                      "Unknown"}
                  </p>
                  <p className="mb-2">
                    <strong>Mobile:</strong>{" "}
                    {selectedEntity.personalDetails?.mobileNo || "N/A"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Email:</strong>{" "}
                    {selectedEntity.personalDetails?.emailId || "N/A"}
                  </p>
                  <p className="mb-0">
                    <strong>Type:</strong>{" "}
                    <Badge
                      bg={
                        entityType === "client" ? "success-light" : "info-light"
                      }
                      text={entityType === "client" ? "success" : "info"}
                      className="border"
                    >
                      {entityType.toUpperCase()}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Status</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    entityStatus === option.value
                      ? option.variant.replace("outline-", "")
                      : option.variant
                  }
                  onClick={() => setEntityStatus(option.value)}
                  className="flex-grow-1"
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={entityRemarks}
              onChange={(e) => setEntityRemarks(e.target.value)}
              placeholder="Add remarks about this update..."
              className="border"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">
              <FaFileUpload className="me-2" />
              Upload Documents (Optional)
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleFileSelect}
              className="border"
            />
          </Form.Group>

          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <strong>Selected Files:</strong>
              <ListGroup className="mt-2">
                {selectedFiles.map((file, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center py-2"
                  >
                    <span className="small">{file.name}</span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setSelectedFiles(
                          selectedFiles.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <FaTimes size={12} />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-top py-3">
        <Button variant="light" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={saveStatus}>
          <FaCheck className="me-1" />
          Save Status
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StatusUpdateModal;
