import React, { useState, useEffect, useRef } from 'react';
import { FaCalendar, FaFolder, FaPen } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { getEtiquetas, getRegiones, crearIniciativa } from './Create-fb.js';
import Iniciativa from '../../backend/obj-Iniciativa.js';
import './Create.css';

export const Create = () => {
  useEffect(() => {
    const fetchData = async () => {
      const regionesData = await getRegiones();
      setRegiones(regionesData);

      const etiquetasData = await getEtiquetas();
      setEtiquetas(etiquetasData);
    };
    fetchData();
  }, []);


  // Cambiar título
  const [titulo, setTitulo] = useState(null);
  const [editandoTitulo, setEditandoTitulo] = useState(false);

  const handleCambioTitulo = (event) => {
    setTitulo(event.target.value);
  };

  const handleEditarTitulo = () => {
    setEditandoTitulo(true);
  };

  const handleGuardarTitulo = () => {
    setEditandoTitulo(false);
  };

  const handleOnKeyDown = (event) => {
    if (event.key === 'Enter') {
      setEditandoTitulo(false);
      setEditandoDesc(false);
    }
  };


  // Cambiar descripción
  const [desc, setDesc] = useState(null);
  const [editandoDesc, setEditandoDesc] = useState(false);

  const handleCambioDesc = (event) => {
    setDesc(event.target.value);
  };

  const handleEditarDesc = () => {
    setEditandoDesc(true);
  };

  const handleGuardarDesc = () => {
    setEditandoDesc(false);
  };


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
  

  // Cambiar fechas
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaCierre, setFechaCierre] = useState(new Date());
  const datePickerInicio = useRef(null);
  const datePickerCierre = useRef(null);

  const handleCambioFechaInicio = () => {
    if (datePickerInicio.current) {
      datePickerInicio.current.setOpen(true);
    }
  };

  const handleCambioFechaCierre = () => {
    if (datePickerCierre.current) {
      datePickerCierre.current.setOpen(true);
    }
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

  const handleSeleccionaRegion = (region) => {
    setRegion(region);
    setDropdownRegion(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  

  // Crear iniciativa
  const [modalError, setModalError] = useState(false);
  const handleCerrarError = () => setModalError(false);
  const handleMostrarError = () => setModalError(true);

  const [modalExito, setModalExito] = useState(false);
  const handleCerrarExito = () => setModalExito(false);
  const handleMostrarExito = () => setModalExito(true);

  const handleCrearIniciativa = async () => {
    if (!titulo || !desc || region === "" || Object.keys(etiquetasIniciativa).length === 0 || !fechaInicio) {
      handleMostrarError();
      return;
    }
    
    const fechaInicioMini = format(fechaInicio, 'dd/MM/yyyy');
    const fechaCierreMini = fechaCierre ? format(fechaCierre, 'dd/MM/yyyy') : null;

    const infoIniciativa = new Iniciativa(titulo, desc, region, esPublica, etiquetasIniciativa, fechaInicioMini, fechaCierreMini);
    console.log(infoIniciativa);
    
    await crearIniciativa(infoIniciativa);
    handleMostrarExito();
  };


  return (
    <div>
      <div className="image"></div>
      <div className="container">
        {/* Cambiar título */}
        <div className="titulo-container">
          <div className="titulo">
            {editandoTitulo ? (
                <input type="text" className="titulo-input"
                value={titulo}
                onChange={handleCambioTitulo}
                onBlur={handleGuardarTitulo}
                onKeyDown={handleOnKeyDown}
                autoFocus />
              ) : (titulo ? titulo : "Título")}
            {!editandoTitulo && (<button className="btn-lapiz" onClick={handleEditarTitulo}><FaPen /></button>)}
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
            <div className="calendario" onClick={handleCambioFechaInicio}> <FaCalendar/>
              <div className="calendario-fecha">
                <DatePicker
                  selected={fechaInicio}
                  onChange={(date) => setFechaInicio(date)}
                  dateFormat="dd/MM/yyyy"
                  ref={datePickerInicio}
                />
              </div>
            </div>

            {/* Dash */}
            <span className="calendario-separator">-</span>

            {/* Fecha cierre */}
            <div className="calendario" onClick={handleCambioFechaCierre}> <FaCalendar/>
              <div className="calendario-fecha">
                <DatePicker
                  selected={fechaCierre}
                  onChange={(date) => setFechaCierre(date)}
                  dateFormat="dd/MM/yyyy"
                  ref={datePickerCierre}
                />
              </div>
            </div>
          </div>

          {/* Seleccionar privacidad */}
          <div className="col" style={{ marginLeft: '20px' }}>
            <button className="selecciona-dropdown" onClick={() => setDropdownPrivacidad(!dropdownPrivacidad)}>
              <span>{esPublica ? "Pública" : "Privada"}</span>
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
                  <a key={idRegion} className="dropdown-item" onClick={() => handleSeleccionaRegion(region)}> {region} </a>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>

      {/* Descripción */}
      <div className="container3">
        <div className="desc">
          {editandoDesc ? (
              <input type="text" className="desc-input"
              value={desc}
              onChange={handleCambioDesc}
              onBlur={handleGuardarDesc}
              onKeyDown={handleOnKeyDown}
              autoFocus />
            ) : (desc ? desc : "Descripción")}
          {!editandoDesc && (<button className="btn-lapiz-desc" onClick={handleEditarDesc}><FaPen /></button>)}
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

        <Modal show={modalError} onHide={handleCerrarError}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
            <Modal.Body>
              No se pueden dejar los siguientes campos vacíos:
              <ul>
                {(!titulo && <li>Título</li>)}
                {(!desc && <li>Descripción</li>)}
                {(region === "" && <li>Región</li>)}
                {Object.keys(etiquetasIniciativa).length === 0 && <li>Etiquetas</li>}
                {!fechaInicio && <li>Fecha de inicio</li>}
              </ul>
            </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCerrarError}> Cerrar </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={modalExito} onHide={handleCerrarExito}>
          <Modal.Header closeButton>
          <Modal.Title>{titulo}</Modal.Title>
          </Modal.Header>
            <Modal.Body>
              Iniciativa creada exitosamente
            </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCerrarExito}> Cerrar </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};