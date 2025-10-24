import { supabase } from './supabaseClient.js';

export class OrderManager {
    constructor() {
        this.supabase = supabase;
    }

    async createOrder(orderData, itemsData) {
        let orderId = null;

        try {
            const { data: orderResult, error: orderError } = await this.supabase
                .from('orden')
                .insert([orderData])
                .select('id');

            if (orderError) throw orderError;

            orderId = orderResult[0].id;

            const orderDetails = itemsData.map(item => ({
                id_orden: orderId,
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario
            }));

            const { error: detailsError } = await this.supabase
                .from('orden_detalle')
                .insert(orderDetails);

            if (detailsError) throw detailsError;

            return { success: true, orderId: orderId };

        } catch (error) {
            console.error("Error en la transacción de orden:", error);
            throw new Error(`Fallo al crear la orden. Mensaje: ${error.message}`);
        }
    }
}