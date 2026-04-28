const IncomeExpense = require("../Models/IncomeExpenseModel");

/* =========================
   CREATE
========================= */
exports.createTransaction = async (req, res) => {
  try {
    if (req.file) {
      req.body.bill = req.file.path;
    }
    const data = await IncomeExpense.create(req.body);

    const populated = await IncomeExpense.findById(data._id)
      .populate({
        path: "accountRef",
        populate: ["headRef", "subHeadRef"],
      })
      .populate("bankRef", "bankName");

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   GET ALL WITH FILTERS
========================= */
exports.getTransactions = async (req, res) => {
  try {
    const { type, bankRef, accountRef, fromDate, toDate } = req.query;

    let filter = { isActive: true };

    if (type) filter.type = type;
    if (bankRef) filter.bankRef = bankRef;
    if (accountRef) filter.accountRef = accountRef;

    /* ⭐ DATE FILTER FIX */
    if (fromDate || toDate) {
      filter.transactionDate = {};

      if (fromDate) {
        filter.transactionDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.transactionDate.$lte = end;
      }
    }
    const data = await IncomeExpense.find(filter)
      .populate({
        path: "accountRef",
        populate: ["headRef", "subHeadRef"],
      })
      .populate("bankRef", "bankName")
      .sort({ transactionDate: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET BY ID
========================= */
exports.getTransactionById = async (req, res) => {
  try {
    const data = await IncomeExpense.findById(req.params.id)
      .populate({
        path: "accountRef",
        populate: ["headRef", "subHeadRef"],
      })
      .populate("bankRef", "bankName");

    if (!data) return res.status(404).json({ message: "Not found" });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE
========================= */
exports.updateTransaction = async (req, res) => {
  try {
    if (req.file) {
      req.body.bill = req.file.path;
    }
    const updated = await IncomeExpense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate({
        path: "accountRef",
        populate: ["headRef", "subHeadRef"],
      })
      .populate("bankRef", "bankName");

    if (!updated) return res.status(404).json({ message: "Not found" });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   SOFT DELETE
========================= */
exports.deleteTransaction = async (req, res) => {
  try {
    await IncomeExpense.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   BALANCE SUMMARY
========================= */
exports.getBalanceSummary = async (req, res) => {
  try {
    const data = await IncomeExpense.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    data.forEach((d) => {
      if (d._id === "income") income = d.total;
      if (d._id === "expense") expense = d.total;
    });

    res.json({
      income,
      expense,
      balance: income - expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   BANK WISE SUMMARY
========================= */
exports.getBankSummary = async (req, res) => {
  try {
    const data = await IncomeExpense.aggregate([
      { $match: { isActive: true, bankRef: { $ne: null } } },
      {
        $group: {
          _id: { bank: "$bankRef", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};