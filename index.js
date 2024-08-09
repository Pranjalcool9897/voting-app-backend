const express = require('express');
const dotenv=require('dotenv');
const db=require('./db');
const voterRoutes=require('./routes/voterRoutes');
const candidateRoutes=require('./routes/candidateRoutes');


dotenv.config();
const app= express();
app.use(express.json());


const Port=process.env.PORT || 8000;

app.use('/user',voterRoutes);
app.use('/candidate',candidateRoutes);



app.listen(Port,()=>{
    console.log('listening on ',Port);
})




