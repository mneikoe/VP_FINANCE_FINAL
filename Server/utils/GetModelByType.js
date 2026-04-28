// utils/GetModelByType.js
import CompositeTask from "../Models/CompositeTaskModel.js";
import MarketingTask from "../Models/MarketingTaskModel.js";
import ServiceTask from "../Models/ServiceTaskModel.js";
import IndividualTask from "../Models/IndividualTaskModel.js";

const GetModelByType = (type = "composite") => {
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

export default GetModelByType;

