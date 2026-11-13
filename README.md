# PremiumPe

**Sitio oficial:** [https://premiunpee.netlify.app/](https://premiunpee.netlify.app/)

PremiumPe es una tienda peruana de suscripciones digitales con catálogo público y panel administrativo.

## Tienda

- Portada clara con una ilustración de Machu Picchu y un catálogo adaptable con dos columnas en celular y cuatro en pantallas grandes.
- Búsqueda de servicios y filtros de Streaming, Herramientas e IA.
- Portadas para Disney+, HBO Max, ViX, Prime Video, Canva Pro, Office 365, Gemini y ChatGPT Plus.
- Precios en soles, pedidos individuales o por combo mediante WhatsApp y pagos por Yape y Plin.
- Íconos de Facebook, Instagram y TikTok visibles en el pie de página, sin enlaces activos.

## Panel administrativo

Abre `/login` o selecciona **Iniciar sesión** desde la tienda. 

- **Usuario:** `cheridecheros`
- **Contraseña:** `Pool`

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


## Catálogo compartido

1. Ejecuta `supabase/schema.sql` en el proyecto de Supabase. Para un catálogo nuevo, usa `supabase/seed.sql` si quieres cargar los productos de ejemplo. Las ediciones que existan en el navegador del administrador deben trasladarse al catálogo compartido antes de darlo por listo.
2. Crea el usuario `admin@premiumpe.com` en Supabase Auth con una contraseña privada. El panel acepta también el nombre de usuario local como alias en modo conectado.
3. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para producción en Netlify y vuelve a desplegar `main`.
4. Inicia sesión, modifica un producto y comprueba el resultado en una ventana privada. La tienda actualiza el catálogo con Realtime y lo vuelve a consultar cada 30 segundos mientras está visible.

Las credenciales del modo local solo sirven para el catálogo del navegador. La base compartida aplica permisos de lectura pública para productos visibles y escritura para la cuenta administradora autenticada.
