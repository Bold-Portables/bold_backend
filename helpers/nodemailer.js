const { createTransport } = require('nodemailer');

// Create a transporter using your email service provider's SMTP details
const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

// Compose the email with options
// mailOptions = {
//     from: 'your-email@gmail.com',
//     to: 'recipient@example.com',
//     subject: 'Hello from Amit',
//     text: 'This is the body of the email'
// };

// Send the email
exports.sendMail = (mailOptions) => {
	transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}
