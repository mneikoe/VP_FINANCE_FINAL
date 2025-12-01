import React, { useState } from "react";

const LeadsTableLayout = ({ title, data, columns }) => {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(1);

  // search filter 
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  // pagination
  const startIndex = (page - 1) * entries;
  const paginatedData = filteredData.slice(startIndex, startIndex + entries);

  const totalPages = Math.ceil(filteredData.length / entries);

  return (
    <div className="table-container">
      <h2 className="table-title">{title}</h2>

      <div className="table-header">
        <div>
          Show{" "}
          <select
            value={entries}
            onChange={(e) => {
              setEntries(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>{" "}
          entries
        </div>
        <div>
          Search:{" "}
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <table className="task-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col, ci) => (
                  <td key={ci}>{row[col.key] || "-"}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                No data available in table
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          {page} of {totalPages || 1}
        </span>
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* ---- CSS ---- */}
      <style jsx>{`
        .table-container {
          background: #fff;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-top: 20px;
        }
        .table-title {
          margin-bottom: 10px;
          font-size: 16px;
          color: #333;
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .task-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .task-table th,
        .task-table td {
          border: 1px solid #ddd;
          padding: 6px;
          text-align: left;
        }
        .task-table th {
          background: #f0f2f5;
        }
        .pagination {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          font-size: 13px;
        }
        .pagination button {
          padding: 4px 8px;
          font-size: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          background: #f8f9fa;
        }
        .pagination button:disabled {
          color: #999;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default LeadsTableLayout;