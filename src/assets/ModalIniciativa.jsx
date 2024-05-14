import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';


const ModalIniciativa = ({showModal, setShowModal, selectedIniciativa, handleCrearSolicitud, esAdmin, esMiembro, suscribirDesactivado, setSuscribirDesactivado, pagina }) => {
    return (
        <Modal show={showModal} onHide={() => {setShowModal(false); setSuscribirDesactivado(false);}} centered className='modal1'>
            <div className=".modalcontainer">
                <div className='modaliniciativa'>
                    {selectedIniciativa && (
                        <>
                            <div className="modalhead">
                                <div className="modalbutton">
                                    <button type="button" className="close" onClick={() => {setShowModal(false); setSuscribirDesactivado(false);}} aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
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

                                <div className='modalregion'>{selectedIniciativa.region} </div>
                                <div className='modalpublica'>{selectedIniciativa.esPublica ? "Pública" : "Privada"} </div>
                                <div className='modalfecha'>{selectedIniciativa.fechaInicio} - {selectedIniciativa.fechaCierre ? selectedIniciativa.fechaCierre : 'S.F.'} </div>
                            </div>
                        </>
                    )}
                </div>
                <div className='modaldesc'>
                    {selectedIniciativa && (
                        <>
                            <div className='modaltextodesc'>{selectedIniciativa.descripcion}</div>
                        </>
                    )}
                </div>
                <div className='modalsuscribir'>
                    {pagina == "Explore" ?(
                        esAdmin || esMiembro ? (
                            <Link to={`/initiative/${selectedIniciativa.idIniciativa}`}>
                                <div className='modalsusbotton'> Ver iniciativa </div>   
                            </Link>
                        ) : (
                            <button className='modalsusbotton' disabled={suscribirDesactivado} onClick={handleCrearSolicitud}>
                                Solicitar unirme
                            </button>
                        )
                    ):null }
                
                </div>
            </div>
        </Modal>
    );
};

export default ModalIniciativa;