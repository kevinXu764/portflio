from browser_runtime import Browser,PORTFOLIO,TASK
import json
b=Browser('offline-review-profile',1440,1100,1)
tests=[]
def check(name,value):tests.append({'name':name,'pass':bool(value)})
try:
    b.cdp.call('Page.navigate',url=PORTFOLIO.as_uri()+'/index.html#zhuozai-ai')
    b.wait("location.protocol==='file:'&&!!document.querySelector('#zhuozai-case:not([hidden]) h1')&&!document.querySelector('#page-transition').classList.contains('is-active')")
    check('离线file入口打开作品一',b.eval("location.protocol==='file:'&&document.querySelector('#zhuozai-case h1').textContent.includes('桌崽')"))
    b.wait("document.querySelector('.zz-cover-ui img').complete&&document.querySelector('.zz-cover-ui img').naturalWidth>0")
    check('离线封面图可加载',b.eval("document.querySelector('.zz-cover-ui img').naturalWidth>0"))
    b.click('.zz-cover-ui [data-image-preview]')
    b.wait("document.querySelector('.image-preview').open&&document.querySelector('.image-preview img').dataset.imageResolution==='full'")
    check('离线原图查看可用',b.eval("document.querySelector('.image-preview img').naturalWidth>2400"))
    b.cdp.call('Input.dispatchKeyEvent',type='keyDown',key='Escape',code='Escape');b.cdp.call('Input.dispatchKeyEvent',type='keyUp',key='Escape',code='Escape')
    check('离线Esc关闭图片',b.eval("!document.querySelector('.image-preview').open&&!document.querySelector('#detail-view').hidden"))
    b.screenshot(TASK/'site-review'/'1440-offline-cover.png')
    for width in [1440,390,320]:
        b.metrics(width,1000,1);b.navigate('/prototype/index.html#pet?id=chengxia')
        b.input('#pet-quick-input','想聊一会儿。');b.eval('document.querySelector("#pet-quick-form").dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))')
        b.click('[data-action="hide-pet-controller"]')
        value=b.eval('(()=>{const a=document.querySelector("#pet-speech").getBoundingClientRect(),r=document.querySelector("#restore-pet-controller").getBoundingClientRect(),v=document.querySelector(".desktop-titlebar").getBoundingClientRect();return r.bottom<=a.top&&r.left>=v.left&&r.right<=v.right&&document.documentElement.scrollWidth<=innerWidth})()')
        check(str(width)+'恢复按钮不遮挡气泡且位于窗口内',value)
        b.click('[data-action="show-pet-controller"]');check(str(width)+'恢复控制器可用',b.eval("!document.querySelector('#pet-controller').hidden"))
    check('运行时异常0',not b.cdp.errors)
    result={'status':'PASS' if all(t['pass'] for t in tests) else 'FAIL','total':len(tests),'passed':sum(t['pass'] for t in tests),'failed':sum(not t['pass'] for t in tests),'tests':tests,'runtimeErrors':b.cdp.errors}
    (TASK/'offline-review-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:result[k] for k in ['status','total','passed','failed']}),flush=True)
finally:b.close()
