from browser_runtime import Browser,TASK
import json
path=TASK/'capture-manifest.json'
records=json.loads(path.read_text(encoding='utf-8'))
b=Browser('patch-capture-profile')
def snap(name,selectors,pad=12,right_trim=0):
    r=b.screenshot(TASK/'raw-captures'/(name+'.png'),selectors,pad,right_trim=right_trim)
    r.update(name=name,url=b.eval('location.hash'),source='branch3 v0.4',title=b.eval('document.title'))
    for i,old in enumerate(records):
        if old['name']==name:records[i]=r;break
    path.write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
try:
    b.navigate('/prototype/index.html#pet?id=chengxia')
    b.input('#pet-quick-input','今天有一点累，想和你说说话。')
    b.eval('document.querySelector("#pet-quick-form").dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))')
    b.click('[data-action="pause-pet"]');b.click('[data-action="hide-pet-controller"]')
    result=b.eval('(()=>{const a=document.querySelector("#pet-speech").getBoundingClientRect(),r=document.querySelector("#restore-pet-controller").getBoundingClientRect();return {noOverlap:r.bottom<a.top||r.right<a.left||r.left>a.right||r.top>a.bottom,restoreInTitle:!!document.querySelector(".desktop-titlebar #restore-pet-controller")}})()')
    assert result['noOverlap'] and result['restoreInTitle'],result
    snap('pet-hidden',['.desktop-window'])
    b.navigate('/prototype/index.html#call?id=chengxia')
    snap('call-connecting',['.phone-float'],28,8)
    b.wait("document.querySelector('#call-clock').textContent.includes('已接通')")
    b.click('[data-action="hangup"]');snap('call-ended',['.phone-float'],28,8)
    (TASK/'capture-patch-results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps({'captures':3,'hiddenRestore':result}),flush=True)
finally:b.close()
