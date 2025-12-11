// archivo: controllers/VentaController.js (VERSIÓN FINAL COMPLETA)
const { Producto, Inventario, Venta, DetalleVenta, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- 1. CREAR VENTA (Transacción atómica) ---
exports.createVenta = async (req, res) => {
    const { cliente_nombre, estado, detalles } = req.body;
    let transaction;

    try {
        transaction = await sequelize.transaction();

        let totalPagado = 0;
        let gananciaNeta = 0;
        const detallesVentaCreados = [];

        // Iterar sobre los detalles, verificar stock, y pre-calcular
        for (const detalle of detalles) {
            const { productoId, cantidad, precio_final_unitario } = detalle;
            
            const producto = await Producto.findByPk(productoId, { include: [Inventario], transaction });

            if (!producto || !producto.Inventario || producto.Inventario.cantidad_stock < cantidad) {
                // Lanza un error si el stock es insuficiente
                const disponible = producto.Inventario ? producto.Inventario.cantidad_stock : 0;
                throw new Error(`Stock insuficiente para ${producto ? producto.nombre : 'ID ' + productoId}. Disponible: ${disponible}`);
            }

            // Cálculo de Rentabilidad
            const costoUnitario = parseFloat(producto.costo_compra);
            const utilidadUnitario = parseFloat(precio_final_unitario) - costoUnitario;
            
            gananciaNeta += utilidadUnitario * cantidad;
            totalPagado += parseFloat(precio_final_unitario) * cantidad;

            // Crear el Detalle de la Venta (datos financieros)
            const detalleCreado = await DetalleVenta.create({
                productoId,
                cantidad,
                precio_final_unitario: parseFloat(precio_final_unitario),
                costo_unitario: costoUnitario,
                utilidad_unitario: utilidadUnitario,
            }, { transaction });

            detallesVentaCreados.push(detalleCreado);

            // Actualizar Stock (Restar del inventario)
            await Inventario.update(
                { cantidad_stock: producto.Inventario.cantidad_stock - cantidad },
                { where: { productoId: productoId }, transaction }
            );
        }

        // Crear el registro principal de la Venta (datos resumen)
        const nuevaVenta = await Venta.create({
            cliente_nombre,
            estado: estado || 'Pagada',
            total_pagado: totalPagado.toFixed(2),
            ganancia_neta: gananciaNeta.toFixed(2),
        }, { transaction });

        // Asignar el ID de la Venta a cada DetalleVenta
        for (const detalle of detallesVentaCreados) {
            detalle.ventaId = nuevaVenta.id;
            await detalle.save({ transaction });
        }

        await transaction.commit();

        res.status(201).json({ 
            message: 'Venta registrada y stock actualizado con éxito.', 
            venta: nuevaVenta 
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error al registrar venta:", error.message);
        res.status(400).json({ 
            message: error.message.includes('Stock insuficiente') ? error.message : 'Error al procesar la venta. Transacción revertida.',
            error: error.message
        });
    }
};

// --- 2. LEER TODAS LAS VENTAS ---
exports.findAllVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [{
                model: DetalleVenta,
                as: 'detalles',
                include: [{ model: Producto, attributes: ['nombre', 'marca'] }] 
            }],
            order: [['fecha_venta', 'DESC']]
        });
        res.status(200).json(ventas);
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        res.status(500).json({ message: 'Error al obtener ventas.' });
    }
};

// --- 3. LEER UNA VENTA ESPECÍFICA ---
exports.findOneVenta = async (req, res) => {
    try {
        const ventaId = req.params.id;
        const venta = await Venta.findByPk(ventaId, {
            include: [{
                model: DetalleVenta,
                as: 'detalles',
                include: [{ model: Producto, attributes: ['nombre', 'marca'] }]
            }]
        });

        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        res.status(200).json(venta);
    } catch (error) {
        console.error("Error al obtener la venta:", error);
        res.status(500).json({ message: 'Error al obtener la venta.' });
    }
};

// --- 4. ACTUALIZAR VENTA (REQUIERE LÓGICA DE STOCK INVERSA: ¡MUY COMPLEJO!) ---
// NOTA: Para simplificar y mantener la integridad, solo permitimos actualizar el estado y nombre del cliente.
// No se recomienda actualizar los detalles o cantidades sin una lógica compleja de reversión.
exports.updateVenta = async (req, res) => {
    try {
        const ventaId = req.params.id;
        const { cliente_nombre, estado } = req.body; // Solo permitimos actualizar estos campos

        const [updatedRows] = await Venta.update(
            { cliente_nombre, estado },
            { where: { id: ventaId } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        res.status(200).json({ message: 'Venta actualizada (nombre/estado) con éxito.' });
    } catch (error) {
        console.error("Error al actualizar la venta:", error);
        res.status(500).json({ message: 'Error al actualizar la venta.' });
    }
};

// --- 5. ELIMINAR VENTA (Transacción de Reversión de Stock) ---
exports.deleteVenta = async (req, res) => {
    const ventaId = req.params.id;
    let transaction;
    
    try {
        transaction = await sequelize.transaction();

        // 1. Encontrar la venta y sus detalles
        const venta = await Venta.findByPk(ventaId, {
            include: [{ model: DetalleVenta, as: 'detalles' }],
            transaction
        });

        if (!venta) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        // 2. Revertir el stock (añadir los artículos de vuelta al inventario)
        for (const detalle of venta.detalles) {
            const productoId = detalle.productoId;
            const cantidadRevertir = detalle.cantidad;

            await Inventario.increment(
                { cantidad_stock: cantidadRevertir },
                { where: { productoId: productoId }, transaction }
            );
        }

        // 3. Eliminar la venta (elimina los detalles por la regla CASCADE en models/index.js)
        await Venta.destroy({ where: { id: ventaId }, transaction });

        await transaction.commit();

        res.status(200).json({ message: 'Venta eliminada y stock revertido con éxito.' });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error al eliminar venta:", error);
        res.status(500).json({ message: 'Error al eliminar la venta y revertir stock. Transacción revertida.' });
    }
};