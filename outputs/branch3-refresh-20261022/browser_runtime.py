"""Task-scoped Windows Chrome capture helper. Uses only Python stdlib and CDP."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen
import base64, hashlib, json, os, socket, struct, subprocess, time

EXP = Path(r'C:\Users\Administrator\Desktop\徐自泉文件\学习文件\exp')
PROTOTYPE = EXP / 'ptf_old' / '桌崽AI' / 'branch3'
PORTFOLIO = EXP / 'card'
TASK = PORTFOLIO / 'outputs' / 'branch3-refresh-20261022'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
    def translate_path(self, path):
        p = unquote(urlsplit(path).path)
        for prefix, root in [('/prototype/', PROTOTYPE), ('/portfolio/', PORTFOLIO), ('/task/', TASK)]:
            if p.startswith(prefix):
                target = (root / p[len(prefix):]).resolve()
                if target.is_relative_to(root.resolve()): return str(target)
        return str(TASK / '__not_found__')

class SocketCDP:
    def __init__(self, url):
        p = urlsplit(url)
        self.sock = socket.create_connection((p.hostname, p.port), 15)
        self.sock.settimeout(30)
        key = base64.b64encode(os.urandom(16)).decode()
        self.sock.sendall((f'GET {p.path} HTTP/1.1\r\nHost: {p.hostname}:{p.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode())
        data = b''
        while b'\r\n\r\n' not in data: data += self.sock.recv(4096)
        header, self.buffer = data.split(b'\r\n\r\n', 1)
        if b'101' not in header.split(b'\r\n')[0]: raise RuntimeError(header.decode())
        self.serial = 0
        self.errors = []
    def read(self, n):
        while len(self.buffer) < n:
            chunk = self.sock.recv(max(4096, n-len(self.buffer)))
            if not chunk: raise EOFError('Chrome websocket closed')
            self.buffer += chunk
        data, self.buffer = self.buffer[:n], self.buffer[n:]
        return data
    def send(self, data, opcode=1):
        data = data.encode() if isinstance(data, str) else data
        n = len(data); mask = os.urandom(4)
        length = bytes([n|128]) if n < 126 else bytes([126|128])+struct.pack('!H',n) if n < 65536 else bytes([127|128])+struct.pack('!Q',n)
        self.sock.sendall(bytes([128|opcode])+length+mask+bytes(b^mask[i%4] for i,b in enumerate(data)))
    def receive(self):
        parts = []
        while True:
            a,b = self.read(2); n=b&127
            if n==126: n=struct.unpack('!H',self.read(2))[0]
            elif n==127: n=struct.unpack('!Q',self.read(8))[0]
            mask=self.read(4) if b&128 else None
            data=self.read(n)
            if mask: data=bytes(v^mask[i%4] for i,v in enumerate(data))
            opcode=a&15
            if opcode==8: raise EOFError('Chrome websocket close frame')
            if opcode==9: self.send(data,10); continue
            if opcode==10: continue
            parts.append(data)
            if a&128: return json.loads(b''.join(parts))
    def call(self, method, **params):
        self.serial+=1; current=self.serial
        self.send(json.dumps({'id':current,'method':method,'params':params},ensure_ascii=False))
        while True:
            data=self.receive()
            if data.get('method')=='Runtime.exceptionThrown': self.errors.append(data['params'])
            if data.get('id')==current:
                if 'error' in data: raise RuntimeError(data['error'])
                return data.get('result',{})

class Browser:
    def __init__(self, profile='capture-profile', width=1440, height=1000, dpr=2):
        TASK.mkdir(parents=True, exist_ok=True)
        self.server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
        Thread(target=self.server.serve_forever,daemon=True).start()
        self.base=f'http://127.0.0.1:{self.server.server_port}'
        self.profile=TASK/profile
        self.profile.mkdir(exist_ok=True)
        active=self.profile/'DevToolsActivePort'
        active.unlink(missing_ok=True)
        self.log=(TASK/(profile+'.log')).open('wb')
        self.process=subprocess.Popen([CHROME,'--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--hide-scrollbars','--remote-debugging-port=0','--user-data-dir='+str(self.profile),'about:blank'],stdout=self.log,stderr=self.log)
        deadline=time.monotonic()+20
        while not active.exists():
            if time.monotonic()>deadline: raise TimeoutError('Chrome debugging port not created')
            time.sleep(.05)
        port=int(active.read_text().splitlines()[0])
        targets=json.load(urlopen(f'http://127.0.0.1:{port}/json/list'))
        target=next(x for x in targets if x['type']=='page')
        self.cdp=SocketCDP(target['webSocketDebuggerUrl'])
        self.cdp.call('Page.enable'); self.cdp.call('Runtime.enable')
        self.metrics(width,height,dpr)
    def metrics(self,width,height,dpr=1):
        self.width,self.height,self.dpr=width,height,dpr
        self.cdp.call('Emulation.setDeviceMetricsOverride',width=width,height=height,deviceScaleFactor=dpr,mobile=False)
    def eval(self,expression):
        r=self.cdp.call('Runtime.evaluate',expression=expression,returnByValue=True,awaitPromise=True)
        if 'exceptionDetails' in r: raise RuntimeError(r['exceptionDetails'])
        return r.get('result',{}).get('value')
    def wait(self,expression,timeout=12):
        end=time.monotonic()+timeout
        while time.monotonic()<end:
            try:
                result=self.eval(expression)
                if result: return result
            except RuntimeError: pass
            time.sleep(.06)
        raise TimeoutError(expression)
    def navigate(self,path,selector='#main'):
        self.cdp.call('Page.navigate',url=self.base+path)
        self.wait("document.readyState==='complete'&&!!document.querySelector("+json.dumps(selector)+")")
        self.wait("[...document.querySelectorAll('img')].filter(i=>{const r=i.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}).every(i=>i.complete&&i.naturalWidth>0)")
        self.paint()
    def paint(self):
        self.eval('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
    def click(self,selector):
        self.eval('document.querySelector('+json.dumps(selector)+').click()')
        self.paint()
    def input(self,selector,value,event='input'):
        self.eval('(()=>{const e=document.querySelector('+json.dumps(selector)+');e.value='+json.dumps(value,ensure_ascii=False)+';e.dispatchEvent(new Event('+json.dumps(event)+',{bubbles:true}));})()')
    def geometry(self,selectors,pad=0):
        return self.eval('''(()=>{const list=SELECTORS.flatMap(s=>[...document.querySelectorAll(s)]).filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&!e.hidden});if(!list.length)throw Error('No crop target');const rs=list.map(e=>e.getBoundingClientRect());const x=Math.max(0,Math.min(...rs.map(r=>r.left))+scrollX-PAD),y=Math.max(0,Math.min(...rs.map(r=>r.top))+scrollY-PAD);return {x,y,width:Math.min(innerWidth-x,Math.max(...rs.map(r=>r.right))+scrollX+PAD-x),height:Math.max(...rs.map(r=>r.bottom))+scrollY+PAD-y,scale:1};})()'''.replace('SELECTORS',json.dumps(selectors)).replace('PAD',str(pad)))
    def screenshot(self,path,selectors=None,pad=0,full=False,right_trim=0):
        if selectors:
            clip=self.geometry(selectors,pad)
        else:
            metrics=self.cdp.call('Page.getLayoutMetrics')
            size=metrics.get('cssContentSize',metrics['contentSize'])
            clip={'x':0,'y':0,'width':self.width,'height':size['height'] if full else self.height,'scale':1}
        clip['width']-=right_trim
        result=self.cdp.call('Page.captureScreenshot',format='png',captureBeyondViewport=True,fromSurface=True,clip=clip)
        data=base64.b64decode(result['data']);Path(path).write_bytes(data)
        return {'clip':clip,'viewport':{'width':self.width,'height':self.height,'dpr':self.dpr},'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
    def close(self):
        try: self.cdp.call('Browser.close')
        except Exception: pass
        try: self.process.wait(timeout=10)
        except subprocess.TimeoutExpired: self.process.terminate();self.process.wait(timeout=5)
        self.cdp.sock.close();self.server.shutdown();self.log.close()
