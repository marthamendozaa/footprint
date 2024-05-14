import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getMisIniciativas } from '../../api/api.js';
import './Requests.css';

export const Requests = () => {
  const { user } = useAuth();
  
  // Información de iniciativas del usuario
  const [iniciativasMiembro, setIniciativasMiembro] = useState(null);
  const [iniciativasAdmin, setIniciativasAdmin] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const iniciativasData = await getMisIniciativas(user);
      setIniciativasMiembro(iniciativasData.iniciativasMiembro);
      setIniciativasAdmin(iniciativasData.iniciativasAdmin);
    };
    fetchData();
  }, []);


  return (
    <div>
      {iniciativasMiembro && iniciativasAdmin ? (
        <div className="m-container">
          
          <div className="m-seccion-container">
            <div className="m-iniciativas-titulo">Solicitudes que he enviado</div>
  
            {iniciativasMiembro.length == 0 ? (
              <div className="m-error">
                No has enviado solicitudes nuevas.
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
            <div className="m-iniciativas-titulo">Solicitudes recibidas</div>
  
            {iniciativasAdmin.length == 0 ? (
              <div className="m-error">
                Aún no has recibido solicitudes.
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
  

        </div>
      ) : (
        <div className="spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </div>
  );  
}