import { OrdenDetalle } from './OrdenDetalle.js';

export class Orden {

    constructor(id, id_usuario, fecha, total, metodo_pago, estado, visible, id_direccion, detalles = []) {
        if (!id || !id_usuario || !total || !metodo_pago || !id_direccion) {
            throw new Error("Datos esenciales faltantes para la clase Orden.");
        }
        this.id = id;
        this.id_usuario = id_usuario;
        this.fecha = new Date(fecha);
        this.total = parseFloat(total);
        this.metodo_pago = metodo_pago;
        this.estado = estado;
        this.visible = visible;
        this.id_direccion = id_direccion;
        this.detalles = detalles;
    }

    get formattedTotal() {
        return `$${this.total.toFixed(2)}`;
    }
}