const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  // Job title
  title: {
    type: String,
    unique: true,
    required: true,
    unique: true,
  },
  // Parent-level ID
  parentId: {
    type: String,
    default: 0,
    required: true,
  },
  // Created time
  gmtCreate: { type: Date, default: Date.now },
  // Modified time
  gmtModified: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", jobSchema);
