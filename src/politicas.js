/**
 * Reglas de préstamo de cada tipo de socio (patrón Strategy).
 *
 * La biblioteca nunca pregunta por el tipo de socio (`if (socio.tipo === …)`): cada socio lleva
 * su política y la biblioteca la usa a través de la misma interfaz (máximo de préstamos, días de
 * préstamo y función de multa). Para añadir un tipo de socio basta con añadir una entrada aquí.
 * @module politicas
 */

/**
 * Reglas de un tipo de socio.
 *
 * @typedef {object} Politica
 * @property {number} maxPrestamos Préstamos que puede tener a la vez.
 * @property {number} diasPrestamo Días que dura un préstamo.
 * @property {function(number): number} multa Multa en euros por los días de retraso.
 */

/**
 * Políticas por tipo de socio.
 *
 * - `general`: 2 préstamos, 14 días, 0,50 € por día de retraso.
 * - `estudiante`: 3 préstamos, 21 días, 0,20 € por día con un máximo de 5 €.
 * - `profesorado`: 5 préstamos, 30 días, sin multa.
 *
 * @type {Object<string, Politica>}
 */
export const POLITICAS = Object.freeze({
  general: Object.freeze({
    maxPrestamos: 2,
    diasPrestamo: 14,
    multa: (diasRetraso) => diasRetraso * 0.5,
  }),
  estudiante: Object.freeze({
    maxPrestamos: 3,
    diasPrestamo: 21,
    multa: (diasRetraso) => Math.min(diasRetraso * 0.2, 5),
  }),
  profesorado: Object.freeze({
    maxPrestamos: 5,
    diasPrestamo: 30,
    multa: () => 0,
  }),
});

/**
 * Tipos de socio disponibles, calculados a partir de `POLITICAS`.
 *
 * @type {string[]}
 */
export const TIPOS_SOCIO = Object.freeze(Object.keys(POLITICAS));
