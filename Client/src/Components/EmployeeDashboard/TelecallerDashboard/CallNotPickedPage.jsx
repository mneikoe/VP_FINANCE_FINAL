import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LeadsTableLayout from "./LeadsTableLayout";

const CallNotPickedPage = () => {
  const { suspects = [] } = useSelector((state) => state.suspect);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // object milega
  const telecallerId = user?.id || null;

  let rlcnt = 0;

  // Filter for "Call Not Picked" whose latest task is NOT forwarded after
  const data = suspects
    .filter((suspect) => {
      if (suspect.assignedTo?.toString() !== telecallerId || !suspect.callTasks?.length) return false;

      const lastTask = suspect.callTasks.slice(-1)[0]; // latest task
      if (!lastTask) return false;

      // Latest task must be "Call Not Picked"
      if (lastTask.taskStatus !== "Call Not Picked") return false;

 

      return true;
    })
    .map((s, i) => {
      const lastTask = s.callTasks.slice(-1)[0];
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
            onClick={() => navigate(`/telecaller/suspect/edit/${s._id}`)}
          >
            {s.personalDetails?.groupName || "-"}
          </span>
        ),
        mobile: s.personalDetails?.contactNo || "-",
        organisation: s.personalDetails?.organisation || "-",
        area: s.personalDetails?.city || "-",
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

  return <LeadsTableLayout title="Call Not Picked" data={data} columns={columns} />;
};

export default CallNotPickedPage;
