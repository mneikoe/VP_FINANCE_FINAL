// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import LeadsTableLayout from "./LeadsTableLayout";
// import { setappointmentdoneCount } from "../../../redux/feature/showdashboarddata/dashboarddataSlice";

// function Monthlyappointment() {
//   const dispatch = useDispatch();
//   const { suspects = [] } = useSelector((state) => state.suspect);

//   const user = JSON.parse(localStorage.getItem("user"));
//   const telecallerId = user?.id || null;

//   let rlcnt = 0;

//   // Get current month & year
//   const currentMonth = new Date().getMonth(); // 0 = Jan, 9 = Oct
//   const currentYear = new Date().getFullYear();

//   const data = suspects
//     .filter((suspect) => {
//       if (suspect.assignedTo?.toString() !== telecallerId || !suspect.callTasks?.length) return false;

//       const lastTask = suspect.callTasks[suspect.callTasks.length - 1]; // latest task
//       if (!lastTask) return false;

//       const taskDate = new Date(lastTask.taskDate);
//       return (
//         lastTask.taskStatus === "Appointment Done" &&
//         taskDate.getMonth() === currentMonth &&
//         taskDate.getFullYear() === currentYear
//       );
//     })
//     .map((s, i) => {
//       const lastTask = s.callTasks[s.callTasks.length - 1];
//       rlcnt++;

//       return {
//         sn: rlcnt,
//         taskDate: new Date(lastTask.taskDate).toLocaleDateString(),
//         suspectName: s.personalDetails?.groupName || "-",
//         organisation: s.personalDetails?.organisation || "-",
//         area: s.personalDetails?.city || "-",
//         mobile: s.personalDetails?.contactNo || "-",
//         purpose: "-portfolio",
//         status: lastTask.taskStatus,
//         remark: lastTask.taskRemarks || "-",
//       };
//     });

//   useEffect(() => {
//     dispatch(setappointmentdoneCount(rlcnt));
//   }, [rlcnt, dispatch]);

//   const columns = [
//     { header: "S.N", key: "sn" },
//     { header: "Task Date", key: "taskDate" },
//     { header: "Suspect Name", key: "suspectName" },
//     { header: "Organisation Name", key: "organisation" },
//     { header: "Area", key: "area" },
//     { header: "Mobile", key: "mobile" },
//     { header: "Calling Purpose", key: "purpose" },
//     { header: "Calling Status", key: "status" },
//     { header: "Remark", key: "remark" },
//   ];

//   return (
//     <LeadsTableLayout
//       title="Monthly Appointments"
//       data={data}
//       columns={columns}
//     />
//   );
// }

// export default Monthlyappointment;


import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LeadsTableLayout from "./LeadsTableLayout";


const Monthlyappointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suspects = [] } = useSelector((state) => state.suspect);
  const user = JSON.parse(localStorage.getItem("user"));
  const telecallerId = user?.id || null;





  const data = suspects
    .filter((suspect) => {
      if (suspect.assignedTo?.toString() !== telecallerId || !suspect.callTasks?.length) return false;

      const lastTask = suspect.callTasks.slice(-1)[0];
      if (lastTask.taskStatus !== "Appointment Done") return false;

    




   

      return true;
    })
    .map((s, i) => {
      const lastTask = s.callTasks.slice(-1)[0];


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

  return <LeadsTableLayout title="Monthly appointment" data={data} columns={columns} />;
};

export default Monthlyappointment;
