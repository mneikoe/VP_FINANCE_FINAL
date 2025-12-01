import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAllSuspectsOnlyAppointMentDone } from "../redux/feature/SuspectRedux/SuspectThunx";

const Appointment = () => {
  const dispatch = useDispatch();
  const { familyMembers: suspects, loading } = useSelector(
    (state) => state.suspect
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [appointmentTasks, setAppointmentTasks] = useState([]);

  // Fetch suspects having "Appointment Done" tasks
  useEffect(() => {
    dispatch(getAllSuspectsOnlyAppointMentDone());
  }, [dispatch]);

  // Filter users who have Appointment Done tasks
  const filteredUsers = (suspects || [])
    .map((user) => {
      const appointmentTasks = (user.callTasks || []).filter(
        (task) => task.taskStatus === "Appointment Done"
      );

      if (appointmentTasks.length === 0) return null;

      return {
        _id: user._id,
        name: user.personalDetails?.name || "N/A",
        phone: user.personalDetails?.mobileNo || "N/A",
        email: user.personalDetails?.emailId || "N/A",
        address: user.personalDetails?.resiAddr || "N/A",
        appointments: appointmentTasks,
        count: appointmentTasks.length,
      };
    })
    .filter(Boolean);

  const handleShow = (user) => {
    setSelectedUser(user);
    setAppointmentTasks(user.appointments);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedUser(null);
    setAppointmentTasks([]);
  };

  const handleSelectCRE = (e) => {
    console.log(e);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Appointments</h2>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center text-muted">No appointments found.</div>
      ) : (
        <div className="table-responsive shadow-sm">
          <Table bordered hover className="align-middle">
            <thead className="table-primary">
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th className="text-center">Appointment Done</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td className="text-center">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleShow(user)}
                    >
                      {user.count}
                    </Button>
                    <select
                      name="chooseCRE"
                      id="chooseCRE"
                      onChange={(e) => handleSelectCRE(e.target.value)}
                    >
                      <option value="">Select the CRE</option>
                      <option value="Aditya">Aditya</option>
                      <option value="Dheeraj">Dheeraj</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal for Appointment Details */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details — {selectedUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {appointmentTasks.length > 0 ? (
            <Table bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {appointmentTasks.map((task) => (
                  <tr key={task._id}>
                    <td>{new Date(task.taskDate).toLocaleDateString()}</td>
                    <td>{task.taskTime}</td>
                    <td>{task.taskRemarks}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No appointment details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Appointment;
