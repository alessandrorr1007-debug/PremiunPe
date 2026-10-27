# 🇵🇪 PremiumPe - Pases Digitales & Membresías en Perú

Sitio web y catálogo de suscripciones digitales en Perú (Disney+, Canva Pro, ChatGPT Plus, Prime Video, etc.) con panel de administración integrado y sincronización en tiempo real.

---

## 🔐 Acceso Administrativo

- **Ruta directa:** `/admin` o `/login`
- **Desde la tienda:** Haz clic en el botón de configuración ⚙️ ubicado en la barra de navegación (header) o en el pie de página.
- **Credenciales autorizadas:**
  - **Usuario:** `cheridecheros`
  - **Contraseña:** `cherigey`

Dentro del panel de administración podrás:
- Crear, editar y eliminar productos.
- Ajustar precios en Soles (S/) en tiempo real.
- Cambiar la disponibilidad (Disponible / Agotado) y visibilidad de los productos.
- Configurar el número de WhatsApp, textos del Hero y redes sociales.
- Hacer clic en **"Ver Tienda"** en la barra superior para volver a la tienda pública y verificar los cambios inmediatamente.

---

## 🌐 Despliegue en Netlify

El proyecto ya está configurado con `netlify.toml` en la raíz para desplegarse con un solo clic:

1. Conecta tu repositorio de GitHub en Netlify.
2. Netlify detectará automáticamente:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. En **Environment Variables** (opcional si usas Supabase):
   - `VITE_SUPABASE_URL` = Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = Tu Anon Key de Supabase
   - `VITE_DEFAULT_WHATSAPP` = `51942990279`
4. ¡Listo! El sitio cargará directamente la tienda de clientes (`/`), sin pantalla en blanco, y el botón ⚙️ permitirá entrar al panel administrativo.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Probar la compilación localmente
npm run preview
```
