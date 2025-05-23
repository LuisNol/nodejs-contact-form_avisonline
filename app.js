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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e3a8a 0%, #374151 50%, #111827 100%); min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1); overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #2563eb 100%); padding: 45px 35px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"20\" cy=\"20\" r=\"2\" fill=\"rgba(255,255,255,0.15)\"/><circle cx=\"80\" cy=\"40\" r=\"1.5\" fill=\"rgba(255,255,255,0.12)\"/><circle cx=\"40\" cy=\"80\" r=\"1\" fill=\"rgba(255,255,255,0.1)\"/><circle cx=\"60\" cy=\"20\" r=\"1.2\" fill=\"rgba(255,255,255,0.08)\"/></svg>'); opacity: 0.4;"></div>
            <div style="position: relative; z-index: 1;">
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1)); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2);">
                    <span style="font-size: 35px;">📧</span>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 30px; font-weight: 800; text-shadow: 0 4px 12px rgba(0,0,0,0.2); letter-spacing: -0.5px;">Nuevo Mensaje</h1>
                <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.95); font-size: 17px; font-weight: 400;">Has recibido un nuevo contacto</p>
            </div>
        </div>

        <!-- Content -->
        <div style="padding: 45px 35px;">
            <!-- Contact Details Card -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 12px 35px rgba(0,0,0,0.08); border: 1px solid rgba(59, 130, 246, 0.1); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; opacity: 0.06;"></div>
                <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: linear-gradient(135deg, #6b7280, #374151); border-radius: 50%; opacity: 0.04;"></div>
                
                <h2 style="margin: 0 0 25px 0; color: #1f2937; font-size: 22px; display: flex; align-items: center; gap: 12px; font-weight: 700; position: relative; z-index: 1;">
                    👤 Detalles del Contacto
                </h2>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 20px;">
                        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 12px; padding: 12px; box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25);">
                            <span style="color: white; font-size: 18px;">👨‍💼</span>
                        </div>
                        <div style="flex: 1;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Nombre Completo</p>
                            <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 18px; font-weight: 700;">${req.body.name}</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 20px;">
                        <div style="background: linear-gradient(135deg, #6b7280 0%, #374151 100%); border-radius: 12px; padding: 12px; box-shadow: 0 6px 20px rgba(107, 114, 128, 0.25);">
                            <span style="color: white; font-size: 18px;">📱</span>
                        </div>
                        <div style="flex: 1;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Teléfono</p>
                            <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 18px; font-weight: 700;">${req.body.phone}</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 18px;">
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; padding: 12px; box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);">
                            <span style="color: white; font-size: 18px;">📧</span>
                        </div>
                        <div style="flex: 1;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Email</p>
                            <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 18px; font-weight: 700; word-break: break-all;">${req.body.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Photo Reference -->
            ${req.file ? `
            <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 2px dashed rgba(59, 130, 246, 0.3); position: relative;">
                <div style="position: absolute; top: 10px; right: 15px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">NUEVO</div>
                <h3 style="margin: 0 0 20px 0; color: #1e40af; font-size: 20px; display: flex; align-items: center; gap: 12px; font-weight: 700;">
                    📸 Foto de Referencia
                </h3>
                <div style="text-align: center;">
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 16px; padding: 15px; display: inline-block; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 1px solid rgba(59, 130, 246, 0.1);">
                        <img src="cid:photo_references" alt="Photo Reference" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Message -->
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%); border-radius: 20px; padding: 30px; box-shadow: 0 12px 35px rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.2); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; opacity: 0.08;"></div>
                <h3 style="margin: 0 0 20px 0; color: #1e40af; font-size: 20px; display: flex; align-items: center; gap: 12px; font-weight: 700; position: relative; z-index: 1;">
                    💬 Mensaje del Cliente
                </h3>
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.8)); border-radius: 16px; padding: 25px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 8px 25px rgba(0,0,0,0.08); position: relative; z-index: 1;">
                    <div style="border-left: 4px solid #3b82f6; padding-left: 20px;">
                        <p style="margin: 0; color: #1f2937; font-size: 17px; line-height: 1.7; font-style: italic; font-weight: 400;">"${req.body.message}"</p>
                    </div>
                </div>
            </div>

            <!-- Action Section -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%); border-radius: 20px; padding: 30px; margin-top: 30px; border: 1px solid #d1d5db;">
                <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; text-align: center; font-weight: 700;">
                    ⚡ Acciones Recomendadas
                </h3>
                <div style="display: grid; gap: 15px;">
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-left: 4px solid #22c55e; border-radius: 12px; padding: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 400;">
                            <strong style="color: #16a34a; font-weight: 600;">📞 Respuesta rápida:</strong> Contacta al cliente en las próximas 2 horas
                        </p>
                    </div>
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-left: 4px solid #3b82f6; border-radius: 12px; padding: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 400;">
                            <strong style="color: #2563eb; font-weight: 600;">✅ Seguimiento:</strong> Programa una cita o consulta personalizada
                        </p>
                    </div>
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-left: 4px solid #6b7280; border-radius: 12px; padding: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 400;">
                            <strong style="color: #374151; font-weight: 600;">📝 Registro:</strong> Guarda la información en tu CRM
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #1f2937 100%); padding: 30px 35px; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                💡 <strong>Tip Profesional</strong>
            </p>
            <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 15px; font-weight: 400;">
                Una respuesta rápida y personalizada mejora significativamente la conversión de leads
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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e3a8a 0%, #374151 50%, #111827 100%); min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1); overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"25\" cy=\"25\" r=\"20\" fill=\"none\" stroke=\"rgba(255,255,255,0.1)\" stroke-width=\"0.5\"/><circle cx=\"75\" cy=\"75\" r=\"25\" fill=\"none\" stroke=\"rgba(255,255,255,0.08)\" stroke-width=\"0.5\"/></svg>'); opacity: 0.4;"></div>
            <div style="position: relative; z-index: 1;">
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1)); border-radius: 50%; width: 90px; height: 90px; margin: 0 auto 25px auto; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2);">
                    <span style="font-size: 45px;">✅</span>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 34px; font-weight: 800; text-shadow: 0 4px 12px rgba(0,0,0,0.2); letter-spacing: -0.5px;">¡Mensaje Recibido!</h1>
                <p style="margin: 20px 0 0 0; color: rgba(255,255,255,0.95); font-size: 19px; font-weight: 400;">Gracias por contactarnos, <strong>${req.body.name}</strong></p>
            </div>
        </div>

        <!-- Welcome Message -->
        <div style="padding: 45px 35px 0 35px;">
            <div style="text-align: center; margin-bottom: 40px;">
                <p style="margin: 0; color: #374151; font-size: 19px; line-height: 1.7; font-weight: 400;">
                    Hemos recibido tu mensaje con éxito y nos pondremos en contacto contigo muy pronto. 
                    <br><strong style="color: #2563eb; font-weight: 600;">¡Gracias por confiar en nosotros!</strong>
                </p>
            </div>

            <!-- Summary Card -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 24px; padding: 35px; margin-bottom: 35px; position: relative; overflow: hidden; border: 1px solid #e5e7eb;">
                <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; opacity: 0.08;"></div>
                <div style="position: absolute; bottom: -40px; left: -40px; width: 100px; height: 100px; background: linear-gradient(135deg, #6b7280, #374151); border-radius: 50%; opacity: 0.06;"></div>
                
                <h2 style="margin: 0 0 30px 0; color: #1f2937; font-size: 26px; text-align: center; position: relative; z-index: 1; font-weight: 700;">
                    📋 Resumen de tu Contacto
                </h2>
                
                <div style="position: relative; z-index: 1;">
                    <div style="display: grid; gap: 25px;">
                        <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-radius: 16px; padding: 25px; backdrop-filter: blur(10px); border: 1px solid rgba(59, 130, 246, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                            <div style="display: flex; align-items: center; gap: 20px;">
                                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 12px; padding: 15px; box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);">
                                    <span style="color: white; font-size: 22px;">👨‍💼</span>
                                </div>
                                <div>
                                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Nombre Completo</p>
                                    <p style="margin: 8px 0 0 0; color: #1f2937; font-size: 20px; font-weight: 700;">${req.body.name}</p>
                                </div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-radius: 16px; padding: 25px; backdrop-filter: blur(10px); border: 1px solid rgba(107, 114, 128, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                                <div style="text-align: center;">
                                    <div style="background: linear-gradient(135deg, #6b7280 0%, #374151 100%); border-radius: 10px; padding: 12px; margin-bottom: 15px; display: inline-block; box-shadow: 0 6px 20px rgba(107, 114, 128, 0.25);">
                                        <span style="color: white; font-size: 20px;">📱</span>
                                    </div>
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Teléfono</p>
                                    <p style="margin: 8px 0 0 0; color: #1f2937; font-size: 17px; font-weight: 600;">${req.body.phone}</p>
                                </div>
                            </div>

                            <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-radius: 16px; padding: 25px; backdrop-filter: blur(10px); border: 1px solid rgba(59, 130, 246, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                                <div style="text-align: center;">
                                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 10px; padding: 12px; margin-bottom: 15px; display: inline-block; box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);">
                                        <span style="color: white; font-size: 20px;">📧</span>
                                    </div>
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                                    <p style="margin: 8px 0 0 0; color: #1f2937; font-size: 17px; font-weight: 600; word-break: break-all;">${req.body.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Photo Reference -->
            ${req.file ? `
            <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%); border-radius: 24px; padding: 35px; margin-bottom: 35px; text-align: center; border: 1px solid #d1d5db;">
                <h3 style="margin: 0 0 25px 0; color: #1f2937; font-size: 22px; font-weight: 700;">
                    📸 Tu Foto de Referencia
                </h3>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 20px; padding: 20px; box-shadow: 0 12px 35px rgba(0,0,0,0.12); display: inline-block; border: 1px solid rgba(59, 130, 246, 0.1);">
                    <img src="cid:photo_references" alt="Photo Reference" style="max-width: 320px; width: 100%; height: auto; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
                </div>
            </div>
            ` : ''}

            <!-- Message -->
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%); border-radius: 24px; padding: 35px; margin-bottom: 35px; border: 1px solid rgba(59, 130, 246, 0.2);">
                <h3 style="margin: 0 0 25px 0; color: #1e40af; font-size: 22px; text-align: center; font-weight: 700;">
                    💬 Tu Mensaje
                </h3>
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9)); border-radius: 18px; padding: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 8px 25px rgba(0,0,0,0.08);">
                    <p style="margin: 0; color: #1f2937; font-size: 17px; line-height: 1.8; font-style: italic; font-weight: 400;">"${req.body.message}"</p>
                </div>
            </div>

            <!-- Next Steps -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 50%, #d1d5db 100%); border-radius: 24px; padding: 35px; margin-bottom: 45px; border: 1px solid #d1d5db;">
                <h3 style="margin: 0 0 25px 0; color: #1f2937; font-size: 22px; text-align: center; font-weight: 700;">
                    🚀 ¿Qué sigue ahora?
                </h3>
                <div style="display: grid; gap: 18px;">
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-left: 4px solid #3b82f6; border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <p style="margin: 0; color: #1f2937; font-size: 17px; font-weight: 400;">
                            <strong style="color: #2563eb; font-weight: 600;">⏰ Tiempo de respuesta:</strong> Te contactaremos en las próximas 24 horas
                        </p>
                    </div>
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-left: 4px solid #6b7280; border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <p style="margin: 0; color: #1f2937; font-size: 17px; font-weight: 400;">
                            <strong style="color: #374151; font-weight: 600;">📞 Revisión:</strong> Nuestro equipo analizará tu solicitud detalladamente
                        </p>
                    </div>
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-left: 4px solid #1e40af; border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <p style="margin: 0; color: #1f2937; font-size: 17px; font-weight: 400;">
                            <strong style="color: #1e40af; font-weight: 600;">✨ Propuesta:</strong> Te enviaremos una propuesta personalizada
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #1f2937 100%); padding: 35px; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 20px; font-weight: 700;">
                ¡Gracias por elegirnos! 🙏
            </p>
            <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 15px; font-weight: 400;">
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