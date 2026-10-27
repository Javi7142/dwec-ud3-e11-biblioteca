// E11 · Programa principal. No modifiques este fichero.
import { Biblioteca, Socio, TIPOS_SOCIO, enlaceCatalogo } from './index.js';

const CATALOGO = `
9788437604947;Cien años de soledad;Gabriel García Márquez;1967;novela,clásico
9788420412146;La sombra del viento;Carlos Ruiz Zafón;2001;novela,misterio
9788498382662;Harry Potter y la piedra filosofal;J. K. Rowling;1997;fantasía,juvenil
9788445077528;El hobbit;J. R. R. Tolkien;1937;fantasía,clásico
9788491050298;Eloquent JavaScript;Marijn Haverbeke;2018;informática
9788466338141;Patria;Fernando Aramburu;2016;novela
9788408172178;Sin año;Autor Desconocido;;novela
9788420471839;Rayuela;Julio Cortázar;1963;novela, Clásico ,
línea mal formada
9788437604947;Cien años de soledad (repetido);Gabriel García Márquez;1967;novela
`;

const ISBN = {
  cien: '9788437604947',
  sombra: '9788420412146',
  harry: '9788498382662',
  hobbit: '9788445077528',
  eloquent: '9788491050298',
  patria: '9788466338141',
  rayuela: '9788420471839',
};

const biblioteca = new Biblioteca();
const { importados, descartados } = biblioteca.importarCatalogo(CATALOGO);
console.log(`📚 Catálogo: ${importados} libros importados · ${descartados} líneas descartadas`);

biblioteca
  .registrarSocio(new Socio('S1', 'Ana', 'estudiante'))
  .registrarSocio(new Socio('S2', 'Luis'))
  .registrarSocio(new Socio('S3', 'Marta', 'profesorado'));
console.log(`👥 Tipos de socio: ${TIPOS_SOCIO.join(', ')}`);

biblioteca.on('prestamo', ({ libro, socio, diaLimite }) => {
  console.log(`  📗 ${socio.nombre} se lleva ${libro} hasta el día ${diaLimite}`);
});
biblioteca.on('devolucion', ({ libro, socio, diasRetraso, multa }) => {
  const detalle =
    diasRetraso > 0
      ? `con ${diasRetraso} días de retraso · multa ${multa.toFixed(2)} €`
      : 'a tiempo';
  console.log(`  📘 ${socio.nombre} devuelve «${libro.titulo}» ${detalle}`);
});

const operaciones = [
  () => biblioteca.prestar(ISBN.cien, 'S1', 1),
  () => biblioteca.prestar(ISBN.hobbit, 'S1', 2),
  () => biblioteca.prestar(ISBN.patria, 'S2', 3),
  () => biblioteca.prestar(ISBN.rayuela, 'S2', 3),
  () => biblioteca.prestar(ISBN.harry, 'S2', 4),
  () => biblioteca.prestar(ISBN.cien, 'S3', 5),
  () => biblioteca.prestar('0000000000000', 'S1', 5),
  () => biblioteca.prestar(ISBN.sombra, 'S9', 5),
  () => biblioteca.devolver(ISBN.patria, 20),
  () => biblioteca.devolver(ISBN.cien, 40),
  () => biblioteca.prestar(ISBN.harry, 'S2', 21),
  () => biblioteca.prestar(ISBN.eloquent, 'S3', 21),
  () => biblioteca.devolver(ISBN.hobbit, 60),
  () => biblioteca.devolver(ISBN.rayuela, 17),
  () => biblioteca.devolver(ISBN.patria, 70),
];

console.log('🔄 Operaciones:');
for (const operacion of operaciones) {
  try {
    operacion();
  } catch (error) {
    console.log(`  ❌ ${error.message}`);
  }
}

const titulos = (libros) => libros.map((libro) => libro.titulo).join(', ');
console.log(`✅ Disponibles: ${titulos(biblioteca.disponibles())}`);
console.log(
  `🔎 Buscar «ZAF»: ${titulos(biblioteca.buscar('ZAF'))} · «tolkien»: ${titulos(biblioteca.buscar('tolkien'))}`,
);
console.log(`🏷️ Clásicos: ${titulos(biblioteca.porEtiqueta('clásico'))}`);
console.log(
  `⏰ Vencidos el día 50: ${biblioteca
    .prestamosVencidos(50)
    .map(
      ({ libro, socio, diasRetraso }) => `${libro.titulo} (${socio.nombre}, ${diasRetraso} días)`,
    )
    .join(', ')}`,
);

const estadisticas = biblioteca.estadisticas();
console.log(
  `📊 ${estadisticas.libros} libros · ${estadisticas.prestados} prestados · ${estadisticas.socios} socios · multas: ${estadisticas.multasTotales.toFixed(2)} €`,
);
console.log(
  `📊 Por décadas: ${[...estadisticas.librosPorDecada].map(([decada, n]) => `${decada}: ${n}`).join(' · ')}`,
);
console.log(`📊 Socio más lector: ${estadisticas.socioMasLector}`);
console.log(`🔗 ${enlaceCatalogo('La sombra del viento')}`);
