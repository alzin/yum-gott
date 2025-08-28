import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@yumgott.com',
      to: email,
      subject: '✅ Verify your Yum-Gott account',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Title (EN + AR) -->
          <h2 style="color: #4CAF50; text-align: center; margin-bottom: 8px;">Welcome to Yum-Gott!</h2>

          <!-- Intro (EN + AR) -->
          <p style="font-size: 16px; color: #333; margin-bottom: 6px;">
            Thank you for signing up! To activate your account, please confirm your email address by clicking the button below:
          </p>
          <p dir="rtl" style="direction: rtl; text-align: right; font-size: 15px; color: #444; margin-top: 0;">
            شكرًا لتسجيلك! لتفعيل حسابك، يرجى تأكيد بريدك الإلكتروني بالنقر على الزر أدناه:
          </p>

          <!-- CTA (English only) -->
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
              ✅ Verify My Email
            </a>
          </div>

          <!-- Expiry note (EN + AR) -->
          <p style="font-size: 14px; color: #555; margin-bottom: 6px;">
            This link will expire in <strong>24 hours</strong>. If you did not create this account, please ignore this email.
          </p>
          <p dir="rtl" style="direction: rtl; text-align: right; font-size: 14px; color: #555; margin-top: 0;">
            سينتهي صلاحية هذا الرابط خلال <strong>24 ساعة</strong>. إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد.
          </p>

          <!-- Deletion note (EN + AR) -->
          <p style="font-size: 14px; color: #555; margin-bottom: 6px;">
            <strong>Note:</strong> If you don't verify your email within 24 hours, your account will be automatically deleted.
          </p>
          <p dir="rtl" style="direction: rtl; text-align: right; font-size: 14px; color: #555; margin-top: 0;">
            <strong>ملاحظة:</strong> إذا لم تقم بتأكيد بريدك الإلكتروني خلال 24 ساعة، سيتم حذف حسابك تلقائيًا.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} Yum-Gott. All rights reserved.
          </p>
        </div>
      </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}
