export class OrdenDetalle {

    constructor(id, id_orden, id_producto, cantidad, precio_unitario, nombre_producto = 'N/D') {
        if (!id || !id_orden || !id_producto || !cantidad || !precio_unitario) {
            throw new Error("Datos esenciales faltantes para la clase OrdenDetalle.");
        }
        this.id = id;
        this.id_orden = id_orden;
        this.id_producto = id_producto;
        this.cantidad = parseInt(cantidad);
        this.precio_unitario = parseFloat(precio_unitario);
        this.nombre_producto = nombre_producto;
    }

    get subtotal() {
        return this.cantidad * this.precio_unitario;
    }
}