import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaFolder, FaPen } from 'react-icons/fa';
import { Modal, Button, Spinner } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getIntereses, getRegiones, crearIniciativa, actualizaIniciativa, subirImagen } from '../../api/api.js';
import Iniciativa from '../../classes/Iniciativa.js';
import './Create.css';

export const Create = () => {
  useEffect(() => {
    const fetchData = async () => {
      const etiquetasData = await getIntereses();
      setEtiquetas(etiquetasData);

      const regionesData = await getRegiones();
      setRegiones(regionesData);
    };
    fetchData();
  }, []);


  // Cambiar título
  const [titulo, setTitulo] = useState("");
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
  const [desc, setDesc] = useState("");
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
  const [etiquetas, setEtiquetas] = useState(null);
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
  const [regiones, setRegiones] = useState(null);
  const [buscaRegion, setBuscaRegion] = useState("");
  const [resultadosRegion, setResultadosRegion] = useState([]);
  const [dropdownRegion, setDropdownRegion] = useState(false);
  const inputRef = useRef(null);
  

  // Búsqueda regiones
  useEffect(() => {
    if (regiones) {
      const resultados = Object.values(regiones).filter(region =>
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
  

  // Subir imagen
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenIniciativa, setImagenIniciativa] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('https://t3.ftcdn.net/jpg/02/68/55/60/360_F_268556012_c1WBaKFN5rjRxR2eyV33znK4qnYeKZjm.jpg');
  
  const [modalImagen, setModalImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState("");
  const handleMostrarImagen = () => setModalImagen(true);
  const handleCerrarImagen = () => {
    setModalImagen(false);
    setImagenSeleccionada(null);
    setErrorImagen("");
  };

  const handleSubirImagen = () => {
    if (!imagenSeleccionada) {
      setErrorImagen("Por favor selecciona una imagen")
      return;
    }

    if (imagenSeleccionada.size > 2 * 1024 * 1024) {
      setErrorImagen("La imagen seleccionada supera el límite de tamaño de 2 MB")
      return;
    }

    setImagenIniciativa(imagenSeleccionada);
    setImagenPreview(URL.createObjectURL(imagenSeleccionada));
    handleCerrarImagen();
  };


  // Crear iniciativa
  const [modalError, setModalError] = useState(false);
  const handleCerrarError = () => setModalError(false);
  const handleMostrarError = () => setModalError(true);

  // Iniciativa creada
  const [idIniciativaCreada, setIdIniciativaCreada] = useState(null);
  const [modalCreada, setModalCreada] = useState(false);
  const handleCerrarCreada = () => setModalCreada(false);
  const handleMostrarCreada = () => setModalCreada(true);

  // Error al crear iniciativa
  const [modalErrorCreada, setModalErrorCreada] = useState(false);
  const handleCerrarErrorCreada = () => setModalErrorCreada(false);
  const handleMostrarErrorCreada = () => setModalErrorCreada(true);

  // Error: iniciativa duplicada
  const [modalErrorDuplicada, setModalErrorDuplicada] = useState(false);
  const handleCerrarErrorDuplicada = () => setModalErrorDuplicada(false);
  const handleMostrarErrorDuplicada = () => setModalErrorDuplicada(true);

  // Tiempo de espera
  const [tiempoIniciativaCreada, setTiempoIniciativaCreada] = useState(0);
  const [modalTiempoEspera, setModalTiempoEspera] = useState(false);
  const handleCerrarTiempo = () => setModalTiempoEspera(false);
  const handleMostrarTiempo = () => setModalTiempoEspera(true);

  const { user } = useAuth();

  const handleCrearIniciativa = async () => {
    if (!titulo || !desc || region === "" || Object.keys(etiquetasIniciativa).length === 0 || !fechaInicio) {
      handleMostrarError();
      return;
    }

    const tiempoActual = Date.now();
    if (tiempoActual - tiempoIniciativaCreada < 60000) {
      handleMostrarTiempo();
      return;
    }
    
    const fechaInicioMini = format(fechaInicio, 'dd/MM/yyyy');
    const fechaCierreMini = fechaCierre ? format(fechaCierre, 'dd/MM/yyyy') : null;

    // Crear iniciativa
    const iniciativa = new Iniciativa(user, titulo, desc, region, esPublica, etiquetasIniciativa, fechaInicioMini, fechaCierreMini);
    const idIniciativa = await crearIniciativa(iniciativa);

    // Manejar errores
    if (idIniciativa === 409) {
      handleMostrarErrorDuplicada();
    } else if (idIniciativa === 500) {
      handleMostrarErrorCreada();
    } else {
      // Subir imagen de la iniciativa y actualizar información
      let urlImagen = iniciativa.urlImagen;
      if (imagenIniciativa) {
        const url = await subirImagen(imagenIniciativa, `Iniciativas/${idIniciativa}`);
        urlImagen = url;
      }
      const iniciativaNueva = { ...iniciativa, urlImagen: urlImagen, idIniciativa: idIniciativa};
      await actualizaIniciativa(idIniciativa, iniciativaNueva);

      setIdIniciativaCreada(idIniciativa);
      handleMostrarCreada();
      setTiempoIniciativaCreada(tiempoActual);
    }
  };


  return (
    <div>
      {etiquetas && regiones ? (
        <div className="c-container">
          <div className="c-iniciativa-container">
            {/* Foto de iniciativa */}
            <div className="c-foto-iniciativa" onClick={handleMostrarImagen}>
              <img src={imagenPreview} className ="c-preview-imagen"/>
              <FaPen className="c-editar-foto"/>
            </div>

            <div className="c-info-container"> 
              {/* Cambiar título */}
              <div className="c-titulo">
                {editandoTitulo ? (
                  <div className="c-titulo-input">
                    <input
                      type="text"
                      className="c-titulo-input-texto"
                      value={titulo}
                      onChange={handleCambioTitulo}
                      onBlur={handleGuardarTitulo}
                      onKeyDown={handleOnKeyDown}
                      autoFocus
                      maxLength={30}
                    />
                    <div className="c-titulo-conteo">
                      {titulo ? `${titulo.length}/30` : `0/30`}
                    </div>
                  </div>) : (
                    <div className="c-titulo-texto">
                      {titulo ? titulo : "Título"}
                      <button className="c-btn-editar-titulo" onClick={handleEditarTitulo}>
                        <FaPen />
                      </button>
                    </div>
                  )}
              </div>

              {/* Agregar etiquetas */}
              <div className="c-etiquetas">
                {Object.values(etiquetas).map((etiqueta, idEtiqueta) => (
                  <li key={idEtiqueta} className={`c-etiqueta-item ${Object.values(etiquetasIniciativa).includes(etiqueta) ? "highlighted" : ""}`} onClick={() => seleccionaEtiqueta(etiqueta, idEtiqueta)}>
                    {etiqueta}
                  </li>
                ))}
              </div>
              
              <div className="c-datos">
                {/* Fecha inicio y fecha cierre */}
                <div className="c-calendarios-container">
                  <div className="c-calendarios">
                    {/* Fecha inicio */}
                    <div className="c-calendario-input">
                      <div className="c-calendario" onClick={handleCambioFechaInicio}>
                        <div className="c-icono-calendario">
                          <FaCalendar/>
                        </div>
                      </div>
                      <DatePicker
                        className='react-datepicker__input-container-create'
                        selected={fechaInicio}
                        onChange={(date) => setFechaInicio(date)}
                        dateFormat="dd/MM/yyyy"
                        ref={datePickerInicio}
                        locale={es}
                      />
                    </div>
                    
                    {/* Dash */}
                    <div className="c-calendario-separador"> - </div>

                    {/* Fecha cierre */}
                    <div className="c-calendario-input">
                      <div className="c-calendario" onClick={handleCambioFechaCierre}>
                        <div className="c-icono-calendario">
                          <FaCalendar/>
                        </div>
                      </div>
                      <DatePicker
                        className='react-datepicker__input-container-create'
                        selected={fechaCierre}
                        onChange={(date) => setFechaCierre(date)}
                        dateFormat="dd/MM/yyyy"
                        ref={datePickerCierre}
                        locale={es}
                      />
                    </div>
                  </div>
                </div>

                {/* Seleccionar privacidad */}
                <div className="c-dropdown-container">
                  <button className="c-selecciona-dropdown" onClick={() => setDropdownPrivacidad(!dropdownPrivacidad)}>
                    <span>{esPublica ? "Pública" : "Privada"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="c-dropdown-arrow" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {dropdownPrivacidad && (
                    <div className="c-dropdown">
                      {/* Dropdown privacidad */}
                      <a className="c-dropdown-item" onClick={() => handleSeleccionaPrivacidad(true)}>Pública</a>
                      <a className="c-dropdown-item" onClick={() => handleSeleccionaPrivacidad(false)}>Privada</a>
                    </div>
                  )}
                </div>
                
                {/* Agregar región */}
                <div className="c-dropdown-container">
                  <button className="c-selecciona-dropdown" onClick={() => setDropdownRegion(!dropdownRegion)}>
                    <span className="mr-2">{region ? region : "Ubicación"}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="c-dropdown-arrow" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                  </button>
                  {dropdownRegion && (
                    <div className="c-dropdown">
                      {/* Input búsqueda región */}
                      <input className="c-dropdown-input" type="text" placeholder="Buscar..." autoComplete="off" value={buscaRegion} onChange={handleBuscaRegion} />
                      {/* Resultados búsqueda región */}
                      {resultadosRegion.map((region, idRegion) => (
                        <a key={idRegion} className="c-dropdown-item" onClick={() => handleSeleccionaRegion(region)}> {region} </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="c-desc">
            <div className="c-desc-texto">
              {editandoDesc ? (
                <div className="c-desc-input">
                  <textarea className="c-desc-input-texto"
                    value={desc}
                    onChange={handleCambioDesc}
                    onBlur={handleGuardarDesc}
                    onKeyDown={handleOnKeyDown}
                    autoFocus
                    maxLength={200} />
                  <div className="c-desc-conteo">
                    {desc ? `${desc.length}/200` : `0/200`}
                  </div>
              </div>) : (
                <div style={desc ? {} : { color: '#677D7C' }}>
                  {desc ? desc : "Agrega tu descripción aquí..."}
                </div>
              )}
              {!editandoDesc && (<button className="c-btn-editar-desc" onClick={handleEditarDesc}><FaPen /></button>)}
            </div>
          </div>

          {/* Tareas y Miembros*/}
          <div className="c-tareas-miembros">
            <div className="c-seccion-tareas">
              <div className="c-btn-agregar-tarea">Añadir tarea</div>

              <div className="c-tareas-container">
                <div className="c-tarea">
                  <div className="c-tarea-info">
                    <div className="c-tarea-titulo">Nombre de tarea</div>
                    <div className="c-tarea-texto">Instrucciones...</div>
                  </div>
                  <div className="c-tarea-botones">
                    <div className="c-tarea-boton"><FaCalendar /> Fecha</div>
                    <div className="c-tarea-boton"><FaFolder /> Documento</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="c-seccion-miembros">
              <div className="c-btn-invitar-miembro">Invitar miembro</div>
            </div>
          </div>
          
          
          {/* Botón crear */}
          <div className="c-crear-container">
            <div className="c-btn-crear-container">
              <button type="button" className="c-btn-crear" onClick={handleCrearIniciativa}> Crear </button>
            </div>
          </div>

          {/* Subir imagen */}
          <Modal className="c-modal" show={modalImagen} onHide={handleCerrarImagen}>
            <Modal.Header closeButton>
              <div className="c-modal-title">Subir Imagen</div>
            </Modal.Header>
              <div className="c-input-body">
                <input className="c-input-imagen" type="file" accept="image/*" onChange={(e) => setImagenSeleccionada(e.target.files[0])} />
                {errorImagen && <span style={{ color: 'red' }}>{errorImagen}</span>}
              </div>
            <Modal.Footer>
              <Button onClick={handleSubirImagen}>Guardar</Button>
              <Button onClick={handleCerrarImagen}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
          
          {/* Error campos vacíos */}
          <Modal className="c-modal" show={modalError} onHide={handleCerrarError}>
            <Modal.Header closeButton>
              <div className="c-modal-title">Error</div>
            </Modal.Header>
              <div className="c-modal-body" style={{textAlign:'left'}}>
                No se pueden dejar los siguientes campos vacíos:
                <ul>
                  {(!titulo && <li>Título</li>)}
                  {(!desc && <li>Descripción</li>)}
                  {(region === "" && <li>Región</li>)}
                  {Object.keys(etiquetasIniciativa).length === 0 && <li>Etiquetas</li>}
                  {!fechaInicio && <li>Fecha de inicio</li>}
                </ul>
              </div>
            <Modal.Footer>
              <Button onClick={handleCerrarError}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
          
          {/* Iniciativa creada */}
          <Modal className="c-modal" show={modalCreada} onHide={handleCerrarCreada}>
            <Modal.Header closeButton>
              <div className="c-modal-title">Éxito</div>
            </Modal.Header>
              <div className="c-modal-body">
                Iniciativa <span style={{fontWeight: 'bold'}}>{titulo}</span> creada exitosamente
              </div>
            <Modal.Footer>
              <Button className="btn btn-primary" onClick={handleCerrarCreada}>
                <Link to={`/initiative/${idIniciativaCreada}`}>Ver Iniciativa</Link>
              </Button>
            </Modal.Footer>
          </Modal>
          
          {/* Error creando inciativa */}
          <Modal className="c-modal" show={modalErrorCreada} onHide={handleCerrarErrorCreada}>
            <div className="c-modal-title">Error</div>
              <div className="c-modal-body">
                Error al crear iniciativa <span style={{fontWeight: 'bold'}}>{titulo}</span>
              </div>
            <Modal.Footer>
              <Button onClick={handleCerrarErrorCreada}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* Error iniciativa duplicada */}
          <Modal className="c-modal" show={modalErrorDuplicada} onHide={handleCerrarErrorDuplicada}>
            <div className="c-modal-title">Error</div>
              <div className="c-modal-body">
                La iniciativa con título <span style={{fontWeight: 'bold'}}>{titulo}</span> ya existe
              </div>
            <Modal.Footer>
              <Button onClick={handleCerrarErrorDuplicada}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* Tiempo de espera */}
          <Modal className="c-modal" show={modalTiempoEspera} onHide={handleCerrarTiempo}>
            <div className="c-modal-title">Error</div>
              <div className="c-modal-body">
                Debes esperar 1 minuto para poder crear una nueva iniciativa
              </div>
            <Modal.Footer>
              <Button onClick={handleCerrarTiempo}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </div>
  );
};