const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  data: {
    type: Buffer,
  },
  file_type: {
    type: String,
  },
  file_name: {
    type: String,
  },
});

const candidateSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  middle_name: {
    type: String,
    default: ''
  },
  last_name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  location: {
    type: String,
    default: ''
  },
  job_title: {
    type: String,
    default: ''
    // required: true,
  },
  apply_job_id: {
    type: String,
    default: ''
    // required: true,
  },
  relocate: {
    type: String,
    default: ''
  },
  citizenship: {
    type: String,
    default: ''
  },
  job_type: {
    type: String,
    default: ''
  },
  baseline: {
    type: String,
    default: ''
  },
  overall_exp: {
    type: Number,
    default: 0
  },
  related_exp: {
    type: Number,
    default: 0
  },
  skill: {
    type: Array,
    default: []
  },
  experience: {
    type: String,
    default: ''
  },
  availability: {
    type: String,
    default: ''
  },
  visa: {
    type: String,
    default: ''
  },
  salary_type: {
    type: String,
    default: ''
  },
  salary: {
    type: Number,
    default: 0
  },
  reference: {
    type: String,
    default: ''
  },
  resume_text: {
    type: String,
    default: ''
  },
  resume: [resumeSchema],
  source: {
    type: String,
    default: ''
  },
  viewed: {
    type: Number,
    default: 0,
  },
  gmtCreate: { type: Date, default: Date.now },
  gmtUpdate: { type: Date, default: Date.now },
  isRead: {
    type: Boolean,
    default: false,
  }
});

candidateSchema.index({
  // skill: "text",
  // email: "text",
  // first_name: "text",
  // last_name: "text",
  // phone: "text",
  // location: "text",
  // // experience: "text",
  // availability: "text",
  // visa: "text",
  gmtUpdate: 1
  // resume_text: "text",
});
const schema = mongoose.model("Candidate", candidateSchema);

schema.on('index', (err) => {
  console.log('indexes');
  if (err) console.log(err);
})

module.exports = schema;
