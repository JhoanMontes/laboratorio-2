// ======================================================
// IMPORTACIONES INICIALES
// ======================================================
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
// Asegúrate de que tus archivos CSS y JS de la plantilla estén en esta ruta
import './init/app.css';
import './init/style.css';
import './init/app.js'

// ======================================================
// SECCIÓN 1: COMUNICACIÓN CON LA API (EL BACKEND)
// En esta sección están todas las funciones que hablan con nuestro servidor.
// ======================================================
const URL_API = 'http://localhost:3000/api/ciudadanos';

// Función para OBTENER TODOS los ciudadanos del servidor
const obtenerCiudadanos = async () => {
    const respuesta = await fetch(URL_API);
    if (!respuesta.ok) throw new Error('Error al obtener los ciudadanos');
    return await respuesta.json();
};

// Función para CREAR un nuevo ciudadano en el servidor
const crearCiudadano = async (ciudadano) => {
    const respuesta = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ciudadano)
    });
    if (!respuesta.ok) throw new Error('Error al crear el ciudadano');
    return await respuesta.json();
};

// Función para ACTUALIZAR un ciudadano existente en el servidor
const actualizarCiudadano = async (codigo, ciudadano) => {
    const respuesta = await fetch(`${URL_API}/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ciudadano)
    });
    if (!respuesta.ok) throw new Error('Error al actualizar el ciudadano');
    return await respuesta.json();
};

// Función para ELIMINAR un ciudadano del servidor
const eliminarCiudadano = async (codigo) => {
    const respuesta = await fetch(`${URL_API}/${codigo}`, {
        method: 'DELETE'
    });
    if (!respuesta.ok) throw new Error('Error al eliminar el ciudadano');
};

// ======================================================
// SECCIÓN 2: REFERENCIAS A ELEMENTOS DEL HTML (DOM)
// Guardamos en constantes los elementos del HTML con los que vamos a trabajar.
// ======================================================
const modalCiudadano = document.getElementById('citizen-modal');
const btnAbrirModal = document.getElementById('open-modal-btn');
const btnCancelarModal = document.getElementById('cancel-modal-btn');
const formularioCiudadano = document.getElementById('citizen-form');
const tituloFormulario = document.getElementById('form-title');
const inputIdCiudadano = document.getElementById('citizen-id');
const cuerpoTabla = document.getElementById('citizens-table-body');

// ======================================================
// SECCIÓN 3: ESTADO DE LA APLICACIÓN
// Variables que nos ayudan a saber qué está pasando en la app.
// ======================================================
let editando = false; // Nos dice si el formulario está en modo "crear" o "editar"

// ======================================================
// SECCIÓN 4: FUNCIONES AUXILIARES
// Pequeñas funciones que nos ayudan a repetir menos código.
// ======================================================

// Función para mostrar alertas bonitas con SweetAlert
const mostrarAlerta = (titulo, texto, icono) => {
    Swal.fire({ titulo, texto, icono, confirmButtonText: 'Aceptar' });
};

// Un "mapa" para traducir el número del estado a texto y color.
const mapaEstado = {
    1: { texto: 'Vivo', clase: 'badge bg-success' },
    0: { texto: 'Muerto', clase: 'badge bg-danger' },
    2: { texto: 'Congelado', clase: 'badge bg-info' }
};

// ======================================================
// SECCIÓN 5: LÓGICA DE LA INTERFAZ (UI)//

// Función principal para dibujar la tabla de ciudadanos
const mostrarCiudadanosEnTabla = async () => {
    try {
        // 1. Pedimos los ciudadanos al backend
        const ciudadanos = await obtenerCiudadanos();
        // 2. Limpiamos la tabla antes de dibujar
        cuerpoTabla.innerHTML = '';

        // 3. Si no hay ciudadanos, mostramos un mensaje
        if (ciudadanos.length === 0) {
            cuerpoTabla.innerHTML = `<tr><td colspan="4" class="text-center">No hay ciudadanos registrados.</td></tr>`;
            return;
        }

        // 4. Recorremos el array de ciudadanos y creamos una fila <tr> por cada uno
        ciudadanos.forEach(ciudadano => {
            const infoEstado = mapaEstado[ciudadano.estado] || { texto: 'Desconocido', clase: 'badge bg-secondary' };
            const fila = document.createElement('tr');
            
            // 5. Llenamos la fila con el HTML correspondiente
            fila.innerHTML = `
                <td>${ciudadano.nombre} <small class="text-muted d-block">${ciudadano.apodo_nickname || ''}</small></td>
                <td>${ciudadano.planeta_origen}</td>
                <td><span class="${infoEstado.clase}">${infoEstado.texto}</span></td>
                <td class="text-end">
                    <button class="btn btn-warning btn-sm btn-edit" data-codigo="${ciudadano.codigo}" title="Editar">✏️</button>
                    <button class="btn btn-danger btn-sm btn-delete" data-codigo="${ciudadano.codigo}" title="Eliminar">🗑️</button>
                </td>
            `;
            // 6. Añadimos la fila a la tabla
            cuerpoTabla.appendChild(fila);
        });
    } catch (error) {
        mostrarAlerta('Error', 'No se pudieron cargar los ciudadanos.', 'error');
    }
};

// ======================================================
// SECCIÓN 6: MANEJO DE EVENTOS (QUÉ PASA CUANDO EL USUARIO HACE CLIC)
// ======================================================

// Evento 1: El usuario hace clic en "Registrar Nuevo Ciudadano"
btnAbrirModal.addEventListener('click', () => {
    editando = false; // Ponemos el modo "crear"
    formularioCiudadano.reset(); // Limpiamos cualquier dato anterior del formulario
    tituloFormulario.textContent = 'Registrar Ciudadano'; // Ponemos el título correcto
    inputIdCiudadano.value = '';
    modalCiudadano.showModal(); // Mostramos el modal
});

// Evento 2: El usuario hace clic en "Cancelar" dentro del modal
btnCancelarModal.addEventListener('click', () => {
    modalCiudadano.close(); // Simplemente cerramos el modal
});

// Evento 3: El usuario hace clic en algún lugar de la tabla
// Usamos "delegación de eventos" para no tener que añadir un listener a cada botón
cuerpoTabla.addEventListener('click', async (evento) => {
    const elementoClickeado = evento.target.closest('button'); // Buscamos si el clic fue en un botón

    // Si no se hizo clic en un botón, no hacemos nada
    if (!elementoClickeado) return;

    const codigoDelCiudadano = elementoClickeado.dataset.codigo;

    // --- Si el botón es el de "Editar" ---
    if (elementoClickeado.classList.contains('btn-edit')) {
        try {
            const ciudadanos = await obtenerCiudadanos();
            const ciudadanoAEditar = ciudadanos.find(c => c.codigo == codigoDelCiudadano);

            // Llenamos el formulario con los datos del ciudadano
            formularioCiudadano.reset();
            inputIdCiudadano.value = ciudadanoAEditar.codigo;
            document.getElementById('nombre').value = ciudadanoAEditar.nombre;
            document.getElementById('apellidos').value = ciudadanoAEditar.apellidos || '';
            document.getElementById('apodo_nickname').value = ciudadanoAEditar.apodo_nickname || '';
            document.getElementById('fecha_nacimiento').value = ciudadanoAEditar.fecha_nacimiento;
            document.getElementById('planeta_origen').value = ciudadanoAEditar.planeta_origen;
            document.getElementById('planeta_residencia').value = ciudadanoAEditar.planeta_residencia;
            document.getElementById('foto').value = ciudadanoAEditar.foto || '';
            document.getElementById('codigo_qr').value = ciudadanoAEditar.codigo_qr;
            document.getElementById('estado').value = ciudadanoAEditar.estado;
            
            // Preparamos para editar
            editando = true;
            tituloFormulario.textContent = 'Editando Ciudadano';
            modalCiudadano.showModal(); // Mostramos el modal
        } catch (error) {
            mostrarAlerta('Error', 'No se pudieron cargar los datos para editar.', 'error');
        }
    }

    // --- Si el botón es el de "Eliminar" ---
    if (elementoClickeado.classList.contains('btn-delete')) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede revertir.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then(async (resultado) => {
            if (resultado.isConfirmed) {
                try {
                    await eliminarCiudadano(codigoDelCiudadano);
                    mostrarAlerta('¡Eliminado!', 'El ciudadano ha sido eliminado.', 'success');
                    await mostrarCiudadanosEnTabla(); // Volvemos a dibujar la tabla
                } catch (error) {
                    mostrarAlerta('Error', 'No se pudo eliminar el ciudadano.', 'error');
                }
            }
        });
    }
});

// Evento 4: El usuario envía el formulario (hace clic en "Guardar Ciudadano")
formularioCiudadano.addEventListener('submit', async (evento) => {
    // Prevenimos que la página se recargue para tener control total
    evento.preventDefault(); 
    
    // Recolectamos todos los datos del formulario en un objeto
    const datosDelCiudadano = {
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        apodo_nickname: document.getElementById('apodo_nickname').value,
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
        planeta_origen: document.getElementById('planeta_origen').value,
        planeta_residencia: document.getElementById('planeta_residencia').value,
        foto: document.getElementById('foto').value,
        codigo_qr: document.getElementById('codigo_qr').value,
        estado: parseInt(document.getElementById('estado').value)
    };

    try {
        // Decidimos si llamar a la función de actualizar o de crear
        if (editando) {
            const codigo = inputIdCiudadano.value;
            await actualizarCiudadano(codigo, datosDelCiudadano);
            mostrarAlerta('¡Actualizado!', 'El ciudadano ha sido actualizado con éxito.', 'success');
        } else {
            await crearCiudadano(datosDelCiudadano);
            mostrarAlerta('¡Creado!', 'El ciudadano ha sido registrado con éxito.', 'success');
        }
        
        // Cerramos el modal y volvemos a dibujar la tabla
        modalCiudadano.close(); 
        await mostrarCiudadanosEnTabla();
    } catch (error) {
        mostrarAlerta('Error', 'No se pudo guardar el ciudadano.', 'error');
    }
});


// ======================================================
// SECCIÓN 7: CARGA INICIAL DE LA APLICACIÓN
// Esto se ejecuta una sola vez, cuando la página ha cargado por completo.
// ======================================================
document.addEventListener('DOMContentLoaded', mostrarCiudadanosEnTabla);