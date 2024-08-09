const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MongoURI)
.then(()=>console.log('connect with mongodb'))
.catch((e)=>console.log('Error connecting to Mongo',e)); 