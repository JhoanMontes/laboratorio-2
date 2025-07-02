import mysql from 'mysql2/promise';

// Crea un pool de conexiones a la base de datos
export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',        // Usuario por defecto en XAMPP
    password: '',        // Contraseña por defecto en XAMPP
    database: 'interpolice_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});