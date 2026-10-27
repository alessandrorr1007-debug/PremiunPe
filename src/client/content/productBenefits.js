// Product-facing copy checked against official provider pages on 2026-10-23.
// This file enriches presentation only: no prices, cart items or saved products are changed.
// Seller-confirmed offers: Google AI Pro as a family member; Microsoft 365 Personal.
export const BENEFITS_REVIEWED_AT = '23 de octubre de 2026';

const profiles = [
  {
    matches: name => name.includes('disney') && name.includes('premium'),
    plan: 'Disney+ Premium',
    preview: ["Disney, Pixar, Marvel y Star Wars.", "ESPN con el plan Premium en Perú.", "Hasta 4K HDR en títulos y equipos compatibles."],
    benefits: [
      'Películas y series de Disney, Pixar, Marvel, Star Wars y National Geographic.',
      'Deportes y canales de ESPN incluidos en Premium, según disponibilidad en Perú.',
      'Hasta 4K UHD y HDR en los títulos y dispositivos compatibles.',
      'Sonido Dolby Atmos en contenido y equipos compatibles.',
      'Contenido original y estrenos incluidos en el catálogo del plan.',
    ],
    notes: ['Se entrega un perfil individual. Los límites de pantallas y descargas del plan completo no son cupos exclusivos de este perfil.', 'El catálogo y los eventos pueden variar por región. La calidad depende del título, dispositivo y conexión.'],
    sources: [{ label: 'Disney+ Perú', url: 'https://www.disneyplus.com/en-pe' }],
  },
  {
    matches: name => (name.includes('hbo') || name.startsWith('max ')) && (name.includes('estandar') || name.includes('standard')),
    plan: 'HBO Max Estándar',
    preview: ["Series y películas del catálogo de HBO Max.", "Hasta Full HD 1080p.", "Descargas dentro del límite compartido del plan."],
    benefits: [
      'Series, películas y producciones del catálogo de HBO Max.',
      'Calidad de hasta Full HD 1080p, según el contenido y el dispositivo.',
      'Descargas para ver sin conexión en dispositivos compatibles, dentro del límite compartido del plan.',
      'Acceso desde los dispositivos compatibles con HBO Max.',
    ],
    notes: ['El plan Estándar contempla hasta 30 descargas por cuenta; no son 30 descargas exclusivas para cada perfil.', 'La oferta es un perfil individual. No incluye la calidad 4K del plan Platino. El contenido en vivo puede tener anuncios.'],
    sources: [{ label: 'Planes de HBO Max en Perú', url: 'https://help.hbomax.com/pe/Answer/Detail/000002547' }],
  },
  {
    matches: name => name.includes('vix') && name.includes('premium'),
    plan: 'ViX Premium',
    preview: ["Originales y exclusivos de ViX.", "Películas, series y novelas en español.", "Deportes según el catálogo de tu país."],
    benefits: [
      'Series y producciones originales y exclusivas de ViX.',
      'Películas premium y programas del catálogo disponible en tu región.',
      'Novelas y entretenimiento en español.',
      'Contenido deportivo incluido en el catálogo local de ViX Premium.',
    ],
    notes: ['El contenido y los derechos deportivos varían por país.', 'No se promete ausencia total de publicidad: los deportes, canales y determinados títulos pueden incluir anuncios.'],
    sources: [{ label: 'Planes y contenido de ViX', url: 'https://ayuda.vix.com/hc/es/articles/26021719037069' }],
  },
  {
    matches: name => name.includes('prime video'),
    plan: 'Prime Video',
    preview: ["Películas y series incluidas con Prime.", "Sin pago extra por cada título incluido.", "Catálogo de entretenimiento que se actualiza."],
    benefits: [
      'Películas y series identificadas como «Incluido con Prime».',
      'Reproducción del catálogo incluido sin pagar cada título por separado.',
      'Catálogo de entretenimiento que se actualiza con nuevas incorporaciones.',
    ],
    notes: ['Los alquileres, compras, eventos de pago y suscripciones adicionales a canales se cobran aparte.', 'Se entrega un perfil para video. No incluye beneficios de compras, envíos o membresías adicionales de Amazon.'],
    sources: [{ label: 'Qué incluye Prime Video', url: 'https://www.primevideo.com/help?nodeId=TLKV1OADtdHSPuczvv' }],
  },
  {
    matches: name => name.includes('canva pro'),
    plan: 'Canva Pro',
    preview: ["Plantillas y recursos premium.", "Quitafondos y exportación transparente.", "Kit de Marca y redimensionamiento."],
    benefits: [
      'Plantillas, imágenes y otros recursos premium para tus diseños.',
      'Quitafondos para imágenes de productos, retratos y otros diseños.',
      'Descarga de diseños con fondo transparente.',
      'Kit de Marca para organizar logotipos, colores y tipografías.',
      'Redimensionamiento de diseños para distintos formatos y redes sociales.',
      'Programación de publicaciones en las redes compatibles.',
    ],
    notes: ['Las herramientas de IA y determinadas funciones están sujetas a los límites y permisos del plan.'],
    sources: [{ label: 'Funciones de Canva Pro', url: 'https://www.canva.com/es_es/pro/quitafondos/' }, { label: 'Kit de Marca', url: 'https://www.canva.com/pro/brand-kit/' }, { label: 'Redimensionamiento y límites', url: 'https://www.canva.com/es_us/help/resize/' }],
  },
  {
    matches: name => /^(office 365|microsoft 365 personal|office 365 personal)$/.test(name),
    plan: 'Microsoft 365 Personal',
    preview: ["Word, Excel, PowerPoint y Outlook.", "1 TB de almacenamiento en OneDrive.", "Una persona, hasta cinco dispositivos a la vez."],
    benefits: [
      'Word, Excel, PowerPoint y Outlook para documentos, hojas de cálculo, presentaciones y correo.',
      '1 TB de almacenamiento en OneDrive para tus archivos.',
      'Inicio de sesión hasta en cinco dispositivos a la vez para una persona.',
      'Uso en PC, Mac, teléfonos y tabletas compatibles.',
      'Funciones de Copilot en aplicaciones compatibles, con límites de uso del plan.',
      'Protección de datos y dispositivos incluida con Microsoft 365 Personal.',
    ],
    notes: ['Licencia Personal para una persona; cinco dispositivos no equivalen a cinco usuarios.', 'Las funciones de IA, aplicaciones y compatibilidad pueden variar por idioma, dispositivo y región.'],
    sources: [{ label: 'Microsoft 365 Personal en Perú', url: 'https://www.microsoft.com/es-pe/microsoft-365/p/microsoft-365-personal/cfq7ttc0k5bf' }],
  },
  {
    matches: name => /^(gemini|gemini pro|google ai pro|gemini ia pro)( familiar)?$/.test(name),
    plan: 'Google AI Pro · miembro familiar',
    preview: ["NotebookLM / Gemini Notebook con acceso ampliado.", "Más acceso a Gemini y Deep Research.", "Funciones de Gemini en Gmail y Documentos."],
    benefits: [
      'NotebookLM, ahora Gemini Notebook, con acceso ampliado para trabajar con tus fuentes y materiales.',
      'Mayor acceso a los modelos y funciones de Gemini incluidos en Google AI Pro.',
      'Deep Research para investigar temas y preparar informes, sujeto a los límites de Google.',
      'Gemini en Gmail, Documentos y otras aplicaciones compatibles.',
      'Herramientas de generación de imágenes y video en Gemini y Google Flow, según disponibilidad.',
      'Almacenamiento compartido del grupo para Google Drive, Gmail y Google Fotos.',
      'Uso desde tu propia cuenta personal de Google al incorporarte al grupo familiar.',
    ],
    notes: ['La activación es como miembro familiar de Google AI Pro, no como administrador de una suscripción individual.', 'El almacenamiento se comparte con el grupo; no es una cuota exclusiva por persona. Algunos límites y créditos de herramientas como Flow también son compartidos.', 'Se aplican los requisitos de Google para unirse a un grupo familiar, además de límites de edad, región y uso. YouTube Premium Lite no se incluye para el miembro familiar.'],
    sources: [{ label: 'Beneficios compartidos de Google AI Pro', url: 'https://support.google.com/googleone/answer/9004015?hl=es-419' }, { label: 'Google AI Pro y requisitos', url: 'https://support.google.com/googleone/answer/16476811?hl=es-419' }, { label: 'NotebookLM / Gemini Notebook', url: 'https://support.google.com/gemininotebook/answer/16213268?hl=es-MX' }],
  },
  {
    matches: name => name.includes('chatgpt plus'),
    plan: 'ChatGPT Plus',
    preview: ["Modelos avanzados para tareas y redacción.", "Análisis de archivos e imágenes con IA.", "Búsqueda web y conversaciones por voz."],
    benefits: [
      'Acceso a modelos avanzados para redactar, razonar y resolver tareas.',
      'Trabajo con archivos para analizar documentos y otros materiales.',
      'Generación y edición de imágenes con las herramientas disponibles del plan.',
      'Búsqueda web para consultar información y fuentes.',
      'Conversaciones por voz en las aplicaciones compatibles.',
      'Acceso a Codex para tareas de programación, dentro de los límites de Plus.',
    ],
    notes: ['El plan tiene límites de uso; no se ofrece acceso ilimitado ni una cantidad fija de mensajes.', 'La suscripción no incluye saldo para consumir la API de OpenAI. Las funciones dependen de disponibilidad y configuración de la cuenta.'],
    sources: [{ label: 'Funciones y planes de ChatGPT — OpenAI Docs', url: 'https://learn.chatgpt.com/docs/pricing' }, { label: 'Funciones de ChatGPT', url: 'https://learn.chatgpt.com/docs/features' }, { label: 'ChatGPT Voice', url: 'https://learn.chatgpt.com/docs/features/voice' }],
  },
];

export function getProductBenefitInfo(product) {
  const name = String(product?.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return profiles.find(profile => profile.matches(name)) || null;
}

export function getBenefitPreview(product) {
  const profile = getProductBenefitInfo(product);
  const configured = Array.isArray(product?.includes) ? product.includes.filter(item => typeof item === 'string' && item.trim()) : [];
  return (profile?.preview || profile?.benefits || configured).slice(0, 3);
}
