import React from "react";
import { Badge } from "react-bootstrap";
import { FaCalendarAlt, FaSync } from "react-icons/fa";
import { formatDate } from "../../../../utils/formatter";

const TaskHeader = ({ task }) => {
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
    <div>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h2 className="fw-bold mb-2 text-dark">{task.name}</h2>
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <Badge bg="light" text="dark" className="px-3 py-2 border">
              {task.type?.toUpperCase() || "TASK"}
            </Badge>
            {daysLeft !== null && (
              <Badge
                bg={
                  daysLeft < 0
                    ? "danger-light"
                    : daysLeft <= 2
                    ? "warning-light"
                    : "success-light"
                }
                text={
                  daysLeft < 0
                    ? "danger"
                    : daysLeft <= 2
                    ? "warning"
                    : "success"
                }
                className="px-3 py-2 border"
              >
                <FaCalendarAlt className="me-1" />
                {daysLeft < 0
                  ? `${Math.abs(daysLeft)} days overdue`
                  : `${daysLeft} days left`}
              </Badge>
            )}
            {task.company && (
              <Badge bg="info-light" text="info" className="px-3 py-2 border">
                {task.company}
              </Badge>
            )}
            {task.product && (
              <Badge
                bg="secondary-light"
                text="secondary"
                className="px-3 py-2 border"
              >
                {task.product}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;
