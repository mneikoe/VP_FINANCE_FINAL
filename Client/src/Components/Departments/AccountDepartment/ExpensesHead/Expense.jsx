import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  addEntry,
  getEntries,
  editEntry,
  removeEntry,
} from "../../../../redux/feature/IncomeExpense/incomeExpenseEntryThunk";

import { fetchIncomeExpenseDropdown } from "../../../../redux/feature/IncomeExpense/incomeExpenseAccountThunk";
import { fetchBanks } from "../../../../redux/feature/BankRedux/BankThunx";

const Expense = () => {
  const dispatch = useDispatch();

  const { entryList, loading } = useSelector((s) => s.accountEntry);
  const { dropdownAccounts } = useSelector((s) => s.incomeExpenseAccount);
  const { banks } = useSelector((s) => s.bank);
  const [billFile, setBillFile] = useState(null);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    accountRef: "",
    bankRef: "",
    amount: "",
    transactionDate: "",
    description: "",
  });

  const [filters, setFilters] = useState({
    bank: "",
    from: "",
    to: "",
  });

  const [descModal, setDescModal] = useState({
    open: false,
    desc: "",
    bill: "",
  });

  /* ⭐ dropdowns once */
  useEffect(() => {
    dispatch(fetchIncomeExpenseDropdown("expense"));
    dispatch(fetchBanks());
  }, [dispatch]);

  /* ⭐ refetch entries on filter change */
  useEffect(() => {
    dispatch(
      getEntries({
        type: "expense",
        bankRef: filters.bank,
        fromDate: filters.from,
        toDate: filters.to,
      })
    );
  }, [filters, dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const clearFilters = () =>
    setFilters({ bank: "", from: "", to: "" });

  const selectedBank = useMemo(
    () => banks?.find((b) => b._id === form.bankRef),
    [banks, form.bankRef]
  );

  const clearSelectedBank = () =>
    setForm((p) => ({ ...p, bankRef: "" }));

  const resetForm = () => {
    setForm((prev) => ({
      accountRef: "",
      amount: "",
      transactionDate: "",
      description: "",
      bankRef: prev.bankRef,   // ⭐ preserve bank
    }));
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!form.accountRef || !form.amount || !form.transactionDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();

    formData.append("type", "expense");
    formData.append("accountRef", form.accountRef);
    formData.append("bankRef", form.bankRef || "");
    formData.append("amount", form.amount);
    formData.append("transactionDate", form.transactionDate);
    formData.append("description", form.description || "");

    if (billFile) {
      formData.append("bill", billFile);
    }

    try {
      if (editId) {
        await dispatch(editEntry({ id: editId, data: formData })).unwrap();
        toast.success("Expense updated successfully");
      } else {
        await dispatch(addEntry(formData)).unwrap();
        toast.success("Expense added successfully");
      }

      resetForm();
      setBillFile(null);
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setForm({
      accountRef: row.accountRef?._id || "",
      bankRef: row.bankRef?._id || "",
      amount: row.amount,
      transactionDate: row.transactionDate?.slice(0, 10),
      description: row.description || "",
    });
  };

  const total = entryList?.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  return (
    <div className="p-4">
      <h4 className="mb-4">Expense Entry</h4>

      {/* ENTRY */}
      <div className="card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-2">
            <select
              name="bankRef"
              value={form.bankRef}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Bank</option>
              {banks?.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bankName}
                </option>
              ))}
            </select>

            {selectedBank && (
              <div className="mt-1 d-flex gap-2">
                <span className="badge bg-danger">{selectedBank.bankName}</span>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={clearSelectedBank}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="col-md-3">
            <select
              name="accountRef"
              value={form.accountRef}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Expense Account</option>
              {dropdownAccounts?.map((a) => (
                <option key={a._id} value={a._id}>
                  {(a.headRef?.name || a.headCustom) +
                    " - " +
                    (a.subHeadRef?.companyName || a.subHeadCustom || "")}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Amount"
              className="form-control"
            />
          </div>

          <div className="col-md-2">
            <input
              type="date"
              name="transactionDate"
              value={form.transactionDate}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <input
              type="file"
              className="form-control"
              onChange={(e) => setBillFile(e.target.files[0])}
            />
          </div>

          <div className="col-md-2">
            <button onClick={handleSubmit} className="btn btn-primary w-100">
              {editId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
      <hr />

      <div className="text-center text-red-300"><h1>Expenses</h1></div>

      {/* FILTER */}
      <div className="card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-3">
            <select
              name="bank"
              value={filters.bank}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Banks</option>
              {banks?.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bankName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>

          <div className="col-md-2">
            <button onClick={clearFilters} className="btn btn-secondary w-100">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th width="100">Date</th>
            <th>Expense Head</th>
            <th>Sub Head</th>
            <th>Transaction Type</th>
            <th>Amount</th>
            <th width="120">Description</th>
            <th width="120">Action</th>
          </tr>
        </thead>

        <tbody>
          {entryList?.map((t) => (
            <tr key={t._id}>
              <td>{t.transactionDate?.slice(0, 10)}</td>
              <td>
                {(t.accountRef?.headRef?.name || t.accountRef?.headCustom)}
              </td>
              <td>{(t.accountRef?.subHeadRef?.companyName ||
                t.accountRef?.subHeadCustom ||
                "")}</td>
              <td>{t.bankRef?.bankName || "Cash"}</td>
              <td>{t.amount}</td>

              <td>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() =>
                    setDescModal({
                      open: true,
                      desc: t.description,
                      bill: t.bill || "",
                    })
                  }
                >
                  View
                </button>
              </td>

              <td>
                <button
                  className="btn btn-sm btn-warning me-1"
                  onClick={() => handleEdit(t)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => dispatch(removeEntry(t._id))}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <th colSpan="3" className="text-end">
              Total
            </th>
            <th className="text-danger">₹ {total}</th>
            <th />
            <th />
          </tr>
        </tfoot>
      </table>

      {descModal.open && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Description</h5>
                <button
                  className="btn-close"
                  onClick={() => setDescModal({ open: false })}
                />
              </div>

              <div className="modal-body">
                <p>{descModal.desc || "-"}</p>

                {descModal.bill && (
                  <div>
                    <strong>Bill:</strong>{" "}
                    <a href={descModal.bill} target="_blank" rel="noreferrer">
                      View Bill
                    </a>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDescModal({ open: false })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Expense;