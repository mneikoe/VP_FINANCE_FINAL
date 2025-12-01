
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LeadsTableLayout from "./LeadsTableLayout";
import { setappointmentdoneCount } from "../../../redux/feature/showdashboarddata/dashboarddataSlice";

const AppointmentsDonePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suspects = [] } = useSelector((state) => state.suspect);
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;

  let adcnt = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const data = suspects
    .filter((suspect) => {
      if (suspect.assignedTo?.toString() !== telecallerId || !suspect.callTasks?.length) return false;

      const lastTask = suspect.callTasks.slice(-1)[0];
      if (lastTask.taskStatus !== "Appointment Done") return false;

      const appointmentCreated = lastTask.createdAt ? new Date(lastTask.createdAt) : null;
      if (!appointmentCreated) return false;


        if (!(appointmentCreated >= today && appointmentCreated< tomorrow)) return false;

   

      return true;
    })
    .map((s, i) => {
      const lastTask = s.callTasks.slice(-1)[0];
      adcnt++;

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
        organisation: s.personalDetails?.organisation || "-",
        area: s.personalDetails?.city || "-",
        mobile: s.personalDetails?.contactNo || "-",
        purpose: "-portfolio",
        status: lastTask.taskStatus,
        remark: lastTask.taskRemarks || "-",
      };
    });

  useEffect(() => {
    dispatch(setappointmentdoneCount(adcnt));
  }, [adcnt, dispatch]);

  const columns = [
    { header: "S.N", key: "sn" },
    { header: "Task Date", key: "taskDate" },
    { header: "Suspect Name", key: "suspectName" },
    { header: "Organisation Name", key: "organisation" },
    { header: "Area", key: "area" },
    { header: "Mobile", key: "mobile" },
    { header: "Calling Purpose", key: "purpose" },
    { header: "Calling Status", key: "status" },
    { header: "Remark", key: "remark" },
  ];

  return <LeadsTableLayout title="Appointments Done (Today)" data={data} columns={columns} />;
};

export default AppointmentsDonePage;
