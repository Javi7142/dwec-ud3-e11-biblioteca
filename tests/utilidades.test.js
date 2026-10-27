import { describe, it, expect } from 'vitest';
import { parsearLibro } from '../src/utilidades.js';

describe('parsearLibro', () => {
  it('devuelve null con una línea sin cinco campos', () => {
    expect(parsearLibro('línea mal formada')).toBeNull();
  });

  // TODO: añade el resto de tests de parsearLibro y un fichero de tests por cada módulo
});
