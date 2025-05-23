// Importación de paquetes
const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const nodemailer = require("nodemailer");
const multer = require("multer");

// Configuración de parámetros
const config = require("./config");

// Inicialización de la aplicación Express
const app = express();

// Configuración del motor de plantillas (Handlebars)
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

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
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 30px; text-align: center; position: relative;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"20\" cy=\"20\" r=\"2\" fill=\"rgba(255,255,255,0.1)\"/><circle cx=\"80\" cy=\"40\" r=\"1.5\" fill=\"rgba(255,255,255,0.1)\"/><circle cx=\"40\" cy=\"80\" r=\"1\" fill=\"rgba(255,255,255,0.1)\"/></svg>'); opacity: 0.3;"></div>
                <div style="position: relative; z-index: 1;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">📧 Nuevo Mensaje</h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Has recibido un nuevo contacto</p>
                </div>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
                <!-- Contact Details Card -->
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; padding: 25px; margin-bottom: 25px; box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);">
                    <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                        👤 Detalles del Contacto
                    </h2>
                    <div style="space-y: 15px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                            <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 8px; backdrop-filter: blur(10px);">
                                <span style="font-size: 16px;">👨‍💼</span>
                            </div>
                            <div>
                                <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Nombre</p>
                                <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">${req.body.name}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                            <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 8px; backdrop-filter: blur(10px);">
                                <span style="font-size: 16px;">📱</span>
                            </div>
                            <div>
                                <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Teléfono</p>
                                <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">${req.body.phone}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 8px; backdrop-filter: blur(10px);">
                                <span style="font-size: 16px;">📧</span>
                            </div>
                            <div>
                                <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                                <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">${req.body.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Photo Reference -->
                ${req.file ? `
                <div style="background: #f8f9ff; border-radius: 15px; padding: 25px; margin-bottom: 25px; border: 2px dashed #e0e7ff;">
                    <h3 style="margin: 0 0 15px 0; color: #4338ca; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                        📸 Foto de Referencia
                    </h3>
                    <div style="text-align: center;">
                        <img src="cid:photo_references" alt="Photo Reference" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); transition: transform 0.3s ease;">
                    </div>
                </div>
                ` : ''}

                <!-- Message -->
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 15px; padding: 25px; box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);">
                    <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                        💬 Mensaje
                    </h3>
                    <div style="background: rgba(255,255,255,0.15); border-radius: 10px; padding: 20px; backdrop-filter: blur(10px);">
                        <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.6;">${req.body.message}</p>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                    💡 <strong>Tip:</strong> Responde rápidamente para mantener una buena experiencia del cliente
                </p>
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
        <title>Confirmación de Contacto</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.1); overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center; position: relative;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M20,20 Q50,5 80,20 Q95,50 80,80 Q50,95 20,80 Q5,50 20,20\" fill=\"none\" stroke=\"rgba(255,255,255,0.1)\" stroke-width=\"0.5\"/></svg>'); opacity: 0.3;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                        <span style="font-size: 40px;">✅</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">¡Mensaje Recibido!</h1>
                    <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.9); font-size: 18px;">Gracias por contactarnos, ${req.body.name}</p>
                </div>
            </div>

            <!-- Welcome Message -->
            <div style="padding: 40px 30px 0 30px;">
                <div style="text-align: center; margin-bottom: 35px;">
                    <p style="margin: 0; color: #4a5568; font-size: 18px; line-height: 1.6;">
                        Hemos recibido tu mensaje con éxito y nos pondremos en contacto contigo muy pronto. 
                        <br><strong style="color: #667eea;">¡Gracias por confiar en nosotros!</strong>
                    </p>
                </div>

                <!-- Summary Card -->
                <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; opacity: 0.7;"></div>
                    <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5;"></div>
                    
                    <h2 style="margin: 0 0 25px 0; color: #8b4513; font-size: 24px; text-align: center; position: relative; z-index: 1;">
                        📋 Resumen de tu Contacto
                    </h2>
                    
                    <div style="position: relative; z-index: 1;">
                        <div style="display: grid; gap: 20px;">
                            <div style="background: rgba(255,255,255,0.7); border-radius: 12px; padding: 20px; backdrop-filter: blur(5px);">
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <div style="background: #667eea; border-radius: 10px; padding: 12px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                                        <span style="color: white; font-size: 20px;">👨‍💼</span>
                                    </div>
                                    <div>
                                        <p style="margin: 0; color: #8b4513; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Nombre Completo</p>
                                        <p style="margin: 5px 0 0 0; color: #2d3748; font-size: 18px; font-weight: 700;">${req.body.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: rgba(255,255,255,0.7); border-radius: 12px; padding: 20px; backdrop-filter: blur(5px);">
                                    <div style="text-align: center;">
                                        <div style="background: #48bb78; border-radius: 8px; padding: 10px; margin-bottom: 10px; display: inline-block;">
                                            <span style="color: white; font-size: 18px;">📱</span>
                                        </div>
                                        <p style="margin: 0; color: #8b4513; font-size: 12px; font-weight: 600; text-transform: uppercase;">Teléfono</p>
                                        <p style="margin: 5px 0 0 0; color: #2d3748; font-size: 16px; font-weight: 600;">${req.body.phone}</p>
                                    </div>
                                </div>

                                <div style="background: rgba(255,255,255,0.7); border-radius: 12px; padding: 20px; backdrop-filter: blur(5px);">
                                    <div style="text-align: center;">
                                        <div style="background: #ed8936; border-radius: 8px; padding: 10px; margin-bottom: 10px; display: inline-block;">
                                            <span style="color: white; font-size: 18px;">📧</span>
                                        </div>
                                        <p style="margin: 0; color: #8b4513; font-size: 12px; font-weight: 600; text-transform: uppercase;">Email</p>
                                        <p style="margin: 5px 0 0 0; color: #2d3748; font-size: 16px; font-weight: 600; word-break: break-all;">${req.body.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Photo Reference -->
                ${req.file ? `
                <div style="background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; text-align: center;">
                    <h3 style="margin: 0 0 20px 0; color: #744c9e; font-size: 20px;">
                        📸 Tu Foto de Referencia
                    </h3>
                    <div style="background: white; border-radius: 15px; padding: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); display: inline-block;">
                        <img src="cid:photo_references" alt="Photo Reference" style="max-width: 300px; width: 100%; height: auto; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    </div>
                </div>
                ` : ''}

                <!-- Message -->
                <div style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 20px 0; color: #2c7a7b; font-size: 20px; text-align: center;">
                        💬 Tu Mensaje
                    </h3>
                    <div style="background: rgba(255,255,255,0.8); border-radius: 15px; padding: 25px; backdrop-filter: blur(5px);">
                        <p style="margin: 0; color: #2d3748; font-size: 16px; line-height: 1.8; font-style: italic;">"${req.body.message}"</p>
                    </div>
                </div>

                <!-- Next Steps -->
                <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 20px; padding: 30px; margin-bottom: 40px;">
                    <h3 style="margin: 0 0 20px 0; color: #2c5282; font-size: 20px; text-align: center;">
                        🚀 ¿Qué sigue ahora?
                    </h3>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: rgba(255,255,255,0.8); border-left: 4px solid #4299e1; border-radius: 8px; padding: 15px;">
                            <p style="margin: 0; color: #2d3748; font-size: 16px;">
                                <strong>⏰ Tiempo de respuesta:</strong> Te contactaremos en las próximas 24 horas
                            </p>
                        </div>
                        <div style="background: rgba(255,255,255,0.8); border-left: 4px solid #48bb78; border-radius: 8px; padding: 15px;">
                            <p style="margin: 0; color: #2d3748; font-size: 16px;">
                                <strong>📞 Revisión:</strong> Nuestro equipo analizará tu solicitud detalladamente
                            </p>
                        </div>
                        <div style="background: rgba(255,255,255,0.8); border-left: 4px solid #ed8936; border-radius: 8px; padding: 15px;">
                            <p style="margin: 0; color: #2d3748; font-size: 16px;">
                                <strong>✨ Propuesta:</strong> Te enviaremos una propuesta personalizada
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                    ¡Gracias por elegirnos! 🙏
                </p>
                <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                    Si tienes alguna pregunta adicional, no dudes en contactarnos.
                </p>
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

  // Configurar transporte nodemailer
  let transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Opciones de correo para el administrador
  let mailOptionsAdmin = {
    from: config.from,
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
  };

  // Opciones de correo para el cliente
  let mailOptionsClient = {
    from: config.from,
    to: req.body.email,
    subject: "✅ Confirmación de contacto - Hemos recibido tu mensaje",
    html: clientConfirmation,
    attachments: req.file ? [
      {
        filename: req.file.originalname,
        path: req.file.path,
        cid: "photo_references",
      },
    ] : [],
  };

  // Enviar correo al administrador
  transporter.sendMail(mailOptionsAdmin, (error, info) => {
    if (error) {
      console.error("Error sending admin email:", error);
      return res.render(config.theme, { msg: failAlert });
    }

    console.log("Admin email sent successfully:", info.messageId);

    // Enviar correo de confirmación al cliente
    transporter.sendMail(mailOptionsClient, (error, info) => {
      if (error) {
        console.error("Error sending client email:", error);
        return res.render(config.theme, { msg: failAlert });
      }

      console.log("Client email sent successfully:", info.messageId);
      res.render(config.theme, { msg: successAlert });
    });
  });
});