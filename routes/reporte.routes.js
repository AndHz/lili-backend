// archivo: routes/reporte.routes.js
const express = require('express');
const router = express.Router();
// Asume que el controlador existe en ../controllers/ReporteController
const controller = require('../controllers/ReporteController');

// Rutas para Reportes y Resumen Financiero
// GET /api/reportes/resumen
router.get('/resumen', controller.getResumenFinanciero);

// GET /api/reportes/inventario-valorado
router.get('/inventario-valorado', controller.getInventarioValorado);

module.exports = router;