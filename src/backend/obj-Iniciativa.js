export default class Iniciativa {
  constructor(titulo, descripcion, idRegion, esPublica, listaEtiquetas, fechaInicio, fechaCierre) {
    this.idIniciativa = null;
    this.idAdmin = null;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.idRegion = idRegion;
    this.urlImagen = null;
    this.esPublica = esPublica;
    this.listaEtiquetas = listaEtiquetas;
    this.fechaInicio = fechaInicio;
    this.fechaCierre = fechaCierre;
  }
}