import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
// } from "../../../redux/feature/"; // apna path lagao
import {
  //  fetchFinancialProduct,
  deleteFinancialProduct,
  createFinancialProduct,
  updateFinancialProduct,
  fetchFinancialProduct,
} from "../../../redux/feature/FinancialProduct/FinancialThunx";
import { FaEdit, FaTrash } from "react-icons/fa";

const FinancialProduct = () => {
  const dispatch = useDispatch();
  // const products = useSelector((state) => state.financialProduct
  // ); // redux reducer se data

  const products = useSelector(
    (state) => state.financialProduct.FinancialProducts
  );

  console.log(products, "ldkjfsf");

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
      console.log(id, "Sjksjs");

      dispatch(deleteFinancialProduct(id));
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Form Section */}
        <div className="col-12 col-lg-6 mb-4">
          <div className="card shadow-sm border">
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

        {/* List Section */}
        <div className="col-12 col-lg-6 mb-4">
          <div className="card shadow-sm border">
            <div className="card-body">
              <h2 className="h5 mb-4">Financial Product List</h2>
              <ul className="list-group">
                {Array.isArray(products) &&
                  products.map((product) => (
                    <li
                      key={product._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{product.name}</span>
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
