// Tests de INTEGRACIÓN de Biblioteca: usan la librería a través de src/index.js, con libros,
// socios y políticas reales, sin sustituir ninguna pieza.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Biblioteca, Libro, Socio, parsearLibro } from '../src/index.js';

const CATALOGO = [
  '111;Rayuela;Julio Cortázar;1963;novela,clásico',
  '222;El hobbit;J. R. R. Tolkien;1937;fantasía,clásico',
  '333;Patria;Fernando Aramburu;2016;novela',
  '444;Zafón por dentro;Carlos Ruiz Zafón;2001;ensayo',
].join('\n');

let biblioteca;

beforeEach(() => {
  biblioteca = new Biblioteca();
  biblioteca.importarCatalogo(CATALOGO);
  biblioteca
    .registrarSocio(new Socio('G', 'Gema'))
    .registrarSocio(new Socio('E', 'Eva', 'estudiante'))
    .registrarSocio(new Socio('P', 'Pablo', 'profesorado'));
});

const titulos = (libros) => libros.map((l) => l.titulo);

describe('anadirLibro y registrarSocio', () => {
  it('devuelven la biblioteca para poder encadenar', () => {
    const otra = new Biblioteca();
    const libro = new Libro(parsearLibro('9;Nuevo;Autor;2000;x'));
    expect(otra.anadirLibro(libro)).toBe(otra);
    expect(otra.registrarSocio(new Socio('X', 'Xavi'))).toBe(otra);
  });

  it('lanzan un error con un ISBN o un id repetidos', () => {
    expect(() => biblioteca.anadirLibro(new Libro(parsearLibro('111;Otro;A;2000;x')))).toThrow(
      'ISBN repetido: 111',
    );
    expect(() => biblioteca.registrarSocio(new Socio('G', 'Otra'))).toThrow('Socio repetido: G');
  });
});

describe('importarCatalogo', () => {
  it('cuenta los libros importados y las líneas descartadas', () => {
    const otra = new Biblioteca();
    const texto = ['1;A;X;2000;a', 'mala', '', '1;A repetido;X;2000;a', '2;B;Y;1000;b'].join('\n');
    expect(otra.importarCatalogo(texto)).toEqual({ importados: 1, descartados: 3 });
  });

  it('ignora las líneas vacías sin contarlas como descartadas', () => {
    expect(new Biblioteca().importarCatalogo('\n\n  \n')).toEqual({
      importados: 0,
      descartados: 0,
    });
  });

  it('descarta un ISBN que ya está en el catálogo', () => {
    expect(biblioteca.importarCatalogo('111;Repetido;A;2000;x')).toEqual({
      importados: 0,
      descartados: 1,
    });
    expect(biblioteca.estadisticas().libros).toBe(4);
  });

  it('descarta el año fuera de rango y se queda con la primera aparición de un ISBN', () => {
    const otra = new Biblioteca();
    otra.importarCatalogo(
      ['1;Primero;A;2000;x', '1;Segundo;A;2001;x', '2;Viejo;A;1449;x'].join('\n'),
    );
    expect(titulos(otra.buscar(''))).toEqual(['Primero']);
  });
});

describe('prestar', () => {
  it('calcula el día límite con los días de la política del socio', () => {
    expect(biblioteca.prestar('111', 'G', 10).diaLimite).toBe(24);
    expect(biblioteca.prestar('222', 'E', 10).diaLimite).toBe(31);
    expect(biblioteca.prestar('333', 'P', 10).diaLimite).toBe(40);
  });

  it('marca el libro como no disponible', () => {
    biblioteca.prestar('111', 'G', 1);
    expect(titulos(biblioteca.disponibles())).not.toContain('Rayuela');
  });

  it('lanza los errores en el orden del contrato', () => {
    expect(() => biblioteca.prestar('000', 'X', 1)).toThrow('No existe el libro 000');
    expect(() => biblioteca.prestar('111', 'X', 1)).toThrow('No existe el socio X');
    biblioteca.prestar('111', 'G', 1);
    expect(() => biblioteca.prestar('111', 'E', 1)).toThrow('«Rayuela» ya está prestado');
  });

  it('respeta el máximo de préstamos: el general, 2; el estudiante, 3', () => {
    biblioteca.prestar('111', 'G', 1);
    biblioteca.prestar('222', 'G', 1);
    expect(() => biblioteca.prestar('333', 'G', 1)).toThrow(
      'Gema ha alcanzado su máximo de 2 préstamos',
    );
    biblioteca.prestar('333', 'E', 1);
    biblioteca.prestar('444', 'E', 1);
    expect(() => biblioteca.prestar('111', 'E', 1)).toThrow('«Rayuela» ya está prestado');
  });

  it('comprueba el máximo antes que si el libro ya está prestado', () => {
    biblioteca.prestar('111', 'G', 1);
    biblioteca.prestar('222', 'G', 1);
    expect(() => biblioteca.prestar('111', 'G', 1)).toThrow('máximo de 2 préstamos');
  });

  it('el máximo vuelve a dejar prestar después de devolver un libro', () => {
    biblioteca.prestar('111', 'G', 1);
    biblioteca.prestar('222', 'G', 1);
    biblioteca.devolver('111', 2);
    expect(() => biblioteca.prestar('333', 'G', 3)).not.toThrow();
  });
});

describe('devolver', () => {
  it('no cobra multa si se devuelve el día límite', () => {
    biblioteca.prestar('111', 'G', 1); // límite: día 15
    expect(biblioteca.devolver('111', 15)).toBe(0);
  });

  it('no cobra multa si se devuelve antes del día límite', () => {
    biblioteca.prestar('111', 'G', 1);
    expect(biblioteca.devolver('111', 3)).toBe(0);
  });

  it('cobra 0,50 € por día de retraso al socio general', () => {
    biblioteca.prestar('111', 'G', 1);
    expect(biblioteca.devolver('111', 18)).toBe(1.5);
  });

  it('cobra 0,20 € por día al estudiante y se queda en el tope de 5 €', () => {
    biblioteca.prestar('111', 'E', 1); // límite: día 22
    biblioteca.prestar('222', 'E', 1);
    expect(biblioteca.devolver('111', 22 + 25)).toBe(5); // 25 días: justo el tope
    expect(biblioteca.devolver('222', 22 + 100)).toBe(5); // 100 días: no pasa de 5
  });

  it('redondea la multa del estudiante a céntimos (18 × 0,2 = 3,6)', () => {
    biblioteca.prestar('111', 'E', 1);
    expect(biblioteca.devolver('111', 22 + 18)).toBe(3.6);
  });

  it('no cobra multa al profesorado por mucho retraso que tenga', () => {
    biblioteca.prestar('111', 'P', 1);
    expect(biblioteca.devolver('111', 1000)).toBe(0);
  });

  it('deja el libro disponible otra vez', () => {
    biblioteca.prestar('111', 'G', 1);
    biblioteca.devolver('111', 2);
    expect(titulos(biblioteca.disponibles())).toContain('Rayuela');
  });

  it('lanza un error si el libro no existe o no está prestado', () => {
    expect(() => biblioteca.devolver('000', 1)).toThrow('No existe el libro 000');
    expect(() => biblioteca.devolver('111', 1)).toThrow('«Rayuela» no está prestado');
  });
});

describe('eventos', () => {
  it('prestar emite prestamo con el libro, el socio y el día límite', () => {
    const oyente = vi.fn();
    biblioteca.on('prestamo', oyente);
    biblioteca.prestar('111', 'G', 1);
    expect(oyente).toHaveBeenCalledTimes(1);
    const { libro, socio, diaLimite } = oyente.mock.calls[0][0];
    expect(libro.titulo).toBe('Rayuela');
    expect(socio.nombre).toBe('Gema');
    expect(diaLimite).toBe(15);
  });

  it('devolver emite devolucion con los días de retraso y la multa', () => {
    const oyente = vi.fn();
    biblioteca.on('devolucion', oyente);
    biblioteca.prestar('111', 'G', 1);
    biblioteca.devolver('111', 18);
    expect(oyente).toHaveBeenCalledTimes(1);
    expect(oyente.mock.calls[0][0]).toMatchObject({ diasRetraso: 3, multa: 1.5 });
  });

  it('devolver el día límite emite devolucion con 0 días de retraso y multa 0', () => {
    const oyente = vi.fn();
    biblioteca.on('devolucion', oyente);
    biblioteca.prestar('111', 'G', 1);
    biblioteca.devolver('111', 15);
    expect(oyente.mock.calls[0][0]).toMatchObject({ diasRetraso: 0, multa: 0 });
  });

  it('no emite ningún evento cuando prestar falla', () => {
    const oyente = vi.fn();
    biblioteca.on('prestamo', oyente);
    biblioteca.prestar('111', 'G', 1);
    oyente.mockClear();

    expect(() => biblioteca.prestar('000', 'G', 1)).toThrow(); // libro inexistente
    expect(() => biblioteca.prestar('222', 'X', 1)).toThrow(); // socio inexistente
    expect(() => biblioteca.prestar('111', 'E', 1)).toThrow(); // ya prestado
    biblioteca.prestar('222', 'G', 1);
    oyente.mockClear();
    expect(() => biblioteca.prestar('333', 'G', 1)).toThrow(); // máximo de préstamos
    expect(oyente).not.toHaveBeenCalled();
  });

  it('no emite ningún evento cuando devolver falla', () => {
    const oyente = vi.fn();
    biblioteca.on('devolucion', oyente);
    expect(() => biblioteca.devolver('000', 1)).toThrow(); // libro inexistente
    expect(() => biblioteca.devolver('111', 1)).toThrow(); // no está prestado
    expect(oyente).not.toHaveBeenCalled();
  });

  it('una función de baja deja de recibir los eventos', () => {
    const oyente = vi.fn();
    const baja = biblioteca.on('prestamo', oyente);
    baja();
    biblioteca.prestar('111', 'G', 1);
    expect(oyente).not.toHaveBeenCalled();
  });

  it('lanza un TypeError si se suscribe algo que no es una función', () => {
    expect(() => biblioteca.on('prestamo', 'texto')).toThrow(TypeError);
  });
});

describe('consultas', () => {
  it('disponibles ordena por título con las reglas del español', () => {
    expect(titulos(biblioteca.disponibles())).toEqual([
      'El hobbit',
      'Patria',
      'Rayuela',
      'Zafón por dentro',
    ]);
  });

  it('buscar encuentra por título o autor sin distinguir mayúsculas, en el orden del catálogo', () => {
    expect(titulos(biblioteca.buscar('ZAF'))).toEqual(['Zafón por dentro']);
    expect(titulos(biblioteca.buscar('tolkien'))).toEqual(['El hobbit']);
    // «El hobbit» y «J. R. R. Tolkien» no contienen ninguna «a»
    expect(titulos(biblioteca.buscar('a'))).toEqual(['Rayuela', 'Patria', 'Zafón por dentro']);
  });

  it('buscar sin coincidencias devuelve una lista vacía', () => {
    expect(biblioteca.buscar('inexistente')).toEqual([]);
  });

  it('porEtiqueta devuelve los libros con esa etiqueta en el orden del catálogo', () => {
    expect(titulos(biblioteca.porEtiqueta('clásico'))).toEqual(['Rayuela', 'El hobbit']);
    expect(biblioteca.porEtiqueta('no-existe')).toEqual([]);
  });

  it('prestamosVencidos lista los vencidos del más al menos retrasado', () => {
    biblioteca.prestar('111', 'G', 1); // límite 15
    biblioteca.prestar('222', 'G', 5); // límite 19
    biblioteca.prestar('333', 'P', 1); // límite 31
    const vencidos = biblioteca.prestamosVencidos(20);
    expect(vencidos.map((v) => [v.libro.titulo, v.diasRetraso])).toEqual([
      ['Rayuela', 5],
      ['El hobbit', 1],
    ]);
  });

  it('prestamosVencidos no incluye un préstamo que vence justo ese día', () => {
    biblioteca.prestar('111', 'G', 1); // límite 15
    expect(biblioteca.prestamosVencidos(15)).toEqual([]);
    expect(biblioteca.prestamosVencidos(16)).toHaveLength(1);
  });

  it('prestamosVencidos no incluye los préstamos devueltos', () => {
    biblioteca.prestar('111', 'G', 1);
    biblioteca.devolver('111', 30);
    expect(biblioteca.prestamosVencidos(100)).toEqual([]);
  });

  it('las consultas devuelven arrays nuevos: modificarlos no cambia la biblioteca', () => {
    biblioteca.disponibles().pop();
    biblioteca.buscar('').length = 0;
    biblioteca.porEtiqueta('clásico').splice(0);
    expect(biblioteca.disponibles()).toHaveLength(4);
    expect(biblioteca.buscar('')).toHaveLength(4);
    expect(biblioteca.porEtiqueta('clásico')).toHaveLength(2);
  });
});

describe('estadisticas', () => {
  it('en una biblioteca vacía: todo a 0 y sin socio más lector', () => {
    expect(new Biblioteca().estadisticas()).toEqual({
      libros: 0,
      prestados: 0,
      socios: 0,
      librosPorDecada: new Map(),
      socioMasLector: null,
      multasTotales: 0,
    });
  });

  it('cuenta libros, prestados y socios', () => {
    biblioteca.prestar('111', 'G', 1);
    expect(biblioteca.estadisticas()).toMatchObject({ libros: 4, prestados: 1, socios: 3 });
  });

  it('agrupa los libros por década en un Map ordenado por década', () => {
    const { librosPorDecada } = biblioteca.estadisticas();
    expect(librosPorDecada).toBeInstanceOf(Map);
    expect([...librosPorDecada]).toEqual([
      [1930, 1],
      [1960, 1],
      [2000, 1],
      [2010, 1],
    ]);
  });

  it('el socio más lector cuenta los préstamos en curso y los devueltos', () => {
    biblioteca.prestar('111', 'G', 1);
    biblioteca.devolver('111', 2);
    biblioteca.prestar('222', 'G', 3);
    biblioteca.prestar('333', 'E', 3);
    expect(biblioteca.estadisticas().socioMasLector).toBe('Gema');
  });

  it('con un empate gana el socio que hizo antes su primer préstamo', () => {
    biblioteca.prestar('111', 'E', 1);
    biblioteca.prestar('222', 'G', 1);
    expect(biblioteca.estadisticas().socioMasLector).toBe('Eva');
  });

  it('suma las multas redondeadas a céntimos', () => {
    biblioteca.prestar('111', 'G', 1);
    biblioteca.prestar('222', 'E', 1);
    biblioteca.devolver('111', 15 + 3); // 1,50 €
    biblioteca.devolver('222', 22 + 18); // 3,60 €
    expect(biblioteca.estadisticas().multasTotales).toBe(5.1);
  });

  it('devuelve un objeto nuevo en cada llamada', () => {
    expect(biblioteca.estadisticas()).not.toBe(biblioteca.estadisticas());
  });
});
