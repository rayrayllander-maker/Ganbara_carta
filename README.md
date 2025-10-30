# Ganbara — Carta

Este proyecto es una página estática para mostrar la carta de Ganbara. Los platos se cargan dinámicamente desde un archivo JSON editable y hay un mini CMS para editarlos sin tocar el HTML.

## ¿Cómo edito los platos?

- Archivo fuente: `platos.json` en la raíz del proyecto (única fuente de verdad).
- Fallbacks soportados por el código: `data/platos.json` y `_data/platos.json` (por compatibilidad). No hace falta mantenerlos si ya usas `platos.json`.
- Estructura por secciones: `hamburguesas`, `chuletas`, `raciones`, `bocadillos`, `postres`.
- Cada elemento suele tener:
  - `title`: objeto con `es` y `eu`.
  - `desc`: objeto con `es` y `eu`.
  - `price`: texto (incluye símbolo € si quieres mostrarlo tal cual).
  - `image` (opcional): ruta a una imagen en el proyecto.
  - `spicy` (opcional): 1 = picante, 2 = muy picante.

> Consejo: si añades `image`, se mostrará un icono de cámara en la tarjeta y al tocar se abre un lightbox con la foto.

## i18n (idiomas)

- El cambio ESP/EUS re-renderiza las tarjetas leyendo `title[lang]` y `desc[lang]`.
- El idioma actual se guarda en `localStorage` (clave `ganbara_lang`).

## Preloader

- La pantalla de carga precarga imágenes referenciadas en los datos del menú (independientemente de si vienen de `platos.json`, `data/platos.json` o `_data/platos.json`).
- Se cierra automáticamente con timeout de seguridad.

## Edición de datos

Este proyecto no usa ya un CMS ni Firebase. Edita directamente `platos.json` (en la raíz) y sube los cambios.

## Desarrollo local

- Abre `index.html` en un servidor local (para que `fetch('platos.json')` funcione sin restricciones del navegador al leer ficheros locales).
- En VS Code puedes usar la extensión "Live Server" o cualquier servidor estático.

## Despliegue en GitHub Pages

GitHub Pages usa Jekyll por defecto y no publica carpetas que empiezan por `_`. Para evitar problemas:

- Este repo usa `platos.json` en la raíz y además incluye `.nojekyll` por seguridad.
- Si migras desde una versión antigua que usaba `_data/platos.json` o `data/platos.json`, el código intentará esas rutas como fallback.

Tras hacer push a la rama publicada por Pages, espera ~1–2 minutos y recarga con Ctrl+F5.

### Sugerencias de estructura de imágenes

- Coloca las imágenes de platos en la raíz o en una carpeta tipo `img/` y referencia la ruta en el campo `image`.
- Formatos recomendados: `.jpg` o `.webp` optimizados.

## Notas

- Archivos legados como scripts o CSV de inventario han sido retirados. Usa siempre `platos.json`.
- Si algo no carga, revisa la consola del navegador: pueden aparecer errores de ruta en imágenes.
