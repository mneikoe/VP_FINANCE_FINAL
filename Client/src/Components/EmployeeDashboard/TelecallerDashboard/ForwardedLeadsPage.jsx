import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LeadsTableLayout from "./LeadsTableLayout";
import { setforwardedleadCount } from "../../../redux/feature/showdashboarddata/dashboarddataSlice";

const ForwardedLeadsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suspects = [] } = useSelector((state) => state.suspect);
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  let rlcnt = 0;

  // ✅ FIXED: Better date handling
  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

  const data = suspects
    .filter((suspect) => {
      if (suspect.assignedTo?.toString() !== telecallerId) {
        return false;
      }

      if (!suspect.callTasks || suspect.callTasks.length === 0) {
        return false;
      }

      const latestTask = suspect.callTasks.reduce((latest, task) => {
        if (!task.taskDate) return latest;

        const taskDateTime = new Date(
          task.taskDate + " " + (task.taskTime || "00:00")
        );
        if (!latest) return task;

        const latestDateTime = new Date(
          latest.taskDate + " " + (latest.taskTime || "00:00")
        );
        return taskDateTime > latestDateTime ? task : latest;
      }, null);

      if (!latestTask || !latestTask.taskDate) {
        return false;
      }

      // ✅ TEMPORARY: Remove date filter to test
      const forwardedStatuses = [
        "Call Not Picked",
        "Busy on Another Call",
        "Call After Sometimes",
        "Others",
      ];

      return forwardedStatuses.includes(latestTask.taskStatus);
    })
    .map((s, i) => {
      // Get latest task for display
      const latestTask = s.callTasks.reduce((latest, task) => {
        if (!task.taskDate) return latest;

        const taskDateTime = new Date(
          task.taskDate + " " + (task.taskTime || "00:00")
        );
        if (!latest) return task;

        const latestDateTime = new Date(
          latest.taskDate + " " + (latest.taskTime || "00:00")
        );
        return taskDateTime > latestDateTime ? task : latest;
      }, null);

      rlcnt++;

      const personal = s.personalDetails || {};

      return {
        sn: i + 1,
        taskDate: latestTask?.taskDate
          ? new Date(latestTask.taskDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-",
        suspectName: (
          <span
            style={{ cursor: "pointer", color: "#007bff" }}
            onClick={() => navigate(`/telecaller/suspect/edit/${s._id}`)}
          >
            {personal.groupName || personal.name || "-"}
          </span>
        ),
        mobile: personal.contactNo || "-",
        organisation: personal.organisation || "-",
        area: personal.city || "-",
        purpose: latestTask?.taskRemarks || "-",
        status: latestTask?.taskStatus || "-",
        nextCallDate: latestTask?.taskDate || "-",
        nextCallTime: latestTask?.taskTime || "-",
        _id: s._id,
      };
    });

  useEffect(() => {
    dispatch(setforwardedleadCount(rlcnt));
  }, [rlcnt, dispatch]);

  const columns = [
    { header: "S.N", key: "sn" },
    { header: "Task Date", key: "taskDate" },
    { header: "Suspect Name", key: "suspectName" },
    { header: "Mobile", key: "mobile" },
    { header: "Organisation", key: "organisation" },
    { header: "Area", key: "area" },
    { header: "Next Call Date", key: "nextCallDate" },
    { header: "Next Call Time", key: "nextCallTime" },
    { header: "Remarks", key: "purpose" },
    { header: "Status", key: "status" },
  ];

  // ✅ DEBUG: Check what data is being filtered
  console.log("Filtered Forwarded Leads:", data);
  console.log("Total suspects:", suspects.length);
  console.log("Today's date:", todayString);

  return (
    <LeadsTableLayout
      title={`Forwarded Leads (All) - ${rlcnt}`}
      data={data}
      columns={columns}
    />
  );
};

export default ForwardedLeadsPage;
