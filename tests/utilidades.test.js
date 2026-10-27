// Tests UNITARIOS de utilidades.js
import { describe, it, expect } from 'vitest';
import { ANIO_MINIMO, parsearLibro, enlaceCatalogo, redondear } from '../src/utilidades.js';

const linea = (anio) => `123;Rayuela;Julio Cortázar;${anio};novela`;

describe('parsearLibro', () => {
  it('devuelve null con una línea sin cinco campos', () => {
    expect(parsearLibro('línea mal formada')).toBeNull();
  });

  it('lee los cinco campos de una línea correcta', () => {
    expect(parsearLibro('123;Rayuela;Julio Cortázar;1963;novela,clásico')).toEqual({
      isbn: '123',
      titulo: 'Rayuela',
      autor: 'Julio Cortázar',
      anio: 1963,
      etiquetas: ['novela', 'clásico'],
    });
  });

  it('quita los espacios de cada campo y pasa las etiquetas a minúsculas sin las vacías', () => {
    const datos = parsearLibro('  123 ; Rayuela ; Julio Cortázar ; 1963 ; novela, Clásico ,');
    expect(datos).toEqual({
      isbn: '123',
      titulo: 'Rayuela',
      autor: 'Julio Cortázar',
      anio: 1963,
      etiquetas: ['novela', 'clásico'],
    });
  });

  it('devuelve etiquetas vacías si el campo de etiquetas está vacío', () => {
    expect(parsearLibro('123;Rayuela;Julio Cortázar;1963;').etiquetas).toEqual([]);
  });

  it.each([
    ['con cuatro campos', '123;Rayuela;Julio Cortázar;1963'],
    ['con seis campos', '123;Rayuela;Julio Cortázar;1963;novela;extra'],
    ['vacía', ''],
  ])('devuelve null con una línea %s', (_descripcion, texto) => {
    expect(parsearLibro(texto)).toBeNull();
  });

  it('devuelve null si el ISBN está vacío', () => {
    expect(parsearLibro(';Rayuela;Julio Cortázar;1963;novela')).toBeNull();
  });

  it('devuelve null si el título está vacío o solo tiene espacios', () => {
    expect(parsearLibro('123;   ;Julio Cortázar;1963;novela')).toBeNull();
  });

  describe('límites del año', () => {
    it('acepta el año mínimo, 1450', () => {
      expect(parsearLibro(linea(ANIO_MINIMO)).anio).toBe(1450);
    });

    it('rechaza el año anterior al mínimo, 1449', () => {
      expect(parsearLibro(linea(ANIO_MINIMO - 1))).toBeNull();
    });

    it('acepta el año máximo por defecto, 2100, y rechaza 2101', () => {
      expect(parsearLibro(linea(2100)).anio).toBe(2100);
      expect(parsearLibro(linea(2101))).toBeNull();
    });

    it('usa el año máximo que se le pasa: 2025 sí, 2026 no', () => {
      expect(parsearLibro(linea(2025), 2025).anio).toBe(2025);
      expect(parsearLibro(linea(2026), 2025)).toBeNull();
    });

    it.each(['1967b', 'abcd', '19.5', '', ' ', '1e3', '-1967'])(
      'rechaza el año «%s», que no es un entero válido',
      (anio) => {
        expect(parsearLibro(linea(anio))).toBeNull();
      },
    );
  });
});

describe('enlaceCatalogo', () => {
  it('codifica el título para que pueda ir en la URL', () => {
    expect(enlaceCatalogo('La sombra del viento')).toBe(
      'https://catalogo.example/buscar?titulo=La%20sombra%20del%20viento',
    );
  });

  it('codifica el & y las tildes (con encodeURI el & rompería el parámetro)', () => {
    expect(enlaceCatalogo('Ana & Luis: ¿año?')).toBe(
      'https://catalogo.example/buscar?titulo=Ana%20%26%20Luis%3A%20%C2%BFa%C3%B1o%3F',
    );
  });

  it('con un título vacío deja el parámetro vacío', () => {
    expect(enlaceCatalogo('')).toBe('https://catalogo.example/buscar?titulo=');
  });
});

describe('redondear', () => {
  it('redondea a céntimos un error de coma flotante', () => {
    expect(redondear(0.1 + 0.2)).toBe(0.3);
    expect(redondear(18 * 0.2)).toBe(3.6);
  });

  it('deja igual un importe que ya tiene dos decimales', () => {
    expect(redondear(1.5)).toBe(1.5);
  });

  it('devuelve 0 con 0', () => {
    expect(redondear(0)).toBe(0);
  });
});
