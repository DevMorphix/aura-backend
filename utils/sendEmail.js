const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
    console.log("mail");
    const transporter = nodeMailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        secure: true, // Use SSL
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_APP_PASS,
        },
        authMethod: 'LOGIN', // Specify the authentication method
    });

    // const mailOptions = {
    //     from: process.env.SMPT_MAIL,
    //     to: options.to,
    //     subject: options.subject,
    //     html: options.message,
    // };

    // await transporter.sendEmail(mailOptions);
    // await transporter.sendEmail(options);
};

module.exports = sendEmail;