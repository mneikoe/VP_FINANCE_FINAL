// LeadType.js
import React, { useState, useEffect } from "react";
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
  createLeadType,
  deleteLeadType,
  fetchLeadType,
  updateLeadType,
} from "../../../redux/feature/LeadType/LeadTypeThunx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const LeadType = () => {
  const dispatch = useDispatch();
  const { LeadType, loading } = useSelector((state) => state.LeadType);
  const [leadType, setLeadType] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    dispatch(fetchLeadType());
  }, [dispatch]);




  const handleEdit = (item) => {
    setEditId(item._id);
    setEditValue(item.leadType);
  };




  const handleCancelEdit = () => {
    setEditId(null);
    setEditValue("");
  };

 
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (leadType.trim()) {
    const result = await dispatch(createLeadType({ leadType }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Lead source added successfully!");
      setLeadType("");
      await dispatch(fetchLeadType());
    } else {
      toast.error("Failed to add Lead Type.");
    }
  }
};




 const handleUpdate = async (id) => {
  if (editValue.trim()) {
    const result = await dispatch(updateLeadType({ id, data: { leadType: editValue } }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Lead source updated successfully!");
      await dispatch(fetchLeadType());
    } else {
      toast.error("Failed to update Lead Type.");
    }
    setEditId(null);
    setEditValue("");
  }
};


  const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this Type?")) {
    const result = await dispatch(deleteLeadType(id));
    if (result.meta.requestStatus === "fulfilled") {
      await dispatch(fetchLeadType());
      toast.success("Lead sourcs deleted successfully!");
    } else {
      toast.error("Failed to delete Lead Type.");
    }
  }
};


  return (
    <Container fluid className="container mt-4">
      <h3 className="mb-4">Lead Source Management</h3>
      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-top border-primary">
            <Card.Body>
              <Card.Title>Add Lead Source</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="TypeName">
                  <Form.Label>Source Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Source name"
                    value={leadType}
                    onChange={(e) => setLeadType(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Add Source
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-top border-success">
            <Card.Body>
              <Card.Title>All Lead Sources</Card.Title>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ListGroup variant="flush">
                  {LeadType.map((item) => (
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
                          {item.leadType}
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

export default LeadType;
