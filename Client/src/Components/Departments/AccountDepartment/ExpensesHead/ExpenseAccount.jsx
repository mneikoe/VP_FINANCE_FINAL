import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createIncomeExpenseAccount,
  fetchIncomeExpenseAccounts,
  updateIncomeExpenseAccount,
  deleteIncomeExpenseAccount,
  deleteIncomeExpenseAccountPermanent,
} from "../../../../redux/feature/IncomeExpense/incomeExpenseAccountThunk";

const ExpenseAccount = () => {
  const dispatch = useDispatch();
  const { accounts, loading } = useSelector(
    (state) => state.incomeExpenseAccount
  );

  const [head, setHead] = useState("");
  const [subHead, setSubHead] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(fetchIncomeExpenseAccounts({ type: "expense" }));
  }, [dispatch]);

  const handleToggleActive = (acc) => {
    dispatch(
      updateIncomeExpenseAccount({
        id: acc._id,
        data: { isActive: !acc.isActive },
      })
    );
  };

  const handlePermanentDelete = async (id) => {
    const confirmDelete = window.confirm("Permanently delete?");
    if (!confirmDelete) return;

    const result = await dispatch(deleteIncomeExpenseAccountPermanent(id));

    if (deleteIncomeExpenseAccountPermanent.rejected.match(result)) {
      alert(result.payload?.message || "Cannot delete account");
    }
  };

  const handleSave = () => {
    if (!head) return alert("Enter expense head");

    if (editId) {
      dispatch(
        updateIncomeExpenseAccount({
          id: editId,
          data: { headCustom: head, subHeadCustom: subHead },
        })
      );
      setEditId(null);
    } else {
      dispatch(
        createIncomeExpenseAccount({
          type: "expense",
          headCustom: head,
          subHeadCustom: subHead,
        })
      );
    }

    setHead("");
    setSubHead("");
  };

  const handleEdit = (acc) => {
    setHead(acc.headCustom);
    setSubHead(acc.subHeadCustom);
    setEditId(acc._id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this expense head?")) {
      dispatch(deleteIncomeExpenseAccount(id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-500 text-white p-5 rounded-xl shadow-md mb-6">
        <h2 className="text-2xl font-bold">Expense Head Management</h2>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 flex gap-4 items-end">
        <input
          className="flex-1 border rounded-lg p-2"
          placeholder="Expense Head"
          value={head}
          onChange={(e) => setHead(e.target.value)}
        />

        <input
          className="flex-1 border rounded-lg p-2"
          placeholder="Sub Head"
          value={subHead}
          onChange={(e) => setSubHead(e.target.value)}
        />

        <button
          onClick={handleSave}
          className={`px-6 py-2 rounded text-white ${editId ? "bg-yellow-500" : "bg-red-500"
            }`}
        >
          {editId ? "Update" : "Save"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-5">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Head</th>
                <th className="p-2 text-left">SubHead</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {accounts.map((acc) => (
                <tr key={acc._id} className="border-t">
                  <td className="p-2">{acc.headCustom}</td>
                  <td className="p-2">{acc.subHeadCustom || "-"}</td>

                  {/* Status */}
                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded ${acc.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {acc.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-2 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(acc)}
                      className="px-3 py-1 text-xs bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>


                    {/* Enable / Disable toggle */}
                    <button
                      onClick={() => handleToggleActive(acc)}
                      className={`px-3 py-1 text-xs text-white rounded ${acc.isActive ? "bg-gray-500" : "bg-green-500"
                        }`}
                    >
                      {acc.isActive ? "Disable" : "Enable"}
                    </button>

                    {/* Permanent delete */}
                    <button
                      onClick={() => handlePermanentDelete(acc._id)}
                      className="px-3 py-1 text-xs bg-red-700 text-white rounded"
                    >
                      Delete Forever
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExpenseAccount;