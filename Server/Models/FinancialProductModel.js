// const mongoose = require("mongoose");

// const FinancialProductSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("FinancialProduct", FinancialProductSchema);



const mongoose = require("mongoose");

const FinancialProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Financial product name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    category: {
      type: String,
      enum: ['insurance', 'investment', 'loan', 'savings', 'retirement', 'other'],
      default: 'other'
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    // For future use - company/provider info
    provider: {
      type: String,
      trim: true
    },
    
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Assuming you have a User model
    }
  },
  {
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index for better search performance
FinancialProductSchema.index({ name: 1 });
FinancialProductSchema.index({ category: 1, isActive: 1 });
FinancialProductSchema.index({ createdAt: -1 });

// Virtual for task count (if needed)
FinancialProductSchema.virtual('taskCount', {
  ref: 'CompositeTask', // You might need to adjust this based on your needs
  localField: '_id',
  foreignField: 'cat',
  count: true
});

// Pre-save middleware to ensure name is properly formatted
FinancialProductSchema.pre('save', function(next) {
  if (this.name) {
    this.name = this.name.trim();
  }
  next();
});

// Static method to find active products
FinancialProductSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Instance method to deactivate
FinancialProductSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model("FinancialProduct", FinancialProductSchema);