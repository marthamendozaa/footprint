export default class Iniciativa {
  constructor(idAdmin, titulo, descripcion, region, esPublica, listaEtiquetas, fechaInicio, fechaCierre) {
    this.idIniciativa = null;
    this.idAdmin = idAdmin;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.region = region;
    this.urlImagen = "https://t3.ftcdn.net/jpg/02/68/55/60/360_F_268556012_c1WBaKFN5rjRxR2eyV33znK4qnYeKZjm.jpg";
    this.esPublica = esPublica;
    this.listaEtiquetas = listaEtiquetas;
    this.listaMiembros = [];
    this.fechaInicio = fechaInicio;
    this.fechaCierre = fechaCierre;
    this.fechaCreacion = new Date();
  }
}