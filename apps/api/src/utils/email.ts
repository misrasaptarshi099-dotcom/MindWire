import { Resend } from 'resend';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const resendApiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;

if (resendApiKey && !resendApiKey.startsWith('re_YOUR_')) {
  resend = new Resend(resendApiKey);
  logger.info('Resend API client initialized.');
} else {
  logger.warn('Resend API key is missing or invalid. Emails will be logged to console in mock mode.');
}

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const sendEnquiryEmail = async (email: string, name: string, referenceCode: string) => {
  const subject = 'MindWire AI & Robotics Workshop - Enquiry Received!';
  const html = `
    <div style="font-family: monospace; background-color: #0b0f19; color: #f8fafc; padding: 40px; border-radius: 8px;">
      <h1 style="color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">MINDWIRE // SYSTEM STATUS</h1>
      <p>Hello ${escapeHtml(name)},</p>
      <p>We have successfully received your registration enquiry for the <strong>AI & Robotics Summer Workshop 2026</strong>.</p>
      <div style="background-color: #1e293b; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <strong>Reference Code:</strong> <span style="font-size: 1.2rem; letter-spacing: 2px; color: #f59e0b;">${referenceCode}</span>
      </div>
      <p>To secure your child's seat, please complete the enrollment payment of ₹2,999. If you did not finish the payment during checkout, you can re-initiate it using your dashboard or email link.</p>
      <p>If you have any questions, reply directly to this email.</p>
      <br />
      <hr style="border: 0; border-top: 1px solid #1e293b;" />
      <p style="font-size: 0.8rem; color: #64748b;">MINDWIRE ROBOTICS SYSTEM DEPLOYMENT // SECURE LINK</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject,
        html,
      });
      logger.info(`Enquiry confirmation email sent successfully to ${email}`);
    } catch (error) {
      logger.error(`Failed to send enquiry email via Resend: ${(error as Error).message}`);
    }
  } else {
    logger.info(`[MOCK EMAIL] To: ${email}\nSubject: ${subject}\nBody: ${html}`);
  }
};

export const sendEnrollmentEmail = async (email: string, name: string, referenceCode: string, orderId: string) => {
  const subject = 'MindWire AI & Robotics Workshop - Enrollment Confirmed!';
  const html = `
    <div style="font-family: monospace; background-color: #0b0f19; color: #f8fafc; padding: 40px; border-radius: 8px;">
      <h1 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">MINDWIRE // ENROLLMENT SECURED</h1>
      <p>Hello ${escapeHtml(name)},</p>
      <p>Congratulations! Your payment has been successfully verified, and enrollment is <strong>CONFIRMED</strong> for the <strong>AI & Robotics Summer Workshop 2026</strong>.</p>
      <div style="background-color: #1e293b; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
        <strong>Reference Code:</strong> <span style="font-size: 1.2rem; letter-spacing: 2px; color: #10b981;">${referenceCode}</span><br/>
        <strong>Stripe Order ID:</strong> <span>${orderId}</span>
      </div>
      <p>Our workshop batch schedule and preparatory installation guides will be emailed to you shortly. Get ready for an amazing hands-on coding and robotics experience!</p>
      <br />
      <hr style="border: 0; border-top: 1px solid #1e293b;" />
      <p style="font-size: 0.8rem; color: #64748b;">MINDWIRE ROBOTICS SYSTEM DEPLOYMENT // VERIFIED ENROLLMENT</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject,
        html,
      });
      logger.info(`Enrollment confirmation email sent successfully to ${email}`);
    } catch (error) {
      logger.error(`Failed to send enrollment email via Resend: ${(error as Error).message}`);
    }
  } else {
    logger.info(`[MOCK EMAIL] To: ${email}\nSubject: ${subject}\nBody: ${html}`);
  }
};
