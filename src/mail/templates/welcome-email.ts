export function WelcomeEmailTemplate( username) {
  const App_Name = 'Start Innovation Trainee Portal';
  return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
        <tr>
            <td style="text-align: center;">
                <h1 style="color: #4CAF50;">Welcome to ${App_Name}</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px;">
                <p>Dear ${username},</p>
                <p>Congratulations and welcome to <strong>${App_Name}</strong>!</p>
                <p>We are thrilled to have you join our community. Your registration with us marks the beginning of an exciting journey, and we are here to support you every step of the way.</p>
                <p>As a registered member, you now have access to <strong>Personalized Weekly assesments</strong> That will enable us keep track of your growth. We are committed to providing you with the best possible experience, and we look forward to helping you achieve your goals.</p>
                <h3>Here are your next steps:</h3>
                <ol>
                    <li><strong>Explore Your Dashboard:</strong> Log in to your account <a href="[insert link]" style="color: #1E90FF;">here</a> and start exploring the features available to you.</li>
                    <li><strong>Complete Your Profile:</strong> Fill out your profile to help us serve you better.</li>
                    <li><strong>Stay Connected:</strong> Follow us on our social media channels: 
                        <a href="[insert link]" style="color: #1E90FF;">Facebook</a>, 
                        <a href="[insert link]" style="color: #1E90FF;">Twitter</a>, 
                        <a href="[insert link]" style="color: #1E90FF;">Instagram</a>.
                    </li>
                </ol>
                <p>If you have any questions or need assistance, our support team is here to help. Feel free to contact us at <a href="mailto:[support email]" style="color: #1E90FF;">meetjohnchima@gmail.com</a> or call us at <a href="tel:[phone number]" style="color: #1E90FF;">08108962245</a>.</p>
                <p>Thank you for choosing <strong>Start Innovation Hub</strong>. We are excited to have you with us and look forward to a successful partnership.</p>
                <p>Best regards,</p>
            </td>
        </tr>
    </table>
</div>`;
}
