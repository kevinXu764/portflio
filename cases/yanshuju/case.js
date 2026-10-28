import {imageLink} from '../../media.js';
import {captures} from './captures.js';
import {renderMechanism} from './mechanism.js';

export const yanshujuProject={
 number:'02',slug:'yanshuju',title:'研数据',cnTitle:'考研信息探索与择校辅助', // taste-skill-ignore: Existing portfolio project index, retained for route metadata.
 category:'数据可视化 · AI 决策辅助',year:'个人毕业设计',role:'个人项目',duration:'毕业设计与后续迭代',
 description:'面向考研学生，提供偏好量表、知识图谱、院校专业浏览和同口径数据比较。',
 challenge:'考研信息分散，费用、学制和培养要求难以在同一处核对。',
 approach:'以量表收集偏好，将图表与追问放入对话，并提供专业树、比较视图和候选清单。',
 outcomes:['连续对话中的分析与确认','树状专业浏览与同口径比较','从概念探索到准备事项'],
 tone:'#145af2',coverStyle:'research',mark:'研'
};
const base='cases/yanshuju/media/';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chapters=[['overview','项目概览'],['preferences','偏好表达'],['conversation','对话分析'],['mechanism','AI 分析机制'],['knowledge','知识探索'],['schools','院校与专业'],['compare','专业比较'],['decision','资料与清单']];
const sets={
 budget:[['budget-impact','确认上限','6 万元设为必须条件，预览候选范围。'],['budget-revision','调整预算','改为 9 万元后，再次确认条件变化。']],
 graph:[['graph-overview','完整网络','从主题进入概念。'],['graph-selected','选中概念','同时查看关联与解释。'],['graph-focus','聚焦关系','收起无关节点，沿连接继续探索。'],['knowledge-demo','交互录屏','缩放画布，切换当前概念。','video']],
 tree:[['tree-overview','招生人数','院校、院系与专业保持三级归属。'],['tree-tuition','全程学费','同一位置、同一刻度比较费用。'],['tree-trend','招生趋势','在列表内查看历年变化。']],
 compare:[['compare-cost-main','学费与学制','分别比较金钱与时间投入。'],['compare-trend-main','复试分数线','查看相同口径的历年变化。'],['compare-seats-main','招生人数','比较同专业各年的招生计划。'],['compare-requirements-main','初试科目','看共同准备和各自要求。'],['compare-retest-main','复试准备','对照作品集、面试与材料。']],
 candidate:[['candidate-saved','保留候选','记录自己的理由。'],['candidate-excluded','暂时排除','保留原理由，也可以恢复考虑。']]
};
function shot(id,label,{eager=false,cls=''}={}){const m=captures[id];if(!m)throw Error('Missing capture '+id);return `<figure class="yd-shot ${cls}"><div class="yd-media-viewport">${imageLink({src:base+id+'.webp',alt:label,width:m.width,height:m.height,className:'yd-image',eager})}</div><figcaption>${label}</figcaption></figure>`}
function panel(entry){const [id,title,copy,type]=entry;return type==='video'?`<figure class="yd-shot"><video controls playsinline muted preload="none" poster="${base}graph-overview.webp" aria-label="知识图谱缩放与选中录屏"><source src="${base}knowledge-demo.mp4" type="video/mp4"></video><figcaption><span>${copy}</span></figcaption></figure>`:shot(id,copy)}
function gallery(key,label){return `<div class="yd-gallery" data-yd-gallery="${key}"><div class="yd-switch" role="group" aria-label="${label}">${sets[key].map((e,i)=>`<button type="button" data-yd-state="${i}" aria-pressed="${i===0}">${e[1]}</button>`).join('')}</div><div class="yd-gallery-panel">${panel(sets[key][0])}</div></div>`}
const head=(title,copy)=>`<header class="yd-heading"><h2>${title}</h2><p>${copy}</p></header>`;
export function renderYanshujuCase(){return `<div class="yd-case">
<header class="yd-cover" id="yd-top"><div class="yd-cover-copy"><div><h1>研数据</h1><p>考研信息探索与择校辅助</p></div><div class="yd-cover-intro"><p>包含偏好量表、知识图谱、院校专业浏览、数据比较与 AI 对话。</p></div></div>${shot('home','择校探索首页',{eager:true,cls:'yd-cover-shot'})}<div class="yd-cover-meta"><span>个人毕业设计</span><span>Web 产品设计</span><span>数据可视化 · AI 交互</span></div></header>
<figure class="yd-ui-collection" aria-label="研数据界面锦集">${imageLink({src:base+'ui-collection.png',displaySrc:base+'ui-collection.webp',alt:'研数据 Web 界面锦集：择校探索、知识图谱、院校专业、数据分析与专业比较',width:2400,height:1440,className:'yd-collection-image'})}</figure>
<nav class="yd-toc" aria-label="研数据案例章节">${chapters.map(([id,t])=>`<button type="button" data-yd-jump="yd-${id}">${t}</button>`).join('')}</nav>
<section id="yd-overview" class="yd-section yd-overview">${head('项目概览','面向探索院校与专业方向的考研学生，整合偏好表达、专业信息与比较工具。')}<div class="yd-overview-content"><p>以双系统理论为设计参考，将活动兴趣作为起点，再用学费、学制、招生与准备要求核对具体选择。</p><ol class="yd-route" aria-label="核心产品路径"><li>表达偏好</li><li>探索信息</li><li>比较选择</li></ol></div></section>
<section id="yd-preferences" class="yd-section">${head('偏好表达','通过活动选择了解培养方向，再用量表记录各项条件的重视程度。')}<div class="yd-pair yd-interest-run">${shot('interest-choices','选择感兴趣的活动')}${shot('training-evidence','展开对应的培养方向')}</div><div class="yd-preference-main">${shot('ratings','用 1—5 分表达重视程度，允许暂不确定')}<div class="yd-preference-notes"><h3>偏好与硬性条件</h3><p>量表中的重要程度用于讨论取舍。必须满足的条件（如预算上限）在对话中单独确认，调整前先预览候选变化。</p></div></div></section>
<section id="yd-conversation" class="yd-section yd-blue-tint">${head('对话分析与条件调整','AI 回复包含分析说明、数据图表和追问；预算修改先预览，确认后再更新条件。')}<div class="yd-conversation-board"><div class="yd-conversation-main">${shot('discussion','查看投入差异，再回应 AI 的追问')}</div><div class="yd-conversation-states">${shot('budget-input','先区分可讨论的偏好与必须满足的上限')}${gallery('budget','预算调整状态')}${shot('budget-slider','拖动预算只更新预览，确认后再改变条件')}</div></div><div class="yd-response-run">${shot('cost-discuss','保留预算、查看内容或继续调整')}${shot('chat-compare','在同一段对话里，继续比较两条路径')}</div></section>
${renderMechanism(shot)}
<section id="yd-knowledge" class="yd-section yd-dark">${head('知识探索','图谱支持搜索、选中与聚焦概念，概念详情可加入准备清单并更新进度。')}${gallery('graph','知识图谱状态')}<div class="yd-detail-run"><div>${shot('graph-search','搜索概念，定位相关内容')}${shot('graph-definition','阅读概念解释与学习标记')}</div><div>${shot('prep-confirm','确认适用范围后，加入准备事项')}${shot('prep-item','准备事项进入清单，可更新进度')}</div></div></section>
<section id="yd-schools" class="yd-section">${head('院校与专业','按院校、院系与专业分层浏览，可切换招生人数、全程学费和历年趋势。')}${gallery('tree','专业树指标')}<div class="yd-pair yd-school-details">${shot('tree-search','搜索后保留命中的院校与院系')}${shot('program-expanded','原位展开培养内容与报考要求')}</div>${shot('tree-selected','勾选具体专业，加入对比',{cls:'yd-dock-shot'})}</section>
<section id="yd-compare" class="yd-section yd-blue-tint">${head('多专业比较','对所选专业比较学费、学制、分数线、招生人数与准备要求，并逐项查看差异。')}${gallery('compare','专业比较视图')}<div class="yd-comparison-details">${shot('compare-matrix','只看差异，逐项核对条件')}${shot('candidate-reason','结合数据，写下自己的取舍')}</div></section>
<section id="yd-decision" class="yd-section yd-decision-tone">${head('资料与候选清单','从数据字段查看对应资料，为候选专业记录取舍理由，并调整调查顺序。')}<div class="yd-decision-board"><div class="yd-evidence-run">${shot('document-evidence','从学费字段定位到对应资料')}${shot('evidence-result','阅读后确认这一项依据')}${shot('candidate-order','调整调查顺序，保留原有理由')}</div>${gallery('candidate','候选状态')}</div></section>

</div>`}
export function bindYanshujuCase(host){
 const scroller=host.closest('.detail-view')||document.scrollingElement,toc=host.querySelector('.yd-toc'),links=[...toc.querySelectorAll('[data-yd-jump]')],sections=links.map(b=>host.querySelector('#'+b.dataset.ydJump));
 let frame=0,active=-1,recenter=true;
 const indicator=document.createElement('span');indicator.className='yd-toc-indicator';indicator.setAttribute('aria-hidden','true');toc.append(indicator);const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const pause=()=>host.querySelectorAll('video').forEach(v=>v.pause());
 function track(){
  frame=0;if(host.hidden||scroller.hidden)return;
  const origin=scroller===document.scrollingElement?0:scroller.getBoundingClientRect().top;
  const toolbar=(scroller.querySelector?.('.detail-toolbar')||document.querySelector('.detail-toolbar'))?.offsetHeight||0;
  toc.style.setProperty('--yd-toolbar-height',toolbar+'px');
  const line=origin+toolbar+toc.offsetHeight+25;let i=0;
  sections.forEach((s,n)=>{if(s.getBoundingClientRect().top<=line)i=n});
  if(scroller.scrollHeight-scroller.clientHeight-scroller.scrollTop<4)i=sections.length-1;
  const changed=i!==active;
  if(changed){active=i;links.forEach((b,n)=>{b.classList.toggle('is-active',i===n);if(i===n)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current')});}
  if(changed||recenter){
   const link=links[i],box=link.getBoundingClientRect(),navBox=toc.getBoundingClientRect();
   indicator.style.width=link.offsetWidth+'px';indicator.style.top=(link.offsetTop+link.offsetHeight-3)+'px';indicator.style.transform='translateX('+link.offsetLeft+'px)';
   if(!indicator.classList.contains('is-ready')){indicator.getBoundingClientRect();indicator.classList.add('is-ready')}
   if(toc.scrollWidth>toc.clientWidth&&(changed||box.left<navBox.left+12||box.right>navBox.right-12)){
    const left=toc.scrollLeft+box.left-navBox.left-(toc.clientWidth-box.width)/2;
    toc.scrollTo({left:Math.max(0,Math.min(toc.scrollWidth-toc.clientWidth,left)),behavior:reduced.matches?'auto':'smooth'});
   }
   recenter=false;
  }
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(track)};const jump=id=>{const target=host.querySelector('#'+id);if(!target)return;const root=scroller===document.scrollingElement;const origin=root?0:scroller.getBoundingClientRect().top;const inset=id==='yd-top'?0:(scroller.querySelector?.('.detail-toolbar')?.offsetHeight||0)+toc.offsetHeight+12;const top=scroller.scrollTop+target.getBoundingClientRect().top-origin-inset;(root?window:scroller).scrollTo({top,behavior:'instant'});schedule();};
 (scroller===document.scrollingElement?window:scroller).addEventListener('scroll',schedule,{passive:true});const resize=new ResizeObserver(()=>{recenter=true;schedule()});resize.observe(host);resize.observe(toc);if(scroller!==document.scrollingElement)resize.observe(scroller);host.addEventListener('load',schedule,true);
 host.addEventListener('click',e=>{const j=e.target.closest('[data-yd-jump]');if(j)jump(j.dataset.ydJump);
 const state=e.target.closest('[data-yd-state]');if(state){const group=state.closest('[data-yd-gallery]');group.querySelectorAll('video').forEach(v=>v.pause());group.querySelectorAll('[data-yd-state]').forEach(b=>b.setAttribute('aria-pressed',String(b===state)));group.querySelector('.yd-gallery-panel').innerHTML=panel(sets[group.dataset.ydGallery][Number(state.dataset.ydState)]);schedule();}
 });
 const visibility=new MutationObserver(()=>{if(host.hidden||scroller.hidden){pause();}else {recenter=true;schedule()}});visibility.observe(host,{attributes:true,attributeFilter:['hidden']});if(scroller!==document.scrollingElement)visibility.observe(scroller,{attributes:true,attributeFilter:['hidden']});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});schedule();
}
