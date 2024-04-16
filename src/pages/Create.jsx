import React, { useState, useEffect, useRef } from 'react';
import { FaCalendar, FaFolder, FaPen } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getEtiquetas, getRegiones, crearIniciativa } from '../backend/Create-functions.js';
import Iniciativa from '../backend/obj-Iniciativa.js';
import './Create.css';

export const Create = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [titulo, setTitulo] = useState(null);
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [desc, setDesc] = useState(null);
  const [editandoDesc, setEditandoDesc] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      const regionesData = await getRegiones();
      setRegiones(regionesData);

      const etiquetasData = await getEtiquetas();
      setEtiquetas(etiquetasData);
    };
    fetchData();
  }, []);


  // Seleccionar etiquetas
  const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetasIniciativa, setEtiquetasIniciativa] = useState({});

  const seleccionaEtiqueta = async (etiqueta, idEtiqueta) => {
    const nuevaEtiquetasIniciativa = {...etiquetasIniciativa};

    if (nuevaEtiquetasIniciativa.hasOwnProperty(idEtiqueta)) {
      delete nuevaEtiquetasIniciativa[idEtiqueta];
    } else {
      nuevaEtiquetasIniciativa[idEtiqueta] = etiqueta;
    }
    setEtiquetasIniciativa(nuevaEtiquetasIniciativa);
  };
  

  // Dropdown privacidad
  const [esPublica, setEsPublica] = useState(true);
  const [dropdownPrivacidad, setDropdownPrivacidad] = useState(false);

  const handleSeleccionaPrivacidad = (privacidad) => {
    setEsPublica(privacidad);
    setDropdownPrivacidad(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };


  // Búsqueda y dropdown región
  const [idRegion, setIdRegion] = useState("");
  const [region, setRegion] = useState("");
  const [regiones, setRegiones] = useState([]);
  const [buscaRegion, setBuscaRegion] = useState("");
  const [resultadosRegion, setResultadosRegion] = useState([]);
  const [dropdownRegion, setDropdownRegion] = useState(false);
  const inputRef = useRef(null);
  

  // Búsqueda regiones
  useEffect(() => {
    if (regiones.length > 0) {
      const resultados = regiones.filter(region =>
        region.toLowerCase().includes(buscaRegion.toLowerCase())
      );
      setResultadosRegion(resultados);
    }
  }, [buscaRegion, regiones]);


  // Funciones dropdown región
  const handleBuscaRegion = (event) => {
    setBuscaRegion(event.target.value);
    setDropdownRegion(true);
  };

  const handleSeleccionaRegion = (region, idRegion) => {
    setIdRegion(idRegion);
    setRegion(region);
    setDropdownRegion(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCambioTitulo = (event) => {
    setTitulo(event.target.value);
  };

  const handleEditarTitulo = () => {
    setEditandoTitulo(true);
  };

  const handleGuardarTitulo = () => {
    setEditandoTitulo(false);
  };

  const handleCambioDesc = (event) => {
    setDesc(event.target.value);
  };

  const handleEditarDesc = () => {
    setEditandoDesc(true);
  };

  const handleGuardarDesc = () => {
    setEditandoDesc(false);
  };

  // Crear iniciativa
  const handleCrearIniciativa = async () => {
    console.log(titulo);
    console.log(desc);
    console.log(idRegion);
    console.log(esPublica);
    console.log(etiquetasIniciativa);
    console.log(startDate);
    console.log(endDate);
    if (!titulo || !desc || idRegion == "" || !etiquetasIniciativa || !startDate || !endDate) {
      console.error("No se pueden dejar campos vacíos");
      return;
    }
    const infoIniciativa = new Iniciativa(titulo, desc, idRegion, esPublica, etiquetasIniciativa, startDate, endDate);
    console.log(infoIniciativa);
    await crearIniciativa(infoIniciativa);
  };

  return (
    <div>
      <div className="image"></div>
      <div className="container">
        {/* Cambiar título */}
        <div className="titulo-container">
          <div className="titulo">
            {editandoTitulo ? (<input type="text" value={titulo} onChange={handleCambioTitulo}/>) : (titulo ? titulo : "Título")}
            {!editandoTitulo && (<button className="btn-lapiz" onClick={handleEditarTitulo}><FaPen /></button>)}
            {editandoTitulo && (<button className="btn-lapiz" onClick={handleGuardarTitulo}>Guardar</button>)}
          </div>
        </div>

        {/* Agregar etiquetas */}
        <div className="etiquetas">
          {etiquetas.map((etiqueta, idEtiqueta) => (
            <li key={idEtiqueta} className={`etiqueta-item ${etiquetasIniciativa.hasOwnProperty(idEtiqueta) ? "highlighted" : ""}`} onClick={() => seleccionaEtiqueta(etiqueta, idEtiqueta)}>
              {etiqueta}
            </li>
          ))}
        </div>
        
        <div className="container2">
          {/* Fecha inicio y fecha cierre */}
          <div className="calendario-container">
            {/* Fecha inicio */}
            <div className="calendario">
              <FaCalendar onClick={() => setStartDate(new Date())} />
              <div className="calendario-fecha">
                {startDate && (
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                  />
                )}
              </div>
            </div>

            {/* Dash */}
            <span className="calendario-separator">-</span>

            {/* Fecha cierre */}
            <div className="calendario">
              <FaCalendar onClick={() => setEndDate(new Date())} />
              <div className="calendario-fecha">
                {endDate && (
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Seleccionar privacidad */}
          <div className="col" style={{ marginLeft: '20px' }}>
            <button className="selecciona-dropdown" onClick={() => setDropdownPrivacidad(!dropdownPrivacidad)}>
              <span className="privacidad-value">{esPublica ? "Pública" : "Privada"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-arrow" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {dropdownPrivacidad && (
              <div className="dropdown">
                {/* Dropdown privacidad */}
                <a className="dropdown-item" onClick={() => handleSeleccionaPrivacidad(true)}>Pública</a>
                <a className="dropdown-item" onClick={() => handleSeleccionaPrivacidad(false)}>Privada</a>
              </div>
            )}
          </div>
          
          {/* Agregar región */}
          <div className="col">
            <button className="selecciona-dropdown" onClick={() => setDropdownRegion(!dropdownRegion)}>
              <span className="mr-2">{region ? region : "Ubicación"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="dropdown-arrow" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {dropdownRegion && (
              <div className="dropdown">
                {/* Input búsqueda región */}
                <input className="dropdown-input" type="text" placeholder="Buscar..." autoComplete="off" value={buscaRegion} onChange={handleBuscaRegion} />
                {/* Resultados búsqueda región */}
                {resultadosRegion.map((region, idRegion) => (
                  <a key={idRegion} className="dropdown-item" onClick={() => handleSeleccionaRegion(region, idRegion)}> {region} </a>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>

      {/* Descripción */}
      <div className="container3">
        <div className="desc">
          {editandoDesc ? (<input type="text" value={desc} onChange={handleCambioDesc}/>) : (desc ? desc : "Descripción")}
          {!editandoDesc && (<button className="btn-lapiz-desc" onClick={handleEditarDesc}><FaPen /></button>)}
          {editandoDesc && (<button className="btn-lapiz-desc" onClick={handleGuardarDesc}>Guardar</button>)}
        </div>

        {/* Tareas */}
        <div className="container4">
          <div className="agregarTarea">Añadir tarea</div>
          <div className="invitarMiembro">Invitar miembro</div>
        </div>
        <div className="container5">
          <div className="tarea">
            <div className="tareaTitle">Nombre de tarea
              <div className="btn-entrega"><FaCalendar /> Fecha de entrega</div>
              <div className="btn-entrega"><FaFolder /> Tipo de entrega</div>
            </div>
              <div className="tareaText">Instrucciones...</div>
          </div>
        </div>
        
        {/* Botón crear */}
        <div className="container5">
          <button type="button" className="btn-crear" onClick={handleCrearIniciativa}> Crear </button>
        </div>
      </div>
    </div>
  );
};