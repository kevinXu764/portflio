from browser_runtime import Browser,TASK
import json,time

out=TASK/'site-review';out.mkdir(exist_ok=True)
b=Browser('portfolio-review-profile',1440,1100,1)
b.cdp.call('Emulation.setEmulatedMedia',features=[{'name':'prefers-reduced-motion','value':'reduce'}])
tests=[];shots=[]
def check(name,value,detail=None):
    tests.append({'name':name,'pass':bool(value),**({'detail':detail} if detail is not None else {})})
def visible_images():
    return b.eval("(()=>{const v=document.querySelector('#detail-view').getBoundingClientRect();return [...document.querySelectorAll('#zhuozai-case img')].filter(i=>{const r=i.getBoundingClientRect();return r.width&&r.height&&r.bottom>Math.max(0,v.top)&&r.top<Math.min(innerHeight,v.bottom)}).every(i=>i.complete&&i.naturalWidth>0)})()")
def settle():
    b.wait("(()=>{const v=document.querySelector('#detail-view').getBoundingClientRect();return [...document.querySelectorAll('#zhuozai-case img')].filter(i=>{const r=i.getBoundingClientRect();return r.width&&r.height&&r.bottom>Math.max(0,v.top)&&r.top<Math.min(innerHeight,v.bottom)}).every(i=>i.complete&&i.naturalWidth>0)})()")
    time.sleep(.3);b.paint()
def shot(name):
    settle();r=b.screenshot(out/(name+'.png'));shots.append({'name':name,**r})
def scroll_to(selector):
    b.eval('(()=>{const e=document.querySelector('+json.dumps(selector)+'),s=document.querySelector("#detail-view");const r=e.getBoundingClientRect(),v=s.getBoundingClientRect();s.scrollTop+=r.top-v.top-156;})()')
    settle()
def key(value,code=None):
    b.cdp.call('Input.dispatchKeyEvent',type='keyDown',key=value,code=code or value)
    b.cdp.call('Input.dispatchKeyEvent',type='keyUp',key=value,code=code or value)
    b.paint()
def image_diagnostics():
    return b.eval('''(()=>{const s=document.querySelector('#detail-view'),r=document.querySelector('#zhuozai-case');return {overflow:s.scrollWidth>s.clientWidth+1,bodyOverflow:document.documentElement.scrollWidth>innerWidth+1,images:[...r.querySelectorAll('img')].map(i=>{const a=i.getBoundingClientRect(),c=i.closest('.zz-media-viewport')?.getBoundingClientRect(),style=getComputedStyle(i);return {src:i.dataset.fullSrc||i.src,loaded:i.complete&&i.naturalWidth>0,width:a.width,height:a.height,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,clipped:!!c&&a.width>c.width+2,position:style.position,fit:style.objectFit}})}})()''')
try:
    b.navigate('/portfolio/index.html#zhuozai-ai','#zhuozai-case:not([hidden]) h1')
    b.wait("!document.querySelector('#detail-view').hidden&&!document.querySelector('#page-transition').classList.contains('is-active')")
    check('作品一路由载入',b.eval("location.hash==='#zhuozai-ai'&&document.querySelector('#zhuozai-case h1').textContent.includes('桌崽')"))
    check('仍为7张作品卡',b.eval("document.querySelectorAll('.project-card[data-card]').length===7"))
    check('作品一仍为7章',b.eval("document.querySelectorAll('#zhuozai-case .zz-toc button').length===7&&document.querySelectorAll('#zhuozai-case>.zz-case>.zz-section').length===7"))
    shot('1440-cover')
    scroll_to('.zz-ui-collection');shot('1440-collection')
    chapters=['context','meet','chat','call','memory','pet','theater']
    for width in [1440,1024,390]:
        b.metrics(width,1100,1)
        b.paint()
        for chapter in chapters:
            b.click('.zz-toc [data-case-jump="zz-'+chapter+'"]');settle()
            data=image_diagnostics()
            check(str(width)+' '+chapter+' 无横向溢出',not data['overflow'] and not data['bodyOverflow'])
            check(str(width)+' '+chapter+' 可见图片已加载',visible_images())
            check(str(width)+' '+chapter+' 章节高亮正确',b.eval('document.querySelector(".zz-toc button.is-active")?.dataset.caseJump==='+json.dumps('zz-'+chapter)))
            check(str(width)+' '+chapter+' 无旧图坐标硬裁切',all(not i['clipped'] and i['position']!='absolute' for i in data['images'] if i['width']>0))
            if width==1440:shot('1440-'+chapter)
            if width==390 and chapter in ['meet','call','pet','theater']:shot('390-'+chapter)
        check(str(width)+' 统一使用Web截图且无旧focus',b.eval("[...document.querySelectorAll('#zhuozai-case .zz-shot img')].every(i=>i.dataset.fullSrc.includes('/flows/')&&!/-focus-focus|-current-focus|call-event-focus|discover-focus/.test(i.dataset.fullSrc))"))
    b.metrics(1440,1100,1)
    for selector,name in [('.zz-creation-story','1440-create-steps'),('.zz-event-story','1440-event-states'),('.zz-pet-modes','1440-pet-modes'),('#zz-theater>.zz-support-grid','1440-theater-results')]:
        scroll_to(selector);shot(name)
    b.eval('(()=>{const e=[...document.querySelectorAll("#zz-theater h3")].find(e=>e.textContent.includes("让故事被更多人看见")),s=document.querySelector("#detail-view");s.scrollTop+=e.getBoundingClientRect().top-156;})()');shot('1440-community')
    b.click('.zz-toc [data-case-jump="zz-call"]');settle()
    scroll_to('.zz-call-main')
    before=b.eval('document.querySelector("#detail-view").scrollTop')
    b.click('.zz-call-main [data-image-preview]')
    b.wait("document.querySelector('.image-preview').open&&document.querySelector('.image-preview img').complete&&document.querySelector('.image-preview img').naturalWidth>0")
    check('点击打开原生图片预览',b.eval("document.querySelector('.image-preview').matches(':modal')"))
    b.wait("document.querySelector('.image-preview img').dataset.imageResolution==='full'")
    check('看图加载新版2倍原图',b.eval("document.querySelector('.image-preview img').naturalWidth>=2400"))
    shot('1440-image-preview')
    key('+','Equal');check('图片可键盘放大',b.eval("document.querySelector('.image-preview').classList.contains('is-zoomed')"))
    key('0','Digit0');check('图片可键盘复位',b.eval("!document.querySelector('.image-preview').classList.contains('is-zoomed')"))
    key('Escape');check('Esc先关闭图片并保留案例',b.eval("!document.querySelector('.image-preview').open&&!document.querySelector('#detail-view').hidden"))
    check('关闭图片保留阅读位置',abs(b.eval('document.querySelector("#detail-view").scrollTop')-before)<3)
    b.click('#zz-meet .zz-support summary');check('补充流程可收起',b.eval("!document.querySelector('#zz-meet .zz-support').open"))
    b.click('#zz-meet .zz-support summary');check('补充流程可重新展开',b.eval("document.querySelector('#zz-meet .zz-support').open"))
    b.click('[data-case-next]');b.wait("location.hash==='#yanshuju'&&!document.querySelector('#yanshuju-case').hidden&&!document.querySelector('#page-transition').classList.contains('is-active')")
    check('下一个作品进入研数据',b.eval("document.querySelector('#yanshuju-case').textContent.includes('研数据')"))
    for slug in ['brand-atlas','move-with-me','quiet-type','civic-signal','objects-at-rest']:
        b.navigate('/portfolio/index.html#'+slug,'#detail-title')
        b.wait("!document.querySelector('#detail-view').hidden&&!document.querySelector('#page-transition').classList.contains('is-active')")
        check('保留其他路由 '+slug,b.eval('location.hash==='+json.dumps('#'+slug)+'&&!!document.querySelector("#detail-title").textContent.trim()'))
    b.navigate('/portfolio/index.html#zhuozai-ai','#zhuozai-case:not([hidden]) h1')
    b.wait("!document.querySelector('#page-transition').classList.contains('is-active')")
    b.click('#detail-back');b.wait("document.querySelector('#detail-view').hidden&&!document.querySelector('#page-transition').classList.contains('is-active')")
    shot('1440-card-collection')
    check('返回作品集可用',b.eval("document.querySelector('#detail-view').hidden"))
    check('运行时异常0',len(b.cdp.errors)==0,b.cdp.errors)
    report={'status':'PASS' if all(t['pass'] for t in tests) else 'FAIL','total':len(tests),'passed':sum(t['pass'] for t in tests),'failed':sum(not t['pass'] for t in tests),'tests':tests,'screenshots':shots,'runtimeErrors':b.cdp.errors,'viewportSource':1440,'sourceDpr':2}
    (TASK/'site-review-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:report[k] for k in ['status','total','passed','failed']}) ,flush=True)
except Exception as error:
    diagnostic={'error':str(error),'url':b.eval('location.href'),'images':image_diagnostics(),'tests':tests,'runtimeErrors':b.cdp.errors}
    (TASK/'site-review-debug.json').write_text(json.dumps(diagnostic,ensure_ascii=False,indent=2),encoding='utf-8')
    b.screenshot(out/'debug.png')
    raise
finally:b.close()
