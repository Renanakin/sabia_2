export interface TeamMember {
  id: string;
  name: string;
  role: string;
  shortDesc: string;
  bio: string;
  linkedin?: string;
  image: string;
  // Puedes usar esto para bajar/subir la imagen. Ej: "center 20%" o "center 10px". Por defecto es "center"
  objectPosition?: string;
}

export interface ServiceItem {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  bullets: string[];
  features: string[];
  seoLongTailContent?: string;
  image: string;
  homeBullets?: string[];
}

export const servicesData: ServiceItem[] = [
  {
    slug: "contabilidad-integral",
    title: "Contabilidad Integral",
    shortDescription: "Nos encargamos de tu contabilidad para que tengas orden, control y claridad en tu empresa.",
    fullDescription: "Nos encargamos de tu contabilidad para que tengas orden, control y claridad en tu empresa. Mantenemos tu información actualizada, cumplimos con la normativa vigente y te entregamos herramientas para tomar mejores decisiones.",
    bullets: [
      "Asesoría contable continua.",
      "Externalización en el área de contabilidad.",
      "Declaración de impuestos mensuales y anuales.",
      "Preparación de Estados Financieros.",
      "Reprocesos de contabilidades.",
      "Contraloría contable y tributaria.",
      "Planes contables personalizados."
    ],
    homeBullets: [
      "Gestión contable mensual y cierre oportuno",
      "Declaraciones de impuestos mensuales y anuales",
      "Información financiera clara para la toma de decisiones"
    ],
    features: [
      "Información contable actualizada y disponible para tu gestión",
      "Un equipo que conoce tu empresa y te acompaña de forma constante",
      "Comunicación directa y seguimiento periódico"
    ],
    /* seoLongTailContent: `### ¿Por qué externalizar tu contabilidad con expertos?
Llevar la contabilidad interna consume recursos valiosos y aumenta el riesgo de errores tributarios. Nuestro servicio de contabilidad integral en Chile está diseñado para que tu pyme mantenga sus finanzas en orden sin esfuerzo.

### Nuestro proceso contable mensual
Nos conectamos directamente con tus plataformas de facturación para automatizar la captura de datos. Desde la centralización de compras y ventas hasta el análisis de ratios financieros, cubrimos todo el espectro para que puedas presentar balances impecables ante bancos y accionistas.`, */
    image: "/images/contabilidad_integral.png"
  },
  {
    slug: "gestion-de-remuneraciones",
    title: "Gestión de Remuneraciones",
    shortDescription: "Administramos tus remuneraciones con orden y cumplimiento, para que tu empresa funcione sin contingencias laborales.",
    fullDescription: "Administramos tus remuneraciones con orden y cumplimiento, para que tu empresa funcione sin contingencias laborales. Nos encargamos de los procesos clave y te apoyamos para que tengas claridad y control sobre tu gestión de personas.",
    bullets: [
      "Confección de remuneraciones (Rol General).",
      "Rol Privado de Remuneraciones (informe confidencial para gerencia).",
      "Elaboración de contratos y finiquitos.",
      "Carga de leyes sociales (AFP, salud, seguro de cesantía).",
      "Carga de LRE (Libro de Remuneraciones Electrónico) ante la Dirección del Trabajo.",
      "Certificado F30: Antecedentes Laborales y Previsionales.",
      "Certificado F30-1: Cumplimiento de Obligaciones Laborales y Previsionales.",
      "Contraloría de remuneraciones."
    ],
    features: [
      "Proceso de remuneraciones ordenado y al día",
      "Acompañamiento en la gestión y dudas laborales",
      "Comunicación directa con tu consultor asignado"
    ],
    homeBullets: [
      "Procesamiento mensual de remuneraciones",
      "Contratos, finiquitos y gestión laboral",
      "Cumplimiento previsional y legal al día"
    ],
    /* seoLongTailContent: `### Evita multas de la Dirección del Trabajo
El cálculo incorrecto de sueldos, finiquitos o cotizaciones en PreviRed puede resultar en graves penalizaciones. Delegar la gestión de remuneraciones asegura precisión técnica y cumplimiento normativo.

### Soluciones completas para Recursos Humanos
No solo procesamos las liquidaciones a fin de mes. Te asesoramos en la redacción de anexos de contratos, control de vacaciones, cálculo de horas extras y representación ante fiscalizaciones, brindando soporte integral a tu área de recursos humanos.`, */
    image: "/images/remuneraciones_realista.png"
  },
  {
    slug: "gestion-tributaria",
    title: "Gestión Tributaria",
    shortDescription: "Optimizamos tu gestión tributaria con un enfoque claro y ordenado, para que tu empresa cumpla con la normativa y evite contingencias.",
    fullDescription: "Optimizamos tu gestión tributaria con un enfoque claro y ordenado, para que tu empresa cumpla con la normativa y evite contingencias. Te acompañamos en el cumplimiento y análisis tributario para que tomes decisiones con mayor seguridad.",
    bullets: [
      "Asesoría y optimización tributaria.",
      "Confección mensual de cierres tributarios.",
      "Consultoría y cumplimiento tributario.",
      "Asesoría en la implementación de la reforma tributaria para empresas y dueños.",
      "Estudio y análisis tributario."
    ],
    features: [
      "Gestión tributaria ordenada y al día",
      "Acompañamiento en decisiones y situaciones tributarias",
      "Comunicación directa con tu consultor asignado"
    ],
    homeBullets: [
      "Declaraciones mensuales y anuales al día",
      "Asesoría en cumplimiento y gestión tributaria",
      "Análisis para apoyar la toma de decisiones"
    ],
    /* seoLongTailContent: `### Estrategia y Planificación Tributaria en Chile
Pagar más impuestos de lo justo por desconocimiento de las franquicias legales es un error común. Nuestros expertos tributarios analizan el régimen fiscal de tu empresa para aplicar estrategias legales de ahorro y eficiencia.

### Declaraciones de Renta sin contratiempos
La Operación Renta anual y las Declaraciones Juradas previas exigen rigor extremo. Nos adelantamos a los plazos del SII para detectar discrepancias, realizar el cruce de información y garantizar una declaración libre de contingencias o fiscalizaciones sorpresivas.`, */
    image: "/images/tributaria_realista.png"
  },
  {
    slug: "creacion-de-empresa",
    title: "Creación de Empresa",
    shortDescription: "Te acompañamos en la creación de tu empresa de forma clara y ordenada, para que partas sin errores y con una base sólida.",
    fullDescription: "Te acompañamos en la creación de tu empresa de forma clara y ordenada, para que partas sin errores y con una base sólida. Te asesoramos en cada paso para que tomes buenas decisiones desde el inicio.",
    bullets: [
      "Escritura Pública.",
      "Inscripción en el Registro de Comercio.",
      "Inscripción en Conservador de Bienes Raíces.",
      "Publicación en el Diario Oficial.",
      "Obtención de Rut.",
      "Tu empresa en un día (Registro De Empresas Y Sociedades).",
      "Inicio actividades SII.",
      "Inscripción Factura electrónica."
    ],
    features: [
      "Proceso de constitución claro y guiado paso a paso",
      "Asesoría en la elección de estructura y régimen tributario",
      "Comunicación directa con tu consultor asignado"
    ],
    homeBullets: [
      "Constitución y formalización de empresa",
      "Asesoría en estructura y régimen tributario",
      "Inicio de actividades y habilitación para facturar"
    ],
    /* seoLongTailContent: `### Emprende con bases sólidas desde el día 1
Constituir una empresa requiere elegir la figura societaria correcta (SpA, EIRL, Limitada) y el régimen tributario adecuado. Una mala elección inicial puede costar millones en impuestos futuros. Nosotros te asesoramos paso a paso.

### Más que 'Tu Empresa en un Día'
Si bien la plataforma del Estado facilita el registro, el proceso real incluye inicio de actividades, acreditación de domicilio, verificación de actividades ante el SII y obtención de patentes municipales. Nos encargamos de todo el ecosistema burocrático para que empieces a facturar rápidamente.`, */
    image: "/images/creacion_realista.png"
  },
  {
    slug: "auditoria-financiera",
    title: "Auditoría Financiera y Tributaria",
    shortDescription: "Evaluamos la información financiera y tributaria de tu empresa para entregarte una visión clara y confiable de su situación.",
    fullDescription: "Evaluamos la información financiera y tributaria de tu empresa para entregarte una visión clara y confiable de su situación. Te ayudamos a detectar riesgos, validar tus procesos y fortalecer el control para una mejor toma de decisiones.",
    bullets: [
      "Auditoría Estados Financieros.",
      "Auditoría Tributaria.",
      "Auditoría Interna.",
      "Auditoria de Condominios.",
      "Revisión información contable.",
      "Revisión información de remuneraciones.",
      "Revisión de procesos."
    ],
    features: [
      "Evaluación independiente y objetiva de tu información",
      "Identificación de riesgos y puntos de mejora",
      "Comunicación directa con tu consultor asignado"
    ],
    homeBullets: [
      "Auditoría de estados financieros",
      "Auditoría tributaria",
      "Revisión de procesos y control interno"
    ],
    /* seoLongTailContent: `### Transparencia que genera confianza
Una auditoría financiera externa valida la veracidad de tus estados financieros. Es una herramienta indispensable si buscas rondas de inversión, créditos bancarios de alto volumen o si hay reestructuración de socios en la empresa.

### Detección de riesgos y mejora de procesos operativos
Más allá de certificar los números, nuestra auditoría bajo normas IFRS revisa tu sistema de control interno. Identificamos puntos vulnerables al fraude, ineficiencias en el flujo de caja y entregamos reportes accionables para mejorar la salud corporativa de tu pyme.`, */
    image: "/images/auditoria_realista.png"
  }
];

export const homeStats = [
  { value: 10, stringValue: "10+", suffix: "+", label: "Años de exp." },
  { value: 100, stringValue: "100", suffix: "+", label: "Clientes" },
  { value: 5, stringValue: "5", suffix: "", label: "Expertos" },
];

export const homeFeatures = [
  {
    title: "Flexibilidad",
    desc: "Adaptamos nuestros servicios contables, tributarios y financieros a la realidad y necesidades de tu empresa.",
    iconName: "Settings",
  },
  {
    title: "Soporte",
    desc: "Brindamos apoyo continuo en materias contables, tributarias y laborales, con respuestas claras y oportunas.",
    iconName: "Users",
  },
  {
    title: "Compromiso",
    desc: "Trabajamos como parte de tu equipo, con foco en el cumplimiento y el logro de tus objetivos.",
    iconName: "ShieldCheck",
  },
  {
    title: "Gestión de Información",
    desc: "Convertimos tu contabilidad en información clara para que tengas control y tomes mejores decisiones.",
    iconName: "Landmark",
  },
];
/*
export const teamData: TeamMember[] = [
  {
    id: "jorge",
    name: "Jorge Astorga Méndez",
    role: "Socio Director",
    shortDesc: "Contador Auditor y Magíster en Tributaria con más de 18 años de experiencia liderando estrategias financieras y optimización fiscal corporativa.",
    bio: "### Nuestra Forma de Trabajar\nBuscamos ser el socio estratégico clave de nuestros clientes, garantizando el cumplimiento estricto de la normativa tributaria y financiera vigente mediante una gestión transparente y proactiva.\n\n### Mi Rol en Sabia Contable\nLidero el diseño de soluciones contables, tributarias y laborales complejas, asegurando que cada pyme y profesional reciba una asesoría estratégica y personalizada adaptada a sus objetivos de negocio.\n\n### Competencia Profesional\nCon una destacada trayectoria en contabilidad, planificación tributaria, control de gestión y finanzas corporativas en sectores comerciales, industriales y de servicios. Su enfoque combina un sólido dominio teórico y práctico, orientado a maximizar la eficiencia y mitigar riesgos normativos.",
    linkedin: "https://www.linkedin.com/in/jorge-ernesto-astorga-mendez-1a53b956/",
    image: "/images/equipo/jorge.webp"
  },
  {
    id: "lizbet",
    name: "Lisbet Lumbrera Marambio",
    role: "Analista Contable",
    shortDesc: "Especialista en cumplimiento tributario mensual, reportería financiera y gestión integral de nóminas con enfoque en control de precisión.",
    bio: "### Nuestra Forma de Trabajar\nTrabajamos con rigurosidad técnica, empatía y cercanía. Nos enfocamos en simplificar la complejidad de los procesos contables y laborales para ofrecer tranquilidad operativa y claridad financiera a nuestros clientes.\n\n### Mi Rol en Sabia Contable\nResponsable de estructurar y supervisar el cumplimiento fiscal mensual (F29) y anual de las carteras de clientes, brindando soporte continuo en remuneraciones, PreviRed y conciliaciones bancarias.\n\n### Competencia Profesional\nProfesional con alta orientación al detalle, capacidad analítica y dominio de la legislación contable y laboral chilena. Especialista en la resolución ágil de requerimientos y optimización de procesos de información interna.",
    image: "/images/equipo/lisbet.webp"
  },
  {
    id: "daphnee",
    name: "Daphnee Astorga",
    role: "Asistente de Gestión",
    shortDesc: "Soporte operativo y coordinación documental para mantener la información de clientes ordenada y al día.",
    bio: "### Nuestra Forma de Trabajar\nAcompañamos cada proceso con orden, trazabilidad y respuesta oportuna.\n\n### Mi Rol en Sabia Contable\nCoordino la recepción y seguimiento de antecedentes contables y laborales para asegurar continuidad operativa.\n\n### Competencia Profesional\nFuerte foco en organización, control de documentación y atención cercana a clientes en procesos administrativos.",
    image: "/images/equipo/daphnee.webp"
  },
  {
    id: "ketherine",
    name: "Ketherine Marambio",
    role: "Analista de Apoyo",
    shortDesc: "Apoyo en procesos de conciliación, control de respaldos y preparación de reportes para clientes pyme.",
    bio: "### Nuestra Forma de Trabajar\nCombinamos precisión técnica y cercanía para resolver requerimientos con rapidez.\n\n### Mi Rol en Sabia Contable\nParticipo en la preparación y validación de información contable para procesos mensuales y cierres.\n\n### Competencia Profesional\nPerfil analítico orientado al detalle, cumplimiento de plazos y mejora continua de flujos de trabajo internos.",
    image: "/images/equipo/katherine.webp"
  }
];
*/

export const teamData: TeamMember[] = [
  {
    id: "jorge",
    name: "Jorge Astorga Méndez",
    role: "Socio Director",
    shortDesc: "Contador Auditor y Magíster en Tributación con más de 18 años de experiencia en asesoría empresarial.",
    bio: "**Mi Rol en Sabia Contable:** Lidero la estrategia y supervisión integral de los servicios contables, tributarios, laborales y financieros, apoyando a nuestros clientes en la toma de decisiones y en el cumplimiento eficiente de sus obligaciones.\n\n**Perfil Profesional:** Contador Auditor y Magíster en Tributación con más de 18 años de experiencia en asesoría empresarial. Especializado en contabilidad, tributación y control de gestión, enfoco mi trabajo en entregar soluciones estratégicas, combinando conocimiento técnico con una visión de negocio orientada a resultados.",
    linkedin: "https://www.linkedin.com/in/jorge-ernesto-astorga-mendez-1a53b956/",
    image: "/images/equipo/jorge.webp",
    objectPosition: "center 30%"
  },
  {
    id: "lizbet",
    name: "Lisbet Lumbrera Marambio",
    role: "Consultora Tributaria",
    shortDesc: "Contadora Auditora con formación en tributación, orientada al análisis y cumplimiento normativo.",
    bio: "**Mi Rol en Sabia Contable:** Apoyo la gestión tributaria y contable de nuestros clientes, participando en la preparación y revisión de impuestos, declaraciones juradas, procesos de Operación Renta y gestión de remuneraciones, velando por el correcto cumplimiento de las obligaciones fiscales y laborales.\n\n**Perfil Profesional:** Contadora Auditora con formación en tributación, orientada al análisis y cumplimiento normativo. Destaco por mi rigurosidad y capacidad de trabajo con información compleja, contribuyendo a entregar seguridad y confiabilidad en la gestión tributaria.",
    image: "/images/equipo/lisbet.webp",
    objectPosition: "center 20%" // Ajusta el porcentaje (ej. 10%, 20%, 30%) para moverla unos pixeles arriba o abajo
  },
  {
    id: "daphnee",
    name: "Daphnee López Muñoz",
    role: "Consultora Contable",
    shortDesc: "Contadora Auditora comprometida con el aprendizaje continuo y la calidad del trabajo.",
    bio: "**Mi Rol en Sabia Contable:** Participo en la gestión contable, tributaria y de remuneraciones, apoyando en contabilizaciones, análisis de cuentas, preparación de impuestos y procesos laborales, contribuyendo a mantener información financiera ordenada y confiable.\n\n**Perfil Profesional:** Contadora Auditora comprometida con el aprendizaje continuo y la calidad del trabajo. Me caracterizo por mi responsabilidad y capacidad analítica, aportando al correcto funcionamiento de los procesos contables.",
    image: "/images/equipo/daphnee.webp",
    objectPosition: "center 20%" // Ajusta el porcentaje (ej. 10%, 20%, 30%) para moverla unos pixeles arriba o abajo
  },
  {
    id: "matias",
    name: "Matías Salinas Cavieres",
    role: "Consultor Contable",
    shortDesc: "Contador Auditor metódico y orientado al detalle, con enfoque en la correcta ejecución de procesos.",
    bio: "**Mi Rol en Sabia Contable:** Apoyo la gestión contable, tributaria y de remuneraciones, participando en registros contables, análisis de cuentas y cumplimiento de procesos mensuales y anuales.\n\n**Perfil Profesional:** Contador Auditor metódico y orientado al detalle, con enfoque en la correcta ejecución de procesos y cumplimiento de plazos, contribuyendo a la continuidad y calidad del servicio.",
    image: "/images/equipo/matias.webp"
  },
  {
    id: "ketherine",
    name: "Katherine Domínguez Pizarro",
    role: "Consultora Contable",
    shortDesc: "Contadora Auditora orientada al cumplimiento y eficiencia de los procesos.",
    bio: "**Mi Rol en Sabia Contable:** Colaboro en los procesos contables, tributarios y laborales de nuestros clientes, apoyando en análisis de cuentas, remuneraciones y atención de requerimientos, asegurando un servicio ordenado, oportuno y confiable.\n\n**Perfil Profesional:** Contadora Auditora orientada al cumplimiento y eficiencia de los procesos. Me caracterizo por mi organización, capacidad de análisis y orientación al servicio, contribuyendo a mantener una gestión ordenada y confiable para nuestros clientes.",
    image: "/images/equipo/katherine.webp"
  },
  {
    id: "anais",
    name: "Anaís Álvarez Sáez",
    role: "Soporte Administrativo",
    shortDesc: "Técnico en Contabilidad con experiencia en apoyo a procesos administrativos y contables.",
    bio: "**Mi Rol en Sabia Contable:** Apoyo la gestión administrativa, contable y de remuneraciones de la empresa, coordinando procesos de facturación, cobranza, control documental y atención a clientes, contribuyendo al orden, cumplimiento de plazos y correcto funcionamiento operativo del equipo.\n\n**Perfil Profesional:** Técnico en Contabilidad con experiencia en apoyo a procesos administrativos y contables. Me caracterizo por mi organización, responsabilidad y orientación al cliente, contribuyendo a mantener una gestión ordenada, eficiente y confiable dentro de la empresa.",
    image: "/images/equipo/anais.png",
    objectPosition: "center 20%"
  }
];

export const testimonialsData = [
  {
    quote: "Delegar nuestra contabilidad en Sabia ha sido clave. Su equipo mantiene todo impecable, nos asesora de forma proactiva y nos da la total seguridad de que nuestra empresa está siempre al día y en las mejores manos.",
    author: "RAFAEL CORDERO D.",
    role: "Gerente General Cordero & Herrera Ltda."
  },
  {
    quote: "Sabia Contable me ordena todo lo tributario a la perfección. Si alguna vez olvido algún tema o documento, ellos se contactan proactivamente y me evitan cualquier problema con el SII. Me siento verdaderamente acompañado y tranquilo al evitar estas multas.",
    author: "HECTOR DELGADO A.",
    role: "Fundador Hackteck"
  },
  {
    quote: "Para alguien como yo, un servicio claro y conciso es importantísimo, ya que a veces no entiendo los procesos contables o del SII. El servicio profesional y personalizado que entregan en Sabia me permite confiar en ellos.",
    author: "RODRIGO ZAMORA R.",
    role: "Dueño de Solo Zeta – Producción Gráfica"
  }
];

export const faqsData = [
  {
    question: "¿Qué servicios ofrece Sabia Contable?",
    answer: "Asesoría en contabilidad, tributación, remuneraciones y acompañamiento para la gestión de tu empresa."
  },
  {
    question: "¿Trabajan con pymes?",
    answer: "Sí, trabajamos principalmente con pymes y también con empresas más grandes que valoran un servicio ordenado y cercano."
  },
  {
    question: "¿Pueden tomar mi contabilidad si ya está en curso?",
    answer: "Sí, evaluamos tu situación actual y realizamos un traspaso ordenado."
  },
  {
    question: "¿Cómo es el proceso para comenzar?",
    answer: "Coordinamos una reunión inicial, evaluamos tu caso y definimos la mejor forma de trabajo."
  },
  {
    question: "¿Puedo contratar solo un servicio específico?",
    answer: "Sí, adaptamos el servicio según las necesidades de cada empresa."
  }
];

