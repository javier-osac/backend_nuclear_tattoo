require('dotenv').config();
const express = require('express');
//const { Pool } = require('pg');
const cors = require('cors');
//const multer = require('multer');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: "http://localhost:4321", // URL del frontend 
  credentials: true
}));
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});



app.use('/uploads', express.static('uploads')); 

// conexion al controlador de appointment 
const appointmentRoutes = require("./routes/appointments");
app.use("/appointments", appointmentRoutes);

//conexion al controlador de galeria
const galleryRoutes = require("./routes/gallery");
app.use("/gallery", galleryRoutes);


app.listen(port, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
});



