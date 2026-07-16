/* ============================================================ */
/*  SAC Style – 地震地质 科普微网站  App Scripts                 */
/*  重构版：HiDPI Canvas 修复 · 答题反馈增强 · defer 加载        */
/* ============================================================ */

/**
 * Debounce helper — limits how often a function fires during rapid events
 * like scroll and resize.
 */
function debounce(fn, delay) {
  var timer = null;
  return function () {
    var ctx = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(ctx, args);
    }, delay);
  };
}

/* -------------------------------------------------- */
/*  入口：DOMContentLoaded 后所有模块按序初始化         */
/* -------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  initSeismograph();
  initEarthLayers();
  initCaseTabs();
  initExplorer({
    nodesSel: '.explore-node[data-boundary]',
    legendSel: '.leg-item[data-boundary]',
    data: plateData,
    attr: 'data-boundary',
    idName: 'plateName',
    idStats: 'plateStats',
    idDesc: 'plateDesc'
  });
  initExplorer({
    nodesSel: '.explore-node[data-rock]',
    legendSel: '.leg-item[data-rock]',
    data: rockData,
    attr: 'data-rock',
    idName: 'rockName',
    idStats: 'rockStats',
    idDesc: 'rockDesc'
  });
  initExplorer({
    nodesSel: '.explore-node[data-era]',
    legendSel: '.leg-item[data-era]',
    data: timeData,
    attr: 'data-era',
    idName: 'timeName',
    idStats: 'timeStats',
    idDesc: 'timeDesc'
  });
  initQuiz();
  initThemeToggle();
  initReadingProgress();
  initBackToTop();
  initNav();
});

/* ================================================================ */
/*  Hero 地震波动画                                                  */
/* ================================================================ */


/* ================================================================ */
/* Hero Seismograph Animation — Refitted for Classic Realism        */
/* ================================================================ */
function initSeismograph() {
  const line = document.getElementById('seismoLine');
  if (!line) return;

  // Configuration optimized for realistic classic fitting
  const config = {
    width: 700,         // Match SVG viewBox
    baseline: 55,       // Centered Y position
    numPoints: 120,     // Higher point density for jagged peaks
    decayConst: 0.15,   // Higher value = faster decay after burst
    wobbleSpeed: 0.08   // How fast the chaotic oscillation moves
  };

  let offset = 0;

  /**
   * Refitted Wave Fitting Logic
   * Simulates chaotic decay, nested frequencies, P/S wave mixing,
   * and classic noise burst mechanics.
   */
  function simulateRealisticFitting(xNormalized, timeOffset) {
    const decay = Math.exp(-config.decayConst * xNormalized);

    // 1. Nested Chaotic Harmonic — Mixed low and high frequency chaos
    const nestFreq = 15;
    const nestChaos = Math.sin(xNormalized * nestFreq + timeOffset);
    let harmonicInput = xNormalized * 25 + timeOffset;

    if (xNormalized > 0.3) { // After "P-wave" trigger burst
      harmonicInput += Math.pow(xNormalized - 0.3, 2) * 50;
    }

    const chaoticHarmonic = Math.sin(harmonicInput + nestChaos * 2) * decay;

    // 2. Main Large S-Wave oscillation — decays over distance
    const mainWave = Math.sin(xNormalized * 12 + timeOffset * 1.5) * decay;

    // 3. High Frequency Burst Noise — crucial for that pen look
    let burstNoise = 0;
    if (xNormalized > 0.1 && xNormalized < 0.6) {
      burstNoise = (Math.random() - 0.5) * 6 * decay; // Classic jagged peaks
    }

    // 4. Amplitude Modulation — Wave grows from trigger, then decays
    const amplitudeFactor = (decay > 0.9 ? 1.0 : decay);
    const triggerBoost = (xNormalized < 0.25 ? 0.3 + xNormalized * 2 : 1.0); // Boost trigger

    return (mainWave * 15 + chaoticHarmonic * 8 + burstNoise) * amplitudeFactor * triggerBoost;
  }

  /**
   * Generate SVG polyline points string
   */
  function generatePoints(timeOffset) {
    const pts = [];
    for (let i = 0; i < config.numPoints; i++) {
      const xNormalized = (i / (config.numPoints - 1)); // 0.0 -> 1.0
      const xDisplay = xNormalized * config.width;
      const waveShift = simulateRealisticFitting(xNormalized, timeOffset);
      const yDisplay = config.baseline - waveShift;
      pts.push(`${xDisplay},${yDisplay}`);
    }
    return pts.join(' ');
  }

  /**
   * Classic Seismograph Drawing Loop
   */
  // classic drawing speed — faster for chaotic bursts
  var rafId = null;

  function animateDrawing() {
    offset += config.wobbleSpeed;
    line.setAttribute('points', generatePoints(offset));
    rafId = requestAnimationFrame(animateDrawing);
  }

  function startAnim() {
    if (rafId === null) rafId = requestAnimationFrame(animateDrawing);
  }

  function stopAnim() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Pause when hero scrolls off-screen (saves CPU/battery on mobile)
  if ('IntersectionObserver' in window) {
    var heroEl = line.closest('.hero');
    if (heroEl) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? startAnim() : stopAnim(); });
      }, { threshold: 0 }).observe(heroEl);
    } else { startAnim(); }
  } else { startAnim(); }
}





/* ================================================================ */
/*  地球圈层交互（数据与事件）                                       */
/* ================================================================ */
var layerData = {
  crust: {
    name: '地壳',
    stats: [
      ['厚度', '5–70 km'],
      ['状态', '固态'],
      ['主要成分', '硅铝层、硅镁层']
    ],
    desc: '地壳是地球最外层的固体岩石圈层，分为洋壳与陆壳。大陆地壳较厚，平均约35公里；大洋地壳较薄，仅约5–10公里。地壳岩石以硅铝层和硅镁层为主，承载着我们所熟知的一切地表景观。'
  },
  upper: {
    name: '上地幔',
    stats: [
      ['深度', '70–670 km'],
      ['状态', '固态—塑性'],
      ['主要成分', '橄榄石、辉石']
    ],
    desc: '上地幔位于地壳之下，顶部与地壳共同构成岩石圈。其下部存在软流层，物质呈部分熔融的塑性状态，被认为是岩浆的主要发源地和板块运动的动力基础。'
  },
  lower: {
    name: '下地幔',
    stats: [
      ['深度', '670–2890 km'],
      ['状态', '高压固态'],
      ['主要成分', '钙钛矿结构矿物']
    ],
    desc: '下地幔从670公里延伸至约2890公里深处，处于极高的温度与压力之下。物质以钙钛矿结构的硅酸盐矿物为主，虽温度极高，但因压力巨大而保持固态，密度随深度持续增大。'
  },
  outer: {
    name: '外核',
    stats: [
      ['深度', '2890–5150 km'],
      ['状态', '液态'],
      ['主要成分', '铁、镍（熔融）']
    ],
    desc: '外核是地球的液态金属圈层，主要由熔融的铁和镍组成。液态外核的对流运动产生地球磁场，是地磁场的根源。其厚度约2260公里，温度高达4000–5000℃。'
  },
  inner: {
    name: '内核',
    stats: [
      ['深度', '5150–6371 km'],
      ['状态', '固态'],
      ['主要成分', '铁、镍（固态）']
    ],
    desc: '内核是地球最中心的部分，半径约1220公里。尽管温度极高（约5500℃），但巨大的压力使铁镍合金保持固态。内核以略快于地表的自转速率旋转，是地球热演化的关键区域。'
  }
};

function initEarthLayers() {
  var rings = document.querySelectorAll('.layer-ring');
  var legs = document.querySelectorAll('.leg-item');
  var nameEl = document.getElementById('layerName');
  var statsEl = document.getElementById('layerStats');
  var descEl = document.getElementById('layerDesc');

  if (!rings.length || !legs.length || !nameEl || !statsEl || !descEl) return;

  function setActive(layerKey) {
    var data = layerData[layerKey];
    if (!data) return;

    rings.forEach(function (r) {
      r.classList.toggle('active', r.getAttribute('data-layer') === layerKey);
    });
    legs.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-layer') === layerKey);
    });

    nameEl.textContent = data.name;
    statsEl.innerHTML = data.stats.map(function (s) {
      return '<div class="stat-row"><span>' + s[0] + '</span><span>' + s[1] + '</span></div>';
    }).join('');
    descEl.textContent = data.desc;
  }

  rings.forEach(function (r) {
    r.addEventListener('click', function () { setActive(r.getAttribute('data-layer')); });
  });
  legs.forEach(function (l) {
    l.addEventListener('click', function () { setActive(l.getAttribute('data-layer')); });
  });
}

/* ================================================================ */
/*  通用探索器（板块 / 岩石 / 年代 数据驱动切换）                     */
/* ================================================================ */
function initExplorer(opts) {
  var nodes = document.querySelectorAll(opts.nodesSel);
  var legs = document.querySelectorAll(opts.legendSel);
  var nameEl = document.getElementById(opts.idName);
  var statsEl = document.getElementById(opts.idStats);
  var descEl = document.getElementById(opts.idDesc);

  if (!nodes.length || !legs.length || !nameEl || !statsEl || !descEl) return;

  function setActive(key) {
    var d = opts.data[key];
    if (!d) return;

    nodes.forEach(function (n) {
      n.classList.toggle('active', n.getAttribute(opts.attr) === key);
    });
    legs.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute(opts.attr) === key);
    });

    nameEl.textContent = d.name;
    statsEl.innerHTML = d.stats.map(function (s) {
      return '<div class="stat-row"><span>' + s[0] + '</span><span>' + s[1] + '</span></div>';
    }).join('');
    descEl.textContent = d.desc;
  }

  nodes.forEach(function (n) {
    n.addEventListener('click', function () { setActive(n.getAttribute(opts.attr)); });
    n.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(n.getAttribute(opts.attr));
      }
    });
  });
  legs.forEach(function (l) {
    l.addEventListener('click', function () { setActive(l.getAttribute(opts.attr)); });
  });
}

/* ---- 板块边界数据 ---- */
var plateData = {
  divergent: {
    name: '离散边界',
    stats: [['运动方式', '张裂、背离'], ['典型地形', '洋中脊、裂谷'], ['代表实例', '大西洋中脊']],
    desc: '两个板块背向运动、地幔物质上涌填补空隙，形成新的洋壳。洋中脊便是这种边界，东非大裂谷则是大陆内部的张裂雏形。'
  },
  convergent: {
    name: '汇聚边界',
    stats: [['运动方式', '相互挤压'], ['类型', '俯冲 / 碰撞'], ['代表实例', '环太平洋、喜马拉雅']],
    desc: '板块相向运动：洋壳俯冲到大陆或另一洋壳之下（俯冲带，多火山地震），或大陆与大陆碰撞隆升（如印度—欧亚碰撞形成喜马拉雅）。'
  },
  transform: {
    name: '转换边界',
    stats: [['运动方式', '水平错动'], ['典型地形', '转换断层'], ['代表实例', '圣安德烈亚斯断层']],
    desc: '两板块沿断层水平错动、互不增减面积，地震多沿断层集中发生。美国圣安德烈亚斯断层是经典代表。'
  },
  drive: {
    name: '板块驱动力',
    stats: [['来源', '地幔对流'], ['机制', '热升冷降牵动板块'], ['速率', '每年数厘米']],
    desc: '地幔受热不均产生对流：高温物质上升、冷却物质下沉，像传送带一样牵动上方板块缓慢移动，速率约每年几厘米。'
  }
};

/* ---- 岩石循环数据 ---- */
var rockData = {
  igneous: {
    name: '岩浆岩（火成岩）',
    stats: [['形成', '岩浆冷却凝固'], ['分类', '侵入岩 / 喷出岩'], ['代表', '花岗岩、玄武岩']],
    desc: '岩浆在地下缓慢冷却形成侵入岩（如花岗岩，晶体粗大），喷溢出地表快速冷却则形成喷出岩（如玄武岩，细粒或具气孔）。'
  },
  sedimentary: {
    name: '沉积岩',
    stats: [['形成', '风化—沉积—固结'], ['分类', '碎屑 / 化学 / 生物'], ['代表', '砂岩、石灰岩']],
    desc: '先成岩石经风化破碎，被水、风等搬运沉积，再压实固结成岩。层理是沉积岩的典型特征，常含化石。'
  },
  metamorphic: {
    name: '变质岩',
    stats: [['形成', '高温高压变质'], ['分类', '区域 / 接触变质'], ['代表', '大理岩、片麻岩']],
    desc: '已有岩石在地壳深处经受高温高压，矿物重结晶或定向排列而形成，如石灰岩变大理岩、页岩变板岩。'
  },
  cycle: {
    name: '岩石循环',
    stats: [['内动力', '岩浆、变质'], ['外动力', '风化、侵蚀、沉积'], ['本质', '物质不断转化']],
    desc: '三大岩类并非固定：岩浆冷凝成岩浆岩，经外动力改造成沉积岩，深埋变质成变质岩，最终可重熔再生为岩浆——周而复始。'
  }
};

/* ---- 地质年代数据 ---- */
var timeData = {
  hadean: {
    name: '冥古宙',
    stats: [['时间', '~46–40 亿年前'], ['地球状态', '炽热、多撞击'], ['生命', '尚无记录']],
    desc: '地球刚形成，表面熔融、陨石频繁撞击（后期重轰炸期），原生大气与海洋开始孕育，尚未留下生命痕迹。'
  },
  archean: {
    name: '太古宙',
    stats: [['时间', '~40–25 亿年前'], ['岩石', '最古老陆壳'], ['生命', '原核生物']],
    desc: '出现地球上最古老的岩石与稳定陆块，原始生命（原核生物）诞生，大气仍几乎无氧。'
  },
  proterozoic: {
    name: '元古宙',
    stats: [['时间', '~25–5.41 亿年前'], ['大事', '大气充氧'], ['生命', '真核生物']],
    desc: '蓝藻光合作用使大气逐渐充氧，真核生物出现，并经历"雪球地球"冰期与埃迪卡拉纪软躯体生物。'
  },
  phanerozoic: {
    name: '显生宙',
    stats: [['时间', '5.41 亿年前–今'], ['特征', '生命大繁荣'], ['分代', '古生/中生/新生']],
    desc: '显生宙意为"看得见生命的时代"：寒武纪生命大爆发、恐龙称霸的中生代，以及哺乳动物与人类崛起的新生代。'
  }
};


/* ================================================================ */
/*  案例标签页切换                                                    */
/* ================================================================ */
function initCaseTabs() {
  var btns = document.querySelectorAll('.case-btn');
  var panels = document.querySelectorAll('.case-panel');

  if (!btns.length || !panels.length) return;

  function activateTab(idx) {
    btns.forEach(function (b) { b.classList.remove('active'); });
    panels.forEach(function (p) { p.classList.remove('active'); });
    var btn = document.querySelector('.case-btn[data-case="' + idx + '"]');
    if (btn) { btn.classList.add('active'); btn.focus(); }
    var target = document.querySelector(
      '.case-panel[data-panel="' + idx + '"]'
    );
    if (target) target.classList.add('active');
  }

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateTab(btn.getAttribute('data-case'));
    });
    btn.addEventListener('keydown', function (e) {
      var idx = parseInt(btn.getAttribute('data-case'), 10);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activateTab(String((idx + 1) % btns.length));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activateTab(String((idx - 1 + btns.length) % btns.length));
      }
    });
  });
}

/* ================================================================ */
/*  科普问答 —— 增强反馈动画与色彩区分                                */
/* ================================================================ */
var quizQuestions = [
  {
    question: '《地震地质》期刊由哪个机构主管？',
    options: ['中国地震局', '中国科学院', '教育部', '科技部'],
    correct: 0,
    feedback:
      '《地震地质》由中国地震局主管，中国地震局地质研究所主办，创刊于 1979 年。'
  },
  {
    question: '地球最外层叫什么？',
    options: ['地幔', '地壳', '外核', '内核'],
    correct: 1,
    feedback:
      '地壳是地球最外层的固体岩石圈层，分为洋壳与陆壳，大陆地壳平均厚约 35 公里。'
  },
  {
    question: '哪种地震波传播最快？',
    options: ['S 波', 'P 波', '面波', '瑞利波'],
    correct: 1,
    feedback:
      'P 波（纵波）是传播最快的地震波，速度约 6 km/s，能在固体和液体中传播。'
  },
  {
    question: '哪种波不能穿过液态外核？',
    options: ['P 波', 'S 波', '面波', '所有都能'],
    correct: 1,
    feedback:
      'S 波（横波）无法穿过液态介质，因此不能穿透液态外核，这正是推断外核为液态的依据。'
  },
  {
    question: '岩层向上弯曲的褶皱叫什么？',
    options: ['向斜', '背斜', '单斜', '倒转褶皱'],
    correct: 1,
    feedback:
      '背斜是岩层向上弯曲、中间隆起的褶皱，核部由较老岩层组成，常是储油气构造。'
  },
  {
    question: 'InSAR 技术测量什么？',
    options: ['地震波速', '地表形变', '地磁场', '重力'],
    correct: 1,
    feedback:
      'InSAR（合成孔径雷达干涉测量）通过卫星雷达波的相位差，测量地表毫米级形变。'
  },
  {
    question: '2008 汶川地震震级约为多少？',
    options: ['M7.0', 'M7.5', 'M8.0', 'M8.5'],
    correct: 2,
    feedback:
      '2008 年 5 月 12 日汶川地震矩震级约 M8.0，是新中国成立以来破坏性最强的地震之一。'
  },
  {
    question: 'SCI 未收录是否表示期刊质量差？',
    options: ['是', '不是', '不一定', '以上都不对'],
    correct: 1,
    feedback:
      'SCI 收录与期刊质量无必然关联。《地震地质》被 EI、CSCD 等重要数据库收录，是高质量的 T1 级期刊。'
  },
  {
    question: '喜马拉雅山脉主要由哪类板块边界形成？',
    options: ['离散边界', '汇聚碰撞边界', '转换边界', '离散 + 转换'],
    correct: 1,
    feedback:
      '印度板块与欧亚板块的汇聚碰撞使地壳缩短隆升，形成喜马拉雅山脉与青藏高原，属典型的汇聚碰撞边界。'
  },
  {
    question: '三大岩类中，由岩浆冷却凝固形成的是？',
    options: ['岩浆岩', '沉积岩', '变质岩', '都不是'],
    correct: 0,
    feedback:
      '岩浆岩（火成岩）由岩浆冷却凝固而成；沉积岩由风化产物沉积固结形成，变质岩由高温高压变质形成。'
  },
  {
    question: '沉积岩最典型的特征是？',
    options: ['气孔构造', '层理与化石', '片理构造', '块状无层理'],
    correct: 1,
    feedback:
      '沉积岩常具层理构造，并可能保存化石，是重建古环境的重要依据。'
  },
  {
    question: '关于震级与烈度，正确的是？',
    options: [
      '一次地震可有多个震级',
      '烈度随地而异、随距离衰减',
      '震级表示某地破坏程度',
      '二者完全相同'
    ],
    correct: 1,
    feedback:
      '震级表示一次地震释放的能量（只有一个），烈度表示某地破坏程度，随震中距增大而衰减，各地不同。'
  },
  {
    question: '震级每增大 1 级，释放能量约增大多少倍？',
    options: ['2 倍', '10 倍', '32 倍', '100 倍'],
    correct: 2,
    feedback:
      '震级每增大 1 级，能量约增 32 倍；M8.0 比 M6.0 释放的能量高约 1000 倍。'
  },
  {
    question: '地质年代中"显生宙"的主要特征是？',
    options: ['几乎没有生命', '生命大爆发与繁盛', '只有微生物', '全部为冰期'],
    correct: 1,
    feedback:
      '显生宙意为"看得见生命的时代"，以寒武纪生命大爆发为起点，生物快速多样化并繁盛至今。'
  },
  {
    question: '地震勘探主要利用岩石的什么差异来成像？',
    options: ['密度', '磁性', '电性', '波速'],
    correct: 3,
    feedback:
      '地震勘探用人工震源激发地震波，依据不同岩层的波速与反射/折射特征对地下结构成像，是油气勘探的主力手段。'
  },
  {
    question: '下列哪种属于外动力引发的地质灾害？',
    options: ['火山喷发', '地震', '滑坡、泥石流', '地幔对流'],
    correct: 2,
    feedback:
      '滑坡、泥石流多由强降雨或人类活动触发，属外动力地质灾害；火山喷发与地震以内动力为主。'
  },
  {
    question: '美国圣安德烈亚斯断层属于哪类板块边界？',
    options: ['离散边界', '汇聚边界', '转换（走滑）边界', '俯冲带'],
    correct: 2,
    feedback:
      '圣安德烈亚斯断层是太平洋板块与北美板块之间的转换边界，两盘水平错动，地震沿断层集中发生。'
  },
  {
    question: '给断层活动或沉积物定年，常用下列哪种方法？',
    options: ['¹⁴C 碳-14', '光释光 OSL', '宇宙成因核素', '以上都是'],
    correct: 3,
    feedback:
      '¹⁴C、光释光（OSL）、宇宙成因核素等都是《地震地质》中常用的测年手段，可回答"事件发生在多少年前"。'
  }
];

function initQuiz() {
  var quizArea = document.getElementById('quizArea');
  var quizResult = document.getElementById('quizResult');
  if (!quizArea || !quizResult) return;

  var scoreEl = quizResult.querySelector('.score');
  var finalMsgEl = quizResult.querySelector('p');
  var restartBtn = quizResult.querySelector('button');

  var progressWrap = document.querySelector('.quiz-progress');
  var progressBar = document.createElement('div');
  progressBar.className = 'quiz-progress-bar';
  progressWrap.appendChild(progressBar);

  var currentQuestion = 0;
  var score = 0;
  var answered = false;

  function updateProgress() {
    progressBar.style.width =
      (currentQuestion / quizQuestions.length) * 100 + '%';
  }

  function showQuestion() {
    answered = false;
    updateProgress();

    var q = quizQuestions[currentQuestion];

    // Build DOM nodes instead of innerHTML to prevent XSS
    var qDiv = document.createElement('div');
    qDiv.className = 'quiz-q';
    qDiv.textContent = q.question;

    var optsDiv = document.createElement('div');
    optsDiv.className = 'quiz-options';
    q.options.forEach(function (opt, i) {
      var optBtn = document.createElement('button');
      optBtn.type = 'button';
      optBtn.className = 'quiz-option';
      optBtn.setAttribute('data-idx', i);
      optBtn.textContent = opt;
      optsDiv.appendChild(optBtn);
    });

    var feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'quiz-feedback';

    var nextBtnEl = document.createElement('button');
    nextBtnEl.type = 'button';
    nextBtnEl.className = 'quiz-next';
    nextBtnEl.textContent = '下一题 →';

    quizArea.innerHTML = '';
    quizArea.appendChild(qDiv);
    quizArea.appendChild(optsDiv);
    quizArea.appendChild(feedbackDiv);
    quizArea.appendChild(nextBtnEl);

    var feedbackEl = quizArea.querySelector('.quiz-feedback');
    var nextBtn = quizArea.querySelector('.quiz-next');
    var optionBtns = quizArea.querySelectorAll('.quiz-option');

    optionBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;

        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        var isCorrect = idx === q.correct;

        // 标记选项
        if (isCorrect) {
          btn.classList.add('correct');
          score++;
        } else {
          btn.classList.add('wrong');
          var correctBtn = quizArea.querySelector(
            '.quiz-option[data-idx="' + q.correct + '"]'
          );
          if (correctBtn) correctBtn.classList.add('correct');
        }

        // 禁用所有选项
        optionBtns.forEach(function (b) {
          b.classList.add('disabled');
        });

        // 反馈文本 + 色彩区分（答错用暖色警示）
        feedbackEl.textContent = q.feedback;
        feedbackEl.classList.add('show');
        feedbackEl.classList.add(isCorrect ? 'right' : 'wrong');

        // 显示「下一题」按钮
        nextBtn.classList.add('show');

        // 进度条更新
        progressBar.style.width =
          ((currentQuestion + 1) / quizQuestions.length) * 100 + '%';
      });
    });

    nextBtn.addEventListener('click', nextQuestion);
  }

  function nextQuestion() {
    currentQuestion++;
    if (currentQuestion >= quizQuestions.length) {
      showResults();
    } else {
      showQuestion();
    }
  }

  function showResults() {
    quizArea.innerHTML = '';
    progressBar.style.width = '100%';

    var pct = Math.round((score / quizQuestions.length) * 100);
    scoreEl.textContent = score + ' / ' + quizQuestions.length;

    var msg;
    if (pct === 100) {
      msg = '满分！你是真正的地球科学达人。';
    } else if (pct >= 75) {
      msg = '优秀！你对地震地质知识掌握得很好。';
    } else if (pct >= 50) {
      msg = '不错，继续学习可以掌握得更扎实。';
    } else {
      msg = '别灰心，回顾前面的课程再来挑战吧。';
    }
    finalMsgEl.textContent = msg;

    quizResult.classList.add('show');
  }

  function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    quizResult.classList.remove('show');
    showQuestion();
  }

  restartBtn.addEventListener('click', restartQuiz);
  showQuestion();
}

/* ================================================================ */
/*  主题切换（浅色 ↔ 深色，2 档）                                    */
/* ================================================================ */
function initThemeToggle() {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;

  var order = ['light', 'dark'];
  var labels = { light: '☀', dark: '☾' };

  var saved = localStorage.getItem('sac-theme') || 'light';
  applyTheme(saved);

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    btn.textContent = labels[theme] || '☀';
    var themeNames = { light: '浅色', dark: '深色' };
    btn.setAttribute(
      'aria-label',
      '切换主题（当前：' + themeNames[theme] + '）'
    );
  }

  btn.addEventListener('click', function () {
    var current = document.documentElement.dataset.theme || 'light';
    var idx = order.indexOf(current);
    var next = order[(idx + 1) % order.length];
    applyTheme(next);
    localStorage.setItem('sac-theme', next);
  });
}

/* ================================================================ */
/*  阅读进度条                                                        */
/* ================================================================ */
function initReadingProgress() {
  var bar = document.getElementById('readingProgress');
  if (!bar) return;

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    bar.style.width =
      scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 + '%' : '0%';
  }

  var debouncedUpdate = debounce(updateProgress, 10);
  window.addEventListener('scroll', debouncedUpdate, { passive: true });
  window.addEventListener('resize', debouncedUpdate, { passive: true });
  updateProgress();
}

/* ================================================================ */
/*  返回顶部按钮                                                      */
/* ================================================================ */
function initBackToTop() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggleVisibility() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }

  var debouncedToggle = debounce(toggleVisibility, 10);

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', debouncedToggle, { passive: true });
  toggleVisibility();
}

/* ================================================================ */
/*  导航：移动端菜单开关 + 二级子菜单展开                              */
/* ================================================================ */
function initNav() {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');

  if (!toggle || !nav) return;

  var subToggles = nav.querySelectorAll('.nav-toggle');

  function openMenu() {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('active');
  }

  function closeMenu() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('active');
    // 关闭整个菜单时一并收起已展开的子菜单
    nav.querySelectorAll('.nav-item.has-sub.open').forEach(function (item) {
      item.classList.remove('open');
      var t = item.querySelector('.nav-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'primary-nav');

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    nav.classList.contains('open') ? closeMenu() : openMenu();
  });

  // 二级菜单按钮：点击展开/收起，桌面与移动通用（移动端为手风琴）
  subToggles.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var item = btn.closest('.nav-item.has-sub');
      if (!item) return;
      var isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // 点击任意叶子链接后关闭整个菜单
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) closeMenu();
  });
}
