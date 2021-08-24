const fs = require('fs');
const binary = require('mongodb').Binary;
const { pdfParser, wordParser } = require('../resumeParser/index');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
var { convert } = require('html-to-text');
const download = require('download-file');
const Downloader = require('nodejs-file-downloader');

const urlDownload = async (link, job = {}, mode = '') => {
  let fileName = '';
  const downloader = new Downloader({
    // url: 'https://www.researchgate.net/profile/Nanki_Nath_Phd/publication/350186697_CV_Bio/links/60f92a0e0c2bfa282af24281/CV-Bio.pdf',//If the file name already exists, a new file with the name 200MB1.zip is created.
    url: link,
    directory: './src/getResume',
    onBeforeSave: (deducedName) => (fileName = deducedName)
  });
  // try {
  return new Promise(async (resolve, reject) => {
    try {
      await downloader.download();
      console.log('Download Completed');

      await addCandidate(`./src/getResume/${fileName}`, job, mode);
      fs.unlinkSync(`./src/getResume/${fileName}`);

      console.log('All done');
      resolve(true);
    } catch (error) {
      reject(new Error(error));
    }
  });
};

const addCandidate = async (file_path, job = {}, mode = '') => {
  try {
    const file_content = fs.readFileSync(file_path);
    const ext = file_path.split('.').pop();
    const file_name = file_path.split('/').pop();

    var candidate = null;
    if (ext.match(/pdf/i)) {
      candidate = await pdfParser(file_path);
    } else if (ext.match(/docx/i) || ext.match(/doc/i)) {
      candidate = await wordParser(file_path);
    }
    if (candidate == null) {
      console.log('Not a resume!');
      return;
    }

    const resume = {
      data: binary(file_content),
      file_type: ext,
      file_name
    };

    const job_title = job.job || '';
    const first_name = job.name.first_name || 'none';
    const last_name = job.name.last_name || 'none';
    let apply_job_id = '';
    if (job_title) {
      apply_job_id = await Job.findOne({ title: job_title });
      if (apply_job_id) {
        apply_job_id = apply_job_id._id;
      } else {
        const newJob = new Job({ title: job_title });
        await newJob.save();
        apply_job_id = newJob._id;
      }
    }

    const can = {
      email: candidate.email,
      first_name,
      last_name,
      phone: candidate.phone,
      location: candidate.location,
      resume_text: candidate.resume_text,
      resume: resume,
      relocate: '',
      citizenship: '',
      job_type: '',
      baseline: '',
      overall_exp: 0,
      related_exp: 0,
      skill: candidate.skill,
      experience: '',
      availability: '',
      visa: '',
      reference: '',
      file_name: '',
      salary_type: '',
      salary: '',
      job_title,
      apply_job_id
    };

    const findCandidate = await Candidate.find({ email: candidate.email });
    if (findCandidate.length == 0) {
      const res = new Candidate(can);
      await res.save();
    } else {
      const gmtUpdate = mode === 'fetch_all' ? findCandidate[0].gmtCreate : new Date();
      await Candidate.findOneAndUpdate(
        { email: candidate.email },
        {
          skill: candidate.skill,
          phone: candidate.phone,
          location: candidate.location,
          resume,
          resume_text: candidate.resume_text,
          gmtUpdate: gmtUpdate,
          isRead: false
        }
      );
    }
  } catch (error) {
    console.log(error.message);
    return;
  }
};

const fetchEmailLinkedIn = async (email, job = {}, mode = '') => {
  const text = convert(email, {
    wordwrap: 130
  }).split('\n');

  const link = text.filter((email) => email.includes('download_resume'))[0].replace(/>|<| |\[|\]/g, '');
  // const link = text.filter((email) => email.includes('researchgate'))[0]?.replace(/>|<| |\[|\]/g, "");
  try {
    if (link) await urlDownload(link, job, mode);
  } catch (error) {
    console.log('error:', error.message);
  }
  console.log('done\n');
};

const getResume = async (attachments, job = {}, mode = '') => {
  for (att in attachments) {
    const file_name = attachments[att].filename;
    const file_content = attachments[att].content;

    console.log(file_name);

    if (file_name.match(/Cover Letter/i) || file_name.match(/CoverLetter/i)) {
      console.log('Not Resume!\n');
      continue;
    }

    if (attachments[att].contentType !== 'image/png' && attachments[att].contentType !== 'image/jpeg') {
      fs.writeFileSync('./src/getResume/' + file_name, file_content);
      await addCandidate('./src/getResume/' + file_name, job, mode);
      fs.unlinkSync('./src/getResume/' + file_name);
      console.log('done\n');
    }
  }
};

module.exports = { fetchEmailLinkedIn, getResume };
