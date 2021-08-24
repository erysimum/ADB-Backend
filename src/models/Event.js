const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  modifiedBy_id: {
    type: String,
    required: true,
  },
  modifiedBy: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  url: {
    type: String,
  },
  gmtCreate: { type: Date, default: Date.now },
  gmtUpdate: { type: Date, default: Date.now },
  candidate_id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Event", eventSchema);
