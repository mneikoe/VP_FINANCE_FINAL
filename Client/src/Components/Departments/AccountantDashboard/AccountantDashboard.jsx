import React, { useEffect, useState } from "react";
import axios from "../../../config/axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanks } from "../../../redux/feature/BankRedux/BankThunx";
import { TrendingUp, TrendingDown, IndianRupee, Landmark } from "lucide-react";

const AccountantDashboard = () => {
  const dispatch = useDispatch();
  const { banks = [] } = useSelector((s) => s.bank);

  const activeBanks = banks.filter((b) => b.isActive);

  const [summary, setSummary] = useState({});

  useEffect(() => {
    dispatch(fetchBanks());
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await axios.get("/api/IncomeExpenseReport/balance-sheet");
      setSummary(res.data || {});
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card title="Total Income" amount={summary.totalIncome} icon={<TrendingUp />} color="from-green-500 to-emerald-600" />
        <Card title="Total Expense" amount={summary.totalExpense} icon={<TrendingDown />} color="from-red-500 to-pink-600" />
        <Card title="Net Balance" amount={summary.net} icon={<IndianRupee />} color="from-indigo-500 to-blue-600" />
        <Card title="Active Banks" amount={activeBanks.length} icon={<Landmark />} color="from-yellow-500 to-orange-500" />
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border">
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Accountant Overview</h2>
        <p className="text-sm text-slate-500">
          Monitor income, expenses and bank balances from one place.
        </p>
      </div>
    </div>
  );
};

const Card = ({ title, amount, icon, color }) => (
  <div className={`bg-gradient-to-br ${color} text-white p-5 rounded-xl shadow-lg`}>
    <div className="flex justify-between items-center">
      <p className="opacity-90 text-sm">{title}</p>
      {icon}
    </div>
    <h2 className="text-2xl font-bold mt-2">₹ {amount || 0}</h2>
  </div>
);

export default AccountantDashboard;