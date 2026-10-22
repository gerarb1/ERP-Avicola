import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HYLINE, referenciaHyLine, edadSemanas, semanaAnteriorCompleta, fechaBolivia, centavos, moneda } from '../packages/shared/src/domain/hyline.ts';
test('100 semanas consecutivas con rangos válidos, sin extrapolar',()=>{
 assert.deepEqual(HYLINE.map(x=>x.semana),Array.from({length:100},(_,i)=>i+1));
 for(const r of HYLINE){assert.ok(r.aguaMax>=r.aguaMin);assert.ok(r.alimentoMax>=r.alimentoMin);if(r.semana<18)assert.equal(r.posturaMin,null);else assert.ok(r.posturaMin<=r.posturaMax);}
 assert.equal(referenciaHyLine(0),null);assert.equal(referenciaHyLine(101),null);
});
test('valores cotejados con pp 4–6: crianza, inicio, pico y final',()=>{
 assert.deepEqual(referenciaHyLine(1),{semana:1,posturaMin:null,posturaMax:null,aguaMin:24,aguaMax:33,alimentoMin:16,alimentoMax:17});
 assert.equal(referenciaHyLine(17).alimentoMax,82);
 assert.equal(referenciaHyLine(18).posturaMin,6.7);
 assert.equal(referenciaHyLine(20).posturaMax,55);
 assert.equal(referenciaHyLine(26).posturaMax,98.5);
 assert.equal(referenciaHyLine(28).aguaMin,165);
 assert.equal(referenciaHyLine(100).posturaMin,70.8);
 assert.equal(referenciaHyLine(100).posturaMax,77.6);
});
test('edad del lote cambia al completar siete días desde el ingreso',()=>{
 assert.equal(edadSemanas('2026-01-01',16,'2026-01-07'),16);
 assert.equal(edadSemanas('2026-01-01',16,'2026-01-08'),17);
});
test('semanas cerradas de lunes a domingo y día de Bolivia',()=>{
 assert.deepEqual(semanaAnteriorCompleta('2026-10-22'),{desde:'2026-10-12',hasta:'2026-10-18'});
 assert.deepEqual(semanaAnteriorCompleta('2026-10-19'),{desde:'2026-10-12',hasta:'2026-10-18'});
 assert.deepEqual(semanaAnteriorCompleta('2026-10-18'),{desde:'2026-10-05',hasta:'2026-10-11'});
 assert.equal(fechaBolivia(new Date('2026-10-22T02:00:00Z')),'2026-10-21');
});
test('moneda Bs y sumas en centavos',()=>{
 assert.equal(centavos('10.01')+centavos('0.09'),1010);
 assert.match(moneda(12.5),/^Bs /);
 assert.ok(!moneda(12.5).includes('$'));
});

test('fecha real de nacimiento conserva los días al avanzar la edad',()=>{
  // Llegaron el 12 de febrero con un día de nacidas: nacieron el 11.
  assert.equal(edadSemanas('2026-10-22',36,'2026-10-22','2026-02-11'),36);
  assert.equal(edadSemanas('2026-10-22',36,'2026-10-27','2026-02-11'),36);
  assert.equal(edadSemanas('2026-10-22',36,'2026-10-28','2026-02-11'),37);
  assert.equal(referenciaHyLine(edadSemanas('2026-10-22',36,'2026-10-22','2026-02-11')).posturaMin,92.5);
});
