const FormData = require('form-data');
const Mailgun = require('mailgun.js');

class EmailService {
  constructor() {
    const mailgun = new Mailgun(FormData);
    this.mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY
    });
    this.domain = process.env.MAILGUN_DOMAIN;
    this.from = process.env.MAILGUN_FROM;
  }

  async sendPasswordResetEmail(email, name, resetToken, resetUrl) {
    try {
      const data = await this.mg.messages.create(this.domain, {
        from: this.from,
        to: [email],
        subject: 'Recuperação de Senha - Organiza Aí',
        text: `
Olá ${name},

Você solicitou a recuperação de senha da sua conta no Organiza Aí.

Clique no link abaixo para redefinir sua senha:
${resetUrl}

Este link é válido por 1 hora.

Se você não solicitou a recuperação de senha, ignore este email.

Atenciosamente,
Equipe Organiza Aí
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">💰 Organiza Aí</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 32px;">
        <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 24px;">Recuperação de Senha</h2>
        
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          Olá <strong style="color: #111827;">${name}</strong>,
        </p>
        
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          Você solicitou a recuperação de senha da sua conta. Clique no botão abaixo para criar uma nova senha:
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Redefinir Senha
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
          Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
        </p>
        
        <p style="color: #6366f1; font-size: 14px; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 0 0 24px 0;">
          ${resetUrl}
        </p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #92400e; font-size: 14px; margin: 0;">
            ⚠️ Este link é válido por <strong>1 hora</strong>. Após esse período, você precisará solicitar um novo link.
          </p>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">
          Se você não solicitou a recuperação de senha, pode ignorar este email com segurança.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Organiza Aí. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
        `
      });

      console.log('Email de recuperação enviado:', data);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
