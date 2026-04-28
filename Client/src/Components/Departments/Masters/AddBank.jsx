import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchBanks,
  createBank,
  updateBank,
  deleteBank,
  toggleBank,
} from "../../../redux/feature/BankRedux/BankThunx";

const AddBank = () => {
  const dispatch = useDispatch();
  const { banks, loading } = useSelector((state) => state.bank);

  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
    ifsc: "",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchBanks());
  }, [dispatch]);

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ================= CLOSE ================= */
  const handleClose = () => {
    setShow(false);
    setEditId(null);
    setForm({ bankName: "", accountNumber: "", ifsc: "" });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!form.bankName) {
      alert("please fill mode of transaction");
      return;
    }

    if (editId) {
      await dispatch(updateBank({ id: editId, data: form }));
    } else {
      await dispatch(createBank(form));
    }

    handleClose();
  };

  /* ================= EDIT ================= */
  const handleEdit = (bank) => {
    setForm({
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      ifsc: bank.ifsc,
    });

    setEditId(bank._id);
    setShow(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete bank?")) return;

    const result = await dispatch(deleteBank(id));

    if (deleteBank.rejected.match(result)) {
      alert(result.payload?.message || "Cannot delete bank");
    }
  };

  /* ================= TOGGLE ================= */
  const toggleStatus = (id) => {
    dispatch(toggleBank(id));
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between mb-3">
        <h5>Transaction Master</h5>
        <Button onClick={() => setShow(true)}>+ Add Mode Of Transaction</Button>
      </div>

      <Table bordered hover responsive className="align-middle shadow-sm">
        <thead className="table-dark text-center">
          <tr>
            <th style={{ width: "30%" }}>Transaction / Bank</th>
            <th style={{ width: "20%" }}>Account No</th>
            <th style={{ width: "20%" }}>IFSC</th>
            <th style={{ width: "15%" }}>Status</th>
            <th style={{ width: "15%" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {banks?.map((b) => (
            <tr key={b._id} className="text-center">
              <td className="fw-semibold">{b.bankName}</td>

              <td>
                {b.accountNumber ? (
                  <span className="text-dark">{b.accountNumber}</span>
                ) : (
                  <span className="text-muted fst-italic">Not Applicable</span>
                )}
              </td>

              <td>
                {b.ifsc ? (
                  <span className="text-dark">{b.ifsc}</span>
                ) : (
                  <span className="text-muted fst-italic">Not Applicable</span>
                )}
              </td>

              <td>
                <Button
                  size="sm"
                  variant={b.isActive ? "success" : "secondary"}
                  onClick={() => toggleStatus(b._id)}
                >
                  {b.isActive ? "Active" : "Inactive"}
                </Button>
              </td>

              <td>
                <div className="d-flex justify-content-center gap-2">
                  <Button size="sm" variant="primary" onClick={() => handleEdit(b)}>
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(b._id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}

          {!banks?.length && !loading && (
            <tr>
              <td colSpan="5" className="text-center py-4 text-muted">
                No transaction mode added
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* ================= MODAL ================= */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Bank" : "Add Bank"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Transaction / Bank Name</Form.Label>
            <Form.Control
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Checkbox */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Is this a Bank?"
              name="isBank"
              checked={form.isBank}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Conditional Fields */}
          {form.isBank && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Account Number</Form.Label>
                <Form.Control
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>IFSC</Form.Label>
                <Form.Control
                  name="ifsc"
                  value={form.ifsc}
                  onChange={handleChange}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleSubmit}>{editId ? "Update" : "Save"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddBank;