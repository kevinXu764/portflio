import { captures } from './captures.js';
export const zhuozaiProject={number:'01',slug:'zhuozai-ai',title:'桌崽 AI',cnTitle:'AI 陪伴产品设计',category:'AI 陪伴 · 产品与交互',year:'2026',role:'产品与交互复盘',duration:'持续迭代',description:'展示角色创建、文字与视频交流、关系事件、共同记忆和桌面陪伴的功能与交互设计。',challenge:'怎样把一次角色交流，延续成有上下文、有共同经历、也能由用户掌控节奏的陪伴？',approach:'围绕角色、交流、事件、记忆与桌面陪伴组织产品路径，并用关键界面与状态说明设计取舍。',outcomes:['梳理核心产品路径','呈现关键交互与状态','说明功能取舍与待验证问题'],tone:'#6541ce',mark:'Z—01'};
const base='cases/zhuozai/';
const heading=(n,en,title)=>`<header class="zz-section-heading"><span>${n} / ${en}</span><h2>${title}</h2></header>`;
function shot(name,{alt='',notes=true,caption='',className=''}={}){
 const m=captures[name];if(!m)throw Error('Missing UI capture '+name);
 return `<figure class="zz-shot ${className}"><div class="zz-shot-frame" style="--shot-width:${m.width}px"><a href="${base}media/flows/${name}.png" target="_blank" rel="noopener" aria-label="查看原图：${alt}"><img src="${base}media/flows/${name}.png" width="${m.width}" height="${m.height}" alt="${alt}" loading="lazy" decoding="async"></a>${notes?m.pins.map((p,i)=>`<span class="zz-pin" style="--x:${p.x}%;--y:${p.y}%" aria-hidden="true">${i+1}</span>`).join(''):''}</div>${caption?`<figcaption>${caption}<span>查看原图 ↗</span></figcaption>`:''}${notes&&m.pins.length?`<ol class="zz-shot-notes">${m.pins.map(p=>`<li><div><b>${p.label}</b><p>${p.detail}</p></div></li>`).join('')}</ol>`:''}</figure>`;
}
function gallery(id,label,items,selected=0){return `<div class="zz-gallery" data-flow-gallery="${id}"><div class="zz-gallery-label"><span>${label}</span><small>点击步骤，查看实际界面</small></div><div class="zz-gallery-tabs" role="tablist" aria-label="${label}">${items.map((s,i)=>`<button type="button" role="tab" id="${id}-tab-${i}" aria-controls="${id}-panel-${i}" aria-selected="${i===selected}" tabindex="${i===selected?0:-1}" data-flow-tab="${i}"><span>${String(i+1).padStart(2,'0')}</span>${s.title}</button>`).join('')}</div>${items.map((s,i)=>`<section class="zz-gallery-panel" role="tabpanel" id="${id}-panel-${i}" aria-labelledby="${id}-tab-${i}" ${i!==selected?'hidden':''}><div class="zz-step-explanation"><strong>${s.head||s.title}</strong><p>${s.text}</p></div>${shot(s.image,{alt:s.alt||s.title,notes:s.notes!==false,caption:s.caption||''})}</section>`).join('')}</div>`;}
const sub=(kicker,title,text)=>`<div class="zz-subheading"><span>${kicker}</span><h3>${title}</h3>${text?`<p>${text}</p>`:''}</div>`;
export function renderZhuozaiCase(){return `<div class="zz-case">
<header class="zz-cover"><div class="zz-cover-copy"><p class="zz-kicker"><span>PRODUCT CASE 01</span> AI COMPANION</p><h1 id="zz-title">桌崽 AI<span>AI 陪伴产品<br>设计复盘</span></h1><p class="zz-cover-lede">围绕角色交流与日常陪伴，<br>展示核心功能、操作流程和设计调整。</p><div class="zz-tags"><span>产品路径</span><span>核心交互</span><span>界面设计</span></div><button type="button" class="zz-button zz-button-dark" data-case-jump="zz-context">查看产品流程 <span>↓</span></button></div><div class="zz-cover-art" aria-hidden="true"><span class="zz-art-orbit"></span><span class="zz-art-star">✳</span><span class="zz-art-caption">AI COMPANION.<br>PRODUCT DESIGN.</span><img src="${base}media/chengxia.png" alt=""><span class="zz-art-ticket">澄夏的日常频道 <b>ON AIR ●</b></span></div></header>
<div class="zz-intro-strip"><div><span>案例类型</span><strong>既有项目复盘与原型探索</strong></div><div><span>体验主线</span><strong>相遇 → 交流 → 日常陪伴</strong></div><div><span>呈现方式</span><strong>产品决策 × 关键界面 × 交互状态</strong></div></div>
<nav class="zz-toc" aria-label="桌崽案例章节">${[['context','产品定位'],['meet','角色发现'],['chat','文字对话'],['call','视频与事件'],['memory','共同记忆'],['pet','桌面陪伴'],['theater','双人剧场'],['validation','验证与优化']].map(([id,t],i)=>`<button data-case-jump="zz-${id}">${String(i+1).padStart(2,'0')} ${t}</button>`).join('')}</nav>
<div class="zz-reading">
<section id="zz-context" class="zz-section">
${heading('01','PRODUCT JOURNEY','产品定位与核心流程')}
<p class="zz-lead">桌崽把角色发现、交流、记忆和桌面陪伴连接起来。围绕这条使用路径，本次复盘关注三个问题：怎样开始交流，怎样保持上下文，怎样让陪伴适应用户的日常节奏。</p>
<div class="zz-context-grid"><div><span class="zz-small-label">使用场景假设</span><h3>日常交流与持续陪伴需求</h3><p>喜欢角色互动的使用者，可能在工作间隙分享小事，也可能想找一个安静的同伴。需求强度与具体人群仍需进一步验证。</p></div><div class="zz-observation"><span class="zz-small-label">原作品中的体验观察</span><p>“多轮对话后，用户容易忘记角色为什么不高兴。”</p><small>来源：原作品组件说明。它提示我们：新玩法需要保留情节，而不是要求用户反复回忆。</small></div></div>
<div class="zz-product-map" aria-label="核心产品路径">${[['discover','meet','认识或创造','选择一个愿意开口的对象'],['chat-reply','chat','开始交流','文字与视频延续同一角色'],['call-event','call','经历事件','在对话中理解、回应和退出'],['memory-collection','memory','留下记忆','收藏并整理共同经历'],['pet-full','pet','陪在日常','调整形态、位置与陪伴强度']].map(([img,id,t,d],i)=>`<button data-case-jump="zz-${id}"><div><img src="${base}media/flows/${img}.png" alt="" loading="lazy"></div><span>0${i+1}</span><strong>${t}</strong><small>${d}</small></button>`).join('')}</div>
<div class="zz-scope-note"><b>主次安排</b><p>核心篇幅放在角色交流、事件连续性，以及记忆与桌面陪伴的承接；双人剧场作为角色内容的扩展探索，单独展示创作与回放路径。</p></div>
</section>
<section id="zz-meet" class="zz-section">
${heading('02','MEET & CREATE','角色发现与创建')}
<p class="zz-lead">为“想快速开始”和“想亲自定义角色”保留两种入口。前者从推荐与筛选开始，后者通过分步创建建立自己的角色。</p>
${shot('discover',{alt:'角色发现页：推荐、场景分类、搜索与角色卡片',caption:'发现页用角色形象建立第一印象，再通过标签与简介辅助选择。'})}
<div class="zz-ui-pair zz-meet-pair"><article>${sub('角色详情','角色信息与互动入口','角色详情集中呈现介绍，并提供开始对话和邀请到桌面的入口。')}${shot('role-detail',{alt:'角色详情及聊天和桌面入口',notes:false})}</article><article>${sub('角色收藏','收藏与再次访问','喜欢的角色进入“我的角色”，让再次寻找有明确的落点。')}${shot('role-library',{alt:'我的角色中收藏的澄夏',notes:false,className:'zz-library-shot'})}</article></div>
${sub('CREATE A CHARACTER','角色创建的三个步骤','形象、设定、确认依次推进；右侧预览保持可见，帮助用户把抽象设定和具体角色对应起来。')}
${gallery('creator','创建角色的主流程',[
 {title:'选择形象',image:'create-look',text:'选择预置形象或上传图片；预览随选择更新。'},
 {title:'赋予性格',image:'create-personality',text:'填写名字、背景和性格气质，边输入边查看结果。声音印象在当前原型中作为设定保存。'},
 {title:'确认与消耗',image:'create-confirm',text:'集中复核设定，说明创建消耗 30 点电量；仍可返回上一步修改。'},
 {title:'进入初次对话',image:'create-first-chat',text:'创建完成后直接进入新角色的聊天页，用角色问候承接创建过程。',notes:false}
],1)}
<div class="zz-detail-note"><b>创建草稿与表单校验</b><p>草稿可以保存，离开后继续填写；必填内容缺失时在表单内提示，并把焦点移到需要补充的字段。</p><details><summary>展开查看表单校验界面</summary>${shot('create-validation',{alt:'未填写名字和角色设定时的表单校验提示',notes:false})}</details></div>
</section>
<section id="zz-chat" class="zz-section">
${heading('03','EVERYDAY CONVERSATION','文字对话与消息管理')}
<p class="zz-lead">对话是产品的主要活动。话题建议、输入、等待反馈和消息收藏围绕同一条消息流展开，让用户始终知道接下来能做什么。</p>
${gallery('conversation','文字交流的关键状态',[
 {title:'选择话题',image:'chat-start',text:'话题建议先填入输入框，用户可以改写后再发送。右侧保留角色关系与后续入口。'},
 {title:'等待回应',image:'chat-thinking',text:'发送后出现“正在想怎么回应你”的状态，输入区域提供停止回应。',notes:false},
 {title:'收到回复',image:'chat-reply',text:'回复回到原消息流；有意义的句子可以直接收藏，完整回复后再更新亲密度。'},
 {title:'中断回应',image:'chat-cancel',text:'用户主动停止后不再追加迟到回复，未完成回复对应的 2 点电量退回。',notes:false}
])}
<div class="zz-inline-evidence"><div><span class="zz-small-label">保持操作连续性</span><h3>聊天草稿的保存与恢复</h3><p>切换页面后恢复未发送草稿；停止一轮回应也不要求重新进入聊天。</p></div>${shot('chat-draft',{alt:'离开并返回后恢复的聊天草稿',notes:false})}</div>
<div class="zz-design-points"><div><b>输入与确认</b><p>Enter 发送，Shift + Enter 换行；中文输入法组合态不直接提交。</p></div><div><b>语音的落点</b><p>识别结果先进入输入框，由用户确认再发送；权限或能力不可用时可继续打字。</p></div><div><b>后续入口</b><p>同一角色可以继续视频交流、进入桌面陪伴，或回看共同记忆。</p></div></div>
</section>
<section id="zz-call" class="zz-section zz-core-section">
${heading('04','VIDEO & RELATIONSHIP EVENT','视频通话与关系事件')}
<p class="zz-lead">视频与事件是这次复盘的重点：角色负责情绪表达，消息负责交流，侧卡负责起因与规则。把三者分开呈现，保留同一个输入入口和稳定的角色画面。</p>
${gallery('video','视频通话与事件的连续体验',[
 {title:'正在连接',image:'call-connecting',text:'连接状态可见，接通前输入不可用；用户仍可以取消通话。',notes:false},
 {title:'已接通',image:'call-normal',text:'手机画面、文字交流和事件信息分区呈现。视频延续刚才的消息上下文。'},
 {title:'事件触发',image:'call-event',text:'对话提到忘记约定后触发事件；起因和剩余机会持续可见，用户在原输入框继续回复。'},
 {title:'回应与修复',image:'call-success',text:'回应包含道歉、理解和后续约定后，事件更新为成功状态，角色画面保持原尺寸。',notes:false},
 {title:'回到日常',image:'call-return',text:'收起本次事件的信息后仍可继续聊天，已发生的对话保留在消息流中。',notes:false},
 {title:'挂断与重拨',image:'call-ended',text:'挂断后提供回到聊天与再次拨打，区分通话结束和页面关闭。',notes:false}
],2)}
${sub('LAYOUT DECISION','视频、消息与事件的布局调整','早期方案把事件嵌在聊天面板下部，占用了消息阅读空间。当前方案将事件移到右侧，触发前后保持视频的尺寸与比例。')}
<div class="zz-comparison"><figure><div class="zz-comparison-tag">调整前 · 与消息共用面板</div><a href="${base}media/call-before.png" target="_blank" rel="noopener"><img src="${base}media/call-before.png" width="1440" height="1000" alt="调整前事件嵌入聊天面板" loading="lazy"></a><figcaption>事件内容进入聊天面板下部，压缩可阅读的消息区域。</figcaption></figure><figure><div class="zz-comparison-tag">当前 · 独立的右侧事件卡</div>${shot('call-event',{alt:'调整后独立手机画面、消息面板与右侧事件卡',notes:false})}<figcaption>规则随时可见，消息与角色画面保持各自的空间。</figcaption></figure></div>
${sub('STATE & FEEDBACK','事件进度与结果反馈','把事件的局部状态展开，能看清用户每次回应之后到底发生了什么。下列数值均为原型演示参数。')}
<div class="zz-event-states">${[
 ['event-start','01 / 事件开始','起点 40，目标 85；显示背景与 3 次回应机会。'],
 ['event-progress','02 / 过程反馈','一次认真回应后进度到 68，机会剩余 2 次。'],
 ['event-success','03 / 修复成功','达到目标后反馈亲密度 +6，并允许继续日常聊天。'],
 ['event-failed','04 / 暂时未修复','三次回应结束后给出结果与 −8 反馈，关系仍可继续。']
].map(([image,title,text])=>`<article><h3>${title}</h3>${shot(image,{alt:title,notes:false})}<p>${text}</p></article>`).join('')}</div>
<div class="zz-decision-notes"><p><b>事件退出规则</b>进行中的事件提供“稍后再聊这件事”；未完成时退出或挂断不扣亲密度。</p><p><b>额度、关系与事件进度</b>电量是使用额度，亲密度是角色关系，和好进度属于当前事件，避免把一次任务等同于整段关系。</p></div>
<div class="zz-risk"><b>事件规则的待验证问题</b><p>限次与失败扣分可能给陪伴带来压力；需要观察误触发、退出意愿和负面反馈，再决定惩罚强度与触发规则。</p></div>
</section>
<section id="zz-memory" class="zz-section">
${heading('05','SHARED MEMORIES','共同记忆的保存与管理')}
<p class="zz-lead">记忆从聊天中的收藏入口产生，再进入可编辑、可分类和可查找的回忆簿。它为一次交流提供后续的落点。</p>
${shot('memory-collection',{alt:'日常碎片、共同约定与心动时刻三张实际记忆卡片',notes:false,caption:'本页演示内容通过消息收藏与记忆表单实际创建。'})}
${gallery('memories','记忆的收藏、编辑与查找',[
 {title:'收藏到回忆簿',image:'memory-from-chat',text:'从角色聊天中收藏回复后，回忆簿带上相同角色、时间与原句内容。'},
 {title:'补充标题与分类',image:'memory-edit',text:'用户可以给瞬间起名字、调整分类和补充故事，让记录更容易被自己理解。',notes:false},
 {title:'按条件找回来',image:'memory-filter',text:'使用角色、类别与关键词筛选，找到特定约定或日常片段。',notes:false},
 {title:'删除前确认',image:'memory-delete',text:'删除前提供确认与返回入口，让记录的去留由用户决定。',notes:false}
],1)}
</section>
<section id="zz-pet" class="zz-section">
${heading('06','DESKTOP COMPANION','桌面陪伴模式与操作')}
<p class="zz-lead">桌面陪伴延续同一角色，但让用户自己决定形态、位置和出现强度。先展示三种显示模式，再展开它们共享的操作与状态。</p>
<div class="zz-pet-modes">${[
 ['pet-full','全身模式','保留完整角色形象，适合想看见角色、主动互动时使用。'],
 ['pet-avatar','头像模式','用头像承载角色识别，减少角色区域的纵向占用。'],
 ['pet-small','轻巧模式','缩小角色形象，仍保留气泡、输入与控制面板。']
].map(([image,title,text])=>`<article><div class="zz-mode-image">${shot(image,{alt:title+'及其控制面板',notes:false})}</div><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
${gallery('desktop','桌面陪伴的关键操作',[
 {title:'控制器总览',image:'pet-overview',text:'形态切换、角色选择、输入与陪伴控制集中在角色附近。'},
 {title:'移动与微调',image:'pet-drag',text:'拖动角色或名称栏后，角色和面板一起移动；方向键微调 8px，Shift + 方向键移动 24px。'},
 {title:'快捷回应',image:'pet-reply',text:'在桌面直接说一句话，角色用气泡回应；需要展开话题时进入完整聊天。',notes:false},
 {title:'暂停与继续',image:'pet-paused',text:'暂停角色动作时，顶部状态变为“正在安静休息”，按钮变为继续陪伴。',notes:false},
 {title:'隐藏与恢复',image:'pet-hidden',text:'隐藏控制界面后保留角色、气泡与顶部恢复入口；恢复后草稿仍在。'},
 {title:'收起与展开',image:'pet-collapsed',text:'收起为小角色和展开按钮；再次展开恢复原模式与控制面板。',notes:false},
 {title:'切换陪伴角色',image:'pet-character',text:'选择另一位角色后更新形象、名字与问候；完整聊天入口继续指向当前角色。',notes:false}
])}
<div class="zz-scope-note"><b>体验边界</b><p>这是网页内的桌面陪伴原型，已呈现移动、显隐和交流操作；真实系统悬浮与跨窗口感知尚未接入。</p></div>
</section>
<section id="zz-theater" class="zz-section">
${heading('07','TWO-CHARACTER THEATER','双人剧场的创作与回放')}
<p class="zz-lead">双人剧场把单角色交流扩展为角色内容创作：用户设定场景和两位主角，控制演出节奏，结束后再命名收藏。</p>
${gallery('theater','剧场设置、演出与回放',[
 {title:'设置故事',image:'theater-setup',text:'选择场景、改写开场，邀请两位不同角色。背景氛围和角色形象共同建立情节语境。'},
 {title:'控制演出',image:'theater-playing',text:'当前说话者与台词同步呈现；用户可以暂停、逐句前进、回看上一句及调整速度。',notes:false},
 {title:'查看台词',image:'theater-script',text:'演出过程中展开已发生的台词，支持回看上下文。',notes:false},
 {title:'完成与命名',image:'theater-save',text:'演出结束后为故事填写标题和简介，再保存到自己的放映室。',notes:false},
 {title:'收藏与回放',image:'theater-collection',text:'故事以作品卡的方式保留角色、场景和内容，之后可以再次打开回放。',notes:false}
])}
<div class="zz-detail-note"><b>生成、收藏与存储状态</b><p>生成中可以取消；演出未结束时收藏按钮不可用，结束后再解锁。原型中的作品保存在浏览器中，剧情由本地模板演示。</p><details><summary>查看演出结束与收藏入口</summary>${shot('theater-finished',{alt:'演出结束后的台词记录和已启用的收藏按钮',notes:false})}</details></div>
</section>
<section id="zz-validation" class="zz-section">
${heading('08','VALIDATION & REFLECTION','原型验证与后续优化')}
<div class="zz-evidence"><div><span class="zz-small-label">已完成 / 原型走查</span><h3>主流程与中断状态检查</h3><ul><li>发现、收藏、创建、交流到记忆和桌面陪伴的入口衔接。</li><li>视频连接、事件反馈、退出、挂断与重拨的状态转换。</li><li>桌面三种模式、拖动、暂停、显隐及剧场收藏路径。</li></ul></div><div><span class="zz-small-label">下一步 / 用户验证</span><h3>功能理解与使用负担</h3><ul><li>能否理解事件起因，分清退出事件与结束通话？</li><li>能否找回记忆，理解三种桌面形态与显隐操作？</li><li>是否愿意继续交流；限次、扣分或触发是否造成压力？</li></ul></div></div>
<div class="zz-design-points"><div><b>小屏信息可达性</b><p>当前手机端视频的事件卡位于聊天下方，需继续优化触发后的提醒与定位。</p></div><div><b>真实服务接入</b><p>接入模型、语音与视频后，继续验证延迟、权限、额度和异常恢复。</p></div><div><b>价值证据</b><p>结合事件参与、退出和后续交流记录开展访谈；当前没有提供线上留存或业务效果数据。</p></div></div>
</section>
<footer class="zz-end"><p class="zz-kicker">CASE NOTES</p><h2>案例说明</h2><p class="zz-case-scope">本案例基于既有项目素材与 branch2 原型整理，通过界面截图、操作步骤和编号标注展示产品设计。截图中的角色、对话和记录为演示内容；角色回应、视频与剧场使用本地模板或插画，角色素材及页面实现使用了 AI 辅助。当前内容属于项目复盘与原型探索，未提供上线后的业务结果。</p><div class="zz-end-nav"><button class="zz-back-top" data-case-jump="zz-title">回到案例开头 ↑</button><button class="zz-back-top" data-case-next>下一作品 · Brand Atlas →</button></div></footer>
</div></div>`;}
export function bindZhuozaiCase(host){
 function select(gallery,index){const tabs=[...gallery.querySelectorAll('[data-flow-tab]')];if(!tabs[index])return;tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;gallery.querySelector('#'+tab.getAttribute('aria-controls')).hidden=i!==index;});}
 host.addEventListener('click',event=>{const tab=event.target.closest('[data-flow-tab]');if(tab)select(tab.closest('[data-flow-gallery]'),Number(tab.dataset.flowTab));});
 host.addEventListener('keydown',event=>{const tab=event.target.closest('[data-flow-tab]');if(!tab||!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const gallery=tab.closest('[data-flow-gallery]'),tabs=[...gallery.querySelectorAll('[data-flow-tab]')],i=tabs.indexOf(tab);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;select(gallery,next);tabs[next].focus({preventScroll:true});});
}
