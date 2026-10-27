// Datos iniciales y fallback para la tienda pública de clientes

export const DEFAULT_SETTINGS = {
  id: 1,
  whatsapp_number: '51942990279',
  store_name: 'PremiumPe',
  hero_badge: 'Perú Express',
  hero_title: 'Tus plataformas favoritas, al precio justo',
  hero_subtitle: 'Elige, combina y pide por WhatsApp en minutos.',
  support_hours: 'Atención por WhatsApp',
  response_time: 'Respuesta por orden de llegada',
  payment_methods: 'Yape y Plin',
  warranty_text: 'Reposición y soporte activo durante todo el periodo contratado',
  currency: 'S/',
  faq: [
    {
      question: '¿Cómo me entregan la cuenta una vez que realizo el pago?',
      answer: 'Al enviar tu comprobante de pago por WhatsApp con tu pedido, se te envían los accesos correspondientes o se activa el servicio en tu cuenta según el tipo de entrega.'
    },
    {
      question: '¿Puedo renovar el mismo servicio para el siguiente periodo?',
      answer: 'Sí, coordinamos contigo antes del vencimiento para que puedas renovar y conservar tus configuraciones y listas sin inconvenientes.'
    },
    {
      question: '¿Cuáles son los métodos de pago aceptados?',
      answer: 'Aceptamos pagos a través de Yape y Plin de manera rápida y sin comisiones adicionales.'
    },
    {
      question: '¿Cómo funciona la reposición y garantía?',
      answer: 'Cada servicio cuenta con reposición prioritaria según los términos acordados si ocurre alguna eventualidad técnica durante tu periodo contratado.'
    }
  ],
  social_links: {
    instagram: 'https://instagram.com/premiumpe',
    tiktok: 'https://tiktok.com/@premiumpe',
    facebook: 'https://facebook.com/premiumpe'
  }
};

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-disney',
    name: 'Disney+ Premium',
    description: 'Películas, series y documentales para toda la familia en alta definición.',
    category: 'Streaming',
    price: 12,
    delivery_type: 'perfil',
    includes: [
      'Perfil individual con clave PIN',
      'Transmisión en alta definición',
      'Sin cortes en la reproducción'
    ],
    accent: 'rocoto',
    monogram: 'D+',
    available: true,
    visible: true,
    featured: true,
    sort_order: 1
  },
  {
    id: 'prod-hbo',
    name: 'HBO Max Estándar',
    description: 'Series aclamadas, películas de estreno y producciones exclusivas.',
    category: 'Streaming',
    price: 10,
    delivery_type: 'perfil',
    includes: [
      'Perfil individual con clave PIN',
      'Catálogo completo de estrenos',
      'Acceso en múltiples dispositivos'
    ],
    accent: 'rocoto',
    monogram: 'M',
    available: true,
    visible: true,
    featured: false,
    sort_order: 2
  },
  {
    id: 'prod-vix',
    name: 'Vix Premium',
    description: 'Series en español, novelas y contenido exclusivo sin interrupciones.',
    category: 'Streaming',
    price: 10,
    delivery_type: 'perfil',
    includes: [
      'Perfil individual con clave PIN',
      'Contenido en idioma español',
      'Acceso inmediato garantizado'
    ],
    accent: 'rocoto',
    monogram: 'V',
    available: true,
    visible: true,
    featured: false,
    sort_order: 3
  },
  {
    id: 'prod-prime',
    name: 'Prime Video',
    description: 'Películas y series exclusivas con opción de reproducción en cualquier momento.',
    category: 'Streaming',
    price: 12,
    delivery_type: 'perfil',
    includes: [
      'Perfil individual con clave PIN',
      'Catálogo amplio de producciones',
      'Compatible con Smart TV y celular'
    ],
    accent: 'rocoto',
    monogram: 'PV',
    available: true,
    visible: true,
    featured: false,
    sort_order: 4
  },
  {
    id: 'prod-canva',
    name: 'Canva Pro',
    description: 'Diseño profesional con kits de marca, plantillas y herramientas creativas.',
    category: 'Herramientas',
    price: 8,
    delivery_type: 'activacion_tu_cuenta',
    includes: [
      'Activación directa en tu correo',
      'Millones de plantillas premium',
      'Herramientas de edición avanzadas'
    ],
    accent: 'lime',
    monogram: 'CP',
    available: true,
    visible: true,
    featured: true,
    sort_order: 5
  },
  {
    id: 'prod-office',
    name: 'Office 365',
    description: 'Herramientas de productividad y almacenamiento para tus proyectos diarios.',
    category: 'Herramientas',
    price: 15,
    delivery_type: 'cuenta_entregada',
    includes: [
      'Word, Excel, PowerPoint y Outlook',
      'Almacenamiento en la nube',
      'Uso en varios dispositivos'
    ],
    accent: 'lime',
    monogram: 'O',
    available: true,
    visible: true,
    featured: false,
    sort_order: 6
  },
  {
    id: 'prod-gemini',
    name: 'Gemini',
    description: 'Asistente inteligente para redactar, analizar y resolver tareas complejas.',
    category: 'IA',
    price: 10,
    delivery_type: 'activacion_tu_cuenta',
    includes: [
      'Activación en tu cuenta personal',
      'Respuestas rápidas y análisis',
      'Asistencia para trabajo y estudio'
    ],
    accent: 'aji',
    monogram: 'G',
    available: true,
    visible: true,
    featured: true,
    sort_order: 7
  },
  {
    id: 'prod-chatgpt',
    name: 'ChatGPT Plus',
    description: 'Inteligencia artificial para generación de contenidos, textos y asistencia creativa.',
    category: 'IA',
    price: 40,
    delivery_type: 'cuenta_entregada',
    includes: [
      'Cuenta entregada lista para usar',
      'Acceso prioritario a herramientas de IA',
      'Generación de texto y asistencia'
    ],
    accent: 'aji',
    monogram: 'GPT',
    available: true,
    visible: true,
    featured: true,
    sort_order: 8
  }
];

export const CATEGORIES = ['Todos', 'Streaming', 'Herramientas', 'IA'];

export const DELIVERY_TYPE_LABELS = {
  perfil: 'Perfil individual',
  activacion_tu_cuenta: 'Se activa en tu cuenta',
  cuenta_entregada: 'Cuenta entregada'
};

export function getProductMonogram(name, existingMonogram) {
  if (existingMonogram) return existingMonogram;
  if (!name) return 'P';
  const clean = name.trim();
  if (clean.toLowerCase().includes('disney')) return 'D+';
  if (clean.toLowerCase().includes('hbo') || clean.toLowerCase().includes('max')) return 'M';
  if (clean.toLowerCase().includes('vix')) return 'V';
  if (clean.toLowerCase().includes('prime')) return 'PV';
  if (clean.toLowerCase().includes('canva')) return 'CP';
  if (clean.toLowerCase().includes('office')) return 'O';
  if (clean.toLowerCase().includes('chatgpt') || clean.toLowerCase().includes('gpt')) return 'GPT';
  if (clean.toLowerCase().includes('gemini')) return 'G';
  
  const words = clean.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function formatPrice(price) {
  const num = Number(price);
  if (isNaN(num)) return 'S/ 0 /mes';
  return `S/ ${Number.isInteger(num) ? num : num.toFixed(2)} /mes`;
}

export function formatPriceNumber(price) {
  const num = Number(price);
  if (isNaN(num)) return '0';
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}

export function formatWhatsAppNumber(phone) {
  if (!phone) return '51942990279';
  const digits = String(phone).replace(/[^\d]/g, '');
  if (!digits) return '51942990279';
  if (digits.startsWith('51') && digits.length === 11) return digits;
  if (digits.length === 9) return `51${digits}`;
  return digits;
}

export function createProductWhatsAppUrl(phone, product) {
  const cleanPhone = formatWhatsAppNumber(phone);
  const priceStr = formatPriceNumber(product?.price || 0);
  const name = product?.name || 'servicio';
  const message = `Hola, me interesa ${name} a S/ ${priceStr} al mes. ¿Está disponible?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function createComboWhatsAppUrl(phone, comboItems) {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!comboItems || comboItems.length === 0) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola, me interesa armar un combo.')}`;
  }
  const summary = comboItems
    .map(item => `${item.name} (S/ ${formatPriceNumber(item.price)})`)
    .join(' + ');
  const total = comboItems.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const totalStr = formatPriceNumber(total);
  const message = `Hola, quiero este combo: ${summary}. Total: S/ ${totalStr} al mes. ¿Está disponible?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function createGeneralWhatsAppUrl(phone) {
  const cleanPhone = formatWhatsAppNumber(phone);
  const message = 'Hola, deseo información sobre los servicios de PremiumPe.';
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
