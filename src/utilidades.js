/**
 * Funciones puras de apoyo: leer una línea del catálogo, construir el enlace de búsqueda y
 * redondear importes. Ninguna modifica lo que recibe ni muestra nada.
 * @module utilidades
 */

/**
 * Año más antiguo que se admite en el catálogo (la imprenta de Gutenberg).
 * @type {number}
 */
export const ANIO_MINIMO = 1450;

/**
 * Datos de un libro leídos de una línea del catálogo.
 *
 * @typedef {object} DatosLibro
 * @property {string} isbn Código ISBN, no vacío.
 * @property {string} titulo Título, no vacío.
 * @property {string} autor Autor.
 * @property {number} anio Año de publicación, entero entre `ANIO_MINIMO` y el máximo admitido.
 * @property {string[]} etiquetas Etiquetas en minúsculas, sin vacías.
 */

/**
 * Lee una línea del catálogo con el formato `isbn;título;autor;año;etiqueta1,etiqueta2`.
 *
 * Quita los espacios de cada campo. Las etiquetas se pasan a minúsculas y se descartan las vacías.
 * El año se convierte con `Number`, que convierte el texto **entero**: `'1967b'` da `NaN` y es
 * inválido (con `parseInt` sería 1967 y pasaría por bueno), y `''` da 0, que queda fuera de rango.
 *
 * @param {string} linea Línea del catálogo.
 * @param {number} [anioMaximo=2100] Último año admitido (incluido).
 * @returns {DatosLibro|null} Los datos del libro, o `null` si la línea no tiene exactamente cinco
 *   campos, el ISBN o el título están vacíos, o el año no es un entero entre `ANIO_MINIMO` y
 *   `anioMaximo`.
 * @example
 * parsearLibro('1;Rayuela;Julio Cortázar;1963;novela, Clásico ,');
 * // { isbn: '1', titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 1963, etiquetas: ['novela', 'clásico'] }
 * parsearLibro('línea mal formada'); // null
 */
export function parsearLibro(linea, anioMaximo = 2100) {
  const campos = linea.split(';').map((campo) => campo.trim());
  if (campos.length !== 5) {
    return null;
  }
  const [isbn, titulo, autor, textoAnio, textoEtiquetas] = campos;
  const anio = Number(textoAnio);
  if (isbn == '' || titulo === '') {
    return null;
  }
  if (!Number.isInteger(anio) || anio < ANIO_MINIMO || anio > anioMaximo) {
    return null;
  }
  const etiquetas = textoEtiquetas
    .split(',')
    .map((etiqueta) => etiqueta.trim().toLowerCase())
    .filter((etiqueta) => etiqueta !== '');
  return { isbn, titulo, autor, anio, etiquetas };
}

/**
 * Enlace de búsqueda de un título en el catálogo en línea.
 *
 * El título se codifica con `encodeURIComponent`, que escapa también `&`, `=`, `?` y los espacios
 * (con `encodeURI` un título con `&` rompería el parámetro).
 *
 * @param {string} titulo Título a buscar.
 * @returns {string} La URL con el título codificado.
 * @example
 * enlaceCatalogo('La sombra del viento');
 * // 'https://catalogo.example/buscar?titulo=La%20sombra%20del%20viento'
 */
export function enlaceCatalogo(titulo) {
  return `https://catalogo.example/buscar?titulo=${encodeURIComponent(titulo)}`;
}

/**
 * Redondea un importe a céntimos.
 *
 * @param {number} importe Importe en euros.
 * @returns {number} El importe con dos decimales.
 * @example
 * redondear(3.5999999999999996); // 3.6
 */
export function redondear(importe) {
  return Math.round(importe * 100) / 100;
}
