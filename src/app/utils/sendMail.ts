import nodemailer from 'nodemailer';
import config from '../../config';
export const sendEmail = async (to: string, html: string, subject: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: config.mail,
                pass: config.mail_password,
            },
        });
        const result = await transporter.sendMail({
            from: config.mail,
            to,
            subject,
            text: '',
            html,
        });
        // console.log(result);
    } catch (error) {
        console.log(error);
    }
};
