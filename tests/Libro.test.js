// Tests UNITARIOS de Libro
import { describe, it, expect, beforeEach } from 'vitest';
import { Libro } from '../src/Libro.js';

let libro;

beforeEach(() => {
  libro = new Libro({
    isbn: '123',
    titulo: 'Rayuela',
    autor: 'Julio Cortázar',
    anio: 1963,
    etiquetas: ['novela', 'clásico', 'novela'],
  });
});

describe('Libro', () => {
  describe('constructor', () => {
    it('guarda los datos del objeto que recibe', () => {
      expect(libro.isbn).toBe('123');
      expect(libro.titulo).toBe('Rayuela');
      expect(libro.autor).toBe('Julio Cortázar');
      expect(libro.anio).toBe(1963);
    });

    it('guarda las etiquetas como un Set, sin repetidas', () => {
      expect(libro.etiquetas).toBeInstanceOf(Set);
      expect([...libro.etiquetas]).toEqual(['novela', 'clásico']);
    });

    it('no comparte el array de etiquetas con quien lo creó', () => {
      const etiquetas = ['a'];
      const otro = new Libro({ isbn: '1', titulo: 'T', autor: 'A', anio: 2000, etiquetas });
      etiquetas.push('b');
      expect(otro.etiquetas.has('b')).toBe(false);
    });
  });

  describe('disponible', () => {
    it('es true en un libro recién creado', () => {
      expect(libro.disponible).toBe(true);
    });

    it('es false mientras el libro está prestado', () => {
      libro.marcarPrestado();
      expect(libro.disponible).toBe(false);
    });

    it('no se puede asignar desde fuera', () => {
      expect(() => {
        libro.disponible = false;
      }).toThrow(TypeError);
      expect(libro.disponible).toBe(true);
    });
  });

  describe('decada', () => {
    it.each([
      [1967, 1960],
      [1960, 1960],
      [1969, 1960],
      [2000, 2000],
      [1450, 1450],
    ])('el año %i es de la década de %i', (anio, decada) => {
      expect(new Libro({ isbn: '1', titulo: 'T', autor: 'A', anio, etiquetas: [] }).decada).toBe(
        decada,
      );
    });
  });

  describe('marcarPrestado y marcarDevuelto', () => {
    it('cambian la disponibilidad en los dos sentidos', () => {
      libro.marcarPrestado();
      expect(libro.disponible).toBe(false);
      libro.marcarDevuelto();
      expect(libro.disponible).toBe(true);
    });

    it('marcarPrestado lanza un error si ya está prestado', () => {
      libro.marcarPrestado();
      expect(() => libro.marcarPrestado()).toThrow('«Rayuela» ya está prestado');
    });

    it('marcarDevuelto lanza un error si no está prestado', () => {
      expect(() => libro.marcarDevuelto()).toThrow('«Rayuela» no está prestado');
    });

    it('se puede prestar de nuevo después de devolverlo', () => {
      libro.marcarPrestado();
      libro.marcarDevuelto();
      expect(() => libro.marcarPrestado()).not.toThrow();
    });
  });

  describe('toString', () => {
    it('muestra el título, el autor y el año', () => {
      expect(String(libro)).toBe('«Rayuela» (Julio Cortázar, 1963)');
    });
  });
});
