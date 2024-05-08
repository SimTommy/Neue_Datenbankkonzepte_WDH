const nodemailer = require('nodemailer');

// E-Mail-Konfiguration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// E-Mail-Versandfunktion
async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
