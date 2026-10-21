import { captures } from './captures.js';
export const zhuozaiProject={number:'01',slug:'zhuozai-ai',title:'桌崽 AI',cnTitle:'AI 陪伴产品设计',category:'AI 陪伴 · 产品与交互',year:'2026',role:'产品与交互复盘',duration:'持续迭代',description:'从角色交流到日常陪伴，探索视频事件、共同记忆与桌面陪伴的产品路径。',challenge:'怎样把一次角色交流，延续成有上下文、有共同经历、也能由用户掌控节奏的陪伴？',approach:'围绕关键场景呈现界面与交互，说明角色交流、情绪回应与日常陪伴的设计。',outcomes:['连接角色交流与日常陪伴','梳理核心交互的连续性','呈现关键设计取舍'],tone:'#ffe344',coverStyle:'companion',mark:'Z—01'}; // taste-skill-ignore: Existing portfolio project index, retained for route metadata.
const base='cases/zhuozai/media/';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shot(name,alt,cls='',caption=''){
 const m=captures[name];if(!m)throw Error('Missing capture: '+name);
 const src=base+'flows/'+name+'.webp';
 const focus=captures[name+'-focus'],display=focus?base+'flows/'+name+'-focus.webp':src,dm=focus||m;
 return `<figure class="zz-shot ${cls}" style="--capture-width:${dm.width}px"><div class="zz-media-viewport" tabindex="0" role="region" aria-label="${esc(alt)}，可横向查看"><button type="button" class="zz-image" data-zz-view="${src}" data-zz-caption="${esc(alt)}" aria-label="放大查看：${esc(alt)}"><img src="${display}" width="${dm.width}" height="${dm.height}" alt="${esc(alt)}" loading="lazy" decoding="async"><span class="zz-enlarge" aria-hidden="true">↗</span></button></div>${caption?`<figcaption>${caption}</figcaption>`:''}</figure>`;
}
const chapter=(title,lead)=>`<header class="zz-chapter-head"><h2>${title}</h2><p>${lead}</p></header>`;
const note=(title,text)=>`<p class="zz-note"><strong>${title}。</strong>${text}</p>`;
const label=(n,title)=>`<div class="zz-panel-label"><span aria-hidden="true">${n}</span><h3>${title}</h3></div>`;
const nav=[['context','产品定位'],['meet','角色发现'],['chat','文字对话'],['call','视频与事件'],['memory','共同记忆'],['pet','桌面陪伴'],['theater','双人剧场']];
export function renderZhuozaiCase(){return `<div class="zz-case">
<header class="zz-cover" id="zz-top">
 <div class="zz-cover-title"><div><h1 id="zz-title">桌崽 <span>AI</span></h1></div><div class="zz-cover-intro"><p>角色交流与日常陪伴</p><span>让聊天、共同经历与桌面陪伴，<br>围绕同一个角色延续。</span><button type="button" data-case-jump="zz-call">查看重点设计 <span aria-hidden="true">↗</span></button></div></div>
 <div class="zz-cover-stage">${shot('call-event','桌崽视频通话：角色、消息与独立事件窗口','zz-cover-ui')}</div>
 <p class="zz-cover-caption">产品与交互设计<span>点击界面可查看原图</span></p>
</header>
<nav class="zz-toc" aria-label="桌崽案例章节">${nav.map(([id,t])=>`<button type="button" data-case-jump="zz-${id}">${t}</button>`).join('')}</nav>
<section id="zz-context" class="zz-section zz-context">
${chapter('产品定位','面向喜欢角色互动的用户，让 AI 陪伴融入情绪与日常。')}
<div class="zz-context-statement"><h3>懂你的心情，<br>陪你过日常。</h3><p>让 AI 角色成为可以分享心情的日常伙伴。用对话回应此刻的情绪，用共同记忆珍藏在意的片段；忙碌时，也能以桌面陪伴的方式安静相伴。</p></div>
<div class="zz-journey">${[['认识角色','推荐或创建','meet'],['开始交流','文字与视频','chat'],['经历事件','回应与退出','call'],['留下记忆','收藏与整理','memory'],['日常陪伴','形态与控制','pet']].map(([t,d,id])=>`<button data-case-jump="zz-${id}"><strong>${t}</strong><small>${d}</small><span aria-hidden="true">↗</span></button>`).join('')}</div>
<p class="zz-context-principle"><strong>设计重点是交流的连续性与用户的控制权。</strong>角色设定、消息和事件保持衔接；中断、退出和收起都有明确入口。</p>
</section>
<section id="zz-meet" class="zz-section zz-meet">
${chapter('角色发现与创建','选择已有角色，或分步创建自己的角色，随后进入同一套交流体验。')}
<div class="zz-discover-layout"><div class="zz-discover-display">${shot('discover','发现页：推荐角色、场景分类、搜索和角色卡片')}</div><div class="zz-discover-notes"><h3>先认识，再开始交流。</h3>${note('推荐与筛选','推荐位帮助直接开始，分类与搜索照顾已有偏好。')}${shot('role-detail','角色详情：查看设定、开始聊天、邀请到桌面','zz-role-detail')}${note('两种去向','查看设定后，可以开始聊天，也可以邀请角色到桌面。')}</div></div>
<div class="zz-subtitle"><h3>分步创建角色</h3><p>形象、性格与确认分开处理，每一步保留预览。</p></div>
<div class="zz-creation-story">${[['create-look','1','选择形象','选择预置形象，或使用自己的图片。'],['create-personality','2','补充性格','填写名字与背景，草稿可暂存。'],['create-confirm','3','确认创建','复核设定与电量消耗，进入首次对话。']].map(([im,n,t,d])=>`<article>${label(n,t)}${shot(im,t+'的实际界面')}<p>${d}</p></article>`).join('')}</div>
<details class="zz-support" open><summary>草稿、校验与首次对话 <span>＋</span></summary><div class="zz-support-grid">${shot('create-validation','必填内容缺失时，表单内提示并聚焦待补字段','','必填内容就地提示，保留已填写内容。')}${shot('create-first-chat','新角色创建完成后进入首次对话','','创建完成，由角色问候承接。')}</div><p>草稿可以继续填写。</p></details>
</section>
<section id="zz-chat" class="zz-section zz-chat">
${chapter('文字对话','从开口到等待回应，状态清楚，表达可以保留。')}
<div class="zz-chat-layout"><div class="zz-chat-art">${shot('chat-focus','文字聊天主界面：消息、收藏入口和话题建议')}</div><div class="zz-chat-notes">${note('建议先进入草稿','话题可以改写后再发送，未发送的内容在切页后保留。')}${note('等待可以中断','回应中提供“停止回应”，未完成回复的电量退回。')}${shot('chat-waiting-detail','等待回复时输入区域出现停止回应入口','zz-detail-strip')}${note('消息可以收藏','从角色回复直接生成记忆，不必再次输入。')}<div class="zz-draft-proof">${shot('chat-draft','离开聊天后恢复未发送的草稿')}</div></div></div>
<p class="zz-inline-rule"><strong>输入确认。</strong>语音识别结果先进入草稿，由用户确认发送；输入法组合态不会被 Enter 误提交。</p>
</section>
<section id="zz-call" class="zz-section zz-call">
${chapter('视频通话与关系事件','角色画面、消息与事件独立分区，让交流与共同经历自然衔接。')}
<div class="zz-call-regions"><span>角色画面</span><span>消息与输入</span><span>事件起因与进度</span></div>
${shot('call-event','视频通话布局：固定角色画面、连续消息、右侧独立事件窗口','zz-call-main')}
<p class="zz-call-explanation">事件开始、推进和结束时，视频尺寸与比例保持不变。文字与视频共享消息，用户始终在同一个输入框回应。</p>
<div class="zz-subtitle"><h3>事件的三个状态</h3><p>起因持续可见，回应更新进度，完成后回到日常交流。</p></div>
<div class="zz-event-story">${[['event-start-current','1','说明起因'],['event-progress-current','2','反馈回应'],['event-success-current','3','完成事件']].map(([im,n,t])=>`<article>${label(n,t)}${shot(im,t+'的事件卡片')}</article>`).join('')}</div>
<div class="zz-event-policy"><div><h3>事件未完成，<br>亲密度保持不变。</h3><p>三轮后仍未完成，可以暂时搁置。普通回应未命中关键词时不会扣除进度，避免一次事件影响整段关系。</p><p class="zz-small">成功奖励 6 点亲密度，进行中也可以退出。</p></div>${shot('event-paused','事件暂时搁置，亲密度不变，可以继续日常聊天')}</div>
<details class="zz-support" open><summary>连接、结束与返回聊天 <span>＋</span></summary><div class="zz-support-grid">${shot('call-connecting','正在连接：状态可见，接通前暂不输入','','连接可取消，接通后恢复输入。')}${shot('call-ended','结束通话：回到聊天或再次拨打','','挂断后可以返回聊天，或再次拨打。')}</div></details>
</section>
<section id="zz-memory" class="zz-section zz-memory">
${chapter('共同记忆','把交流中的一句话留下来，整理成可以再次找到的记录。')}
<div class="zz-memory-flow"><span>收藏原句</span><i aria-hidden="true">→</i><span>编辑记忆</span><i aria-hidden="true">→</i><span>分类查找</span></div>
<div class="zz-memory-cards">${shot('memory-collection','三种共同记忆：日常碎片、共同约定、心动时刻','zz-memory-wide')}<div class="zz-memory-mobile">${['日常碎片','共同约定','心动时刻'].map((t,i)=>shot('memory-collection',t+'记忆卡片','zz-memory-single zz-memory-single-'+i)).join('')}</div></div>
<div class="zz-memory-edit"><div>${shot('memory-edit','编辑共同记忆：标题、角色、分类与原句内容')}</div><div><h3>保留来源，允许改写。</h3><p>收藏带入角色、原句与时间。用户可以修改标题、补充内容，再按角色、类别和关键词查找。</p><div class="zz-memory-search">${shot('memory-filter-controls','共同记忆筛选：澄夏、共同约定与关键词日落')}</div></div></div>
<details class="zz-support" open><summary>删除前确认 <span>＋</span></summary>${shot('memory-delete','删除共同记忆前，确认去留并提供取消入口','zz-compact-shot')}</details>
</section>
<section id="zz-pet" class="zz-section zz-pet">
${chapter('桌面陪伴','从主动交流转向日常陪伴，由用户调整角色的形态与打扰程度。')}
<div class="zz-pet-scene">${shot('pet-overview','桌面陪伴场景：可移动角色、回复气泡和陪伴控制器')}</div>
<div class="zz-subtitle"><h3>三种形态，一套控制。</h3><p>形态改变显示面积，输入、角色选择和暂停操作保持一致。</p></div>
<div class="zz-pet-modes">${[['pet-full','全身模式','完整展示角色，增强视觉陪伴。'],['pet-avatar','头像模式','保留角色识别，减少纵向占用。'],['pet-small','轻巧模式','缩小形象，保留气泡与快捷交流。']].map(([im,t,d])=>`<article><h3>${t}</h3><div class="zz-pet-device">${shot(im,t+'的角色形象与控制器')}</div><p>${d}</p></article>`).join('')}</div>
<div class="zz-pet-control"><div><h3>陪伴可以暂时收起</h3><div class="zz-control-list"><p><strong>暂停</strong><span>暂停动作，保留输入与控制。</span></p><p><strong>隐藏界面</strong><span>隐藏面板，保留角色与恢复入口。</span></p><p><strong>收起</strong><span>缩成小角色，展开后恢复原模式。</span></p><p><strong>移动与交流</strong><span>拖动调整位置，快捷输入或进入完整聊天。</span></p></div></div><div class="zz-collapse-evidence">${shot('pet-collapsed','桌面角色收起后的实际状态')}<p>收起后，保留展开入口。</p></div></div>
<details class="zz-support" open><summary>快捷回应、暂停与隐藏恢复 <span>＋</span></summary><div class="zz-support-grid">${shot('pet-reply','桌面快捷交流后的气泡回应','zz-compact-shot')}${shot('pet-paused','暂停动作后的顶部状态与继续陪伴入口')}${shot('pet-hidden','隐藏控制面板后，顶部保留恢复入口')}${shot('pet-character','切换角色后的形象、问候与聊天入口','zz-compact-shot')}</div><p>支持拖动和方向键微调。</p></details>
</section>
<section id="zz-theater" class="zz-section zz-theater">
${chapter('双人剧场','设定两位主角与开场情节，观看演出，再收藏自己的故事。')}
<div class="zz-theater-stage">${shot('theater-playing','双人剧场：模糊场景背景、双角色、当前台词与播放控制','zz-theater-focus')}<p class="zz-stage-caption">模糊背景营造场景，当前说话者与台词保持对应。</p></div>
<div class="zz-theater-story"><article>${label('1','设定故事')}<div class="zz-setup-evidence">${shot('theater-setup-panel','选择场景、编辑开场并邀请两位不同角色')}</div><p>预置场景提供起点，开场与角色由用户决定。</p></article><article>${label('2','控制演出')}<div class="zz-play-evidence">${shot('theater-play-controls','剧场的暂停、前后句、速度与台词控制')}${shot('theater-transcript-detail','展开已发生的三句台词，回看角色与上下文')}</div><p>暂停、回看与调速，台词记录保留上下文。</p></article><article>${label('3','命名并收藏')}${shot('theater-save','演出结束后，为故事命名并收藏到放映室')}<p>演出结束后命名，收藏到放映室回放。</p></article></div>
<p class="zz-inline-rule">剧场支持故事设定、演出控制与收藏回放。</p>
</section>
<footer class="zz-end"><p>桌崽 AI</p><div><button data-case-jump="zz-top">返回开头 ↑</button><button data-case-next>下一个作品 ↗</button></div></footer>
<dialog class="zz-viewer" aria-label="界面原图查看"><div class="zz-viewer-bar"><p></p><div><button type="button" data-zz-zoom aria-pressed="false">原始大小</button><button type="button" data-zz-close aria-label="关闭原图">关闭 ×</button></div></div><div class="zz-viewer-scroll"><img alt=""></div></dialog>
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
 const viewer=host.querySelector('.zz-viewer'),img=viewer.querySelector('img'),zoom=viewer.querySelector('[data-zz-zoom]');
 host.addEventListener('click',e=>{const view=e.target.closest('[data-zz-view]');if(view){img.src=view.dataset.zzView;img.alt=view.dataset.zzCaption;viewer.querySelector('.zz-viewer-bar p').textContent=view.dataset.zzCaption;viewer.classList.remove('is-zoomed');zoom.setAttribute('aria-pressed','false');zoom.textContent='原始大小';viewer.showModal();return;}if(e.target.closest('[data-zz-close]'))viewer.close();if(e.target.closest('[data-zz-zoom]')){const on=viewer.classList.toggle('is-zoomed');zoom.setAttribute('aria-pressed',String(on));zoom.textContent=on?'适应窗口':'原始大小';}});
 viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
 window.addEventListener('hashchange',()=>{if(viewer.open&&location.hash!=='#zhuozai-ai')viewer.close();});
 document.addEventListener('keydown',e=>{if(viewer.open&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();viewer.close();}},true);
}
