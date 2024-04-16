import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getIniciativasMiembro, getIniciativasAdmin } from '../backend/MyInitiatives-functions.js';
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
            <div className="rounded-box-img">
              <img src={iniciativaMiembro.urlImagen} alt={iniciativaMiembro.titulo} />
            </div>
            <div className="rounded-box-txt">
              <p>{iniciativaMiembro.titulo}</p>
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
            <div className="rounded-box-img">
              <img src={iniciativaAdmin.urlImagen} alt={iniciativaAdmin.titulo} />
            </div>
            <div className="rounded-box-txt">
              <p>{iniciativaAdmin.titulo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <Link to="/initiative">
      <button type="button" className="btn" style={{ fontSize: "18px", width: "130px", backgroundColor: "#D9D9D9", borderRadius: "18px", height: "50px", fontWeight: "bold" }}>
        Info
      </button>
    </Link>

  </div>
  );
}