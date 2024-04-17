import React, { useState, useEffect, useRef } from 'react';
import { FaCalendar, FaFolder, FaTimesCircle  } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { Progress, Typography } from "@material-tailwind/react";
import { getIniciativa } from '../backend/Initiative-functions.js';
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
      {iniciativa && (
        <div>
          <img src={iniciativa.urlImagen} className="image"/> 
          <div className="container">
            {/* Título */}
            <div className="titulo-container">
              <div className="titulo"> {iniciativa.titulo} </div>
            </div>

            {/* Etiquetas */}
            <div className="etiquetas-container">
              {Object.values(iniciativa.listaEtiquetas).map((etiqueta, idEtiqueta) => (
                <li key={idEtiqueta} className={`etiquetas-item`}>
                  {etiqueta}
                </li>
              ))}
            </div>
            
            <div className="container2">
              {/* Fecha inicio y fecha cierre */}
              <div className="calendario-container">
                {/* Fecha inicio */}
                <div className="ver-calendario">
                  <FaCalendar />
                  <div className='ver-calendario-fecha'>{iniciativa.fechaInicio}</div>
                </div>

                {/* Dash */}
                <span className="calendario-separator">-</span>

                {/* Fecha cierre */}
                <div className="ver-calendario">
                  <FaCalendar />
                  <div className='ver-calendario-fecha'>{iniciativa.fechaCierre}</div>
                </div>
              </div>

              {/* Privacidad */}
              <div className="col" style={{ marginLeft: '20px' }}>
                <div className="info-item">{iniciativa.esPublica ? "Pública" : "Privada"}</div>
              </div>
              
              {/* Región */}
              <div className="col">
                <div className="info-item">{iniciativa.region}</div>
                </div>
              </div>
            </div>

          {/* Descripción */}
          <div className="container3">
            <div style={{ fontWeight: 'bold', textAlign: 'left', fontSize: '20px' }}>Progreso</div>
            <ProgressBar progress={50} />
            <div className="desc">
              <div className="descText">
                {iniciativa.descripcion}
              </div>
            </div>

            {/* Tareas */}
            <div className="row">
                <div className="col-9">
                    {/* Requerimientos */}
                    <div className="row">
                        <div className="contenedor" style={{ width: '100%', height: '80px', fontSize: '14px'}}>
                            <div className="tarea" style={{width: "100%"}}>
                                <div className="tareaTitle">Requerimientos
                                <div className="btn-entrega"><FaCalendar /> </div>
                                <div className="btn-entrega"><FaFolder /> </div>
                                <div className="btn-entrega"> miembros </div>
                                <div className="btn-entrega"> sin completar </div>
                            </div>
                                <div className="tareaText">Instrucciones...</div>
                            </div>
                        </div>
                    </div>

                    {/* Evidencias */}
                    <div className="row" style={{marginTop: "60px"}}>
                      <div className="contenedor" style={{ width: '100%', height: '80px', fontSize: '14px'}}>
                        <div className="tarea" style={{width: "100%"}}>
                              <div className="tareaTitle">Evidencia 2
                              <div className="btn-entrega"><FaCalendar /> </div>
                              <div className="btn-entrega"><FaFolder /> </div>
                              <div className="btn-entrega"> miembros </div>
                              <div className="btn-entrega"> sin completar </div>
                          </div>
                              <div className="tareaText">Instrucciones...</div>
                          </div>
                      </div>
                    </div>
                </div>

                {/* Personas */}
                <div className="col-3 my-3" style={{height: "100%"}}>
                  <div className="invitarMiembro" style={{ width: '100%', height: '178px', fontSize: '14px', background: "transparent"}}>
                      <div style={{fontSize: '20px'}}>Dueño</div>
                      <button type="button" className="btn btn-custom">
                          @isabellaEverTech 
                      </button>
                      <div style={{fontSize: '20px'}}>Miembros</div>
                      <button type="button" className="btn btn-custom">
                          @valeEverTech 
                          <span className="icon-container">
                              <FaTimesCircle className="icon-times-circle" />
                          </span>
                      </button>
                  </div>

                  <button type="button" className="btn btn-ver-solicitudes">
                      VER SOLICITUDES
                  </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};