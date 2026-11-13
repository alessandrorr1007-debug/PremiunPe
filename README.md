# PremiumPe

[PremiumPe](https://premiunpee.netlify.app/) es una tienda peruana de suscripciones digitales con catálogo público y panel administrativo.

## Tienda

- Portada clara con una ilustración de Machu Picchu y un catálogo adaptable con dos columnas en celular y cuatro en pantallas grandes.
- Búsqueda de servicios y filtros de Streaming, Herramientas e IA.
- Portadas para Disney+, HBO Max, ViX, Prime Video, Canva Pro, Office 365, Gemini y ChatGPT Plus.
- Precios en soles, pedidos individuales o por combo mediante WhatsApp y pagos por Yape y Plin.
- Íconos de Facebook, Instagram y TikTok visibles en el pie de página, sin enlaces activos.

## Panel administrativo

Abre `/login` o selecciona **Iniciar sesión** desde la tienda. Usa las credenciales que te entregue el responsable del acceso por un canal privado.

En el panel puedes editar los productos, precios, disponibilidad y visibilidad, así como configurar el número de WhatsApp y los textos de la portada. Usa **Ver Tienda** para regresar al catálogo.

## Desarrollo local

```bash
npm ci
npm run dev
npm run build
npm run preview
```

`npm run dev` inicia Vite. `npm run build` genera la versión de producción en `dist` y `npm run preview` permite revisarla localmente.

## Despliegue en Netlify

Conecta la rama `main`. Netlify lee `netlify.toml`, ejecuta `npm run build` y publica `dist`. La regla de redirección permite abrir rutas directas como `/login` y `/admin`.

Si usas Supabase, configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Netlify. También puedes definir `VITE_DEFAULT_WHATSAPP` para establecer el número de contacto por defecto. Consulta `.env.example` para ver el formato. Las variables `VITE_` llegan al navegador, así que solo deben contener valores públicos.
