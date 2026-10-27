# E11 · Biblioteca (integrador)

**Tipo:** corrección por IA

Programa una pequeña librería de JavaScript para gestionar una biblioteca: catálogo, socios y préstamos. Junta todo lo visto en la unidad: funciones predefinidas y propias, colecciones, operaciones agregadas, clases, módulos y patrones de diseño, con tests propios y documentación generada.

**CE:** RA4 a, b, c, d, e, f, g, h, i, j, k

## Entorno de trabajo

Este ejercicio trae su Dev Container en `.devcontainer/`. Como los ejercicios de la UD2 con dependencias de npm, **construye su imagen** con el `Dockerfile` de esa carpeta, a partir de la imagen oficial de Node.js de **Docker Hub**, `node:24-bookworm` (UD2, tema 9, apartado 9.3.2). Abre en VS Code **la carpeta del ejercicio**, la que contiene `.devcontainer/` (no una carpeta superior, como la del repositorio del curso: VS Code solo busca el Dev Container en la carpeta que abres), y ejecuta **Dev Containers: Reopen in Container**. Si VS Code te ofrece crear una configuración nueva, es que has abierto otra carpeta. La primera vez tarda algo más, porque descarga la imagen y la construye. Al crearse, el contenedor ejecuta `npm install`: cuando se abre, las dependencias ya están instaladas.

Ejecuta los programas en la terminal de VS Code, que ya es la del contenedor.

## Punto de partida

```text
├── package.json          ← scripts start, test, lint, format, format:check y docs
├── jsdoc.json            ← configuración de la documentación
├── eslint.config.js      ← configuración del curso, que ignora docs/ (no se modifica)
├── .prettierrc
├── src/
│   ├── main.js           ← programa de demostración (no se modifica)
│   ├── index.js          ← interfaz pública de la librería (no se modifica)
│   ├── utilidades.js     ← vacío
│   ├── EmisorEventos.js  ← vacío: puedes reutilizar tu solución del E08
│   ├── politicas.js      ← vacío
│   ├── Libro.js          ← vacío
│   ├── Socio.js          ← vacío
│   └── Biblioteca.js     ← vacío
├── tests/
│   └── utilidades.test.js ← un primer test de ejemplo
└── README.md             ← plantilla de entrega
```

Los días se cuentan como **números enteros** (día 1, día 2…), para no depender de fechas (las verás en la UD4).

## Requisitos

### Módulos y clases

Programa cada módulo según el contrato (abajo). Además:

1. **`utilidades.js`:** funciones **puras**. Usa las funciones predefinidas adecuadas para convertir y validar el año y para codificar el título en la URL, y justifica la elección en el README.
2. **`politicas.js`:** las reglas de cada tipo de socio, de forma que la biblioteca **no pregunte nunca por el tipo** (`if (socio.tipo === …)`) para calcular el máximo de préstamos, los días o la multa.
3. **`Libro`, `Socio` y `Biblioteca`:** clases con **campos privados** para el estado que no debe cambiarse desde fuera, **_getters_** para los datos calculados y **errores** con los mensajes del contrato cuando una operación no es válida.
4. **`Biblioteca`:** guarda libros, socios y préstamos en las **colecciones** que consideres adecuadas (justifícalas en el README) y **no devuelve nunca** sus colecciones privadas: las consultas devuelven arrays nuevos.
5. **`Biblioteca`** avisa de los préstamos y las devoluciones con el patrón **Observer** (`on` y los eventos del contrato). Ni `Biblioteca.js` ni ningún otro módulo salvo `main.js` muestra mensajes por consola.
6. Las consultas y estadísticas usan **operaciones agregadas**. Los _callbacks_ de `map`, `filter` y `reduce` son puros.
7. Usa **al menos dos patrones de diseño** (el Observer y otro: Strategy, Factory, Singleton o Módulo) y explica en el README qué problema resuelve cada uno **en este proyecto**.

### Pruebas, depuración y documentación

8. Un fichero de tests por módulo (`utilidades`, `Libro`, `Socio`/`politicas` y `Biblioteca`), con casos **normales, límite y erróneos**. Los de `utilidades`, `Libro` y `Socio` son **unitarios**; los de `Biblioteca` son **de integración** (tema 10, apartado 10.5.8): usan la librería a través de `src/index.js`, con libros, socios y políticas reales, sin sustituir ninguna pieza. Al menos: los límites del año en `parsearLibro`, devolver un libro **el día límite** (sin multa), el **tope** de la multa del estudiante, el **máximo** de préstamos, y que **no** se emite ningún evento cuando una operación falla.
9. Una **sesión de depuración** documentada en el README (tema 10): un punto de ruptura (condicional si hace falta), la **pila de llamadas** y lo que viste en el panel **Ámbito**. Puedes añadir capturas en una carpeta `img/`.
10. **JSDoc completo**: `@module` en cada fichero, `@typedef` para los objetos que no son clases, `@param`, `@returns`, `@throws` y `@example` en lo público, y `@type` en los _getters_. `npm run docs` debe generar la documentación **sin errores**.
11. `npm test`, `npm run lint` y `npm run format:check` sin errores.
12. Completa el `README.md` siguiendo los comentarios de la plantilla.
13. Haz **commits frecuentes** a lo largo del trabajo (al menos uno por módulo y sus tests), con mensajes que expliquen cada cambio.

## Salida esperada

Con tu librería, `npm start` muestra exactamente:

```text
📚 Catálogo: 7 libros importados · 3 líneas descartadas
👥 Tipos de socio: general, estudiante, profesorado
🔄 Operaciones:
  📗 Ana se lleva «Cien años de soledad» (Gabriel García Márquez, 1967) hasta el día 22
  📗 Ana se lleva «El hobbit» (J. R. R. Tolkien, 1937) hasta el día 23
  📗 Luis se lleva «Patria» (Fernando Aramburu, 2016) hasta el día 17
  📗 Luis se lleva «Rayuela» (Julio Cortázar, 1963) hasta el día 17
  ❌ Luis ha alcanzado su máximo de 2 préstamos
  ❌ «Cien años de soledad» ya está prestado
  ❌ No existe el libro 0000000000000
  ❌ No existe el socio S9
  📘 Luis devuelve «Patria» con 3 días de retraso · multa 1.50 €
  📘 Ana devuelve «Cien años de soledad» con 18 días de retraso · multa 3.60 €
  📗 Luis se lleva «Harry Potter y la piedra filosofal» (J. K. Rowling, 1997) hasta el día 35
  📗 Marta se lleva «Eloquent JavaScript» (Marijn Haverbeke, 2018) hasta el día 51
  📘 Ana devuelve «El hobbit» con 37 días de retraso · multa 5.00 €
  📘 Luis devuelve «Rayuela» a tiempo
  ❌ «Patria» no está prestado
✅ Disponibles: Cien años de soledad, El hobbit, La sombra del viento, Patria, Rayuela
🔎 Buscar «ZAF»: La sombra del viento · «tolkien»: El hobbit
🏷️ Clásicos: Cien años de soledad, El hobbit, Rayuela
⏰ Vencidos el día 50: Harry Potter y la piedra filosofal (Luis, 15 días)
📊 7 libros · 2 prestados · 3 socios · multas: 10.10 €
📊 Por décadas: 1930: 1 · 1960: 2 · 1990: 1 · 2000: 1 · 2010: 2
📊 Socio más lector: Luis
🔗 https://catalogo.example/buscar?titulo=La%20sombra%20del%20viento
```

## Contrato de entrega

**`src/utilidades.js`**

| Exportación | Contrato |
|-------------|----------|
| `ANIO_MINIMO` | `1450` |
| `parsearLibro(linea, anioMaximo = 2100)` | Lee `isbn;título;autor;año;etiqueta1,etiqueta2`. Quita los espacios de cada campo; las etiquetas, en minúsculas y sin vacías. Devuelve `{ isbn, titulo, autor, anio, etiquetas }` o `null` si no hay **exactamente** cinco campos, el ISBN o el título están vacíos, o el año no es un entero entre `ANIO_MINIMO` y `anioMaximo` (ambos incluidos). `'1967b'` no es un año válido |
| `enlaceCatalogo(titulo)` | `https://catalogo.example/buscar?titulo=<título codificado>` |
| `redondear(importe)` | Redondea a céntimos |

**`src/politicas.js`**

| Exportación | Contrato |
|-------------|----------|
| `POLITICAS` | Por tipo de socio: máximo de préstamos a la vez, días de préstamo y multa por días de retraso. **general**: 2 préstamos, 14 días, 0,50 €/día. **estudiante**: 3 préstamos, 21 días, 0,20 €/día con un **máximo de 5 €**. **profesorado**: 5 préstamos, 30 días, sin multa |
| `TIPOS_SOCIO` | `['general', 'estudiante', 'profesorado']` |

**`src/Libro.js`** · clase `Libro`

| Miembro | Contrato |
|---------|----------|
| `constructor({ isbn, titulo, autor, anio, etiquetas })` | Recibe el objeto de `parsearLibro`. `etiquetas` se guarda como un `Set` |
| `disponible` | _Getter_: `false` mientras está prestado. No se puede asignar |
| `decada` | _Getter_: 1967 → 1960 |
| `marcarPrestado()` / `marcarDevuelto()` | Cambian el estado. Errores: `«Título» ya está prestado` / `«Título» no está prestado` |
| `toString()` | `«Rayuela» (Julio Cortázar, 1963)` |

**`src/Socio.js`** · clase `Socio`

| Miembro | Contrato |
|---------|----------|
| `constructor(id, nombre, tipo = 'general')` | `RangeError` si el tipo no está en `TIPOS_SOCIO` |
| `politica` | _Getter_: las reglas de su tipo |
| `toString()` | `Luis (general)` |

**`src/EmisorEventos.js`** · clase `EmisorEventos` con `on(evento, oyente)` (devuelve una función de baja) y `emit(evento, datos)`, como en el E08.

**`src/Biblioteca.js`** · clase `Biblioteca` (con `on` para suscribirse a sus eventos)

| Miembro | Contrato |
|---------|----------|
| `anadirLibro(libro)` / `registrarSocio(socio)` | Devuelven la biblioteca (para encadenar). Errores: `ISBN repetido: <isbn>` / `Socio repetido: <id>` |
| `importarCatalogo(texto)` | Una línea por libro. Ignora las líneas vacías; descarta las incorrectas y los ISBN repetidos (ya en el catálogo o dentro del propio texto). Devuelve `{ importados, descartados }` |
| `prestar(isbn, idSocio, dia)` | Día límite = `dia + diasPrestamo` de la política del socio. Emite `prestamo` con `{ libro, socio, diaLimite }` y devuelve el préstamo. Errores, en este orden: `No existe el libro <isbn>`, `No existe el socio <id>`, `<nombre> ha alcanzado su máximo de <n> préstamos`, `«Título» ya está prestado` |
| `devolver(isbn, dia)` | Días de retraso = días después del día límite (0 si se devuelve ese día o antes). Multa según la política del socio. Emite `devolucion` con `{ libro, socio, diasRetraso, multa }` y devuelve la multa. Errores: `No existe el libro <isbn>`, `«Título» no está prestado` |
| `disponibles()` | Libros no prestados, por orden alfabético de título (`localeCompare`) |
| `buscar(texto)` | Libros cuyo título o autor contienen el texto, sin distinguir mayúsculas, en el orden del catálogo |
| `porEtiqueta(etiqueta)` | Libros con esa etiqueta, en el orden del catálogo |
| `prestamosVencidos(dia)` | `[{ libro, socio, diasRetraso }]` de los préstamos en curso cuyo día límite ya ha pasado, del más retrasado al menos |
| `estadisticas()` | `{ libros, prestados, socios, librosPorDecada, socioMasLector, multasTotales }`. `librosPorDecada` es un `Map` década → número de libros ordenado por década. `socioMasLector` es el **nombre** del socio con más préstamos (en curso y devueltos), o `null` si no hay ninguno. `multasTotales` redondeado a céntimos |

**Entrega**

| Elemento | Debe ser |
|----------|----------|
| Ficheros | Los de `src/` del punto de partida, un fichero de tests por módulo en `tests/`, `README.md` |
| Sin cambios | `src/main.js`, `src/index.js`, `eslint.config.js` |
| Scripts | `npm start`, `npm test`, `npm run lint`, `npm run format:check` y `npm run docs` funcionan |
| Secciones del README | `## Cómo ejecutarlo`, `## Diseño`, `## Colecciones`, `## Patrones`, `## Funciones predefinidas`, `## Operaciones agregadas`, `## Depuración`, `## Pruebas`, `## Documentación`, `## Herramientas` |
| Integración continua | **Opcional**: `.github/workflows/ci.yml`, `package-lock.json` y la sección `## Integración continua (opcional)` del README. No se corrige |

## Criterios de evaluación

- ✅ Funciones predefinidas bien elegidas y clasificadas
- ✅ Funciones propias puras, con parámetros por defecto y _callbacks_
- ✅ Colecciones adecuadas y justificadas, sin exponer las privadas
- ✅ Arrays bien creados y usados
- ✅ Operaciones agregadas en consultas y estadísticas
- ✅ Diseño orientado a objetos explicado: herencia o composición, encapsulación, diagrama de clases
- ✅ Clases bien estructuradas, con campos privados, _getters_ y errores
- ✅ Los módulos se usan a través de su interfaz pública y la demostración produce la salida esperada
- ✅ Dos patrones de diseño aplicados y justificados
- ✅ Tests propios con casos límite y eventos
- ✅ Sesión de depuración, JSDoc completo y documentación generada
- ✅ Historial de commits progresivo y con mensajes descriptivos

## Integración continua (opcional)

> 📝 Este apartado es **opcional** y no cuenta para la corrección. Hazlo si en clase habéis visto GitHub Actions; si no, sáltatelo.

Tu repositorio de la tarea ya está en GitHub. Escribe un *workflow* de GitHub Actions que pase **todas las comprobaciones del proyecto** cada vez que subas cambios. Es como el de la UD2, con una mejora: las dependencias se instalan con **`npm ci`** a partir de `package-lock.json`, el fichero que anota la versión exacta de cada paquete instalado. Así la integración continua usa las mismas versiones que tu contenedor, y con la caché de npm la instalación es más rápida. Escríbelo tú, en `.github/workflows/ci.yml`, con estas orientaciones:

- Se ejecuta con cada `push` y cada *pull request* a la rama `main`.
- Tiene un único trabajo (*job*) que se ejecuta en `ubuntu-latest`.
- Sus pasos, en este orden, cada uno con un nombre (`name`) en español que diga qué hace:
  1. Descargar el código, con la acción `actions/checkout@v7`.
  2. Instalar Node.js 24 con la caché de npm, con la acción `actions/setup-node@v7`, `node-version: 24` y `cache: npm`.
  3. Instalar las dependencias con `npm ci`.
  4. Revisar el código con ESLint: `npm run lint`.
  5. Comprobar el formato con Prettier: `npm run format:check`.
  6. Ejecutar los tests: `npm test`.
  7. Generar la documentación: `npm run docs`.
  8. Publicar la documentación como **artefacto** de la ejecución (un fichero que se puede descargar desde ella), con la acción `actions/upload-artifact@v7`, `name: documentacion` y `path: docs/`.
- Sube también `package-lock.json`: lo creó `npm install` al abrir el contenedor. Sin él, `npm ci` falla. Si añades o actualizas una dependencia, vuelve a subirlo.
- Prettier también revisa el formato de `ci.yml`: ejecuta `npm run format` antes de subirlo.

Compruébalo:

1. Sube los cambios y abre la pestaña **Actions** del repositorio: la ejecución debe salir en verde, con los ocho pasos. En el resumen de la ejecución, en **Artifacts**, descarga `documentacion` y abre su `index.html`: es la misma web que genera `npm run docs` en tu equipo.
2. Rompe algo a propósito (por ejemplo, escribe `==` en lugar de `===` en `utilidades.js`), sube el cambio y comprueba que la ejecución sale en rojo en el paso que corresponde. Después, deshaz el cambio y comprueba que vuelve a verde.

Deja constancia en la sección «Integración continua (opcional)» del `README.md`: el enlace a la ejecución en verde y dos capturas en `img/`, una de la ejecución en verde con sus pasos y otra de la ejecución en rojo con el paso que falla.

## Al terminar

Cuando acabes la práctica, **borra su contenedor**. Si no, sigue en marcha ocupando memoria, y se acumula uno por cada ejercicio (UD1, tema 5, apartado 5.4.7). Tu trabajo no se borra: está en la carpeta del ejercicio.

1. Cierra la ventana de VS Code del ejercicio.
2. En una terminal de tu equipo (en Windows, PowerShell), borra todos los contenedores de Dev Containers. La orden solo toca los que ha creado VS Code, no otros contenedores que tengas:

   ```bash
   docker rm -f $(docker ps -aq --filter label=devcontainer.local_folder)
   ```

   Si no queda ninguno, Docker avisa de que le falta un argumento: puedes ignorarlo. También puedes borrarlos desde Docker Desktop, en la pestaña **Containers**.

La imagen que ha construido el `Dockerfile` tampoco se borra (se llama `vsc-` seguido del nombre de la carpeta), así que la próxima vez no hace falta construirla de nuevo. Si necesitas espacio, bórrala desde la pestaña **Images** de Docker Desktop o con `docker image rm <nombre>`.
