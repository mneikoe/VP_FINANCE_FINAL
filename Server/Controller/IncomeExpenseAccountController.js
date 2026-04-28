const IncomeExpenseAccount = require("../Models/IncomeExpenseAccountModel");
const IncomeExpense = require("../Models/IncomeExpenseModel");
/* =========================
   CREATE
========================= */
exports.createAccount = async (req, res) => {
  try {
    const account = await IncomeExpenseAccount.create(req.body);

    const populated = await IncomeExpenseAccount.findById(account._id)
      .populate("headRef", "name")
      .populate("subHeadRef", "companyName");

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   GET ALL (FILTER + POPULATE)
========================= */
exports.getAccounts = async (req, res) => {
  try {
    const { type, headRef, isActive, search } = req.query;

    let filter = {};

    if (type) filter.type = type;
    if (headRef) filter.headRef = headRef;

    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    if (search) {
      filter.$or = [
        { headCustom: { $regex: search, $options: "i" } },
        { subHeadCustom: { $regex: search, $options: "i" } },
      ];
    }

    const data = await IncomeExpenseAccount.find(filter)
      .populate("headRef", "name")
      .populate("subHeadRef", "companyName")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET BY ID
========================= */
exports.getAccountById = async (req, res) => {
  try {
    const data = await IncomeExpenseAccount.findById(req.params.id)
      .populate("headRef", "name")
      .populate("subHeadRef", "companyName");

    if (!data) return res.status(404).json({ message: "Not found" });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE
========================= */
exports.updateAccount = async (req, res) => {
  try {
    const updated = await IncomeExpenseAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("headRef", "name")
      .populate("subHeadRef", "companyName");

    if (!updated) return res.status(404).json({ message: "Not found" });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   disable  (FINANCE SAFE)
========================= */
exports.deleteAccount = async (req, res) => {
  try {
    const deleted = await IncomeExpenseAccount.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Account deactivated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DROPDOWN API (VERY IMPORTANT)
========================= */
exports.dropdownAccounts = async (req, res) => {
  try {
    const { type } = req.query;

    let filter = { isActive: true };
    if (type) filter.type = type;

    const data = await IncomeExpenseAccount.find(filter)
      .select("type headRef subHeadRef headCustom subHeadCustom")
      .populate("headRef", "name")
      .populate("subHeadRef", "companyName")
      .sort({ headRef: 1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// delete permanent

exports.deleteAccountPermanent = async (req, res) => {
  try {
    const accountId = req.params.id;

    // ✅ Check if used in transactions
    const isUsed = await IncomeExpense.findOne({
      accountRef: accountId,
      isActive: true,
    });

    if (isUsed) {
      return res.status(400).json({
        message: "Head/SubHead is used in transactions and cannot be deleted",
      });
    }

    const deleted = await IncomeExpenseAccount.findByIdAndDelete(accountId);

    if (!deleted) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ message: "Account deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};