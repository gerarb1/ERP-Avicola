"""Integration against a fresh, disposable local database. See docs/OPERACION.md."""
import concurrent.futures
import datetime as dt
import json
import os
from pathlib import Path
import unittest
import urllib.error
import urllib.request
import uuid

BASE = os.environ.get('ERP_TEST_URL', 'http://127.0.0.1:8790/api')
if not BASE.startswith('http://127.0.0.1:8790/'):
    raise RuntimeError('Only the isolated local test API on port 8790 is accepted')
CREDS = [line.split('\t') for line in Path(os.environ['ERP_TEST_CREDENTIALS']).read_text().splitlines()]
TODAY = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=4)).date()
MON = TODAY - dt.timedelta(days=TODAY.weekday()+7)
SUN = MON + dt.timedelta(days=6)
DATE = MON.isoformat()

def request(path, role=None, data=None, expected=200, key=None, headers=None):
    h={'Content-Type':'application/json', **(headers or {})}
    if role: h['Authorization']='Bearer '+Flow.tokens[role]
    if data is not None: h['X-Idempotency-Key']=key or str(uuid.uuid4())
    req=urllib.request.Request(BASE+path, headers=h, data=json.dumps(data).encode() if data is not None else None)
    try:
        res=urllib.request.urlopen(req); status=res.status; body=json.load(res)
    except urllib.error.HTTPError as e:
        status=e.code; body=json.load(e)
    if status!=expected: raise AssertionError(f'{path}: expected {expected}, got {status}: {body}')
    return body.get('data',body)

class Flow(unittest.TestCase):
    tokens={}
    @classmethod
    def setUpClass(cls):
        for email,password,role in CREDS:
            cls.tokens[role]=request('/auth/login',data={'email':email,'password':password})['token']
        cls.lote=request('/galpones','administrador')[0]

    def test_01_authentication_and_roles(self):
        request('/auth/login',data={'email':CREDS[0][0],'password':'incorrecta'},expected=401)
        request('/caja',expected=401,headers={'X-User-Id':self.lote['id'],'X-User-Role':'administrador'})
        for endpoint,role in [('/analisis','encargado_galpon'),('/ventas','encargado_galpon'),('/produccion','encargado_almacen'),('/inventario','encargado_galpon')]:
            request(endpoint,role,expected=403)
        request('/caja','encargado_galpon',{'fecha':DATE,'tipo':'INGRESO','monto':1,'descripcion':'No permitido'},expected=403)

    def test_02_supplies_and_money(self):
        request('/caja','administrador',{'fecha':DATE,'tipo':'INGRESO','monto':2000,'descripcion':'Fondo de caja'})
        Flow.feed=request('/insumos','encargado_almacen',{'nombre':'Alimento pico de prueba','tipo':'ALIMENTO','unidad':'kg','kgBolsa':44})
        request('/insumos/movimientos','encargado_almacen',{'insumoId':self.feed['id'],'fecha':DATE,'tipo':'ENTRADA','cantidad':880,'costoTotal':800,'motivo':'20 bolsas a Bs 40','pagarCaja':True})
        request('/insumos/movimientos','encargado_almacen',{'insumoId':self.feed['id'],'fecha':DATE,'tipo':'SALIDA','cantidad':881,'motivo':'Excede stock'},expected=400)
        request('/caja','encargado_galpon',{'fecha':DATE,'tipo':'EGRESO','monto':0,'descripcion':'Cero'},expected=422)
        request('/caja','encargado_galpon',{'fecha':DATE,'tipo':'EGRESO','monto':1.001,'descripcion':'Tres decimales'},expected=422)

    def test_03_production_census_and_retries(self):
        date=(MON+dt.timedelta(days=1)).isoformat()
        d={'loteId':self.lote['id'],'fecha':date,'huevosSanos':1000,'huevosRotos':10,'kgAlimento':100,'aguaL':250,'insumoId':self.feed['id'],'tipoAlimento':'Pico'}
        key=str(uuid.uuid4());Flow.prod=request('/produccion','encargado_galpon',d,key=key)
        again=request('/produccion','encargado_galpon',d,key=key)
        self.assertEqual(again['id'],self.prod['id'])
        request('/produccion','encargado_galpon',{**d,'huevosSanos':999},key=key,expected=409)
        request('/produccion','encargado_galpon',d,expected=409)
        request('/mortalidad','encargado_galpon',{'loteId':self.lote['id'],'fecha':date,'cantidad':5,'causa':'Registro de bajas'})
        p=next(p for p in request('/produccion','administrador') if p['id']==self.prod['id'])
        self.assertEqual(p['avesVivas'],self.lote['avesActuales']-5)
        self.assertAlmostEqual(float(p['pctPostura']),1010/p['avesVivas']*100,places=2)
        self.assertEqual(float(next(i for i in request('/insumos','administrador')['insumos'] if i['id']==self.feed['id'])['stock']),780)
        request('/mortalidad','encargado_galpon',{'loteId':self.lote['id'],'fecha':date,'cantidad':99999,'causa':'Excede censo'},expected=400)

    def test_04_classification_and_broken_eggs(self):
        d={'produccionId':self.prod['id'],'fecha':self.prod['fecha'],'tallaId':'M','unidades':1001}
        request('/inventario/clasificar','encargado_almacen',d,expected=400)
        request('/inventario/clasificar','encargado_almacen',{**d,'unidades':1000})
        request('/inventario/clasificar','encargado_almacen',{**d,'unidades':1},expected=400)
        request('/inventario/merma','encargado_almacen',{'fecha':self.prod['fecha'],'tallaId':'M','unidades':7,'motivo':'Rotura en almacén'})
        stock=next(i for i in request('/inventario','administrador')['stock'] if i['tallaId']=='M')
        self.assertEqual(stock['maplesDisponibles']*30+stock['huevosSueltos'],993)

    def test_05_remission_dispatch_and_partial_payment(self):
        Flow.cliente=request('/clientes','encargado_almacen',{'nombre':'Puesto de prueba','direccion':'Mercado'})
        data={'clienteId':self.cliente['id'],'fecha':self.prod['fecha'],'destino':'Mercado de prueba','pagado':100,'items':[{'tallaId':'M','cajas':1,'maples':2,'sueltos':3,'precioMaple':30}]}
        Flow.nota=request('/ventas','encargado_almacen',data)
        self.assertEqual(float(self.nota['total']),423)
        self.assertEqual(self.nota['estado'],'PARCIAL')
        stock=next(i for i in request('/inventario','administrador')['stock'] if i['tallaId']=='M')
        self.assertEqual(stock['maplesDisponibles']*30+stock['huevosSueltos'],570)
        # Two equal lines must validate cumulatively and roll back the entire dispatch.
        request('/ventas','encargado_almacen',{**data,'pagado':0,'items':[{'tallaId':'M','cajas':1,'maples':0,'sueltos':0,'precioMaple':30}]*2},expected=400)
        self.assertEqual(len(request('/ventas','administrador')['notas']),1)
        request('/pagos','encargado_almacen',{'notaId':self.nota['id'],'monto':324,'fecha':self.prod['fecha']},expected=400)
        request('/pagos','encargado_almacen',{'notaId':self.nota['id'],'monto':323,'fecha':self.prod['fecha'],'notas':'Saldo cancelado'})
        ventas=request('/ventas','administrador');self.assertEqual(ventas['notas'][0]['estado'],'PAGADA');self.assertEqual(ventas['notas'][0]['pagado'],423)
        self.assertEqual(float(ventas['clientes'][0]['saldoPendiente']),0)
        self.assertEqual(len(ventas['pagos']),2)

    def test_06_concurrent_stock_and_idempotency(self):
        d={'fecha':self.prod['fecha'],'tallaId':'M','unidades':400,'motivo':'Merma concurrente'}
        def run(_):
            try:request('/inventario/merma','encargado_almacen',d);return 'ok'
            except AssertionError as e:
                if 'got 400' in str(e):return 'insuficiente'
                raise
        with concurrent.futures.ThreadPoolExecutor(2) as pool: results=list(pool.map(run,range(2)))
        self.assertCountEqual(results,['ok','insuficiente'])
        d={'fecha':DATE,'tipo':'EGRESO','monto':10,'descripcion':'Gasto reintentado'};key=str(uuid.uuid4())
        with concurrent.futures.ThreadPoolExecutor(2) as pool: results=list(pool.map(lambda _:request('/caja','encargado_galpon',d,key=key),range(2)))
        self.assertEqual(results[0]['id'],results[1]['id'])

    def test_07_events_notifications_and_data_quality(self):
        request('/sucesos','encargado_galpon',{'loteId':self.lote['id'],'fecha':DATE,'tipo':'VACUNA','producto':'Producto de prueba','dosis':'Según responsable veterinario','descripcion':'Aplicación registrada','proximaFecha':DATE})
        notifications=request('/notificaciones','administrador')
        self.assertTrue(any('incompleto' in n['texto'] for n in notifications))
        n=notifications[0];request('/notificaciones/leer','administrador',{'id':n['id']})
        self.assertTrue(request('/notificaciones','administrador')[0]['leida'])
        self.assertFalse(request('/notificaciones','encargado_galpon')[0]['leida'])
        analysis=request('/analisis','administrador');l=next(l for l in analysis['lotes'] if l['id']==self.lote['id'])
        self.assertEqual(l['actual']['dias'],1);self.assertEqual(l['previo']['postura'],None)
        self.assertEqual(l['avesActuales'],self.lote['avesActuales']-5)

    def test_075_complete_week_comparison_and_date_validation(self):
        other=next(l for l in request('/galpones','administrador') if l['id']!=self.lote['id'])
        for day in range(14):
            recent=day>=7
            d={'loteId':other['id'],'fecha':(MON-dt.timedelta(days=7)+dt.timedelta(days=day)).isoformat(),
               'huevosSanos':1200 if recent else 1000,'huevosRotos':0,'kgAlimento':11 if recent else 10,
               'aguaL':120 if recent else 100,'insumoId':self.feed['id'],'tipoAlimento':'Pico'}
            request('/produccion','encargado_galpon',d)
        analysis=request('/analisis','administrador');l=next(l for l in analysis['lotes'] if l['id']==other['id'])
        self.assertEqual(l['actual']['dias'],7);self.assertEqual(l['previo']['dias'],7)
        self.assertAlmostEqual(l['actual']['postura']-l['previo']['postura'],200/other['avesActuales']*100)
        notification=next(n for n in request('/notificaciones','administrador') if other['id'] in n['id'])
        self.assertIn('puntos frente a la semana anterior',notification['texto'])
        request('/caja','administrador',{'fecha':'2026-02-30','tipo':'INGRESO','monto':1,'descripcion':'Fecha inválida'},expected=422)
        request('/caja','administrador',{'fecha':(TODAY+dt.timedelta(days=1)).isoformat(),'tipo':'INGRESO','monto':1,'descripcion':'Fecha futura'},expected=422)

    def test_08_cash_history_and_closure(self):
        request('/caja','encargado_galpon',{'fecha':DATE,'tipo':'EGRESO','monto':20.25,'descripcion':'Transporte de insumos'})
        cash=request('/caja','administrador');self.assertAlmostEqual(cash['saldo'],1592.75)
        mine=request('/caja','encargado_galpon');self.assertEqual(len(mine['movimientos']),2);self.assertIsNone(mine['saldo'])
        self.assertEqual(len([m for m in cash['movimientos'] if m['tipo']=='INGRESO']),3)
        d={'fechaInicio':DATE,'fechaFin':SUN.isoformat(),'saldoReal':1592.75}
        request('/arqueos','encargado_galpon',d,expected=403)
        request('/arqueos','administrador',{**d,'saldoReal':1500},expected=400)
        arqueo=request('/arqueos','administrador',d);self.assertEqual(float(arqueo['diferencia']),0)
        request('/arqueos','administrador',d,expected=409)
        request('/caja','administrador',{'fecha':DATE,'tipo':'EGRESO','monto':1,'descripcion':'Retroactivo'},expected=409)
        request('/caja','administrador',{'fecha':TODAY.isoformat(),'tipo':'EGRESO','monto':1,'descripcion':'Corrección en período abierto'})

    def test_09_session_revocation(self):
        request('/auth/logout','encargado_almacen',{})
        request('/inventario','encargado_almacen',expected=401)

    def test_10_recollection_without_daily_consumption(self):
        before=request('/insumos','administrador')['insumos']
        d={'loteId':self.lote['id'],'fecha':TODAY.isoformat(),'huevosSanos':900,'huevosRotos':5}
        p=request('/produccion','encargado_galpon',d)
        self.assertIsNone(p['kgAlimento']);self.assertIsNone(p['aguaL'])
        self.assertGreater(float(p['kgPlanificado']),0);self.assertGreater(float(p['aguaPlanificadaL']),0)
        self.assertEqual(before,request('/insumos','administrador')['insumos'])
        # Packages convert to 360 eggs per box, 30 per maple, plus loose eggs.
        request('/inventario/clasificar','administrador',{'produccionId':p['id'],'fecha':p['fecha'],'tallaId':'G','cajas':2,'maples':3,'sueltos':4})
        stock=next(r for r in request('/inventario','administrador')['stock'] if r['tallaId']=='G')
        self.assertEqual(stock['maplesDisponibles']*30+stock['huevosSueltos'],814)
        request('/inventario/clasificar','administrador',{'produccionId':p['id'],'fecha':p['fecha'],'tallaId':'G','cajas':1,'unidades':1},expected=422)
        request('/inventario/clasificar','administrador',{'produccionId':p['id'],'fecha':p['fecha'],'tallaId':'G','cajas':1},expected=400)

    def test_11_accounts_recovery_and_forced_password_change(self):
        email='cuenta-real-test@example.com'
        account=request('/cuentas','administrador',{'nombre':'Persona de prueba','email':email,'rol':'encargado_galpon'})
        request('/cuentas','encargado_galpon',expected=403)
        request('/granja','encargado_galpon',expected=403)
        request('/cuentas','administrador',{'nombre':'Duplicada','email':email,'rol':'administrador'},expected=409)
        def login(password):
            data=request('/auth/login',data={'email':email,'password':password})
            Flow.tokens['nuevo']=data['token'];return data
        self.assertTrue(login(account['password'])['cambiarPassword'])
        request('/galpones','nuevo',expected=403)
        self.assertTrue(request('/auth/me','nuevo')['cambiarPassword'])
        password='Mi-clave-nueva-2026!'
        result=request('/auth/password','nuevo',{'actual':account['password'],'password':password})
        request('/galpones','nuevo',expected=401)
        self.assertFalse(login(password)['cambiarPassword'])
        request('/galpones','nuevo')
        request('/auth/codigo-respaldo','nuevo',{'password':'erronea'},expected=400)
        code=request('/auth/codigo-respaldo','nuevo',{'password':password})['codigo']
        request('/auth/recuperar',data={'email':email,'codigo':result['codigo'],'password':'Otra-clave-nueva-2026!'},expected=401)
        request('/auth/recuperar',data={'email':email,'codigo':code,'password':'Otra-clave-nueva-2026!'})
        request('/galpones','nuevo',expected=401)
        request('/auth/recuperar',data={'email':email,'codigo':code,'password':password},expected=401)
        login('Otra-clave-nueva-2026!')
        reset=request('/cuentas/'+account['id']+'/restablecer','administrador',{})
        request('/galpones','nuevo',expected=401)
        self.assertTrue(login(reset['password'])['cambiarPassword'])
        request('/cuentas/'+account['id']+'/estado','administrador',{'activo':False})
        request('/auth/login',data={'email':email,'password':reset['password']},expected=401)
        request('/cuentas/'+account['id']+'/estado','administrador',{'activo':True})
        self.assertTrue(login(reset['password'])['cambiarPassword'])
        admin_id=next(u['id'] for u in request('/cuentas','administrador') if u['rol']=='administrador')
        request('/cuentas/'+admin_id+'/estado','administrador',{'activo':False},expected=400)

    def test_115_initial_real_warehouse_stock(self):
        d={'fecha':TODAY.isoformat(),'tallaId':'XXG','cajas':2,'maples':1,'sueltos':3}
        request('/inventario/inicial','encargado_galpon',d,expected=403)
        result=request('/inventario/inicial','administrador',d)
        self.assertEqual(result['inicial'],753)
        request('/inventario/inicial','administrador',d,expected=409)
        stock=next(r for r in request('/inventario','administrador')['stock'] if r['tallaId']=='XXG')
        self.assertEqual(stock['maplesDisponibles']*30+stock['huevosSueltos'],753)

    def test_12_production_configuration_preserves_history(self):
        before=request('/granja','administrador');history=len(request('/produccion','administrador'))
        g=next(g for g in before['galpones'] if g['capacidad']==2500)
        d={'galponId':g['id'],'aves':2500}
        request('/granja/iniciar','administrador',d,expected=409)
        key=str(uuid.uuid4());new=request('/granja/iniciar','administrador',{**d,'sustituirLotes':True},key=key)
        self.assertEqual(request('/granja/iniciar','administrador',{**d,'sustituirLotes':True},key=key)['id'],new['id'])
        active=request('/galpones','administrador');self.assertEqual(len(active),1)
        self.assertEqual(active[0]['avesActuales'],2500);self.assertIsNone(active[0]['edad']);self.assertIsNone(active[0]['referencia'])
        self.assertEqual(len(request('/produccion','administrador')),history)
        config=request('/granja','administrador');self.assertEqual(len(config['galpones']),2)
        self.assertEqual(len([x for x in config['galpones'] if x['activo']]),1)
        p=request('/produccion','administrador',{'loteId':new['id'],'fecha':TODAY.isoformat(),'huevosSanos':0,'huevosRotos':0})
        self.assertIsNone(p['kgPlanificado']);self.assertIsNone(p['aguaPlanificadaL'])
        request('/granja/lotes/'+new['id'],'administrador',{'edadSemanasIngreso':26,'racionG':115})
        active=request('/galpones','administrador');self.assertEqual(active[0]['edad'],26)
        self.assertEqual(active[0]['referencia']['posturaMax'],98.5)
        self.assertEqual(active[0]['racionG'],115)

    def test_13_exact_birth_and_arrival_dates(self):
        l=request('/galpones','administrador')[0]
        result=request('/granja/lotes/'+l['id'],'administrador',{'fechaNacimiento':'2026-02-11','fechaLlegada':'2026-02-12'})
        self.assertEqual(result['fechaNacimiento'],'2026-02-11');self.assertEqual(result['fechaLlegada'],'2026-02-12')
        expected=(TODAY-dt.date(2026,2,11)).days//7
        self.assertEqual(request('/galpones','administrador')[0]['edad'],expected)
        request('/granja/lotes/'+l['id'],'administrador',{'fechaLlegada':'2026-02-10'},expected=400)
        request('/granja/lotes/'+l['id'],'administrador',{'fechaNacimiento':'2026-02-30'},expected=422)
        request('/granja/lotes/'+l['id'],'administrador',{'edadSemanasIngreso':expected+4},expected=400)

if __name__=='__main__':unittest.main(verbosity=2)
