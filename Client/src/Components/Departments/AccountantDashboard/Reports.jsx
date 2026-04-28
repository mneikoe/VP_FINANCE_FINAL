import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../../config/axios";
import { fetchBanks } from "../../../redux/feature/BankRedux/BankThunx";
import { IndianRupee, TrendingUp, TrendingDown, Landmark } from "lucide-react";

const Reports = () => {
  const dispatch = useDispatch();
  const { banks = [] } = useSelector((s) => s.bank);

  const activeBanks = banks.filter((b) => b.isActive);

  const [balance, setBalance] = useState(null);
  const [bankId, setBankId] = useState("");
  const [ledger, setLedger] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBanks());
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await axios.get("/api/IncomeExpenseReport/balance-sheet");
      setBalance(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadLedger = async () => {
    if (!bankId) return alert("Select bank");

    try {
      setLedgerLoading(true);
      const res = await axios.get(`/api/IncomeExpenseReport/bank-ledger`, {
        params: { bankId, fromDate, toDate },
      });
      setLedger(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLedgerLoading(false);
    }
  };

  const exportExcel = () =>
    window.open("/api/IncomeExpenseReport/export-excel");

  const exportPDF = () =>
    window.open("/api/IncomeExpenseReport/export-pdf");

  const exportBankLedgerPdf = () => {
    if (!bankId) return alert("Select bank");
    window.open(
      `/api/IncomeExpenseReport/bank-ledger-pdf?bankId=${bankId}&fromDate=${fromDate}&toDate=${toDate}`
    );
  };

  const exportBankLedgerExcel = () => {
    if (!bankId) return alert("Select bank");
    window.open(
      `/api/IncomeExpenseReport/bank-ledger-excel?bankId=${bankId}&fromDate=${fromDate}&toDate=${toDate}`
    );
  };

  return (
    <div className="p-6 space-y-6 bg-slate-100 min-h-screen">
      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card
          title="Total Income"
          amount={balance?.totalIncome}
          icon={<TrendingUp />}
          color="from-green-500 to-emerald-600"
        />
        <Card
          title="Total Expense"
          amount={balance?.totalExpense}
          icon={<TrendingDown />}
          color="from-red-500 to-pink-600"
        />
        <Card
          title="Net Balance"
          amount={balance?.net}
          icon={<IndianRupee />}
          color="from-indigo-500 to-blue-600"
        />
      </div>

      {/* EXPORT */}
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm shadow transition active:scale-95" onClick={exportExcel}>
          Export Excel
        </button>
        <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm shadow transition active:scale-95" onClick={exportPDF}>
          Export PDF
        </button>
      </div>

      {/* BANK LEDGER */}
      <div className="bg-white p-6 shadow-xl rounded-2xl space-y-5 border">
        <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-700">
          <Landmark size={18} /> Bank Ledger
        </h2>

        {/* FILTER */}
        <div className="flex gap-3 flex-wrap items-center bg-slate-50 p-4 rounded-xl border">
          <select
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-400 outline-none min-w-[200px]"
          >
            <option value="">Select Bank</option>
            {activeBanks.map((b) => (
              <option key={b._id} value={b._id}>
                {b.bankName}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <button
            onClick={loadLedger}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm shadow transition active:scale-95"
          >
            View
          </button>
          <button
            onClick={exportBankLedgerPdf}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm shadow transition active:scale-95"
          >
            PDF
          </button>
          <button
            onClick={exportBankLedgerExcel}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm shadow transition active:scale-95"
          >
            Excel
          </button>
        </div>

        {/* TABLE */}
        {ledgerLoading ? (
          <p className="text-slate-500">Loading ledger...</p>
        ) : (
          <div className="overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-600">Date</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Head</th>
                  <th className="text-left p-3 font-semibold text-slate-600">SubHead</th>
                  <th className="text-left p-3 font-semibold text-green-600">Credit</th>
                  <th className="text-left p-3 font-semibold text-red-600">Debit</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Balance</th>
                </tr>
              </thead>

              <tbody>
                {ledger.map((l, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50 transition">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(l.transactionDate).toLocaleDateString()}
                    </td>

                    <td className="p-3 font-medium text-slate-700 whitespace-nowrap">
                      {l.head}
                    </td>

                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {l.subHead}
                    </td>

                    <td className="p-3 text-green-600 font-medium whitespace-nowrap">
                      {l.type === "income" ? `₹ ${l.amount}` : "-"}
                    </td>

                    <td className="p-3 text-red-600 font-medium whitespace-nowrap">
                      {l.type === "expense" ? `₹ ${l.amount}` : "-"}
                    </td>

                    <td className="p-3 font-semibold text-indigo-600 whitespace-nowrap">
                      ₹ {l.runningBalance ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, amount, icon, color }) => (
  <div className={`bg-gradient-to-br ${color} text-white p-5 rounded-xl shadow-lg`}>
    <div className="flex justify-between items-center">
      <p className="opacity-90">{title}</p>
      {icon}
    </div>
    <h2 className="text-2xl font-bold mt-2">₹ {amount || 0}</h2>
  </div>
);

export default Reports;