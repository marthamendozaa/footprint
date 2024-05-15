import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Solicitud from '../../classes/Solicitud.js'
import { getMisIniciativas, getUsuario, actualizaUsuario, crearSolicitud } from '../../api/api.js';
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
      setIniciativasMiembro(iniciativasData.iniciativasMiembro);
      setIniciativasAdmin(iniciativasData.iniciativasAdmin);
      setIniciativasFavoritas(iniciativasData.iniciativasFavoritas);

      const usuarioData = await getUsuario(user);
      setUsuario(usuarioData);
    };
    fetchData();
  }, []);

  // Eliminar iniciativa de lista de favoritos
  const eliminaFavorita = async (idIniciativa) => {
    const iniciativasFavoritasNuevo = iniciativasFavoritas.filter(iniciativa => iniciativa.idIniciativa !== idIniciativa);
    setIniciativasFavoritas(iniciativasFavoritasNuevo);

    const listaIniciativasFavoritas = iniciativasFavoritasNuevo.map(iniciativa => iniciativa.idIniciativa);
    const usuarioNuevo = {...usuario};
    usuarioNuevo.listaIniciativasFavoritas = listaIniciativasFavoritas;
    await actualizaUsuario(usuarioNuevo);
    setUsuario(usuarioNuevo);
  };

  // Modal para mostrar información de la iniciativa
  const [showModal, setShowModal] = useState(false);
  const [selectedIniciativa, setSelectedIniciativa] = useState(null);
  const [selectedIniciativaIndex, setSelectedIniciativaIndex] = useState(null);
  const [suscribirDesactivado, setSuscribirDesactivado] = useState(false);

  const seleccionaIniciativa = (iniciativa, index) => {
    for (const solicitud of usuario.listaSolicitudes) {
      if (iniciativa.listaSolicitudes.includes(solicitud)) {
        setSuscribirDesactivado(true);
      }
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
          alert("Has enviado solicitud a la iniciativa");
        }
      } catch (error) {
        alert("Error al enviar solicitud a la iniciativa");
      } finally {
        setSuscribirDesactivado(false);
      }
    }
  };
  
  return (
    <div>
      {iniciativasMiembro && iniciativasAdmin && iniciativasFavoritas ? (
        <div className="m-container">
          
          <div className="m-seccion-container">
            <div className="m-iniciativas-titulo">Iniciativas donde soy miembro</div>
  
            {iniciativasMiembro.length == 0 ? (
              <div className="m-error">
                Aún no eres miembro de una iniciativa.
              </div>
            ) : (
              <div className="m-iniciativas-container">
                {iniciativasMiembro.map((iniciativa, index) => (
                  <Link key={iniciativa.idIniciativa} to={`/initiative/${iniciativa.idIniciativa}`}>
                    <div className="m-iniciativa">
                        <div className="m-iniciativa-imagen">
                          <img src={iniciativa.urlImagen} alt={iniciativa.titulo} />
                        </div>
                      <div className="m-iniciativa-texto">
                        <div className="m-titulo">{iniciativa.titulo}</div>
                        <div className="m-desc">{iniciativa.descripcion}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
  
          <div className="m-seccion-container">
            <div className="m-iniciativas-titulo">Iniciativas creadas</div>
  
            {iniciativasAdmin.length == 0 ? (
              <div className="m-error">
                Aún no has creado una iniciativa.
              </div>
            ) : (
              <div className="m-iniciativas-container">
                {iniciativasAdmin.map((iniciativa, index) => (
                  <Link key={iniciativa.idIniciativa} to={`/initiative/${iniciativa.idIniciativa}`}>
                    <div className="m-iniciativa">
                        <div className="m-iniciativa-imagen">
                          <img src={iniciativa.urlImagen} alt={iniciativa.titulo} />
                        </div>
                      <div className="m-iniciativa-texto">
                        <div className="m-titulo">{iniciativa.titulo}</div>
                        <div className="m-desc">{iniciativa.descripcion}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="m-seccion-container">
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
                          <div className='m-iniciativa-imagen'>
                            <img src={iniciativa.urlImagen} alt = {iniciativa.titulo} />
                          </div>
                          <div className='m-iniciativa-contenido'>
                            <div className="m-titulo">{iniciativa.titulo}</div>
                            <div className="m-desc">{iniciativa.descripcion}</div>
                          </div>
                        </Link>
                        <div className='m-corazon'>
                          <FaHeart onClick={(e) => { e.stopPropagation(); eliminaFavorita(iniciativa.idIniciativa); }} style={{ cursor: "pointer" }} />
                        </div>
                      </div>
                    ) : (
                      <div key={iniciativa.idIniciativa} className='m-iniciativa' onClick={() => seleccionaIniciativa(iniciativa, index)}>
                        <div className='m-iniciativa-imagen'>
                          <img src={iniciativa.urlImagen} alt={iniciativa.titulo} />
                        </div>
                        <div className='m-iniciativa-contenido'>
                          <div className="m-titulo">{iniciativa.titulo}</div>
                          <div className="m-desc">{iniciativa.descripcion}</div>
                        </div>
                        <div className='m-corazon'>
                          <FaHeart onClick={(e) => { e.stopPropagation(); eliminaFavorita(iniciativa.idIniciativa); }} style={{ cursor: "pointer" }} />
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
            esAdmin={false}
            esMiembro={false}
            suscribirDesactivado={suscribirDesactivado}
            setSuscribirDesactivado={setSuscribirDesactivado}
            pagina = {"Explore"}
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