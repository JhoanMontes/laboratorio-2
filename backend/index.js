import express from 'express';
import cors from 'cors';

// Importamos las funciones directamente desde el controlador
import {
    getCiudadanos,
    getCiudadanoByCodigo,
    createCiudadano,
    updateCiudadano,
    deleteCiudadano
} from './controllers/ciudadano.controller.js';

// 1. Inicialización
const app = express();

// 2. Configuraciones
const PORT = process.env.PORT || 3000;

// 3. Middlewares
app.use(cors());
app.use(express.json());

// 4. Rutas (definidas directamente en app)
app.get('/api/ciudadanos', getCiudadanos);
app.get('/api/ciudadanos/:codigo', getCiudadanoByCodigo);
app.post('/api/ciudadanos', createCiudadano);
app.put('/api/ciudadanos/:codigo', updateCiudadano);
app.delete('/api/ciudadanos/:codigo', deleteCiudadano);

// 5. Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});