export default class Usuario {
  constructor() {
    this.idUsuario = null;
    this.nombreUsuario = null;
    this.nombre = null;
    this.correo = null;
    this.fechaNacimiento = null;
    this.edad = null;
    this.urlImagen = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    this.esAdmin = false;
    this.listaIniciativasMiembro = [];
    this.listaIniciativasAdmin = [];
    this.listaIniciativasFavoritas = [];
    this.listaHabilidades = [];
    this.listaIntereses = [];
    this.listaSolicitudes = [];
    this.listaTareas = [];
    this.fechaCreacion = new Date();
  }
}