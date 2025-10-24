export class Producto {
    constructor(data) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.descripcion = data.descripcion;
        this.imagen_url = data.imagen_url;
        this.precio = parseFloat(data.precio) || 0;
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