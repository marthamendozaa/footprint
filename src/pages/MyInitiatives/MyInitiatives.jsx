import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="container">
    <div>
      <h2>Iniciativas donde soy miembro</h2>
      <div className="container-iniciativas">
        {iniciativasMiembro && iniciativasMiembro.map((iniciativaMiembro, index) => (
          <div key={index}>
            <Link to={`/initiative/${iniciativaMiembro.idIniciativa}`}>
              <button className="rounded-box-img">
                <img src={iniciativaMiembro.urlImagen} alt={iniciativaMiembro.titulo} />
              </button>
            </Link>
            <div className="rounded-box-txt">
              <p1>{iniciativaMiembro.titulo}</p1>
              <p2>{iniciativaMiembro.descripcion}</p2>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h2>Iniciativas creadas</h2>
      <div className="container-iniciativas">
        {iniciativasAdmin && iniciativasAdmin.map((iniciativaAdmin, index) => (
          <div key={index}>
            <Link to={`/initiative/${iniciativaAdmin.idIniciativa}`}>
              <button className="rounded-box-img">
                <img src={iniciativaAdmin.urlImagen} alt={iniciativaAdmin.titulo} />
              </button>
            </Link>
            <div className="rounded-box-txt">
              <p1>{iniciativaAdmin.titulo}</p1>
              <p2>{iniciativaAdmin.descripcion}</p2>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}