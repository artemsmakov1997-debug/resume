'use strict';
const data=window.portfolio;
const $=s=>document.querySelector(s);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const dialog=$('#viewer');let previousFocus;let videoController;let videoObjectUrl;
function openViewer(title,kind,nodes){previousFocus=document.activeElement;$('#viewer-title').textContent=title;$('#viewer-kind').textContent=kind;$('#viewer-body').replaceChildren(...nodes);dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;$('#viewer-title').focus();updatePreviewPlayback();}
function closeViewer(){dialog.close();}
$('.close').addEventListener('click',closeViewer);
dialog.addEventListener('close',()=>{dialog.querySelectorAll('iframe').forEach(frame=>frame.remove());videoController?.abort();videoController=undefined;dialog.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});if(videoObjectUrl){URL.revokeObjectURL(videoObjectUrl);videoObjectUrl=undefined;}document.body.classList.remove('modal-open');previousFocus?.focus();updatePreviewPlayback();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeViewer();}});
function safeUrl(value){try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
// Silent moving covers. Playback can always be paused by the visitor.
const previewVideos=[];
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let previewsPaused=reducedMotion.matches;
let previewToggle;
function updatePreviewPlayback(){
  const shouldPlay=!previewsPaused&&!document.hidden&&!dialog.open;
  previewVideos.forEach(video=>{
    if(shouldPlay){video.muted=true;video.play().catch(()=>{/* The poster and click-to-open remain available if autoplay is blocked. */});}
    else video.pause();
  });
  if(previewToggle){
    previewToggle.textContent=previewsPaused?'▶ Воспроизвести видео':'Ⅱ Приостановить видео';
    previewToggle.setAttribute('aria-pressed',String(previewsPaused));
  }
}
document.addEventListener('visibilitychange',updatePreviewPlayback);
reducedMotion.addEventListener('change',event=>{previewsPaused=event.matches;updatePreviewPlayback();});
function makePlayer(item){
  const video=el('video');
  video.controls=true;video.playsInline=true;video.preload='metadata';video.poster=item.image;
  return video;
}
function openProject(item,group){
  const nodes=[];
  if(item.rutubeId&&/^[a-f0-9]{32}$/.test(item.rutubeId)){
    const frame=el('iframe','embedded-video');frame.src='https://rutube.ru/play/embed/'+item.rutubeId;frame.title=item.title;frame.allow='fullscreen; picture-in-picture';frame.allowFullscreen=true;nodes.push(frame);
  }else if(item.videoParts?.length){
    const video=makePlayer(item),status=el('p','video-status','Загрузка видео — 0%');
    status.setAttribute('role','status');nodes.push(video,status);
  }else if(item.videoSrc&&safeUrl(item.videoSrc)){
    const video=makePlayer(item);video.src=item.videoSrc;nodes.push(video);
  }else{
    const large=el('img');large.src=item.image;large.alt=item.title;nodes.push(large);
  }
  nodes.push(el('p',item.demo===false?'project-description':'demo-label',item.description||(group.type==='video'?'Демонстрационная обложка. Видеофайл пока не добавлен.':'Демонстрационная обложка из макета сайта. Реальная работа будет добавлена позже.')));
  if(item.url&&safeUrl(item.url)){
    const link=el('a','button black','Открыть проект');link.classList.add('arrow-link');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';nodes.push(link);
  }
  openViewer(item.title,group.title,nodes);
  if(item.videoParts?.length)loadVideoParts(item,nodes[0],nodes[1]);
}
data.groups.forEach(group=>{
  const showcase=group.type==='showcase';
  const section=el('div','project-group'+(showcase?' showcase':'')+(group.featuredHeading?' production':''));
  const header=el('div','group-header');
  const heading=el('h3','group-title',group.title+' ');
  header.append(heading);if(group.featuredHeading)header.append(el('span','rule'));
  const grid=el('div','project-grid'+(group.items.length===2?' two':''));
  group.items.forEach(item=>{
    const wrapper=el('article','project-item');
    const card=el('button','project'+(group.type==='video'?' video':''));
    card.type='button';card.setAttribute('aria-label','Открыть: '+item.title);card.setAttribute('aria-haspopup','dialog');
    const visual=el('span','project-visual');
    if(showcase&&item.videoSrc&&safeUrl(item.videoSrc)){
      const video=el('video','project-preview');
      video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.autoplay=!previewsPaused;video.preload=previewsPaused?'none':'auto';
      video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('loop','');video.setAttribute('aria-hidden','true');video.tabIndex=-1;
      if(!previewsPaused)video.setAttribute('autoplay','');
      video.poster=item.image;video.src=item.videoSrc;visual.append(video);previewVideos.push(video);
      visual.append(el('span','preview-label','Без звука · Смотреть'),el('span','preview-expand css-arrow',''));
    }else{
      const image=el('img');image.src=item.image;image.alt=item.title+(item.demo===false?'':' — демонстрационная обложка');image.loading='lazy';visual.append(image);
      if(group.type==='video')visual.append(el('span','play','▶'));
    }
    const caption=el('span','project-caption');caption.append(el('span','',item.title),el('span','css-arrow',''));
    card.append(visual,caption);card.addEventListener('click',()=>openProject(item,group));
    const details=el('button','project-details','Что было сделано');details.type='button';details.setAttribute('aria-haspopup','dialog');details.setAttribute('aria-label','Что было сделано: '+item.title);
    details.addEventListener('click',()=>openViewer(item.title,'Что было сделано',[el('p','',item.workDone||'Описание появится чуть позже — автор готовит его.')]));
    wrapper.append(card,details);grid.append(wrapper);
  });
  if(!showcase)section.append(header);
  section.append(grid);$(group.type==='video'?'#video-groups':'#project-groups').append(section);
});
updatePreviewPlayback();

data.articles.forEach((article,index)=>{
 const card=el('article','text-card');
 const cover=el('div','text-cover');
 if(article.image){const image=el('img');image.src=article.image;image.alt=article.title;image.loading='lazy';cover.append(image);}
 else {cover.append(el('span','text-placeholder','Макет и текст скоро появятся'));}
 const heading=el('h3','',article.title);
 const read=el('button','text-read',article.pending?'Скоро':'Читать текст');if(!article.pending)read.classList.add('arrow-link');read.type='button';read.disabled=!!article.pending;
 read.addEventListener('click',()=>{const nodes=[];if(article.image){const image=el('img');image.src=article.image;image.alt=article.title;nodes.push(image);}article.paragraphs.forEach(p=>nodes.push(el(p.startsWith('«')?'blockquote':'p','',p)));openViewer(article.title,'Текст',nodes);});
 card.append(cover,heading,read);$('#article-list').append(card);
});
[...data.jobs].sort((a,b)=>parseInt(b[0],10)-parseInt(a[0],10)).forEach(([year,name,role])=>{const job=el('div','job'),body=el('div');body.append(el('h3','',name),el('p','',role));job.append(el('span','job-year',year),body);$('#timeline').append(job);});


// Assemble the unchanged MP4 bytes uploaded in transport-sized parts.
async function loadVideoParts(item,video,status){
 videoController?.abort();const controller=new AbortController();videoController=controller;
 try{
  const buffers=[];let loaded=0;
  for(const path of item.videoParts){
   const url=safeUrl(path);if(!url)throw Error('Invalid media URL');
   const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Media unavailable');
   const buffer=await response.arrayBuffer();buffers.push(buffer);loaded+=buffer.byteLength;
   status.textContent='Загрузка видео — '+Math.min(100,Math.round(loaded/item.videoBytes*100))+'%';
  }
  if(controller.signal.aborted||!dialog.open)return;
  if(loaded!==item.videoBytes)throw Error('Incomplete video');
  videoObjectUrl=URL.createObjectURL(new Blob(buffers,{type:'video/mp4'}));video.src=videoObjectUrl;video.load();
  status.textContent='Видео готово. Нажмите ▶ для воспроизведения.';
  video.addEventListener('play',()=>{status.hidden=true;},{once:true});
 }catch(error){
  if(error.name==='AbortError')return;
  status.replaceChildren(document.createTextNode('Не удалось загрузить видео. Проверьте соединение. '));
  const retry=el('button','button outline','Повторить');retry.type='button';retry.addEventListener('click',()=>loadVideoParts(item,video,status));status.append(retry);
 }
}


/* Resume details open in a separate overlay: no page reflow. */
const resumeDialog=document.getElementById('resume-dialog');
const resumeClose=resumeDialog.querySelector('.resume-dialog-close');
const heroPanelButtons=[...document.querySelectorAll('.hero-menu-button')];
function showResumePanel(name){
 const target=document.getElementById('hero-'+name);
 if(!target)return;
 heroPanelButtons.forEach(button=>{
   const active=button.dataset.panel===name;
   button.setAttribute('aria-expanded',String(active));
 });
 resumeDialog.querySelectorAll('.hero-panel').forEach(panel=>{
   const active=panel===target;
   panel.classList.toggle('is-open',active);
   panel.inert=!active;
 });
 if(!resumeDialog.open)resumeDialog.showModal();
 resumeDialog.scrollTop=0;
}
heroPanelButtons.forEach(button=>button.addEventListener('click',()=>showResumePanel(button.dataset.panel)));
resumeClose.addEventListener('click',()=>resumeDialog.close());
resumeDialog.addEventListener('click',event=>{
 if(event.target===resumeDialog){
  const box=resumeDialog.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)resumeDialog.close();
 }
});
resumeDialog.addEventListener('close',()=>{
 heroPanelButtons.forEach(button=>button.setAttribute('aria-expanded','false'));
});
document.querySelectorAll('[data-open-panel]').forEach(link=>link.addEventListener('click',event=>{
 event.preventDefault();
 showResumePanel(link.dataset.openPanel);
}));

/* Mobile card navigation supplements native touch swiping. */
function attachMobileCarousel(container){
 if(!container||container.children.length<2)return;
 const controls=el('div','mobile-carousel-controls');
 const count=el('span','mobile-carousel-count');
 const previous=el('button','', '←'),next=el('button','','→');
 previous.type='button';next.type='button';
 previous.setAttribute('aria-label','Предыдущая карточка');
 next.setAttribute('aria-label','Следующая карточка');
 controls.append(count,previous,next);
 container.insertAdjacentElement('afterend',controls);
 const items=[...container.children];
 const getIndex=()=>{
  const left=container.scrollLeft;
  let closest=0,dist=Infinity;
  items.forEach((item,i)=>{const delta=Math.abs(item.offsetLeft-items[0].offsetLeft-left);if(delta<dist){dist=delta;closest=i;}});
  return closest;
 };
 const update=()=>{
  const index=getIndex();
  count.textContent=(index+1)+' / '+items.length;
  previous.disabled=index===0;next.disabled=index===items.length-1;
 };
 function move(delta){
  const index=Math.max(0,Math.min(items.length-1,getIndex()+delta));
  container.scrollTo({left:items[index].offsetLeft-items[0].offsetLeft,behavior:reducedMotion.matches?'instant':'smooth'});
 }
 previous.addEventListener('click',()=>move(-1));
 next.addEventListener('click',()=>move(1));
 container.addEventListener('scroll',update,{passive:true});
 window.addEventListener('resize',update);
 update();
}
attachMobileCarousel(document.querySelector('#article-list'));
attachMobileCarousel(document.querySelector('.video-section .production .project-grid'));
