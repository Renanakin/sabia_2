export default function PrivacidadPage() {
  return (
    <div className="bg-[#032030] text-slate-100 min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Política de Privacidad</h1>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>
            En Sabia Contable valoramos profundamente tu privacidad y nos comprometemos a proteger tus datos personales en estricto cumplimiento de la Ley 19.628 sobre Protección de la Vida Privada de Chile y sus modificaciones.
          </p>
          <h2 className="text-xl font-bold text-white mt-6">1. Identificación del Responsable</h2>
          <p>
            El responsable del tratamiento de los datos es Sabia Contable, con domicilio en Gran Avenida José Miguel Carrera 5234, Oficina 402, San Miguel, Región Metropolitana, Chile. Para consultas relacionadas con esta política, puedes escribirnos a <a className="text-[#d80073] hover:underline" href="mailto:contacto@sabiacontable.cl">contacto@sabiacontable.cl</a>.
          </p>
          <h2 className="text-xl font-bold text-white mt-6">2. Categorías de Datos Tratados</h2>
          <p>
            A través de nuestro sitio web, recopilamos los siguientes datos personales: nombre completo, correo electrónico, teléfono celular, empresa y requerimientos específicos ingresados en el formulario de contacto.
          </p>
          <h2 className="text-xl font-bold text-white mt-6">3. Finalidades y Base de Legitimidad</h2>
          <p>
            Los datos son tratados exclusivamente con las siguientes finalidades:
            <ul className="list-disc pl-6 mt-2">
              <li>Responder a tus consultas y solicitudes de asesoría.</li>
              <li>Coordinar reuniones y enviar cotizaciones de servicios.</li>
              <li>Realizar seguimiento comercial.</li>
            </ul>
            La base legal para el tratamiento de estos datos es el <strong>consentimiento expreso</strong> del titular (Art. 4 de la Ley 19.628), otorgado al enviar activamente el formulario de contacto.
          </p>
          <h2 className="text-xl font-bold text-white mt-6">4. Plazo de Conservación</h2>
          <p>
            Los datos personales serán conservados durante el tiempo necesario para cumplir con la finalidad para la cual fueron recabados. En el caso de solicitudes no concretadas en contratos comerciales, los datos se eliminarán en un plazo máximo de 3 años desde la última interacción.
          </p>
          <h2 className="text-xl font-bold text-white mt-6">5. Ejercicio de Derechos ARCO</h2>
          <p>
            Como titular de los datos, tienes derecho a ejercer tus derechos de Acceso, Rectificación, Cancelación, Oposición y Portabilidad. Para ejercerlos, debes enviar un correo a <a className="text-[#d80073] hover:underline" href="mailto:contacto@sabiacontable.cl">contacto@sabiacontable.cl</a> adjuntando copia de tu cédula de identidad para verificar tu titularidad. Responderemos a tu solicitud en los plazos establecidos por la ley.
          </p>
          <h2 className="text-xl font-bold text-white mt-6">6. Medidas de Seguridad</h2>
          <p>
            Sabia Contable aplica estrictas medidas de seguridad técnicas y organizativas para proteger tus datos contra acceso no autorizado, alteración o pérdida. Esto incluye el cifrado de datos en tránsito (protocolo HTTPS) y acceso restringido a las bases de datos.
          </p>
          <h2 className="text-xl font-bold text-white mt-6">7. Cesiones de Datos a Terceros</h2>
          <p>
            No vendemos ni comercializamos tus datos personales. Tus datos solo pueden ser compartidos con proveedores técnicos estrictamente necesarios para la operación del servicio (ej. servicios de hosting, plataformas de envío de correos electrónicos y sistemas de seguridad como Google reCAPTCHA), los cuales actúan como encargados de tratamiento bajo obligaciones de confidencialidad.
          </p>
          <h2 className="text-xl font-bold text-white mt-6">8. Modificaciones a la Política</h2>
          <p>
            Nos reservamos el derecho a modificar la presente Política de Privacidad para adaptarla a novedades legislativas o jurisprudenciales. Cualquier cambio significativo será notificado a través de este mismo sitio web.
          </p>
        </div>
      </div>
    </div>
  );
}

