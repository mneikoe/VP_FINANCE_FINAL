const Bank = require("../Models/BankModel");
const IncomeExpense = require("../Models/IncomeExpenseModel");


/* ================= CREATE BANK ================= */
exports.createBank = async (req, res) => {
  try {
    const { bankName, accountNumber, ifsc } = req.body;

    if (!bankName) {
      return res.status(400).json({ message: "Mode of Transaction is required" });
    }


    const bank = await Bank.create({
      bankName,
      accountNumber: accountNumber || null,
      ifsc: ifsc || null,
    });

    res.status(201).json(bank);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL BANKS ================= */
exports.getBanks = async (req, res) => {
  try {
    const banks = await Bank.find().sort({ createdAt: -1 });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET SINGLE BANK ================= */
exports.getBankById = async (req, res) => {
  try {
    const bank = await Bank.findById(req.params.id);

    if (!bank) {
      return res.status(404).json({ message: "not found" });
    }

    res.json(bank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE BANK ================= */
exports.updateBank = async (req, res) => {
  try {
    const bank = await Bank.findById(req.params.id);

    if (!bank) {
      return res.status(404).json({ message: "not found" });
    }

    const { bankName, accountNumber, ifsc, isActive } = req.body;

    if (accountNumber && accountNumber !== bank.accountNumber) {
      const duplicate = await Bank.findOne({ accountNumber });
      if (duplicate) {
        return res.status(400).json({ message: "Account number already exists" });
      }
    }

    bank.bankName = bankName ?? bank.bankName;
    bank.accountNumber = accountNumber ?? bank.accountNumber;
    bank.ifsc = ifsc ?? bank.ifsc;
    bank.isActive = isActive ?? bank.isActive;

    const updated = await bank.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE BANK (HARD DELETE) ================= */
exports.deleteBank = async (req, res) => {
  try {
    const bankId = req.params.id;

    // ✅ Check if bank is used in IncomeExpense
    const isUsed = await IncomeExpense.findOne({ bankRef: bankId });

    if (isUsed) {
      return res.status(400).json({
        message: "Bank is in use and cannot be deleted",
      });
    }

    const bank = await Bank.findByIdAndDelete(bankId);

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.json({ message: "Bank deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= TOGGLE ACTIVE STATUS ================= */
exports.toggleBankStatus = async (req, res) => {
  try {
    const bank = await Bank.findById(req.params.id);

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    bank.isActive = !bank.isActive;
    await bank.save();

    res.json(bank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};