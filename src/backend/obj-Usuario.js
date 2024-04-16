export default class Usuario {
  constructor(idUsuario, nombreUsuario, nombre, correo, fechaNacimiento, edad, urlImagen) {
    this.idUsuario = idUsuario;
    this.nombreUsuario = nombreUsuario;
    this.nombre = nombre;
    this.correo = correo;
    this.fechaNacimiento = fechaNacimiento;
    this.edad = edad;
    this.urlImagen = urlImagen;
    this.esAdmin = false;
  }
}