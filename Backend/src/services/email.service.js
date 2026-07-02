const sgMail = require("@sendgrid/mail");

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Generic function to send email via SendGrid
 */
const sendSendGridEmail = async (to, subject, htmlContent) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✉️ SendGrid email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ SendGrid Email Error:", error.message);
    if (error.response) console.error(error.response.body);
  }
};

/**
 * Send Welcome Email based on signup provider
 */
const sendWelcomeEmail = async (email, name, provider = "local") => {
  let subject = "📚 Welcome to ExamPulse AI - Your Smart Study Companion!";
  let providerText = "creating your account";

  if (provider === "google") {
    subject = "🚀 ExamPulse AI - Successfully Connected with Google";
    providerText = "registering with your Google Account";
  } else if (provider === "github") {
    subject = "💻 ExamPulse AI - Successfully Connected with GitHub";
    providerText = "authorizing your account via GitHub";
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
      <h2 style="color: #4f46e5; text-align: center;">Welcome to ExamPulse AI, ${name}! 👋</h2>
      <p style="font-size: 16px; color: #333;">Thank you for ${providerText}. Your AI study partner is completely ready!</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #1e293b;">Next steps:</p>
        <p style="margin: 5px 0 0 0; color: #64748b;">Upload your textbook PDFs or notes, click "Predict Topics", and maximize your exam preparation productivity.</p>
      </div>
      <p style="font-size: 14px; color: #94a3b8; text-align: center;">Best regards,<br/>The ExamPulse Team</p>
    </div>
  `;

  await sendSendGridEmail(email, subject, htmlContent);
};

module.exports = { sendWelcomeEmail };
