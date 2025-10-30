# Ganbara — Carta

Este proyecto es una página estática para mostrar la carta de Ganbara. Los platos se cargan dinámicamente desde un archivo JSON editable y hay un mini CMS para editarlos sin tocar el HTML.

## ¿Cómo edito los platos?

- Archivo fuente: `data/platos.json` (única fuente de verdad). Antes estaba en `_data/`; se ha movido para compatibilidad con GitHub Pages.
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

- La pantalla de carga precarga imágenes usadas en tarjetas y las que declara el renderer a partir de `_data/platos.json`.
- Se cierra automáticamente con timeout de seguridad.

## Mini CMS (opcional con Netlify CMS)

- Carpeta `admin/` ya incluida.
- Para usarlo en producción con Netlify:
  1. Despliega este proyecto en Netlify.
  2. En Netlify, activa Identity y Git Gateway.
  3. En Identity → Settings → Services, habilita Git Gateway.
  4. Crea un usuario (Invite user) y haz login desde `/admin/` del sitio desplegado.
- El CMS editará el fichero `_data/platos.json` según `admin/config.yml`.

## Desarrollo local

- Abre `index.html` en un servidor local (para que `fetch('_data/platos.json')` funcione).
- En VS Code puedes usar la extensión "Live Server" o cualquier servidor estático.

## Despliegue en GitHub Pages

GitHub Pages usa Jekyll por defecto y no publica carpetas que empiezan por `_`. Para evitar problemas:

- Este repo ya usa `data/platos.json` (sin guion bajo) y además incluye `.nojekyll` por si publicas desde otra carpeta.
- Si migras desde una versión antigua que usaba `_data/platos.json`, el código intenta ambas rutas.

Tras hacer push a la rama publicada por Pages, espera ~1–2 minutos y recarga con Ctrl+F5.

### Sugerencias de estructura de imágenes

- Coloca las imágenes de platos en la raíz o en una carpeta tipo `img/` y referencia la ruta en el campo `image`.
- Formatos recomendados: `.jpg` o `.webp` optimizados.

## Notas

- Archivo legado `menu.json` ha sido eliminado. Usa siempre `_data/platos.json`.
- Si algo no carga, revisa la consola del navegador: pueden aparecer errores de ruta en imágenes.
