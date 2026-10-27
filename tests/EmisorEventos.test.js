// Tests UNITARIOS de EmisorEventos
import { describe, it, expect, vi } from 'vitest';
import { EmisorEventos } from '../src/EmisorEventos.js';

describe('EmisorEventos', () => {
  it('avisa a un oyente con los datos del evento', () => {
    const emisor = new EmisorEventos();
    const oyente = vi.fn();
    emisor.on('hola', oyente);
    emisor.emit('hola', { nombre: 'Ana' });
    expect(oyente).toHaveBeenCalledTimes(1);
    expect(oyente).toHaveBeenCalledWith({ nombre: 'Ana' });
  });

  it('avisa a los oyentes en el orden en que se suscribieron y devuelve cuántos son', () => {
    const emisor = new EmisorEventos();
    const orden = [];
    emisor.on('x', () => orden.push('primero'));
    emisor.on('x', () => orden.push('segundo'));
    expect(emisor.emit('x')).toBe(2);
    expect(orden).toEqual(['primero', 'segundo']);
  });

  it('no repite la misma función suscrita dos veces al mismo evento', () => {
    const emisor = new EmisorEventos();
    const oyente = vi.fn();
    emisor.on('x', oyente);
    emisor.on('x', oyente);
    expect(emisor.emit('x')).toBe(1);
    expect(oyente).toHaveBeenCalledTimes(1);
  });

  it('on devuelve una función que da de baja la suscripción', () => {
    const emisor = new EmisorEventos();
    const oyente = vi.fn();
    const baja = emisor.on('x', oyente);
    baja();
    expect(emisor.emit('x')).toBe(0);
    expect(oyente).not.toHaveBeenCalled();
  });

  it('dar de baja dos veces no falla', () => {
    const emisor = new EmisorEventos();
    const baja = emisor.on('x', () => {});
    baja();
    expect(() => baja()).not.toThrow();
  });

  it('emitir un evento sin oyentes avisa a 0', () => {
    expect(new EmisorEventos().emit('nadie')).toBe(0);
  });

  it('un oyente suscrito a un evento no recibe los de otro', () => {
    const emisor = new EmisorEventos();
    const oyente = vi.fn();
    emisor.on('a', oyente);
    emisor.emit('b');
    expect(oyente).not.toHaveBeenCalled();
  });

  it('lanza un TypeError si el oyente no es una función', () => {
    expect(() => new EmisorEventos().on('x', 'texto')).toThrow(TypeError);
    expect(() => new EmisorEventos().on('x', 'texto')).toThrow('El oyente debe ser una función');
  });

  it('un oyente puede darse de baja mientras se emite sin saltarse a los demás', () => {
    const emisor = new EmisorEventos();
    const llamadas = [];
    const baja = emisor.on('x', () => {
      llamadas.push('uno');
      baja();
    });
    emisor.on('x', () => llamadas.push('dos'));
    emisor.emit('x');
    emisor.emit('x');
    expect(llamadas).toEqual(['uno', 'dos', 'dos']);
  });
});
