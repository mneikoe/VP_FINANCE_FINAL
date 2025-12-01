import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  createOfficePurchase,
  fetchOfficePurchaseByID,
  updateOfficePurchase,
} from "../../../redux/feature/OfficePurchase/PurchaseThunx";
import { clearCurrent } from "../../../redux/feature/OfficePurchase/PurchaseSlice";
// import {
//   createOfficePurchase,
//   fetchOfficePurchaseByID,
//   updateOfficePurchase,
// } from "../../redux/features/officePurchase/officePurchaseThunks";
// import { clearCurrent } from "../../redux/features/officePurchase/officePurchaseSlice";

function AddOfficePurchase({ setActiveTab, editId, setEditId }) {
  const dispatch = useDispatch();
  const { current, loading } = useSelector((state) => state.officePurchase);

  const [formData, setFormData] = useState({
    vrNo: "",
    invoiceNo: "",
    date: "",
    headOfACs: "",
    itemParticulars: "",
    firmName: "",
    ratePerUnit: "",
    quantity: "",
    amount: "",
  });

  // Fetch and populate form for editing
  useEffect(() => {
    if (editId) dispatch(fetchOfficePurchaseByID(editId));
  }, [dispatch, editId]);

  useEffect(() => {
    if (current && editId) {
      setFormData({
        ...current,
        date: current.date?.substring(0, 10),
      });
    }
  }, [current, editId]);

  const calculateAmount = () => {
    const rate = parseFloat(formData.ratePerUnit);
    const qty = parseFloat(formData.quantity);
    return !isNaN(rate) && !isNaN(qty) ? (rate * qty).toFixed(2) : "";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: calculateAmount(),
    };

    try {
      if (editId) {
        await dispatch(
          updateOfficePurchase({ id: editId, data: payload })
        ).unwrap();
      } else {
        await dispatch(createOfficePurchase(payload)).unwrap();
      }

      dispatch(clearCurrent());
      setEditId(null);
      setActiveTab("view");
    } catch (err) {
      console.error("Failed to save office purchase:", err);
    }

    setFormData({
      vrNo: "",
      invoiceNo: "",
      date: "",
      headOfACs: "",
      itemParticulars: "",
      firmName: "",
      ratePerUnit: "",
      quantity: "",
      amount: "",
    });
  };

  return (
    <Card className="p-3 mt-3">
      <Form onSubmit={handleSubmit}>
        <Row>
          {[
            { label: "Vr No.", name: "vrNo" },
            { label: "Invoice No.", name: "invoiceNo" },
            { label: "Date", name: "date", type: "date" },
            { label: "Head of A/Cs", name: "headOfACs" },
            { label: "Item Particulars", name: "itemParticulars" },
            { label: "Name of Firm or Company", name: "firmName" },
            { label: "Rates per Unit", name: "ratePerUnit", type: "number" },
            { label: "Quantity", name: "quantity", type: "number" },
          ].map(({ label, name, type = "text" }, idx) => (
            <Col md={idx > 4 ? 3 : 4} key={name}>
              <Form.Group controlId={name}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          ))}

          <Col md={4}>
            <Form.Group controlId="amount">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" value={calculateAmount()} readOnly />
            </Form.Group>
          </Col>
        </Row>

        <Button
          className="mt-3"
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {editId ? "Update" : "Save"}
        </Button>
      </Form>
    </Card>
  );
}

export default AddOfficePurchase;
