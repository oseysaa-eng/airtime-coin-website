export async function sendEmail(
  to: string,
  subject: string,
  message: string
) {
  console.log("📧 OTP EMAIL");
  console.log("To:", to);
  console.log("Message:", message);

  // later plug in:
  // SendGrid / Mailgun / AWS SES
}