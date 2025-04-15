export function generateVerificationOtpEmailTemplate(otpCode) {
  return `<table role="presentation" width="100%" max-width="400px" cellspacing="0" cellpadding="0" border="0" style="background:rgb(0, 0, 0); border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: auto;">
    <tr>
        <td style="background: #007BFF; padding: 20px; text-align: center; color: #ffffff; font-size: 24px; font-weight: bold;">
            Your OTP Code
        </td>
    </tr>
    <tr>
        <td style="padding: 20px; text-align: center;">
            <p style="font-size: 18px; color: #333;">Use the code below to proceed:</p>
            <p style="font-size: 28px; font-weight: bold; color: #007BFF; background: #f9f9f9; display: inline-block; padding: 12px 24px; border-radius: 8px;">
                ${otpCode}
            </p>
            <p style="font-size: 14px; color: #777; margin-top: 10px;">This code is valid for 15 minutes.</p>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px; text-align: center; font-size: 14px; color: #777;">
            If you didn’t request this, ignore this email.
        </td>
    </tr>
    <tr>
        <td style="padding: 20px; text-align: center; font-size: 14px; font: bold; color: #777;">
            - Team ReadULike
        </td>
    </tr>
</table>
`
}

export function generatePasswordEmailTemplate(resetPasswordUrl) {
 return `<table role="presentation" width="100%" max-width="400px" cellspacing="0" cellpadding="0" border="0" style="background:rgb(0, 0, 0); border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: auto;">
    <tr>
        <td style="background: #007BFF; padding: 20px; text-align: center; color: #ffffff; font-size: 24px; font-weight: bold;">
             🔐 Password Reset Request
        </td>
    </tr>
    <tr>
        <td style="padding: 20px; text-align: center;">
            <p style="font-size: 18px; color: #333;"> Click the button below to securely reset your password.</p>
            <a href="${resetPasswordUrl}" style="font-size: 28px; font-weight: bold; color: #007BFF; background: #f9f9f9; display: inline-block; padding: 12px 24px; border-radius: 8px;">
                Reset Here
            </a>
            <p style="font-size: 14px; color: #777; margin-top: 10px;">This is valid for 15 minutes.</p>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px; text-align: center; font-size: 14px; color: #777;">
            If you didn’t request this, you can safely ignore this email.
        </td>
    </tr>
    <tr>
        <td style="padding: 20px; text-align: center; font-size: 14px; font: bold; color: #777;">
            📚 — Team <strong>ReadULike Library</strong>
        </td>
    </tr>
</table>`
}