const express = require("express");
const { engine } = require("express-handlebars");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const config = require('./config');
const crypto = require('crypto');

const app = express();
const bodyParser = require('body-parser');

// Configurar Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Middleware para procesar datos de formularios
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Carpeta estática
app.use("/public", express.static(path.join(__dirname, "public")));

// Configuración de multer para almacenamiento de archivos en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Cache para evitar envíos repetidos muy rápidos
const emailCache = new Map();
const CACHE_DURATION = 60000; // 1 minuto

// Función para limpiar el cache periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of emailCache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      emailCache.delete(key);
    }
  }
}, CACHE_DURATION);

// Iniciar servidor
app.listen(3000, () => console.log("Server Started on port 3000..."));

// Ruta principal
app.get("/", (req, res) => {
  res.render(config.theme);
});

// Función para generar un ID único para cada mensaje
function generateMessageId(domain) {
  return `<${crypto.randomBytes(16).toString('hex')}@${domain}>`;
}

// Función para detectar dominios institucionales
function isInstitutionalDomain(email) {
  const institutionalDomains = [
    '.edu.pe', '.gob.pe', '.mil.pe', '.org.pe',
    '.edu', '.gov', '.mil', '.org',
    '.ac.uk', '.edu.mx', '.edu.co'
  ];
  
  return institutionalDomains.some(domain => 
    email.toLowerCase().includes(domain)
  );
}

// Ruta para manejar el formulario
app.post("/send", upload.single("photo_references"), async (req, res) => {
  try {
    // Verificar si el email fue enviado recientemente
    const emailKey = req.body.email.toLowerCase();
    if (emailCache.has(emailKey)) {
      const lastSent = emailCache.get(emailKey);
      const timeSinceLastSent = Date.now() - lastSent;
      
      if (timeSinceLastSent < CACHE_DURATION) {
        return res.render(config.theme, { 
          msg: `
            <div class="alert alert-info alert-dismissible fade show" role="alert">
                Su mensaje anterior aún está siendo procesado. Por favor, espere ${Math.ceil((CACHE_DURATION - timeSinceLastSent) / 1000)} segundos antes de enviar otro mensaje.
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
          `
        });
      }
    }

    // Guardar en cache
    emailCache.set(emailKey, Date.now());

    // Generar IDs únicos para cada email
    const adminMessageId = generateMessageId('avisonline.com');
    const clientMessageId = generateMessageId('avisonline.com');
    const timestamp = new Date().toISOString();

    // Plantilla del correo para el administrador (sin cambios)
    const output = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Mensaje de Contacto</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dddddd;">
                    <tr>
                        <td style="background-color: #4a90e2; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Nuevo Contacto AVISONLINE</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <h2 style="color: #333333; font-size: 18px; margin-bottom: 20px;">Datos del Cliente:</h2>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 10px 0;"><strong>Nombre:</strong></td>
                                    <td style="padding: 10px 0;">${req.body.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;"><strong>Teléfono:</strong></td>
                                    <td style="padding: 10px 0;">${req.body.phone}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;"><strong>Email:</strong></td>
                                    <td style="padding: 10px 0;">${req.body.email}</td>
                                </tr>
                            </table>
                            
                            <h2 style="color: #333333; font-size: 18px; margin: 30px 0 20px 0;">Mensaje:</h2>
                            <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #4a90e2;">
                                <p style="margin: 0; color: #333333; line-height: 1.6;">${req.body.message}</p>
                            </div>
                            
                            <p style="margin-top: 30px; text-align: center; color: #777777; font-size: 12px;">
                                Recibido el ${new Date().toLocaleString('es-PE')}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    // Plantilla DIFERENTE para cada tipo de dominio
    const isInstitutional = isInstitutionalDomain(req.body.email);
    
    // Para dominios institucionales: email MUY simple, solo texto
    const institutionalClientEmail = `
Estimado/a ${req.body.name}:

Hemos recibido su mensaje correctamente.

Nuestro equipo revisará su consulta y nos pondremos en contacto con usted a la brevedad posible.

Atentamente,
AVISONLINE

---
Este es un mensaje automático. Por favor, no responda a este correo.
Si necesita contactarnos, use el formulario en nuestro sitio web.
    `;

    // Para otros dominios: HTML simple
    const regularClientEmail = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Contacto</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dddddd;">
                    <tr>
                        <td style="background-color: #4a90e2; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">¡Mensaje Recibido!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <h2 style="color: #4a90e2; font-size: 22px; margin-bottom: 20px;">AVISONLINE</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                Hola <strong>${req.body.name}</strong>,<br><br>
                                Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará y te contactaremos pronto.
                            </p>
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="background-color: #25d366; padding: 15px 30px; border-radius: 5px;">
                                        <a href="https://whatsapp.com/channel/0029Vb5G7PPADTOENpbzcb2D" style="color: #ffffff; text-decoration: none; font-weight: bold;">
                                            Únete a nuestro canal de WhatsApp
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #777777; font-size: 14px; margin-top: 30px;">
                                Gracias por confiar en nosotros.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f5f5f5; padding: 20px; text-align: center;">
                            <p style="margin: 0; color: #777777; font-size: 12px;">
                                AVISONLINE - Tu mejor opción en clasificados online
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const successAlert = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
          El mensaje ha sido enviado exitosamente
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
      </div>
    `;

    const failAlert = `
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
          No se pudo enviar el mensaje. Por favor, actualice esta página e intente nuevamente.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
      </div>
    `;

    // Crear un nuevo transporte para cada envío (evita problemas de conexión)
    const createTransporter = () => {
      return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        // Sin pool para evitar reutilización de conexiones
        pool: false,
        maxConnections: 1,
        rateDelta: 3000,
        rateLimit: 1,
      });
    };

    // Enviar correo al administrador
    const adminTransporter = createTransporter();
    
    const mailOptionsAdmin = {
      from: `"AVISONLINE" <${config.user}>`,
      to: config.to,
      subject: `Nuevo contacto - ${req.body.name} - ${Date.now()}`, // Subject único
      html: output,
      text: `Nuevo contacto de ${req.body.name} (${req.body.email}). Teléfono: ${req.body.phone}. Mensaje: ${req.body.message}`,
      messageId: adminMessageId,
      date: new Date(),
      attachments: req.file ? [
        {
          filename: req.file.originalname,
          path: req.file.path,
          cid: "photo_references",
        },
      ] : [],
      headers: {
        'Message-ID': adminMessageId,
        'Date': timestamp,
        'X-Entity-Ref-ID': crypto.randomBytes(16).toString('hex'),
        'X-Priority': '3', // Normal priority
        'Reply-To': req.body.email,
      }
    };

    const adminInfo = await adminTransporter.sendMail(mailOptionsAdmin);
    console.log("Admin email sent:", adminInfo.messageId);
    await adminTransporter.close();

    // Esperar antes de enviar al cliente
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Preparar opciones para el cliente según el tipo de dominio
    const clientTransporter = createTransporter();
    
    const baseClientOptions = {
      from: `"AVISONLINE" <${config.user}>`,
      to: req.body.email,
      subject: `Re: Confirmacion de Contacto #${Date.now().toString().slice(-6)}`, // Subject único y diferente
      messageId: clientMessageId,
      date: new Date(),
      headers: {
        'Message-ID': clientMessageId,
        'Date': new Date().toISOString(),
        'X-Entity-Ref-ID': crypto.randomBytes(16).toString('hex'),
        'X-Priority': '5', // Low priority
        'Auto-Submitted': 'auto-replied',
        'Precedence': 'bulk',
      }
    };

    let mailOptionsClient;
    
    if (isInstitutional) {
      // Para institucionales: solo texto plano
      mailOptionsClient = {
        ...baseClientOptions,
        text: institutionalClientEmail,
        // NO incluir HTML
      };
    } else {
      // Para otros: HTML y texto
      mailOptionsClient = {
        ...baseClientOptions,
        html: regularClientEmail,
        text: `Hola ${req.body.name}, hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará y te contactaremos pronto. Gracias por contactar con AVISONLINE.`,
      };
    }

    // Intentar enviar al cliente
    try {
      const clientInfo = await clientTransporter.sendMail(mailOptionsClient);
      console.log("Client email sent to", req.body.email, "- Type:", isInstitutional ? "Institutional" : "Regular");
      console.log("Client email ID:", clientInfo.messageId);
    } catch (clientError) {
      console.error("Error sending client email:", clientError);
      // No bloquear si falla el envío al cliente
    } finally {
      await clientTransporter.close();
    }

    res.render(config.theme, { msg: successAlert });

  } catch (error) {
    console.error("Error in send route:", error);
    
    // Eliminar del cache si hay error
    emailCache.delete(req.body.email.toLowerCase());
    
    res.render(config.theme, { 
      msg: `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            Error al procesar su solicitud. Por favor, intente nuevamente.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
      `
    });
  }
});