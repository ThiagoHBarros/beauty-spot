const mongoose = require('mongoose');
const URI = ''; // URI Mongo


mongoose
.connect(URI)
.then(() => console.log('DB subiu'))
.catch(() => console.log(err));
