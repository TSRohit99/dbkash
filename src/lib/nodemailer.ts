import nodemailer from 'nodemailer';

const email = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;
const appName = 'dBKash';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass: pass,
    },
});

export const mailOptions = {
    from: {
        name: appName,
        address: email as string
    },
    subject: `${appName} | Verification Code`,
};

