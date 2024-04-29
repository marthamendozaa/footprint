import React from 'react';
import './PrivacyPolicy.css';

export const PrivacyPolicy = (props) => {
  return (
    <div className='pp-pop-up'>
        <div className='pop-up-2'>
            <h2 style={{textAlign: 'center'}}>Política de Privacidad</h2>
            <p>
                Última actualización: [15/04/2024]
                <br /><br />
                Nosotros, Evertech, valoramos tu privacidad y nos comprometemos a proteger la información personal que compartes con nosotros. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos tu información cuando visitas nuestro sitio web y utilizas nuestros servicios.
            </p>
            <h3>Recopilación de Información</h3>
            <ul>
                <li>Información de registro: Cuando creas una cuenta, podemos recopilar tu nombre, dirección de correo electrónico y otra información relevante necesaria para crear y mantener tu cuenta.</li>
                <li>Información de perfil: Puedes elegir proporcionar información adicional en tu perfil, como tu ubicación, ocupación u otros detalles personales.</li>
                <li>Contenido generado por el usuario: La información que compartes voluntariamente en el sitio web, como comentarios, publicaciones o iniciativas que creas.</li>
                <li>Información de uso: Recopilamos automáticamente información sobre cómo interactúas con nuestro sitio web, como tu dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia en el sitio.</li>
            </ul>
            <h3>Uso de la Información</h3>
            <ul>
                <li>Proporcionar y mejorar nuestros servicios, incluida la personalización del contenido que se muestra.</li>
                <li>Comunicarnos contigo sobre tu cuenta, iniciativas en las que participas y actualizaciones importantes relacionadas con nuestros servicios.</li>
                <li>Analizar el rendimiento del sitio web y obtener información sobre cómo se utiliza para mejorar la experiencia del usuario.</li>
                <li>Cumplir con nuestras obligaciones legales y proteger nuestros derechos legales.</li>
            </ul>
            <h3>Compartir Información</h3>
            <ul>
                <li>No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales sin tu consentimiento, excepto en las siguientes circunstancias:</li>
                <li>Con tu consentimiento explícito.</li>
                <li>Con proveedores de servicios que nos ayudan a operar nuestro sitio web y prestar servicios, sujetos a obligaciones de confidencialidad.</li>
                <li>Cuando sea necesario para cumplir con la ley, procesar solicitudes legales o proteger nuestros derechos legales.</li>
            </ul>
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
                <br /><br />
                Al utilizar nuestro sitio web y servicios, aceptas esta Política de Privacidad y cualquier cambio posterior en ella.
            </p>
            <button onClick={props.onClose}>Cerrar</button>
        </div>
    </div>
  );
};