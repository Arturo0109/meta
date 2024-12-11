const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
const MetaProvider = require('@bot-whatsapp/provider/meta');
const MySQLAdapter = require('@bot-whatsapp/database/mysql');

const MYSQL_DB_HOST = 'localhost';
const MYSQL_DB_USER = 'usr';
const MYSQL_DB_PASSWORD = 'pass';
const MYSQL_DB_NAME = 'bot';
const MYSQL_DB_PORT = '3306';

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario']);
const flowDocs = addKeyword(['doc', 'documentacion', 'documentación']).addAnswer(
    [
        '📄 Aquí encontras las documentación recuerda que puedes mejorarla',
        'https://bot-whatsapp.netlify.app/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
);
const flowTuto = addKeyword(['tutorial', 'tuto']).addAnswer(
    [
        '🙌 Aquí encontras un ejemplo rapido',
        'https://bot-whatsapp.netlify.app/docs/example/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
);
const flowGracias = addKeyword(['gracias', 'grac']).addAnswer(
    [
        '🚀 Puedes aportar tu granito de arena a este proyecto',
        '[*opencollective*] https://opencollective.com/bot-whatsapp',
        '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
        '[*patreon*] https://www.patreon.com/leifermendez',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
);
const flowDiscord = addKeyword(['discord']).addAnswer(
    ['🤪 Únete al discord', 'https://link.codigoencasa.com/DISCORD', '\n*2* Para siguiente paso.'],
    null,
    null,
    [flowSecundario]
);
const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('🙌 Hola bienvenido a este *Chatbot*')
    .addAnswer(
        [
            'te comparto los siguientes links de interés sobre el proyecto',
            '👉 *doc* para ver la documentación',
            '👉 *gracias*  para ver la lista de videos',
            '👉 *discord* unirte al discord',
        ],
        null,
        null,
        [flowDocs, flowGracias, flowTuto, flowDiscord]
    );

const adapterDB = new MySQLAdapter({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    database: MYSQL_DB_NAME,
    password: MYSQL_DB_PASSWORD,
    port: MYSQL_DB_PORT,
});
const adapterFlow = createFlow([flowPrincipal]);

const adapterProvider = createProvider(MetaProvider, {
    jwtToken: 'jwtToken',
    numberId: 'numberId',
    verifyToken: 'EAAVVlgE0qZC8BO4kvDHDFsSGIpYoKgt5oQZBlAKX3qKHx8pmAmWxA4SuNog0eRwYzrfDWh9wdU3I47QqY1YyOIxJ6ZB5EKZAZAEo2GZAnOoQnWDxc6ZAOEI9HKwRjJBGpPDHv5BAYr5OIind9j5C6V6etW84nZAZAAYFNKLgN80ju2L0mYXM2ROepjmivEC8ZBlhG3XqklZBRJDU3oGXDuybImgvy0cogZDZD',
    version: 'v16.0',
});

const bot = createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
});

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        // Verificación del Webhook de Meta
        const VERIFY_TOKEN = 'EAAVVlgE0qZC8BO4kvDHDFsSGIpYoKgt5oQZBlAKX3qKHx8pmAmWxA4SuNog0eRwYzrfDWh9wdU3I47QqY1YyOIxJ6ZB5EKZAZAEo2GZAnOoQnWDxc6ZAOEI9HKwRjJBGpPDHv5BAYr5OIind9j5C6V6etW84nZAZAAYFNKLgN80ju2L0mYXM2ROepjmivEC8ZBlhG3XqklZBRJDU3oGXDuybImgvy0cogZDZD';
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook verificado');
            return res.status(200).send(challenge);
        }
        return res.sendStatus(403);
    } else if (req.method === 'POST') {
        // Procesamiento de eventos entrantes
        const body = req.body;
        if (body.object === 'whatsapp_business_account') {
            console.log('Evento recibido:', JSON.stringify(body, null, 2));
            return res.status(200).send('Evento recibido');
        }
        return res.sendStatus(404);
    }
};
