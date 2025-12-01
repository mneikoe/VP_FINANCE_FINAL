import React, { useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CREDashboard = () => {
  // Dummy CRE data
  const creList = [
    {
      id: "cre1",
      name: "John Doe",
      assignedClients: [
        {
          id: "c1",
          name: "Aditya Sharma",
          callTasks: [
            {
              taskStatus: "Appointment Done",
              taskDate: "2025-10-12",
              taskTime: "13:30",
              taskRemarks: "Client met",
            },
            {
              taskStatus: "Busy on Another Call",
              taskDate: "2025-10-11",
              taskTime: "11:00",
              taskRemarks: "Call later",
            },
          ],
        },
        {
          id: "c2",
          name: "Mohammad Ayan",
          callTasks: [
            {
              taskStatus: "Appointment Done",
              taskDate: "2025-10-13",
              taskTime: "11:00",
              taskRemarks: "Client met",
            },
          ],
        },
      ],
    },
  ];

  const [cres, setCres] = useState(creList);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [status, setStatus] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [remark, setRemark] = useState("");

  const handleShowModal = (client) => {
    setSelectedClient(client);
    setShowModal(true);

    // Reset form fields
    setStatus("");
    setNewDate("");
    setNewTime("");
    setRemark("");
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    setShowModal(false);
  };

  const handleUpdateAppointment = () => {
    if (!selectedClient) return;

    const updatedTasks = selectedClient.callTasks.map((task) => {
      if (task.taskStatus === "Appointment Done") {
        return {
          ...task,
          taskStatus: status || task.taskStatus,
          taskDate: newDate || task.taskDate,
          taskTime: newTime || task.taskTime,
          taskRemarks: remark || task.taskRemarks,
        };
      }
      return task;
    });

    // Update the client in CRE state
    const updatedCres = cres.map((cre) => {
      return {
        ...cre,
        assignedClients: cre.assignedClients.map((client) => {
          if (client.id === selectedClient.id) {
            return { ...client, callTasks: updatedTasks };
          }
          return client;
        }),
      };
    });

    setCres(updatedCres); // save the update in state
    setShowModal(false); // close modal
    setSelectedClient(null);

    // Reset form fields
    setStatus("");
    setNewDate("");
    setNewTime("");
    setRemark("");
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">CRE Dashboard</h2>

      {cres.map((cre) => (
        <div key={cre.id} className="mb-5">
          <h4>{cre.name}</h4>
          <Table bordered hover>
            <thead className="table-primary">
              <tr>
                <th>Client Name</th>
                <th>Appointment Done Count</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cre.assignedClients.map((client) => {
                const appointmentsDone = client.callTasks.filter(
                  (task) => task.taskStatus === "Appointment Done"
                );
                return (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>
                      <Button onClick={() => handleShowModal(client)}>
                        {appointmentsDone.length}
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleShowModal(client)}
                      >
                        View / Update
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ))}

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedClient ? selectedClient.name : "Client Details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient ? (
            <div>
              <h6>Appointment Done Tasks</h6>
              <ul>
                {selectedClient.callTasks
                  .filter((task) => task.taskStatus === "Appointment Done")
                  .map((task, idx) => (
                    <li key={idx}>
                      Date: {task.taskDate}, Time: {task.taskTime}, Remarks:{" "}
                      {task.taskRemarks}
                    </li>
                  ))}
              </ul>

              <hr />
              <h6>Update Appointment</h6>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                    <option value="Client Not Available">
                      Client Not Available
                    </option>
                  </Form.Select>
                </Form.Group>

                {status === "Postponed" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>New Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                      />
                    </Form.Group>
                  </>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Remark</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </div>
          ) : (
            <p>No client selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateAppointment}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CREDashboard;
