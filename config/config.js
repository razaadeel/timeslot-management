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
  "slack": {
    "error": process.env.SLACK_ERROR,
    "videoUpload": process.env.SLACK_VIDEO_UPLOAD,
    "newUser": process.env.SLACK_NEW_USER,
    "cityActivation": process.env.SLACK_CITY_ACTIVATION
  },
  "qencodeApiKey": process.env.QENCODE_API_KEY,
  "chargifyAPIKey": process.env.CHARGIFY_API_KEY,
  "leadDynoPrivateKey": process.env.LEADDYNO_PRIVATE_KEY,
}