// -- Switch to static
const animatedNavItem = document.querySelector('.nav-item[data-nav="Animated"]');
if (animatedNavItem) {
  animatedNavItem.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

// -- SIDEBAR NAV
document.querySelectorAll('.nav-item[data-nav]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
  });
});

// -- STAT CARDS
document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('click', () => {
    const wasSelected = card.classList.contains('selected');
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('selected'));
    if (!wasSelected) card.classList.add('selected');
  });
});

// -- SEARCH
document.getElementById('searchInput').addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  document.querySelectorAll('.tx-row').forEach(row => {
    const id = row.dataset.id;
    const text = (row.dataset.cat + ' ' + row.dataset.desc).toLowerCase();
    const visible = !q || text.includes(q);
    row.classList.toggle('hidden', !visible);
    const detailRow = row.nextElementSibling;
    if (detailRow && detailRow.classList.contains('tx-detail-row')) {
      detailRow.classList.toggle('hidden', !visible);
      if (!visible) {
        const inner = document.getElementById('inner-' + id);
        if (inner) inner.classList.remove('open');
      }
    }
  });
});

// -- TRANSACTION ROW EXPAND
document.querySelectorAll('.tx-row').forEach(row => {
  row.addEventListener('click', () => {
    const id = row.dataset.id;
    const inner = document.getElementById('inner-' + id);
    if (!inner) return;
    const isOpen = inner.classList.contains('open');
    document.querySelectorAll('.tx-detail-inner').forEach(el => el.classList.remove('open'));
    if (!isOpen) inner.classList.add('open');
  });
});

// -- SCHEDULE TRANSFER
const addBtn    = document.getElementById('addTransferBtn');
const form      = document.getElementById('transferForm');
const cancelBtn = document.getElementById('tf-cancel');
const saveBtn   = document.getElementById('tf-save');

addBtn.addEventListener('click', () => {
  form.classList.toggle('open');
});

cancelBtn.addEventListener('click', () => {
  form.classList.remove('open');
  document.getElementById('tf-name').value   = '';
  document.getElementById('tf-amount').value = '';
  document.getElementById('tf-due').value    = '';
  document.getElementById('tf-recur').value  = '';
});

saveBtn.addEventListener('click', () => {
  const name   = document.getElementById('tf-name').value.trim();
  const amount = document.getElementById('tf-amount').value.trim();
  const due    = document.getElementById('tf-due').value;
  document.getElementById('tf-name').style.borderColor   = name   ? '' : '#ef4444';
  document.getElementById('tf-amount').style.borderColor = amount ? '' : '#ef4444';
  if (!name || !amount) return;
  const item = document.createElement('div');
  item.className = 'payment-item new-item';
  item.innerHTML = `
    <div class="left">
      <div class="pay-icon" style="background:var(--gray-light);font-size:15px;">📅</div>
      <div class="pay-info">
        <div class="name">${name}</div>
        <div class="due">${due || 'Upcoming'}</div>
      </div>
    </div>
    <div class="pay-amount">€ ${parseFloat(amount).toFixed(2)}</div>`;
  addBtn.parentElement.insertBefore(item, addBtn);
  cancelBtn.click();
});

// -- BREAKDOWN BAR
const bar = document.querySelector('.breakdown-bar');
if (bar) {
  const segments = [
    { color:'#f97316', pct:37 }, { color:'#eab308', pct:11 }, { color:'#f59e0b', pct:9  },
    { color:'#22c55e', pct:7  }, { color:'#0dbfad', pct:23 }, { color:'#3b82f6', pct:6  },
    { color:'#94a3b8', pct:7  },
  ];
  bar.style.cssText = 'background:none;display:flex;overflow:hidden;height:8px;border-radius:4px;';
  bar.innerHTML = segments.map((s, i) =>
    `<div data-seg="${i}" style="flex:0 0 ${s.pct}%;height:100%;background:${s.color};cursor:pointer;transition:opacity 0.2s ease;" title="${s.pct}%"></div>`
  ).join('');

  const items = document.querySelectorAll('.breakdown-item');

  function dimAll()  { bar.querySelectorAll('[data-seg]').forEach(s => s.style.opacity = '0.3'); }
  function resetAll(){ bar.querySelectorAll('[data-seg]').forEach(s => s.style.opacity = '1'); }

  bar.querySelectorAll('[data-seg]').forEach((seg, i) => {
    seg.addEventListener('mouseenter', () => { dimAll(); seg.style.opacity = '1'; if (items[i]) items[i].classList.add('highlight'); });
    seg.addEventListener('mouseleave', () => { resetAll(); if (items[i]) items[i].classList.remove('highlight'); });
  });
  items.forEach((item, i) => {
    const seg = bar.querySelector(`[data-seg="${i}"]`);
    item.addEventListener('mouseenter', () => { if (seg) { dimAll(); seg.style.opacity = '1'; } });
    item.addEventListener('mouseleave', () => { resetAll(); });
  });
}

// -- LINE CHART + PERIOD TOGGLE
const lineCtx = document.getElementById('lineChart').getContext('2d');
const gradient = lineCtx.createLinearGradient(0, 0, 0, 160);
gradient.addColorStop(0, 'rgba(31,44,115,0.13)');
gradient.addColorStop(1, 'rgba(255,255,255,0.01)');

const periods = {
  monthly: {
    labels: ['1 Apr','','','','','6 Apr','','','','','11 Apr','','','','','16 Apr','','','','','21 Apr','','23 Apr','','','26 Apr','','','','30 Apr'],
    data:   [30,35,45,60,72,90,110,130,155,175,210,270,340,370,440,490,550,570,590,610,630,650,700,null,null,null,null,null,null,null],
    dotIdx: 22
  }
};

function makePts(data, dotIdx) {
  return {
    radii:  data.map((v, i) => (i === dotIdx && v !== null ? 5 : 0)),
    colors: data.map((v, i) => (i === dotIdx && v !== null ? '#1F2C73' : 'transparent')),
  };
}

let activePeriod = 'monthly';
const p0   = periods['monthly'];
const pts0 = makePts(p0.data, p0.dotIdx);

const lineChart = new Chart(lineCtx, {
  type: 'line',
  data: {
    labels: p0.labels,
    datasets: [{
      data: p0.data,
      borderColor: '#1F2C73', borderWidth: 2,
      fill: true, backgroundColor: gradient, tension: 0.15,
      pointBackgroundColor: pts0.colors, pointBorderColor: pts0.colors,
      pointRadius: pts0.radii, pointHoverRadius: pts0.radii.map(r => r ? r+2 : 0),
      spanGaps: false
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false, filter: item => item.raw !== null }
    },
    scales: {
      x: {
        grid: { display: false }, border: { display: false },
        ticks: { font: { size:11 }, color:'#94a3b8', maxRotation:0, autoSkip:false,
          callback: function(val, i) { return this.chart.data.labels[i]; }
        }
      },
      y: { display: false, min: 0, grace: '10%' }
    },
    animation: false
  }
});

document.querySelectorAll('.chart-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    const period = btn.dataset.period;
    if (period === activePeriod) return;
    activePeriod = period;
    document.querySelectorAll('.chart-toggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const p   = periods[period];
    const pts = makePts(p.data, p.dotIdx);
    lineChart.data.labels = p.labels;
    lineChart.data.datasets[0].data                 = p.data;
    lineChart.data.datasets[0].pointBackgroundColor = pts.colors;
    lineChart.data.datasets[0].pointBorderColor     = pts.colors;
    lineChart.data.datasets[0].pointRadius          = pts.radii;
    lineChart.data.datasets[0].pointHoverRadius     = pts.radii.map(r => r ? r+2 : 0);
    lineChart.update('none');
  });
});

// -- BAR CHART
const barCtx = document.getElementById('barChart').getContext('2d');
new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'],
    datasets: [
      { label:'Income',   data:[5,6,5.2,5.5,3,6.2,5,4.2,8,3],   backgroundColor:'#2d4cc8', borderRadius:4, barPercentage:0.55 },
      { label:'Expenses', data:[3.8,4.2,3,4,2,4.8,3.5,3,7,1.2], backgroundColor:'#c7d0f0', borderRadius:4, barPercentage:0.55 }
    ]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode:'index', intersect:false } },
    scales: {
      x: { grid: { display:false }, ticks: { font:{size:11}, color:'#94a3b8' } },
      y: { grid: { color:'#f1f5f9' }, ticks: { font:{size:11}, color:'#94a3b8', stepSize:2 }, min:0, max:9 }
    },
    animation: { duration: 900, easing: 'easeOutQuart' }
  }
});
