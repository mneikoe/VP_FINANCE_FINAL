const {
  CompositeTask,
  MarketingTask,
  ServiceTask,
} = require("../Models/TaskModel");

const GetModelByType = (type) => {
  switch (type) {
    case "composite":
      return CompositeTask;
    case "marketing":
      return MarketingTask;
    case "service":
      return ServiceTask;
    default:
      throw new Error("Invalid task type");
  }
};

module.exports = GetModelByType;
