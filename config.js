module.exports = {
  host: 'localhost',        // Hostname of IoTgo platform
  db: {                             
    uri: 'mongodb://localhost/iotgo',   // MongoDB database address
    options: {
   //   user: 'iotgo',                    // MongoDB database username
   //   pass: 'iotgo'                     // MongoDB database password
    }
  },
  jwt: {
    secret: 'jwt_secret'                // Shared secret to encrypt JSON Web Token
  },
  admin:{
    '123@123.com': 'e10adc3949ba59abbe56e057f20f883e' // Administrator account of IoTgo platform
  },
  page: {
    limit: 50,                          // Default query page limit
    sort: -1                            // Default query sort order
  },
  recaptcha: {
      secret: '',                       // Google reCAPTCHA serect
      url: 'https://www.google.com/recaptcha/api/siteverify'
    },
  pendingRequestTimeout: 3000
};
