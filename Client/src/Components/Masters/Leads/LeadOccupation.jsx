
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOccupations,
  createOccupation,
  updateOccupation,
  deleteOccupation
} from "../../../redux/feature/LeadOccupation/OccupationThunx";
import { getAllOccupationTypes } from "../../../redux/feature/OccupationType/OccupationThunx";
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

const LeadOccupation = () => {
  // Use a more descriptive state variable for the occupation type ID
  const [occupationTypeId, setOccupationTypeId] = useState("");
  const [occupationName, setOccupationName] = useState("");
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  // Use clear variable names for the state from Redux
  const { alldetails } = useSelector((state) => state.leadOccupation);
  const { alldetailsForTypes } = useSelector((state) => state.OccupationType);


  useEffect(() => {
    dispatch(getAllOccupationTypes());
    dispatch(getAllOccupations());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!occupationTypeId || !occupationName) return;

    setLoading(true);

    try {
      if (editId) {
        // Pass the correct state variables to the update thunk
       const result = await dispatch(updateOccupation({ id: editId, data: { occupationName, occupationType: occupationTypeId } }));
        if (result.meta.requestStatus === 'fulfilled') {
          setOccupationName("");
          setOccupationTypeId("");
          toast.success("Occupation updated successfully");
          dispatch(getAllOccupationTypes());
          dispatch(getAllOccupations());
        } else{
          toast.error("Failed to update occupation");
        }
      } else {
        // Pass the correct state variables to the create thunk
        const result =await dispatch(createOccupation({ occupationName, occupationType: occupationTypeId }));
        if( result.meta.requestStatus === 'fulfilled') {
          setOccupationName("");
          setOccupationTypeId("");
          dispatch(getAllOccupationTypes());
          dispatch(getAllOccupations());
        }
        toast.success("Occupation added successfully");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }

    setOccupationName("");
    setOccupationTypeId("");
    setEditId(null);
  };

  const handleEdit = (item) => {
    // Correctly set the state from the populated data
    setOccupationName(item.occupationName);
    setOccupationTypeId(item.occupationType?._id);
    setEditId(item._id);
  };


  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this occupation?")) {
      setLoading(true);
      try {
        const result = await dispatch(deleteOccupation(id));
        if (result.meta.requestStatus === 'fulfilled') {
          setOccupationName("");
          setOccupationTypeId("");
          toast.success("Occupation deleted successfully");
          dispatch(getAllOccupationTypes());
          dispatch(getAllOccupations());

        } else {
          toast.error("Failed to delete occupation");
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
      <h3 className="mb-4">Lead Occupation</h3>
      <Row>
        {/* Left Side - Add Lead Occupation */}
        <Col md={6}>
          <Card className="shadow-sm border-top border-primary">
            <Card.Body>
              <Card.Title>{editId ? "Edit" : "Add"} Lead Occupation</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="occupationTypeId">
                  <Form.Label>Lead Occupation Type</Form.Label>
                  <Form.Select
                    value={occupationTypeId}
                    onChange={(e) => setOccupationTypeId(e.target.value)}
                    required
                  >
                    <option value="">--Choose--</option>
                    {Array.isArray(alldetailsForTypes) && alldetailsForTypes.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.occupationType}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="occupationName">
                  <Form.Label>Occupation Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Name"
                    value={occupationName}
                    onChange={(e) => setOccupationName(e.target.value)}
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
                      setOccupationName("");
                      setOccupationTypeId("");
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

        {/* Right Side - All Lead Occupations */}
        <Col md={6}>
          <Card className="shadow-sm border-top border-success">
            <Card.Body>
              <Card.Title>All Lead Occupations</Card.Title>
              <ListGroup variant="flush">
                {Array.isArray(alldetails) &&
                  alldetails.map((item) => (
                    <ListGroup.Item
                      key={item._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {/* Display the populated occupationType name */}
                      <div>
                        {item.occupationName}
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="me-2"
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

export default LeadOccupation;
