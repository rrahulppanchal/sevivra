import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@sevivra.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`

  await transporter.sendMail({
    from: `"Sevivra" <${FROM_EMAIL}>`,
    to: email,
    subject: 'Reset your password - Sevivra',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1DA619; margin: 0;">Sevivra</h1>
        </div>
        <h2 style="color: #1F2937;">Reset your password</h2>
        <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
          Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #1DA619; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #1DA619; font-size: 14px; word-break: break-all;">
          ${resetUrl}
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
          This is an automated email from Sevivra. Please do not reply.
        </p>
      </div>
    `,
  })
}

export async function sendReviewInvitationEmail(
  email: string,
  reviewerName: string,
  senderName: string,
  projectTitle: string,
  projectUrl: string,
  isExistingUser: boolean,
) {
  const signupUrl = `${APP_URL}/auth/signup`

  await transporter.sendMail({
    from: `"Sevivra" <${FROM_EMAIL}>`,
    to: email,
    subject: `Review request: ${projectTitle} - Sevivra`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1DA619; margin: 0;">Sevivra</h1>
        </div>
        <h2 style="color: #1F2937;">Review Invitation</h2>
        <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
          Hi${reviewerName ? ` ${reviewerName}` : ''},
        </p>
        <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
          <strong>${senderName}</strong> has invited you to review the manuscript <strong>"${projectTitle}"</strong> on Sevivra.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${isExistingUser ? projectUrl : signupUrl}"
             style="background-color: #1DA619; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            ${isExistingUser ? 'View Manuscript' : 'Join Sevivra to Review'}
          </a>
        </div>
        ${!isExistingUser ? `
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
          You'll need to create a free Sevivra account to access and review this manuscript.
        </p>
        ` : ''}
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #1DA619; font-size: 14px; word-break: break-all;">
          ${isExistingUser ? projectUrl : signupUrl}
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}`

  await transporter.sendMail({
    from: `"Sevivra" <${FROM_EMAIL}>`,
    to: email,
    subject: 'Verify your email - Sevivra',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1DA619; margin: 0;">Sevivra</h1>
        </div>
        <h2 style="color: #1F2937;">Welcome, ${name}!</h2>
        <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
          Thank you for registering with Sevivra. Please verify your email address by clicking the button below.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #F26419; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #1DA619; font-size: 14px; word-break: break-all;">
          ${verificationUrl}
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 24 hours.
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
          If you didn't create an account with Sevivra, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
