import { pool } from '../config/database.js';

// Obtener todos los ciudadanos
export const getCiudadanos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ciudadanos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los ciudadanos', error });
    }
};

// Obtener un ciudadano por su código
export const getCiudadanoByCodigo = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ciudadanos WHERE código = ?', [req.params.codigo]);
        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Ciudadano no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el ciudadano', error });
    }
};

// Crear un nuevo ciudadano
export const createCiudadano = async (req, res) => {
    const { nombre, apellidos, apodo_nickname, fecha_nacimiento, planeta_origen, planeta_residencia, foto, codigo_qr, estado } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO ciudadanos (nombre, apellidos, apodo_nickname, fecha_nacimiento, planeta_origen, planeta_residencia, foto, codigo_qr, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellidos, apodo_nickname, fecha_nacimiento, planeta_origen, planeta_residencia, foto, codigo_qr, estado]
        );
        const nuevoCiudadano = {
            código: result.insertId,
            ...req.body
        };
        res.status(201).json(nuevoCiudadano);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el ciudadano', error });
    }
};

// Actualizar un ciudadano existente
export const updateCiudadano = async (req, res) => {
    const { codigo } = req.params;
    const { nombre, apellidos, apodo_nickname, fecha_nacimiento, planeta_origen, planeta_residencia, foto, codigo_qr, estado } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE ciudadanos SET nombre = ?, apellidos = ?, apodo_nickname = ?, fecha_nacimiento = ?, planeta_origen = ?, planeta_residencia = ?, foto = ?, codigo_qr = ?, estado = ? WHERE código = ?',
            [nombre, apellidos, apodo_nickname, fecha_nacimiento, planeta_origen, planeta_residencia, foto, codigo_qr, estado, codigo]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ciudadano no encontrado' });
        }
        
        const [rows] = await pool.query('SELECT * FROM ciudadanos WHERE código = ?', [codigo]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el ciudadano', error });
    }
};

// Eliminar un ciudadano
export const deleteCiudadano = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM ciudadanos WHERE código = ?', [req.params.codigo]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ciudadano no encontrado' });
        }
        res.sendStatus(204); // 204 No Content
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el ciudadano', error });
    }
};