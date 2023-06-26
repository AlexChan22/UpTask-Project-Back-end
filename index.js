// const express = require('express'); 
import express from "express";
import dotenv from 'dotenv';
import cors from 'cors'
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from './routes/tareaRoutes.js';

// Crear app de express
const app = express(); 
app.use(express.json()); 

dotenv.config(); 
conectarDB(); 

// Configurar cors
const whiteList = [process.env.FRONTEND_URL]

const corsOptions = {
    origin: function(origin, callback) {
        
        if(whiteList.includes(origin)) {
            // Puede consultar la API
            callback(null, true); 
        } else {
            // No esta permitido
            callback(new Error("Error de Cors"))
        }
    }
}

app.use(cors(corsOptions));

// Routing
const PORT = process.env.PORT || 4000; 

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

const servidor = app.listen(PORT, () => {
    console.log(`Servidor Puerto ${PORT}`); 
});

// Socket IO
import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    },
})

io.on('connection', (socket) => {
    console.log('Conectado a socket.io');
    
    // Definir los eventos de socket.io
   socket.on('abrir proyecto', (proyecto_id) => {
        socket.join(proyecto_id);

        // Mensaje enviado a todos los usuarios por defecto
        // Para enviar a un endpoint especifico se usa el metodo to()
        // socket.to(proyecto_id).emit('respuesta', { nombre: 'Juan'});
   })

   socket.on('nueva tarea', (tarea) => {

    const proyecto  = tarea.proyecto; 
    console.log(proyecto);
    socket.to(proyecto).emit('tarea agregada', tarea)
   })

   socket.on('eliminar tarea', (tarea) => {
        const proyecto  = tarea.proyecto; 
        console.log(proyecto);
        socket.to(proyecto).emit('tarea eliminada', tarea)
   });

   socket.on('actualizar tarea', (tarea) => {
        const proyecto = tarea.proyecto._id;
        console.log(tarea.proyecto._id);
        socket.to(proyecto).emit('tarea actualizada', tarea)
   })

   socket.on('cambiar estado', (tarea) => {
        const proyecto = tarea.proyecto._id;
        console.log(tarea.proyecto._id);
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
} )