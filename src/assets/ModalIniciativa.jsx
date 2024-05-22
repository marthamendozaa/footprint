import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import './ModalIniciativa.css';
import { FaCalendar, FaGlobe, FaUnlockAlt, FaLock } from "react-icons/fa";


const ModalIniciativa = ({showModal, setShowModal, selectedIniciativa, handleCrearSolicitud, handleSuscribirse, esAdmin, esMiembro, suscribirDesactivado, setSuscribirDesactivado, pagina }) => {
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

                                <div className='modalfecha'> <FaCalendar style={{marginRight: '5px'}} />{selectedIniciativa.fechaInicio} - {selectedIniciativa.fechaCierre ? selectedIniciativa.fechaCierre : 'S.F.'} </div>
                                <div className='modalregion'> <FaGlobe style={{marginRight: '5px'}} />{selectedIniciativa.region} </div>
                                <div className='modalpublica'>
                                    {selectedIniciativa.esPublica ? <><FaUnlockAlt style={{marginRight: '5px'}} />Pública</> : <><FaLock style={{marginRight: '5px'}} />Privada</>}
                                </div>

                            </div>
                        </>
                    )}
                </div>

                <div className = 'modaldesc'>
                    {selectedIniciativa && (
                        <>
                            <div className='modaltextodesc'>{selectedIniciativa.descripcion}</div>
                        </>
                    )}
                </div>

                <div className = 'modalsuscribir'>
                {pagina == "Explore" ?(
                        esAdmin || esMiembro ? (
                            <Link to={`/initiative/${selectedIniciativa.idIniciativa}`}>
                                <div className='modalsusbotton'> Ver iniciativa </div>   
                            </Link>
                        ) : (
                            selectedIniciativa && selectedIniciativa.esPublica ? (
                                <button className='modalsusbotton' disabled={suscribirDesactivado} onClick={handleSuscribirse}>
                                Suscribirme
                                </button>
                            ) : (
                                <button className='modalsusbotton' disabled={suscribirDesactivado} onClick={handleCrearSolicitud}>
                                Solicitar unirme
                                </button>
                            )  
                        )
                    ):null }
                </div>
            </div>
        </Modal>
    );
};

export default ModalIniciativa;