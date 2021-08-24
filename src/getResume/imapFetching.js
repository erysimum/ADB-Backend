const Imap = require('imap');
const simpleParser = require("mailparser").simpleParser;
const { fetchEmailLinkedIn, getResume } = require('./getResume');

const imap = new Imap({
  // user: 'vietphamtesting@gmail.com',
  // password: 'mihnov-niktic-Wewgo2',
  // host: 'imap.gmail.com',
  user: 'hr@adbsystems.com.au',
  password: 'ADB12#$sys',
  host: 'adbsys.adbsystems.com.au',
  port: 993,
  tls: true,
  tlsOptions: {
    servername: 'adbsys.adbsystems.com.au'
    // servername: 'imap.gmail.com'
  }
});


module.exports = (mode = '', day = new Date()) => new Promise((resolve, reject) => {
  imap.once('ready', function (err) {
    if (err) console.log(err);
    imap.openBox('INBOX', false, function (err_1, box) {
      if (err_1) console.log(err_1);
      imap.search([['SINCE', mode === 'fetch_all' ? 'NOVEMBER 20, 2020' : day]], (err_2, uids) => {
        // imap.search([['ON', 'AUGUST 19, 2021']], (err_2, uids) => {
        if (err_2) console.log(err_2);
        if (uids.length === 0) {
          console.log("No email available");
          imap.end();
          return;
        }
        // imap.setFlags(uids, ['\\Seen'], function (err) {
        //   if (!err) {
        //     console.log("mark as read");
        //   } else {
        //     console.log(JSON.stringify(err, null, 2));
        //   }
        // });
        let fetch = imap.fetch(uids, { bodies: [''] });
        fetch.on('message', function (msg, seqno) {
          msg.on('body', function (stream, info) {
            simpleParser(stream, async function (err_3, body) {
              if (err_3) console.log(err_3);
              try {
                let job = '', name = {};
                console.log('\n' + body.subject);
                if (body.from.text.includes('jobs-listings') &&
                  // if (body.from.text.includes('vietphamtesting') &&
                  body.subject.includes('New application')) {
                  let subject = body.subject.replace('New application: ', '').replace(' from ', '&');
                  const info = subject.split('&');
                  job = info[0];
                  name = {
                    first_name: info[1].split(' ')[0],
                    last_name: info[1].split(' ')[1]
                  }
                  await fetchEmailLinkedIn(body.html, { job, name }, mode);
                }
                else if (body.attachments) {
                  if (body.from.text.includes('job-apps') &&
                    body.subject.includes('Application for ')) {
                    let subject = body.subject.replace('Application for ', '').replace(' from ', '&');
                    const info = subject.split('&');
                    job = info[0];
                    name = {
                      first_name: info[1].split(' ')[0],
                      last_name: info[1].split(' ')[1]
                    }
                  }
                  await getResume(body.attachments, { job, name }, mode);
                }
              } catch (error) {
                console.log(error);
              }
            });
          });
        });
        fetch.once("error", function (err) {
          return Promise.reject(err);
        });
        fetch.once("end", function () {
          imap.end();
        });
      });
    });
  });
  imap.once('close', (err) => {
    if (err) console.log(err);
    console.log('end');
    resolve(true);
  });
  imap.connect();
});