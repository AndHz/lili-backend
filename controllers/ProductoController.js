// archivo: controllers/ProductoController.js
const { Producto, Inventario } = require('../models');

// 1. CREAR un nuevo Producto con su registro de Inventario inicial
exports.createProducto = async (req, res) => {
    try {
        const { nombre, marca, codigo_catalogo, costo_compra, precio_sugerido, cantidad_stock, ubicacion } = req.body;

        // 1. Crear el registro del Producto
        const nuevoProducto = await Producto.create({
            nombre,
            marca,
            codigo_catalogo,
            costo_compra,
            precio_sugerido
        });

        // 2. Crear su registro de Inventario asociado
        await Inventario.create({
            cantidad_stock: cantidad_stock || 0, // Si no se especifica, empieza en 0
            ubicacion,
            productoId: nuevoProducto.id // Enlaza el inventario al producto
        });

        res.status(201).json({ 
            message: 'Producto e Inventario creados con éxito', 
            producto: nuevoProducto 
        });

    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
};

// 2. LEER todos los Productos con su Stock (Inventario General)
exports.findAllProductos = async (req, res) => {
    try {
        // Incluye el modelo Inventario para traer el stock de una vez
        const productos = await Producto.findAll({
            include: [{ 
                model: Inventario, 
                attributes: ['cantidad_stock', 'ubicacion'] 
            }],
            order: [['nombre', 'ASC']]
        });

        res.status(200).json(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ 
            message: 'Error al obtener inventario', 
            error: error.message 
        });
    }
};

// 3. ACTUALIZAR la información del Producto y/o el Stock
exports.updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, marca, codigo_catalogo, costo_compra, precio_sugerido, cantidad_stock, ubicacion } = req.body;

        // 1. Actualizar datos del Producto
        await Producto.update(
            { nombre, marca, codigo_catalogo, costo_compra, precio_sugerido }, 
            { where: { id: id } }
        );

        // 2. Actualizar datos de Inventario 
        await Inventario.update(
            { cantidad_stock, ubicacion }, 
            { where: { productoId: id } }
        );

        res.status(200).json({ message: 'Producto e Inventario actualizados con éxito' });

    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ 
            message: 'Error al actualizar producto', 
            error: error.message 
        });
    }
};

// 4. ELIMINAR un Producto 
exports.deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Producto.destroy({ where: { id: id } });

        if (deleted === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.status(200).json({ message: 'Producto eliminado con éxito' });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ 
            message: 'Error al eliminar producto', 
            error: error.message 
        });
    }
};