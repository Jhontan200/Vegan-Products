export class Producto {
    constructor(data) {
        // Mapea las propiedades de la respuesta de Supabase (data)
        this.id = data.id;
        this.nombre = data.nombre;
        this.descripcion = data.descripcion;
        this.imagen_url = data.imagen_url;
        // Aseguramos que el precio sea un número flotante, con un valor por defecto de 0
        this.precio = parseFloat(data.precio) || 0; 
        // Aseguramos que el stock sea un entero, con un valor por defecto de 0
        this.stock = parseInt(data.stock) || 0; 
        this.id_categoria = data.id_categoria;
        this.visible = data.visible;
    }

    estaAgotado() {
        return this.stock <= 0;
    }

    getPrecioFormateado() {
        return this.precio.toFixed(2).replace('.', ',');
    }
}
