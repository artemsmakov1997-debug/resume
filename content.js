/* Здесь редактируется портфолио. Демонстрационные материалы отмечены отдельно.
   Для реального видео укажите videoSrc: 'assets/video.mp4'.
   Для проекта можно добавить url: 'https://...'. */
window.portfolio = {
  groups: [
    {title:'Коммуникационные проекты',type:'showcase',items:[
      {title:'Организация участия в ПМГФ',image:'assets/pmgf.jpg',videoSrc:'assets/pmgf.mp4',demo:false,description:'Организация участия в Петербургском международном газовом форуме.'},
      {title:'Презентация ЯНАО в Совете Федерации',image:'assets/federation.jpg',videoSrc:'assets/federation.mp4',demo:false,description:'Презентация Ямало-Ненецкого автономного округа в Совете Федерации.'},
      {title:'Развитие туризма на Полярном Урале',image:'assets/polar-ural.jpg',videoSrc:'assets/polar-ural.mp4',demo:false,description:'Проект о развитии туризма на Полярном Урале.'}
    ]},
    {title:'Видеопроизводство: от сценария до монтажа',type:'video',featuredHeading:true,items:[{title:'Предвыборный ролик для губернатора ЯНАО',image:'assets/yanao-poster.jpg',videoParts:['assets/yanao-election-1.bin','assets/yanao-election-2.bin','assets/yanao-election-3.bin','assets/yanao-election-4.bin'],videoBytes:37411976,demo:false,description:'Предвыборный ролик для губернатора ЯНАО. Продолжительность — 6 минут 42 секунды.'},{title:'Видео 02',image:'assets/work-5.webp',videoSrc:''}]}
  ],
  articles: Array.from({length:6},(_,i)=>({title:'Материал '+String(i+1).padStart(2,'0'),pending:true,paragraphs:[]})),
  jobs:[['2026','Клиника высоких технологий «Белоостров»','PR-менеджер'],['2025','Mashnews | Новости промышленности','Корреспондент'],['2024–2025','Газпром газомоторное топливо','PR-специалист'],['2023–2024','Ямал-Медиа','Специальный корреспондент'],['2023','Институт мозга человека им. Н. П. Бехтеревой РАН','Пресс-секретарь'],['2021–2022','Институт нефтегазовых технологических инициатив','PR-специалист'],['2018–2019','PR-агентство Marketline','PR-специалист']]
};


