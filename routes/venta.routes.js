// archivo: routes/venta.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/VentaController');

// C: Crear una nueva venta (Transacción compleja)
router.post('/', controller.createVenta);

// R: Leer todas las ventas
router.get('/', controller.findAllVentas);

// R: Leer una venta específica (ej. ; )
router.get('/:id', controller.findOneVenta)
// U: Actualizar una venta (ej.  )
router.put('/:id', controller.updateVenta);
// D: Eliminar una venta (ej.  )
router.delete('/:id', controller.deleteVenta);

module.exports = router;