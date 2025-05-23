// OPCIÓN 1: Configuración actual con Gmail (puede tener problemas con dominios institucionales)
module.exports = {
    theme: "darkSky",
    service: 'gmail',
    user: "avisonlinestoreperu@gmail.com",
    pass: "pnni dflv whvp nzjn",
    from: '"AVISONLINE" <avisonlinestoreperu@gmail.com>',
    to: 'avisonlinestoreperu@gmail.com,caterno99@gmail.com',
    subject: 'Nuevo Contacto - AVISONLINE',
};

// OPCIÓN 2: Usar un servicio SMTP profesional (RECOMENDADO)
// SendGrid, Mailgun, Amazon SES, etc. tienen mejor reputación con dominios institucionales

/*
// Ejemplo con SendGrid (necesitas crear una cuenta gratuita en sendgrid.com)
module.exports = {
    theme: "darkSky",
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    user: "apikey", // Este valor es literal "apikey"
    pass: "TU_API_KEY_DE_SENDGRID", // Aquí va tu API key real
    from: '"AVISONLINE" <noreply@tudominio.com>', // Usa un dominio verificado
    to: 'avisonlinestoreperu@gmail.com,caterno99@gmail.com',
    subject: 'Nuevo Contacto - AVISONLINE',
};
*/

/*
// Ejemplo con Brevo (antes Sendinblue) - GRATIS hasta 300 emails/día
module.exports = {
    theme: "darkSky",
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    user: "TU_EMAIL_DE_BREVO",
    pass: "TU_SMTP_KEY_DE_BREVO",
    from: '"AVISONLINE" <avisonlinestoreperu@gmail.com>',
    to: 'avisonlinestoreperu@gmail.com,caterno99@gmail.com',
    subject: 'Nuevo Contacto - AVISONLINE',
};
*/

/*
// Ejemplo con Elastic Email - GRATIS hasta 100 emails/día
module.exports = {
    theme: "darkSky",
    host: "smtp.elasticemail.com",
    port: 2525,
    secure: false,
    user: "TU_EMAIL_DE_ELASTIC",
    pass: "TU_API_KEY_DE_ELASTIC",
    from: '"AVISONLINE" <avisonlinestoreperu@gmail.com>',
    to: 'avisonlinestoreperu@gmail.com,caterno99@gmail.com',
    subject: 'Nuevo Contacto - AVISONLINE',
};
*/