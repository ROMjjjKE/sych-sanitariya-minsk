document.documentElement.classList.add('js');

/* ---------- меню ---------- */
(function () {
  var b = document.querySelector('.burger');
  var n = document.querySelector('.nav');
  if (!b || !n) return;
  b.addEventListener('click', function () {
    var open = n.classList.toggle('open');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

/* ---------- появление блоков: наблюдатель + страховка ---------- */
(function () {
  var nodes = [].slice.call(document.querySelectorAll('.fx'));
  if (!nodes.length) return;
  var show = function (el) { el.classList.add('in'); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
    /* страховка: через 2,5 с показываем всё, что выше двух экранов */
    setTimeout(function () {
      nodes.forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top < window.innerHeight * 2) show(n);
      });
    }, 2500);
    setTimeout(function () { nodes.forEach(show); }, 6000);
  } else {
    nodes.forEach(show);
  }
})();

/* ---------- карта обработки кабинки ---------- */
(function () {
  var root = document.getElementById('cabinMap');
  if (!root) return;

  var ZONES = {
    floor: {
      t: 'Пол и трап',
      w: 'Механическая мойка под давлением, дезинфицирующее средство, пролив трапа и проверка уклона.',
      m: '12 минут',
      why: 'Именно пол держит основной запах: если трап не промыть, через час кабина пахнет снова.'
    },
    walls: {
      t: 'Стены и панели',
      w: 'Двухступенчатая обработка: щелочной состав снимает налёт, затем кислотный убирает мочевой камень.',
      m: '15 минут',
      why: 'Одним средством налёт не снять: щёлочь не берёт соли, кислота не берёт жир. Нужны оба прохода.'
    },
    door: {
      t: 'Дверь, ручка, замок',
      w: 'Протирка двери изнутри и снаружи, обработка ручки и защёлки антисептиком, смазка механизма.',
      m: '5 минут',
      why: 'Ручка — самая частая точка контакта. Её обрабатывают последней, чтобы не занести грязь обратно.'
    },
    seat: {
      t: 'Сиденье и бачок',
      w: 'Дезинфекция сиденья и крышки, промывка бачка, проверка смыва, пополнение бумаги.',
      m: '8 минут',
      why: 'После дезинфекции сиденье должно высохнуть, а не остаться мокрым: иначе средство не работает.'
    },
    air: {
      t: 'Воздух и вентиляция',
      w: 'Обработка внутреннего объёма, проверка вентиляционных щелей, нейтрализатор запаха без отдушки.',
      m: '4 минуты',
      why: 'Отдушка маскирует запах на час. Нейтрализатор убирает причину, поэтому кабина остаётся свежей дольше.'
    }
  };
  var ORDER = ['floor', 'walls', 'door', 'seat', 'air'];
  var seen = {};
  var info = document.getElementById('zoneInfo');
  var counter = document.getElementById('zoneCounter');
  var listBox = document.getElementById('zoneList');

  var paint = function (key) {
    [].slice.call(root.querySelectorAll('.zone')).forEach(function (z) {
      z.classList.toggle('on', z.getAttribute('data-zone') === key);
      z.setAttribute('aria-pressed', z.getAttribute('data-zone') === key ? 'true' : 'false');
    });
    [].slice.call(listBox.querySelectorAll('button')).forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-zone') === key);
    });
  };

  var render = function (key) {
    var z = ZONES[key];
    if (!z) return;
    paint(key);
    seen[key] = true;
    info.innerHTML =
      '<h3>' + z.t + '</h3>' +
      '<p>' + z.w + '</p>' +
      '<p class="why">' + z.why + '</p>' +
      '<p class="hint" style="margin-top:10px">Время на зону: ' + z.m + '</p>';
    var done = Object.keys(seen).length;
    counter.innerHTML = '<b>' + done + '</b><span>из ' + ORDER.length + ' зон разобрали</span>';
    if (done === ORDER.length) {
      counter.innerHTML = '<b>' + done + '</b><span>из ' + ORDER.length + ' зон — полный регламент выезда</span>';
    }
  };

  [].slice.call(root.querySelectorAll('.zone')).forEach(function (z) {
    var key = z.getAttribute('data-zone');
    z.addEventListener('click', function () { render(key); });
    z.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); render(key); }
    });
  });

  ORDER.forEach(function (k) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = ZONES[k].t;
    b.setAttribute('data-zone', k);
    b.addEventListener('click', function () { render(k); });
    listBox.appendChild(b);
  });

  render('floor');
})();

/* ---------- режимы обслуживания ---------- */
(function () {
  var box = document.getElementById('modeBox');
  if (!box) return;
  var DATA = {
    site: {
      t: 'Стройплощадка',
      rows: [
        ['Что важно', 'Кабины стоят месяцами, нагрузка ровная, но высокая: бригада ходит постоянно.'],
        ['Как часто', 'Регулярный выезд по графику, согласованному с прорабом.'],
        ['Что входит', 'Мойка всех зон, дезинфекция, расходники, устранение запаха.'],
        ['Как проверяем', 'Отметка в журнале объекта после каждого выезда.']
      ]
    },
    event: {
      t: 'Мероприятие',
      rows: [
        ['Что важно', 'Пиковая нагрузка за пару часов и много людей, которые видят кабину впервые.'],
        ['Как часто', 'Выезд до начала и обслуживание в течение дня, если поток большой.'],
        ['Что входит', 'Полная мойка перед стартом, дезинфекция, пополнение расходников, контроль в течение дня.'],
        ['Как проверяем', 'Осмотр до открытия и повторный — по ходу мероприятия.']
      ]
    },
    park: {
      t: 'Парк, рынок, стоянка',
      rows: [
        ['Что важно', 'Кабина на виду у горожан весь день, а нагрузка зависит от погоды и сезона.'],
        ['Как часто', 'Регулярные выезды, летом чаще: жара ускоряет появление запаха.'],
        ['Что входит', 'Мойка, дезинфекция, нейтрализация запаха, уборка вокруг кабины.'],
        ['Как проверяем', 'Чек-лист по зонам и фотофиксация до и после по запросу.']
      ]
    },
    plant: {
      t: 'Производство, склад',
      rows: [
        ['Что важно', 'Санитарные требования и возможные проверки, поэтому нужна дисциплина и следы работы.'],
        ['Как часто', 'По согласованному графику, с журналом выездов.'],
        ['Что входит', 'Полный регламент по зонам, дезинфекция, расходники, отметки о выезде.'],
        ['Как проверяем', 'Журнал и акт осмотра по запросу ответственного.']
      ]
    }
  };
  var buttons = [].slice.call(document.querySelectorAll('[data-mode]'));
  var paint = function (key) {
    buttons.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-mode') === key ? 'true' : 'false'); });
    var d = DATA[key];
    box.innerHTML = '<h3 style="margin-bottom:14px">' + d.t + '</h3><dl>' +
      d.rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
  };
  buttons.forEach(function (b) { b.addEventListener('click', function () { paint(b.getAttribute('data-mode')); }); });
  paint('site');
})();

/* ---------- форма заявки: собираем текст и копируем ---------- */
(function () {
  var f = document.getElementById('reqForm');
  if (!f) return;
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = 'Заявка скопирована — вставьте её в сообщение на Kufar';
  document.body.appendChild(toast);

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var g = function (n) { return f.elements[n]; };
    var bad = false;
    ['obj', 'qty', 'when'].forEach(function (n) {
      var el = g(n);
      var empty = !el.value.trim();
      el.classList.toggle('bad', empty);
      bad = bad || empty;
    });
    if (bad) return;
    var text = 'Заявка: обслуживание туалетных кабинок\n' +
      'Объект: ' + g('obj').value + '\n' +
      'Кабин: ' + g('qty').value + '\n' +
      'Когда нужно: ' + g('when').value + '\n' +
      (g('note').value ? 'Комментарий: ' + g('note').value + '\n' : '') +
      'Район: ' + (g('dist').value || 'Минск');
    var done = function () {
      toast.classList.add('on');
      setTimeout(function () { toast.classList.remove('on'); }, 3200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(ta); done();
    }
  });
})();

/* ---------- год в футере ---------- */
(function () {
  var y = document.getElementById('yr');
  if (y) y.textContent = String(new Date().getFullYear());
})();
