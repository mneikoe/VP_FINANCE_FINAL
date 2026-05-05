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
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get("mode") === "view";

  const products = useSelector(
    (state) => state.financialProduct.FinancialProducts
  );

  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  // Redux se data load
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

  const handleEdit = ({ id }) => {
    setName(id.name);
    setEditId(id._id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure want to delete?")) {
      dispatch(deleteFinancialProduct(id));
    }
  };

  return (
    <div className="container mt-3">
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <h4 className="mb-1 fw-bold text-dark">
            {isViewMode ? "Financial Product List" : "Financial Product Master"}
          </h4>
          <p className="mb-0 text-muted" style={{ fontSize: "0.88rem" }}>
            {isViewMode 
              ? "View and browse product names used across office workflows." 
              : "Maintain product names used across office, department, and document workflows."}
          </p>
        </div>
      </div>
      
      <div className="row">
        {/* Form Section - Hidden in View Mode */}
        {!isViewMode && (
          <div className="col-12 col-lg-6 mb-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h2 className="h5 text-center mb-4">
                  {editId ? "Update" : "Add"} Financial Product
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Name"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {editId ? "Update" : "Add"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className={`col-12 ${isViewMode ? "col-lg-12" : "col-lg-6"} mb-4`}>
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h2 className="h5 mb-4">Product Inventory</h2>
              <ul className="list-group">
                {Array.isArray(products) &&
                  products.map((product) => (
                    <li
                      key={product._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{product.name}</span>
                      {!isViewMode && (
                        <div>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit({ id: product })}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(product._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialProduct;

