# Auditoría de PremiumPe

Auditoría del 15 de noviembre de 2026 en Lima.

## A. Resumen ejecutivo

Se reprodujo la selección automática de Disney+ Premium y Canva Pro en un navegador nuevo, tanto en el código local de partida como en la tienda publicada. Los 15 escenarios CART solicitados pasaron en local. La corrección comienza con el combo vacío, conserva selecciones por ID y verifica el pedido con el catálogo vigente antes de abrir WhatsApp. El panel requiere una sesión verificada de Supabase Auth. El alcance incluyó revisión de código, pruebas en navegador, consultas sobre PostgreSQL aislado y un recorrido público de solo lectura en Netlify.

## B. Arquitectura encontrada

- React 18, Vite, Tailwind CSS, Framer Motion y React Router. La raíz sirve la tienda y las rutas administrativas. Hay entradas independientes en `client/` y `admin/`, con sus propios manifiestos y bloqueos.
- La tienda consulta productos visibles y la fila de configuración de Supabase. Administración usa Auth, la API de datos, Realtime y el bucket `product-images`. Sin variables válidas, la tienda muestra su catálogo de demostración y el panel rechaza el inicio de sesión.
- Netlify construye la SPA con `npm run build`, publica `dist` y reescribe las rutas hacia `index.html`. La interfaz observada en producción es de una versión anterior a la compilación auditada.
- Los pedidos se preparan para WhatsApp. Los destacados y la disponibilidad se gestionan en Administración. No se encontró un flujo de cupones, precios promocionales separados, cobro integrado ni reserva de existencias.

## C. Hallazgos

- **CAR-01 · Alta.** Ambos `StoreContext.jsx` usaban el par Disney+/Canva como valor inicial y lo persistían en `localStorage`. La versión 2 guarda IDs únicos y descarta el par legado indistinguible del precargado. Evidencia en CART-01/02/07/15 y las pruebas unitarias.
- **CAR-02 · Alta.** Los objetos persistidos incluían nombre y precio, y el diálogo podía recuperar una tarjeta obsoleta por nombre o por copia. `StoreContext.jsx` y `StoreDialogs.jsx` resuelven por ID y verifican nombre, precio y disponibilidad al continuar. Si algo cambia, se muestra el pedido actualizado para revisarlo. Evidencia en CART-08/09/14/15.
- **CAR-03 · Media.** La coincidencia por nombre identificaba como duplicados dos productos distintos. La selección, eliminación, tarjetas y notificaciones ahora usan ID. El control de vaciado es visible cuando hay productos y el panel del combo está expandido. Evidencia en CART-03 a CART-07 y CART-11.
- **DAT-01 · Alta.** Durante la carga, tras un error o un resultado vacío, podía quedar visible el catálogo estático. Además, una edición local podía sobrescribir el catálogo activo de la entrada combinada. El catálogo configurado consume Supabase, acepta una respuesta vacía y permite reintentar. Realtime y el regreso a la ventana disparan recargas. Evidencia en CART-08/09/14 y el caso de catálogo remoto vacío.
- **SEG-01 · Crítica.** Ambos `AuthContext.jsx` incluían contraseñas y confiaban en un usuario de demostración guardado por el navegador. Se retiraron las credenciales y la autorización basada en alias o metadatos editables. Auth verifica la sesión rehidratada y la cuenta debe coincidir con la identidad prevista por el esquema. El panel carga datos solo tras pasar la protección de ruta. Se comprobó el rechazo del usuario de demostración falsificado.
- **DAT-02 · Alta.** `supabase/schema.sql` eliminaba todos los productos al volver a ejecutarse y sobreescribía campos de configuración existentes. Se quitó la eliminación y se conservaron las filas existentes. Se comprobó la reaplicación con datos aislados. Los datos iniciales se mantienen en el archivo opcional `supabase/seed.sql`.
- **ADM-01 · Alta.** La API podía responder sin error y con cero filas afectadas por RLS o por un ID obsoleto. Los cambios unitarios y las actualizaciones de configuración exigen respuesta de una fila, y las operaciones masivas verifican el número de filas. Los fallos de lectura de Supabase informan el error y evitan sustituir productos con datos de demostración. Se añadió validación de precios finitos y dentro del rango del esquema.
- **ADM-02 · Media.** El reordenamiento ignoraba errores devueltos por Supabase y podía escribir un catálogo local paralelo. Ahora guarda las posiciones que cambiaron y recarga la lista tras la escritura. Los cambios de posición siguen siendo solicitudes independientes. Un fallo parcial puede requerir repetir la operación.
- **REN-01 · Media.** La tienda combinada descargaba el panel y consultaba sus datos en la entrada pública. Las rutas administrativas se cargan bajo demanda y la entrada combinada reutiliza un cliente Supabase en el navegador. El JS inicial bajó de 848,27 kB a 662,77 kB minificados y de 240,15 kB a 196,56 kB gzip, una reducción de 22 % y 18 %, respectivamente.
- **PUB-01 · Alta.** En el iPhone emulado, el iframe de la insignia insertada por Netlify interceptó el clic de «Revisar pedido». Se distinguió este fallo de la selección inicial y de los casos locales. Se añadió una separación móvil al detectar ese iframe. Los perfiles locales de Android e iPhone pasaron con una insignia simulada de las dimensiones observadas. La web pública todavía ejecuta el código anterior.

- **SEG-02 · Media.** La auditoría inicial de npm identificó avisos en React Router 6, Vite y el analizador de selectores de PostCSS. Se actualizó React Router en las dos entradas que lo usan y se actualizaron las dependencias afectadas en los tres árboles. React Router 7 requiere Node.js 20 o posterior. [Aviso de redirección](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) · [Aviso de hidratación SSR](https://github.com/advisories/GHSA-337j-9hxr-rhxg) · [Aviso de Vite](https://github.com/advisories/GHSA-8g5g-mxqh-grgj) · [Aviso de PostCSS](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)

## D. Diagnóstico del carrito

En un perfil limpio, el código anterior inicializaba un arreglo con dos productos de demostración y lo escribía automáticamente en `premiumpe_user_combo_v1`. Se observó el mismo par persistido en la línea base local y en Netlify. La invitación a pedir por WhatsApp podía entonces usar precios viejos guardados en ese arreglo.

La selección nueva se escribe en `premiumpe_user_combo_v2` solo como IDs. Al recibir el catálogo, el proveedor descarta IDs ausentes y productos ocultos, agotados o con precio inválido. Una caída temporal conserva los IDs hasta que pueda volver a verificarlos. La versión antigua carecía de información sobre el origen de cada selección. Un carrito legado que contenga exactamente los mismos dos IDs de demostración y en el mismo orden se descartará incluso si alguien los eligió manualmente. El resto de los IDs válidos migra al nuevo formato.

El botón final verifica el pedido y navega a WhatsApp desde la misma pestaña cuando los datos coinciden. Las pruebas interceptan esa navegación. El total sigue siendo mensual y se compra como máximo una selección por ID.

## E. Supabase y permisos

- Las consultas con el SDK de Supabase se ejercitaron con respuestas de prueba mediante Playwright. Las políticas SQL se ejecutaron con PGlite, PostgreSQL embebido, y roles y funciones de Auth/Storage simulados. Se comprobó lectura anónima de productos visibles y configuración, aislamiento de ocultos, denegación de escrituras a usuarios ordinarios, CRUD administrativo, visibilidad de nombre/precio editados y límites de subida al bucket. [Políticas RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Los nombres y precios remotos son la fuente para los productos activos. Quedan recursos descriptivos estáticos para beneficios y el catálogo de demostración sin configuración. Las notificaciones Realtime se complementan con recarga al recuperar el foco y validación del pedido. La publicación y entrega de eventos del proyecto alojado no se comprobaron.
- El esquema autoriza escrituras mediante una reclamación de correo emitida por Auth. El panel exige además correo confirmado. Revisar en el proyecto alojado la titularidad de esa cuenta, confirmación de correo, roles, grants y políticas efectivamente desplegadas.
- Las variables `VITE_` forman parte del bundle. Se revisaron los archivos de entorno presentes y las referencias de código sin emitir sus valores. No se identificó una clave privilegiada por los indicadores comprobados. El historial de Git contiene las contraseñas retiradas. En los dos scripts públicos inspeccionados no aparecieron coincidencias con esas contraseñas concretas. Si alguna se reutilizó, hay que rotarla y revocar las sesiones correspondientes.
- No se aplicó el esquema ni se ejecutaron escrituras de prueba sobre el proyecto alojado.

## F. Archivos y validación funcional

- La tienda combinada y autónoma incluye cambios en `**/context/StoreContext.jsx`, `**/lib/cart.js`, `ComboBar.jsx`, `ProductCard.jsx`, `StoreDialogs.jsx`, `StoreFeedback.jsx` y los estilos de tienda. Se retiraron la inicialización demo del carrito, la persistencia de objetos y las comparaciones por nombre.
- La administración combinada y autónoma incluye cambios en `App.jsx`, `DashboardPage.jsx`, `AuthContext.jsx` y `AdminStoreContext.jsx`. También se cambiaron los formularios de acceso de la entrada combinada, el cliente Supabase compartido y las instrucciones de acceso del README.
- La infraestructura de pruebas se agregó en `Dockerfile`, `compose.yaml`, `.dockerignore`, `.gitignore`, `playwright.config.js`, `tests/` y manifiestos npm. Los pies de página tenían cambios previos del usuario y quedan fuera de los commits de auditoría.
- El recorrido público cubrió inicio, catálogo, ocho servicios con nombres y precios, agregar/quitar, revisión y enlace de WhatsApp en escritorio. En móvil se reprodujo el bloqueo por la insignia de Netlify. Los enlaces externos se inspeccionaron sin abrir WhatsApp ni coordinar pagos. No se auditó la disponibilidad de cada red social.
- Las pruebas administrativas separan acceso al panel y alta mediante respuestas simuladas de Auth/API de las comprobaciones de CRUD y permisos en PostgreSQL. El recorrido automatizado incluye crear, editar nombre y precio, leer el cambio desde la tienda, eliminar con confirmación y cerrar sesión. Medios, configuración y ordenamientos siguen pendientes de comprobar en un entorno Supabase completo.
- Se usó Chromium con tamaños de escritorio, Android, iPhone y tablet. La emulación de iPhone mide el diseño y la interacción en Chromium. La verificación en Safari móvil queda pendiente.

## G. Docker y reproducción

```sh
docker compose config --quiet
docker compose run --build --rm qa
```

El servicio `qa` usa la imagen de Playwright de la misma versión que el paquete npm. Instala los tres árboles con `npm ci` y ejecuta las pruebas unitarias, SQL, Playwright y las tres compilaciones. La compilación de QA fuerza endpoints ficticios para el navegador. Docker excluye los archivos de entorno, los resultados y las dependencias locales. Los archivos de entorno quedan fuera de la imagen y las pruebas usan la red interna del contenedor.

Docker Compose validó la configuración y Docker Desktop llegó a descargar capas de la imagen. La unidad C: agotó el espacio durante la descarga y el almacenamiento de Docker devolvió `read-only file system`, seguido por un error RPC. El contenedor de QA no llegó a iniciarse.

Alternativa local con Node y Chromium.

```sh
npm ci
npm --prefix client ci
npm --prefix admin ci
npx playwright install chromium
npm run test:unit
npm run test:db
npm run test:e2e
npm run build
npm run build:client
npm run build:admin
```

Para usar Chrome instalado en Windows, configura `$env:PREMIUMPE_BROWSER_CHANNEL = 'chrome'`. La comprobación pública es independiente y se ejecuta con `node tests/netlify-smoke.js`. Devuelve un estado fallido si detecta la intercepción del botón en móvil.

## H. Matriz de resultados

| Categoría | Aprobadas | Fallidas | Omitidas |
|---|---:|---:|---:|
| Unitarias | 6 | 0 | 0 |
| Integración SQL aislada | 5 | 0 | 0 |
| Carrito, escenarios CART | 15 | 0 | 0 |
| End-to-end local | 16 | 0 | 0 |
| Seguridad, auditorías npm | 3 | 0 | 0 |
| Responsive local | 4 | 0 | 0 |
| Compilación | 3 | 0 | 0 |
| Netlify público | 1 | 1 | 0 |
| Docker, validación y ejecución | 1 | 1 | 0 |

Carrito y responsive desglosan parte de la suite de 16 pruebas. Las primeras iteraciones de QA tuvieron fallos de selectores y esperas al iniciar en Vite dev. Se corrigieron los selectores y la suite final ejecutó la compilación de QA. La comprobación pública de escritorio fue exitosa y la de iPhone falló al llegar a «Revisar pedido». No se observó desbordamiento horizontal ni se recibieron excepciones de JS o respuestas HTTP de error entre las solicitudes permitidas durante el recorrido público.

La sonda pública observó LCP de 2,19 s y 13,52 s en dos ejecuciones de escritorio, y de 4,82 s en una de iPhone emulado. La suma de desplazamientos observados al inicio fue de 0,029 y 0,018 en escritorio y 0,003 en iPhone. Las cifras corresponden a muestras pequeñas con automatización y tráfico externo restringido, sin condiciones de red estandarizadas. No se obtuvo una medición válida de INP.

## I. Riesgos pendientes

- Confirmar cuenta administrativa, conexión, políticas y Realtime en un proyecto Supabase de pruebas completo. Las pruebas de PostgreSQL validan el esquema del repositorio, y Playwright valida el comportamiento del frontend frente al contrato HTTP simulado.
- Validar Netlify tras un despliegue autorizado y resolver la interferencia móvil de la insignia. La prueba pública actual se realiza contra la versión que reproduce el carrito precargado.
- No había scripts de lint ni de comprobación de tipos. El proyecto usa JavaScript.
- La advertencia de Vite por paquetes mayores a 500 kB sigue vigente. Recuperar espacio en el volumen de Docker y volver a ejecutar la suite en contenedor.

## J. Estado final

**APTO CON OBSERVACIONES.** Los flujos locales del carrito y del panel pasaron con datos aislados y las tres entradas compilaron. Antes de autorizar la publicación, queda pendiente ejecutar la suite en Docker con almacenamiento suficiente, verificar una cuenta y políticas en Supabase de pruebas, y comprobar la corrección móvil en la versión publicada.
