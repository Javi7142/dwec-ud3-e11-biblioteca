/**
 * Libro del catálogo.
 * @module Libro
 */

/** @import { DatosLibro } from './utilidades.js' */

/**
 * Libro del catálogo. Sabe si está prestado, pero no quién lo tiene: eso lo gestiona la biblioteca.
 *
 * @example
 * const libro = new Libro({ isbn: '1', titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 1963, etiquetas: ['novela'] });
 * String(libro); // '«Rayuela» (Julio Cortázar, 1963)'
 * libro.decada; // 1960
 */
export class Libro {
  /** @type {boolean} */
  #prestado = false;

  /**
   * @param {DatosLibro} datos Datos del libro, como los devuelve `parsearLibro`.
   */
  constructor({ isbn, titulo, autor, anio, etiquetas }) {
    this.isbn = isbn;
    this.titulo = titulo;
    this.autor = autor;
    this.anio = anio;
    /** @type {Set<string>} */
    this.etiquetas = new Set(etiquetas);
  }

  /**
   * `false` mientras el libro está prestado. No se puede asignar.
   * @type {boolean}
   */
  get disponible() {
    return !this.#prestado;
  }

  /**
   * Década de publicación: 1967 → 1960.
   * @type {number}
   */
  get decada() {
    return Math.floor(this.anio / 10) * 10;
  }

  /**
   * Marca el libro como prestado.
   *
   * @returns {void}
   * @throws {Error} Si ya está prestado.
   */
  marcarPrestado() {
    if (this.#prestado) {
      throw new Error(`«${this.titulo}» ya está prestado`);
    }
    this.#prestado = true;
  }

  /**
   * Marca el libro como devuelto.
   *
   * @returns {void}
   * @throws {Error} Si no está prestado.
   */
  marcarDevuelto() {
    if (!this.#prestado) {
      throw new Error(`«${this.titulo}» no está prestado`);
    }
    this.#prestado = false;
  }

  /**
   * @returns {string} El título, el autor y el año, por ejemplo `«Rayuela» (Julio Cortázar, 1963)`.
   */
  toString() {
    return `«${this.titulo}» (${this.autor}, ${this.anio})`;
  }
}
