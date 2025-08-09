// Tela inicial: ao clicar em 'Começar', mostra planner
document.addEventListener('DOMContentLoaded', () => {
  const btnStart = document.getElementById('btnStart');
  const welcome = document.getElementById('welcome');
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  if (btnStart && welcome && sidebar && content) {
    btnStart.onclick = () => {
      welcome.classList.add('hidden');
      sidebar.classList.remove('hidden');
      content.classList.remove('hidden');
    };
  }
});
// Verificação de carregamento do script
console.log('Planner PWA carregado');
window.onerror = function(msg, url, line, col, error) {
  console.error('Erro global:', msg, url, line, col, error);
};
// Planner PWA - simple single-file logic using localStorage
const MAX_SUBJECTS = 6;
const PHASES_PER_SUBJECT = 5;

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

const storageKey = 'planner_semesters_v1';
let data = JSON.parse(localStorage.getItem(storageKey) || '[]');
let currentSemesterId = null;

const els = {
  semesterList: document.getElementById('semesterList'),
  btnAddSemester: document.getElementById('btnAddSemester'),
  semesterView: document.getElementById('semesterView'),
  empty: document.getElementById('empty'),
  semesterTitle: document.getElementById('semesterTitle'),
  subjects: document.getElementById('subjects'),
  btnAddSubject: document.getElementById('btnAddSubject'),
  modal: document.getElementById('modal'),
  modalBody: document.getElementById('modalBody'),
  modalClose: document.getElementById('modalClose'),
  btnExport: document.getElementById('btnExport'),
  btnImport: document.getElementById('btnImport'),
  importFile: document.getElementById('importFile')
};

// Verifica se todos os elementos existem
Object.entries(els).forEach(([key, el]) => {
  if (!el) console.error('Elemento não encontrado:', key);
});

function save(){ localStorage.setItem(storageKey, JSON.stringify(data)); renderSemesterList(); renderSemesterView(); }

function createSemester(name){
  data.push({ id: uid(), name: name||('Semestre '+(data.length+1)), subjects: []});
  save();
}

function deleteSemester(id){
  data = data.filter(s=>s.id!==id);
  if(currentSemesterId===id) currentSemesterId = null;
  save();
}

function addSubject(semesterId, subject){
  const sem = data.find(s=>s.id===semesterId);
  if(!sem) return;
  if(sem.subjects.length>=MAX_SUBJECTS){ alert('Máximo de '+MAX_SUBJECTS+' matérias por semestre'); return; }
  sem.subjects.push(subject);
  save();
}

function removeSubject(semesterId, subjectId){
  const sem = data.find(s=>s.id===semesterId);
  sem.subjects = sem.subjects.filter(x=>x.id!==subjectId);
  save();
}

function renderSemesterList(){
  els.semesterList.innerHTML = '';
  data.forEach(s=>{
    const li = document.createElement('li');
    li.textContent = s.name;
    li.onclick = ()=>{ currentSemesterId = s.id; renderSemesterView(); renderSemesterList(); };
    if(currentSemesterId===s.id) li.classList.add('active');
    const btns = document.createElement('div');
    const del = document.createElement('button'); del.textContent='✖'; del.className='icon';
    del.onclick = (ev)=>{ ev.stopPropagation(); if(confirm('Deletar semestre?')){ deleteSemester(s.id); } };
    btns.appendChild(del);
    li.appendChild(btns);
    els.semesterList.appendChild(li);
  });
}

function renderSemesterView(){
  if(!currentSemesterId){ els.semesterView.classList.add('hidden'); els.empty.classList.remove('hidden'); return; }
  const sem = data.find(s=>s.id===currentSemesterId);
  if(!sem){ els.semesterView.classList.add('hidden'); els.empty.classList.remove('hidden'); return; }
  els.semesterTitle.textContent = sem.name;
  els.semesterView.classList.remove('hidden'); els.empty.classList.add('hidden');
  els.subjects.innerHTML = '';

  sem.subjects.forEach(sub=>{
    const card = document.createElement('div'); card.className='card';
    const colorTag = document.createElement('div'); colorTag.className='tag'; colorTag.textContent = sub.name;
    card.appendChild(colorTag);
    const h = document.createElement('h3'); h.textContent = sub.name+' — '+(sub.teacher||'');
    card.appendChild(h);

    // Phases
    sub.phases.forEach((p, idx)=>{
      const ph = document.createElement('div'); ph.className='phase';
      ph.innerHTML = `<strong>Fase ${idx+1} - ${p.title||'Sem título'}</strong>
        <div class="small"> ${p.start||''} → ${p.end||''} • ${p.done? 'Concluída' : 'Pendente'}</div>
        <div class="small">Links: ${ (p.links||[]).length } • Notas: ${p.notes? 'Sim' : 'Sem' }</div>`;
      const btn = document.createElement('button'); btn.textContent = p.done? 'Marcar Pendente' : 'Marcar Concluída';
      btn.className='primary'; btn.onclick = ()=>{ p.done = !p.done; save(); };
      ph.appendChild(btn);
      const edit = document.createElement('button'); edit.textContent='Editar'; edit.className='icon';
      edit.onclick = ()=>{ openPhaseEditor(sub, p); };
      ph.appendChild(edit);
      card.appendChild(ph);
    });

    // Works and exams counts
    const works = sub.works||[];
    const exams = sub.exams||[];

    const meta = document.createElement('div'); meta.className='small';
    meta.textContent = `Trabalhos: ${works.length} • Provas: ${exams.length}`;
    card.appendChild(meta);

    const actions = document.createElement('div'); actions.className='actions';
    const btnAddPhase = document.createElement('button'); btnAddPhase.textContent='Editar Matéria'; btnAddPhase.className='primary';
    btnAddPhase.onclick = ()=>{ openSubjectEditor(sub); };
    const btnDelete = document.createElement('button'); btnDelete.textContent='Excluir'; btnDelete.className='icon';
    btnDelete.onclick = ()=>{ if(confirm('Excluir matéria?')){ removeSubject(currentSemesterId, sub.id); } };
    actions.appendChild(btnAddPhase); actions.appendChild(btnDelete);
    card.appendChild(actions);

    els.subjects.appendChild(card);
  });

  // placeholder if no subjects
  if(sem.subjects.length===0){
    els.subjects.innerHTML = '<div class="center card">Nenhuma matéria. Clique em "Adicionar Matéria" para criar (máx '+MAX_SUBJECTS+').</div>';
  }
}

function openModal(html){
  if (!html) { els.modal.classList.add('hidden'); return; }
  els.modalBody.innerHTML='';
  els.modalBody.appendChild(html);
  els.modal.classList.remove('hidden');
}
// Garante que o modal está oculto ao iniciar
window.addEventListener('DOMContentLoaded', ()=>{
  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('hidden');
});
function closeModal(){ els.modal.classList.add('hidden'); }

els.modalClose.onclick = closeModal;
els.modal.onclick = (e)=>{ if(e.target===els.modal) closeModal(); };

els.btnAddSemester.onclick = ()=> {
  const name = prompt('Nome do semestre (ex: 1º Semestre 2025):');
  if(name) createSemester(name);
};

els.btnAddSubject.onclick = ()=> {
  const sem = data.find(s=>s.id===currentSemesterId);
  if(!sem) return alert('Nenhum semestre selecionado');
  if(sem.subjects.length>=MAX_SUBJECTS) return alert('Máximo de matérias atingido');
  const name = prompt('Nome da matéria:');
  if(!name) return;
  const subj = { id: uid(), name: name, teacher:'', color:'#7c3aed', phases: [], works: [], exams: []};
  // create default phases
  for(let i=0;i<PHASES_PER_SUBJECT;i++){
    subj.phases.push({ id: uid(), title: 'Fase '+(i+1), start:'', end:'', done:false, links:[], notes:''});
  }
  addSubject(currentSemesterId, subj);
};

function openSubjectEditor(sub){
  const container = document.createElement('div');
  const html = document.createElement('div');
  html.innerHTML = `<h3>Editar: ${sub.name}</h3>`;
  const teacher = document.createElement('input'); teacher.placeholder='Professor / responsável'; teacher.value = sub.teacher||'';
  const name = document.createElement('input'); name.placeholder='Nome da matéria'; name.value = sub.name;
  const saveBtn = document.createElement('button'); saveBtn.textContent='Salvar'; saveBtn.className='primary';
  saveBtn.onclick = ()=>{
    sub.name = name.value||sub.name; sub.teacher = teacher.value;
    save(); closeModal();
  };
  const manageWorks = document.createElement('button'); manageWorks.textContent='Gerenciar Trabalhos'; manageWorks.className='icon';
  manageWorks.onclick = ()=>{ openWorksEditor(sub); };
  const manageExams = document.createElement('button'); manageExams.textContent='Gerenciar Provas'; manageExams.className='icon';
  manageExams.onclick = ()=>{ openExamsEditor(sub); };
  html.appendChild(name); html.appendChild(document.createElement('br'));
  html.appendChild(teacher); html.appendChild(document.createElement('br'));
  html.appendChild(document.createElement('br'));
  html.appendChild(saveBtn); html.appendChild(manageWorks); html.appendChild(manageExams);
  container.appendChild(html);
  openModal(container);
}

function openPhaseEditor(sub, phase){
  const c = document.createElement('div');
  c.innerHTML = `<h3>Editar Fase - ${phase.title}</h3>`;
  const title = document.createElement('input'); title.value = phase.title || '';
  title.placeholder = 'Título da fase';
  const start = document.createElement('input'); start.type='date'; start.value = phase.start||'';
  const end = document.createElement('input'); end.type='date'; end.value = phase.end||'';
  const notes = document.createElement('textarea'); notes.placeholder='Notas rápidas'; notes.value = phase.notes || '';
  const linksLabel = document.createElement('div'); linksLabel.textContent = 'Links (um por linha)';
  const linksArea = document.createElement('textarea'); linksArea.value = (phase.links||[]).join('\n');
  const attachLabel = document.createElement('div'); attachLabel.textContent = 'Documentos/Anexos (URLs, Google Drive, Dropbox, etc)';
  const attachArea = document.createElement('textarea'); attachArea.value = (phase.attachments||[]).join('\n');
  const save = document.createElement('button'); save.textContent='Salvar'; save.className='primary';
  save.onclick = ()=>{
    phase.title = title.value||phase.title;
    phase.start = start.value; phase.end = end.value;
    phase.notes = notes.value;
    phase.links = linksArea.value.split('\n').map(s=>s.trim()).filter(Boolean);
    phase.attachments = attachArea.value.split('\n').map(s=>s.trim()).filter(Boolean);
    saveDataAndClose();
  };
  const delBtn = document.createElement('button'); delBtn.textContent='Excluir Fase'; delBtn.className='icon';
  delBtn.onclick = ()=>{ if(confirm('Remover fase?')){ sub.phases = sub.phases.filter(p=>p.id!==phase.id); saveDataAndClose(); } };
  c.appendChild(title); c.appendChild(document.createElement('br'));
  c.appendChild(start); c.appendChild(end); c.appendChild(document.createElement('br'));
  c.appendChild(linksLabel); c.appendChild(linksArea); c.appendChild(document.createElement('br'));
  c.appendChild(attachLabel); c.appendChild(attachArea); c.appendChild(document.createElement('br'));
  c.appendChild(notes); c.appendChild(document.createElement('br'));
  c.appendChild(save); c.appendChild(delBtn);
  function saveDataAndClose(){ save(); closeModal(); }
  openModal(c);
}

function openWorksEditor(sub){
  const container = document.createElement('div');
  container.innerHTML = `<h3>Trabalhos - ${sub.name}</h3>`;
  const list = document.createElement('div');
  function renderList(){
    list.innerHTML = '';
    (sub.works||[]).forEach(w=>{
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<strong>${w.title}</strong><div class="small">Entrega: ${w.due||''} • Status: ${w.status||'pendente'}</div>
        <div class="small">${w.details||''}</div>`;
      const btns = document.createElement('div'); btns.className='actions';
      const edit = document.createElement('button'); edit.textContent='Editar'; edit.className='icon';
      edit.onclick = ()=>{ openWorkEditor(sub,w); };
      const del = document.createElement('button'); del.textContent='Excluir'; del.className='icon';
      del.onclick = ()=>{ if(confirm('Excluir?')){ sub.works = sub.works.filter(x=>x.id!==w.id); save(); renderList(); } };
      btns.appendChild(edit); btns.appendChild(del); el.appendChild(btns);
      list.appendChild(el);
    });
  }
  const add = document.createElement('button'); add.textContent='Adicionar Trabalho'; add.className='primary';
  add.onclick = ()=>{ const w = { id: uid(), title:'Novo Trabalho', due:'', details:'', links:[], attachments:[], status:'pendente' }; sub.works = sub.works||[]; sub.works.push(w); save(); renderList(); openWorkEditor(sub,w); };
  container.appendChild(add); container.appendChild(list);
  openModal(container);
  renderList();
}

function openWorkEditor(sub,w){
  const c = document.createElement('div');
  c.innerHTML = `<h3>Editar Trabalho</h3>`;
  const title = document.createElement('input'); title.value = w.title||'';
  const due = document.createElement('input'); due.type='date'; due.value = w.due||'';
  const details = document.createElement('textarea'); details.value = w.details||'';
  const links = document.createElement('textarea'); links.value = (w.links||[]).join('\n');
  const attachLabel = document.createElement('div'); attachLabel.textContent = 'Documentos/Anexos (URLs, Google Drive, Dropbox, etc)';
  const attachArea = document.createElement('textarea'); attachArea.value = (w.attachments||[]).join('\n');
  const status = document.createElement('select'); ['pendente','entregue','corrigido'].forEach(st=>{ const o=document.createElement('option'); o.value=st; o.textContent=st; if(w.status===st) o.selected=true; status.appendChild(o);});
  const saveBtn = document.createElement('button'); saveBtn.textContent='Salvar'; saveBtn.className='primary';
  saveBtn.onclick = ()=>{ w.title=title.value; w.due=due.value; w.details=details.value; w.links=links.value.split('\n').map(s=>s.trim()).filter(Boolean); w.attachments=attachArea.value.split('\n').map(s=>s.trim()).filter(Boolean); w.status=status.value; save(); closeModal(); };
  c.appendChild(title); c.appendChild(document.createElement('br'));
  c.appendChild(due); c.appendChild(document.createElement('br'));
  c.appendChild(status); c.appendChild(document.createElement('br'));
  c.appendChild(links); c.appendChild(attachLabel); c.appendChild(attachArea);
  c.appendChild(details);
  c.appendChild(saveBtn);
  openModal(c);
}

function openExamsEditor(sub){
  const container = document.createElement('div');
  container.innerHTML = `<h3>Provas - ${sub.name}</h3>`;
  const list = document.createElement('div');
  function render(){ list.innerHTML=''; (sub.exams||[]).forEach(e=>{
    const el=document.createElement('div'); el.className='card';
    el.innerHTML = `<strong>${e.title}</strong><div class="small">Data: ${e.date||''}</div><div class="small">${(e.topics||[]).join(', ')}</div>`;
    const btns = document.createElement('div'); btns.className='actions';
    const edit = document.createElement('button'); edit.textContent='Editar'; edit.className='icon'; edit.onclick = ()=>{ openExamEditor(sub,e); };
    const del = document.createElement('button'); del.textContent='Excluir'; del.className='icon'; del.onclick = ()=>{ if(confirm('Excluir?')){ sub.exams = sub.exams.filter(x=>x.id!==e.id); save(); render(); } };
    btns.appendChild(edit); btns.appendChild(del); el.appendChild(btns);
    list.appendChild(el);
  }); }
  const add = document.createElement('button'); add.textContent='Adicionar Prova'; add.className='primary';
  add.onclick = ()=>{ const e = { id: uid(), title:'Nova Prova', date:'', topics:[], notes:'' }; sub.exams = sub.exams||[]; sub.exams.push(e); save(); render(); openExamEditor(sub,e); };
  container.appendChild(add); container.appendChild(list);
  openModal(container); render();
}

function openExamEditor(sub,e){
  const c = document.createElement('div');
  c.innerHTML = `<h3>Editar Prova</h3>`;
  const title = document.createElement('input'); title.value = e.title||'';
  const date = document.createElement('input'); date.type='date'; date.value = e.date||'';
  const topics = document.createElement('textarea'); topics.value = (e.topics||[]).join('\n');
  const notes = document.createElement('textarea'); notes.value = e.notes||'';
  const attachLabel = document.createElement('div'); attachLabel.textContent = 'Documentos/Anexos (URLs, Google Drive, Dropbox, etc)';
  const attachArea = document.createElement('textarea'); attachArea.value = (e.attachments||[]).join('\n');
  const saveBtn = document.createElement('button'); saveBtn.textContent='Salvar'; saveBtn.className='primary';
  saveBtn.onclick = ()=>{ e.title=title.value; e.date=date.value; e.topics = topics.value.split('\n').map(s=>s.trim()).filter(Boolean); e.notes=notes.value; e.attachments=attachArea.value.split('\n').map(s=>s.trim()).filter(Boolean); save(); closeModal(); };
  c.appendChild(title); c.appendChild(date); c.appendChild(topics); c.appendChild(attachLabel); c.appendChild(attachArea); c.appendChild(notes); c.appendChild(saveBtn);
  openModal(c);
}

// import/export
els.btnExport.onclick = ()=> {
  if(!currentSemesterId) return alert('Selecione um semestre');
  const sem = data.find(s=>s.id===currentSemesterId);
  const blob = new Blob([JSON.stringify(sem,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = (sem.name || 'semestre')+'.json'; a.click();
  URL.revokeObjectURL(url);
};
els.btnImport.onclick = ()=> els.importFile.click();
els.importFile.onchange = (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=> {
    try{
      const imported = JSON.parse(reader.result);
      imported.id = uid();
      data.push(imported); save();
      alert('Importado como novo semestre: ' + (imported.name||'Semestre'));
    }catch(err){ alert('Arquivo inválido'); }
  };
  reader.readAsText(f);
};

// initial render
renderSemesterList(); renderSemesterView();

// sample starter if empty
if(data.length===0){
  createSemester('1º Semestre - Exemplo');
  currentSemesterId = data[0].id;
  // add an example subject
  const example = { id: uid(), name: 'Matemática', teacher:'Prof. Silva', color:'#f97316', phases:[], works:[], exams:[] };
  for(let i=0;i<PHASES_PER_SUBJECT;i++) example.phases.push({ id: uid(), title: 'Fase '+(i+1), start:'', end:'', done:false, links:[], notes:''});
  addSubject(currentSemesterId, example);
  renderSemesterList(); renderSemesterView();
}

// basic notification helper (works while app is open)
function requestNotifications(){
  if(!('Notification' in window)) return;
  if(Notification.permission === 'default') Notification.requestPermission();
}
requestNotifications();
