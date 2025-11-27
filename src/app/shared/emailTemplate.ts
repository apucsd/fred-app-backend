import { sendEmail } from '../utils/sendMail';

// ============ EMAIL TEMPLATE BASE ============
const createEmailTemplate = (content: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
</head>
<body style="background-color: #f3f4f6; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    ${content}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

// ============ HEADER COMPONENT ============
const createHeader = (title: string, subtitle: string, logo: string = '🔐') => {
    return `
    <!-- Header -->
    <tr>
        <td style="background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); padding: 50px 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">${logo}</div>
            <p style="color: #E0E7FF; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">OVERLANDING OUTPOST</p>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">${title}</h1>
            <p style="color: #C7D2FE; font-size: 16px; margin: 0;">${subtitle}</p>
        </td>
    </tr>`;
};

// ============ OTP EMAIL TEMPLATE ============
export const sendOtpViaMail = async (to: string, OTP: string) => {
    const otpDigits = OTP.split('');

    const content = `
    ${createHeader('Verify Your E-Mail Address', 'THANKS FOR SIGNING UP!', '📧')}
    
    <!-- Content -->
    <tr>
        <td style="padding: 50px 40px; text-align: center;">
            <p style="color: #1F2937; font-size: 18px; margin: 0 0 8px 0;">Hello,</p>
            <p style="color: #6B7280; font-size: 16px; margin: 0 0 40px 0;">Please use the following One Time Password (OTP)</p>
            
            <!-- OTP Boxes -->
            <table cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                    ${otpDigits
                        .map(
                            (digit) => `
                        <td style="padding: 0 6px;">
                            <div style="width: 60px; height: 70px; border: 2px solid #4F46E5; border-radius: 8px; display: flex; align-items: center; justify-content: center; background-color: #F9FAFB;">
                                <span style="color: #4F46E5; font-size: 32px; font-weight: 700; font-family: 'Courier New', monospace;">${digit}</span>
                            </div>
                        </td>
                    `
                        )
                        .join('')}
                </tr>
            </table>
            
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0;">This passcode will only be valid for the next <strong style="color: #1F2937;">2 minutes</strong>.</p>
            <p style="color: #9CA3AF; font-size: 13px; margin: 0 0 40px 0;">If the passcode does not work, you can request a new one.</p>
            
            <!-- Security Notice -->
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 20px; text-align: left; margin: 40px 0;">
                <p style="color: #92400E; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">⚠️ Security Alert</p>
                <p style="color: #78350F; font-size: 13px; line-height: 1.6; margin: 0;">
                    Never share this code with anyone. Our team will never ask for your verification code. If you didn't request this code, please ignore this email and secure your account.
                </p>
            </div>
            
            <!-- Support -->
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #E5E7EB;">
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0;">Need help?</p>
                <p style="color: #9CA3AF; font-size: 13px; margin: 0;">
                    Contact our support team at 
                    <a href="mailto:support@overlandingoutpost.com" style="color: #4F46E5; text-decoration: none; font-weight: 500;">support@overlandingoutpost.com</a>
                </p>
            </div>
        </td>
    </tr>
    
    `;

    const html = createEmailTemplate(content);
    await sendEmail(to, html, 'Your Verification Code');
};

export const forgetPasswordMail = async (to: string, OTP: string) => {
    const otpDigits = OTP.split('');

    const content = `
    ${createHeader('Forgot Password Request', 'PASSWORD RECOVERY OTP', '🔐')}
    
    <!-- Content -->
    <tr>
        <td style="padding: 50px 40px; text-align: center;">
            <p style="color: #1F2937; font-size: 18px; margin: 0 0 8px 0;">Hello,</p>
            <p style="color: #6B7280; font-size: 16px; margin: 0 0 40px 0;">
                You requested to recover your account. Please use the following OTP to continue with resetting your password.
            </p>
            
            <!-- OTP Boxes -->
            <table cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                    ${otpDigits
                        .map(
                            (digit) => `
                        <td style="padding: 0 6px;">
                            <div style="width: 60px; height: 70px; border: 2px solid #EF4444; border-radius: 8px; display: flex; align-items: center; justify-content: center; background-color: #FEF2F2;">
                                <span style="color: #DC2626; font-size: 32px; font-weight: 700; font-family: 'Courier New', monospace;">${digit}</span>
                            </div>
                        </td>
                    `
                        )
                        .join('')}
                </tr>
            </table>

            <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0;">
                This OTP is valid for the next <strong style="color: #1F2937;">2 minutes</strong>.
            </p>
            <p style="color: #9CA3AF; font-size: 13px; margin: 0 0 40px 0;">
                If you did not request a password reset, please ignore this email.
            </p>
    `;

    const html = createEmailTemplate(content);
    await sendEmail(to, html, 'Your Password Recovery OTP');
};

// ============ LINK VERIFICATION EMAIL TEMPLATE ============
export const sendLinkViaMail = async (to: string, link: string) => {
    const content = `
    ${createHeader('Verify Your Account', 'Complete your registration', '✉️')}
    
    <!-- Content -->
    <tr>
        <td style="padding: 50px 40px; text-align: center;">
            <div style="margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #A5F3FC 0%, #67E8F9 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(103, 232, 249, 0.3);">
                    <span style="font-size: 36px;">✉️</span>
                </div>
                <h2 style="color: #1F2937; font-size: 24px; font-weight: 600; margin: 0 0 12px 0;">Almost There!</h2>
                <p style="color: #6B7280; font-size: 16px; line-height: 1.6; margin: 0 auto; max-width: 400px;">
                    We've sent you this email to verify your account. Click the button below to complete your registration and join the Overlanding Outpost community.
                </p>
            </div>
            
            <!-- CTA Button -->
            <div style="margin: 40px 0;">
                <a href="${link}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                    VERIFY MY ACCOUNT
                </a>
            </div>
            
            <!-- Alternative Link -->
            <div style="background-color: #F9FAFB; border-radius: 8px; padding: 24px; margin: 40px 0; text-align: left;">
                <p style="color: #1F2937; font-size: 14px; font-weight: 500; margin: 0 0 12px 0;">Trouble clicking the button?</p>
                <p style="color: #6B7280; font-size: 13px; margin: 0 0 8px 0;">Copy and paste this link into your browser:</p>
                <div style="background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #E5E7EB; margin-top: 8px;">
                    <a href="${link}" style="color: #4F46E5; text-decoration: none; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">${link}</a>
                </div>
            </div>
            
            <!-- Security Notice -->
            <div style="background: linear-gradient(135deg, rgba(165, 243, 252, 0.1) 0%, rgba(103, 232, 249, 0.05) 100%); border-radius: 8px; padding: 20px; border: 1px solid rgba(103, 232, 249, 0.3);">
                <p style="color: #6B7280; font-size: 13px; margin: 0;">
                    <span style="color: #1F2937; font-weight: 500;">Security Notice:</span> This verification link will expire in <strong>1 hour</strong> for your security. If you didn't request this verification, you can safely ignore this email.
                </p>
            </div>
        </td>
    </tr>
    
    `;

    const html = createEmailTemplate(content);
    await sendEmail(to, html, 'Verify Your Account');
};

// ============ PASSWORD RESET EMAIL TEMPLATE ============
export const sendPasswordResetOtp = async (to: string, OTP: string) => {
    const otpDigits = OTP.split('');

    const content = `
    ${createHeader('Reset Your Password', 'PASSWORD RECOVERY', '🔑')}
    
    <!-- Content -->
    <tr>
        <td style="padding: 50px 40px; text-align: center;">
            <p style="color: #1F2937; font-size: 18px; margin: 0 0 8px 0;">Hello,</p>
            <p style="color: #6B7280; font-size: 16px; margin: 0 0 40px 0;">Use this OTP to reset your password</p>
            
            <!-- OTP Boxes -->
            <table cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 30px;">
                <tr>
                    ${otpDigits
                        .map(
                            (digit) => `
                        <td style="padding: 0 6px;">
                            <div style="width: 60px; height: 70px; border: 2px solid #4F46E5; border-radius: 8px; display: flex; align-items: center; justify-content: center; background-color: #F9FAFB;">
                                <span style="color: #4F46E5; font-size: 32px; font-weight: 700; font-family: 'Courier New', monospace;">${digit}</span>
                            </div>
                        </td>
                    `
                        )
                        .join('')}
                </tr>
            </table>
            
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0;">This passcode will only be valid for the next <strong style="color: #1F2937;">2 minutes</strong>.</p>
            <p style="color: #9CA3AF; font-size: 13px; margin: 0 0 40px 0;">If you didn't request a password reset, please ignore this email.</p>
            
            <!-- Security Notice -->
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 20px; text-align: left; margin: 40px 0;">
                <p style="color: #92400E; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">⚠️ Security Alert</p>
                <p style="color: #78350F; font-size: 13px; line-height: 1.6; margin: 0;">
                    If you didn't request this password reset, someone may be trying to access your account. Please secure your account immediately and contact our support team.
                </p>
            </div>
        </td>
    </tr>
    
    `;

    const html = createEmailTemplate(content);
    await sendEmail(to, html, 'Password Reset Code');
};
