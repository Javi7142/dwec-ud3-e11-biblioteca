/**
 * Socio de la biblioteca.
 * @module Socio
 */

import { POLITICAS, TIPOS_SOCIO } from './politicas.js';

/** @import { Politica } from './politicas.js' */

/**
 * Socio de la biblioteca. Sus reglas (máximo de préstamos, días y multa) salen de la política de
 * su tipo: la clase no tiene `if` por tipo.
 *
 * @example
 * const luis = new Socio('S2', 'Luis');
 * String(luis); // 'Luis (general)'
 * luis.politica.maxPrestamos; // 2
 */
export class Socio {
  /** @type {string} */
  #tipo;

  /**
   * @param {string} id Identificador del socio.
   * @param {string} nombre Nombre del socio.
   * @param {string} [tipo='general'] Tipo de socio, uno de `TIPOS_SOCIO`.
   * @throws {RangeError} Si el tipo no está en `TIPOS_SOCIO`.
   */
  constructor(id, nombre, tipo = 'general') {
    if (!TIPOS_SOCIO.includes(tipo)) {
      throw new RangeError(`Tipo de socio no válido: ${tipo}`);
    }
    this.id = id;
    this.nombre = nombre;
    this.#tipo = tipo;
  }

  /**
   * Tipo de socio. No se puede asignar.
   * @type {string}
   */
  get tipo() {
    return this.#tipo;
  }

  /**
   * Reglas de préstamo del tipo de socio.
   * @type {Politica}
   */
  get politica() {
    return POLITICAS[this.#tipo];
  }

  /**
   * @returns {string} El nombre y el tipo, por ejemplo `Luis (general)`.
   */
  toString() {
    return `${this.nombre} (${this.#tipo})`;
  }
}
