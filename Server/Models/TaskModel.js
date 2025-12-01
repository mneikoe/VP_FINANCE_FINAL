// const mongoose = require("mongoose");
// const TaskSchema = require("./TaskSchema");

// // Model names and custom collection names
// const CompositeTask = mongoose.model(
//   "composite",
//   TaskSchema,
//   "composite_tasks"
// );
// const MarketingTask = mongoose.model(
//   "marketing",
//   TaskSchema,
//   "marketing_tasks"
// );
// const ServiceTask = mongoose.model("service", TaskSchema, "service_tasks");

// module.exports = {
//   CompositeTask,
//   MarketingTask,
//   ServiceTask,
// };




const mongoose = require("mongoose");
const TaskSchema = require("./TaskSchema");

// Create models with custom collection names
const CompositeTask = mongoose.model(
  "CompositeTask",
  TaskSchema,
  "composite_tasks"
);

const MarketingTask = mongoose.model(
  "MarketingTask", 
  TaskSchema,
  "marketing_tasks"
);

const ServiceTask = mongoose.model(
  "ServiceTask", 
  TaskSchema, 
  "service_tasks"
);

// Helper function to get model by type
const getModelByType = (type) => {
  const models = {
    composite: CompositeTask,
    marketing: MarketingTask,
    service: ServiceTask
  };
  
  const model = models[type];
  if (!model) {
    throw new Error(`Invalid task type: ${type}. Valid types are: composite, marketing, service`);
  }
  
  return model;
};

module.exports = {
  CompositeTask,
  MarketingTask,
  ServiceTask,
  getModelByType
};