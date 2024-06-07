import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Solicitud from '../../classes/Solicitud.js'
import { getMisIniciativas, getUsuario, actualizaUsuario, crearSolicitud, suscribirseAIniciativa, existeSolicitud, getUsuarios } from '../../api/api.js';
import ModalIniciativa from '../../assets/ModalIniciativa.jsx';
import { FaHeart} from "react-icons/fa";
import './MyInitiatives.css';

export const MyInitiatives = () => {
  const { user } = useAuth();
  const [usuario, setUsuario] = useState(null);
  
  // Información de iniciativas del usuario
  const [iniciativasMiembro, setIniciativasMiembro] = useState(null);
  const [iniciativasAdmin, setIniciativasAdmin] = useState(null);
  const [iniciativasFavoritas, setIniciativasFavoritas] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const iniciativasData = await getMisIniciativas(user);

      const usuariosData = await getUsuarios();

      const iniciativasMiembroData = iniciativasData.iniciativasMiembro.map(iniciativa => {
        const admin = usuariosData[iniciativa.idAdmin];
        return {
            ...iniciativa,
            nombreAdmin: admin.nombreUsuario,
            urlImagenAdmin: admin.urlImagen
        };
      });

      const iniciativasAdminData = iniciativasData.iniciativasAdmin.map(iniciativa => {
        const admin = usuariosData[iniciativa.idAdmin];
        return {
            ...iniciativa,
            nombreAdmin: admin.nombreUsuario,
            urlImagenAdmin: admin.urlImagen
        };
      });

      const fechaActual = new Date();
      const iniciativasFavoritasData = iniciativasData.iniciativasFavoritas.map(iniciativa => {
        // Verifica si la fecha de cierre de la iniciativa ya pasó
        let fechaLimite = false;

        if (iniciativa.fechaCierre) {
          const [day, month, year] = iniciativa.fechaCierre.split('/');
          const fechaCierre = new Date(year, month - 1, day);
          fechaLimite = (fechaCierre <= fechaActual) ? true : false;
        }

        const admin = usuariosData[iniciativa.idAdmin];
        return {
            ...iniciativa,
            nombreAdmin: admin.nombreUsuario,
            urlImagenAdmin: admin.urlImagen,
            fechaLimite: fechaLimite
        };
      });

      setIniciativasMiembro(iniciativasMiembroData);
      setIniciativasAdmin(iniciativasAdminData);
      setIniciativasFavoritas(iniciativasFavoritasData);

      const usuarioData = await getUsuario(user);
      setUsuario(usuarioData);
    };
    fetchData();
  }, []);

  const [animations, setAnimations] = useState({});

  // Eliminar iniciativa de lista de favoritos
  const eliminaFavorita = async (idIniciativa) => {
    let iniciativasFavoritasNuevo = [...iniciativasFavoritas];
    let usuarioNuevo = {...usuario};

    try {
      // Comienza animación
      setAnimations(prev => ({ ...prev, [idIniciativa]: true }));

      // Actualiza lista de iniciativas favoritas
      iniciativasFavoritasNuevo = iniciativasFavoritasNuevo.filter(iniciativa => iniciativa.idIniciativa !== idIniciativa);

      // Actualiza información del usuario
      let usuarioIniciativasFavoritas = iniciativasFavoritasNuevo.map(iniciativa => iniciativa.idIniciativa);
      usuarioNuevo.listaIniciativasFavoritas = usuarioIniciativasFavoritas;

      await actualizaUsuario(usuarioNuevo);
    } catch (error) {
      console.log(error);
    } finally {
      // Termina animación
      setAnimations(prev => ({ ...prev, [idIniciativa]: false }));
      setIniciativasFavoritas(iniciativasFavoritasNuevo);
      setUsuario(usuarioNuevo);
    }
  };

  // Modal para mostrar información de la iniciativa
  const [showModal, setShowModal] = useState(false);
  const [selectedIniciativa, setSelectedIniciativa] = useState(null);
  const [selectedIniciativaIndex, setSelectedIniciativaIndex] = useState(null);
  const [suscribirDesactivado, setSuscribirDesactivado] = useState(false);
  const [suscribirCargando, setSuscribirCargando] = useState(false);

  const seleccionaIniciativa = async (iniciativa, index) => {
    // Verificar si el usuario ya envió una solicitud a la iniciativa
    const solicitudExiste = await existeSolicitud(user, iniciativa.idIniciativa);
    if (solicitudExiste) {
      setSuscribirDesactivado(true);
    } else {
      setSuscribirDesactivado(false);
    }

    setSelectedIniciativa(iniciativa);
    setSelectedIniciativaIndex(index);
    setShowModal(true);
  };

  const handleCrearSolicitud = async () => {
    if (selectedIniciativa) {
      const idIniciativa = selectedIniciativa.idIniciativa;
      try {
        setSuscribirDesactivado(true);
        setSuscribirCargando(true);
        const solicitud = new Solicitud(user, idIniciativa, "Pendiente", "UsuarioAIniciativa");
        const response = await crearSolicitud(solicitud);
        if (response.success) {
          const iniciativasFavoritasNuevo = [...iniciativasFavoritas];
          iniciativasFavoritasNuevo[selectedIniciativaIndex].listaSolicitudes.push(response.data);
          setIniciativasFavoritas(iniciativasFavoritasNuevo);

          const usuarioNuevo = {...usuario};
          usuarioNuevo.listaSolicitudes.push(response.data);
          setUsuario(usuarioNuevo);

          setShowModal(false);
        }
      } catch (error) {
        console.log("Error al enviar solicitud a la iniciativa");
      } finally {
        setSuscribirCargando(false);
      }
    }
  };

  const handleSuscribirse = async () => {
    if (selectedIniciativa) {
      const idIniciativa = selectedIniciativa.idIniciativa;
      try {
        setSuscribirDesactivado(true);
        setSuscribirCargando(true);
        const response = await suscribirseAIniciativa(user, idIniciativa);
        if (response) {
          const iniciativasFavoritasNuevo = [...iniciativasFavoritas];
          iniciativasFavoritasNuevo[selectedIniciativaIndex].listaMiembros.push(user);
          setIniciativasFavoritas(iniciativasFavoritasNuevo);

          const usuarioNuevo = {...usuario};
          usuarioNuevo.listaIniciativasMiembro.push(idIniciativa);
          setUsuario(usuarioNuevo);

          const iniciativasMiembroNuevo = [...iniciativasMiembro];
          iniciativasMiembroNuevo.push(selectedIniciativa);
          setIniciativasMiembro(iniciativasMiembroNuevo);

          setShowModal(false);
        }
      } catch (error) {
        console.log("Error al suscribirse a la iniciativa");
      } finally {
        setSuscribirDesactivado(false);
        setSuscribirCargando(false);
      }
    }
  };
  
  return (
    <div>
      {iniciativasMiembro && iniciativasAdmin && iniciativasFavoritas ? (
        <div className="m-container">
          
          <div className="m-seccion-container">
            {/* Iniciativas donde soy miembro */}
            <div className="m-iniciativas-titulo">Iniciativas donde soy miembro</div>
              {iniciativasMiembro.length == 0 ? (
                <div className="m-error">
                  Aún no eres miembro de una iniciativa.
                </div>
              ) : (
              <div className="m-iniciativas-container">
                {iniciativasMiembro.map((iniciativa, index) => (
                  <Link key={iniciativa.idIniciativa} to={`/initiative/${iniciativa.idIniciativa}`}>
                    <div className="m-iniciativa" style={{height: '90%'}}>
                      {/* Nombre y foto del usuario administrador */}
                      <div className='rq-iniciativa-admin'>
                        <img src={iniciativa.urlImagenAdmin} alt={iniciativa.nombreAdmin} />
                        <div className='rq-nombre-admin'>{iniciativa.nombreAdmin}</div>
                      </div>

                      {/* Imagen general */}
                      <div className="m-iniciativa-imagen">
                        <img src={iniciativa.urlImagen} alt={iniciativa.titulo} />
                      </div>

                      {/* Contenido */}
                      <div className="m-iniciativa-texto">
                        <div className="m-titulo">{iniciativa.titulo}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
  
          <div className="m-seccion-container">
            {/* Iniciativas creadas */}
            <div className="m-iniciativas-titulo">Iniciativas creadas</div>
              {iniciativasAdmin.length == 0 ? (
                <div className="m-error">
                  Aún no has creado una iniciativa.
                </div>
              ) : (
              <div className="m-iniciativas-container">
                {iniciativasAdmin.map((iniciativa, index) => (
                  <Link key={iniciativa.idIniciativa} to={`/initiative/${iniciativa.idIniciativa}`}>
                    <div className="m-iniciativa" style={{height: '90%'}}>
                      {/* Nombre y foto del usuario administrador */}
                      <div className='rq-iniciativa-admin'>
                        <img src={iniciativa.urlImagenAdmin} alt={iniciativa.nombreAdmin} />
                        <div className='rq-nombre-admin'>{iniciativa.nombreAdmin}</div>
                      </div>
                      
                      {/* Imagen general */}
                      <div className="m-iniciativa-imagen">
                        <img src={iniciativa.urlImagen} alt={iniciativa.titulo} />
                      </div>

                      {/* Contenido */}
                      <div className="m-iniciativa-texto">
                        <div className="m-titulo">{iniciativa.titulo}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="m-seccion-container">
            {/* Iniciativas favoritas */}
            <div className="m-iniciativas-titulo">Iniciativas favoritas</div>
              {iniciativasFavoritas.length == 0 ? (
                <div className="m-error">
                  Aún no tienes iniciativas favoritas.
                </div>
              ) : (
              <div className="m-iniciativas-container">
                {/* Mostrar iniciativa con link si es admin o miembro, si no mostrar modal */}
                {iniciativasFavoritas.map((iniciativa, index) => (
                    (iniciativa.idAdmin === user) || (iniciativa.listaMiembros.includes(user)) ? (
                      <div key={iniciativa.idIniciativa} className="m-iniciativa" >
                        <Link to={`/initiative/${iniciativa.idIniciativa}`}>
                          {/* Nombre y foto del usuario administrador */}
                          <div className='rq-iniciativa-admin'>
                            <img src={iniciativa.urlImagenAdmin} alt={iniciativa.nombreAdmin} />
                            <div className='rq-nombre-admin'>{iniciativa.nombreAdmin}</div>
                          </div>

                          {/* Imagen general */}
                          <div className='m-iniciativa-imagen'>
                            <img src={iniciativa.urlImagen} alt = {iniciativa.titulo} />
                          </div>

                          {/* Contenido */}
                          <div className='m-iniciativa-contenido'>
                            <div className="m-titulo">{iniciativa.titulo}</div>
                          </div>
                        </Link>

                        {/* Corazon */}
                        <div className='m-corazon'>
                          <FaHeart
                            onClick={(e) => { e.stopPropagation(); eliminaFavorita(iniciativa.idIniciativa); }}
                            className={`heart ${animations[iniciativa.idIniciativa] ? 'animate' : ''}`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div key={iniciativa.idIniciativa} className='m-iniciativa' onClick={() => seleccionaIniciativa(iniciativa, index)}>
                        {/* Nombre y foto del usuario administrador */}
                        <div className='rq-iniciativa-admin'>
                          <img src={iniciativa.urlImagenAdmin} alt={iniciativa.nombreAdmin} />
                          <div className='rq-nombre-admin'>{iniciativa.nombreAdmin}</div>
                        </div>

                        {/* Imagen general */}
                        <div className='m-iniciativa-imagen'>
                          <img src={iniciativa.urlImagen} alt={iniciativa.titulo} />
                        </div>

                        {/* Contenido */}
                        <div className='m-iniciativa-contenido'>
                          <div className="m-titulo">{iniciativa.titulo}</div>
                        </div>

                        {/* Corazon */}
                        <div className='m-corazon'>
                          <FaHeart
                            onClick={(e) => { e.stopPropagation(); eliminaFavorita(iniciativa.idIniciativa); }}
                            className={`heart ${animations[iniciativa.idIniciativa] ? 'animate' : ''}`}
                          />
                        </div>
                      </div>
                    )
                ))}
              </div>
            )}
          </div>
          <ModalIniciativa
            showModal={showModal}
            setShowModal={setShowModal}
            selectedIniciativa={selectedIniciativa}
            handleCrearSolicitud={handleCrearSolicitud}
            handleSuscribirse={handleSuscribirse}
            esAdmin={false}
            esMiembro={false}
            suscribirDesactivado={suscribirDesactivado}
            setSuscribirDesactivado={setSuscribirDesactivado}
            suscribirCargando={suscribirCargando}
            pagina={"Explore"}
          />
      </div>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </div>
  );  
}