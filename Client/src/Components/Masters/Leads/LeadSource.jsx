

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
  createDetails,
  fetchDetails,
  updateDetails,
  deleteDetails,
} from "../../../redux/feature/LeadSource/LeadThunx";
import { fetchLeadType } from "../../../redux/feature/LeadType/LeadTypeThunx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LeadSource = () => {
  const [leadTypeId, setLeadTypeId] = useState(""); // State for leadTypeId
  const [sourceName, setsourceName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const dispatch = useDispatch();

  // Lead sources slice from Redux
  const { leadsourceDetail: leadSources, loading } = useSelector(
    (state) => state.leadsource
  );

  // Lead types slice from Redux
  const leadTypeState = useSelector((state) => state.LeadType);

  useEffect(() => {
    dispatch(fetchLeadType());
    dispatch(fetchDetails());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();


    const leadData = { leadTypeId, sourceName }; // Include leadTypeId in the data

    try {
      if (isEditing) {
        await dispatch(updateDetails({ id: editId, data: leadData }));
        toast.success("Lead name updated successfully!");
      } else {
        await dispatch(createDetails(leadData));
        toast.success("Lead name created successfully!");
      }
      setsourceName("");
      setLeadTypeId(""); // Clear leadTypeId
      setIsEditing(false);
      setEditId(null);
      dispatch(fetchDetails()); // Fetch all lead sources again to get the updated data
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Error submitting lead name:", error);
    }
  };

  const handleEdit = (source) => {
    setEditId(source._id);
    setsourceName(source.sourceName);
    setLeadTypeId(source.leadTypeId); // Set leadTypeId
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setsourceName("");
    setLeadTypeId(""); // Clear leadTypeId
    setEditId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lead source?")) {
      dispatch(deleteDetails(id));
      toast.success("Lead Source deleted successfully!");
      dispatch(fetchDetails()); // Fetch all lead sources again to get the updated data
    }
  };

  return (
    <Container
      fluid
      className="p-4"
      style={{ backgroundColor: "#edf2f7", minHeight: "100vh" }}
    >
      <ToastContainer />
      <h3 className="mb-4">Lead Name</h3>
      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-top border-primary">
            <Card.Body>
              <Card.Title>
                {isEditing ? "Edit Lead Name" : "Add Lead Name"}
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                {/* <Form.Group className="mb-3" controlId="leadType">
                  <Form.Label>Lead Type</Form.Label>
                  <Form.Select
                    value={leadTypeId}
                    onChange={(e) => setLeadTypeId(e.target.value)}
                    required
                  >
                    <option value="">--Choose--</option>
                    {(leadTypeState?.LeadType || []).map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.leadType}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group> */}

                <Form.Group className="mb-3" controlId="sourceName">
                  <Form.Label>Lead Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Name"
                    value={sourceName}
                    onChange={(e) => setsourceName(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary">
                    {isEditing ? "Update" : "Submit"}
                  </Button>
                  {isEditing && (
                    <Button variant="secondary" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-top border-success">
            <Card.Body>
              <Card.Title>All Lead name</Card.Title>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ListGroup variant="flush">
                  {leadSources?.map((source) => (
                    <ListGroup.Item
                      key={source._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        {source.sourceName} 
                      </div>
                   
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(source)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(source._id)}
                        >
                          Delete
                        </Button>
                      </div>
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

export default LeadSource;