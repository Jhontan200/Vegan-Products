import { supabase } from './supabaseClient.js';

export class DirectionManager {
    constructor() {
        this.supabase = supabase;
    }

    async createDirection(direccionData) {
        const { data, error } = await this.supabase
            .from('direccion')
            .insert(direccionData)
            .select('id_direccion');

        if (error) throw new Error('Error al crear dirección: ' + error.message);
        return data;
    }
}