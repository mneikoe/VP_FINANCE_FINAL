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
  fetchDetails,
  createDetails,
  updateDetails,
  deleteDetails,
} from "../../../redux/feature/LeadCity/CityThunx";

const City = () => {
  const dispatch = useDispatch();
  const { details, loading } = useSelector((state) => state.leadCity);
  const [city, setCity] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    dispatch(fetchDetails());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      dispatch(createDetails({ city }));
      setCity("");
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditValue(item.city);
  };

  const handleUpdate = (id) => {
    if (editValue.trim()) {
      dispatch(updateDetails({ id, data: { city: editValue } }));
      setEditId(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditValue("");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this city?")) {
      dispatch(deleteDetails(id));
    }
  };

  return (
    <Container fluid className="container mt-4">
      <h3 className="mb-4">City Management</h3>
      <Row>
        {/* Left Side - Add New City */}
        <Col md={6}>
          <Card className="shadow-sm border-top border-primary">
            <Card.Body>
              <Card.Title>Add New City</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="cityName">
                  <Form.Label>City Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter city name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Add City
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Side - All Cities */}
        <Col md={6}>
          <Card className="shadow-sm border-top border-success">
            <Card.Body>
              <Card.Title>All Cities</Card.Title>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ListGroup variant="flush">
                  {details.map((item) => (
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
                          {item.city}
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

export default City;
