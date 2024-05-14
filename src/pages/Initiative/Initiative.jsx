import React, { useState, useEffect } from 'react';
import { FaCalendar, FaFolder, FaTimesCircle  } from 'react-icons/fa';
import { FaClock } from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { MdUpload } from "react-icons/md"
import { Spinner, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getIniciativa, getMisTareas } from '../../api/api.js';
import './Initiative.css';

export const Initiative = () => {
  const { idIniciativa } = useParams();
  const [iniciativa, setIniciativa] = useState(null);
  const [tareas, setTareas] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [showModal, setShowModal] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const iniciativaData = await getIniciativa(idIniciativa);
        setIniciativa(iniciativaData);
        console.log(iniciativaData);

        const tareaPromises = iniciativaData.listaTareas.map(async (idTarea) => {
          const tareaData = await getMisTareas(idTarea);
          return tareaData;
        });
        const tareas = await Promise.all(tareaPromises);
        setTareas(tareas);

      } catch (error) {
        console.error("Error obteniendo información de la iniciativa:", error.message);
      }
    };
    fetchData();
  }, [idIniciativa]);

  const ProgressBar = ({ progress }) => {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="progress-label">{`${progress}%`}</div>
      </div>
    );
  };

  const handleShowModal = () => {
    setShowModal(true);
  }


  return (
    <div>
      {iniciativa ? (
        <div className="i-container">
          <div className="i-iniciativa-container">
            {/* Foto de iniciativa */}
            <img src={iniciativa.urlImagen} className="i-foto-iniciativa"/> 
            
            <div className="i-info-container"> 
              {/* Título */}
              <div className="i-titulo">
                <div className="i-titulo-texto">{iniciativa.titulo}</div>
              </div>
  
            {/* Etiquetas */}
            <div className="i-etiquetas">
              {Object.values(iniciativa.listaEtiquetas).map((etiqueta, idEtiqueta) => (
                <li key={idEtiqueta} className={`i-etiqueta-item`}>
                  {etiqueta}
                </li>
              ))}
            </div>
  
            <div className="i-datos">
              {/* Fecha inicio y fecha cierre */}
              <div className="i-calendarios-container">
                <div className="i-calendarios">
                  {/* Fecha inicio */}
                  <div className="i-calendario-container">
                    <div className="i-calendario">
                      <div className="i-icono-calendario">
                        <FaCalendar/>
                      </div>
                    </div>
                    <div className='i-fecha'>{iniciativa.fechaInicio}</div>
                  </div>
                  
                  {/* Dash */}
                  <div className="i-calendario-separador"> - </div>

                  {/* Fecha cierre */}
                  <div className="i-calendario-container">
                    <div className="i-calendario">
                      <div className="i-icono-calendario">
                        <FaCalendar/>
                      </div>
                    </div>
                    <div className='i-fecha'>{iniciativa.fechaCierre}</div>
                  </div>
                </div>
              </div>

              {/* Privacidad */}
              <div className="i-dato-container">
                <div className="i-dato">
                  {iniciativa.esPublica ? "Pública" : "Privada"}
                </div>
              </div>
  
              {/* Ubicación */}
              <div className="i-dato-container">
                <div className="i-dato">
                  {iniciativa.region}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Descripción */}
        <div className="i-desc">
          <div className="i-progreso-texto">Progreso</div>
          <ProgressBar progress={50} />
          <div className="i-desc-texto">
            {iniciativa.descripcion}
          </div>
        </div>
          
        {/* Tareas y Miembros*/}
        <div className="i-tareas-miembros">
          <div className="i-seccion-tareas">
            <div className="i-tareas-seccion">
              {/* Tarea asignada a mí */}
              <div className="i-titulo-tareas">Mis Tareas</div>
                {tareas ? (
                  <div className='i-tareas-container'>
                    {tareas.length === 0 ? (
                      <div className="m-error">
                      No hay tareas asignadas.
                      </div>
                    ) : (
                    <div>
                      {tareas.map((tarea, idTarea) => (
                        <div className="i-tarea" key={idTarea}>
                          <div className="i-tarea-info">
                            <div className="i-tarea-texto">
                              <div className="i-tarea-titulo">{tarea.titulo}</div>
                              <div className="i-tarea-desc">{tarea.descripcion}</div>
                            </div>
                            <div className="i-tarea-botones">
                              <div className="i-tarea-boton"><FaCalendar /> Fecha {formatDate(tarea.fechaEntrega)}</div>
                              <div className="i-tarea-boton"><FaFolder /> Documento</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                  ) : (
                  <div className="m-error">
                  No hay tareas asignadas.
                  </div>
                )}
            </div>
          </div>

          <div className="i-seccion-miembros">
            <div className="i-tipo-miembro">Dueño</div>
              <button type="button" className="i-btn-miembro">@isabellaEverTech</button>
            <div className="i-tipo-miembro">Miembros</div>
              <button type="button" className="i-btn-miembro">@valeEverTech
                <span className="i-icono-elimina-miembro">
                  <FaTimesCircle className="i-icon-times-circle" />
                </span>
              </button>
              <button type="button" className="i-btn-ver-solicitudes" onClick={handleShowModal}>
                VER SOLICITUDES
              </button>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered className='e-modal'>
                            <div className="modalcontainer">
                                <Modal.Header style={{ border: "none" }} closeButton> Solicitudes </Modal.Header>
                                
                                <div className='modaliniciativa'>
                                <div className="cuadro">
                                <div className="cuadro2">@angelaEverTech</div>
                                
                                <div className="cuadro3">
                                    Angela Gtz,      21 años<br></br>
                                    Teamwork, Back end, Proyect Manager <br></br>
                                </div>
                            </div>
                            <div className="cuadro">
                                <div className="cuadro2">@MarthaMendoza</div>
                                
                                <div className="cuadro3">
                                    Martha Mendoza      21 años<br></br>
                                    Teamwork, Front end, Proyect Manager <br></br>
                                </div>
                            </div>
                                </div>
                            </div>
                        </Modal>
          </div>
        </div>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </div>
  );
};