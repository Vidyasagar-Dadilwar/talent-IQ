import { Resend } from 'resend';
import { ENV } from './env.js';

const resend = new Resend(ENV.RESEND_API_KEY);

const sendWelcomeEmail = async (email) => {
    await resend.emails.send({
        from: ENV.RESEND_EMAIL,
        to: email,
        subject: 'Welcome to Talent IQ',
        html: '<p>Welcome to Talent IQ! We are excited to have you on board.</p>'
    });
}

const sendGoodByeEmail = async (email) => {
    await resend.emails.send({
        from: ENV.RESEND_EMAIL,
        to: email,
        subject: 'Goodbye from Talent IQ',
        html: '<p>Goodbye from Talent IQ! We are sad to see you go.</p>'
    });
}

export { sendWelcomeEmail, sendGoodByeEmail };