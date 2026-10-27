/**
 * Emisor de eventos: el sujeto del patrón Observer.
 * @module EmisorEventos
 */

/**
 * Función que se ejecuta cuando se emite un evento.
 *
 * @callback Oyente
 * @param {*} datos Los datos que se pasaron a `emit`.
 * @returns {void}
 */

/**
 * Emisor de eventos reutilizable. Quien se suscribe con `on` recibe los avisos sin que el emisor
 * sepa quién es ni qué hace con ellos.
 *
 * @example
 * const emisor = new EmisorEventos();
 * const baja = emisor.on('hola', (nombre) => saludar(nombre));
 * emisor.emit('hola', 'Ana'); // 1
 * baja();
 */
export class EmisorEventos {
  /**
   * Suscripciones: evento → conjunto de oyentes (un Set no repite funciones y conserva el orden).
   * @type {Map<string, Set<Oyente>>}
   */
  #oyentes = new Map();

  /**
   * Suscribe una función a un evento. La misma función suscrita dos veces se guarda una sola vez.
   *
   * @param {string} evento Nombre del evento.
   * @param {Oyente} oyente Función a la que se avisa.
   * @returns {() => void} Función que da de baja la suscripción al llamarla.
   * @throws {TypeError} Si `oyente` no es una función.
   */
  on(evento, oyente) {
    if (typeof oyente !== 'function') {
      throw new TypeError('El oyente debe ser una función');
    }
    if (!this.#oyentes.has(evento)) {
      this.#oyentes.set(evento, new Set());
    }
    this.#oyentes.get(evento).add(oyente);
    return () => {
      this.#oyentes.get(evento)?.delete(oyente);
    };
  }

  /**
   * Avisa a todas las funciones suscritas al evento, en el orden en que se suscribieron.
   *
   * @param {string} evento Nombre del evento.
   * @param {*} [datos] Datos que se pasan a cada oyente.
   * @returns {number} A cuántos oyentes ha avisado.
   */
  emit(evento, datos) {
    // Se recorre una copia: un oyente puede darse de baja mientras se emite
    const avisar = [...(this.#oyentes.get(evento) ?? [])];
    avisar.forEach((oyente) => oyente(datos));
    return avisar.length;
  }
}
