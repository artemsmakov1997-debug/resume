'use strict';
const data=window.portfolio;
const $=s=>document.querySelector(s);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const dialog=$('#viewer');let previousFocus;let videoController;let videoObjectUrl;
function openViewer(title,kind,nodes){previousFocus=document.activeElement;$('#viewer-title').textContent=title;$('#viewer-kind').textContent=kind;$('#viewer-body').replaceChildren(...nodes);dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;$('#viewer-title').focus();}
function closeViewer(){dialog.close();}
$('.close').addEventListener('click',closeViewer);
dialog.addEventListener('close',()=>{videoController?.abort();videoController=undefined;dialog.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});if(videoObjectUrl){URL.revokeObjectURL(videoObjectUrl);videoObjectUrl=undefined;}document.body.classList.remove('modal-open');previousFocus?.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeViewer();}});
function safeUrl(value){try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
data.groups.forEach(group=>{const section=el('div','project-group'),heading=el('h3','group-title',group.title+' ');heading.append(el('span','count','/ '+String(group.items.length).padStart(2,'0')));const grid=el('div','project-grid'+(group.items.length===2?' two':''));group.items.forEach(item=>{const card=el('button','project'+(group.type==='video'?' video':''));card.type='button';card.setAttribute('aria-label','Открыть: '+item.title);const visual=el('span','project-visual'),img=el('img');img.src=item.image;img.alt=item.title+(item.demo===false?'':' — демонстрационная обложка');img.loading='lazy';visual.append(img);if(group.type==='video')visual.append(el('span','play','▶'));const caption=el('span','project-caption');caption.append(el('span','',item.title),el('span','','↗'));card.append(visual,caption);card.addEventListener('click',()=>{const nodes=[];if(item.videoParts?.length){const video=el('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.poster=item.image;const status=el('p','video-status','Загрузка видео — 0%');status.setAttribute('role','status');nodes.push(video,status);}else if(item.videoSrc&&safeUrl(item.videoSrc)){const video=el('video');video.src=item.videoSrc;video.controls=true;video.playsInline=true;video.preload='metadata';video.poster=item.image;nodes.push(video);}else{const large=el('img');large.src=item.image;large.alt=item.title;nodes.push(large);}nodes.push(el('p','demo-label',item.description||(group.type==='video'?'Демонстрационная обложка. Видеофайл пока не добавлен.':'Демонстрационная обложка из макета сайта. Реальная работа будет добавлена позже.')));if(item.url&&safeUrl(item.url)){const a=el('a','button black','Открыть проект ↗');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';nodes.push(a);}openViewer(item.title,group.title,nodes);if(item.videoParts?.length)loadVideoParts(item,nodes[0],nodes[1]);});grid.append(card);});section.append(heading,grid);$('#project-groups').append(section);});
data.articles.forEach(article=>{const row=el('button','article-row');row.type='button';row.setAttribute('aria-haspopup','dialog');const genre=el('span','article-genre',article.genre),body=el('span','article-copy'),preview=el('span','article-preview'),inner=el('span','article-preview-inner');inner.append(el('p','',article.excerpt),el('span','read-more','Читать полностью ↗'));preview.append(inner);body.append(el('span','article-title',article.title),preview);row.append(genre,body,el('span','article-arrow','→'));row.addEventListener('click',()=>{const nodes=[];if(article.demo)nodes.push(el('p','demo-label','Демонстрационный материал. Не является опубликованной авторской работой.'));article.paragraphs.forEach(p=>nodes.push(el('p','',p)));openViewer(article.title,article.genre,nodes);});$('#article-list').append(row);});
data.jobs.forEach(([year,name,role])=>{const job=el('div','job'),body=el('div');body.append(el('h3','',name),el('p','',role));job.append(el('span','job-year',year),body);$('#timeline').append(job);});


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
