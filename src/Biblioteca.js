/**
 * Biblioteca: catálogo, socios y préstamos.
 * @module Biblioteca
 */

import { EmisorEventos } from './EmisorEventos.js';
import { Libro } from './Libro.js';
import { parsearLibro, redondear } from './utilidades.js';

/** @import { Oyente } from './EmisorEventos.js' */
/** @import { Socio } from './Socio.js' */

/**
 * Un préstamo (en curso o ya devuelto).
 *
 * @typedef {object} Prestamo
 * @property {Libro} libro Libro prestado.
 * @property {Socio} socio Socio que lo tiene o lo tuvo.
 * @property {number} diaLimite Día en que vence el préstamo.
 */

/**
 * Datos del evento `prestamo`.
 *
 * @typedef {object} EventoPrestamo
 * @property {Libro} libro
 * @property {Socio} socio
 * @property {number} diaLimite
 */

/**
 * Datos del evento `devolucion`.
 *
 * @typedef {object} EventoDevolucion
 * @property {Libro} libro
 * @property {Socio} socio
 * @property {number} diasRetraso Días después del día límite (0 si se devolvió a tiempo).
 * @property {number} multa Multa en euros.
 */

/**
 * Préstamo vencido que aún no se ha devuelto.
 *
 * @typedef {object} PrestamoVencido
 * @property {Libro} libro
 * @property {Socio} socio
 * @property {number} diasRetraso Días de retraso hasta el día consultado.
 */

/**
 * Estadísticas de la biblioteca.
 *
 * @typedef {object} Estadisticas
 * @property {number} libros Libros en el catálogo.
 * @property {number} prestados Libros prestados ahora mismo.
 * @property {number} socios Socios registrados.
 * @property {Map<number, number>} librosPorDecada Década → número de libros, ordenado por década.
 * @property {string|null} socioMasLector Nombre del socio con más préstamos (en curso y devueltos), o `null`.
 * @property {number} multasTotales Suma de las multas, en euros.
 */

/**
 * Biblioteca. Guarda sus colecciones en campos privados y nunca las devuelve: las consultas
 * devuelven arrays nuevos. Avisa de los préstamos y las devoluciones con el patrón Observer
 * (`on`), y no muestra nada por consola.
 *
 * @example
 * const biblioteca = new Biblioteca();
 * biblioteca.anadirLibro(new Libro(parsearLibro('1;Rayuela;Julio Cortázar;1963;novela')));
 * biblioteca.registrarSocio(new Socio('S1', 'Ana'));
 * biblioteca.on('prestamo', ({ libro, socio }) => avisar(libro, socio));
 * biblioteca.prestar('1', 'S1', 1);
 */
export class Biblioteca {
  /**
   * Catálogo: ISBN → libro. Un `Map` busca por ISBN sin recorrer y conserva el orden de alta.
   * @type {Map<string, Libro>}
   */
  #libros = new Map();

  /**
   * Socios: id → socio.
   * @type {Map<string, Socio>}
   */
  #socios = new Map();

  /**
   * Préstamos en curso: ISBN → préstamo. Un libro solo puede estar prestado una vez.
   * @type {Map<string, Prestamo>}
   */
  #enCurso = new Map();

  /**
   * Historial de todos los préstamos, en el orden en que se hicieron, con su multa si se devolvieron.
   * @type {Array<Prestamo & { multa: number }>}
   */
  #historial = [];

  /**
   * Emisor de eventos (composición: la biblioteca tiene un emisor, no es un emisor).
   * @type {EmisorEventos}
   */
  #eventos = new EmisorEventos();

  /**
   * Suscribe una función a un evento de la biblioteca: `prestamo` (con
   * `{ libro, socio, diaLimite }`) o `devolucion` (con `{ libro, socio, diasRetraso, multa }`).
   *
   * @param {'prestamo'|'devolucion'} evento Nombre del evento.
   * @param {Oyente} oyente Función a la que se avisa.
   * @returns {() => void} Función que da de baja la suscripción.
   * @throws {TypeError} Si `oyente` no es una función.
   */
  on(evento, oyente) {
    return this.#eventos.on(evento, oyente);
  }

  /**
   * Añade un libro al catálogo.
   *
   * @param {Libro} libro Libro a añadir.
   * @returns {Biblioteca} La propia biblioteca, para encadenar.
   * @throws {Error} Si ya hay un libro con ese ISBN.
   */
  anadirLibro(libro) {
    if (this.#libros.has(libro.isbn)) {
      throw new Error(`ISBN repetido: ${libro.isbn}`);
    }
    this.#libros.set(libro.isbn, libro);
    return this;
  }

  /**
   * Registra un socio.
   *
   * @param {Socio} socio Socio a registrar.
   * @returns {Biblioteca} La propia biblioteca, para encadenar.
   * @throws {Error} Si ya hay un socio con ese id.
   */
  registrarSocio(socio) {
    if (this.#socios.has(socio.id)) {
      throw new Error(`Socio repetido: ${socio.id}`);
    }
    this.#socios.set(socio.id, socio);
    return this;
  }

  /**
   * Importa libros de un texto con una línea por libro (`isbn;título;autor;año;etiquetas`).
   * Ignora las líneas vacías y descarta las incorrectas y los ISBN repetidos (ya en el catálogo
   * o dentro del propio texto).
   *
   * @param {string} texto Texto del catálogo.
   * @returns {{ importados: number, descartados: number }} Cuántas líneas se importaron y cuántas se descartaron.
   */
  importarCatalogo(texto) {
    const lineas = texto
      .split('\n')
      .map((linea) => linea.trim())
      .filter((linea) => linea !== '');
    const validos = lineas
      .map((linea) => parsearLibro(linea))
      .filter((datos) => datos !== null && !this.#libros.has(datos.isbn));
    // Se queda con la primera aparición de cada ISBN
    const nuevos = validos.filter(
      (datos, i) => validos.findIndex((otro) => otro.isbn === datos.isbn) === i,
    );
    nuevos.forEach((datos) => this.#libros.set(datos.isbn, new Libro(datos)));
    return { importados: nuevos.length, descartados: lineas.length - nuevos.length };
  }

  /**
   * Presta un libro a un socio.
   *
   * @param {string} isbn ISBN del libro.
   * @param {string} idSocio Id del socio.
   * @param {number} dia Día en que se presta.
   * @returns {Prestamo} El préstamo (su día límite es `dia` más los días de la política del socio).
   * @throws {Error} Si no existe el libro, no existe el socio, el socio ha alcanzado su máximo de
   *   préstamos o el libro ya está prestado (en ese orden).
   * @fires EventoPrestamo Emite `prestamo` solo si el préstamo se ha hecho.
   */
  prestar(isbn, idSocio, dia) {
    const libro = this.#libros.get(isbn);
    if (libro === undefined) {
      throw new Error(`No existe el libro ${isbn}`);
    }
    const socio = this.#socios.get(idSocio);
    if (socio === undefined) {
      throw new Error(`No existe el socio ${idSocio}`);
    }
    const { maxPrestamos, diasPrestamo } = socio.politica;
    const prestamosDelSocio = [...this.#enCurso.values()].filter((p) => p.socio === socio).length;
    if (prestamosDelSocio >= maxPrestamos) {
      throw new Error(`${socio.nombre} ha alcanzado su máximo de ${maxPrestamos} préstamos`);
    }

    libro.marcarPrestado(); // lanza si ya está prestado, antes de cambiar nada más
    const prestamo = { libro, socio, diaLimite: dia + diasPrestamo };
    this.#enCurso.set(isbn, prestamo);
    this.#historial.push({ ...prestamo, multa: 0 });
    this.#eventos.emit('prestamo', { libro, socio, diaLimite: prestamo.diaLimite });
    return prestamo;
  }

  /**
   * Devuelve un libro prestado.
   *
   * @param {string} isbn ISBN del libro.
   * @param {number} dia Día en que se devuelve.
   * @returns {number} La multa en euros (0 si se devuelve a tiempo o el socio no tiene multa).
   * @throws {Error} Si no existe el libro o no está prestado.
   * @fires EventoDevolucion Emite `devolucion` solo si la devolución se ha hecho.
   */
  devolver(isbn, dia) {
    const libro = this.#libros.get(isbn);
    if (libro === undefined) {
      throw new Error(`No existe el libro ${isbn}`);
    }
    libro.marcarDevuelto(); // lanza si no está prestado
    const prestamo = this.#enCurso.get(isbn);
    const diasRetraso = Math.max(0, dia - prestamo.diaLimite);
    const multa = redondear(prestamo.socio.politica.multa(diasRetraso));

    this.#enCurso.delete(isbn);
    // Se anota la multa en el último préstamo de ese libro en el historial
    const registro = this.#historial.findLast((p) => p.libro === libro);
    registro.multa = multa;
    this.#eventos.emit('devolucion', { libro, socio: prestamo.socio, diasRetraso, multa });
    return multa;
  }

  /**
   * Libros que no están prestados, por orden alfabético de título.
   *
   * @returns {Libro[]} Array nuevo.
   */
  disponibles() {
    return [...this.#libros.values()]
      .filter((libro) => libro.disponible)
      .toSorted((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
  }

  /**
   * Libros cuyo título o autor contienen el texto, sin distinguir mayúsculas, en el orden del catálogo.
   *
   * @param {string} texto Texto a buscar.
   * @returns {Libro[]} Array nuevo.
   */
  buscar(texto) {
    const buscado = texto.toLowerCase();
    return [...this.#libros.values()].filter(
      (libro) =>
        libro.titulo.toLowerCase().includes(buscado) || libro.autor.toLowerCase().includes(buscado),
    );
  }

  /**
   * Libros con una etiqueta, en el orden del catálogo.
   *
   * @param {string} etiqueta Etiqueta (en minúsculas).
   * @returns {Libro[]} Array nuevo.
   */
  porEtiqueta(etiqueta) {
    return [...this.#libros.values()].filter((libro) => libro.etiquetas.has(etiqueta));
  }

  /**
   * Préstamos en curso cuyo día límite ya ha pasado, del más retrasado al menos.
   *
   * @param {number} dia Día de la consulta.
   * @returns {PrestamoVencido[]} Array nuevo.
   */
  prestamosVencidos(dia) {
    return [...this.#enCurso.values()]
      .filter((prestamo) => prestamo.diaLimite < dia)
      .map(({ libro, socio, diaLimite }) => ({ libro, socio, diasRetraso: dia - diaLimite }))
      .toSorted((a, b) => b.diasRetraso - a.diasRetraso);
  }

  /**
   * Estadísticas de la biblioteca.
   *
   * @returns {Estadisticas} Un objeto nuevo.
   */
  estadisticas() {
    const libros = [...this.#libros.values()];

    const porDecada = Object.groupBy(libros, (libro) => libro.decada);
    const librosPorDecada = new Map(
      Object.entries(porDecada)
        .map(([decada, grupo]) => [Number(decada), grupo.length])
        .toSorted(([a], [b]) => a - b),
    );

    const prestamosPorSocio = this.#historial.reduce(
      (cuenta, { socio }) => cuenta.set(socio, (cuenta.get(socio) ?? 0) + 1),
      new Map(),
    );
    // Con un empate gana el socio que se registró antes en el historial (comparación estricta)
    const masLector = [...prestamosPorSocio].reduce(
      (mejor, actual) => (mejor === null || actual[1] > mejor[1] ? actual : mejor),
      null,
    );

    return {
      libros: libros.length,
      prestados: this.#enCurso.size,
      socios: this.#socios.size,
      librosPorDecada,
      socioMasLector: masLector === null ? null : masLector[0].nombre,
      multasTotales: redondear(this.#historial.reduce((suma, { multa }) => suma + multa, 0)),
    };
  }
}
