import { supabase } from './supabaseClient.js';

export class BaseManager {
    constructor() {
        this.db = supabase;
    }

    _handleResponse({ data, error }, errorMessage) {
        if (error) {
            console.error(`Error en ${errorMessage}:`, error);
            throw new Error(`Fallo en la operación: ${errorMessage}`);
        }
        return data;
    }
}