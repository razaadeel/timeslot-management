module.exports = {
  "database": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DATABASE,
    "host": process.env.HOST,
    "dialect": "postgres",
    "logging": false
  },
  "aws": {
    "accessKeyId": process.env.ACCESS_KEY_ID,
    "secretAccessKey": process.env.SECRET_ACCESS_KEY
  },
  "wasabi": {
    "accessKeyId": process.env.WASABI_ACCESS_KEY_ID,
    "secretAccessKey": process.env.WASABI_SECRET_ACCESS_KEY
  },
  "mailgun": {
    "apiKey": process.env.MAILGUN_API_KEY,
    "domain": process.env.MAILGUN_DOMAIN,
    "adminAlert": process.env.MAILGUN_ADMIN_ALERT
  },
  "slack": {
    "error": process.env.SLACK_ERROR,
    "videoUpload": process.env.SLACK_VIDEO_UPLOAD,
    "newUser": process.env.SLACK_NEW_USER,
    "cityActivation": process.env.SLACK_CITY_ACTIVATION
  },
  "mediacp": {
    "apiKey": process.env.MEDIACP_API_KEY,
    "username": process.env.MEDIACP_USERNAME,
    "password": process.env.MEDIACP_PASSWORDS,
    "url": process.env.MEDIACP_URL
  },
  "qencodeApiKey": process.env.QENCODE_API_KEY,
  "chargifyAPIKey": process.env.CHARGIFY_API_KEY,
  "leadDynoPrivateKey": process.env.LEADDYNO_PRIVATE_KEY,
}