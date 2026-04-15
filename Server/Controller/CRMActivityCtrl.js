const fs = require("fs");
const path = require("path");
const CRMActivity = require("../Models/CRMActivityModel");
const FinancialProduct = require("../Models/FinancialProductModel");
const Company = require("../Models/CompanyNameModel");

const normalizeType = (value = "") => value.toLowerCase().trim();

const validType = (type) =>
  ["advertisement", "creativity", "relationship"].includes(type);

const parseNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizePayload = (body = {}) => ({
  activityType: normalizeType(body.activityType),
  srNo: parseNullableNumber(body.srNo) ?? 0,
  employeeType: body.employeeType || "",
  financialProductId: body.financialProductId || null,
  companyId: body.companyId || null,
  financialProduct: body.financialProduct || "",
  companyName: body.companyName || "",
  activityName: body.activityName || "",
  modeOfActivities: body.modeOfActivities || "",
  modeOfWish: body.modeOfWish || "",
  contentName: body.contentName || "",
  preparedBy: body.preparedBy || "",
  publishPlatform: body.publishPlatform || "",
  totalExpenses: parseNullableNumber(body.totalExpenses),
  dateOfPublicity: body.dateOfPublicity || null,
  placeWhereActivityDone: body.placeWhereActivityDone || "",
  dateOfActivity: body.dateOfActivity || null,
  requiredMaterial: body.requiredMaterial || "",
  remark: body.remark || "",
  activityDetails: body.activityDetails || "",
  upwardDownwardCopy: body.upwardDownwardCopy || "",
});

const hydrateFKValues = async (payload) => {
  const hydrated = { ...payload };

  if (hydrated.financialProductId) {
    const product = await FinancialProduct.findById(hydrated.financialProductId);
    if (!product) {
      throw new Error("Invalid Financial Product selected");
    }
    hydrated.financialProduct = product.name || "";
  }

  if (hydrated.companyId) {
    const company = await Company.findById(hydrated.companyId).populate("financialProduct");
    if (!company) {
      throw new Error("Invalid Company selected");
    }

    hydrated.companyName = company.companyName || "";
    if (
      hydrated.financialProductId &&
      company.financialProduct &&
      String(company.financialProduct._id) !== String(hydrated.financialProductId)
    ) {
      throw new Error("Selected company does not belong to selected financial product");
    }

    if (!hydrated.financialProductId && company.financialProduct?._id) {
      hydrated.financialProductId = company.financialProduct._id;
      hydrated.financialProduct = company.financialProduct.name || hydrated.financialProduct;
    }
  }

  return hydrated;
};

const removeAttachmentIfExists = (attachmentPath = "") => {
  if (!attachmentPath) return;
  const normalizedPath = attachmentPath.replace(/^\/+/, "");
  const absolutePath = path.join(__dirname, "..", normalizedPath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

exports.createCRMActivity = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    if (!validType(payload.activityType)) {
      return res.status(400).json({ message: "Invalid activityType" });
    }
    const hydratedPayload = await hydrateFKValues(payload);

    if (!hydratedPayload.srNo || hydratedPayload.srNo <= 0) {
      const last = await CRMActivity.findOne({ activityType: hydratedPayload.activityType })
        .sort({ srNo: -1 })
        .select("srNo");
      hydratedPayload.srNo = (last?.srNo || 0) + 1;
    }

    if (!hydratedPayload.dateOfActivity) {
      hydratedPayload.dateOfActivity = new Date();
    }
    if (!hydratedPayload.dateOfPublicity && hydratedPayload.activityType === "advertisement") {
      hydratedPayload.dateOfPublicity = new Date();
    }

    const doc = new CRMActivity({
      ...hydratedPayload,
      attachmentPath: req.file ? `/public/Images/${req.file.filename}` : "",
    });
    await doc.save();

    return res.status(201).json({
      success: true,
      message: "CRM activity created successfully",
      data: doc,
    });
  } catch (error) {
    const statusCode =
      /Invalid|Selected company/i.test(error.message || "") ? 400 : 500;
    if (statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create CRM activity",
      error: error.message,
    });
  }
};

exports.getCRMActivities = async (req, res) => {
  try {
    const activityType = normalizeType(req.query.type || "");
    const query = validType(activityType) ? { activityType } : {};
    const activities = await CRMActivity.find(query)
      .populate("financialProductId", "name")
      .populate("companyId", "companyName")
      .sort({
        srNo: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch CRM activities",
      error: error.message,
    });
  }
};

exports.updateCRMActivity = async (req, res) => {
  try {
    const activity = await CRMActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    const payload = normalizePayload({
      ...activity.toObject(),
      ...req.body,
      activityType: req.body.activityType || activity.activityType,
    });
    const hydratedPayload = await hydrateFKValues(payload);

    if (!validType(hydratedPayload.activityType)) {
      return res.status(400).json({ success: false, message: "Invalid activityType" });
    }

    if (req.file) {
      removeAttachmentIfExists(activity.attachmentPath);
      activity.attachmentPath = `/public/Images/${req.file.filename}`;
    }

    Object.assign(activity, hydratedPayload);
    await activity.save();

    return res.status(200).json({
      success: true,
      message: "CRM activity updated successfully",
      data: activity,
    });
  } catch (error) {
    const statusCode =
      /Invalid|Selected company/i.test(error.message || "") ? 400 : 500;
    if (statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update CRM activity",
      error: error.message,
    });
  }
};

exports.uploadCRMActivityAttachment = async (req, res) => {
  try {
    const activity = await CRMActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Attachment is required" });
    }

    removeAttachmentIfExists(activity.attachmentPath);
    activity.attachmentPath = `/public/Images/${req.file.filename}`;
    await activity.save();

    return res.status(200).json({
      success: true,
      message: "Attachment uploaded successfully",
      data: activity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload attachment",
      error: error.message,
    });
  }
};

exports.deleteCRMActivity = async (req, res) => {
  try {
    const activity = await CRMActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    removeAttachmentIfExists(activity.attachmentPath);
    await activity.deleteOne();

    return res.status(200).json({
      success: true,
      message: "CRM activity deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete CRM activity",
      error: error.message,
    });
  }
};
