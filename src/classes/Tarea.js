export default class Tarea {
  constructor(idIniciativa, idAdmin, titulo, descripcion, fechaEntrega) {
    this.idIniciativa = idIniciativa;
    this.idAdmin = idAdmin;
    this.idAsignado = null;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.fechaEntrega = fechaEntrega;
    this.fechaCreacion = new Date();
    this.completada = false;
    this.urlEntrega = null;
  }
}