const IncomeExpense = require("../Models/IncomeExpenseModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");


/* =====================================================
   BANK LEDGER (JSON FOR FRONTEND)
===================================================== */
exports.bankLedger = async (req, res) => {
  try {
    const { bankId, fromDate, toDate } = req.query;

    if (!bankId) return res.status(400).json({ message: "bankId required" });

    let filter = { bankRef: bankId, isActive: true };

    if (fromDate && toDate) {
      filter.transactionDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const transactions = await IncomeExpense.find(filter)
      .populate({
        path: "accountRef",
        populate: [
          { path: "headRef", select: "name" },
          { path: "subHeadRef", select: "companyName" },
        ],
      })
      .sort({ transactionDate: 1 });

    let balance = 0;

    const ledger = transactions.map((t) => {
      if (t.type === "income") balance += t.amount;
      else balance -= t.amount;

      const acc = t.accountRef || {};

      return {
        _id: t._id,
        transactionDate: t.transactionDate,
        type: t.type,
        amount: t.amount,
        runningBalance: balance,

        head:
          acc.headCustom ||
          acc.headRef?.name ||
          "-",

        subHead:
          acc.subHeadCustom ||
          acc.subHeadRef?.companyName ||
          "-",
      };
    });

    res.json(ledger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   BALANCE SHEET DATA (GROUPED)
===================================================== */
exports.getBalanceSheet = async (req, res) => {
  try {
    const data = await IncomeExpense.aggregate([
      { $match: { isActive: true } },

      {
        $lookup: {
          from: "incomeexpenseaccounts",
          localField: "accountRef",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: "$account" },

      {
        $group: {
          _id: {
            type: "$type",
            head: { $ifNull: ["$account.headCustom", "$account.headRef"] },
            subHead: { $ifNull: ["$account.subHeadCustom", "$account.subHeadRef"] },
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    let income = [];
    let expense = [];
    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach((d) => {
      if (d._id.type === "income") {
        income.push(d);
        totalIncome += d.total;
      } else {
        expense.push(d);
        totalExpense += d.total;
      }
    });

    res.json({
      income,
      expense,
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportExcel = async (req, res) => {
  const report = await IncomeExpense.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "incomeexpenseaccounts",
        localField: "accountRef",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },
  ]);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Balance Sheet");

  sheet.addRow(["BALANCE SHEET"]);
  sheet.addRow([]);

  sheet.addRow(["Type", "Head", "SubHead", "Amount"]);

  report.forEach((r) => {
    sheet.addRow([
      r.type,
      r.account.headCustom || r.account.headRef,
      r.account.subHeadCustom || r.account.subHeadRef,
      r.amount,
    ]);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader("Content-Disposition", "attachment; filename=balance-sheet.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};

exports.exportPDF = async (req, res) => {
  const data = await IncomeExpense.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "incomeexpenseaccounts",
        localField: "accountRef",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },
  ]);

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=balance-sheet.pdf");

  doc.pipe(res);

  doc.fontSize(18).text("BALANCE SHEET", { align: "center" });
  doc.moveDown();

  let income = 0;
  let expense = 0;

  data.forEach((r) => {
    if (r.type === "income") income += r.amount;
    else expense += r.amount;
  });

  doc.fontSize(12);
  doc.text(`Total Income: ${income}`);
  doc.text(`Total Expense: ${expense}`);
  doc.text(`Net Balance: ${income - expense}`);

  doc.end();
};


exports.bankLedgerPDF = async (req, res) => {
  try {
    const { bankId, fromDate, toDate } = req.query;

    if (!bankId) return res.status(400).json({ message: "bankId required" });

    const transactions = await IncomeExpense.find({
      bankRef: bankId,
      isActive: true,
      ...(fromDate &&
        toDate && {
        transactionDate: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      }),
    })
      .populate("bankRef", "bankName")
      .populate({
        path: "accountRef",
        populate: [
          { path: "headRef", select: "name" },
          { path: "subHeadRef", select: "companyName" },
        ],
      })
      .sort({ transactionDate: 1 });

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=bank-ledger.pdf");

    doc.pipe(res);

    const bankName = transactions[0]?.bankRef?.bankName || "Bank Ledger";

    /* ===== HEADER ===== */
    doc.fontSize(18).text("BANK LEDGER", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Bank: ${bankName}`);
    if (fromDate && toDate) doc.text(`Period: ${fromDate} to ${toDate}`);
    doc.moveDown();

    /* ===== COLUMN POSITIONS ===== */
    const col = {
      date: 40,
      head: 110,
      sub: 220,
      debit: 340,
      credit: 420,
      balance: 500,
    };

    const startY = doc.y;

    /* ===== HEADER ROW ===== */
    doc.font("Helvetica-Bold");
    doc.text("Date", col.date, startY);
    doc.text("Head", col.head, startY);
    doc.text("SubHead", col.sub, startY);
    doc.text("Debit", col.debit, startY, { width: 60, align: "right" });
    doc.text("Credit", col.credit, startY, { width: 60, align: "right" });
    doc.text("Balance", col.balance, startY, { width: 60, align: "right" });

    doc.moveTo(40, startY + 15).lineTo(560, startY + 15).stroke();

    /* ===== ROWS ===== */
    let y = startY + 25;
    let balance = 0;

    doc.font("Helvetica");

    transactions.forEach((t) => {
      const acc = t.accountRef;

      const head = acc.headCustom || acc.headRef?.name || "—";
      const sub = acc.subHeadCustom || acc.subHeadRef?.companyName || "—";

      let debit = "";
      let credit = "";

      if (t.type === "expense") {
        debit = t.amount;
        balance -= t.amount;
      } else {
        credit = t.amount;
        balance += t.amount;
      }

      /* ===== calculate dynamic height ===== */
      const headHeight = doc.heightOfString(head, { width: 90 });
      const subHeight = doc.heightOfString(sub, { width: 100 });

      const rowHeight = Math.max(headHeight, subHeight, 15);

      /* ===== render row ===== */
      doc.text(new Date(t.transactionDate).toLocaleDateString(), col.date, y);

      doc.text(head, col.head, y, { width: 90 });
      doc.text(sub, col.sub, y, { width: 100 });

      doc.text(debit, col.debit, y, { width: 60, align: "right" });
      doc.text(credit, col.credit, y, { width: 60, align: "right" });
      doc.text(balance, col.balance, y, { width: 60, align: "right" });

      y += rowHeight + 5;

      /* ===== page break ===== */
      if (y > 760) {
        doc.addPage();
        y = 50;
      }
    });

    /* ===== CLOSING ===== */
    doc.moveDown();
    doc.font("Helvetica-Bold");
    doc.text(`Closing Balance: ${balance}`, { align: "right" });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bankLedgerExcel = async (req, res) => {
  try {
    const { bankId, fromDate, toDate } = req.query;

    if (!bankId) return res.status(400).json({ message: "bankId required" });

    const transactions = await IncomeExpense.find({
      bankRef: bankId,
      isActive: true,
      ...(fromDate &&
        toDate && {
          transactionDate: {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          },
        }),
    })
      .populate("bankRef", "bankName")
      .populate({
        path: "accountRef",
        populate: [
          { path: "headRef", select: "name" },
          { path: "subHeadRef", select: "companyName" },
        ],
      })
      .sort({ transactionDate: 1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bank Ledger");

    const bankName = transactions[0]?.bankRef?.bankName || "Bank Ledger";

    /* ===== HEADER ===== */
    sheet.addRow(["BANK LEDGER"]);
    sheet.addRow([`Bank: ${bankName}`]);

    if (fromDate && toDate) {
      sheet.addRow([`Period: ${fromDate} to ${toDate}`]);
    }

    sheet.addRow([]);

    /* ===== TABLE HEADER ===== */
    const header = sheet.addRow([
      "Date",
      "Head",
      "SubHead",
      "Debit",
      "Credit",
      "Balance",
    ]);

    header.font = { bold: true };

    sheet.columns = [
      { width: 15 },
      { width: 25 },
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
    ];

    /* ===== ROWS ===== */
    let balance = 0;

    transactions.forEach((t) => {
      const acc = t.accountRef;

      const head = acc.headCustom || acc.headRef?.name || "";
      const sub = acc.subHeadCustom || acc.subHeadRef?.companyName || "";

      let debit = "";
      let credit = "";

      if (t.type === "expense") {
        debit = t.amount;
        balance -= t.amount;
      } else {
        credit = t.amount;
        balance += t.amount;
      }

      sheet.addRow([
        new Date(t.transactionDate).toLocaleDateString(),
        head,
        sub,
        debit,
        credit,
        balance,
      ]);
    });

    sheet.addRow([]);
    sheet.addRow(["", "", "", "", "Closing Balance", balance]);

    /* ===== RESPONSE ===== */
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bank-ledger.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};