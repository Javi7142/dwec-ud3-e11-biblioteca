/**
 * Sesión de depuración reproducible: arranca `src/main.js` con el depurador de Node.js, pone un
 * punto de ruptura condicional en `Biblioteca.devolver` y muestra lo que mostraría VS Code:
 * la pila de llamadas y el panel «Ámbito» (variables locales, `this`, campos privados y closure).
 *
 * Uso: `node scripts/depurar.js`
 * @module scripts/depurar
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PUERTO = 9230;
const ARCHIVO = 'src/Biblioteca.js';
// Línea (1-based) del punto de ruptura: la que calcula la multa dentro de devolver()
const LINEA =
  readFileSync(ARCHIVO, 'utf8')
    .split('\n')
    .findIndex((linea) => linea.includes('const multa = redondear(')) + 1;
// El ISBN de «El hobbit»: la devolución de Ana con 37 días de retraso (multa limitada a 5 €)
const CONDICION = "isbn === '9788445077528'";

const hijo = spawn('node', [`--inspect-brk=127.0.0.1:${PUERTO}`, 'src/main.js'], {
  stdio: ['ignore', 'ignore', 'ignore'],
});

/** Espera a que el depurador del proceso hijo esté escuchando y devuelve su URL de WebSocket. */
async function obtenerUrl() {
  for (let intento = 0; intento < 50; intento++) {
    try {
      const respuesta = await fetch(`http://127.0.0.1:${PUERTO}/json`);
      return (await respuesta.json())[0].webSocketDebuggerUrl;
    } catch {
      await new Promise((resolver) => setTimeout(resolver, 100));
    }
  }
  throw new Error('No se pudo conectar con el depurador');
}

const ws = new WebSocket(await obtenerUrl());
await new Promise((resolver) => ws.addEventListener('open', resolver));

let siguienteId = 0;
const pendientes = new Map();
const alPausar = [];
const ficheros = new Map(); // scriptId → URL del fichero

ws.addEventListener('message', ({ data }) => {
  const mensaje = JSON.parse(data);
  if (mensaje.id !== undefined) {
    pendientes.get(mensaje.id)?.(mensaje.result);
  } else if (mensaje.method === 'Debugger.scriptParsed') {
    ficheros.set(mensaje.params.scriptId, mensaje.params.url);
  } else if (mensaje.method === 'Debugger.paused') {
    alPausar.forEach((funcion) => funcion(mensaje.params));
  }
});

/** Envía un comando del protocolo del depurador y espera su respuesta. */
function enviar(metodo, parametros = {}) {
  const id = ++siguienteId;
  return new Promise((resolver) => {
    pendientes.set(id, resolver);
    ws.send(JSON.stringify({ id, method: metodo, params: parametros }));
  });
}

/** Texto corto (una sola línea) de un valor del depurador. */
const mostrar = (valor) =>
  (valor.type === 'object' || valor.type === 'function'
    ? (valor.description ?? valor.className)
    : String(valor.value ?? valor.description ?? valor.type)
  ).split('\n')[0];

/** Escribe las propiedades (y los campos privados) de un objeto remoto. */
async function volcar(objectId, sangria) {
  const { result = [], privateProperties = [] } = await enviar('Runtime.getProperties', {
    objectId,
    ownProperties: true,
  });
  result
    .filter((propiedad) => propiedad.value && !propiedad.name.startsWith('__'))
    .forEach((propiedad) =>
      console.log(`${sangria}${propiedad.name}: ${mostrar(propiedad.value)}`),
    );
  privateProperties.forEach((propiedad) =>
    console.log(`${sangria}${propiedad.name} (privado): ${mostrar(propiedad.value)}`),
  );
}

alPausar.push(async ({ callFrames, hitBreakpoints }) => {
  // La primera pausa es la de --inspect-brk, al arrancar: se reanuda hasta llegar al punto de ruptura
  if (hitBreakpoints.length === 0) {
    await enviar('Debugger.resume');
    return;
  }
  console.log(`⏸️  Pausa en ${ARCHIVO}:${LINEA} con la condición ${CONDICION}\n`);

  console.log('📚 Pila de llamadas:');
  callFrames.forEach((marco, i) => {
    const { location } = marco;
    const url = ficheros.get(location.scriptId) ?? '';
    const fichero = url.split('/').slice(-2).join('/');
    console.log(
      `  ${i}. ${marco.functionName || '(anónima)'}  ${fichero}:${location.lineNumber + 1}`,
    );
  });

  console.log('\n🔭 Ámbito del marco superior:');
  const [marco] = callFrames;
  for (const ambito of marco.scopeChain.filter((a) => a.type !== 'global')) {
    console.log(`  ▸ ${ambito.type}${ambito.name ? ` (${ambito.name})` : ''}`);
    await volcar(ambito.object.objectId, '      ');
  }
  console.log('  ▸ this');
  await volcar(marco.this.objectId, '      ');

  console.log('\n🧪 Expresiones evaluadas en este marco:');
  for (const expresion of [
    'dia - prestamo.diaLimite',
    'diasRetraso',
    'prestamo.socio.politica.multa(diasRetraso)',
    'multa',
  ]) {
    const { result } = await enviar('Debugger.evaluateOnCallFrame', {
      callFrameId: marco.callFrameId,
      expression: expresion,
    });
    console.log(`  ${expresion} → ${result ? mostrar(result) : '(error)'}`);
  }

  hijo.kill();
  ws.close();
});

await enviar('Debugger.enable');
await enviar('Runtime.enable');
await enviar('Debugger.setBreakpointByUrl', {
  lineNumber: LINEA - 1,
  urlRegex: 'Biblioteca\\.js$',
  condition: CONDICION,
});
await enviar('Runtime.runIfWaitingForDebugger');
