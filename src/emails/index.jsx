import { Resend } from 'resend';
import { Email } from './email';

const resend = new Resend('re_B2JZYzfV_LffCcMRitPnxCyfmUbQUMACe');

export async function sendEmail(){
    await resend.emails.send({
        from: 'a01284747@tec.mx',
        to: 'a00833573@tec.mx',
        subject: 'hello world',
        react: <Email/>,
    });
}