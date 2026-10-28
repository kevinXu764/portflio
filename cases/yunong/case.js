import {imageLink} from '../../media.js';
import {captures} from './captures.js';

export const yunongProject = {
  number: '03', slug: 'yunong', title: '雨浓陪诊', cnTitle: '医疗陪诊服务与三端协作',
  category: '服务设计 · 三端协作', year: '2026', role: '产品与体验方案', duration: 'App + Web',
  description: '医疗陪诊三端方案，包含家属预约、陪诊员接单、服务节点记录与运营管理。',
  challenge: '家属异地预约时，需要确认人员安排、跟踪现场进度，并核对服务时长与费用。',
  approach: '自动匹配合适人员，用服务节点同步现场，以统一的订单串联运营支持。',
  outcomes: ['自动匹配优先，支持人工分派','服务节点有时间、地点与照片','家属、陪诊员与运营围绕订单协作'],
  tone: '#246bfd', coverStyle: 'care', mark: '雨'
};
const base = 'cases/yunong/media/';
const chapters = [['overview','项目概览'],['booking','预约与费用'],['matching','人员匹配'],['visibility','服务节点与记录'],['operations','运营管理']];
function shot(id, title, copy = '', {eager = false, cls = ''} = {}) {
  const m = captures[id];
  if (!m) throw Error('Missing Yunong capture: ' + id);
  return `<figure class="yn-shot ${id.startsWith('web-') ? 'yn-web' : 'yn-phone'} ${cls}">${imageLink({src:base+id+'.webp',alt:title+(copy?'：'+copy:''),width:m.width,height:m.height,className:'yn-image',eager})}<figcaption><strong>${title}</strong>${copy?`<span>${copy}</span>`:''}</figcaption></figure>`;
}
const head = (title, copy) => `<header class="yn-heading"><h2>${title}</h2><p>${copy}</p></header>`;
const sub = (title, copy) => `<div class="yn-subheading"><h3>${title}</h3><p>${copy}</p></div>`;
const phones = (...items) => `<div class="yn-phones ${items.length===3?'yn-phones-three':'yn-phones-two'}">${items.join('')}</div>`;

export function renderYunongCase() {
 return `<div class="yn-case">
<header class="yn-cover" id="yn-top">
 <div class="yn-cover-layout"><div class="yn-cover-copy"><p class="yn-cover-label"><span class="yn-brand-symbol" aria-hidden="true">＋</span> 医疗陪诊服务设计</p><h1>雨浓陪诊</h1><p class="yn-cover-intro">面向家属、陪诊员与运营的三端方案，覆盖预约、人员匹配、服务节点记录与费用核对。</p></div>
 <div class="yn-cover-screens">${shot('app-home','家属端','查看当前服务进度',{eager:true})}${shot('provider-tasks','陪诊员端','按周历查看任务安排',{eager:true})}</div></div>
 <div class="yn-cover-meta"><span>产品与体验设计</span><span>家属 App · 陪诊员 App · 运营 Web</span><span>预约 → 服务 → 结算</span></div>
</header>
<figure class="yn-collection">${imageLink({src:base+'ui-collection.webp',alt:'雨浓陪诊三端界面锦集：服务进度、预约、人员匹配、任务周历、订单管理与人员地图',width:2400,height:1440,className:'yn-collection-image'})}</figure>
<nav class="yn-toc" aria-label="雨浓陪诊案例章节">${chapters.map(([id,title])=>`<button type="button" data-yn-jump="yn-${id}">${title}</button>`).join('')}</nav>

<section class="yn-section yn-overview" id="yn-overview">
 ${head('项目概览','以家属为异地父亲预约门诊陪诊为场景。三端共用订单信息，分别呈现预约、现场执行与运营管理所需的内容。')}
 <dl class="yn-roles"><div><dt>家属</dt><dd>确认陪诊员、查看进度并核对费用。</dd></div><div><dt>陪诊员</dt><dd>确认任务时段与需求，按节点记录服务。</dd></div><div><dt>运营</dt><dd>分派与改派人员，查看订单和服务记录。</dd></div></dl>
</section>

<section class="yn-section" id="yn-booking">
 ${head('预约与费用','预约分为就诊安排、服务需求和信息核对三步。确认就诊时间、地点及帮助事项后，汇总为订单摘要供陪诊员查看。')}
 ${phones(shot('booking-plan','就诊安排'),shot('booking-needs','服务需求'),shot('booking-confirm','信息核对'))}
 <div class="yn-editorial"><div class="yn-editorial-copy"><h3>基础费用与超时结算</h3><p>支付前展示基础时长、价格与超时单价；服务结束后列出实际时长和费用明细，便于核对超时金额。</p><dl class="yn-fee"><div><dt>预约时</dt><dd>2小时 / ¥190</dd></div><div><dt>示例结算</dt><dd>3小时 / ¥280</dd></div></dl><p class="yn-note">超时1小时，按 ¥90 / 小时计费。</p></div>${phones(shot('checkout','支付前','确认费用与规则'),shot('app-completion','服务后','核对时长与明细'))}</div>
</section>

<section class="yn-section yn-tint" id="yn-matching">
 ${head('人员匹配','下单后自动发起匹配，分别展示邀约中与已确认接单状态。陪诊员响应后，家属端再显示确定的人员安排。')}
 <ol class="yn-rules"><li><strong>资格筛选</strong><span>先检查资质、城市和时段冲突，预留30分钟衔接。</span></li><li><strong>适配排序</strong><span>再结合医院熟悉度、帮助需求、评价与任务量发出邀约。</span></li><li><strong>响应确认</strong><span>未确认时继续邀约，或开放符合条件的接单与人工分派。</span></li></ol>
 <div class="yn-paired-groups"><div>${sub('家属端的匹配状态','等待邀约响应时显示匹配进度，确认接单后显示陪诊员信息。')}${phones(shot('matching','正在匹配'),shot('arranged','人员已安排'))}</div><div>${sub('陪诊员端的接单方式','系统邀约与公开订单分开呈现，可查看任务信息后确认接单。')}${phones(shot('provider-invited','系统邀约'),shot('provider-hall','公开接单'))}</div></div>
 ${sub('人工分派与改派','展示候选资格与不可分派原因；改派时记录原因，供运营后续查询。')}
 ${shot('web-manual','人工分派','在订单内比较候选人员，保留自动匹配之外的处理方式。')}
</section>

<section class="yn-section yn-visibility" id="yn-visibility">
 ${head('服务节点与记录','陪诊员按节点上传照片与说明，家属端优先展示当前阶段和下一步，运营端在订单内查看完整记录。')}
 <ol class="yn-service-chain" aria-label="服务记录的三端流转"><li><span>陪诊员</span><strong>现场记录</strong></li><li><span>家属</span><strong>进度可见</strong></li><li><span>运营</span><strong>订单追溯</strong></li></ol>
 ${phones(shot('provider-record-photo','现场节点记录','照片与说明归入对应节点。'),shot('app-progress','家属端服务进度','当前阶段与下一步优先呈现。'))}
 <div class="yn-web-feature"><div class="yn-feature-copy"><h3>订单内的服务轨迹</h3><p>服务节点按时间纵向排列，每项包含上传人员、地点、照片与说明，可按顺序回看。</p><p>入口留在订单列表的每行操作中，查看时保留对应订单的上下文。</p></div>${shot('web-trajectory','订单内的服务轨迹','完整保留各节点的时间、地点与现场照片。')}</div>
</section>

<section class="yn-section yn-operations" id="yn-operations">
 ${head('运营管理','运营端集中处理订单状态、陪诊员资质与城市人员供给，并提供评价、售后及费用规则管理。')}
 ${shot('web-orders','订单管理','分配、服务与费用状态同屏呈现，每笔订单都有服务轨迹入口。')}
 ${sub('陪诊员管理与入驻审核','“在岗人员 / 入驻审核”放在陪诊员管理内，各自保留筛选与待处理状态，减少人员档案和资质材料的分散。')}
 ${shot('web-audit','陪诊员管理 · 入驻审核')}
 ${sub('城市供给与人员详情','地图表达陪诊员的服务城市分布；选中人员后展示经验、熟悉医院与联系方式，辅助运营调配。')}
 ${shot('web-map','人员地图','点位为示例服务城市，非实时定位。')}
 ${sub('预约与售后支持','用户与权益支持预约，评价与售后承接反馈，服务配置统一范围和费用规则。')}
 <figure class="yn-support">${imageLink({src:base+'operations-collection.webp',alt:'运营支撑能力概览：用户管理、权益管理、评价管理、售后管理与服务配置，五张完整后台页面',width:2400,height:1480,className:'yn-collection-image'})}<figcaption>用户与权益 · 评价与售后 · 服务配置</figcaption></figure>
 <footer class="yn-closing"><p class="yn-note">界面与业务数据为设计方案示例；照片为 AI 生成的场景示意。</p></footer>
</section>
</div>`;
}

// Reading-only navigation. Product actions are pixels in the screenshots.
export function bindYunongCase(host) {
 const scroller=host.closest('.detail-view'),toc=host.querySelector('.yn-toc');
 const links=[...toc.querySelectorAll('[data-yn-jump]')],sections=links.map(b=>host.querySelector('#'+b.dataset.ynJump));
 const indicator=document.createElement('span');indicator.className='yn-toc-indicator';indicator.setAttribute('aria-hidden','true');toc.append(indicator);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,active=-1,recenter=true;
 function track(){
  frame=0;if(host.hidden||scroller.hidden)return;
  const toolbar=scroller.querySelector('.detail-toolbar').offsetHeight;
  toc.style.setProperty('--yn-toolbar-height',toolbar+'px');
  const line=scroller.getBoundingClientRect().top+toolbar+toc.offsetHeight+24;let index=0;
  sections.forEach((s,n)=>{if(s.getBoundingClientRect().top<=line)index=n});
  if(scroller.scrollHeight-scroller.clientHeight-scroller.scrollTop<4)index=sections.length-1;
  const changed=index!==active;active=index;
  links.forEach((link,n)=>{link.classList.toggle('is-active',n===index);if(n===index)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
  const link=links[index];indicator.style.width=link.offsetWidth+'px';indicator.style.transform=`translateX(${link.offsetLeft}px)`;indicator.style.top=(link.offsetTop+link.offsetHeight-3)+'px';indicator.classList.add('is-ready');
  if(changed||recenter){const a=link.getBoundingClientRect(),b=toc.getBoundingClientRect();if(a.left<b.left+12||a.right>b.right-12)toc.scrollTo({left:Math.max(0,Math.min(toc.scrollWidth-toc.clientWidth,toc.scrollLeft+a.left-b.left-(toc.clientWidth-a.width)/2)),behavior:reduced.matches?'instant':'smooth'});recenter=false;}
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(track)};
 scroller.addEventListener('scroll',schedule,{passive:true});
 host.addEventListener('click',e=>{const link=e.target.closest('[data-yn-jump]');if(!link)return;const target=host.querySelector('#'+link.dataset.ynJump);const inset=scroller.querySelector('.detail-toolbar').offsetHeight+toc.offsetHeight+12;scroller.scrollTo({top:scroller.scrollTop+target.getBoundingClientRect().top-scroller.getBoundingClientRect().top-inset,behavior:'instant'});schedule()});
 const resize=new ResizeObserver(()=>{recenter=true;schedule()});resize.observe(host);resize.observe(toc);resize.observe(scroller);host.addEventListener('load',schedule,true);
 const visibility=new MutationObserver(()=>{recenter=true;schedule()});visibility.observe(host,{attributes:true,attributeFilter:['hidden']});visibility.observe(scroller,{attributes:true,attributeFilter:['hidden']});schedule();
}
