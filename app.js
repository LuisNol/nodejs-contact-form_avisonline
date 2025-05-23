const express = require("express");
const { engine } = require("express-handlebars");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const config = require('./config');

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

// Iniciar servidor
app.listen(3000, () => console.log("Server Started on port 3000..."));

// Ruta principal
app.get("/", (req, res) => {
  res.render(config.theme);
});

// Ruta para manejar el formulario
app.post("/send", upload.single("photo_references"), (req, res) => {
  // Plantilla del correo para el administrador
  const output = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo Mensaje de Contacto</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body, table, td, p { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; }
            .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border-radius: 16px; overflow: hidden; }
            
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
                position: relative;
            }
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
                z-index: 1;
            }
            .header-content {
                position: relative;
                z-index: 2;
            }
            
            .content { background-color: #ffffff; padding: 40px 35px; }
            
            .contact-info { 
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
                padding: 30px; 
                margin: 25px 0; 
                border-radius: 16px; 
                border: 1px solid #e2e8f0;
                box-shadow: 0 4px 15px rgba(0,0,0,0.04);
            }
            
            .message-box { 
                background: linear-gradient(135deg, #cce5ff 0%, #a8d1ff 100%); 
                padding: 30px; 
                margin: 25px 0; 
                border-radius: 16px; 
                border-left: 6px solid #1e40af;
                box-shadow: 0 4px 15px rgba(30, 64, 175, 0.1);
            }
            
            .photo-section {
                background: linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%);
                padding: 30px;
                margin: 25px 0;
                border-radius: 16px;
                text-align: center;
                border: 1px solid #e9d5ff;
                box-shadow: 0 4px 15px rgba(139, 92, 246, 0.08);
            }
            
            .footer { 
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            
            h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 700; 
                letter-spacing: -0.5px;
            }
            
            h2 { 
                color: #1e293b; 
                font-size: 20px; 
                font-weight: 600; 
                margin: 0 0 20px 0; 
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            p { 
                margin: 10px 0; 
                line-height: 1.6; 
                color: #475569;
                font-weight: 400;
            }
            
            .contact-item { 
                margin: 15px 0; 
                display: flex;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            .contact-item:last-child {
                border-bottom: none;
            }
            
            .label { 
                font-weight: 600; 
                color: #334155; 
                min-width: 80px;
                margin-right: 15px;
            }
            
            .value { 
                color: #0f172a; 
                font-weight: 500;
                flex: 1;
            }
            
            .message-text {
                font-size: 16px;
                line-height: 1.7;
                color: #0f172a;
                font-style: italic;
                margin: 0;
                padding: 20px;
                background: rgba(255,255,255,0.7);
                border-radius: 12px;
                border-left: 4px solid #1e40af;
            }
            
            .photo-img {
                max-width: 100%; 
                height: auto; 
                border-radius: 12px; 
                border: 2px solid #e9d5ff;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }
            
            .timestamp {
                font-size: 14px;
                color: #64748b;
                margin-top: 20px;
                text-align: center;
                font-weight: 400;
            }
            
            @media only screen and (max-width: 600px) {
                .container { 
                    width: 100% !important; 
                    margin: 0 !important; 
                    border-radius: 0 !important;
                }
                .content, .header { padding: 25px 20px !important; }
                h1 { font-size: 24px !important; }
                h2 { font-size: 18px !important; }
                .contact-info, .message-box, .photo-section { padding: 20px !important; }
                .contact-item { flex-direction: column; align-items: flex-start; }
                .label { min-width: auto; margin-right: 0; margin-bottom: 5px; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); min-height: 100vh;">
        <div style="padding: 20px 0;">
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <div class="header-content">
                        <h1>✉️ Nuevo Contacto AVISONLINE</h1>
                        <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.95; font-weight: 300;">
                            Se ha recibido una nueva solicitud de contacto
                        </p>
                    </div>
                </div>

                <!-- Content -->
                <div class="content">
                    <!-- Contact Details -->
                    <div class="contact-info">
                        <h2>👤 Datos del Cliente</h2>
                        <div class="contact-item">
                            <span class="label">Nombre:</span>
                            <span class="value">${req.body.name}</span>
                        </div>
                        <div class="contact-item">
                            <span class="label">Teléfono:</span>
                            <span class="value">${req.body.phone}</span>
                        </div>
                        <div class="contact-item">
                            <span class="label">Email:</span>
                            <span class="value">${req.body.email}</span>
                        </div>
                    </div>

                    <!-- Photo Reference -->
                    ${req.file ? `
                    <div class="photo-section">
                        <h2>📸 Imagen de Referencia</h2>
                        <img src="cid:photo_references" alt="Imagen de referencia del cliente" class="photo-img">
                    </div>
                    ` : ''}

                    <!-- Message -->
                    <div class="message-box">
                        <h2>💬 Mensaje del Cliente</h2>
                        <div class="message-text">"${req.body.message}"</div>
                    </div>

                    <!-- Timestamp -->
                    <div class="timestamp">
                        📅 Recibido el ${new Date().toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p style="margin: 0; font-size: 16px; font-weight: 500;">
                        <strong>AVISONLINE</strong> - Panel de Administración
                    </p>
                    <p style="margin: 10px 0 0 0; opacity: 0.8; font-weight: 300;">
                        Sistema de gestión de contactos
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  // Plantilla del correo de confirmación para el cliente
  const clientConfirmation = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Gracias por contactarnos!</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            
            body, table, td, p { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; }
            .container { 
                max-width: 650px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                box-shadow: 0 20px 60px rgba(0,0,0,0.12);
                border-radius: 20px;
                overflow: hidden;
            }
            
            .header { 
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); 
                color: white; 
                padding: 50px 30px; 
                text-align: center; 
                position: relative;
                overflow: hidden;
            }
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: shimmer 3s ease-in-out infinite;
            }
            @keyframes shimmer {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
                50% { transform: translate(-30%, -30%) scale(1.1); opacity: 0.1; }
            }
            
            .header-content {
                position: relative;
                z-index: 2;
            }
            
            .content { 
                padding: 50px 35px; 
                text-align: center; 
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            }
            
            .logo { 
                width: 140px; 
                height: 140px; 
                margin: 0 auto 30px; 
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                box-shadow: 0 15px 40px rgba(30, 64, 175, 0.4);
                position: relative;
                overflow: hidden;
            }
            .logo::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: logoShine 2s ease-in-out infinite;
            }
            @keyframes logoShine {
                0% { left: -100%; }
                50%, 100% { left: 100%; }
            }
            
            .whatsapp-btn { 
                display: inline-block; 
                background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); 
                color: white; 
                text-decoration: none; 
                padding: 18px 40px; 
                border-radius: 50px; 
                font-weight: 600; 
                font-size: 16px;
                margin: 25px 0; 
                transition: all 0.3s ease; 
                box-shadow: 0 10px 30px rgba(37, 211, 102, 0.4);
                position: relative;
                overflow: hidden;
            }
            .whatsapp-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            .whatsapp-btn:hover::before {
                left: 100%;
            }
            .whatsapp-btn:hover { 
                transform: translateY(-3px) scale(1.05); 
                text-decoration: none; 
                color: white; 
                box-shadow: 0 15px 35px rgba(37, 211, 102, 0.5);
            }
            
            .footer { 
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%); 
                color: white; 
                padding: 35px; 
                text-align: center; 
            }
            
            h1 { 
                margin: 0; 
                font-size: 32px; 
                font-weight: 800; 
                letter-spacing: -0.5px;
                text-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .brand { 
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-size: 28px; 
                font-weight: 900; 
                margin: 25px 0; 
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            
            .main-text {
                font-size: 18px; 
                color: #475569; 
                line-height: 1.7; 
                margin: 30px 0;
                font-weight: 400;
            }
            
            .sub-text {
                font-size: 16px; 
                color: #64748b; 
                margin: 25px 0 0 0;
                font-weight: 400;
                line-height: 1.6;
            }
            
            .welcome-message {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                padding: 25px;
                border-radius: 16px;
                margin: 30px 0;
                border-left: 5px solid #1e40af;
            }
            
            .footer-brand {
                font-size: 20px;
                font-weight: 700;
                margin: 0;
                letter-spacing: 0.5px;
            }
            
            .footer-tagline {
                margin: 8px 0 0 0; 
                opacity: 0.85; 
                font-weight: 300;
                font-size: 14px;
            }
            
            @media only screen and (max-width: 600px) {
                .container { 
                    width: 100% !important; 
                    margin: 0 !important; 
                    border-radius: 0 !important;
                }
                .content, .header { padding: 35px 25px !important; }
                .logo { width: 120px; height: 120px; }
                h1 { font-size: 26px !important; }
                .brand { font-size: 24px !important; }
                .whatsapp-btn { 
                    padding: 15px 35px !important; 
                    font-size: 15px !important; 
                }
                .main-text { font-size: 16px !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); min-height: 100vh;">
        <div style="padding: 20px 0;">
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <div class="header-content">
                        <h1>🎉 ¡Mensaje Recibido!</h1>
                        <p style="margin: 20px 0 0 0; font-size: 18px; opacity: 0.95; font-weight: 300;">
                            Hola <strong>${req.body.name}</strong>, hemos recibido tu consulta
                        </p>
                    </div>
                </div>

                <!-- Content -->
                <div class="content">
                    <!-- Logo -->
                    <div class="logo">
                        <span style="font-size: 60px; color: white;">📢</span>
                    </div>

                    <!-- Brand -->
                    <div class="brand">AVISONLINE</div>

                    <!-- Welcome Message -->
                    <div class="welcome-message">
                        <p style="margin: 0; font-size: 16px; color: #0f172a; font-weight: 500;">
                            ✅ Tu mensaje ha sido registrado correctamente en nuestro sistema
                        </p>
                    </div>

                    <p class="main-text">
                        Nuestro equipo revisará tu consulta y te contactaremos a la brevedad para brindarte la mejor atención personalizada.
                    </p>

                    <!-- WhatsApp Button -->
                    <a href="https://whatsapp.com/channel/0029Vb5G7PPADTOENpbzcb2D" class="whatsapp-btn">
                        📱 Únete a nuestro canal de WhatsApp
                    </a>

                    <p class="sub-text">
                        Mantente al día con nuestras últimas noticias, ofertas especiales y contenido exclusivo
                    </p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p class="footer-brand">AVISONLINE</p>
                    <p class="footer-tagline">Tu mejor opción en clasificados online</p>
                </div>
            </div>
        </div>
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

  // Configurar transporte nodemailer con configuración SMTP completa
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // Opciones adicionales para mejorar la entrega
    dkim: config.dkim, // Si tienes DKIM configurado
    pool: true, // Usar conexiones en pool
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
  });

  // Opciones de correo para el administrador
  let mailOptionsAdmin = {
    from: `"AVISONLINE" <${config.user}>`, // Formato más profesional
    to: config.to,
    subject: `🔔 ${config.subject}`,
    html: output,
    attachments: req.file ? [
      {
        filename: req.file.originalname,
        path: req.file.path,
        cid: "photo_references",
      },
    ] : [],
    headers: {
      'X-Priority': '1', // Prioridad alta
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    },
    // Mejora la entrega a servidores externos
    dsn: {
      id: `mensaje-${Date.now()}@avisonline.com`,
      return: 'headers',
      notify: ['success', 'failure', 'delay'],
      recipient: config.user
    }
  };

  // Opciones de correo para el cliente
  let mailOptionsClient = {
    from: `"AVISONLINE" <${config.user}>`, // Formato más profesional
    to: req.body.email,
    subject: "✅ Confirmación de contacto - Hemos recibido tu mensaje",
    html: clientConfirmation,
    headers: {
      'X-Priority': '1', // Prioridad alta
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    },
    // Mejora la entrega a servidores externos
    dsn: {
      id: `confirmacion-${Date.now()}@avisonline.com`,
      return: 'headers',
      notify: ['success', 'failure', 'delay'],
      recipient: config.user
    }
  };

  // Enviar correo al administrador con mejor manejo de errores
  transporter.sendMail(mailOptionsAdmin, (error, info) => {
    if (error) {
      console.error("Error sending admin email:", error);
      return res.render(config.theme, { msg: failAlert });
    }

    console.log("Admin email sent successfully:", info.messageId);
    
    // Verificar si hay información de entrega
    if (info.accepted && info.accepted.length > 0) {
      console.log("Email accepted by:", info.accepted);
    }
    if (info.rejected && info.rejected.length > 0) {
      console.error("Email rejected by:", info.rejected);
    }

    // Enviar correo de confirmación al cliente
    transporter.sendMail(mailOptionsClient, (error, info) => {
      if (error) {
        console.error("Error sending client email:", error);
        return res.render(config.theme, { msg: failAlert });
      }

      console.log("Client email sent successfully:", info.messageId);
      
      // Verificar si hay información de entrega
      if (info.accepted && info.accepted.length > 0) {
        console.log("Email accepted by:", info.accepted);
      }
      if (info.rejected && info.rejected.length > 0) {
        console.error("Email rejected by:", info.rejected);
      }
      
      res.render(config.theme, { msg: successAlert });
    });
  });
});