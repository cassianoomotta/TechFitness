import nodemailer from "nodemailer";

interface SendInviteEmailParams {
  toEmail: string;
  studentName: string;
  trainerName: string;
  inviteUrl: string;
}

interface SendEmailResult {
  success: boolean;
  mode: "sent" | "simulated";
  messageId?: string;
  error?: string;
}

/**
 * Gera o template HTML oficial do TechFitness para convite de novos alunos
 */
function buildInviteEmailHtml(params: SendInviteEmailParams): string {
  const { studentName, trainerName, inviteUrl } = params;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite TechFitness</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      margin: 0;
      padding: 32px 16px;
    }
    .email-container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
    }
    .email-header {
      background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
      padding: 36px 32px;
      text-align: center;
      color: #FFFFFF;
    }
    .logo-badge {
      display: inline-block;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .logo-subtitle {
      font-size: 13px;
      color: #BFDBFE;
      font-weight: 500;
      margin: 0;
    }
    .email-content {
      padding: 36px 32px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 12px;
    }
    .text-p {
      font-size: 15px;
      color: #475569;
      margin-bottom: 20px;
    }
    .highlight-box {
      background-color: #EFF6FF;
      border-left: 4px solid #2563EB;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 28px;
    }
    .highlight-text {
      font-size: 14px;
      color: #1E3A8A;
      margin: 0;
      font-weight: 500;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563EB;
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .link-fallback {
      background-color: #F8FAFC;
      border: 1px dashed #CBD5E1;
      border-radius: 10px;
      padding: 12px;
      font-size: 12px;
      color: #64748B;
      word-break: break-all;
      margin-top: 24px;
    }
    .email-footer {
      border-top: 1px solid #E2E8F0;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #94A3B8;
      background-color: #F8FAFC;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo-badge">🏋️ TECHFITNESS</div>
      <p class="logo-subtitle">Treino Inteligente, Gamificação & Evolução de Carga</p>
    </div>
    <div class="email-content">
      <h2 class="greeting">Olá, ${studentName}! 👋</h2>
      <p class="text-p">
        Seu treinador <strong>${trainerName}</strong> acabou de cadastrar você na plataforma <strong>TechFitness</strong> para que você possa acompanhar suas fichas de treino, registrar seus check-ins, progredir cargas e competir de forma saudável na assessoria.
      </p>

      <div class="highlight-box">
        <p class="highlight-text">
          🚀 <strong>Próximo passo:</strong> Confirme seus dados, defina sua senha pessoal definitiva e comece a treinar hoje mesmo!
        </p>
      </div>

      <div class="cta-container">
        <a href="${inviteUrl}" target="_blank" class="cta-button">
          Confirmar Cadastro & Criar Senha →
        </a>
      </div>

      <div class="link-fallback">
        Caso o botão acima não funcione, copie e cole este link diretamente no seu navegador:<br>
        <a href="${inviteUrl}" style="color: #2563EB;">${inviteUrl}</a>
      </div>
    </div>
    <div class="email-footer">
      <p style="margin: 0 0 6px 0;">Este é um e-mail transacional automático enviado pela plataforma TechFitness.</p>
      <p style="margin: 0;">Se você não esperava por este convite, por favor desconsidere este e-mail.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Envia ou simula o envio do e-mail de convite para o novo aluno
 */
export async function sendStudentInviteEmail(
  params: SendInviteEmailParams
): Promise<SendEmailResult> {
  const { toEmail, studentName, trainerName, inviteUrl } = params;
  const emailHtml = buildInviteEmailHtml(params);

  // 1. Provedor Direto: Gmail SMTP (Nodemailer) - Sem necessidade de cadastro em terceiros ou domínio
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    try {
      const cleanPass = smtpPass.replace(/\s+/g, "");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: cleanPass,
        },
      });

      const senderFrom = process.env.SMTP_FROM || `TechFitness <${smtpUser}>`;
      const mailOptions = {
        from: senderFrom,
        to: toEmail,
        subject: `🏋️ ${studentName}, seu treinador ${trainerName} te convidou para o TechFitness!`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL GMAIL] Convite enviado com sucesso para ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, mode: "sent", messageId: info.messageId };
    } catch (err: unknown) {
      console.error("[EMAIL GMAIL] Falha ao enviar via Gmail SMTP:", err);
    }
  }

  // 2. Provedor Secundário: Brevo (Sendinblue) API v3 (caso BREVO_API_KEY esteja presente)
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      let senderName = "TechFitness";
      let senderEmail =
        process.env.BREVO_SENDER_EMAIL ||
        process.env.EMAIL_FROM ||
        "contato@techfitness.com.br";

      if (senderEmail.includes("<")) {
        const match = senderEmail.match(/(.*?)\s*<(.+)>/);
        if (match) {
          senderName = match[1].trim() || "TechFitness";
          senderEmail = match[2].trim();
        }
      }

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email: toEmail,
              name: studentName,
            },
          ],
          subject: `🏋️ ${studentName}, seu treinador ${trainerName} te convidou para o TechFitness!`,
          htmlContent: emailHtml,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { messageId?: string };
        console.log(`[EMAIL BREVO] Convite enviado com sucesso para ${toEmail}. MessageId: ${data?.messageId}`);
        return { success: true, mode: "sent", messageId: data?.messageId };
      } else {
        const errText = await response.text();
        console.warn(`[EMAIL BREVO] Falha no envio para ${toEmail}:`, errText);
      }
    } catch (err: unknown) {
      console.error("[EMAIL BREVO] Erro de conexão:", err);
    }
  }

  // 2. Provedor Secundário: Resend (caso RESEND_API_KEY esteja presente)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "TechFitness <contato@techfitness.com.br>",
          to: [toEmail],
          subject: `🏋️ ${studentName}, seu treinador ${trainerName} te convidou para o TechFitness!`,
          html: emailHtml,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { id?: string };
        console.log(`[EMAIL RESEND] Convite enviado com sucesso para ${toEmail}. ID: ${data?.id}`);
        return { success: true, mode: "sent", messageId: data?.id };
      } else {
        const errText = await response.text();
        console.warn(`[EMAIL RESEND] Erro ao enviar convite para ${toEmail}:`, errText);
      }
    } catch (err: unknown) {
      console.error("[EMAIL RESEND] Falha de conexão:", err);
    }
  }

  // Modo seguro / dev / simulação ativa com log claro no console
  console.log(`
╔════════════════════════════════════════════════════════════════════════════════
║ 📩 CONVITE DE ALUNO DISPARADO (MODO SIMULAÇÃO ATIVA / RESILIENTE)
╠════════════════════════════════════════════════════════════════════════════════
║ Para:        ${studentName} <${toEmail}>
║ Treinador:   ${trainerName}
║ Link Direto: ${inviteUrl}
╚════════════════════════════════════════════════════════════════════════════════
  `);

  return {
    success: true,
    mode: "simulated",
  };
}
