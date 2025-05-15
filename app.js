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
    <p>You have a message</p>
    <h3>Contact Details</h3>
    <p><strong>Name:</strong> ${req.body.name}</p>
    <p><strong>Phone:</strong> ${req.body.phone}</p>
    <p><strong>Email:</strong> ${req.body.email}</p>
    <p><strong>Photo Reference:</strong></p>
    <img src="cid:photo_references" alt="Photo Reference" style="width:100%; max-width:300px; height:auto;">
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // Plantilla del correo de confirmación para el cliente
  const clientConfirmation = `
    <p>Gracias Sr(a). ${req.body.name},</p>
    <p>Hemos recibido su correo con éxito. Con los siguientes datos:</p>
    <h3>Detalles del contacto:</h3>
    <p><strong>Nombre:</strong> ${req.body.name}</p>
    <p><strong>Teléfono:</strong> ${req.body.phone}</p>
    <p><strong>Correo Electrónico:</strong> ${req.body.email}</p>
    <p><strong>Foto Referencia:</strong></p>
    <img src="cid:photo_references" alt="Photo Reference" style="width:100%; max-width:300px; height:auto;">
    <h3>Mensaje:</h3>
    <p>${req.body.message}</p>
    <p>Nos pondremos en contacto con usted pronto.</p>
  `;

  const successAlert = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        El mensaje ha sido enviado
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
  `;

  const failAlert = `
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
        No se pudo enviar el mensaje. Actualice esta página.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
  `;

  // Configurar transporte nodemailer
  let transporter = nodemailer.createTransport({
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
    subject: config.subject,
    html: output,
    attachments: [
      {
        filename: req.file ? req.file.originalname : "no-image.jpg",
        path: req.file ? req.file.path : "",
        cid: "photo_references",
      },
    ],
  };

  // Opciones de correo para el cliente
  let mailOptionsClient = {
    from: config.from,
    to: req.body.email,
    subject: "Confirmación de contacto",
    html: clientConfirmation,
    attachments: [
      {
        filename: req.file ? req.file.originalname : "no-image.jpg",
        path: req.file ? req.file.path : "",
        cid: "photo_references",
      },
    ],
  };

  // Enviar correo al administrador
  transporter.sendMail(mailOptionsAdmin, (error, info) => {
    if (error) {
      return res.render(config.theme, { msg: failAlert });
    }

    // Enviar correo de confirmación al cliente
    transporter.sendMail(mailOptionsClient, (error, info) => {
      if (error) {
        return res.render(config.theme, { msg: failAlert });
      }

      res.render(config.theme, { msg: successAlert });
    });
  });
});
