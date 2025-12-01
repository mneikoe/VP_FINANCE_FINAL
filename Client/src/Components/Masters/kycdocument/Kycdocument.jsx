
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchKycDocuments,
  createKycDocument,
  updateKycDocument,
  deleteKycDocument,
} from "../../../redux/feature/kycdocument/documentthunx";

// ✅ List Component (same file me banaya)
function KycDocumentList({ setDocName, setEditId }) {
  const dispatch = useDispatch();
  const { documents, loading, error } = useSelector((state) => state.kycdoc);

  const handleEdit = (doc) => {
    setDocName(doc.name);
    setEditId(doc._id);
  };

  const handleDelete = (id) => {
    dispatch(deleteKycDocument(id));
  };

  return (
    <div className="list-container">
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {documents.map((doc) => (
          <li key={doc._id}>
            {doc.name}
            <div>
              <button onClick={() => handleEdit(doc)}>Edit</button>
              <button onClick={() => handleDelete(doc._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .list-container {
          margin-top: 20px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          padding: 10px;
          background: #fff;
          border: 1px solid #ddd;
          margin-bottom: 10px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        button {
          padding: 6px 10px;
          margin-left: 5px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }
        button:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
}

// ✅ Main Component
function Kycdocument() {
  const [docName, setDocName] = useState("");
  const [editId, setEditId] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchKycDocuments());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateKycDocument({ id: editId, updatedData: { name: docName } }));
      setEditId(null);
    } else {
      dispatch(createKycDocument({ name: docName }));
    }
    setDocName("");
  };

  return (
    <div className="form-container">
      <h2>KYC Document Names</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          placeholder="Enter document name"
          required
        />
        <button type="submit">{editId ? "Update" : "Submit"}</button>
      </form>

      {/* List Component Call */}
      <KycDocumentList setDocName={setDocName} setEditId={setEditId} />

      <style jsx>{`
        .form-container {
          max-width: 400px;
          margin: 50px auto;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        h2 {
          text-align: center;
          color: #333;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
        }
        button {
          padding: 8px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
}

export default Kycdocument;
