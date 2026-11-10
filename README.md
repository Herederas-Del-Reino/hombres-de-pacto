# Hombres de Pacto

**Hombres restaurados, comprometidos con Dios y sus familias.**
*No solamente lo declaramos. Lo vivimos.*

Plataforma web y aplicación instalable (PWA) del ministerio Hombres de Pacto.

🌐 **Sitio publicado:** https://herederas-del-reino.github.io/hombres-de-pacto/

## Secciones

| Ruta | Sección | Qué incluye |
|---|---|---|
| `#/inicio` | Inicio | Portada, bienvenida oficial, accesos, próximo encuentro dinámico |
| `#/altar` | Vuelve al Altar | 7 encuentros diarios (2 partes), diario personal, progreso, final |
| `#/desafios` | Desafíos de Pacto | 25 estaciones interactivas, estados, reflexión, progreso, reconocimiento PDF |
| `#/encuentros` | Nuestros Encuentros | Horarios en España, Colombia, Argentina (o zona local) con horario de verano automático y cuenta regresiva |
| `#/pastor` | Conoce al Pastor | Biografía oficial de Oscar Amarales, trayectoria, galerías, familia, redes |
| `#/comunidad` | Nuestra Comunidad | Cinco pilares y galería ministerial |
| `#/recursos` | Recursos y Enseñanzas | Biblioteca por categorías y tipos (estado «Próximamente») |
| `#/oracion` | Oración y Contacto | Formulario oficial de Google Forms (insertado + botón) |

Cada día se abre directamente: `#/altar/3`, `#/desafios/12`, `#/desafios/final`.

## Tecnología

- [Vite](https://vite.dev) + JavaScript moderno sin framework. Única dependencia de ejecución: [Lucide](https://lucide.dev) (iconos, ISC).
- Enrutado por hash: compatible con GitHub Pages sin errores 404.
- Fuentes Google Fonts: Cinzel (títulos), Montserrat (subtítulos y texto), Lato (lecturas).
- PWA: `public/manifest.webmanifest`, `public/sw.js` (versión única en cada compilación; HTML siempre desde la red, recursos con hash desde caché; aviso «Actualizar» cuando hay una nueva versión).
- Persistencia local (`localStorage`, clave `hombres-de-pacto:v1`). No hay cuentas ni servidores; las reflexiones nunca salen del dispositivo. Exportar/importar copia desde «Mis datos».

## Estructura

```text
src/
├── main.js               Enrutador, animaciones, «Mis datos»
├── components/           Navigation, Footer, Modal (+toast), ProgressBar, Visuals, Schedule, Lightbox, Pwa, Icons
├── sections/             Una vista por sección (Inicio, VuelveAlAltar, DesafiosDePacto, Encuentros, ConoceAlPastor, Comunidad, Recursos, Oracion)
├── data/                 Contenido editable: devocionales, desafios, encuentros, pastor, recursos, comunidad
├── styles/               variables, global, components, sections, responsive (mobile-first)
└── utils/                storage, timezones, pdf (reconocimiento), bible, dom
public/                   manifest, sw.js, 404.html, icons/, images/ (WebP optimizadas)
assets-originales/        Archivos originales sin modificar (logo/guía de marca y fotografías)
tests/                    Pruebas unitarias (node:test) y e2e (Playwright)
```

## Cómo actualizar el contenido

- **Horarios / enlaces de Zoom:** `src/data/encuentros.js` → cambia `enlace: null` por la URL oficial y aparecerá el botón «Unirme al encuentro».
- **Recursos:** añade objetos al array `recursos` de `src/data/recursos.js` (el formato está documentado en el archivo).
- **Devocionales y desafíos:** `src/data/devocionales.js` y `src/data/desafios.js`.
- **Fotografías:** coloca el original en `assets-originales/` y genera `nombre.webp` (1200 px) y `nombre-sm.webp` (640 px) en `public/images/`.

## Desarrollo

```bash
npm install
npm run dev          # servidor de desarrollo
npm test             # pruebas unitarias (horarios, horario de verano, datos)
npm run build        # compilación de producción en dist/
npm run preview      # sirve dist/ en http://localhost:4173/hombres-de-pacto/
npm run test:e2e     # con preview en marcha: pruebas de extremo a extremo (Playwright)
```

`BASE_URL=https://herederas-del-reino.github.io/hombres-de-pacto/ npm run test:e2e` ejecuta las mismas pruebas sobre el sitio publicado.

## Despliegue

Repositorio oficial: `Herederas-Del-Reino/hombres-de-pacto` → https://herederas-del-reino.github.io/hombres-de-pacto/

La ruta base se calcula sola en GitHub Actions a partir del nombre del repositorio (`BASE_PATH`): un repositorio `*.github.io` publica en la raíz `/`; cualquier otro, en `/<nombre-del-repositorio>/`. El manifest y el service worker usan rutas relativas, así que la PWA funciona en ambos casos.


Cada `push` a `main` ejecuta `.github/workflows/deploy.yml` (pruebas → compilación → GitHub Pages).
La base pública está fijada en `vite.config.js` (`/hombres-de-pacto/`).

## Notas editoriales

- Las preguntas, acciones y oraciones de «Vuelve al Altar» están marcadas como **apoyo editorial**: no son citas bíblicas ni declaraciones oficiales.
- Las lecturas bíblicas enlazan a Reina-Valera 1960 en BibleGateway.
- El reconocimiento PDF es personal y no constituye una certificación ministerial oficial.
- No se inventan enlaces de reuniones ni se indica «en vivo» sin señal real.
