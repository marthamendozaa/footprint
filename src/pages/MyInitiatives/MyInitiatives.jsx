import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getMisIniciativas } from '../../api/api.js';
import './MyInitiatives.css';

export const MyInitiatives = () => {
  const { user } = useAuth();
  
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
                No hay iniciativas favoritas
              </div>
            ) : (
              <div className="m-iniciativas-container">
                {iniciativasFavoritas.map((iniciativa, index) => (
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
  

        </div>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </div>
  );  
}