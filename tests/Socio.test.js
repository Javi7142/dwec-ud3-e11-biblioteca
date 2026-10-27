// Tests UNITARIOS de Socio y de las políticas (politicas.js)
import { describe, it, expect } from 'vitest';
import { Socio } from '../src/Socio.js';
import { POLITICAS, TIPOS_SOCIO } from '../src/politicas.js';

describe('TIPOS_SOCIO', () => {
  it('lista los tres tipos de socio', () => {
    expect(TIPOS_SOCIO).toEqual(['general', 'estudiante', 'profesorado']);
  });
});

describe('POLITICAS', () => {
  it.each([
    ['general', 2, 14],
    ['estudiante', 3, 21],
    ['profesorado', 5, 30],
  ])('el tipo %s permite %i préstamos durante %i días', (tipo, maxPrestamos, diasPrestamo) => {
    expect(POLITICAS[tipo].maxPrestamos).toBe(maxPrestamos);
    expect(POLITICAS[tipo].diasPrestamo).toBe(diasPrestamo);
  });

  describe('multa del socio general: 0,50 € por día', () => {
    it('es 0 sin retraso', () => {
      expect(POLITICAS.general.multa(0)).toBe(0);
    });

    it('es 1,50 € con tres días de retraso', () => {
      expect(POLITICAS.general.multa(3)).toBe(1.5);
    });

    it('no tiene tope', () => {
      expect(POLITICAS.general.multa(100)).toBe(50);
    });
  });

  describe('multa del estudiante: 0,20 € por día con tope de 5 €', () => {
    it('es 0 sin retraso', () => {
      expect(POLITICAS.estudiante.multa(0)).toBe(0);
    });

    it('es 1 € con cinco días de retraso', () => {
      expect(POLITICAS.estudiante.multa(5)).toBe(1);
    });

    it('llega justo al tope con 25 días (5 €)', () => {
      expect(POLITICAS.estudiante.multa(25)).toBe(5);
    });

    it('no pasa del tope de 5 € con 26 días ni con 1000', () => {
      expect(POLITICAS.estudiante.multa(26)).toBe(5);
      expect(POLITICAS.estudiante.multa(1000)).toBe(5);
    });
  });

  describe('multa del profesorado: ninguna', () => {
    it('es siempre 0, también con mucho retraso', () => {
      expect(POLITICAS.profesorado.multa(0)).toBe(0);
      expect(POLITICAS.profesorado.multa(365)).toBe(0);
    });
  });

  it('las políticas no se pueden modificar (están congeladas)', () => {
    expect(Object.isFrozen(POLITICAS)).toBe(true);
    expect(Object.isFrozen(POLITICAS.general)).toBe(true);
  });
});

describe('Socio', () => {
  it('guarda el id, el nombre y el tipo', () => {
    const socio = new Socio('S1', 'Ana', 'estudiante');
    expect(socio.id).toBe('S1');
    expect(socio.nombre).toBe('Ana');
    expect(socio.tipo).toBe('estudiante');
  });

  it('es de tipo general si no se indica el tipo', () => {
    expect(new Socio('S2', 'Luis').tipo).toBe('general');
  });

  it('lanza un RangeError con un tipo que no existe', () => {
    expect(() => new Socio('S3', 'Marta', 'vip')).toThrow(RangeError);
    expect(() => new Socio('S3', 'Marta', 'vip')).toThrow('Tipo de socio no válido: vip');
  });

  it.each(['constructor', '', 'toString'])(
    'rechaza el tipo «%s», que no está en TIPOS_SOCIO',
    (tipo) => {
      expect(() => new Socio('S', 'N', tipo)).toThrow(RangeError);
    },
  );

  it('su política es la de su tipo', () => {
    expect(new Socio('S1', 'Ana', 'estudiante').politica).toBe(POLITICAS.estudiante);
    expect(new Socio('S3', 'Marta', 'profesorado').politica.maxPrestamos).toBe(5);
  });

  it('el tipo y la política no se pueden asignar desde fuera', () => {
    const socio = new Socio('S1', 'Ana');
    expect(() => {
      socio.tipo = 'profesorado';
    }).toThrow(TypeError);
    expect(() => {
      socio.politica = POLITICAS.profesorado;
    }).toThrow(TypeError);
    expect(socio.tipo).toBe('general');
  });

  it('toString muestra el nombre y el tipo', () => {
    expect(String(new Socio('S2', 'Luis'))).toBe('Luis (general)');
  });
});
