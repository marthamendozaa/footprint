import React, { useState, useEffect, useRef } from 'react';
import { FaCalendar, FaFolder, FaTimesCircle  } from 'react-icons/fa';
import { Progress, Typography } from "@material-tailwind/react";
import { getEtiquetas } from '../backend/Create-functions.js';
import './Initiative.css';

export const Initiative = () => {
  useEffect(() => {
    const fetchData = async () => {
      const etiquetasData = await getEtiquetas();
      setEtiquetas(etiquetasData);
    };
    fetchData();
  }, []);


  // Seleccionar etiquetas
  const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetasIniciativa, setEtiquetasIniciativa] = useState([]);

  // Búsqueda y dropdown región
  const [regiones, setRegiones] = useState([]);
  const inputRef = useRef(null);

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
      <img src="https://source.unsplash.com/random" className="image"/> 
      <div className="container">
        {/* Cambiar título */}
        <div className="titulo-container">
          <div className="titulo"> Titulo </div>
        </div>

        {/* Agregar etiquetas */}
        <div className="etiquetas">
          {etiquetas.map((etiqueta, idEtiqueta) => (
            <li key={idEtiqueta} className={`etiqueta-item ${etiquetasIniciativa.includes(etiqueta)}`}>
              {etiqueta}
            </li>
          ))}
        </div>
        
        <div className="container2">
          {/* Fecha inicio y fecha cierre */}
          <div className="calendario-container">
            {/* Fecha inicio */}
            <div className="calendario">
              <FaCalendar />
              <div className='calendario-fecha'>02/20/2003</div>
            </div>

            {/* Dash */}
            <span className="calendario-separator">-</span>

            {/* Fecha cierre */}
            <div className="calendario">
              <FaCalendar />
              <div className='calendario-fecha'>04/16/2024</div>
            </div>
          </div>

          {/* Seleccionar privacidad */}
          <div className="col" style={{ marginLeft: '20px' }}>
            <button className="selecciona-dropdown">Privada</button>
          </div>
          
          {/* Agregar región */}
          <div className="col">
            <button className="selecciona-dropdown">Mexico</button>
            </div>
          </div>
        </div>

      {/* Descripción */}
      <div className="container3">
        <div style={{ fontWeight: 'bold', textAlign: 'left', fontSize: '20px' }}>Progreso</div>
        <ProgressBar progress={50} />
        <div className="desc">
          <div className="descText">
            Esta es mi descripción....
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
  );
};