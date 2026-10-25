(function(){
'use strict';

/* ---------- utilidades ---------- */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const mem={};
const store={
  get(k,d){try{const v=localStorage.getItem(k);if(v!==null)return JSON.parse(v)}catch(e){}return (k in mem)?mem[k]:d},
  set(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
function hash(str){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<str.length;i++){const ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(16)}
const pw=(email,s)=>hash('ats|'+email.toLowerCase()+'|'+s);
const fmtDate=iso=>{const [y,m,d]=iso.split('-');return d+'/'+m+'/'+y};
const today=()=>new Date().toISOString().slice(0,10);
let toastTimer=null;
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.hidden=true},3200)}

/* ---------- dados do catálogo ---------- */
const CATS=[
  {id:'sensores',nome:'Sensores'},
  {id:'robotica',nome:'Robótica'},
  {id:'controle',nome:'CLPs e IHM'},
  {id:'conectividade',nome:'Conectividade'},
  {id:'software',nome:'Software'},
  {id:'kits',nome:'Kits de projeto'}
];
const catName=id=>(CATS.find(c=>c.id===id)||{}).nome||'';
const PRODUTOS=[
  {id:'sv-300',codigo:'SV-300',cat:'sensores',nome:'Sensor de vibração triaxial SV-300',
   resumo:'Mede vibração em três eixos e temperatura de carcaça em motores, bombas e redutores.',
   descricao:'O SV-300 acompanha a saúde de ativos rotativos. Ele envia valores RMS de vibração e temperatura por IO-Link ou saída analógica, e alimenta os alertas de manutenção preditiva da plataforma ATS Monitor.',
   destaques:['3 eixos + temperatura','IO-Link e 4–20 mA','IP67'],
   specs:[['Faixa de medição','±16 g'],['Faixa de frequência','2 Hz a 10 kHz'],['Saída','IO-Link 1.1 ou 4–20 mA (RMS)'],['Alimentação','18 a 30 Vcc'],['Temperatura de operação','−40 a 85 °C'],['Grau de proteção','IP67'],['Fixação','Rosca M8 ou base magnética']],
   aplicacoes:['Motores elétricos','Bombas centrífugas','Redutores e ventiladores'],minQtd:1,tags:['vibração','manutenção preditiva','io-link']},
  {id:'si-m18',codigo:'SI-M18',cat:'sensores',nome:'Sensor indutivo de proximidade SI-M18',
   resumo:'Detecta peças metálicas sem contato, para contagem, posicionamento e fim de curso.',
   descricao:'Sensor indutivo cilíndrico com corpo em latão niquelado, indicado para ambientes com óleo e poeira. Entrega sinal PNP direto para entradas de CLP.',
   destaques:['Alcance 8 mm','PNP, normalmente aberto','IP67'],
   specs:[['Formato','Cilíndrico, rosca M18'],['Distância sensora nominal','8 mm'],['Saída','PNP, normalmente aberta'],['Tensão de operação','10 a 30 Vcc'],['Frequência de comutação','1 kHz'],['Corrente máxima de carga','200 mA'],['Material do corpo','Latão niquelado'],['Grau de proteção','IP67']],
   aplicacoes:['Contagem de peças em esteiras','Fim de curso em atuadores','Posicionamento de peças metálicas'],minQtd:10,tags:['proximidade','indutivo','contagem']},
  {id:'st-100',codigo:'ST-100',cat:'sensores',nome:'Transmissor de temperatura ST-100',
   resumo:'Sonda PT100 com transmissor 4–20 mA para fornos, estufas e linhas de envase.',
   descricao:'Conjunto de sonda e transmissor em haste de aço inox. O sinal de 4–20 mA em dois fios pode ser levado a longas distâncias sem perda de precisão.',
   destaques:['PT100 classe A','4–20 mA, 2 fios','−50 a 400 °C'],
   specs:[['Elemento sensor','PT100, classe A'],['Faixa de medição','−50 a 400 °C'],['Saída','4–20 mA, 2 fios'],['Alimentação','12 a 36 Vcc'],['Haste','Aço inox 316, 100 mm'],['Grau de proteção','IP66']],
   aplicacoes:['Fornos e estufas','Linhas de envase','Trocadores de calor'],minQtd:2,tags:['temperatura','pt100','4-20ma']},
  {id:'rc-10',codigo:'RC-10',cat:'robotica',nome:'Robô colaborativo RC-10',
   resumo:'Cobot de seis eixos com 10 kg de carga útil para alimentar máquinas e paletizar com segurança.',
   descricao:'O RC-10 trabalha ao lado do operador, sem grades, com limitação de força e potência configurável. A programação é feita por interface gráfica no tablet, e a integração com CLPs usa Modbus TCP.',
   destaques:['Carga útil 10 kg','Alcance 1.300 mm','6 eixos'],
   specs:[['Eixos','6'],['Carga útil','10 kg'],['Alcance','1.300 mm'],['Repetibilidade','±0,05 mm'],['Alimentação','100 a 240 Vca'],['Interfaces','Ethernet, Modbus TCP, E/S digitais'],['Peso','33 kg'],['Grau de proteção','IP54']],
   aplicacoes:['Alimentação de máquinas CNC','Paletização leve','Parafusamento','Inspeção visual'],minQtd:1,tags:['cobot','robô','colaborativo']},
  {id:'rs-500',codigo:'RS-500',cat:'robotica',nome:'Robô SCARA RS-500',
   resumo:'Robô de quatro eixos para montagem e pick and place de alta velocidade.',
   descricao:'Braço SCARA compacto com controlador integrado, pensado para células de montagem de pequenas peças com ciclos curtos e posicionamento preciso.',
   destaques:['Alcance 500 mm','Ciclo de 0,4 s','Carga 5 kg'],
   specs:[['Eixos','4'],['Alcance','500 mm'],['Carga útil nominal','5 kg'],['Repetibilidade','±0,02 mm'],['Tempo de ciclo padrão','0,4 s'],['Controlador','Integrado ao pedestal'],['Comunicação','Ethernet e E/S digitais']],
   aplicacoes:['Montagem de componentes eletrônicos','Dosagem de adesivos','Pick and place'],minQtd:1,tags:['scara','robô','montagem']},
  {id:'cl-2400',codigo:'CL-2400',cat:'controle',nome:'CLP modular CL-2400',
   resumo:'Controlador programável com 24 pontos de E/S e comunicação Profinet, Modbus TCP e OPC UA.',
   descricao:'CLP compacto e expansível para máquinas e pequenas linhas. Programado nas linguagens da norma IEC 61131-3, expõe variáveis por OPC UA para sistemas de supervisão.',
   destaques:['24 E/S integradas','Profinet e Modbus TCP','OPC UA'],
   specs:[['Entradas digitais','14 (24 Vcc)'],['Saídas digitais','10 (transistor, 0,5 A)'],['Entradas analógicas','4 (0–10 V ou 4–20 mA)'],['Comunicação','Profinet, Modbus TCP, servidor OPC UA'],['Programação','IEC 61131-3 (LD, ST, FBD)'],['Memória de programa','2 MB'],['Alimentação','24 Vcc'],['Montagem','Trilho DIN 35 mm']],
   aplicacoes:['Máquinas especiais','Retrofit de painéis','Controle de utilidades'],minQtd:1,tags:['clp','controlador','profinet']},
  {id:'ih-10',codigo:'IH-10',cat:'controle',nome:'IHM touch 10" IH-10',
   resumo:'Interface homem-máquina de 10,1 polegadas para operar e visualizar processos no painel.',
   descricao:'IHM capacitiva com frente selada, indicada para painéis de máquina. Comunica com CLPs por Ethernet e exibe alarmes, receitas e tendências.',
   destaques:['Tela de 10,1"','1280 × 800','IP65 frontal'],
   specs:[['Tela','10,1" capacitiva'],['Resolução','1280 × 800'],['Comunicação','Ethernet, USB, RS-485'],['Protocolos','Modbus TCP, cliente OPC UA'],['Alimentação','24 Vcc'],['Temperatura de operação','0 a 50 °C'],['Grau de proteção','IP65 (frontal)']],
   aplicacoes:['Painéis de máquinas','Operação de linhas','Visualização de alarmes'],minQtd:1,tags:['ihm','display','painel']},
  {id:'gw-100',codigo:'GW-100',cat:'conectividade',nome:'Gateway IoT Edge GW-100',
   resumo:'Conecta sensores e CLPs à nuvem usando OPC UA, Modbus e MQTT, com memória para falhas de rede.',
   descricao:'Instalado no painel, o GW-100 lê dados do chão de fábrica, aplica regras locais e publica em MQTT com TLS. Se a rede cair, guarda os dados e envia quando a conexão voltar.',
   destaques:['OPC UA, Modbus, MQTT','Wi-Fi e 4G opcional','Trilho DIN'],
   specs:[['Protocolos de campo','Modbus RTU/TCP, OPC UA, mestre IO-Link (4 portas)'],['Publicação','MQTT 3.1.1 com TLS'],['Conectividade','2 × Ethernet, Wi-Fi, 4G LTE (opcional)'],['Processamento local','Regras de borda e buffer offline de 7 dias'],['Alimentação','12 a 48 Vcc'],['Temperatura de operação','−20 a 65 °C'],['Montagem','Trilho DIN']],
   aplicacoes:['Integração com MES e ERP','Coleta de dados de máquinas antigas','Monitoramento remoto'],minQtd:1,tags:['gateway','iot','mqtt','opc ua']},
  {id:'axial-monitor',codigo:'AM-CLOUD',cat:'software',nome:'Plataforma ATS Monitor',
   resumo:'Painéis de OEE, alertas e histórico por máquina, acessíveis no navegador e no celular.',
   descricao:'Software de monitoramento em nuvem. Mostra disponibilidade, desempenho e qualidade de cada linha, registra paradas e avisa a equipe quando um indicador sai do limite.',
   destaques:['OEE em tempo real','Alertas por e-mail','API REST'],
   specs:[['Modelo','Assinatura mensal por máquina conectada'],['Indicadores','OEE, disponibilidade, desempenho e qualidade'],['Alertas','E-mail e notificação no aplicativo'],['Integração','API REST e webhooks'],['Retenção de dados','24 meses'],['Perfis de acesso','Operador, gestor e administrador']],
   aplicacoes:['Gestão de produção','Análise de paradas','Relatórios para a diretoria'],minQtd:1,tags:['oee','dashboard','nuvem','software']},
  {id:'mp-kit',codigo:'MP-KIT',cat:'kits',nome:'Kit de manutenção preditiva MP-KIT',
   resumo:'Sensores, gateway e licença da plataforma para começar a monitorar até quatro ativos.',
   descricao:'Pacote de entrada para quem quer testar manutenção preditiva em poucos equipamentos, com instalação orientada e treinamento online para a equipe de manutenção.',
   destaques:['4 sensores SV-300','1 gateway GW-100','90 dias de plataforma'],
   specs:[['Conteúdo','4 × SV-300, 1 × GW-100, cabos e suportes'],['Licença','ATS Monitor por 90 dias, até 4 máquinas'],['Instalação','Acompanhamento remoto'],['Treinamento','4 horas, online'],['Indicado para','Até 4 ativos rotativos']],
   aplicacoes:['Projeto-piloto de manutenção preditiva','Bombas e motores críticos'],minQtd:1,tags:['kit','piloto','manutenção preditiva']}
];
const SOLUCOES=[
  {id:'manutencao-preditiva',nome:'Manutenção preditiva',
   desafio:'Motores, bombas e redutores que param sem aviso e interrompem a produção.',
   entrega:['Sensores de vibração e temperatura nos ativos críticos','Alertas por limite e por tendência','Histórico de cada equipamento para planejar a parada'],
   prods:['sv-300','st-100','gw-100','mp-kit']},
  {id:'monitoramento-oee',nome:'Monitoramento de produção e OEE',
   desafio:'Falta de dados confiáveis sobre paradas, velocidade e refugo de cada linha.',
   entrega:['Coleta automática de contagem e estados da máquina','Painel de OEE por turno, linha e produto','Registro de motivos de parada'],
   prods:['gw-100','axial-monitor','si-m18']},
  {id:'celulas-roboticas',nome:'Células robotizadas',
   desafio:'Tarefas repetitivas ou pesadas que limitam a produtividade e a ergonomia.',
   entrega:['Projeto da célula com cobot ou SCARA','Integração com CLP e sensores','Treinamento de programação para a equipe'],
   prods:['rc-10','rs-500','cl-2400']},
  {id:'retrofit',nome:'Retrofit de máquinas',
   desafio:'Máquinas mecanicamente boas, mas com comando antigo e sem peças de reposição.',
   entrega:['Troca de comando por CLP e IHM atuais','Novos sensores e proteções','Conexão da máquina à rede da fábrica'],
   prods:['cl-2400','ih-10','si-m18','st-100']},
  {id:'conectividade',nome:'Conectividade de chão de fábrica',
   desafio:'Dados presos em CLPs e máquinas que não conversam com o ERP ou o MES.',
   entrega:['Mapeamento de variáveis e protocolos','Gateways com OPC UA, Modbus e MQTT','Publicação segura dos dados para os sistemas de gestão'],
   prods:['gw-100','cl-2400','axial-monitor']}
];
const STATUS=['Solicitada','Em análise','Orçamento enviado','Aprovada','Em execução','Concluída'];
/* ===== IMAGENS DOS PRODUTOS =====
   Para usar uma foto, coloque o arquivo na pasta "imagens" e escreva o caminho abaixo.
   Exemplo:  'sv-300': 'imagens/sv-300.jpg'
   Deixando vazio (''), o site mostra a ilustração padrão da categoria. */
const IMAGENS={
  'sv-300':'',
  'si-m18':'',
  'st-100':'',
  'rc-10':'',
  'rs-500':'',
  'cl-2400':'',
  'ih-10':'',
  'gw-100':'',
  'axial-monitor':'',
  'mp-kit':''
};
const prod=id=>PRODUTOS.find(p=>p.id===id);
const sol=id=>SOLUCOES.find(s=>s.id===id);
function itemInfo(id){
  if(!id)return null;
  if(id.indexOf('sol:')===0){const s=sol(id.slice(4));return s?{nome:'Solução: '+s.nome,min:1}:null}
  const p=prod(id);return p?{nome:p.nome,min:p.minQtd}:null;
}

/* ---------- ícones ---------- */
const SV='viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const ICONS={
  sensores:`<svg ${SV}><rect x="16" y="30" width="50" height="30" rx="3"/><path d="M24 30v30M32 30v30M40 30v30"/><rect x="66" y="35" width="14" height="20" rx="2"/><path d="M80 45h14c8 0 8 14 16 14"/><path d="M8 36q-4 9 0 18M3 31q-8 14 0 28" stroke="var(--accent)"/></svg>`,
  robotica:`<svg ${SV}><rect x="18" y="72" width="44" height="10" rx="2"/><path d="M40 72V50l32-22 24 12"/><circle cx="40" cy="50" r="5"/><circle cx="72" cy="28" r="5"/><circle cx="96" cy="40" r="4" stroke="var(--accent)"/><path d="M96 44v10M89 54h14"/></svg>`,
  controle:`<svg ${SV}><rect x="22" y="12" width="76" height="66" rx="3"/><path d="M22 34h76M22 56h76"/><circle cx="34" cy="23" r="2.6" fill="var(--accent)" stroke="none"/><circle cx="44" cy="23" r="2.6" fill="var(--accent)" stroke="none"/><circle cx="54" cy="23" r="2.6"/><path d="M34 45h52M34 67h30"/></svg>`,
  conectividade:`<svg ${SV}><rect x="28" y="44" width="64" height="30" rx="3"/><path d="M40 74v6M60 74v6M80 74v6M60 44V28"/><circle cx="60" cy="24" r="4" stroke="var(--accent)"/><path d="M47 14q13-10 26 0M40 8q20-14 40 0" stroke="var(--accent)"/><circle cx="40" cy="59" r="2.5" fill="currentColor" stroke="none"/><circle cx="50" cy="59" r="2.5" fill="currentColor" stroke="none"/></svg>`,
  software:`<svg ${SV}><rect x="16" y="14" width="88" height="54" rx="3"/><path d="M48 80h24M60 68v12"/><path d="M26 54l16-14 14 8 20-22 14 10" stroke="var(--accent)"/></svg>`,
  kits:`<svg ${SV}><rect x="18" y="42" width="84" height="36" rx="3"/><path d="M18 54h84"/><circle cx="42" cy="30" r="9"/><rect x="62" y="20" width="24" height="15" rx="2" stroke="var(--accent)"/></svg>`
};
function visual(p){
  const src=IMAGENS[p.id];
  return src?`<img src="${esc(src)}" alt="${esc(p.nome)}" loading="lazy">`:ICONS[p.cat];
}
const FAV_SVG='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" stroke-linejoin="round"/></svg>';

/* ---------- estado e dados do usuário ---------- */
const S={route:'inicio',param:null,q:'',cat:'todos',sort:'rel',tab:'entrar',notice:'',after:null,draft:null,tele:null};
function seed(){
  const users=store.get('ax_users',[])||[];
  if(!users.some(u=>u.email==='demo@ats.com.br')){
    users.push({nome:'Marcos Teixeira',empresa:'Metalúrgica Teixeira',email:'demo@ats.com.br',tel:'(19) 3555-0142',senha:pw('demo@ats.com.br','demo1234'),demo:true});
    store.set('ax_users',users);
    const old=(store.get('ax_reqs',[])||[]).filter(r=>r.id!==1021&&r.id!==1018);
    store.set('ax_reqs',old.concat([
      {id:1021,owner:'demo@ats.com.br',item:'sv-300',qtd:12,msg:'Precisamos monitorar 12 motores da linha de usinagem.',empresa:'Metalúrgica Teixeira',contato:{nome:'Marcos Teixeira',email:'demo@ats.com.br',tel:'(19) 3555-0142'},status:2,cancelada:false,hist:[{s:'Solicitada',d:'2026-09-28'},{s:'Em análise',d:'2026-09-29'},{s:'Orçamento enviado',d:'2026-10-02'}]},
      {id:1018,owner:'demo@ats.com.br',item:'mp-kit',qtd:1,msg:'Projeto-piloto para duas bombas e dois motores.',empresa:'Metalúrgica Teixeira',contato:{nome:'Marcos Teixeira',email:'demo@ats.com.br',tel:'(19) 3555-0142'},status:4,cancelada:false,hist:[{s:'Solicitada',d:'2026-09-15'},{s:'Em análise',d:'2026-09-16'},{s:'Orçamento enviado',d:'2026-09-18'},{s:'Aprovada',d:'2026-09-21'},{s:'Em execução',d:'2026-09-30'}]}
    ]));
  }
}
const users=()=>store.get('ax_users',[]);
const reqs=()=>store.get('ax_reqs',[]);
const favs=()=>store.get('ax_fav',[]);
const me=()=>{const e=store.get('ax_session',null);return e?users().find(u=>u.email===e)||null:null};

/* ---------- validação ---------- */
const V={
  nome:v=>v.trim().length>=3?'':'Informe seu nome completo.',
  req:(v,msg)=>v.trim()?'':(msg||'Preencha este campo.'),
  email:v=>!v.trim()?'Informe o e-mail.':(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())?'':'Informe um e-mail válido, como nome@empresa.com.br.'),
  tel:v=>{const d=v.replace(/\D/g,'');return d.length>=10&&d.length<=11?'':'Informe o telefone com DDD, por exemplo (19) 98765-4321.'},
  senha:v=>v.length<8?'A senha precisa ter pelo menos 8 caracteres.':(!/[A-Za-z]/.test(v)||!/\d/.test(v)?'Use letras e números na senha.':'')
};
function applyErrors(form,errs){
  let first=null;
  $$('.field',form).forEach(f=>{
    const id=f.dataset.field,el=$('#'+id,f),box=$('.err',f),msg=errs[id]||'';
    if(box)box.textContent=msg;
    if(el){if(msg){el.setAttribute('aria-invalid','true');if(!first)first=el}else el.removeAttribute('aria-invalid')}
  });
  if(first)first.focus();
  return !first;
}
const val=(form,id)=>{const el=$('#'+id,form);return el?el.value:''};

/* ---------- componentes de formulário ---------- */
function field(id,label,o={}){
  const {type='text',value='',hint='',ph='',req=true,ac='',attrs='',mask=''}=o;
  return `<div class="field" data-field="${id}"><label for="${id}">${label}${req?'':' <span class="opt">(opcional)</span>'}</label><input id="${id}" name="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(ph)}" ${ac?`autocomplete="${ac}"`:''} ${mask?`data-mask="${mask}"`:''} aria-describedby="${id}-e${hint?' '+id+'-h':''}" ${attrs}>${hint?`<div class="hint" id="${id}-h">${hint}</div>`:''}<div class="err" id="${id}-e" role="alert"></div></div>`;
}
function pwField(id,label,o={}){
  return `<div class="field" data-field="${id}"><label for="${id}">${label}</label><div class="pwrow"><input id="${id}" name="${id}" type="password" autocomplete="${o.ac||'current-password'}" aria-describedby="${id}-e${o.hint?' '+id+'-h':''}"><button type="button" class="btn btn-line btn-sm" data-action="pw" data-for="${id}" aria-label="Mostrar ou ocultar a senha">Mostrar</button></div>${o.hint?`<div class="hint" id="${id}-h">${o.hint}</div>`:''}<div class="err" id="${id}-e" role="alert"></div></div>`;
}
function pageHead(eyebrow,title,lead,crumbs){
  return `<div class="wrap"><div class="pagehead">${crumbs||''}${eyebrow?`<p class="eyebrow">${eyebrow}</p>`:''}<h1>${title}</h1>${lead?`<p class="lead">${lead}</p>`:''}</div></div>`;
}
function pcard(p){
  const fav=favs().includes(p.id);
  return `<article class="pcard"><div class="vis">${visual(p)}</div><button type="button" class="fav" data-fav="${p.id}" aria-pressed="${fav}" aria-label="Favoritar ${esc(p.nome)}">${FAV_SVG}</button><div class="body"><span class="code">${esc(p.codigo)}</span><h3>${esc(p.nome)}</h3><p class="muted">${esc(p.resumo)}</p><div class="foot"><span class="tagc">${esc(catName(p.cat))} · Sob orçamento</span><a class="btn btn-line btn-sm" href="#produto-${p.id}" data-go="produto" data-param="${p.id}" aria-label="Ver detalhes de ${esc(p.nome)}">Detalhes</a></div></div></article>`;
}

/* ---------- páginas ---------- */
function teleMarkup(){
  return `<div class="panel" role="region" aria-label="Painel de monitoramento com dados simulados"><div class="panel-h"><span>Linha 03 · Envase</span><span class="live"><i></i>Dados simulados</span></div>${TELE_CH.map(c=>`<div class="ch" data-k="${c.k}"><div class="ch-top"><span class="tag">${c.tag}</span><span class="nm">${c.nome}</span></div><div class="ch-val"><b class="val">–</b><span class="un">${c.un}</span></div><svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points=""/></svg></div>`).join('')}<div class="panel-f" id="tstate" aria-live="polite">Operação normal</div></div>`;
}
function pageInicio(){
  return `
  <section class="hero"><div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">Indústria 4.0 · Automação industrial</p>
      <h1>Máquinas que avisam antes de parar.</h1>
      <p class="lead">Sensores, robôs, CLPs e monitoramento em tempo real para indústrias que querem acompanhar a produção, reduzir paradas e conectar o chão de fábrica aos sistemas de gestão.</p>
      <div class="cta-row"><a class="btn btn-primary" href="#produtos" data-go="produtos">Ver produtos</a><a class="btn btn-line" href="#orcamento" data-go="orcamento">Solicitar orçamento</a></div>
      <ul class="proto" aria-label="Protocolos compatíveis"><li>OPC UA</li><li>MQTT</li><li>Profinet</li><li>Modbus TCP</li><li>IO-Link</li></ul>
    </div>
    ${teleMarkup()}
  </div></section>
  <section class="sec"><div class="wrap">
    <div class="sec-head"><p class="eyebrow">Soluções</p><div class="row"><h2>Do sensor ao painel de gestão</h2><a href="#solucoes" data-go="solucoes">Ver todas as soluções</a></div></div>
    <div class="grid-3">${SOLUCOES.slice(0,4).map(s=>`<div class="card"><h3>${esc(s.nome)}</h3><p class="muted">${esc(s.desafio)}</p><a class="link" href="#solucoes" data-go="solucoes">Como resolvemos</a></div>`).join('')}</div>
  </div></section>
  <section class="sec"><div class="wrap">
    <div class="sec-head"><p class="eyebrow">Catálogo</p><div class="row"><h2>Produtos em destaque</h2><a href="#produtos" data-go="produtos">Ver o catálogo completo</a></div></div>
    <div class="grid">${['sv-300','rc-10','gw-100'].map(id=>pcard(prod(id))).join('')}</div>
  </div></section>
  <section class="sec"><div class="wrap">
    <div class="sec-head"><p class="eyebrow">Como trabalhamos</p><h2>Do diagnóstico ao acompanhamento</h2></div>
    <ol class="steps-list">
      <li><span class="n">ETAPA 1</span><h3>Diagnóstico</h3><p class="muted">Visitamos a planta, mapeamos os ativos críticos e definimos o que medir.</p></li>
      <li><span class="n">ETAPA 2</span><h3>Projeto</h3><p class="muted">Escolhemos equipamentos, protocolos e a arquitetura de dados.</p></li>
      <li><span class="n">ETAPA 3</span><h3>Instalação</h3><p class="muted">Instalamos, comissionamos e treinamos a equipe de operação e manutenção.</p></li>
      <li><span class="n">ETAPA 4</span><h3>Acompanhamento</h3><p class="muted">Você acompanha indicadores e solicitações pela área do cliente.</p></li>
    </ol>
  </div></section>
  <section class="sec"><div class="wrap"><div class="cta-band"><div><h2>Descreva sua linha e receba um orçamento.</h2><p>Cadastre-se, informe o que precisa e acompanhe a análise da nossa equipe técnica.</p></div><a class="btn btn-primary" href="#orcamento" data-go="orcamento">Solicitar orçamento</a></div></div></section>`;
}

function chipsHTML(){
  const nf=favs().length;
  const chip=(id,label)=>`<button type="button" class="chip" data-cat="${id}" aria-pressed="${S.cat===id}">${label}</button>`;
  return chip('todos','Todos')+CATS.map(c=>chip(c.id,c.nome)).join('')+chip('fav','Favoritos ('+nf+')');
}
function filtered(){
  const q=norm(S.q.trim()),fv=favs();
  let l=PRODUTOS.filter(p=>{
    const okc=S.cat==='todos'||(S.cat==='fav'?fv.includes(p.id):p.cat===S.cat);
    if(!okc)return false;
    if(!q)return true;
    return norm([p.nome,p.codigo,p.resumo,catName(p.cat),p.tags.join(' ')].join(' ')).includes(q);
  });
  if(S.sort==='az')l=l.slice().sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
  return l;
}
function gridHTML(){
  const l=filtered();
  if(!l.length)return `<div class="empty"><p><b>Nenhum produto encontrado.</b></p><p class="muted">${S.cat==='fav'&&!S.q?'Você ainda não favoritou nenhum produto.':'Tente outro termo ou limpe os filtros.'}</p><button type="button" class="btn btn-line btn-sm" data-action="clear">Limpar filtros</button></div>`;
  return l.map(pcard).join('');
}
const countText=()=>{const n=filtered().length;return n+(n===1?' produto encontrado':' produtos encontrados')};
function updateGrid(){
  const g=$('#grid');if(!g)return;
  g.innerHTML=gridHTML();$('#count').textContent=countText();$('#chips').innerHTML=chipsHTML();
}
function pageProdutos(){
  return `${pageHead('Catálogo','Produtos e equipamentos','Sensores, robôs, controladores, conectividade e software. Todos os itens são vendidos sob orçamento.')}
  <div class="wrap page">
    <div class="tools">
      <div class="field search"><label for="q" class="hint" style="font-weight:600">Buscar por nome, código ou aplicação</label><input id="q" type="search" value="${esc(S.q)}" placeholder="Ex.: vibração, OPC UA, SV-300" autocomplete="off"></div>
      <div class="field"><label for="sort" class="hint" style="font-weight:600">Ordenar</label><select id="sort"><option value="rel"${S.sort==='rel'?' selected':''}>Relevância</option><option value="az"${S.sort==='az'?' selected':''}>Nome (A–Z)</option></select></div>
    </div>
    <div class="chips" id="chips" role="group" aria-label="Filtrar por categoria">${chipsHTML()}</div>
    <p class="count" id="count" aria-live="polite">${countText()}</p>
    <div class="grid" id="grid">${gridHTML()}</div>
  </div>`;
}
function pageProduto(id){
  const p=prod(id);
  if(!p)return `${pageHead('','Produto não encontrado','O item que você procura não está no catálogo.')}<div class="wrap page"><a class="btn btn-primary" href="#produtos" data-go="produtos">Voltar aos produtos</a></div>`;
  const fav=favs().includes(p.id);
  const rel=PRODUTOS.filter(x=>x.cat===p.cat&&x.id!==p.id).concat(PRODUTOS.filter(x=>x.cat!==p.cat&&x.id!==p.id)).slice(0,3);
  const crumbs=`<nav class="crumbs" aria-label="Você está em"><a href="#produtos" data-go="produtos">Produtos</a><span>/</span><span>${esc(catName(p.cat))}</span><span>/</span><span>${esc(p.codigo)}</span></nav>`;
  return `<div class="wrap"><div class="pagehead">${crumbs}</div></div>
  <div class="wrap page">
    <div class="detail">
      <div class="big">${visual(p)}</div>
      <div class="info">
        <span class="eyebrow">${esc(p.codigo)} · ${esc(catName(p.cat))}</span>
        <h1 style="font-size:clamp(1.9rem,4vw,2.8rem)">${esc(p.nome)}</h1>
        <p class="lead">${esc(p.resumo)}</p>
        <ul class="facts">${p.destaques.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>
        <p class="muted">Preço sob orçamento · Quantidade mínima por pedido: <b>${p.minQtd} ${p.minQtd===1?'unidade':'unidades'}</b></p>
        <div class="cta-row"><a class="btn btn-primary" href="#orcamento" data-go="orcamento" data-item="${p.id}">Solicitar orçamento</a><button type="button" class="btn btn-line" data-fav="${p.id}" aria-pressed="${fav}">${fav?'Remover dos favoritos':'Adicionar aos favoritos'}</button></div>
      </div>
    </div>
    <div class="grid-2" style="margin-top:2.5rem">
      <div style="display:grid;gap:.75rem;align-content:start"><h2>Descrição</h2><p>${esc(p.descricao)}</p><h3 style="margin-top:.5rem">Aplicações</h3><ul class="ul">${p.aplicacoes.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>
      <div style="display:grid;gap:.75rem;align-content:start"><h2>Especificações técnicas</h2><div class="tablewrap"><table class="spec"><tbody>${p.specs.map(s=>`<tr><th scope="row">${esc(s[0])}</th><td>${esc(s[1])}</td></tr>`).join('')}</tbody></table></div></div>
    </div>
    <div style="margin-top:3rem"><h2 style="margin-bottom:1rem">Outros produtos</h2><div class="grid">${rel.map(pcard).join('')}</div></div>
  </div>`;
}
function pageSolucoes(){
  return `${pageHead('Soluções','Soluções para cada necessidade da fábrica','Combinamos produtos, projeto e acompanhamento para resolver problemas concretos de produção e manutenção.')}
  <div class="wrap page">${SOLUCOES.map(s=>`<section class="sol" id="${s.id}"><div class="l"><h2>${esc(s.nome)}</h2><p class="muted">${esc(s.desafio)}</p><div class="cta-row"><a class="btn btn-primary btn-sm" href="#orcamento" data-go="orcamento" data-item="sol:${s.id}">Pedir orçamento</a></div></div><div class="r"><div><h4>O que entregamos</h4><ul class="ul">${s.entrega.map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div><div><h4>Produtos relacionados</h4><div class="chiplinks">${s.prods.map(id=>{const p=prod(id);return `<a href="#produto-${id}" data-go="produto" data-param="${id}">${esc(p.codigo)}</a>`}).join('')}</div></div></div></section>`).join('')}</div>`;
}
function pageSobre(){
  return `${pageHead('Sobre a empresa','Automação industrial com foco em dados','A ATS nasceu para ajudar fábricas de médio porte a dar o primeiro passo na Indústria 4.0, com equipamentos confiáveis e projetos que cabem na realidade de cada planta.')}
  <div class="wrap page">
    <div class="grid-3">
      <div class="card"><h3>Missão</h3><p class="muted">Tornar a produção industrial mais previsível, segura e eficiente por meio de automação e dados.</p></div>
      <div class="card"><h3>Visão</h3><p class="muted">Ser a parceira preferida das indústrias brasileiras na modernização dos seus processos.</p></div>
      <div class="card"><h3>Valores</h3><ul class="ul"><li>Segurança em primeiro lugar</li><li>Transparência técnica</li><li>Compromisso com o resultado do cliente</li></ul></div>
    </div>
    <div class="grid-2" style="margin-top:3rem">
      <div style="display:grid;gap:1rem;align-content:start"><h2>Nossa trajetória</h2>
        <ol class="timeline"><li><span class="y">2014</span><p>Fundação, com projetos de retrofit de máquinas operatrizes.</p></li><li><span class="y">2017</span><p>Início da representação de sensores e CLPs para o mercado de manufatura.</p></li><li><span class="y">2020</span><p>Lançamento da plataforma ATS Monitor, com painéis de OEE.</p></li><li><span class="y">2024</span><p>Entrada na robótica colaborativa, com os modelos RC-10 e RS-500.</p></li></ol>
      </div>
      <div style="display:grid;gap:1rem;align-content:start"><h2>Capacidade técnica</h2>
        <ul class="ul"><li>Laboratório para testes de integração entre CLPs, sensores e gateways</li><li>Equipe de engenheiros de automação e técnicos de campo</li><li>Atendimento remoto e visitas técnicas em plantas industriais</li><li>Treinamento para operação e manutenção dos sistemas entregues</li></ul>
        <div class="cta-row" style="margin-top:.5rem"><a class="btn btn-primary" href="#contato" data-go="contato">Falar com um especialista</a></div>
      </div>
    </div>
  </div>`;
}

function itemOptions(sel){
  return `<option value="">Selecione um produto ou solução</option>`+CATS.map(c=>`<optgroup label="${esc(c.nome)}">${PRODUTOS.filter(p=>p.cat===c.id).map(p=>`<option value="${p.id}"${sel===p.id?' selected':''}>${esc(p.codigo)} · ${esc(p.nome)}</option>`).join('')}</optgroup>`).join('')+`<optgroup label="Soluções">${SOLUCOES.map(s=>`<option value="sol:${s.id}"${sel==='sol:'+s.id?' selected':''}>${esc(s.nome)}</option>`).join('')}</optgroup>`;
}
function pageOrcamento(){
  const u=me(),d=S.draft||{};
  const v=(k,fb)=>d[k]!=null&&d[k]!==''?d[k]:(fb||'');
  const info=itemInfo(d.item);
  const banner=u
    ?`<div class="banner ok"><b>Enviando como ${esc(u.nome)}</b><span class="muted">${esc(u.email)}</span></div>`
    :`<div class="banner warn"><b>Entre para enviar a solicitação</b><span>Você pode preencher o formulário agora. Para concluir, é preciso <a href="#login" data-go="login">entrar ou criar uma conta</a>. Os dados preenchidos são mantidos.</span></div>`;
  const note=S.notice?`<div class="banner ok" role="status"><b>${esc(S.notice)}</b></div>`:'';
  S.notice='';
  return `${pageHead('Orçamento','Solicitar orçamento','Informe o que você precisa. Nossa equipe analisa o pedido e envia a proposta pela área do cliente.')}
  <div class="wrap page"><div class="two-col">
    <form class="form" id="f-orc" novalidate>
      ${note}${banner}
      <div class="row2">
        ${field('nome','Nome',{value:v('nome',u&&u.nome),ac:'name'})}
        ${field('empresa','Empresa',{value:v('empresa',u&&u.empresa),ac:'organization'})}
      </div>
      <div class="row2">
        ${field('email','E-mail',{type:'email',value:v('email',u&&u.email),ac:'email'})}
        ${field('tel','Telefone',{type:'tel',value:v('tel',u&&u.tel),ac:'tel',ph:'(19) 98765-4321',mask:'phone'})}
      </div>
      <div class="field" data-field="item"><label for="item">Produto ou solução</label><select id="item" name="item" aria-describedby="item-e">${itemOptions(d.item)}</select><div class="err" id="item-e" role="alert"></div></div>
      <div class="field" data-field="qtd"><label for="qtd">Quantidade</label><input id="qtd" name="qtd" type="number" inputmode="numeric" min="1" step="1" value="${esc(v('qtd','1'))}" aria-describedby="qtd-h qtd-e"><div class="hint" id="qtd-h">${info?'Quantidade mínima para este item: '+info.min+'.':'Escolha um item para ver a quantidade mínima.'}</div><div class="err" id="qtd-e" role="alert"></div></div>
      <div class="field" data-field="msg"><label for="msg">Mensagem <span class="opt">(opcional)</span></label><textarea id="msg" name="msg" maxlength="500" aria-describedby="msg-h">${esc(v('msg'))}</textarea><div class="hint" id="msg-h">Descreva a aplicação, o número de máquinas ou o prazo desejado. Até 500 caracteres.</div></div>
      <div class="cta-row"><button class="btn btn-primary" type="submit">Enviar solicitação</button></div>
    </form>
    <aside class="side"><h2 style="font-size:1.5rem">Depois do envio</h2><p class="muted">Cada solicitação passa por etapas que você acompanha na área do cliente.</p>
      <ol class="statuslist">${STATUS.map((s,i)=>`<li><span class="n">${i+1}</span><span>${s}</span></li>`).join('')}</ol>
      <p class="hint">Você pode cancelar uma solicitação enquanto ela estiver como Solicitada ou Em análise.</p></aside>
  </div></div>`;
}
function pageConfirmacao(id){
  const r=reqs().find(x=>String(x.id)===String(id));
  if(!r)return pageOrcamento();
  const it=itemInfo(r.item);
  return `${pageHead('','Solicitação registrada','')}
  <div class="wrap page"><div class="confirm">
    <div class="okmark" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
    <p class="protocol">Solicitação #${r.id}</p>
    <p class="lead">Recebemos seu pedido. A equipe técnica vai analisar e atualizar o status na sua área do cliente.</p>
    <div class="form" style="width:100%"><dl class="kv"><dt>Item</dt><dd>${esc(it?it.nome:r.item)}</dd><dt>Quantidade</dt><dd>${r.qtd}</dd><dt>Status</dt><dd><span class="pill s-0">Solicitada</span></dd><dt>Contato</dt><dd>${esc(r.contato.nome)} · ${esc(r.contato.email)}</dd></dl></div>
    <div class="cta-row"><a class="btn btn-primary" href="#area" data-go="area">Acompanhar solicitação</a><a class="btn btn-line" href="#produtos" data-go="produtos">Voltar aos produtos</a></div>
  </div></div>`;
}

function pageLogin(){
  const n=S.notice?`<div class="banner warn" role="status" style="margin-bottom:1rem"><b>${esc(S.notice)}</b></div>`:'';
  S.notice='';
  const tab=(id,label)=>`<button type="button" class="tab" role="tab" data-action="tab" data-tab="${id}" aria-selected="${S.tab===id}">${label}</button>`;
  let panel='';
  if(S.tab==='entrar'){
    panel=`<form class="form" id="f-login" novalidate>${field('email','E-mail',{type:'email',ac:'email'})}${pwField('senha','Senha')}<button class="btn btn-primary" type="submit">Entrar</button><button class="btn btn-line" type="button" data-action="demo">Entrar com a conta de demonstração</button><p class="hint">A conta de demonstração é a do cliente fictício Marcos Teixeira, com duas solicitações de exemplo.</p><p class="hint"><a href="#login" data-action="tab" data-tab="recuperar">Esqueci minha senha</a></p></form>`;
  }else if(S.tab==='cadastro'){
    panel=`<form class="form" id="f-reg" novalidate>${field('nome','Nome completo',{ac:'name'})}${field('empresa','Empresa',{ac:'organization'})}<div class="row2">${field('email','E-mail',{type:'email',ac:'email'})}${field('tel','Telefone',{type:'tel',ac:'tel',ph:'(19) 98765-4321',mask:'phone'})}</div>${pwField('senha','Senha',{ac:'new-password',hint:'Mínimo de 8 caracteres, com letras e números.'})}${pwField('senha2','Confirmar senha',{ac:'new-password'})}<button class="btn btn-primary" type="submit">Criar conta</button></form>`;
  }else{
    panel=`<form class="form" id="f-rec" novalidate><p class="muted">Informe o e-mail da conta. Nesta versão de demonstração, nenhuma mensagem é enviada.</p>${field('email','E-mail',{type:'email',ac:'email'})}<button class="btn btn-primary" type="submit">Recuperar senha</button><div id="rec-ok"></div><p class="hint"><a href="#login" data-action="tab" data-tab="entrar">Voltar ao login</a></p></form>`;
  }
  return `${pageHead('Acesso','Entrar ou criar conta','Com cadastro você envia solicitações de orçamento e acompanha cada uma delas.')}
  <div class="wrap page"><div class="narrow">${n}<div class="tabs" role="tablist" aria-label="Acesso">${tab('entrar','Entrar')}${tab('cadastro','Cadastrar')}${tab('recuperar','Recuperar senha')}</div>${panel}</div></div>`;
}

function reqCard(r){
  const it=itemInfo(r.item),cx=r.cancelada;
  const st=cx?'Cancelada':STATUS[r.status];
  const cls=cx?'s-x':'s-'+r.status;
  const can=!cx&&r.status<=1,adv=!cx&&r.status<STATUS.length-1;
  return `<article class="req"><header><div><span class="mono muted">#${r.id}</span><h3>${esc(it?it.nome:r.item)} <span class="muted" style="font-family:var(--f-body);font-size:.95rem;font-weight:400">× ${r.qtd}</span></h3></div><span class="pill ${cls}">${st}</span></header>
  <ol class="stepbar${cx?' x':''}" aria-hidden="true">${STATUS.map((s,i)=>`<li class="${(cx?i<=r.status:i<=r.status)?'on':''}"></li>`).join('')}</ol>
  <p class="meta">${cx?'Solicitação cancelada.':'Etapa '+(r.status+1)+' de 6: '+STATUS[r.status]+'.'} Registrada em ${fmtDate(r.hist[0].d)}.</p>
  <details><summary>Ver histórico e dados</summary><div class="in"><ul class="hist">${r.hist.map(h=>`<li>${fmtDate(h.d)} · ${esc(h.s)}</li>`).join('')}</ul>${r.msg?`<p><b>Mensagem:</b> ${esc(r.msg)}</p>`:''}<p class="muted">Contato: ${esc(r.contato.nome)} · ${esc(r.contato.email)} · ${esc(r.contato.tel)}</p></div></details>
  ${(can||adv)?`<div class="actions">${adv?`<button type="button" class="btn btn-line btn-sm" data-action="advance" data-id="${r.id}">Simular próxima etapa</button>`:''}${can?`<button type="button" class="btn btn-danger btn-sm" data-action="cancel" data-id="${r.id}">Cancelar solicitação</button>`:''}</div>${can?'<p class="hint">Cancelamento disponível antes do início do atendimento.</p>':''}`:''}
  </article>`;
}
function pageArea(){
  const u=me();
  const mine=reqs().filter(r=>r.owner===u.email).sort((a,b)=>b.id-a.id);
  const note=S.notice?`<div class="banner ok" role="status" style="margin-bottom:1rem"><b>${esc(S.notice)}</b></div>`:'';
  S.notice='';
  return `<div class="wrap"><div class="pagehead"><div class="areahead"><div><p class="eyebrow">Área do cliente</p><h1 style="font-size:clamp(2rem,4.4vw,3rem)">Olá, ${esc(u.nome.split(' ')[0])}</h1></div><div class="cta-row"><a class="btn btn-primary" href="#orcamento" data-go="orcamento">Nova solicitação</a><button type="button" class="btn btn-line" data-action="logout">Sair</button></div></div></div></div>
  <div class="wrap page">${note}<div class="two-col">
    <section><h2 style="margin-bottom:1rem">Minhas solicitações</h2>${mine.length?`<div class="reqs">${mine.map(reqCard).join('')}</div>`:`<div class="empty"><p><b>Você ainda não tem solicitações.</b></p><p class="muted">Escolha um produto e peça seu primeiro orçamento.</p><a class="btn btn-primary btn-sm" href="#produtos" data-go="produtos">Ver produtos</a></div>`}</section>
    <aside><h2 style="margin-bottom:1rem">Meus dados</h2><form class="form" id="f-perfil" novalidate>${field('nome','Nome',{value:u.nome,ac:'name'})}${field('empresa','Empresa',{value:u.empresa,ac:'organization'})}${field('tel','Telefone',{type:'tel',value:u.tel,ac:'tel',mask:'phone'})}<div class="field"><label for="pemail">E-mail</label><input id="pemail" value="${esc(u.email)}" readonly aria-describedby="pemail-h"><div class="hint" id="pemail-h">O e-mail identifica sua conta e não pode ser alterado.</div></div><button class="btn btn-primary" type="submit">Salvar alterações</button></form></aside>
  </div></div>`;
}
function pageContato(){
  const faq=[
    ['Preciso de cadastro para pedir orçamento?','Sim. O cadastro identifica quem está pedindo e permite acompanhar o andamento da solicitação na área do cliente.'],
    ['Quanto tempo leva para receber o orçamento?','O pedido entra em análise e a equipe técnica envia a proposta pela área do cliente. O prazo depende da complexidade do projeto.'],
    ['Vocês instalam os equipamentos?','Sim. Os projetos incluem instalação e comissionamento, e o treinamento da equipe fica combinado na proposta.'],
    ['Dá para monitorar máquinas antigas?','Dá. Sensores externos e o gateway GW-100 coletam dados mesmo de máquinas sem comunicação digital.'],
    ['Posso comprar apenas um item?','Pode. Cada produto tem uma quantidade mínima por pedido, informada na página de detalhes.']
  ];
  return `${pageHead('Contato','Fale com um especialista','Tire dúvidas técnicas ou comerciais antes de pedir o orçamento.')}
  <div class="wrap page"><div class="two-col">
    <form class="form" id="f-contato" novalidate>
      <div class="row2">${field('nome','Nome',{ac:'name'})}${field('email','E-mail',{type:'email',ac:'email'})}</div>
      <div class="field" data-field="assunto"><label for="assunto">Assunto</label><select id="assunto" aria-describedby="assunto-e"><option value="">Selecione</option><option>Dúvida técnica</option><option>Orçamento</option><option>Suporte</option><option>Parcerias</option></select><div class="err" id="assunto-e" role="alert"></div></div>
      <div class="field" data-field="msg"><label for="msg">Mensagem</label><textarea id="msg" maxlength="600" aria-describedby="msg-e"></textarea><div class="err" id="msg-e" role="alert"></div></div>
      <button class="btn btn-primary" type="submit">Enviar mensagem</button>
      <div id="contato-ok"></div>
    </form>
    <aside class="side"><h2 style="font-size:1.5rem">Canais</h2><dl class="kv"><dt>E-mail</dt><dd>contato@ats.example</dd><dt>Telefone</dt><dd>(19) 3555-0100</dd><dt>Endereço</dt><dd>Av. das Indústrias, 1200, Campinas, SP (fictício)</dd><dt>Horário</dt><dd>Segunda a sexta, 8h às 18h</dd></dl></aside>
  </div>
  <div style="margin-top:3rem"><h2 style="margin-bottom:1rem">Perguntas frequentes</h2>${faq.map(f=>`<details class="faq"><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</div></div>`;
}

const ROUTES={inicio:pageInicio,produtos:pageProdutos,produto:pageProduto,solucoes:pageSolucoes,sobre:pageSobre,orcamento:pageOrcamento,confirmacao:pageConfirmacao,login:pageLogin,area:pageArea,contato:pageContato};

/* ---------- telemetria simulada ---------- */
const TELE_CH=[
  {k:'tt',tag:'TT-101',nome:'Temperatura do mancal',un:'°C',base:63,min:45,max:100,lim:80,dec:1,noise:1.2,pull:.06,hot:84},
  {k:'vt',tag:'VT-102',nome:'Vibração RMS',un:'mm/s',base:2.4,min:0,max:8,lim:4.5,dec:2,noise:.3,pull:.1,hot:5.4},
  {k:'et',tag:'ET-103',nome:'Corrente do motor',un:'A',base:18,min:10,max:30,lim:null,dec:1,noise:.7,pull:.1,hot:null},
  {k:'oee',tag:'OEE-03',nome:'OEE da linha',un:'%',base:84,min:60,max:100,lim:null,dec:1,noise:.9,pull:.08,hot:null}
];
function stopTele(){if(S.tele){clearInterval(S.tele.timer);S.tele=null}}
function startTele(){
  const panel=$('.panel');if(!panel)return;
  const t={tick:0,drift:0,ch:TELE_CH.map(c=>({c,v:c.base,buf:[]})),timer:null};
  const step=()=>{
    t.tick++;
    if(t.drift>0)t.drift--;else if(t.tick%26===0&&Math.random()<.6)t.drift=14;
    t.ch.forEach(o=>{
      const target=(t.drift>0&&o.c.hot!=null)?o.c.hot:o.c.base;
      o.v+=(target-o.v)*o.c.pull+(Math.random()-.5)*o.c.noise;
      o.v=Math.max(o.c.min,Math.min(o.c.max,o.v));
      o.buf.push(o.v);if(o.buf.length>40)o.buf.shift();
    });
  };
  for(let i=0;i<40;i++)step();
  const paint=()=>{
    const warns=[];
    t.ch.forEach(o=>{
      const row=$('.ch[data-k="'+o.c.k+'"]',panel);if(!row)return;
      $('.val',row).textContent=o.v.toFixed(o.c.dec).replace('.',',');
      const pts=o.buf.map((y,i)=>(i/(o.buf.length-1)*100).toFixed(1)+','+(28-((y-o.c.min)/(o.c.max-o.c.min))*26).toFixed(1)).join(' ');
      $('polyline',row).setAttribute('points',pts);
      const w=o.c.lim!=null&&o.v>o.c.lim;
      row.classList.toggle('warn',w);
      if(w)warns.push(o.c.tag+' acima de '+String(o.c.lim).replace('.',',')+' '+o.c.un);
    });
    const st=$('#tstate');
    if(st){st.classList.toggle('warn',warns.length>0);st.textContent=warns.length?'Atenção: '+warns.join(' · ')+'. Inspeção recomendada.':'Operação normal'}
  };
  paint();
  const slow=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  t.timer=setInterval(()=>{step();paint()},slow?3000:1400);
  S.tele=t;
}

/* ---------- roteamento ---------- */
let skipHash=false;
function parseHash(){
  let h='';try{h=location.hash.replace(/^#/,'')}catch(e){}
  if(!h)return {route:'inicio',param:null,known:true};
  const i=h.indexOf('-'),name=i<0?h:h.slice(0,i),param=i<0?null:h.slice(i+1);
  return ROUTES[name]?{route:name,param:param,known:true}:{known:false};
}
function updateHeader(){
  $$('#nav a').forEach(a=>{if((a.dataset.r||'').split(' ').indexOf(S.route)>-1)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  const u=me(),b=$('#authbtn');
  if(u){b.textContent='Minha área';b.setAttribute('href','#area');b.dataset.go='area'}else{b.textContent='Entrar';b.setAttribute('href','#login');b.dataset.go='login'}
}
function render(){
  stopTele();
  if(S.route==='area'&&!me()){S.notice='Faça login para acessar a área do cliente.';S.after='area';S.route='login';S.param=null;S.tab='entrar';try{location.hash='login'}catch(e){}}
  $('#conteudo').innerHTML=ROUTES[S.route](S.param);
  $('#nav').classList.remove('open');$('#menubtn').setAttribute('aria-expanded','false');
  updateHeader();
  if(S.route==='inicio')startTele();
}
function go(route,param){
  S.route=route;S.param=param||null;
  const h=S.param?route+'-'+S.param:route;
  try{if(location.hash!=='#'+h){skipHash=true;location.hash=h;setTimeout(()=>{skipHash=false},80)}}catch(e){}
  render();
  try{window.scrollTo(0,0);$('#conteudo').focus({preventScroll:true})}catch(e){}
}
window.addEventListener('hashchange',()=>{
  if(skipHash){skipHash=false;return}
  const p=parseHash();if(!p.known)return;
  S.route=p.route;S.param=p.param;render();
  try{window.scrollTo(0,0)}catch(e){}
});

/* ---------- ações ---------- */
function login(email){
  store.set('ax_session',email);
  const dest=S.after||'area';S.after=null;
  S.notice=dest==='orcamento'?'Você entrou. Revise os dados e envie a solicitação.':'';
  toast('Login realizado.');
  go(dest);
}
function mask(el){
  const d=el.value.replace(/\D/g,'').slice(0,11);
  let o=d;
  if(d.length>10)o='('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);
  else if(d.length>6)o='('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6);
  else if(d.length>2)o='('+d.slice(0,2)+') '+d.slice(2);
  else if(d.length>0)o='('+d;
  el.value=o;
}
function toggleFav(id){
  let f=favs().slice();const i=f.indexOf(id);
  if(i>-1)f.splice(i,1);else f.push(id);
  store.set('ax_fav',f);
  const on=f.indexOf(id)>-1;
  $$('[data-fav="'+id+'"]').forEach(b=>{b.setAttribute('aria-pressed',on);if(b.classList.contains('btn'))b.textContent=on?'Remover dos favoritos':'Adicionar aos favoritos'});
  if(S.route==='produtos')updateGrid();
  toast(on?'Adicionado aos favoritos.':'Removido dos favoritos.');
}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-go],[data-action],[data-fav],[data-cat]');if(!t)return;
  if(t.dataset.action==='skip'){e.preventDefault();$('#conteudo').focus();return}
  if(t.dataset.go){
    e.preventDefault();
    if(t.dataset.item)S.draft=Object.assign({},S.draft||{},{item:t.dataset.item});
    go(t.dataset.go,t.dataset.param);return;
  }
  if(t.dataset.fav){toggleFav(t.dataset.fav);return}
  if(t.dataset.cat){S.cat=t.dataset.cat;updateGrid();return}
  const a=t.dataset.action;
  if(a==='menu'){const n=$('#nav'),o=n.classList.toggle('open');t.setAttribute('aria-expanded',o)}
  else if(a==='theme'){
    const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme=dark?'light':'dark';
  }
  else if(a==='clear'){S.q='';S.cat='todos';S.sort='rel';render()}
  else if(a==='tab'){e.preventDefault();S.tab=t.dataset.tab;render()}
  else if(a==='pw'){const i=$('#'+t.dataset.for);const show=i.type==='password';i.type=show?'text':'password';t.textContent=show?'Ocultar':'Mostrar'}
  else if(a==='demo'){login('demo@ats.com.br')}
  else if(a==='logout'){store.set('ax_session',null);S.after=null;toast('Você saiu da conta.');go('inicio')}
  else if(a==='cancel'){
    const l=reqs().map(r=>{if(String(r.id)===t.dataset.id&&!r.cancelada&&r.status<=1){r.cancelada=true;r.hist=r.hist.concat([{s:'Cancelada',d:today()}])}return r});
    store.set('ax_reqs',l);S.notice='Solicitação #'+t.dataset.id+' cancelada.';render();
  }
  else if(a==='advance'){
    const l=reqs().map(r=>{if(String(r.id)===t.dataset.id&&!r.cancelada&&r.status<STATUS.length-1){r.status++;r.hist=r.hist.concat([{s:STATUS[r.status],d:today()}])}return r});
    store.set('ax_reqs',l);S.notice='Status da solicitação #'+t.dataset.id+' atualizado (simulação).';render();
  }
});
document.addEventListener('input',e=>{
  const el=e.target;
  if(el.id==='q'){S.q=el.value;updateGrid();return}
  if(el.dataset&&el.dataset.mask==='phone')mask(el);
  const f=el.closest&&el.closest('.field');
  if(f&&el.getAttribute('aria-invalid')==='true'){el.removeAttribute('aria-invalid');const b=$('.err',f);if(b)b.textContent=''}
});
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.id==='sort'){S.sort=el.value;updateGrid();return}
  if(el.id==='item'&&$('#f-orc')){
    const info=itemInfo(el.value);
    $('#qtd-h').textContent=info?'Quantidade mínima para este item: '+info.min+'.':'Escolha um item para ver a quantidade mínima.';
    const q=$('#qtd');if(info&&Number(q.value)<info.min)q.value=info.min;
  }
});
document.addEventListener('submit',e=>{
  const f=e.target;e.preventDefault();
  const errs={};
  if(f.id==='f-orc'){
    const d={nome:val(f,'nome'),empresa:val(f,'empresa'),email:val(f,'email'),tel:val(f,'tel'),item:val(f,'item'),qtd:val(f,'qtd'),msg:val(f,'msg')};
    errs.nome=V.nome(d.nome);errs.empresa=V.req(d.empresa,'Informe o nome da empresa.');errs.email=V.email(d.email);errs.tel=V.tel(d.tel);
    const info=itemInfo(d.item);
    if(!info)errs.item='Selecione um produto ou uma solução.';
    const q=Number(d.qtd);
    if(!d.qtd||!Number.isInteger(q)||q<1)errs.qtd='Informe uma quantidade inteira maior que zero.';
    else if(info&&q<info.min)errs.qtd='A quantidade mínima para este item é '+info.min+'.';
    S.draft=d;
    if(!applyErrors(f,errs))return;
    const u=me();
    if(!u){S.after='orcamento';S.notice='Entre ou crie uma conta para enviar sua solicitação. Os dados do formulário foram mantidos.';S.tab='entrar';go('login');return}
    const l=reqs(),id=Math.max.apply(null,[1023].concat(l.map(r=>r.id)))+1;
    l.push({id:id,owner:u.email,item:d.item,qtd:q,msg:d.msg.trim(),empresa:d.empresa.trim(),contato:{nome:d.nome.trim(),email:d.email.trim(),tel:d.tel},status:0,cancelada:false,hist:[{s:'Solicitada',d:today()}]});
    store.set('ax_reqs',l);S.draft=null;
    go('confirmacao',String(id));
  }
  else if(f.id==='f-login'){
    const email=val(f,'email').trim(),senha=val(f,'senha');
    errs.email=V.email(email);errs.senha=senha?'':'Informe a senha.';
    if(!errs.email&&!errs.senha){
      const u=users().find(x=>x.email.toLowerCase()===email.toLowerCase());
      if(!u||u.senha!==pw(u.email,senha))errs.senha='E-mail ou senha incorretos. Confira os dados e tente de novo.';
    }
    if(!applyErrors(f,errs))return;
    login(users().find(x=>x.email.toLowerCase()===email.toLowerCase()).email);
  }
  else if(f.id==='f-reg'){
    const d={nome:val(f,'nome'),empresa:val(f,'empresa'),email:val(f,'email').trim(),tel:val(f,'tel'),senha:val(f,'senha'),senha2:val(f,'senha2')};
    errs.nome=V.nome(d.nome);errs.empresa=V.req(d.empresa,'Informe o nome da empresa.');errs.email=V.email(d.email);errs.tel=V.tel(d.tel);errs.senha=V.senha(d.senha);
    errs.senha2=d.senha2?(d.senha2===d.senha?'':'As senhas não são iguais.'):'Confirme a senha.';
    if(!errs.email&&users().some(x=>x.email.toLowerCase()===d.email.toLowerCase()))errs.email='Este e-mail já está cadastrado. Entre na sua conta ou use outro e-mail.';
    if(!applyErrors(f,errs))return;
    const l=users();l.push({nome:d.nome.trim(),empresa:d.empresa.trim(),email:d.email,tel:d.tel,senha:pw(d.email,d.senha)});
    store.set('ax_users',l);
    login(d.email);
  }
  else if(f.id==='f-rec'){
    errs.email=V.email(val(f,'email'));
    if(!applyErrors(f,errs))return;
    $('#rec-ok').innerHTML='<div class="banner ok" role="status"><b>Pedido de recuperação registrado.</b><span>Em um sistema em produção, enviaríamos um link de redefinição para '+esc(val(f,'email').trim())+'.</span></div>';
  }
  else if(f.id==='f-contato'){
    errs.nome=V.nome(val(f,'nome'));errs.email=V.email(val(f,'email'));errs.assunto=val(f,'assunto')?'':'Selecione o assunto.';errs.msg=val(f,'msg').trim().length>=10?'':'Escreva uma mensagem com pelo menos 10 caracteres.';
    if(!applyErrors(f,errs))return;
    f.reset();
    $('#contato-ok').innerHTML='<div class="banner ok" role="status"><b>Mensagem registrada.</b><span>Em produção, a equipe responderia em até 1 dia útil.</span></div>';
    toast('Mensagem registrada.');
  }
  else if(f.id==='f-perfil'){
    errs.nome=V.nome(val(f,'nome'));errs.empresa=V.req(val(f,'empresa'),'Informe o nome da empresa.');errs.tel=V.tel(val(f,'tel'));
    if(!applyErrors(f,errs))return;
    const u=me(),l=users().map(x=>{if(x.email===u.email){x.nome=val(f,'nome').trim();x.empresa=val(f,'empresa').trim();x.tel=val(f,'tel')}return x});
    store.set('ax_users',l);S.notice='Dados atualizados.';render();
  }
});

/* ---------- início ---------- */
seed();
const first=parseHash();
if(first.known){S.route=first.route;S.param=first.param}
render();
})();
