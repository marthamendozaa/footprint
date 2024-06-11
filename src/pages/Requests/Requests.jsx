import { useEffect, useState } from 'react';
import { Spinner, Modal, Button } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaHourglass, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getSolicitudes, getIniciativa, suscribirseAIniciativa, actualizaSolicitud, eliminarSolicitud, getUsuarios } from '../../api/api.js';
import './Requests.css';
import ModalIniciativa from '../../assets/ModalIniciativa.jsx';

export const Requests = () => {
  // Solicitud seleccionada a eliminar
  const [idSolicitudEliminar, setIdSolicitudEliminar] = useState(null);

  // Modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const handleCerrarEliminar = () => setModalEliminar(false);
  const handleMostrarEliminar = (idSolicitud) => {
    setIdSolicitudEliminar(idSolicitud);
    setModalEliminar(true);
  }

  // Modal de solicitud eliminada
  const [modalEliminada, setModalEliminada] = useState(false);
  const handleMostrarEliminada = () => setModalEliminada(true);
  const handleCerrarEliminada = async () => {
    setModalEliminada(false);
  }

  // Modal de error
  const [modalError, setModalError] = useState(false);
  const handleMostrarError = () => setModalError(true);
  const handleCerrarError = () => setModalError(false);

  // Eliminar solicitud
  const [eliminaBloqueado, setEliminaBloqueado] = useState(false);

  const handleEliminaSolicitud = async () => {
    setEliminaBloqueado(true);

    try {
      await eliminarSolicitud(idSolicitudEliminar);

      setSolicitudesEnviadas(solicitudesEnviadas.filter(solicitud => solicitud.idSolicitud !== idSolicitudEliminar));
      setIniciativasEnviadas(iniciativasEnviadas.filter(iniciativa => iniciativa.idSolicitud !== idSolicitudEliminar));

      handleCerrarEliminar();
      handleMostrarEliminada();
    } catch(error) {
      handleCerrarEliminar();
      handleMostrarError();
    } finally {
      setEliminaBloqueado(false);
    }
  };

  const { user } = useAuth();
  
  // Información de solicitudes del usuario
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState(null);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState(null);

  const [iniciativasEnviadas, setIniciativasEnviadas] = useState(null);
  const [iniciativasRecibidas, setIniciativasRecibidas] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const solicitudes = await getSolicitudes("Usuarios", user);

      let solicitudesEnviadasData = []
      let solicitudesRecibidasData = []
      for (const solicitud of solicitudes) {
        if (solicitud && solicitud.tipoInvitacion == "UsuarioAIniciativa") {
          solicitudesEnviadasData.push(solicitud);
        }
        else if (solicitud && solicitud.tipoInvitacion == "IniciativaAUsuario" && solicitud.estado == "Pendiente") {
          solicitudesRecibidasData.push(solicitud);
        }
      }
      setSolicitudesEnviadas(solicitudesEnviadasData);
      setSolicitudesRecibidas(solicitudesRecibidasData);

      const usuariosData = await getUsuarios();

      let iniciativasEnviadasData = []
      for (const solicitud of solicitudesEnviadasData){
        const iniciativa = await getIniciativa(solicitud.idIniciativa);
        const admin = usuariosData[iniciativa.idAdmin];
        iniciativasEnviadasData.push({ 
          ...iniciativa, 
          idSolicitud: solicitud.idSolicitud, 
          nombreAdmin: admin.nombreUsuario, 
          urlImagenAdmin: admin.urlImagen 
        });
      }

      let iniciativasRecibidasData = []
      for (const solicitud of solicitudesRecibidasData){
        const iniciativa = await getIniciativa(solicitud.idIniciativa);
        const admin = usuariosData[iniciativa.idAdmin];
        iniciativasRecibidasData.push({ 
          ...iniciativa, 
          nombreAdmin: admin.nombreUsuario, 
          urlImagenAdmin: admin.urlImagen 
        });
      }

      setIniciativasEnviadas(iniciativasEnviadasData);
      setIniciativasRecibidas(iniciativasRecibidasData);
    };
    fetchData();
  }, [user]);

  const [showModal, setShowModal] = useState(false);
  const [selectedIniciativa, setSelectedIniciativa] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [esMiembro, setEsMiembro] = useState(false);
  const [suscribirDesactivado, setSuscribirDesactivado] = useState(false);

  const handleButtonClick = async (iniciativa, index) => {
    setSelectedIniciativa(iniciativa);
    if (iniciativa.listaMiembros.includes(user)) {
        setEsMiembro(true);
    }else if (iniciativa.idAdmin === user){
        setEsAdmin(true);
    } else {
        setEsAdmin(false);
        setEsMiembro(false);
    }
    setSuscribirDesactivado(true);
    setShowModal(true);
  };
  
  const handleCrearSolicitud = async() =>{
    setSuscribirDesactivado(true);
  };

  const handleAceptarSolicitud = async (index) => {
    // Actualizar Estatus de solicitud
    let solicitudesRecibidasNuevo = [...solicitudesRecibidas];
    solicitudesRecibidasNuevo[index].estado = "Aceptada";
    const solicitud = solicitudesRecibidasNuevo[index];

    // Actualizar lista de solicitudes recibidas
    let iniciativasRecibidasNueva = [...iniciativasRecibidas];
    iniciativasRecibidasNueva = iniciativasRecibidasNueva.filter(iniciativa => iniciativa.idIniciativa !== solicitud.idIniciativa);
    setIniciativasRecibidas(iniciativasRecibidasNueva);

    setSolicitudesRecibidas(solicitudesRecibidasNuevo);
    await actualizaSolicitud(solicitud);

    // Actualizar listaIniciativasMiembro del usuario que hizo la solicitud
    const user = solicitudesRecibidas[index].idUsuario;
    const iniciativa = solicitudesRecibidas[index].idIniciativa;
    await suscribirseAIniciativa(user, iniciativa);
  };

  const handleRechazarSolicitud = async (index) => {
    let solicitudesRecibidasNuevo = solicitudesRecibidas;
    solicitudesRecibidasNuevo[index].estado = "Rechazada";
    const solicitud = solicitudesRecibidasNuevo[index];

    // Actualizar lista de solicitudes recibidas
    let iniciativasRecibidasNueva = [...iniciativasRecibidas];
    iniciativasRecibidasNueva = iniciativasRecibidasNueva.filter(iniciativa => iniciativa.idIniciativa !== solicitud.idIniciativa);
    setIniciativasRecibidas(iniciativasRecibidasNueva);

    setSolicitudesRecibidas(solicitudesRecibidasNuevo);
    await actualizaSolicitud(solicitud);
  };

  return (
    <div>
      {iniciativasEnviadas && iniciativasRecibidas ? (
        <div className="rq-container">
          <div className="rq-seccion-container">

            {/* Solicitudes enviadas */}
            <div className="rq-iniciativas-titulo">Tus solicitudes a iniciativas</div>
            
            {/* No hay ninguna solicitud */}
            {iniciativasEnviadas.length == 0 ? (
              <div className="rq-error">
                No has enviado solicitudes nuevas.
              </div>
            ) : (
              <div className="rq-iniciativas-container">
                {/* Lista de iniciativas enviadas */}
                {iniciativasEnviadas.map((iniciativa, index) => (
                  <div key={index} className='rq-iniciativa' onClick={() => handleButtonClick(iniciativa, index)}>
                    {/* Nombre y foto del usuario administrador*/}
                    <div className='rq-iniciativa-admin'>
                      <img src = {iniciativa.urlImagenAdmin} alt = {iniciativa.nombreAdmin} />
                      <div className='rq-nombre-admin'>{iniciativa.nombreAdmin}</div>
                    </div>
                    
                    {/* Imagen y título */}
                    <div className='rq-iniciativa-imagen'>
                        <img src={iniciativa.urlImagen} alt = {iniciativa.titulo} />
                    </div>

                    <div className='rq-iniciativa-texto'>
                      <div className="rq-titulo">{iniciativa.titulo}</div>
                      
                      {/* Estado */}
                      <div className='rq-estado'>
                        <div>
                          {solicitudesEnviadas[index].estado}
                          {solicitudesEnviadas[index].estado === 'Aceptada' && <FaCheckCircle className='fa-1'/>}
                          {solicitudesEnviadas[index].estado === 'Rechazada' && <FaTimesCircle className='fa-2'/>}
                          {solicitudesEnviadas[index].estado === 'Pendiente' && <FaHourglass className='fa-3'/>}
                        </div>
                      </div>

                      {/* Basura */}
                      <div className='fa-4' onClick={(e) => e.stopPropagation()}>
                        <button className='fa-5-button'> <FaTrash onClick={() => handleMostrarEliminar(solicitudesEnviadas[index].idSolicitud)} disabled={eliminaBloqueado}/> </button>
                      </div>
                    </div>
                  </div>    
                ))}
              </div>
            )}
          </div>

          {/* Invitaciones recibidas */}
          <div className="rq-seccion-container">
            <div className="rq-iniciativas-titulo">Invitaciones recibidas</div>
            
            {/* No hay ninguna solicitud */}
            {iniciativasRecibidas.length == 0 ? (
              <div className="rq-error">
                Aún no has recibido solicitudes.
              </div>
            ) : (
              <div className="rq-iniciativas-container">
                {/* Lista de inicativas enviadas */}
                {iniciativasRecibidas.map((iniciativa, index) => (
                  <div key={index} className='rq-iniciativa' onClick={() => handleButtonClick(iniciativa, index)}>
                    {/* Nombre y foto del usuario administrador */}
                    <div className='rq-iniciativa-admin'>
                      <img src = {iniciativa.urlImagenAdmin} alt = {iniciativa.nombreAdmin} />
                      <div className='rq-nombre-admin'>{iniciativa.nombreAdmin}</div>
                    </div>
                    
                    {/* Imagen y título */}
                    <div className='rq-iniciativa-imagen'>
                        <img src={iniciativa.urlImagen} alt = {iniciativa.titulo} />
                    </div>

                    {/* Cuerpo */}
                    <div className='rq-iniciativa-texto'>
                      {/* Titulo */}
                      <div className="rq-titulo">{iniciativa.titulo}</div>

                      {/* Botones */}
                      <div className='rq-botones-2' onClick={(e) => e.stopPropagation()}>
                        <div className='fa-5'>
                          <button className='fa-5-button' onClick={() => handleAceptarSolicitud(index) } > <FaCheckCircle/> </button>
                        </div>
                        <div className='fa-5'>
                          <button className='fa-5-button'onClick={() => handleRechazarSolicitud(index) } > <FaTimesCircle/> </button>
                        </div>

                      </div>

                    </div>

                  </div>    
                ))}
              </div>
            )}
          </div>

          {/* Mostrar información adicional */}
          <ModalIniciativa
            showModal={showModal}
            setShowModal={setShowModal}
            selectedIniciativa={selectedIniciativa}
            handleCrearSolicitud={handleCrearSolicitud}
            esAdmin={esAdmin}
            esMiembro={esMiembro}
            suscribirDesactivado={suscribirDesactivado}
            setSuscribirDesactivado={setSuscribirDesactivado}
            pagina = {"Requests"}
            /> 
        </div>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}

    {/* Modal confirmar eliminar solicitud*/}
    <Modal className="ea-modal" show={modalEliminar} onHide={handleCerrarEliminar}>
        <Modal.Header closeButton>
          <div className="ea-modal-title">Confirmar eliminación</div>
        </Modal.Header>
          <div className="ea-modal-body">
            ¿Estás seguro que quieres eliminar esta solicitud?
          </div>
        <Modal.Footer>
          <Button onClick={handleCerrarEliminar}>Cerrar</Button>
          <Button className="eliminar" onClick={handleEliminaSolicitud} disabled={eliminaBloqueado} style={{width: "127px"}}>
            {eliminaBloqueado ? <ClipLoader size={20} color="#fff" /> : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal solicitud eliminado*/}
      <Modal className="ea-modal" show={modalEliminada} onHide={handleCerrarEliminada}>
        <Modal.Header closeButton>
          <div className="ea-modal-title">Éxito</div>
        </Modal.Header>
          <div className="ea-modal-body">
            Solicitud eliminada exitosamente
          </div>
        <Modal.Footer>
          <Button onClick={handleCerrarEliminada}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal error eliminar*/}
      <Modal className="ea-modal" show={modalError} onHide={handleCerrarError}>
        <Modal.Header closeButton>
        <div className="ea-modal-title">Error</div>
        </Modal.Header>
          <div className="ea-modal-body">
            Error al eliminar solicitud
          </div>
        <Modal.Footer>
          <Button onClick={handleCerrarError}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );  
}