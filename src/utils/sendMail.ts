import sgMail from '@sendgrid/mail'
import { EmailMessage } from '../types'

sgMail.setApiKey(String(process.env.SENDGRID_API_KEY))

const mailer = String(process.env.MAILER_EMAIL)

const appName = String(process.env.APP_NAME)

const sendMail = async (firstName: string, email: string, token: string, url: string, subject: string, text: string, sandboxMode: boolean): Promise<any> => {
  const msg = {
    to: email,
    from: `${appName} <${mailer}>`,
    subject: `${subject}`,
    text: `Hello ${firstName},\n\nFollow this link to ${text} for your ${email} account\n${url}/?token=${token}\n\nIf you didn't ask to ${text}, you can ignore this email.\n\nThanks,\n\n${appName} team`,
    mail_settings: {
      sandbox_mode: {
        enable: sandboxMode
      }
    }
  }

  try {
    const info = await sgMail.send(msg)
    return info
  } catch (error: any) {
    return error.response.body.errors[0].message
  }
}

export const sendNotifierEmail = async (email: string, subject: string, message: string, bccStatus = true, html = '', sandboxMode: boolean): Promise<any> => {
  const msg: EmailMessage = {
    to: email,
    from: `${appName} <${mailer}>`,
    bcc: bccStatus ? mailer : '',
    subject: `${subject}`,
    text: `${message}`,
    mail_settings: {
      sandbox_mode: {
        enable: sandboxMode
      }
    }
  }

  if (html !== '') {
    msg.html = html ?? '<p></p>'
  }

  try {
    const info = await sgMail.send(msg)
    return info
  } catch (error: any) {
    return error.response.body.errors[0].message
  }
}

export default sendMail
