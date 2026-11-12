import nodemailer from 'nodemailer';
import env from '../config/env.config.js';

const serviceNames = (booking) => (booking.services || []).map((item) => {
  const name = item.service?.name || 'Servicio';
  return `${name} × ${item.quantity}`;
});

const htmlFor = (booking, event) => {
  const confirmed = event === 'confirmed';
  const title = confirmed ? 'Reserva confirmada' : 'Reserva registrada';
  const intro = confirmed
    ? 'Tu turno quedó confirmado.'
    : 'Recibimos tu reserva. El estado actual es pendiente.';
  const services = serviceNames(booking).map((line) => `<li>${line}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;background:#0f1115;color:#e2e8f0;font-family:Segoe UI,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <p style="margin:0 0 12px;color:#93c5fd;font-size:12px;letter-spacing:.12em;text-transform:uppercase;">Turnos y Reservas</p>
      <h1 style="margin:0 0 12px;color:#ffffff;font-size:22px;">${title}</h1>
      <p style="margin:0 0 16px;line-height:1.5;">Hola ${booking.clientName}, ${intro}</p>
      <p style="margin:0 0 8px;"><strong style="color:#ffffff;">Fecha:</strong> ${booking.date} · ${booking.time}</p>
      <p style="margin:0 0 8px;"><strong style="color:#ffffff;">Estado:</strong> ${booking.status}</p>
      ${services ? `<ul style="padding-left:18px;line-height:1.6;">${services}</ul>` : ''}
    </div>
  </body>
</html>`;
};

export default class MailService {
  constructor() {
    this.mailerPromise = null;
  }

  async #resolveMailer() {
    if (this.mailerPromise) return this.mailerPromise;

    this.mailerPromise = this.#createMailer().catch((error) => {
      this.mailerPromise = null;
      throw error;
    });
    return this.mailerPromise;
  }

  async #createMailer() {
    const { host, port, user, pass, from } = env.smtp;
    if (host && user && pass) {
      return {
        from,
        transporter: nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        })
      };
    }

    try {
      const account = await nodemailer.createTestAccount();
      console.log(`SMTP no configurado. Se usa Ethereal (${account.user}).`);
      return {
        from,
        transporter: nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: { user: account.user, pass: account.pass }
        })
      };
    } catch (error) {
      console.warn(`Correo omitido: no hay SMTP y Ethereal no está disponible (${error.message}).`);
      return null;
    }
  }

  async sendBookingNotice(booking, event) {
    const mailer = await this.#resolveMailer();
    if (!mailer || !booking?.clientEmail) return null;

    const confirmed = event === 'confirmed';
    const info = await mailer.transporter.sendMail({
      from: mailer.from,
      to: booking.clientEmail,
      subject: confirmed ? 'Tu reserva fue confirmada' : 'Recibimos tu reserva',
      text: `${booking.clientName}, tu turno del ${booking.date} a las ${booking.time} está ${booking.status}.`,
      html: htmlFor(booking, event)
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`Vista previa del correo: ${preview}`);
    return info;
  }
}
