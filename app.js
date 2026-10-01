/* ── VITRINE · app ──────────────────────────────────────────── */
var MEU_WA = '5541988887777'; // ← TODO: troque pelo seu WhatsApp (DDI 55 + DDD + número)

function norm(s){ return (s||'').toLowerCase().replace(/[.,()]/g,' ').replace(/\s+/g,' ').trim(); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

function findLead(q, cidade){
  q = norm(q);
  if(!q) return null;
  var best = null, bestScore = 0;
  for(var i=0;i<LEADS.length;i++){
    var l = LEADS[i], n = norm(l.n);
    if(cidade && norm(l.c) !== norm(cidade)) continue;
    var score = 0;
    if(n === q) score = 100;
    else if(n.indexOf(q) === 0) score = 80;
    else if(n.indexOf(q) > -1) score = 60;
    else if(q.indexOf(n) > -1 && n.length > 4) score = 40;
    // tolera pequenos erros: compara palavras
    if(score < 40){
      var qw = q.split(' '), nw = n.split(' ');
      var hit = 0;
      for(var w=0; w<qw.length; w++){
        for(var x=0; x<nw.length; x++){
          if(qw[w].length < 4) continue;
          if(nw[x].indexOf(qw[w]) === 0 || qw[w].indexOf(nw[x]) === 0){ hit++; break; }
        }
      }
      if(qw.length && hit === qw.length) score = 50;
    }
    if(score > bestScore){ bestScore = score; best = l; }
  }
  return bestScore >= 40 ? best : null;
}

function slugDemo(nome){
  return norm(nome).replace(/[^a-z0-9]+/g, '-').slice(0, 48).replace(/^-+|-+$/g, '');
}

function demoUrl(nome){
  if (window.DEMOS && window.DEMOS.indexOf(slugDemo(nome)) !== -1)
    return 'https://pdramos.github.io/vitrine-demos/' + slugDemo(nome) + '/';
  return null;
}

function waMsg(nome, semSite, cidade, demo){
  if(!nome) return 'Olá! Vi a página de vocês e gostaria de fazer o diagnóstico gratuito do meu comércio online.';
  if(demo){
    return 'Olá! Me chamo [seu nome]. Encontrei o ' + nome + ' na lista de vocês e vi que vocês já montaram uma página de exemplo pra ele — só de olhar deu pra ver como a loja ficaria online.\n\nSe eu fechar, vocês finalizam com as fotos da minha loja e publicam de verdade? Posso ver como funciona?';
  }
  if(semSite){
    return 'Olá! Me chamo [seu nome]. Busquei "' + nome + '" na internet e só encontrei páginas de diretório — o comércio ainda não tem site próprio.\n\nLi que vocês fazem sites rápidos para comércio de bairro. Podem me mandar mais detalhes?';
  }
  return 'Olá! Meu comércio ' + nome + ' já tem site, mas estou avaliando um refresh/cuidado mensal. Podem me mandar mais detalhes?';
}

function renderDiag(){
  var q = document.getElementById('in-nome').value;
  var box = document.getElementById('resultado');
  var selCidade = chipAtiva('chips-cidade');
  var lead = findLead(q, selCidade);
  if(!lead){
    var ex = LEADS.slice(0,4).map(function(l,i){
      return '<button type="button" data-ex="' + esc(l.n) + '">' + esc(l.n) + '</button>';
    }).join(' · ');
    box.innerHTML =
      '<div class="res" role="status">' +
      '<div class="res-veredito sem">Não encontramos <b>' + esc(q || 'esse nome') + '</b> no nosso banco verificado ainda — mas foi por isso que o diagnóstico existe: <b>vamos verificar a sua loja agora, uma a uma, com as fontes</b>. É de graça.</div>' +
      '<div class="res-cta"><a class="btn btn-wa" id="wa-diag" target="_blank" rel="noopener">Pedir meu diagnóstico →</a></div>' +
      '<div class="res-exemplos">Quer ver um exemplo de resultado? Tente: ' + ex + '</div>' +
      '</div>';
    bindWa(box);
    bindExemplos(box);
    return;
  }
  var semSite = !lead.s;
  var demo = demoUrl(lead.n);
  var fonteHtml = '';
  if(lead.f && lead.f.length){
    fonteHtml = '<ul class="res-links">' + lead.f.map(function(f){
      var u = f.u || (f.l && /^https?:/.test(f.l) ? f.l : '');
      if(!u) return '';
      var tag = (u.indexOf('cylex') > -1 ? 'diretório' : u.indexOf('cnpj') > -1 ? 'cnpj' : u.indexOf('keenz') > -1 ? 'mapa' : 'fonte');
      return '<li><span class="fonte-tag">[' + tag + ']</span><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u) + '</a></li>';
    }).join('') + '</ul>';
  }
  var veredito = semSite
    ? (demo
      ? '<div class="res-veredito sem"><b>' + esc(lead.n) + '</b> (' + esc(lead.c) + ') aparece hoje <b>somente em páginas de terceiros</b> — e nós fomos adiante: <b>montamos uma página de demonstração</b> pra você ver como a loja ficaria online. O botão abaixo abre no link.</div>'
      : '<div class="res-veredito sem"><b>' + esc(lead.n) + '</b> (' + esc(lead.c) + ') aparece hoje <b>somente em páginas de terceiros</b> — não tem site próprio. Foi isso que as fontes abaixo mostram:</div>')
    : '<div class="res-veredito com"><b>' + esc(lead.n) + '</b> (' + esc(lead.c) + ') <b>já tem um site</b>: ' + esc(lead.s) + ' — aí o próximo passo costuma ser um refresh, fotos novas ou o plano de cuidado mensal.</div>';
  box.innerHTML =
    '<div class="res" role="status">' + veredito + fonteHtml +
    '<div class="res-cta">' +
      (demo ? '<a class="btn btn-wa" id="wa-diag" target="_blank" rel="noopener">Ver o site que montamos pro ' + esc(lead.n) + ' →</a>'
            : '<a class="btn btn-wa" id="wa-diag" target="_blank" rel="noopener">' + (semSite ? 'Quero um site pro meu negócio →' : 'Falar sobre meu site →') + '</a>') +
      (demo ? '<a class="btn" href="' + esc(demo) + '" target="_blank" rel="noopener" style="background:var(--acc);color:#fff">abrir a página de demonstração ↗</a>' : '') +
      (lead.t && !demo ? '<a class="btn" style="background:transparent;color:var(--ink)" href="tel:+' + esc(lead.t.replace(/\D/g,'')) + '">ligar: ' + esc(lead.t) + '</a>' : '') +
    '</div>' +
    (demo ? '<p class="res-nota">O link de demonstração é público e usa o nome, a cidade e o número reais do comércio. É só olhar — se gostar, a gente finaliza com as fotos da loja.</p>'
           : '<p class="res-nota">Confira cada link acima — é assim que a gente trabalha: fontes abertas, nada de achismo. Verificado em ' + esc(DATA_VERIFICACAO) + '.</p>') +
    '</div>';
  bindWa(box);
}

function bindWa(scope){
  var a = scope.querySelector ? scope.querySelector('#wa-diag') : null;
  if(!a) return;
  var q = norm(document.getElementById('in-nome').value);
  var selCidade = chipAtiva('chips-cidade');
  var lead = findLead(q, selCidade);
  var msg;
  if(!lead){
    msg = 'Olá! Vi a página de vocês e gostaria de fazer o diagnóstico gratuito do meu comércio "' + (q || 'X') + '" — ele ainda não está no banco verificado de vocês.';
  } else {
    var demo = demoUrl(lead.n);
    if(demo) msg = 'Olá! Me chamei de [seu nome]. Vi o demo do ' + lead.n + ' que vocês montaram (' + demo + '). Quero fechar o site de verdade com as fotos da minha loja.';
    else msg = waMsg(lead.n, !lead.s, lead.c);
  }
  a.href = 'https://wa.me/' + MEU_WA + '?text=' + encodeURIComponent(msg);
}
function bindExemplos(scope){
  var bs = scope.querySelectorAll('[data-ex]');
  for(var i=0;i<bs.length;i++){
    bs[i].addEventListener('click', function(){
      document.getElementById('in-nome').value = this.getAttribute('data-ex');
      renderDiag();
    });
  }
}

function chipAtiva(idBox){
  var on = document.querySelector('#' + idBox + ' .chip.on');
  return on ? on.getAttribute('data-cidade') : null;
}

function buildChips(idBox, cidades){
  var box = document.getElementById(idBox);
  var opts = ['Todas as cidades'].concat(cidades);
  box.innerHTML = opts.map(function(c){
    var v = c === 'Todas as cidades' ? '' : c;
    return '<button type="button" class="chip' + (v===''?' on':'') + '" data-cidade="' + esc(v) + '" data-box="' + idBox + '">' + esc(c) + '</button>';
  }).join('');
  box.addEventListener('click', function(e){
    var b = e.target.closest('.chip');
    if(!b) return;
    var chips = box.querySelectorAll('.chip');
    for(var i=0;i<chips.length;i++) chips[i].classList.remove('on');
    b.classList.add('on');
    if(idBox === 'chips-cidade') renderDiag();
    else renderLista();
  });
}

function renderLista(){
  var sel = chipAtiva('chips-lista');
  var ul = document.getElementById('lista');
  var n = 0;
  ul.innerHTML = LEADS.filter(function(l){
    return !sel || norm(l.c) === norm(sel);
  }).map(function(l){
    n++;
    var badge = l.s
      ? '<span class="l-badge com">já tem site · refresh</span>'
      : '<span class="l-badge">sem site próprio</span>';
    return '<li><div><span class="l-nome">' + esc(l.n) + '</span><br><span class="l-cat">' + esc(l.cat) + ' · ' + esc(l.c) + (l.t ? ' · ' + esc(l.t) : '') + '</span></div>' + badge + '</li>';
  }).join('');
  document.getElementById('lista-count').textContent = n + ' comércios verificados' + (sel ? ' em ' + sel : '') + ' · ' + DATA_VERIFICACAO;
}

function init(){
  // cidades dos dados
  var cidades = [];
  LEADS.forEach(function(l){ if(cidades.indexOf(l.c) === -1) cidades.push(l.c); });
  cidades.sort();
  buildChips('chips-cidade', cidades);
  buildChips('chips-lista', cidades);
  renderLista();

  // diagnóstico
  document.getElementById('f-diag').addEventListener('submit', function(e){
    e.preventDefault();
    renderDiag();
    document.getElementById('resultado').scrollIntoView({behavior:'smooth', block:'nearest'});
  });
  document.getElementById('in-nome').addEventListener('input', function(){
    if(this.value.length >= 4) renderDiag();
  });

  // CTAs fixos
  var msgTopo = 'Olá! Quero fazer o diagnóstico gratuito da presença online do meu comércio.';
  ['wa-topo','wa-final'].forEach(function(id){
    var a = document.getElementById(id);
    if(a) a.href = 'https://wa.me/' + MEU_WA + '?text=' + encodeURIComponent(msgTopo);
  });

  // revelação
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.15});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });
}
document.addEventListener('DOMContentLoaded', init);
