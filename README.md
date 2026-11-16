# PremiumPe

**Sitio oficial:** [https://premiunpee.netlify.app/](https://premiunpee.netlify.app/)

PremiumPe es una tienda peruana de suscripciones digitales con catálogo público y panel administrativo.

## Tienda

- Portada clara con una ilustración de Machu Picchu y un catálogo adaptable con dos columnas en celular y cuatro en pantallas grandes.
- Búsqueda de servicios y filtros de Streaming, Herramientas e IA.
- Portadas para Disney+, HBO Max, ViX, Prime Video, Canva Pro, Office 365, Gemini y ChatGPT Plus.
- Precios en soles, pedidos individuales o por combo mediante WhatsApp y pagos por Yape y Plin.
- El pie de página muestra las redes sociales que tienen un enlace HTTPS en Configuración y las abre en una pestaña nueva.

## Panel administrativo

Abre `/login` o selecciona **Iniciar sesión** desde la tienda.

- **Usuario:** `cheridecheros` (alias de `admin@premiumpe.com`)
- **Contraseña:** la contraseña privada configurada en Supabase Auth. No se almacena en el repositorio.

En el panel puedes editar los productos, precios, disponibilidad y visibilidad, así como configurar el número de WhatsApp y los textos de la portada. En **Configuración → Promociones**, selecciona al menos dos productos, fija un precio en soles y revisa la vista previa. Guarda el combo con **Activar promoción** marcado para publicarlo durante las fechas que indiques (hora de Perú). Usa **Ver Tienda** para regresar al catálogo.

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

1. En un proyecto nuevo, ejecuta `supabase/schema.sql` antes de aplicar las migraciones de `supabase/migrations`. Si el catálogo ya está configurado, aplica solo las migraciones pendientes antes de desplegar la aplicación. Usa `supabase/seed.sql` si quieres cargar productos de ejemplo en un catálogo nuevo.
2. Crea el usuario `admin@premiumpe.com` en Supabase Auth con una contraseña privada. El panel acepta también el nombre de usuario local como alias en modo conectado.
3. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para producción en Netlify y vuelve a desplegar `main`.
4. Inicia sesión, modifica un producto y comprueba el resultado en una ventana privada. La tienda actualiza el catálogo con Realtime y lo vuelve a consultar cada 30 segundos mientras está visible.

El acceso administrativo requiere Supabase Auth; no existe un modo local con contraseñas integradas. La base compartida aplica permisos de lectura pública para productos visibles y escritura para la cuenta administradora autenticada.

## Cloudflare Workers (sitio estático)

Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en **Builds → Variables and secrets**, para Production. Ejecuta una compilación nueva (`npm run build`) después de cambiar variables; no son variables de runtime. La clave debe ser publicable, nunca `sb_secret_` ni `service_role`. El despliegue de archivos estáticos requiere que Wrangler publique `dist` como directorio de assets.

## Pruebas de auditoría

Usa Node.js 20 o posterior, o ejecuta `docker compose run --build --rm qa`. Consulta el [informe y los pasos de reproducción](docs/AUDITORIA_PREMIUMPE.md).
