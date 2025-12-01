import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LeadsTableLayout from "./LeadsTableLayout";

const NotReachable = () => {
  const { suspects = [] } = useSelector((state) => state.suspect);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  let rlcnt = 0;

  // Filter for latest task = "Not Reachable" and exclude if forwarded after task
  const data = suspects
    .filter((suspect) => {
      const lastTask = suspect.callTasks?.slice(-1)[0]; // latest task
      if (!lastTask) return false;

      // Check telecaller
      if (suspect.assignedTo?.toString() !== telecallerId) return false;

      // Status must match
      if (lastTask.taskStatus !== "Not Reachable") return false;

      // Check if forwarded after latest task
      const forwardTime = suspect.leadInfo?.createdAt ? new Date(suspect.leadInfo.createdAt) : null;
      const taskCreated = lastTask.createdAt ? new Date(lastTask.createdAt) : null;

      if (forwardTime && taskCreated && forwardTime > taskCreated) return false;

      return true;
    })
    .map((suspect, i) => {
      const lastTask = suspect.callTasks.slice(-1)[0];
      rlcnt++;
      return {
        sn: i + 1,
        taskDate: new Date(lastTask.taskDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, "/"),
        suspectName: (
          <span
            style={{ cursor: "pointer", color: "#007bff" }}
            onClick={() => navigate(`/telecaller/suspect/edit/${suspect._id}`)}
          >
            {suspect.personalDetails?.groupName || "-"}
          </span>
        ),
        mobile: suspect.personalDetails?.contactNo || "-",
        organisation: suspect.personalDetails?.organisation || "-",
        area: suspect.personalDetails?.city || "-",
        purpose: lastTask.taskRemarks || "-",
        status: lastTask.taskStatus,
      };
    });

  const columns = [
    { header: "S.N", key: "sn" },
    { header: "Task Date", key: "taskDate" },
    { header: "Suspect Name", key: "suspectName" },
    { header: "Mobile", key: "mobile" },
    { header: "Organisation", key: "organisation" },
    { header: "Area", key: "area" },
    { header: "Calling Purpose", key: "purpose" },
    { header: "Calling Status", key: "status" },
  ];

  return <LeadsTableLayout title="Not Reachable" data={data} columns={columns} />;
};

export default NotReachable;
