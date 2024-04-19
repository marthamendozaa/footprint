import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { getIniciativasMiembro, getIniciativasAdmin } from './MyInitiatives-fb.js';
import './MyInitiatives.css';

export const MyInitiatives = () => {
  const [iniciativasMiembro, setIniciativasMiembro] = useState(null);
  const [iniciativasAdmin, setIniciativasAdmin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const dataMiembro = await getIniciativasMiembro();
      setIniciativasMiembro(dataMiembro);
      const dataAdmin = await getIniciativasAdmin();
      setIniciativasAdmin(dataAdmin);
    };
    fetchData();
  });

  return (
    <div>
      {iniciativasMiembro && iniciativasAdmin ? (
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
                  <div className="m-iniciativa" key={index}>
                    <Link to={`/initiative/${iniciativa.idIniciativa}`}>
                      <button className="m-iniciativa-imagen">
                        <img src={iniciativa.urlImagen} alt={iniciativa.titulo} />
                      </button>
                    </Link>
                    <div className="m-iniciativa-texto">
                      <div className="m-titulo">{iniciativa.titulo}</div>
                      <div className="m-desc">{iniciativa.descripcion}</div>
                    </div>
                  </div>
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
                  <div className="m-iniciativa" key={index}>
                    <Link to={`/initiative/${iniciativa.idIniciativa}`}>
                      <button className="m-iniciativa-imagen">
                        <img src={iniciativa.urlImagen} alt={iniciativa.titulo} />
                      </button>
                    </Link>
                    <div className="m-iniciativa-texto">
                      <div className="m-titulo">{iniciativa.titulo}</div>
                      <div className="m-desc">{iniciativa.descripcion}</div>
                    </div>
                  </div>
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