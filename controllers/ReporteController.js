// archivo: controllers/ReporteController.js
const { Venta, Inventario, Producto, sequelize } = require('../models');
const { Op } = require('sequelize'); 

// 1. Obtener la Ganancia Neta Total y Totales de Venta por Rango de Fechas
exports.getResumenFinanciero = async (req, res) => {
    // Parámetros de consulta (query params): ?fechaInicio=...&fechaFin=...
    const { fechaInicio, fechaFin } = req.query;

    let whereClause = {};
    if (fechaInicio && fechaFin) {
        // Filtra las ventas dentro del rango de fechas
        whereClause.fecha_venta = {
            [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
        };
    }

    try {
        const resumen = await Venta.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total_pagado')), 'totalVentasBruto'],
                [sequelize.fn('SUM', sequelize.col('ganancia_neta')), 'gananciaNetaTotal'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransacciones'],
            ],
            where: whereClause,
            raw: true, 
        });

        res.status(200).json(resumen[0] || { totalVentasBruto: 0, gananciaNetaTotal: 0, totalTransacciones: 0 });
    } catch (error) {
        console.error("Error al obtener resumen financiero:", error);
        res.status(500).json({ message: 'Error al procesar el resumen financiero.' });
    }
};

// 2. Obtener el Inventario Valorado y Productos de Bajo Stock
exports.getInventarioValorado = async (req, res) => {
    try {
        // Trae todos los productos incluyendo su stock
        const inventarioCompleto = await Producto.findAll({
            include: [{ 
                model: Inventario, 
                attributes: ['cantidad_stock', 'ubicacion'] 
            }],
            attributes: ['id', 'nombre', 'marca', 'costo_compra'],
        });

        let valorInventario = 0;
        let productosBajoStock = [];

        // Calcular el valor total y filtrar bajo stock
        inventarioCompleto.forEach(producto => {
            const stock = producto.Inventario ? producto.Inventario.cantidad_stock : 0;
            const costo = parseFloat(producto.costo_compra);
            
            // Valor: Costo de Compra * Stock Actual
            const valorProducto = stock * costo;
            valorInventario += valorProducto;
            
            // Lógica de Alerta de Stock (ej. si el stock es 5 o menos)
            if (stock > 0 && stock <= 5) {
                productosBajoStock.push({
                    nombre: producto.nombre,
                    marca: producto.marca,
                    stock: stock,
                    costo: costo
                });
            }
            
            producto.dataValues.valorTotal = valorProducto.toFixed(2);
        });

        res.status(200).json({
            valorTotalInventario: valorInventario.toFixed(2),
            alertaBajoStock: productosBajoStock,
            detalleInventario: inventarioCompleto.map(p => ({
                ...p.toJSON(), 
                valorTotal: p.dataValues.valorTotal 
            }))
        });

    } catch (error) {
        console.error("Error al valorar el inventario:", error);
        res.status(500).json({ message: 'Error al calcular el valor del inventario.' });
    }
};