const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },

  category: {
    type: String,
    default: "Other",
  },

  purchased: {
    type: Boolean,
    default: false,
  },

  estimatedPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const listSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    items: {
      type: [itemSchema],
      default: [],
    },

    recurring: {
      type: Boolean,
      default: false,
    },

    recurringFrequency: {
      type: String,
      enum: [
        "weekly",
        "monthly",
        "none",
      ],
      default: "none",
    },

    // Budget Watch
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Used for automatic recurring lists
    nextRecurringAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "List",
  listSchema
);