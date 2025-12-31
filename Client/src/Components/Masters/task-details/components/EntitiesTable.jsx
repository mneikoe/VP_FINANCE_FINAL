import React from "react";
import { Table, Badge, Button } from "react-bootstrap";
import {
  FaUserFriends,
  FaUsers,
  FaMobileAlt,
  FaEnvelope,
  FaEdit,
  FaHistory,
  FaCalendarCheck,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { formatDate } from "../../../../utils/formatter";

const EntitiesTable = ({
  entities,
  entityType,
  entityStatuses,
  openStatusModal,
  openHistoryModal,
  employeeName,
  task,
}) => {
  const getEntityStatusBadge = (entity) => {
    const entityId = entity._id || entity.id;
    const statusData =
      entityStatuses[entityId] || entityStatuses[entityId?.toString()];
    const status = statusData?.status || "pending";

    const statusConfig = {
      pending: { bg: "light", text: "dark", label: "PENDING" },
      "in-progress": { bg: "info-light", text: "info", label: "IN PROGRESS" },
      completed: { bg: "success-light", text: "success", label: "COMPLETED" },
      cancelled: { bg: "danger-light", text: "danger", label: "CANCELLED" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge bg={config.bg} text={config.text} className="border px-2 py-1">
        {config.label}
      </Badge>
    );
  };

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

  const daysLeft = calculateDaysLeft(task.assignmentDetails?.dueDate);

  return (
    <div className="table-responsive border rounded">
      <Table hover className="mb-0">
        <thead className="bg-light">
          <tr>
            <th className="py-3 px-3 border-bottom">Name</th>
            <th className="py-3 px-3 border-bottom">Contact</th>
            <th className="py-3 px-3 border-bottom">Details</th>
            <th className="py-3 px-3 border-bottom">Status</th>
            <th className="py-3 px-3 border-bottom text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((entity, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-light" : ""}>
              <td className="py-3 px-3 align-middle border-bottom">
                <div className="d-flex align-items-center">
                  {entityType === "client" ? (
                    <FaUserFriends className="text-success me-2" size={16} />
                  ) : (
                    <FaUsers className="text-info me-2" size={16} />
                  )}
                  <div>
                    <div className="fw-semibold">
                      {entity.personalDetails?.groupName ||
                        entity.personalDetails?.name ||
                        "Unnamed " + entityType}
                    </div>
                    {entity.personalDetails?.groupCode && (
                      <small className="text-muted">
                        Code: {entity.personalDetails.groupCode}
                      </small>
                    )}
                  </div>
                </div>
              </td>

              <td className="py-3 px-3 align-middle border-bottom">
                <div className="small">
                  <div className="d-flex align-items-center mb-1">
                    <FaMobileAlt className="text-muted me-2" size={12} />
                    <span>{entity.personalDetails?.mobileNo || "N/A"}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaEnvelope className="text-muted me-2" size={12} />
                    {entity.personalDetails?.emailId ? (
                      <a
                        href={`mailto:${entity.personalDetails.emailId}`}
                        className="text-decoration-none text-truncate d-inline-block"
                        style={{ maxWidth: "150px" }}
                      >
                        {entity.personalDetails.emailId}
                      </a>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </div>
                </div>
              </td>

              <td className="py-3 px-3 align-middle border-bottom">
                <div className="small">
                  {entityType === "prospect" &&
                    entity.personalDetails?.leadSource && (
                      <div className="mb-1">
                        <strong>Source:</strong>{" "}
                        {entity.personalDetails.leadSource}
                      </div>
                    )}
                  {entity.personalDetails?.organisation && (
                    <div className="mb-1">
                      <strong>Company:</strong>{" "}
                      {entity.personalDetails.organisation}
                    </div>
                  )}
                  {task.assignmentDetails?.dueDate && (
                    <div className="d-flex align-items-center">
                      <FaCalendarCheck className="text-muted me-1" size={12} />
                      <span
                        className={
                          daysLeft < 0 ? "text-danger" : "text-success"
                        }
                      >
                        {daysLeft < 0 ? "Overdue" : `${daysLeft} days left`}
                      </span>
                    </div>
                  )}
                </div>
              </td>

              <td className="py-3 px-3 align-middle border-bottom">
                {getEntityStatusBadge(entity)}
                {entityStatuses[entity._id || entity.id]?.remarks && (
                  <div className="mt-1 small text-muted">
                    {entityStatuses[entity._id || entity.id].remarks.slice(
                      0,
                      30
                    )}
                    ...
                  </div>
                )}
              </td>

              <td className="py-3 px-3 align-middle border-bottom text-center">
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => openStatusModal(entity, entityType)}
                    title="Update Status"
                  >
                    <FaEdit className="me-1" />
                    Update
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => openHistoryModal(entity)}
                    title="View History"
                  >
                    <FaHistory className="me-1" />
                    History
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default EntitiesTable;
