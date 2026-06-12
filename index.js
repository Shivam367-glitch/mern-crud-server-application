const express=require('express'); 
const app=express(); 
require('dotenv').config(); 
const cors=require('cors');
const PORT=process.env.PORT || 4000;
require('./db/connection');

app.use(cors({
  origin:process.env.FRONTEND_URL,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));  

app.use(express.json());

const userRoutes=require('./Routes/router');


app.use("/files",express.static("./public/files"));
app.use('/api/user',userRoutes);

app.listen(PORT,()=>{
    console.log(`app is running on port number ${PORT}` );
});
