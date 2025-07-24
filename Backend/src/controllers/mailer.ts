import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

export const sendPasswordResetEmail = async (to: string, token: string) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const html = `
    <html>
      <body style="font-family: system-ui, Avenir, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 2rem; text-align: center; color: #213547;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">
          <h2 style="font-size: 2rem; font-weight: bold; color: #111827;">Password Reset Request</h2>
          <p style="margin-top: 1rem; font-size: 1rem;">
            We received a request to reset your password for your SpaceMatch account.
          </p>
          <p style="margin-top: 1rem;">
            If you made this request, click the button below to choose a new password:
          </p>
          <div style="margin-top: 2rem;">
            <a href="${resetLink}" 
              style="display: inline-block; background-color: #b91c1c; color: white; padding: 1rem 2.5rem; font-size: 1.25rem; font-weight: bold; text-decoration: none; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background-color 0.2s ease;">
              Reset Password
            </a>
          </div>
          <p style="margin-top: 2rem; font-size: 0.875rem; color: #6b7280;">
            This link will expire in 1 hour. If you didn’t request a password reset, you can ignore this email.
          </p>
          <p style="margin-top: 2rem; font-size: 0.875rem; color: #6b7280;">
            — The SpaceMatch Team
          </p>
        </div>
      </body>
    </html>
  `;

    const info = await transporter.sendMail({
        from: `"SpaceMatch Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset Your SpaceMatch Password',
        html,
    });

    console.log('📨 Password reset email sent:', info.messageId);
};

export const sendVerificationEmail = async (to: string, name: string, token: string) => {
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

    const html = `
    <html>
      <body style="font-family: system-ui, Avenir, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 2rem; text-align: center; color: #213547;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">
          <h2 style="font-size: 2rem; font-weight: bold; color: #111827;">Hi ${name},</h2>
          <p style="margin-top: 1rem; font-size: 1rem;">
            Thanks for registering with <strong>SpaceMatch</strong>!
          </p>
          <p style="margin-top: 1rem;">
            Please verify your email address to activate your account.
          </p>
          <div style="margin-top: 2rem;">
            <a href="${verificationUrl}" 
              style="display: inline-block; background-color: #b91c1c; color: white; padding: 1rem 2.5rem; font-size: 1.25rem; font-weight: bold; text-decoration: none; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background-color 0.2s ease;">
              Verify Email
            </a>
          </div>
          <p style="margin-top: 2rem; font-size: 0.875rem; color: #6b7280;">
            — The SpaceMatch Team
          </p>
        </div>
      </body>
    </html>
  `;

    const info = await transporter.sendMail({
        from: `"SpaceMatch Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify your email address',
        html,
    });
};


export const sendPasswordChangeNotification = async (to: string, name: string) => {
    const html = `
    <div style="font-family: system-ui, sans-serif; background-color: #ffffff; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px; margin: auto;">
        <h2 style="color: #1a1a1a;">Hi ${name},</h2>
        <p style="color: #333;">We wanted to let you know that your <strong>SpaceMatch</strong> password has been changed.</p>
        <p style="color: #333;">If you didn't make this change, please reset your password immediately or contact our support.</p>
        <p style="color: #555;">Best regards,<br><strong>SpaceMatch Team</strong></p>
    </div>
    `;

    const info = await transporter.sendMail({
        from: `"SpaceMatch Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your Password Was Changed',
        html
    });
};

export const sendAccountDeletionNotification = async (to: string, name: string) => {
    const html = `
    <div style="font-family: system-ui, sans-serif; background-color: #ffffff; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px; margin: auto;">
        <h2 style="color: #1a1a1a;">Hi ${name},</h2>
        <p style="color: #333;">Your account at <strong>SpaceMatch</strong> has been marked as deleted.</p>
        <p style="color: #333;">If this was a mistake or you wish to reactivate your account, please contact our support within the next 30 days.</p>
        <p style="color: #555;">We're sorry to see you go.<br><strong>SpaceMatch Team</strong></p>
    </div>
    `;

    const info = await transporter.sendMail({
        from: `"SpaceMatch Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your Account Was Deleted',
        html
    });
};

