import React from "react";
import { useSelector } from "react-redux";
import LeadsTableLayout from "./LeadsTableLayout";

const OthersLeadsPage = () => {
  const { suspects = [] } = useSelector((state) => state.suspect);
  const user = JSON.parse(localStorage.getItem("user")); // object milega
  const telecallerId = user?.id || null;

  let rlcnt = 0;

  // Filter for "Others" whose latest task is NOT forwarded after
  const data = suspects
    .filter((suspect) => {
      if (
        suspect.assignedTo?.toString() !== telecallerId ||
        !suspect.callTasks?.length
      )
        return false;

      const tasks = suspect.callTasks;
      const lastTask = tasks[tasks.length - 1]; // latest task
      if (!lastTask) return false;

      // Latest task must be "Others"
      if (lastTask.taskStatus !== "Others") return false;

 

      return true;
    })
    .map((s, i) => {
      const lastTask = s.callTasks.slice(-1)[0];
      rlcnt++;

      return {
        sn: rlcnt,
        taskDate: new Date(lastTask.taskDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, "/"),
        suspectName: s.personalDetails?.groupName || "-",
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

  return (
    <LeadsTableLayout title="Others" data={data} columns={columns} />
  );
};

export default OthersLeadsPage;
