// const mongoose = require("mongoose");

// const TaskSchema = new mongoose.Schema({
//   cat: { type: String }, // Financial Product ID or name
//   sub: { type: String }, // Company Name
//   depart: { type: String }, // Employee Type
//   name: { type: String }, // Task Name
//   type: { type: String, default: "composite" }, // Task type

//   // ✅ Work Description with Image inside
//   descp: {
//     text: { type: String }, // CKEditor content
//     image: { type: String }, // Uploaded image filename or URL
//   },

//   // ✅ Communication Descriptions
//   email_descp: { type: String, default: "" },
//   sms_descp: { type: String, default: "" },
//   whatsapp_descp: { type: String, default: "" },

//   // ✅ Checklist
//   checklists: {
//     type: [String],
//     default: [],
//   },

//   // ✅ Form Checklist with files
//   formChecklists: [
//     {
//       name: { type: String },
//       downloadFormUrl: { type: String }, //image
//       sampleFormUrl: { type: String }, //image
//     },
//   ],
// });

// module.exports = TaskSchema;




const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  cat: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FinancialProduct',
    required: true 
  }, // Financial Product reference
  sub: { 
    type: String, 
    required: true,
    trim: true 
  }, // Company Name
  depart: { 
    type: String, 
    required: true,
    trim: true 
  }, // Employee Type
  name: { 
    type: String, 
    required: true,
    trim: true 
  }, // Task Name
  type: { 
    type: String, 
    enum: ['composite', 'marketing', 'service'],
    default: "composite" 
  }, // Task type

  // Work Description with Image
  descp: {
    text: { type: String, default: "" }, // CKEditor content
    image: { type: String, default: "" }, // Uploaded image filename or URL
  },

  // Communication Descriptions
  email_descp: { type: String, default: "" },
  sms_descp: { type: String, default: "" },
  whatsapp_descp: { type: String, default: "" },

  // Simple text checklist
  checklists: {
    type: [String],
    default: [],
  },

  // Form Checklist with files
  formChecklists: [
    {
      name: { 
        type: String, 
        required: true,
        trim: true 
      },
      downloadFormUrl: { type: String, default: "" }, // File path
      sampleFormUrl: { type: String, default: "" }, // File path
    },
  ],

  // Status tracking
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },

  // Who created this task
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming you have a User model
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to populate category name
TaskSchema.virtual('categoryName', {
  ref: 'FinancialProduct',
  localField: 'cat',
  foreignField: '_id',
  justOne: true,
  select: 'name'
});

// Index for better performance
TaskSchema.index({ type: 1, status: 1 });
TaskSchema.index({ cat: 1 });
TaskSchema.index({ createdAt: -1 });

module.exports = TaskSchema;