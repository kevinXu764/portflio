from browser_runtime import Browser,TASK
import json,sys
b=Browser('collection-profile',2400,1440,1.5)
try:
    b.navigate('/task/collection.html','.montage')
    result=b.screenshot(TASK/'ui-collection.png')
    result['sources']='branch3 v0.4; all source Web viewport widths 1440 CSS px, DPR 2'
    (TASK/'collection-manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    if "--collection-only" in sys.argv: sys.exit(0)
    results=[]
    for width in [1440,390,320]:
        b.metrics(width,1000,1)
        for mode in ['full','avatar','compact']:
            b.navigate('/prototype/index.html#pet?id=chengxia')
            b.click('[data-pet-mode="'+mode+'"]')
            b.input('#pet-quick-input','今天有一点累，想和你说说话。')
            b.eval('document.querySelector("#pet-quick-form").dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))')
            value=b.eval('(()=>{const a=document.querySelector("#pet-speech").getBoundingClientRect(),p=document.querySelector(".pet-portrait-window").getBoundingClientRect();return {bubbleBottom:a.bottom,portraitTop:p.top,gap:p.top-a.bottom,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth}})()')
            value.update(mode=mode,passCheck=value['gap']>=8 and not value['overflow'])
            results.append(value)
    (TASK/'prototype-visual-fix-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'collectionBytes':result['bytes'],'bubbleChecks':len(results),'passed':sum(x['passCheck'] for x in results)}),flush=True)
finally:b.close()
