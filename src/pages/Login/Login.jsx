import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { loginUsuario, getEsAdmin } from './Login-fb.js';
import { FaArrowRight, FaEye, FaEyeSlash, FaExclamationCircle} from 'react-icons/fa';
import './Login.css';

export const Login = () => {
  {/* Variables */}
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  {/* Funciones */}
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Correo y contraseña no pueden ser campos vacíos');
      setShowModal(true);
      return;
    }

    if (!validateEmail(email)) {
      setInvalidEmail(true);
      return;
    }

    try {
      const user = await loginUsuario(email, password, setUser);
      try {
        const esAdmin = await getEsAdmin(user);
        const nextPage = esAdmin ? '/exploreAdmin' : '/home';
        navigate(nextPage);
      } catch {
        console.error("Error al obtener si el usuario es admin");
      }
    } catch {
      setError('Inicio de sesión fallido. Verifica tu correo y contraseña.');
      setShowModal(true);
    }
  };

  {/* Render */}
  return (
    <div className='container-login-1'>
      <div className='container-login-2'>
        {/* Titulo */}
        <h2 className='header-login'>Inicio Sesión</h2>
        
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className='container-correo'>
            <p className='correo-texto'>Correo</p>

            {/* Caja de correo */}
            <div className="relative">
              <input
                className={`correo-caja ${invalidEmail ? 'border-red-500' : ''}`}
                type="correo"
                placeholder="Ingresa el correo"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setInvalidEmail(false);
                }}
              />

              {/* Advertencia de correo */}
              {invalidEmail && (
              <div className="absolute left-0 mt-1 bg-white bg-opacity-75 p-1 rounded flex items-center">
                <FaExclamationCircle className="text-red-500 text-base mr-2" />
                <span className="text-red-500 text-base">Formato de correo inválido</span>
              </div>        
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div className='container-contrasena'>
            <p className='contrasena-texto'>Contraseña</p>
            <div className="relative" style={{ marginLeft: "50px" }}>
              {/* Ojo */}
              <input className="ojo-contrasena" type={showPassword ? 'text' : 'password'} placeholder="Ingresa la contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
              <span className="ojo-contrasena-2" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Flecha para hacer login */}
          <div className='flecha-login'>
            <button type="submit" className="btn" style={{ fontSize: "40px", backgroundColor: "transparent"}}>
              <FaArrowRight />
            </button>
          </div>
          
        </form>
      </div>

      {/* Botón de Políticas de Privacidad */}
      <button className='boton-politicas-privacidad' onClick={() => setShowPrivacyPolicy(true)}>Políticas de Privacidad</button>

      {/* Popup de Políticas de Privacidad */}
      {showPrivacyPolicy && (
        <div className='pop-up'>
          <div className='pop-up-2'>
            <h2 style={{textAlign: 'center'}}>Política de Privacidad</h2>
            <p>
              Última actualización: [15/04/2024]
              <br />
              Nosotros, Evertech, valoramos tu privacidad y nos comprometemos a proteger la información personal que compartes con nosotros. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos tu información cuando visitas nuestro sitio web y utilizas nuestros servicios.
            </p>
            <h3>Recopilación de Información</h3>
            <p>
              Cuando utilizas nuestro sitio web y servicios, podemos recopilar la siguiente información:
              <ul>
                <li>Información de registro: Cuando creas una cuenta, podemos recopilar tu nombre, dirección de correo electrónico y otra información relevante necesaria para crear y mantener tu cuenta.</li>
                <li>Información de perfil: Puedes elegir proporcionar información adicional en tu perfil, como tu ubicación, ocupación u otros detalles personales.</li>
                <li>Contenido generado por el usuario: La información que compartes voluntariamente en el sitio web, como comentarios, publicaciones o iniciativas que creas.</li>
                <li>Información de uso: Recopilamos automáticamente información sobre cómo interactúas con nuestro sitio web, como tu dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia en el sitio.</li>
              </ul>
            </p>
            <h3>Uso de la Información</h3>
            <p>
              Utilizamos la información recopilada para los siguientes fines:
              <ul>
                <li>Proporcionar y mejorar nuestros servicios, incluida la personalización del contenido que se muestra.</li>
                <li>Comunicarnos contigo sobre tu cuenta, iniciativas en las que participas y actualizaciones importantes relacionadas con nuestros servicios.</li>
                <li>Analizar el rendimiento del sitio web y obtener información sobre cómo se utiliza para mejorar la experiencia del usuario.</li>
                <li>Cumplir con nuestras obligaciones legales y proteger nuestros derechos legales.</li>
              </ul>
            </p>
            <h3>Compartir Información</h3>
            <p>
              No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales sin tu consentimiento, excepto en las siguientes circunstancias:
              <ul>
                <li>Con tu consentimiento explícito.</li>
                <li>Con proveedores de servicios que nos ayudan a operar nuestro sitio web y prestar servicios, sujetos a obligaciones de confidencialidad.</li>
                <li>Cuando sea necesario para cumplir con la ley, procesar solicitudes legales o proteger nuestros derechos legales.</li>
              </ul>
            </p>
            <h3>Seguridad de la Información</h3>
            <p>
              Tomamos medidas razonables para proteger tu información personal contra accesos no autorizados, divulgación, alteración o destrucción. Sin embargo, debes tener en cuenta que ninguna medida de seguridad es completamente impenetrable y que ninguna transmisión de datos a través de Internet puede garantizarse como 100% segura.
            </p>
            <h3>Tus Derechos de Privacidad</h3>
            <p>
              Tienes derecho a acceder, corregir, actualizar o eliminar tu información personal en cualquier momento. Si deseas ejercer estos derechos o tienes alguna pregunta sobre nuestra Política de Privacidad, no dudes en contactarnos a través de [correo electrónico o formulario de contacto].
            </p>
            <h3>Cambios en la Política de Privacidad</h3>
            <p>
              Nos reservamos el derecho de actualizar o modificar esta Política de Privacidad en cualquier momento. Te notificaremos sobre cambios significativos mediante una notificación en nuestro sitio web o por otros medios antes de que el cambio entre en vigencia.
              <br />
              Al utilizar nuestro sitio web y servicios, aceptas esta Política de Privacidad y cualquier cambio posterior en ella.
            </p>
            <button onClick={() => setShowPrivacyPolicy(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Popup de Error */}
      {showModal && (
        <div className='pop-up'>
          <div className='pop-up-3'>
            <p style={{textAlign: 'center', color: 'red'}}>{error}</p>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}