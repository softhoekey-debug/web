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
  initWaveDemo();
  initCaseTabs();
  initQuiz();
  initThemeToggle();
  initReadingProgress();
  initBackToTop();
  initMobileMenu();
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
  function animateDrawing() {
    offset += config.wobbleSpeed; // Continuous oscillation along baseline
    line.setAttribute('points', generatePoints(offset));
  }

  // classic drawing speed — faster for chaotic bursts
  setInterval(animateDrawing, 30);
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
/*  地震波 Canvas 动画 —— HiDPI 修复 + 发光特效                      */
/* ================================================================ */
function initWaveDemo() {
  var canvas = document.getElementById('waveCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.parentElement.insertBefore(
      (function () {
        var msg = document.createElement('p');
        msg.style.cssText =
          'color:var(--muted);font-size:14px;text-align:center;padding:var(--space-lg)';
        msg.textContent = '您的浏览器不支持 Canvas，无法显示波形动画。';
        return msg;
      })(),
      canvas
    );
    canvas.style.display = 'none';
    return;
  }

  // ---------------------------------------------------------------
  //  HiDPI / Retina 适配：逻辑尺寸与物理像素分离
  // ---------------------------------------------------------------
  var dpr = window.devicePixelRatio || 1;
  var displayWidth = 800;
  var displayHeight = 200;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = '100%';
  canvas.style.height = displayHeight + 'px';
  ctx.scale(dpr, dpr);

  var time = 0;
  var activeWave = null;

  // 实时读取 CSS 变量，保障深色/浅色模式同步
  function getCssVar(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  // 波形位移函数（P波 / S波 / 面波）
  var waves = {
    p: function (x) {
      return Math.sin(x * 0.12 - time * 0.25) * 12;
    },
    s: function (x) {
      return Math.sin(x * 0.06 - time * 0.15) * 25;
    },
    surface: function (x) {
      return (
        Math.sin(x * 0.04 - time * 0.08) * 35 +
        Math.sin(x * 0.02 - time * 0.05) * 10
      );
    }
  };

  function draw() {
    var accentColor = getCssVar('--accent');

    // ---- 使用 clearRect 彻底清空全量画布，而非前景色覆盖 ----
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // 背景
    var fgColor = getCssVar('--fg');
    ctx.fillStyle = fgColor;
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // 震源点
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(50, 100, 4, 0, Math.PI * 2);
    ctx.fill();

    // ---- 波形绘制 + 微光晕效果 ----
    if (activeWave && waves[activeWave]) {
      ctx.beginPath();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 仅绘制时开启发光，用后立即重置
      ctx.shadowBlur = 4;
      ctx.shadowColor = accentColor;

      for (var x = 50; x <= 750; x++) {
        var y = 100 + waves[activeWave](x - 50);
        if (x === 50) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 重置阴影
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    time += 1;
    requestAnimationFrame(draw);
  }

  // 按钮事件
  var btns = document.querySelectorAll('.wave-btn');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wave = btn.getAttribute('data-wave');
      if (wave === 'stop') {
        activeWave = null;
        btns.forEach(function (b) {
          b.classList.remove('active');
        });
      } else {
        activeWave = wave;
        btns.forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
      }
    });
  });

  draw();
}

/* ================================================================ */
/*  案例标签页切换                                                    */
/* ================================================================ */
function initCaseTabs() {
  var btns = document.querySelectorAll('.case-btn');
  var panels = document.querySelectorAll('.case-panel');

  if (!btns.length || !panels.length) return;

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var idx = btn.getAttribute('data-case');
      btns.forEach(function (b) { b.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var target = document.querySelector(
        '.case-panel[data-panel="' + idx + '"]'
      );
      if (target) target.classList.add('active');
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
    var html = '<div class="quiz-q">' + q.question + '</div>';
    html += '<div class="quiz-options">';
    q.options.forEach(function (opt, i) {
      html +=
        '<button type="button" class="quiz-option" data-idx="' +
        i +
        '">' +
        opt +
        '</button>';
    });
    html += '</div>';
    html += '<div class="quiz-feedback"></div>';
    html += '<button type="button" class="quiz-next">下一题 →</button>';

    quizArea.innerHTML = html;

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
/*  移动端菜单开关                                                    */
/* ================================================================ */
function initMobileMenu() {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');

  if (!toggle || !nav) return;

  function openMenu() {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('active');
  }

  function closeMenu() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('active');
  }

  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'primary-nav');

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    nav.classList.contains('open') ? closeMenu() : openMenu();
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
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
