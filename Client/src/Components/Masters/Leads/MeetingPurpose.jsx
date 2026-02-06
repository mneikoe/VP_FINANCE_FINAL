import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDetails,
  createDetails,
  updateDetails,
  deleteDetails,
} from "../../../redux/feature/LeadMeeting/MeetingThunx";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MeetingPurpose = () => {
  const [meetingPurposeName, setMeetingPurposeName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const { details } = useSelector((state) => state.meetingpurpose);

  useEffect(() => {
    dispatch(fetchDetails());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meetingPurposeName) return;

    setLoading(true);
    try {
      if (editId) {
        const result = await dispatch(
          updateDetails({
            id: editId,
            data: { meetingPurposeName },
          })
        );

        if (result.meta.requestStatus === "fulfilled") {
          toast.success("Meeting purpose updated successfully");
          dispatch(fetchDetails());
        } else {
          toast.error("Failed to update meeting purpose");
        }
      } else {
        const result = await dispatch(
          createDetails({ meetingPurposeName })
        );

        if (result.meta.requestStatus === "fulfilled") {
          toast.success("Meeting purpose added successfully");
          dispatch(fetchDetails());
        } else {
          toast.error("Failed to add meeting purpose");
        }
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
      setMeetingPurposeName("");
      setEditId(null);
    }
  };

  const handleEdit = (item) => {
    setMeetingPurposeName(item.meetingPurposeName);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this meeting purpose?")) {
      setLoading(true);
      try {
        const result = await dispatch(deleteDetails(id));
        if (result.meta.requestStatus === "fulfilled") {
          toast.success("Meeting purpose deleted successfully");
          dispatch(fetchDetails());
        } else {
          toast.error("Failed to delete meeting purpose");
        }
      } catch (error) {
        toast.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container
      fluid
      className="p-4"
      style={{ backgroundColor: "#edf2f7", minHeight: "100vh" }}
    >
      <h3 className="mb-4">Meeting Purpose</h3>
      <Row>
        {/* Left Side - Add / Edit */}
        <Col md={6}>
          <Card className="shadow-sm border-top border-primary">
            <Card.Body>
              <Card.Title>
                {editId ? "Edit" : "Add"} Meeting Purpose
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Meeting Purpose Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter meeting purpose"
                    value={meetingPurposeName}
                    onChange={(e) =>
                      setMeetingPurposeName(e.target.value)
                    }
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={loading}>
                  {editId ? "Update" : "Submit"}
                </Button>

                {editId && (
                  <Button
                    variant="secondary"
                    className="ms-2"
                    onClick={() => {
                      setMeetingPurposeName("");
                      setEditId(null);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Side - List */}
        <Col md={6}>
          <Card className="shadow-sm border-top border-success">
            <Card.Body>
              <Card.Title>All Meeting Purposes</Card.Title>
              <ListGroup variant="flush">
                {Array.isArray(details) &&
                  details.map((item) => (
                    <ListGroup.Item
                      key={item._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>{item.meetingPurposeName}</div>
                      <div>
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
                      </div>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MeetingPurpose;
