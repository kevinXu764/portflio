import {zhuozaiProject,renderZhuozaiCase,bindZhuozaiCase} from './cases/zhuozai/case.js';
import {yanshujuProject,renderYanshujuCase,bindYanshujuCase} from './cases/yanshuju/case.js';
import {yunongProject,renderYunongCase,bindYunongCase} from './cases/yunong/case.js';
import {watchMedia,setupImagePreview} from './media.js';

const cases=[
 {project:zhuozaiProject,render:renderZhuozaiCase,bind:bindZhuozaiCase,id:'zhuozai'},
 {project:yanshujuProject,render:renderYanshujuCase,bind:bindYanshujuCase,id:'yanshuju'},
 {project:yunongProject,render:renderYunongCase,bind:bindYunongCase,id:'yunong'}
];
const slug=new URLSearchParams(location.search).get('work');
const index=cases.findIndex(item=>item.project.slug===slug);
const scroller=document.querySelector('.detail-view');
const url=project=>'detail.html?work='+encodeURIComponent(project.slug);
if(index<0){
 document.querySelector('#not-found').hidden=false;
 document.title='作品暂未提供 · 徐自泉';
}else{
 const item=cases[index],project=item.project;
 // Return from adjacent case navigation to the matching gallery card.
 try{
  const key='portfolio.branch2.return.v1';
  let previousState;
  try{previousState=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}
  sessionStorage.setItem(key,JSON.stringify({version:1,selected:index,phase:index,progress:1,playing:typeof previousState?.playing==='boolean'?previousState.playing:true}));
 }catch{} // Storage may be disabled for local files or private browsing.

 const host=document.querySelector('#case-content');
 host.id=item.id+'-case';
 document.title=project.title+' · 徐自泉的作品集';
 document.querySelector('meta[name="description"]').content=project.description;
 document.querySelector('#detail-name').textContent=project.title;
 document.querySelector('#detail-count').textContent=String(index+1).padStart(2,'0')+' / 03';
 document.querySelector('#project').hidden=false;
 scroller.classList.add('is-'+item.id);
 host.innerHTML=item.render();
 watchMedia(host);
 setupImagePreview(host);
 item.bind(host);
 const previous=cases[(index+cases.length-1)%cases.length].project;
 const next=cases[(index+1)%cases.length].project;
 for(const [id,data] of [['previous-project',previous],['next-project',next]]){
  const link=document.getElementById(id);link.href=url(data);link.querySelector('strong').textContent=data.title;
 }
 host.addEventListener('click',event=>{
  const nextButton=event.target.closest('[data-case-next]');
  if(nextButton){location.href=url(next);return;}
  const jump=event.target.closest('[data-case-jump]');
  if(!jump)return;
  const target=host.querySelector('#'+jump.dataset.caseJump);
  if(!target)return;
  const top=jump.dataset.caseJump==='zz-top'?0:scroller.scrollTop+target.getBoundingClientRect().top-scroller.getBoundingClientRect().top-document.querySelector('.detail-toolbar').offsetHeight-host.querySelector('.zz-toc').offsetHeight-12;
  scroller.scrollTo({top,behavior:'instant'});
 });
 const toolbar=document.querySelector('.detail-toolbar');
 const syncToolbar=()=>scroller.style.setProperty('--detail-toolbar-height',toolbar.offsetHeight+'px');
 new ResizeObserver(syncToolbar).observe(toolbar);syncToolbar();
}
