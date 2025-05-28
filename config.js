module.exports = {
    // Tema de la plantilla que se usará
    theme: "darkSky", // Cambia este valor según tu plantilla de Handlebars

    // Configuración del servidor SMTP
    service: 'gmail', // Usar el servicio de Gmail directamente
    user: "avisonlinestoreperu@gmail.com", // Tu correo de Gmail
    pass: "ujev nsut fjcs qafy", // La contraseña de la aplicación generada

    // Correo del remitente y destinatario
    from: '"Contact Me" <avisonlinestoreperu@gmail.com>', // El correo desde el cual se enviarán los mensajes
    to: 'avisonlinestoreperu@gmail.com,caterno99@gmail.com', // El correo al que se enviarán los mensajes (puedes usar varios correos separados por coma)
    subject: 'Contact Us', // Asunto del correo

    // Puedes añadir más configuraciones si es necesario
};
