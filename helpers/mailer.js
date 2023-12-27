const sendGridMail = require('@sendgrid/mail');
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

function getMessage(from, to,subject, body) {
  return {
    to,
    from,
    subject,
    text: body,
    cc: 'nobody@delimp.com',
    html: `<strong>${body}</strong>`,
  };
}

const sendEmail =async (from, to, subject, body) =>{
  try {
    await sendGridMail.send(getMessage(from, to,subject, body));
  } catch (error) {
    if (error.response) {
      console.error(error.response.body)
    }
  }
}

module.exports= {sendEmail}