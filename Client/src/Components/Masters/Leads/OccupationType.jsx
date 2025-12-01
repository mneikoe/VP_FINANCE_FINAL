
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
  createOccupationType,
  deleteOccupationType,
  getAllOccupationTypes,
  updateOccupationType,
} from "../../../redux/feature/OccupationType/OccupationThunx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OccupationType = () => {
  const dispatch = useDispatch();

  // FIX: The correct state key from your slice is `alldetailsForTypes`, not `allOccupationTypes`.
  const { alldetailsForTypes, loading } = useSelector((state) => state.OccupationType);

  const [occupationType, setOccupationType] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    dispatch(getAllOccupationTypes());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (occupationType.trim()) {
      try {
        await dispatch(createOccupationType({ occupationType })).unwrap();
        toast.success("Occupation Type added successfully");
        dispatch(getAllOccupationTypes());
        setOccupationType("");
      } catch (error) {
        toast.error("Failed to add Occupation Type");
      }
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditValue(item.occupationType);
  };

  const handleUpdate = async (id) => {
    if (editValue.trim()) {
      try {
        await dispatch(updateOccupationType({ id, data: { occupationType: editValue } })).unwrap();
        toast.success("Occupation Type updated successfully");
        dispatch(getAllOccupationTypes());
        setEditId(null);
        setEditValue("");
      } catch (error) {
        toast.error("Failed to update Occupation Type");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditValue("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Occupation Type?")) {
      try {
        await dispatch(deleteOccupationType(id)).unwrap();
        dispatch(getAllOccupationTypes());
        toast.success("Occupation Type deleted successfully");
      } catch (error) {
        toast.error("Failed to delete Occupation Type");
      }
    }
  };

  return (
    <Container fluid className="container mt-4">
      <h3 className="mb-4">Occupation Type Management</h3>
      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-top border-primary">
            <Card.Body>
              <Card.Title>Add New Occupation Type</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="OccupationTypeName">
                  <Form.Label>Occupation Type Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Occupation Type name"
                    value={occupationType}
                    onChange={(e) => setOccupationType(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading}>
                  Add Occupation Type
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-top border-success">
            <Card.Body>
              <Card.Title>All Occupation Types</Card.Title>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ListGroup variant="flush">
                  {Array.isArray(alldetailsForTypes) && alldetailsForTypes.map((item) => (
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
                            disabled={loading}
                          />
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleUpdate(item._id)}
                            disabled={loading}
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          {item.occupationType}
                          <span>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(item)}
                              disabled={loading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
                              disabled={loading}
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

export default OccupationType;
