require("./models/User");
require("./models/Job");
require("./models/Candidate");
require("./models/Event");
const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const searchRoutes = require("./routes/searchRoutes");
const requireAuth = require("./middlewares/requireAuth");
const schedule = require('node-schedule');


const app = express();
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(cors({ origin: '*', methods: 'GET, PUT, POST' }));
app.use(express.json());
// app.use(authRoutes);
app.use('/job', jobRoutes);
app.use('/candidate', candidateRoutes);
app.use(searchRoutes);

// DB config
// console.log(require("./config/keys").MongoURI)
const db = require("./config/keys").MongoURI;
const imapFetching = require("./getResume/imapFetching");
const PORT = process.env.PORT || 5000;

// Connect to Mongo
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(async () => {
    console.log("MongoDB connected");
    app.listen(PORT, console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log(err));

// Routes
app.get("/", requireAuth, (req, res) => {
  res.send(`Your email: ${req.user.email}`);
});

try {
  schedule.scheduleJob({ rule: '*/5 * * * *', tz: 'Australia/Melbourne' }, async () => {
    // schedule.scheduleJob({ rule: '35,40,41 11 * * *', tz: 'Australia/Melbourne' }, async () => {
    // schedule.scheduleJob({ rule: '00,20,40 * * * * *', tz: 'Australia/Melbourne' }, async () => {
    console.log('Hi every 5m');
  });
  schedule.scheduleJob({ rule: '30 08,16 * * *', tz: 'Australia/Melbourne' }, async () => {
    // schedule.scheduleJob({ rule: '35,40,41 11 * * *', tz: 'Australia/Melbourne' }, async () => {
    // schedule.scheduleJob({ rule: '00,20,40 * * * * *', tz: 'Australia/Melbourne' }, async () => {
    console.log('hi Fetching');
    await imapFetching('', new Date());
    console.log('done fetching');
  });
  // schedule.scheduleJob({ rule: '30 08 * * *', tz: 'Australia/Melbourne' }, async () => {
  //   // schedule.scheduleJob({ rule: ' 20 10 * * *', tz: 'Australia/Melbourne' }, async () => {
  //   console.log('hi at 08.30');
  //   const d = new Date();
  //   d.setDate(d.getDate() - 1)
  //   await imapFetching('', d);
  //   console.log('done fetching');
  // });
} catch (error) {
  console.log(error);
}


// const imap = async () => {
//   await imapFetching();
// }
// imap();
