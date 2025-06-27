const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');


// Ruta para obtener citas por usuario
router.get('/id_user/:id', appointmentController.getAppointmentsByUser);

// Ruta para obtener todas las citas
router.get('/', appointmentController.getAppointments);

// Ruta para crear una nueva cita
router.post('/', appointmentController.createAppointment);

// Ruta para actualizar una cita existente por ID
router.put('/:id', appointmentController.updateAppointment);

// Ruta para actualizar solo el estado de una cita
router.patch('/:id', appointmentController.patchAppointment);

// Ruta para eliminar una cita por ID
router.delete('/:id', appointmentController.deleteAppointment);

// Exportar el router para ser utilizado en la configuración de rutas principales
module.exports = router;
