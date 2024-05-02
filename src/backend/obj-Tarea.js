export default class Tarea {
    constructor(titulo, descripcion, fechaEntrega) {
      this.idIniciativa = null;
      this.idAdmin = null;
      this.idAsignado = null;
      this.titulo = titulo;
      this.descripcion = descripcion;
      this.fechaEntrega = fechaEntrega;
      this.fechaCreacion = null;
    }
  
    convertirAObjeto() {
      return {
        idIniciativa: this.idIniciativa,
        idAdmin: this.idAdmin,
        idAsignado: this.idAsignado,
        titulo: this.titulo,
        descripcion: this.descripcion,
        fechaEntrega: this.fechaEntrega,
        fechaCreacion: this.fechaCreacion
      };
    }
  }