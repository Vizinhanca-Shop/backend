import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

const mailersend = new MailerSend({
  apiKey: process.env.EMAIL_MAILERSEND_API_KEY,
})

export async function sendEmail(
  from: string = 'noreply@centerlight.com.br',
  to: string,
  subject: string,
  text: string,
) {
  const sentFrom = new Sender(from, 'Centerlight')
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo([new Recipient(to, 'User')])
    .setSubject(subject)
    .setHtml(text)

  try {
    await mailersend.email.send(emailParams)
  } catch (error) {
    console.log(error)
  }
}
