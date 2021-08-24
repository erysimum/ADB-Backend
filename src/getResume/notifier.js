// const getResume = require("./getResume");
const notifier = require('mail-notifier');
const { getResume, fetchEmailLinkedIn } = require('./getResume');
const fs = require('fs');

const imap = {
  user: 'vietphamtesting@gmail.com',
  password: 'mihnov-niktic-Wewgo2',
  host: 'imap.gmail.com',
  // user: 'hr@adbsystems.com.au',
  // password: 'ADB12#$sys',
  // host: 'adbsystems.com.au',
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false
  }
}

module.exports = () => {
  const n = notifier(imap);
  n.on('mail', async (mail) => {
    let job = '', name = {};
    try {
      console.log(1);
      fs.mkdirSync('./uploads');
      if (mail.from[0].address.includes('jobs-listings') &&
        mail.subject.includes('New application')) {
        await fetchEmailLinkedIn(mail.html);
      }
      else if (mail.attachments) {
        // if (mail.attachments) {
        // fs.mkdirSync('./uploads');
        if (mail.subject.includes('Application for ')) {
          console.log(mail.subject);
          let subject = mail.subject.replace('Application for ', '').replace(' from ', '&');
          const info = subject.split('&');
          job = info[0];
          name = {
            first_name: info[1].split(' ')[0],
            last_name: info[1].split(' ')[1]
          }
          console.log(2);

        }
        await getResume(mail.attachments, { job, name });
        // fs.rmdirSync('./uploads');
      }
      fs.rmdirSync('./uploads');

    }
    catch (error) {
      console.log(error);
    }
  })
  n.start();
}
