const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const MetaProvider = require('@bot-whatsapp/provider/meta')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')

// Configuración de MySQL
const MYSQL_DB_HOST = 'localhost'
const MYSQL_DB_USER = 'usr'
const MYSQL_DB_PASSWORD = 'pass'
const MYSQL_DB_NAME = 'bot'
const MYSQL_DB_PORT = '3306'

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

const flowDocs = addKeyword(['doc', 'documentacion', 'documentación']).addAnswer(
    [
        '📄 Aquí encontras la documentación recuerda que puedes mejorarla',
        'https://bot-whatsapp.netlify.app/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('🙌 Hola bienvenido a este *Chatbot*')
    .addAnswer(
        [
            'te comparto los siguientes links de interes sobre el proyecto',
            '👉 *doc* para ver la documentación',
            '👉 *gracias*  para ver la lista de videos',
            '👉 *discord* unirte al discord',
        ],
        null,
        null,
        [flowDocs]
    )

// Esta función está ahora optimizada para Vercel Serverless Functions
module.exports = async (req, res) => {
    try {
        const adapterDB = new MySQLAdapter({
            host: MYSQL_DB_HOST,
            user: MYSQL_DB_USER,
            database: MYSQL_DB_NAME,
            password: MYSQL_DB_PASSWORD,
            port: MYSQL_DB_PORT,
        })
        const adapterFlow = createFlow([flowPrincipal])

        const adapterProvider = createProvider(MetaProvider, {
            jwtToken: process.env.JWT_TOKEN,  // Usa variables de entorno
            numberId: process.env.NUMBER_ID,
            verifyToken: process.env.VERIFY_TOKEN,
            version: 'v16.0',
        })

        await createBot({
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        })

        res.status(200).send('Bot de WhatsApp en funcionamiento')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error interno en el servidor')
    }
}
