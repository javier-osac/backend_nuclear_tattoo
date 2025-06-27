const pool = require('../config/db');

// Lógica para obtener citas
const getAppointments = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments ORDER BY creation_date_time DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener citas:', err);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
};

const getAppointmentsByUser = async (req, res) => {
  const { id } = req.params; // Obtener el id del usuario desde la URL

  try {
    let result;

    if (id === '1') {
      // Si el usuario es el administrador (id = 1), devolver todas las citas
      result = await pool.query(
        'SELECT * FROM appointments ORDER BY start_date_time ASC'
      );
    } else {
      // Devolver solo las citas asociadas al usuario
      result = await pool.query(
        'SELECT * FROM appointments WHERE id_user = $1 ORDER BY start_date_time ASC',
        [id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron citas.' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener citas segun usuario:', err);
    res.status(500).json({ error: 'Error al obtener citas citas segun usuario' });
  }
};

// Lógica para crear citas
const createAppointment = async (req, res) => {
  const {
    id_user,
    employee_name,
    client_name,
    start_date_time,
    end_date_time,
    service_type,
    status,
    appointment_location,
    creation_date_time,
    domicile_address
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO appointments (
        id_user, employee_name, client_name,
        start_date_time, end_date_time,
        service_type, status,
        appointment_location, creation_date_time, domicile_address
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        id_user, employee_name, client_name,
        start_date_time, end_date_time,
        service_type, status,
        appointment_location, creation_date_time, domicile_address
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear cita:', err);
    res.status(500).json({ error: 'Error al crear cita' });
  }
};

// Lógica para eliminar citas
const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id_appointment = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.status(200).json({ message: 'Cita eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar la cita:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Lógica para actualizar citas
const updateAppointment = async (req, res) => {
  console.log('PUT /appointments/:id recibido:', req.params.id, req.body);

  const { id } = req.params;
  const {
    client_name,
    employee_name,
    service_type,
    status,
    appointment_location,
    price,
    start_date_time,
    end_date_time,
    creation_date_time,
    domicile_address,
    id_user
  } = req.body;

  // Validación mínima
  if (
    client_name === undefined ||
    employee_name === undefined ||
    service_type === undefined ||
    status === undefined ||
    appointment_location === undefined ||
    start_date_time === undefined ||
    end_date_time === undefined ||
    creation_date_time === undefined ||
    domicile_address === undefined ||
    id_user === undefined
  ) {
    return res.status(400).json({ message: 'No hay datos para actualizar' });
  }

  try {
    const result = await pool.query(
      `UPDATE appointments
       SET client_name         = $1,
           employee_name       = $2,
           service_type        = $3,
           status              = $4,
           appointment_location = $5,
           start_date_time     = $6,
           end_date_time       = $7,
           creation_date_time  = $8,
           domicile_address    = $9,
           id_user             = $10
       WHERE id_appointment = $11
       RETURNING *`,
      [
        client_name,
        employee_name,
        service_type,
        status,
        appointment_location,
        start_date_time,
        end_date_time,
        creation_date_time,
        domicile_address,
        id_user,
        id
      ]
    );

    if (result.rows.length === 0) {
      console.log('Validación fallida, campos recibidos:', req.body);
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json({
      message: 'Cita actualizada correctamente',
      appointment: result.rows[0]
    });

  } catch (err) {
    console.error('Error al actualizar la cita:', err.stack);
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// Lógica para actualizar solo el estado a Confirmada

const patchAppointment= async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'El estado es requerido' });
  }

  try {
    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id_appointment = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json({ message: 'Estado actualizado correctamente', appointment: result.rows[0] });
  } catch (err) {
    console.error('Error al actualizar el estado:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


module.exports = {
  getAppointments,
  getAppointmentsByUser,
  createAppointment,
  deleteAppointment,
  updateAppointment,
  patchAppointment
};