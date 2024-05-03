import React, { useState, useEffect } from 'react';
import { FaCalendar, FaFolder, FaTimesCircle  } from 'react-icons/fa';
import { FaClock } from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { MdUpload } from "react-icons/md"
import { Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getIniciativa } from '../../api/api.js';
import './Initiative.css';

export const Initiative = () => {
  const { idIniciativa } = useParams();
  const [iniciativa, setIniciativa] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const iniciativaData = await getIniciativa(idIniciativa);
        setIniciativa(iniciativaData);
        console.log(iniciativaData);
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
            <div className="i-tareas-container">
              <div className="i-titulo-tareas">Evidencias</div>
              {/* Tarea Pública */}
              <div className="i-tarea">
                <div className="i-tarea-info">
                  <div className="i-tarea-titulo">Sprint 1</div>
                  <div className="i-tarea-texto">Instrucciones...</div>
                </div>
                <div className="i-tarea-botones">
                  <div className="i-tarea-boton"><BsPeopleFill /> Miembro</div>
                  <div className="i-tarea-boton"><FaFolder /> Entrega</div>
                </div>
              </div>

              {/* Tarea asignada a mí */}
              <div className="i-titulo-tareas">Mis Tareas</div>
              <div className="i-tarea">
                <div className="i-tarea-info">
                  <div className="i-tarea-titulo">Sprint 2</div>
                  <div className="i-tarea-texto">Instrucciones...</div>
                </div>
                <div className="i-tarea-botones">
                  <div className="i-tarea-boton"><FaCalendar /> Fecha</div>
                  <div className="i-tarea-boton"><FaClock /> Estado</div>
                  <div className="i-tarea-boton"><MdUpload /> Subir</div>
                </div>
              </div>
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
              <button type="button" className="i-btn-ver-solicitudes">
                VER SOLICITUDES
              </button>
            </div>
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