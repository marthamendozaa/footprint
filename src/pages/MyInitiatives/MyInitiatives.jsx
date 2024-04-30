import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getUsuario, getIniciativa } from '../../api/api.js';
import Usuario from '../../classes/Usuario.js';
import './MyInitiatives.css';

export const MyInitiatives = () => {
  const { user } = useAuth();
  const [ usuario ] = useState(new Usuario());
  
  // Información de iniciativas del usuario
  const [iniciativasMiembro, setIniciativasMiembro] = useState(null);
  const [iniciativasAdmin, setIniciativasAdmin] = useState(null);
  const [iniciativasFavoritas, setIniciativasFavoritas] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const usuarioData = await getUsuario(user);
      const objUsuario = { ...usuario, ...usuarioData };
      
      // Obtiene información de iniciativas suscritas
      const iniciativasMiembroData = [];
      for (const idIniciativa of objUsuario.listaIniciativasMiembro) {
        const iniciativaData = await getIniciativa(idIniciativa);
        iniciativasMiembroData.push(iniciativaData);
      }
      setIniciativasMiembro(iniciativasMiembroData);
      
      // Obtiene información de iniciativas creadas
      const iniciativasAdminData = [];
      for (const idIniciativa of objUsuario.listaIniciativasAdmin) {
        const iniciativaData = await getIniciativa(idIniciativa);
        iniciativasAdminData.push(iniciativaData);
      }
      setIniciativasAdmin(iniciativasAdminData);
      
      // Obtiene información de iniciativas favoritas
      const iniciativasFavoritasData = [];
      for (const idIniciativa of objUsuario.listaIniciativasFavoritas) {
        const iniciativasFavoritasData = await getIniciativa(idIniciativa);
        iniciativasAdminData.push(iniciativasFavoritasData);
      }
      setIniciativasFavoritas(iniciativasFavoritasData);
    };
    fetchData();
  }, []);


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
                  <Link key={index} to={`/initiative/${iniciativa.idIniciativa}`}>
                    <div className="m-iniciativa" key={index}>
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
                  <Link key={index} to={`/initiative/${iniciativa.idIniciativa}`}>
                    <div className="m-iniciativa" key={index}>
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
                No hay iniciativas favoritas
              </div>
            ) : (
              <div className="m-iniciativas-container">
                {iniciativasFavoritas.map((iniciativa, index) => (
                  <Link to={`/initiative/${iniciativa.idIniciativa}`}>
                    <div className="m-iniciativa" key={index}>
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
  

        </div>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </div>
  );  
}