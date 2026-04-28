import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  createCallingPurpose,
  deleteCallingPurpose,
  fetchCallingPurposes,
  updateCallingPurpose,
} from "../../../redux/feature/CallingPurpose/CallingPurposeThunx";
import { toast } from "react-toastify";

const CallingPurpose = () => {
  const dispatch = useDispatch();
  const { callingPurposes, loading } = useSelector(
    (state) => state.callingPurpose
  );
  const purposeList = Array.isArray(callingPurposes) ? callingPurposes : [];
  const [purposeName, setPurposeName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    dispatch(fetchCallingPurposes());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purposeName.trim()) return;

    const result = await dispatch(createCallingPurpose({ purposeName }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Calling purpose added successfully!");
      setPurposeName("");
      dispatch(fetchCallingPurposes());
    } else {
      toast.error("Failed to add calling purpose.");
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditValue(item.purposeName);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditValue("");
  };

  const handleUpdate = async (id) => {
    if (!editValue.trim()) return;

    const result = await dispatch(
      updateCallingPurpose({ id, data: { purposeName: editValue } })
    );
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Calling purpose updated successfully!");
      dispatch(fetchCallingPurposes());
    } else {
      toast.error("Failed to update calling purpose.");
    }
    handleCancelEdit();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purpose?")) return;

    const result = await dispatch(deleteCallingPurpose(id));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Calling purpose deleted successfully!");
      dispatch(fetchCallingPurposes());
    } else {
      toast.error("Failed to delete calling purpose.");
    }
  };

  return (
    <Container fluid className="container mt-4">
      <h3 className="mb-4">Calling Purpose Master</h3>
      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-top border-primary">
            <Card.Body>
              <Card.Title>Add Calling Purpose</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="purposeName">
                  <Form.Label>Purpose Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter purpose name"
                    value={purposeName}
                    onChange={(e) => setPurposeName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Add Purpose
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-top border-success">
            <Card.Body>
              <Card.Title>All Calling Purposes</Card.Title>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ListGroup variant="flush">
                  {purposeList.map((item) => (
                    <ListGroup.Item
                      key={item._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {editId === item._id ? (
                        <div className="d-flex w-100">
                          <Form.Control
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="me-2"
                          />
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleUpdate(item._id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          {item.purposeName}
                          <span>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
                            >
                              Delete
                            </Button>
                          </span>
                        </>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CallingPurpose;
