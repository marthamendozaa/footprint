import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaHourglass, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getSolicitudes, getIniciativa } from '../../api/api.js';
import './Requests.css';
import ModalIniciativa from '../../assets/ModalIniciativa.jsx';

export const Requests = () => {
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
        if (solicitud.tipoInvitacion == "UsuarioAIniciativa") {
          solicitudesEnviadasData.push(solicitud);
        }
        else if (solicitud.tipoInvitacion == "IniciativaAUsuario") {
          solicitudesRecibidasData.push(solicitud);
        }
      }
      setSolicitudesEnviadas(solicitudesEnviadasData);
      setSolicitudesRecibidas(solicitudesRecibidasData);

      let iniciativasEnviadasData = []
      for (const solicitud of solicitudesEnviadasData){
        const iniciativa = await getIniciativa(solicitud.idIniciativa);
        iniciativasEnviadasData.push(iniciativa);
      }

      let iniciativasRecibidasData = []
      for (const solicitud of solicitudesRecibidasData){
        const iniciativa = await getIniciativa(solicitud.idIniciativa);
        iniciativasRecibidasData.push(iniciativa);
      }

      setIniciativasEnviadas(iniciativasEnviadasData);
      setIniciativasRecibidas(iniciativasRecibidasData)

    };
    fetchData();
  }, []);

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
}
  
  const handleCrearSolicitud = async() =>{
    setSuscribirDesactivado(true);
  }

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
                      <div className='fa-4'>
                        <button className='fa-5-button'> <FaTrash/> </button>
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
                    {/* Imagen y título */}
                    <div className='rq-iniciativa-imagen'>
                        <img src={iniciativa.urlImagen} alt = {iniciativa.titulo} />
                    </div>

                    {/* Cuerpo */}
                    <div className='rq-iniciativa-texto'>
                      {/* Titulo */}
                      <div className="rq-titulo">{iniciativa.titulo}</div>

                      {/* Botones */}
                      <div className='rq-botones-2'>
                        <div className='fa-5'>
                          <button className='fa-5-button'> <FaCheckCircle/> </button>
                        </div>
                        <div className='fa-5'>
                          <button className='fa-5-button'> <FaTimesCircle/> </button>
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
    </div>
  );  
}