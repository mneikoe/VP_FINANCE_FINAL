import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createIncomeExpenseAccount,
  fetchIncomeExpenseAccounts,
  updateIncomeExpenseAccount,
  deleteIncomeExpenseAccount,
  deleteIncomeExpenseAccountPermanent,
} from "../../../../redux/feature/IncomeExpense/incomeExpenseAccountThunk";
import { fetchCompanyName } from "../../../../redux/feature/ComapnyName/CompanyThunx";
import { fetchFinancialProduct } from "../../../../redux/feature/FinancialProduct/FinancialThunx";

const IncomeAccount = () => {
  const dispatch = useDispatch();

  const { accounts, loading } = useSelector(
    (state) => state.incomeExpenseAccount
  );
  const { FinancialProducts } = useSelector((state) => state.financialProduct);
  const { CompanyNames } = useSelector((state) => state.CompanyName);

  const [useStructured, setUseStructured] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [customHead, setCustomHead] = useState("");
  const [customSubHead, setCustomSubHead] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(fetchIncomeExpenseAccounts({ type: "income" }));
    dispatch(fetchFinancialProduct());
    dispatch(fetchCompanyName());
  }, [dispatch]);

  const incomeAccounts = accounts;

  const filteredCompanies = CompanyNames.filter(
    (c) =>
      String(c.financialProduct?._id || c.financialProduct) ===
      String(selectedProduct)
  );

  const resetForm = () => {
    setSelectedProduct("");
    setSelectedCompany("");
    setCustomHead("");
    setCustomSubHead("");
    setEditId(null);
  };

  const handleSave = () => {
    if (useStructured) {
      if (!selectedProduct) return alert("Select financial product");

      const payload = {
        type: "income",
        headRef: selectedProduct,
        subHeadRef: selectedCompany || null,
      };

      editId
        ? dispatch(updateIncomeExpenseAccount({ id: editId, data: payload }))
        : dispatch(createIncomeExpenseAccount(payload));
    } else {
      if (!customHead) return alert("Enter custom head");

      const payload = {
        type: "income",
        headCustom: customHead,
        subHeadCustom: customSubHead,
      };

      editId
        ? dispatch(updateIncomeExpenseAccount({ id: editId, data: payload }))
        : dispatch(createIncomeExpenseAccount(payload));
    }

    resetForm();
  };

  const handleEdit = (acc) => {
    setEditId(acc._id);

    if (acc.headRef) {
      setUseStructured(true);
      setSelectedProduct(acc.headRef._id);
      setSelectedCompany(acc.subHeadRef?._id || "");
    } else {
      setUseStructured(false);
      setCustomHead(acc.headCustom);
      setCustomSubHead(acc.subHeadCustom);
    }
  };

  /* ⭐ single enable / disable */
  const handleToggleActive = (acc) => {
    dispatch(
      updateIncomeExpenseAccount({
        id: acc._id,
        data: { isActive: !acc.isActive },
      })
    );
  };

  /* hard delete (only when disabled recommended) */
  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;

    try {
      await dispatch(deleteIncomeExpenseAccountPermanent(id)).unwrap();
    } catch (err) {
      alert(err?.message || err || "Permanent delete failed");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-bold">Income Head Management</h2>
      </div>

      {/* Form */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        {/* Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-semibold text-gray-600">
            Want to use Financial product & Company?
          </span>

          <button
            onClick={() => setUseStructured(!useStructured)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${useStructured ? "bg-blue-500" : "bg-gray-300"
              }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow transform transition ${useStructured ? "translate-x-6" : ""
                }`}
            />
          </button>
        </div>

        {/* Structured */}
        {useStructured && (
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <select
              className="border rounded-lg p-2 w-full"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select Financial Product</option>
              {FinancialProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              className="border rounded-lg p-2 w-full"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              disabled={!selectedProduct}
            >
              <option value="">Select Company</option>
              {filteredCompanies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom */}
        {!useStructured && (
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              className="border rounded-lg p-2 w-full"
              placeholder="Custom Head"
              value={customHead}
              onChange={(e) => setCustomHead(e.target.value)}
            />
            <input
              className="border rounded-lg p-2 w-full"
              placeholder="Custom SubHead"
              value={customSubHead}
              onChange={(e) => setCustomSubHead(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={handleSave}
          className={`px-6 py-2 rounded-lg text-white font-semibold ${editId ? "bg-yellow-500" : "bg-blue-600"
            }`}
        >
          {editId ? "Update Account" : "Save Account"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Existing Income Accounts</h3>

        {loading ? (
          <p className="text-center py-6">Loading...</p>
        ) : incomeAccounts.length === 0 ? (
          <p className="text-center py-6 text-gray-400">No income accounts</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-3 text-left">Head</th>
                <th className="p-3 text-left">SubHead</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {incomeAccounts.map((acc) => (
                <tr key={acc._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {acc.headRef?.name || acc.headCustom}
                  </td>

                  <td className="p-3 text-gray-600">
                    {acc.subHeadRef?.companyName || acc.subHeadCustom || "-"}
                  </td>

                  {/* Status */}
                  <td className="p-3 text-center">
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
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(acc)}
                      className="px-3 py-1 text-xs bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>

                    {/* single enable / disable */}
                    <button
                      onClick={() => handleToggleActive(acc)}
                      className={`px-3 py-1 text-xs text-white rounded ${acc.isActive ? "bg-gray-600" : "bg-green-600"
                        }`}
                    >
                      {acc.isActive ? "Disable" : "Enable"}
                    </button>

                    {/* hard delete */}
                    <button
                      onClick={() => handlePermanentDelete(acc._id)}
                      disabled={acc.isActive}
                      className={`px-3 py-1 text-xs text-white rounded ${acc.isActive
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-red-600"
                        }`}
                    >
                      Delete
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

export default IncomeAccount;