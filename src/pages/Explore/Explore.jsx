import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Explore.css';
import { useAuth } from '../../contexts/AuthContext';
import Solicitud from '../../classes/Solicitud.js'
import { getIniciativas, crearSolicitud, getUsuario, actualizaUsuario, getMisIniciativas } from '../../api/api.js';
import { Spinner } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch } from "react-icons/fa";
import Fuse from 'fuse.js';
import ModalIniciativa from '../../assets/ModalIniciativa.jsx';

export const Explore = () => {
    // Iniciativas
    const [filter, setFilter] = useState('');
    const [iniciativas, setIniciativas] = useState(null);
    const [filteredIniciativas, setFilteredIniciativas] = useState(null);

    // Seleccionar una iniciativa
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const [selectedIniciativa, setSelectedIniciativa] = useState(null); // State to store the selected iniciativa
    const [selectedIniciativaIndex, setSelectedIniciativaIndex] = useState(null);

    // Usuario
    const { user } = useAuth();
    const [usuario, setUsuario] = useState(null);

    // Iniciativas favoritas
    const [iniciativasFavoritas, setIniciativasFavoritas] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const iniciativasData = await getIniciativas();
            setIniciativas(iniciativasData);
            setFilteredIniciativas(iniciativasData); // Initialize filteredIniciativas with all iniciativas

            const usuarioData = await getUsuario(user);
            setUsuario(usuarioData);

            const misIniciativasData = await getMisIniciativas(user);
            setIniciativasFavoritas(misIniciativasData.iniciativasFavoritas.map(iniciativa => iniciativa.idIniciativa));
        };
        fetchData();
    }, []);
    
    const searchText = (event) => {
        const searchTerm = event.target.value;
        console.log("Search Term:", searchTerm);
        setFilter(searchTerm);
    
        if (!searchTerm) {
            // If the search term is empty, show all iniciativas
            setFilteredIniciativas(iniciativas);
            return;
        }
    
        const fuse = new Fuse(iniciativas, {
            keys: ['titulo','descripcion'], // Specify the keys you want to search in
            includeScore: true,
            threshold: 0.4, // Adjust the threshold as needed
        });
    
        const result = fuse.search(searchTerm);
        const filtered = result.map((item) => item.item); // Extract the actual items from Fuse.js result
        setFilteredIniciativas(filtered);
    };
    
    const [esAdmin, setEsAdmin] = useState(false);
    const [esMiembro, setEsMiembro] = useState(false);
    const [suscribirDesactivado, setSuscribirDesactivado] = useState(false);

    const handleButtonClick = async (iniciativa, index) => {
        for (const solicitud of usuario.listaSolicitudes) {
          if (iniciativa.listaSolicitudes.includes(solicitud)) {
            setSuscribirDesactivado(true);
          }
        }

        setSelectedIniciativa(iniciativa);
        setSelectedIniciativaIndex(index);

        if (iniciativa.listaMiembros.includes(user)) {
            setEsMiembro(true);
        } else if (iniciativa.idAdmin === user){
            setEsAdmin(true);
        } else {
            setEsAdmin(false);
            setEsMiembro(false);
        }
        setShowModal(true);
    }

    const handleCrearSolicitud = async () => {
        if (selectedIniciativa) {
            const idIniciativa = selectedIniciativa.idIniciativa; // Suponiendo que el id de la iniciativa está almacenado en selectedIniciativa.id
            try {
                setSuscribirDesactivado(true);
                const solicitud = new Solicitud(user, idIniciativa, "Pendiente", "UsuarioAIniciativa");
                const response = await crearSolicitud(solicitud);
                if (response.success) {
                    const iniciativasNuevo = [...iniciativas];
                    iniciativasNuevo[selectedIniciativaIndex].listaSolicitudes.push(response.data);
                    setIniciativas(iniciativasNuevo);

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
    }

    // Toggle de icono de favoritos
    const handleToggleFavorita = async (idIniciativa) => {
      let iniciativasFavoritasNuevo = [...iniciativasFavoritas];

      if (iniciativasFavoritas.includes(idIniciativa)) {
          iniciativasFavoritasNuevo = iniciativasFavoritas.filter(favorita => favorita !== idIniciativa);
      } else {
          iniciativasFavoritasNuevo.push(idIniciativa);
      }
      setIniciativasFavoritas(iniciativasFavoritasNuevo);

      const usuarioNuevo = {...usuario};
      usuarioNuevo.listaIniciativasFavoritas = iniciativasFavoritasNuevo;
      await actualizaUsuario(usuarioNuevo);
      setUsuario(usuarioNuevo);
    };

    return (
        <div>
            {/* Spinner */}
            {filteredIniciativas && iniciativasFavoritas ? (
                <div className='e-container'>
                    <div className='e-seccion-container'>
                        {/* Barra de búsqueda */}
                        <div className='e-searchBar'>
                            <FaSearch className="e-icons"/>
                            <input
                                type='search'
                                placeholder='¿Qué iniciativa buscas?'
                                value={filter}
                                onChange={searchText}
                                className='e-searchBarCaja'
                            />
                        </div>

                        {/* Iniciativas */}
                        <div className='e-iniciativas-container'>
                        {filteredIniciativas && filteredIniciativas.map((item, index) => (
                            <div key={index} className='e-iniciativa' onClick={() => handleButtonClick(item, index)}>
                                <div className='e-iniciativa-imagen'>
                                    <img src={item.urlImagen} alt = {item.titulo} />
                                </div>
                                <div className='e-iniciativa-contenido'>
                                  <div className="e-titulo">{item.titulo}</div>
                                  <div className="e-desc">{item.descripcion}</div>
                                  <div className='e-corazon' onClick={(e) => e.stopPropagation()}>
                                      {iniciativasFavoritas.includes(item.idIniciativa) ? (
                                        <FaHeart onClick={() => handleToggleFavorita(item.idIniciativa)} style={{ cursor: "pointer" }} />
                                      ) : (
                                        <FaRegHeart onClick={() => handleToggleFavorita(item.idIniciativa)} style={{ cursor: "pointer" }} />
                                      )}
                                  </div>
                                </div>
                            </div>
                        ))}
                        </div>

                        {/* Mostrar información adicional */}
                        <ModalIniciativa
                            showModal={showModal}
                            setShowModal={setShowModal}
                            selectedIniciativa={selectedIniciativa}
                            handleCrearSolicitud={handleCrearSolicitud}
                            esAdmin={esAdmin}
                            esMiembro={esMiembro}
                            suscribirDesactivado={suscribirDesactivado}
                            setSuscribirDesactivado={setSuscribirDesactivado}
                            pagina = {"Explore"}
                        />
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