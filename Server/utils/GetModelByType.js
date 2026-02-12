// utils/GetModelByType.js
const CompositeTask = require("../Models/CompositeTaskModel");
const MarketingTask = require("../Models/MarketingTaskModel");
const ServiceTask = require("../Models/ServiceTaskModel");
const IndividualTask = require("../Models/IndividualTaskModel");

const GetModelByType = (type) => {
  console.log(`🔍 Getting model for type: ${type}`);

  const modelMap = {
    composite: CompositeTask,
    marketing: MarketingTask,
    service: ServiceTask,
    individual: IndividualTask,
  };

  const model = modelMap[type.toLowerCase()];

  if (!model) {
    console.error(`❌ Invalid task type: ${type}`);
    console.log(`✅ Defaulting to CompositeTask`);
    return CompositeTask;
  }

  console.log(`✅ Returning model: ${model.modelName}`);
  return model;
};

module.exports = GetModelByType;
