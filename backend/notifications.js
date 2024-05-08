const nodemailer = require('nodemailer');

// Wird erst verwendbar wenn wir eine trashmail erstellt haben. Ansonsten kann jeder in der .env file die anmeldedaten finden

async function sendEmail(to, subject, text) {
    let transporter = nodemailer.createTransport({
        service: 'Gmail', // oder ein anderer Service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    });
}

module.exports = { sendEmail };
