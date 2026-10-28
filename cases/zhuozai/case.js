import {imageLink} from '../../media.js';
import { captures } from './captures.js';
export const zhuozaiProject={number:'01',slug:'zhuozai-ai',title:'桌崽 AI',cnTitle:'AI 陪伴产品设计',category:'AI 陪伴 · 产品与交互',year:'2026',role:'产品与交互复盘',duration:'持续迭代',description:'AI 角色互动方案，包含文字与视频交流、关系事件、记忆收藏、桌面陪伴和双人剧场。',challenge:'文字、视频和桌面场景切换时，如何保留交流内容，并提供中断与退出操作？',approach:'按角色发现、交流、记忆与桌面控制组织界面，展示关键操作及其前后状态。',outcomes:['文字与视频共用消息和输入','原句收藏与记忆整理','桌面形态与暂停恢复'],tone:'#ffe344',coverStyle:'companion',mark:'Z—01'}; // taste-skill-ignore: Existing portfolio project index, retained for route metadata.
const base='cases/zhuozai/media/';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shot(name,alt,cls='',caption=''){
 const m=captures[name];if(!m)throw Error('Missing capture: '+name);
 const src=base+'flows/'+name+'.webp';
 const focus=captures[name+'-focus'],display=focus?base+'flows/'+name+'-focus.webp':src,dm=focus||m;
 return `<figure class="zz-shot ${cls}" style="--capture-width:${dm.width}px"><div class="zz-media-viewport">${imageLink({src,displaySrc:display,alt,width:dm.width,height:dm.height,className:'zz-image'})}</div>${caption?`<figcaption>${caption}</figcaption>`:''}</figure>`;
}
const chapter=(title,lead)=>`<header class="zz-chapter-head"><h2>${title}</h2><p>${lead}</p></header>`;
const note=(title,text)=>`<p class="zz-note"><strong>${title}。</strong>${text}</p>`;
const label=(n,title)=>`<div class="zz-panel-label"><span aria-hidden="true">${n}</span><h3>${title}</h3></div>`;
const nav=[['context','产品定位'],['meet','角色发现'],['chat','文字对话'],['call','视频与事件'],['memory','共同记忆'],['pet','桌面陪伴'],['theater','双人剧场']];
export function renderZhuozaiCase(){return `<div class="zz-case">
<header class="zz-cover" id="zz-top">
 <div class="zz-cover-title"><div><h1 id="zz-title">桌崽 <span>AI</span></h1></div><div class="zz-cover-intro"><p>角色交流与日常陪伴</p><span>包含文字与视频交流、关系事件、记忆收藏、桌面陪伴与双人剧场。</span><button type="button" data-case-jump="zz-call">查看视频与事件 <span aria-hidden="true">↗</span></button></div></div>
 <div class="zz-cover-stage">${shot('call-event','桌崽视频通话：角色、消息与独立事件窗口','zz-cover-ui')}</div>
 <p class="zz-cover-caption">产品与交互设计<span>点击界面可查看原图</span></p>
</header>
<figure class="zz-ui-collection" aria-label="桌崽 AI 界面锦集">${imageLink({src:base+'ui-collection.png',displaySrc:base+'ui-collection.webp',alt:'桌崽 AI 界面锦集：基于 branch3 v0.4 的 1440 宽 Web 界面，包含角色发现、创建、文字交流、独立通话浮层、桌面陪伴与双人剧场',width:2400,height:1440,className:'zz-collection-image'})}</figure>
<nav class="zz-toc" aria-label="桌崽案例章节">${nav.map(([id,t])=>`<button type="button" data-case-jump="zz-${id}">${t}</button>`).join('')}</nav>
<section id="zz-context" class="zz-section zz-context">
${chapter('产品定位','面向角色互动场景，提供角色发现、文字与视频交流、记忆收藏和桌面陪伴。')}
<dl class="zz-context-decisions"><div><dt>交流衔接</dt><dd>文字与视频共用消息和输入；角色回复可收藏为共同记忆，供后续整理与查找。</dd></div><div><dt>操作控制</dt><dd>等待回应时可中断，关系事件可退出，桌面角色可暂停、隐藏或收起。</dd></div></dl>
<div class="zz-journey">${[['认识角色','推荐或创建','meet'],['开始交流','文字与视频','chat'],['经历事件','回应与退出','call'],['留下记忆','收藏与整理','memory'],['日常陪伴','形态与控制','pet']].map(([t,d,id])=>`<button data-case-jump="zz-${id}"><strong>${t}</strong><small>${d}</small><span aria-hidden="true">↗</span></button>`).join('')}</div>
</section>
<section id="zz-meet" class="zz-section zz-meet">
${chapter('角色发现与创建','选择已有角色，或分步创建自己的角色，随后进入同一套交流体验。')}
<div class="zz-discover-layout"><div class="zz-discover-display">${shot('discover','发现首页：破形主视觉、八位圆形角色、分类搜索与双角色作品社区')}</div><div class="zz-discover-notes"><h3>角色信息与交流入口</h3>${note('推荐与筛选','八位角色以圆形头像排列，可按分类浏览或搜索；详情页展示角色设定。')}${shot('role-detail','角色详情：查看设定、开始聊天、邀请到桌面','zz-role-detail')}${note('聊天与桌面入口','查看设定后，可以开始聊天，也可以邀请角色到桌面。')}</div></div>
<div class="zz-subtitle"><h3>分步创建角色</h3><p>形象、性格与确认分开处理，每一步保留预览。</p></div>
<div class="zz-creation-story">${[['create-look','1','选择形象','选择预置形象，或使用自己的图片。'],['create-personality','2','补充性格','填写名字与背景，返回上一步仍可继续修改。'],['create-confirm','3','确认创建','集中复核设定，提前说明拟定消耗与首次对话去向。']].map(([im,n,t,d])=>`<article>${label(n,t)}${shot(im,t+'的实际界面')}<p>${d}</p></article>`).join('')}</div>
<details class="zz-support" open><summary>草稿、校验与首次对话 <span>＋</span></summary><div class="zz-support-grid">${shot('create-validation','必填内容缺失时，表单内提示并聚焦待补字段','','必填内容就地提示，保留已填写内容。')}${shot('create-first-chat','角色创建流程衔接预置小芽的首次对话','','确认后进入首次对话，由角色问候承接。')}</div><p>继续草稿展示预置设定；当前创建表单可返回修改。</p></details>
</section>
<section id="zz-chat" class="zz-section zz-chat">
${chapter('文字对话','话题建议先进入草稿，等待回应时可中断；文字与视频切换保留当前输入。')}
<div class="zz-chat-layout"><div class="zz-chat-art">${shot('chat-focus','文字聊天主界面：消息、收藏入口和话题建议')}</div><div class="zz-chat-notes">${note('话题建议','话题先进入可编辑输入框，确认后再发送；切换文字与视频时保留当前输入。')}${note('回应中断','回应中提供“停止回应”，中止后恢复输入，并说明未完成回应的退回规则。')}${shot('chat-waiting-detail','等待回复时输入区域出现停止回应入口','zz-detail-strip')}${note('消息收藏','从角色回复进入收藏表单，自动带入原句与角色，减少重复输入。')}<div class="zz-draft-proof">${shot('chat-draft','未发送草稿的可编辑输入状态')}</div></div></div>
<p class="zz-inline-rule"><strong>输入确认。</strong>语音转写样例先进入草稿，由用户确认发送；输入法组合态不会被 Enter 误提交。</p>
</section>
<section id="zz-call" class="zz-section zz-call">
${chapter('视频通话与关系事件','角色画面、消息输入和事件进度分区展示，事件状态变化时保持通话布局。')}
<div class="zz-call-regions"><span>角色画面</span><span>消息与输入</span><span>事件起因与进度</span></div>
${shot('call-event','视频通话布局：独立 iPhone 式手机浮窗、连续消息和事件卡片','zz-call-main')}
<p class="zz-call-explanation">iPhone 式手机框悬浮在页面上方，与消息卡、事件卡并列。事件开始、推进和结束时，手机尺寸与比例保持不变；文字与视频共享消息和同一个输入框。</p>
<div class="zz-subtitle"><h3>事件的三个状态</h3><p>起因持续可见，回应更新进度，完成后回到日常交流。</p></div>
<div class="zz-event-story">${[['event-start-current','1','说明起因'],['event-progress-current','2','反馈回应'],['event-success-current','3','完成事件']].map(([im,n,t])=>`<article>${label(n,t)}${shot(im,t+'的事件卡片')}</article>`).join('')}</div>
<div class="zz-event-policy"><div><h3>事件结果与退出</h3><p>事件进行中可以退出，暂时搁置时仍可继续聊天。结果反馈区分别说明成功与未完成时的亲密度变化。</p><p class="zz-small">示例结果：成功增加 6 点亲密度，暂时搁置保持不变。</p></div>${shot('event-paused','事件暂时搁置，亲密度不变，可以继续日常聊天')}</div>
<details class="zz-support" open><summary>连接、结束与返回聊天 <span>＋</span></summary><div class="zz-support-grid">${shot('call-connecting','正在连接：状态可见，接通前暂不输入','','连接可取消，接通后恢复输入。')}${shot('call-ended','结束通话：回到聊天或再次拨打','','挂断后可以返回聊天，或再次拨打。')}</div></details>
</section>
<section id="zz-memory" class="zz-section zz-memory">
${chapter('共同记忆','从角色回复进入收藏表单，保存原句与来源，并按角色、类别和关键词查找。')}
<div class="zz-memory-flow"><span>收藏原句</span><i aria-hidden="true">→</i><span>编辑记忆</span><i aria-hidden="true">→</i><span>分类查找</span></div>
<div class="zz-memory-cards">${shot('memory-collection','共同记忆总览：日常碎片、共同约定、心动时刻与明信片卡片')}</div>
<div class="zz-memory-edit"><div>${shot('memory-edit','编辑共同记忆：标题、角色、分类与原句内容')}</div><div><h3>记忆编辑与筛选</h3><p>收藏表单带入角色、原句与时间，标题和内容仍可编辑；回看时，角色、类别与关键词可以组合筛选。</p><div class="zz-memory-search">${shot('memory-filter-controls','共同记忆筛选：角色澄夏与关键词日落')}</div></div></div>
<details class="zz-support" open><summary>原句来源与删除确认 <span>＋</span></summary><div class="zz-support-grid">${shot('memory-from-chat','从聊天进入收藏表单，带入角色、原句和来源时间','','原句与来源一起带入，仍可补充编辑。')}${shot('memory-delete','删除共同记忆前，确认去留并提供取消入口','zz-compact-shot','删除前明确确认，提供取消入口。')}</div></details>
</section>
<section id="zz-pet" class="zz-section zz-pet">
${chapter('桌面陪伴','提供全身、头像与轻巧三种显示模式，支持拖动、快捷交流、暂停和收起。')}
<div class="zz-pet-scene">${shot('pet-overview','桌面陪伴场景：可移动角色、回复气泡和陪伴控制器')}</div>
<div class="zz-subtitle"><h3>显示模式与共用操作</h3><p>形态改变显示面积，输入、角色选择和暂停操作保持一致。</p></div>
<div class="zz-pet-modes">${[['pet-full','全身模式','完整展示角色立绘与控制器。'],['pet-avatar','头像模式','以头像显示角色，减少纵向占用。'],['pet-small','轻巧模式','缩小形象，保留气泡与快捷交流。']].map(([im,t,d])=>`<article><h3>${t}</h3><div class="zz-pet-device">${shot(im,t+'的角色形象与控制器')}</div><p>${d}</p></article>`).join('')}</div>
<div class="zz-pet-control"><div><h3>暂停、隐藏与收起</h3><div class="zz-control-list"><p><strong>暂停</strong><span>暂停动作，保留输入与控制。</span></p><p><strong>隐藏控制器</strong><span>隐藏控制器，保留角色与恢复入口。</span></p><p><strong>收起</strong><span>缩成小角色，展开后恢复原模式。</span></p><p><strong>移动与交流</strong><span>拖动调整位置，快捷输入或进入完整聊天。</span></p></div></div><div class="zz-collapse-evidence">${shot('pet-collapsed','桌面角色收起后的实际状态')}<p>收起后，保留展开入口。</p></div></div>
<details class="zz-support" open><summary>快捷回应、暂停与隐藏恢复 <span>＋</span></summary><div class="zz-support-grid">${shot('pet-reply','桌面快捷交流后的气泡回应','zz-compact-shot')}${shot('pet-paused','暂停动作后的顶部状态与继续陪伴入口')}${shot('pet-hidden','隐藏粉色控制器后，场景内保留显示控制器入口')}${shot('pet-character','切换角色后的形象、问候与聊天入口','zz-compact-shot')}</div><p>支持拖动和方向键微调。</p></details>
</section>
<section id="zz-theater" class="zz-section zz-theater">
${chapter('双人剧场','选择两位角色、场景与开场情节，播放对白；演出完成后命名并收藏。')}
<div class="zz-theater-stage">${shot('theater-playing','双人剧场：双角色、场景、当前台词、黄色设置区与紫色播放控制')}<p class="zz-stage-caption">模糊背景营造场景，当前说话者与台词保持对应。</p></div>
<div class="zz-theater-story"><article>${label('1','设定故事')}<div class="zz-setup-evidence">${shot('theater-setup-panel','选择场景、编辑开场并邀请两位不同角色')}</div><p>预置场景提供起点，开场与角色由用户决定。</p></article><article>${label('2','控制演出')}<div class="zz-play-evidence">${shot('theater-play-controls','剧场的暂停、前后句、速度与台词控制')}${shot('theater-transcript-detail','展开已发生的三句台词，回看角色与上下文')}</div><p>暂停、回看与调速，台词记录保留上下文。</p></article><article>${label('3','命名并收藏')}${shot('theater-save','演出结束后，为故事命名并确认收藏')}<p>演出完成后开放命名与收藏入口，再到本地作品查看回放。</p></article></div>
<div class="zz-support-grid">${shot('theater-finished','第六句结束后显示演出完成，收藏入口可用','','演出前与进行中不可收藏，完成后再命名。')}${shot('theater-collection','本地作品中的双角色故事与回放入口','','本地作品保留角色、场景与回放入口。')}</div><div class="zz-subtitle"><h3>社区作品浏览</h3><p>首页展示四个双角色示例作品，可按精选、最近上新与治愈分类筛选，并进入独立回放。</p></div>${shot('community-home','首页作品社区：四个双角色故事、作者、分类筛选与播放入口')}<div class="zz-subtitle"><h3>作品回放与创作入口</h3><p>回放页展示角色、场景和完整台词，提供播放控制与双人剧场创作入口。</p></div>${shot('community-replay','社区作品独立回放：双角色、播放控制、完整六句台词与创作入口')}
</section>
<footer class="zz-end"><p>桌崽 AI</p><div><button data-case-jump="zz-top">返回开头 ↑</button><button data-case-next>下一个作品 ↗</button></div></footer>

</div>`;}
export function bindZhuozaiCase(host){
 const scroller=host.closest('.detail-view'),toc=host.querySelector('.zz-toc');
 const links=[...toc.querySelectorAll('[data-case-jump]')];
 const indicator=document.createElement('span');
 indicator.className='zz-toc-indicator';indicator.setAttribute('aria-hidden','true');toc.append(indicator);
 const sections=links.map(link=>host.querySelector('#'+link.dataset.caseJump));
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,active=null,recenter=false;
 function trackChapter(){
  frame=0;
  if(host.hidden||scroller.hidden)return;
  const toolbar=scroller.querySelector('.detail-toolbar');
  const readingLine=scroller.getBoundingClientRect().top+toolbar.offsetHeight+toc.offsetHeight+24;
  let current=sections[0];
  for(const section of sections){if(section.getBoundingClientRect().top<=readingLine)current=section;else break;}
  if(scroller.scrollHeight-scroller.clientHeight-scroller.scrollTop<=3)current=sections[sections.length-1];
  const changed=current!==active;
  if(changed){
   active=current;
   links.forEach(link=>{const on=link.dataset.caseJump===current.id;link.classList.toggle('is-active',on);if(on)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  if(changed||recenter){
   const link=links.find(link=>link.dataset.caseJump===current.id),box=link.getBoundingClientRect(),navBox=toc.getBoundingClientRect();
   indicator.style.width=`${link.offsetWidth}px`;
   indicator.style.top=`${link.offsetTop+link.offsetHeight-3}px`;
   indicator.style.transform=`translateX(${link.offsetLeft}px)`;
   if(!indicator.classList.contains('is-ready')){
    indicator.getBoundingClientRect();
    indicator.classList.add('is-ready');
   }
   if(toc.scrollWidth>toc.clientWidth&& (changed||box.left<navBox.left+12||box.right>navBox.right-12)){
    const left=toc.scrollLeft+box.left-navBox.left-(toc.clientWidth-box.width)/2;
    toc.scrollTo({left:Math.max(0,Math.min(toc.scrollWidth-toc.clientWidth,left)),behavior:reduced.matches?'auto':'smooth'});
   }
   recenter=false;
  }
 }
 function scheduleTrack(){if(!frame)frame=requestAnimationFrame(trackChapter);}
 scroller.addEventListener('scroll',scheduleTrack,{passive:true});
 host.addEventListener('toggle',scheduleTrack,true);
 host.addEventListener('load',scheduleTrack,true);
 const resize=new ResizeObserver(()=>{recenter=true;scheduleTrack();});
 resize.observe(host);resize.observe(toc);resize.observe(scroller);
 new MutationObserver(()=>{recenter=true;scheduleTrack();}).observe(scroller,{attributes:true,attributeFilter:['hidden','class']});
 scheduleTrack();
}
