// archivo: routes/product.routes.js
const express = require('express');
const router = express.Router();
// Asume que el controlador existe en ../controllers/ProductoController
const controller = require('../controllers/ProductoController');

// Rutas CRUD para los productos de inventario
// POST /api/productos
router.post('/', controller.createProducto); 

// GET /api/productos
router.get('/', controller.findAllProductos);

// PUT /api/productos/:id
router.put('/:id', controller.updateProducto);

// DELETE /api/productos/:id
router.delete('/:id', controller.deleteProducto);

module.exports = router;