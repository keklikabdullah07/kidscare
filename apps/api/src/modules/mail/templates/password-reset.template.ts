export interface PasswordResetTemplateParams {
  recipientEmail: string;
  resetUrl: string;
  expiresInMinutes?: number;
  tenantName?: string;
}

export function buildPasswordResetEmail(params: PasswordResetTemplateParams): {
  subject: string;
  html: string;
  text: string;
} {
  const minutes = params.expiresInMinutes ?? 15;
  const schoolLabel = params.tenantName ? ` (${params.tenantName})` : '';
  const subject = `KidsCare${schoolLabel} — Şifre Sıfırlama Bağlantısı`;

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF9F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(17, 94, 89, 0.06); overflow: hidden;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #115e59; padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                KidsCare
              </h1>
              <p style="margin: 6px 0 0; color: #99f6e4; font-size: 13px; font-weight: 500;">
                Yeni Nesil Kreş & Anaokulu Yönetim Sistemi
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #0f172a;">
                Şifre Sıfırlama Talebi
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
                Merhaba,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
                <strong>${params.recipientEmail}</strong> kayıtlı hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki bağlantıya tıklayabilirsiniz:
              </p>

              <!-- Tactile Button Wrapper -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #115e59; box-shadow: 0 3px 0 0 #042f2e, 0 6px 14px rgba(17, 94, 89, 0.25);">
                    <a href="${params.resetUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
                      🔑 Yeni Şifremi Belirle
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 14px; margin: 24px 0 16px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #92400E;">
                  ⏳ <strong>Dikkat:</strong> Bu bağlantı güvenlik nedeniyle <strong>${minutes} dakika</strong> geçerlidir ve yalnızca tek bir kez kullanılabilir.
                </p>
              </div>

              <p style="margin: 16px 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                Eğer bu talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayınız. Mevcut şifreniz değişmeyecektir.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 18px 24px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © 2026 KidsCare Platformu. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
KidsCare — Şifre Sıfırlama Talebi

Merhaba,
${params.recipientEmail} hesabınız için şifre sıfırlama talebinde bulundunuz.

Yeni şifrenizi belirlemek için aşağıdaki bağlantıyı kullanabilirsiniz:
${params.resetUrl}

Bu bağlantı ${minutes} dakika boyunca geçerlidir ve yalnızca bir kez kullanılabilir.
Eğer bu talebi siz yapmadıysanız lütfen bu mesajı dikkate almayınız.
  `.trim();

  return { subject, html, text };
}
