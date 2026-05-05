import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  deleteFinancialProduct,
  createFinancialProduct,
  updateFinancialProduct,
  fetchFinancialProduct,
} from "../../../redux/feature/FinancialProduct/FinancialThunx";
import { FaEdit, FaTrash } from "react-icons/fa";

const FinancialProduct = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("mode") === "view" ? "view" : "master";

  const products = useSelector(
    (state) => state.financialProduct.FinancialProducts
  );

  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(fetchFinancialProduct(products));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await dispatch(updateFinancialProduct({ editId, name }));
      } else {
        await dispatch(createFinancialProduct(name));
      }
      setName("");
      setEditId(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (product) => {
    setName(product.name);
    setEditId(product._id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      dispatch(deleteFinancialProduct(id));
    }
  };

  return (
    <div className="container mt-3">
      {/* Minimal Header & Tabs */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="fw-bold text-dark mb-0">Financial Products</h4>
        <div className="nav nav-pills small">
          <button
            className={`nav-link py-1 px-3 ${activeTab === "master" ? "active" : ""}`}
            onClick={() => setSearchParams({ mode: "master" })}
          >
            Add / Edit
          </button>
          <button
            className={`nav-link py-1 px-3 ${activeTab === "view" ? "active" : ""}`}
            onClick={() => setSearchParams({ mode: "view" })}
          >
            View List
          </button>
        </div>
      </div>

      <div className="row g-3">
        {activeTab === "master" && (
          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-3">
                <h6 className="fw-bold mb-3">{editId ? "Edit Product" : "Add Product"}</h6>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Product Name"
                      required
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-sm btn-primary px-3">
                      {editId ? "Update" : "Save"}
                    </button>
                    {editId && (
                      <button
                        type="button"
                        className="btn btn-sm btn-light border"
                        onClick={() => { setEditId(null); setName(""); }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={activeTab === "master" ? "col-md-8" : "col-12"}>
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3 py-2">#</th>
                      <th className="py-2">Product Name</th>
                      {activeTab === "master" && <th className="text-end pe-3 py-2">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(products) && products.length > 0 ? (
                      products.map((product, idx) => (
                        <tr key={product._id}>
                          <td className="ps-3 py-2 text-muted">{idx + 1}</td>
                          <td className="py-2">{product.name}</td>
                          {activeTab === "master" && (
                            <td className="text-end pe-3 py-2">
                              <button
                                className="btn btn-link btn-sm p-0 me-2 text-primary"
                                onClick={() => handleEdit(product)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-link btn-sm p-0 text-danger"
                                onClick={() => handleDelete(product._id)}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted small">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialProduct;

