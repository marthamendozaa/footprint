import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { ClipLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import './ModalIniciativa.css';
import { FaCalendar, FaGlobe, FaUnlockAlt, FaLock, FaExclamationCircle } from "react-icons/fa";


const ModalIniciativa = ({
  showModal,
  setShowModal,
  selectedIniciativa,
  handleCrearSolicitud,
  handleSuscribirse,
  esAdmin,
  esMiembro,
  suscribirDesactivado,
  setSuscribirDesactivado,
  suscribirCargando,
  pagina}) => {

  return (
    <Modal show={showModal} onHide={() => {setShowModal(false); setSuscribirDesactivado(false);}} centered className='e-modal'>
      <div className="modalcontainer">
        <Modal.Header style={{ border: "none" }} closeButton> </Modal.Header>
          
        <div className='modaliniciativa'>
          {selectedIniciativa && (
            <>
              <div className="modalhead">
                <img src={selectedIniciativa.urlImagen} alt={selectedIniciativa.titulo} className="modalimg" />
              </div>
                
              <div className='modalinfo'>
                <div className='modaltitulo'>{selectedIniciativa.titulo}</div>
                    
                {/* Etiquetas */}
                <div className="m-etiquetas">
                  {Object.values(selectedIniciativa.listaEtiquetas).map((etiqueta, idEtiqueta) => (
                    <li key={idEtiqueta} className={'m-etiqueta-item'}>
                      {etiqueta}
                    </li>
                  ))}
                </div>
                    
                {/* Fechas */}
                <div className='modalfecha'> <FaCalendar style={{marginRight: '5px'}} />
                  {selectedIniciativa.fechaInicio} -&nbsp;

                  {/* Fecha de cierre pasada */}
                  {selectedIniciativa.fechaCierre && selectedIniciativa.fechaLimite ? (
                    <div className='modalfechalimite'>
                      <FaExclamationCircle style={{marginRight: '3px'}}/> {selectedIniciativa.fechaCierre} 
                    </div>
                  ) : (
                    <div>
                      {selectedIniciativa.fechaCierre ? selectedIniciativa.fechaCierre : 'S.F.'}
                    </div>
                  )}
                </div>
                
                {/* Región */}
                <div className='modalregion'> <FaGlobe style={{marginRight: '5px'}} />
                  {selectedIniciativa.region}
                </div>
                    
                {/* Privacidad */}
                <div className='modalpublica'>
                  {selectedIniciativa.esPublica ? <><FaUnlockAlt style={{marginRight: '5px'}} />Pública</> : <><FaLock style={{marginRight: '5px'}} />Privada</>}
                </div>

              </div>
            </>
          )}
      </div>

      <div className = 'modaldesc'>
        {selectedIniciativa && (
          <div className='modaltextodesc'>{selectedIniciativa.descripcion}</div>
        )}
      </div>

      <div className = 'modalsuscribir'>
        {pagina == "Explore" && selectedIniciativa && (
          esAdmin || esMiembro ? (
            <Link to={`/initiative/${selectedIniciativa.idIniciativa}`}>
              <div className='modalsusbotton'> Ver iniciativa </div>   
            </Link>
          ) : (
            selectedIniciativa.esPublica ? (
              <button className='modalsusbotton' disabled={suscribirDesactivado || selectedIniciativa.fechaLimite} onClick={handleSuscribirse} style={{width: "120px"}}>
                {suscribirCargando ? <ClipLoader size={24} color="#000" /> : 'Suscribirme'}
              </button>
            ) : (
              <button className='modalsusbotton' disabled={suscribirDesactivado || selectedIniciativa.fechaLimite} onClick={handleCrearSolicitud} style={{width: "155px"}}>
                {suscribirCargando ? <ClipLoader size={24} color="#000" /> : 'Solicitar unirme'}
              </button>
            )
          )
        )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalIniciativa;