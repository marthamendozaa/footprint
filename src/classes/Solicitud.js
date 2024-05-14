export default class Solicitud {
    constructor(idUsuario, idIniciativa, estado, tipoInvitacion) {
      this.idUsuario = idUsuario;
      this.idIniciativa = idIniciativa;
      this.estado = estado;
      this.tipoInvitacion = tipoInvitacion;
      this.idSolicitud = null;      
    }
  }