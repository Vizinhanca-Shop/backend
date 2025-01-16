import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

const mailersend = new MailerSend({
  apiKey: process.env.EMAIL_MAILERSEND_API_KEY,
})

interface sendEmailProps {
  from?: string | undefined
  to: string
  subject: string
  text: string
}

export async function sendEmail({ from, to, subject, text }: sendEmailProps) {
  const fromEmail = 'noreply@trial-jy7zpl9on55l5vx6.mlsender.net'

  const sentFrom = new Sender(fromEmail, 'Centerlight')
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo([new Recipient(to, 'User')])
    .setSubject(subject)
    .setHtml(text)

  try {
    await mailersend.email.send(emailParams)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
