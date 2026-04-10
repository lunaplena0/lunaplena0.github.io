 const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfTHMy1hImniay9QEPDcMq5C4Yo5yFpmRtBlWo6UXK-FNxABQYbtfGpEsKom2O-OIJPnEi8LLy1Qqx/pub?gid=0&single=true&output=tsv";
    let allVods = [];
    let currentMainTag = null;
    let currentAnalysisTag = null;
    const catColors = { 
    '게임': '#70a1ff', '노래': '#ff7eb9', '소통': '#2ed573', 
    'ASMR': '#cd84f1', '풀트': '#ffbe76', '시네티': '#00d8ff', 
    '대회': '#ff4757', '합방': '#fffa65', '기타': '#d2dae2',
    '구독+': '#e6e02e', // 추가
    '19': '#ff4757'     // 추가
};

    function getColor(name) { for (let key in catColors) { if (name.includes(key)) return catColors[key]; } return catColors['기타']; }
    function timeToSeconds(t) { if (!t || t === '-' || t === '0') return 0; const p = t.split(':').map(Number); if(p.length === 2) return (p[0] * 60) + p[1]; return (p[0] * 3600) + (p[1] * 60) + (p[2] || 0); }
    function secondsToTime(s) { const absS = Math.abs(s); const h = Math.floor(absS / 3600); const m = Math.floor((absS % 3600) / 60); const sec = absS % 60; return `${s < 0 ? '-' : ''}${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; }

    window.onload = () => {
        const overlay = document.getElementById('loading-overlay');
        fetch(sheetUrl + `&t=${new Date().getTime()}`)
            .then(res => res.text())
            .then(tsv => {
                const lines = tsv.split(/\r?\n/).filter(l => l.trim() !== "");
                allVods = [];
                for (let i = 1; i < lines.length; i++) {
                    const p = lines[i].split('\t').map(v => v.trim());
                    if (!p[0]) continue;
                   allVods.push({
                   id: i - 1, date: p[0], title: p[1], link: p[2], thumb: p[3], totalTime: p[4],
                   isPlus: p[5] === '예' || p[5] === 'O', 
                   isAdult: p[6] === '예' || p[6] === 'O', // 이 부분이 추가되어야 함
                   gData: p[7], sData: p[8], tData: p[9], cData: p[10], category: p[11] || "기타"
                   });
                }
                allVods.sort((a, b) => new Date(b.date) - new Date(a.date));
                renderList(allVods); calculateAllStats(allVods); renderTagButtons();
                document.getElementById('update-time').textContent = `최근 업데이트: ${new Date().toLocaleTimeString()}`;
                setTimeout(() => { overlay.style.opacity = '0'; setTimeout(()=>overlay.style.display='none', 500); document.body.classList.remove('loading'); }, 800);
            });
    };

    function renderList(data) {
        const container = document.getElementById('vod-content');
        container.innerHTML = '';
        const groups = {};
        data.forEach(v => { if (!groups[v.date]) groups[v.date] = []; groups[v.date].push(v); });
        Object.keys(groups).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            const groupDiv = document.createElement('div');
            groupDiv.innerHTML = `<div class="date-header">${date}</div><div class="vod-list"></div>`;
            groups[date].forEach(v => {
                const item = document.createElement('div'); item.className = 'vod-item'; item.onclick = () => openModalById(v.id);
                const plusTag = v.isPlus ? `<span class="tag-common tag-plus" style="height:18px; font-size:9px; margin-left:5px;">구독+</span>` : '';
                const adultTag = v.isAdult ? `<span class="tag-common" style="height:18px; font-size:9px; margin-left:5px; background:#121f33; color:#ff4757; border:1px solid #ff4757;">19</span>` : '';
                item.innerHTML = `
    <div class="vod-thumb">
        <img src="${v.thumb}" loading="lazy">
        <span class="duration">${v.totalTime}</span>
    </div>
    <div class="vod-info" style="display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 8px;">
        <div class="vod-title" style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span class="title-text" style="font-weight: bold; font-size: 15px; color: #fff;">${v.title}</span>
            <div class="badge-group" style="display: flex; gap: 4px; align-items: center;">
                ${plusTag}${adultTag}
            </div>
        </div>
        <div class="vod-tags" style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${v.category.split(/[,/ ]+/).filter(c => c.trim()).map(c => 
                `<span style="font-size: 10px; color: ${getColor(c)}; border: 1px solid ${getColor(c)}60; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.2);">
                    ${c}
                </span>`
            ).join('')}
        </div>
    </div>`;
                    <div style="display:flex; flex-wrap:wrap; gap:4px;">${v.category.split(/[,/ ]+/).filter(c => c.trim()).map(c => `<span style="font-size:10px; color:${getColor(c)}; border:1px solid ${getColor(c)}60; padding:1px 5px; border-radius:4px;">${c}</span>`).join('')}</div></div>`;
                groupDiv.querySelector('.vod-list').appendChild(item);
            });
            container.appendChild(groupDiv);
        });
    }

    function renderTagButtons() {
    const container = document.getElementById('tag-filter-container');
    // 기존 태그 추출
    const tags = [...new Set(allVods.flatMap(v => v.category.split(/[,/ ]+/).filter(c => c.trim())))].sort();
    
    // [수정] 구독+와 19를 태그 목록 맨 앞에 추가
    const allUniqueTags = ['구독+', '19', ...tags];

    let html = `<div style="width:100%; font-size:11px; color:var(--text-sub); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;"><span>🏷️ 태그 필터</span><span id="filter-status" style="font-size:10px; color:var(--accent);">전체보기 중</span></div>`;
    html += `<button id="btn-all" onclick="toggleMainTagFilter(null)" class="filter-btn active" style="border:1px solid #5c7285; color:#fff;">✨ 전체보기</button>`;
    html += allUniqueTags.map(tag => `<button id="btn-${tag}" onclick="toggleMainTagFilter('${tag}')" class="filter-btn" style="border:1px solid ${getColor(tag)}; color:${getColor(tag)};">${tag}</button>`).join('');
    container.innerHTML = html;
}

    function toggleMainTagFilter(tag) {
    currentMainTag = tag;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tag === null) {
        document.getElementById('btn-all').classList.add('active');
        document.getElementById('filter-status').textContent = "전체보기 중";
        renderList(allVods);
    } else {
        const targetBtn = document.getElementById(`btn-${tag}`);
        if(targetBtn) targetBtn.classList.add('active');
        document.getElementById('filter-status').textContent = `[${tag}] 필터링 중`;

        // [수정] 일반 태그 검색 + 구독/성인 여부 체크
        const filtered = allVods.filter(v => {
            if (tag === '구독+') return v.isPlus;
            if (tag === '19') return v.isAdult;
            return v.category.includes(tag);
        });
        renderList(filtered);
    }
}

    function calculateAllStats(data) {
    let totalSec = 0, plusSec = 0, maxSec = 0, catMap = {};
    data.forEach(v => {
        const s = timeToSeconds(v.totalTime);
        if (s > 0) { totalSec += s; if (v.isPlus) plusSec += s; maxSec = Math.max(maxSec, s); }
        
        // 기존 카테고리 집계
        v.category.split(/[,/ ]+/).filter(c => c.trim()).forEach(c => { catMap[c] = (catMap[c] || 0) + 1; });
        
        // [추가] 구독+ 및 19 집계
        if (v.isPlus) catMap['구독+'] = (catMap['구독+'] || 0) + 1;
        if (v.isAdult) catMap['19'] = (catMap['19'] || 0) + 1;
    });
        document.getElementById('total-hour').textContent = `${Math.floor(totalSec / 3600)}시간 ${Math.floor((totalSec % 3600) / 60)}분`;
        document.getElementById('plus-hour').textContent = `${Math.floor(plusSec / 3600)}시간 ${Math.floor((plusSec % 3600) / 60)}분`;
        document.getElementById('plus-ratio').textContent = `(${(totalSec > 0 ? (plusSec / totalSec * 100) : 0).toFixed(1)}%)`;
        document.getElementById('max-time').textContent = secondsToTime(maxSec);
        document.getElementById('avg-time').textContent = secondsToTime(Math.floor(totalSec / (data.length || 1)));
        const sorted = Object.entries(catMap).sort((a,b) => b[1]-a[1]);
        const totalC = Object.values(catMap).reduce((a,b)=>a+b, 0);
    
    if(totalC > 0) {
        let curr = 0;
        const grad = sorted.map(([n, c]) => { 
            const s = curr; 
            curr += (c/totalC*100); 
            return `${getColor(n)} ${s}% ${curr}%`; 
        });
        document.getElementById('category-chart').style.background = `conic-gradient(${grad.join(', ')})`;
        document.getElementById('legend').innerHTML = sorted.map(([n, c]) => 
            `<div class="legend-item"><span class="dot" style="background:${getColor(n)}"></span>${n} ${Math.round(c/totalC*100)}%</div>`
        ).join('');
    }
}

    function openModalById(id) {
        const v = allVods.find(item => String(item.id) === String(id));
        if(!v) return;

        // 썸네일 및 제목
        document.getElementById('m-thumb').src = v.thumb;
        document.getElementById('m-title').textContent = v.title;

        // [최적화] 방송 정보 구역 채우기 (m-date)
        // 날짜와 시간을 분리하여 가독성을 높였습니다.
        document.getElementById('m-date').innerHTML = `
            <div style="font-size: 15px; font-weight: bold; color: var(--text-main); margin-bottom: 4px;">${v.date}</div>
            <div style="font-size: 13px; color: var(--text-sub);">
                총 방송 시간: <span style="color: var(--accent); font-weight: bold;">${v.totalTime}</span>
            </div>
        `;

        document.getElementById('m-link').href = v.link;

        // openModalById 내부의 배지 영역 (간격 조절 버전)
let badgeHtml = '';
if (v.isPlus) {
    badgeHtml += `<span class="tag-common tag-plus" style="padding: 2px 8px; height: auto; font-size: 11px; margin-top:8px; margin-right:2px;">구독플러스 전용</span>`;
}
if (v.isAdult) {
    badgeHtml += `<span class="tag-common" style="padding: 2px 8px; height: auto; font-size: 11px; margin-top:8px; background:#121f33; color:#ff4757; border:1px solid #ff4757;">19</span>`;
}
document.getElementById('m-plus').innerHTML = badgeHtml;

        // 섹션별 데이터 (게임, 노래, 소통) 출력 로직
        const setSec = (id, rowId, data) => {
            const row = document.getElementById(rowId);
            const box = document.getElementById(id);
            if (data && data !== '-' && data.trim() !== "") {
                row.style.display = 'block';
                // 데이터 내 불필요한 공백을 제거하고 리스트화
                box.innerHTML = data.split('\n')
                    .map(l => l.trim())
                    .filter(l => l !== "")
                    .map(l => `<div style="font-size:13px; margin-bottom:6px; color:var(--text-main); opacity:0.9; line-height:1.4;">• ${l}</div>`)
                    .join('');
            } else {
                row.style.display = 'none';
            }
        };

        setSec('m-game', 'row-game', v.gData);
        setSec('m-song', 'row-song', v.sData);
        setSec('m-talk', 'row-talk', v.tData);

        // 모달 활성화 및 바디 스크롤 차단
        document.getElementById('modal-overlay').style.display = 'flex';
        document.body.classList.add('modal-open');
    }
    function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; document.body.classList.remove('modal-open'); }

    function openAnalysisModal() {
        document.getElementById('analysis-overlay').style.display = 'flex';
        currentAnalysisTag = null;
        const years = [...new Set(allVods.map(v => v.date.split('-')[0]))].sort().reverse();
        document.getElementById('analysis-year').innerHTML = years.map(y => `<option value="${y}">${y}년</option>`).join('');
        renderAnalysis();
    }
    function closeAnalysisModal() { document.getElementById('analysis-overlay').style.display = 'none'; }

    function renderAnalysis() {
        const targetYear = document.getElementById('analysis-year').value;
        const viewType = document.getElementById('analysis-type').value;
        const resultDiv = document.getElementById('analysis-result');
        const yearFiltered = allVods.filter(v => v.date.startsWith(targetYear));
        if (yearFiltered.length === 0) { resultDiv.innerHTML = "데이터가 없습니다."; return; }
        
        const stats = {};
        yearFiltered.forEach(v => {
            const key = viewType === 'month' ? v.date.substring(0, 7) : v.date.substring(0, 4);
            if (!stats[key]) { stats[key] = { time: 0, count: 0, cats: {}, subItems: { '게임': {}, '노래': {}, '콘텐츠': {} } }; }
            const sec = timeToSeconds(v.totalTime);
            stats[key].time += sec; stats[key].count++;
            // 기존 카테고리 집계
    v.category.split(/[,/ ]+/).forEach(c => { if(c.trim()) stats[key].cats[c] = (stats[key].cats[c] || 0) + 1; });

    // [추가] 리포트 상단 태그 목록에 구독+와 19 추가
    if (v.isPlus) stats[key].cats['구독+'] = (stats[key].cats['구독+'] || 0) + 1;
    if (v.isAdult) stats[key].cats['19'] = (stats[key].cats['19'] || 0) + 1;
         
            const collectSub = (data, type) => {
                if (data && data !== '-') {
                    data.split(/[\n,/]+/).forEach(item => {
                        let cleanItem = item.trim().replace(/\s*\([\d\s:~]+\)/g, "").trim();
                        if (cleanItem) stats[key].subItems[type][cleanItem] = (stats[key].subItems[type][cleanItem] || 0) + 1;
                    });
                }
            };
            collectSub(v.gData, '게임'); collectSub(v.sData, '노래'); collectSub(v.cData, '콘텐츠');
        });

        const availableKeys = Object.keys(stats).sort().reverse();
        if (viewType === 'month') {
            resultDiv.innerHTML = `<div style="margin-bottom:20px;"><select id="month-select" onchange="displaySelectedReport()" style="width:100%; background:#0a1a30; color:#fff; border:1px solid var(--border); border-radius:12px; padding:12px; font-size:14px; font-weight:bold; outline:none; cursor:pointer;">${availableKeys.map(k => `<option value="${k}">${k.split('-')[1]}월 상세 리포트 보기</option>`).join('')}</select></div><div id="report-container"></div>`;
            window.currentStats = stats;
            displaySelectedReport();
        } else { 
            // 연도별 보기일 때는 모든 리포트를 나열하고 리스트 로드
            resultDiv.innerHTML = availableKeys.map((key, i) => generateReportHtml(key, stats[key], availableKeys[i+1] ? stats[availableKeys[i+1]] : null)).join('');
            availableKeys.forEach(key => filterAnalysisSideList(key, null)); // 각 연도별 리스트 로드
        }
    }

    function generateReportHtml(key, s, prevS) {
        const sortedCats = Object.entries(s.cats).sort((a, b) => b[1] - a[1]);
        let timeDiff = prevS ? s.time - prevS.time : null;
        let avgTime = s.time / s.count;
        let prevAvgTime = prevS ? prevS.time / prevS.count : null;
        let avgDiff = prevAvgTime ? avgTime - prevAvgTime : null;

        const getDiffHtml = (diff) => {
            if (diff === null) return `<span class="diff-val diff-none">지난 기록 없음</span>`;
            const h = Math.floor(Math.abs(diff) / 3600);
            const m = Math.floor((Math.abs(diff) % 3600) / 60);
            const suffix = diff >= 0 ? "많아요" : "적어요";
            return `<span class="diff-val ${diff >= 0 ? 'diff-up' : 'diff-down'}">${diff >= 0 ? '▲ +' : '▼ -'}${h}시간 ${m}분 ${suffix}</span>`;
        };

        const renderSubList = (title, items, color) => {
            const sortedItems = Object.entries(items).sort((a, b) => b[1] - a[1]);
            if (sortedItems.length === 0) return "";
            return `<div style="margin-top:20px; width: 100%;"><div style="font-size:13px; color:${color}; font-weight:bold; margin-bottom:10px; display:flex; align-items:center; gap:6px;"><span style="width:4px; height:14px; background:${color}; border-radius:2px;"></span>${title} 기록</div><div style="display:grid; grid-template-columns: 1fr; gap:6px;">${sortedItems.map(([name, count]) => `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);"><span style="color:#eee; font-size:13px;">${name}</span><span style="color:${color}; font-size:13px; font-weight:800;">${count}회</span></div>`).join('')}</div></div>`;
        };

        return `<div class="analysis-layout">
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:20px; padding:20px; margin-bottom:15px;">
                <div style="font-size:18px; font-weight:bold; color:var(--accent); margin-bottom:15px;">${key} 리포트</div>
                <div style="background:rgba(0,0,0,0.15); border-radius:16px; padding:20px;">
                    <div style="margin-bottom:15px;">
                        <div style="font-size:11px; color:var(--text-sub); margin-bottom:10px;">📊 테마별 분포 (클릭하여 토글 필터링)</div>
                        <div style="display:flex; flex-wrap:wrap; gap:6px;">
                            ${sortedCats.map(([n, c]) => `<span class="analysis-tag" data-report-key="${key}" onclick="filterAnalysisSideList('${key}', '${n}')" style="font-size:11px; color:${getColor(n)}; border:1px solid ${getColor(n)}40; padding:4px 10px; border-radius:8px; background:rgba(0,0,0,0.3);">${n} ${c}회</span>`).join('')}
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
                        <div style="background:rgba(0,0,0,0.2); padding:12px; border-radius:12px;"><div style="font-size:10px; color:var(--text-sub);">총 방송</div><div style="font-size:15px; font-weight:bold;">${Math.floor(s.time/3600)}시간</div>${getDiffHtml(timeDiff)}</div>
                        <div style="background:rgba(0,0,0,0.2); padding:12px; border-radius:12px;"><div style="font-size:10px; color:var(--text-sub);">평균 시간</div><div style="font-size:15px; font-weight:bold;">${secondsToTime(Math.floor(avgTime))}</div>${getDiffHtml(avgDiff)}</div>
                    </div>
                    ${renderSubList('게임', s.subItems['게임'], catColors['게임'])}
                    ${renderSubList('노래', s.subItems['노래'], catColors['노래'])}
                    ${renderSubList('콘텐츠', s.subItems['콘텐츠'], '#00d8ff')}
                </div>
            </div>
            <div class="report-vod-list" id="report-side-list-${key.replace('-','')}"></div>
        </div>`;
    }

    function filterAnalysisSideList(key, tagName) {
        const sideList = document.getElementById(`report-side-list-${key.replace('-', '')}`);
        if(!sideList) return;

        // 토글 로직
        currentAnalysisTag = (currentAnalysisTag === tagName) ? null : tagName;

        // 해당 리포트 블록의 태그들만 active 클래스 관리
        const parentReport = sideList.closest('.analysis-layout');
        if(parentReport) {
            parentReport.querySelectorAll('.analysis-tag').forEach(el => el.classList.remove('active'));
            if (currentAnalysisTag) {
                const activeEl = Array.from(parentReport.querySelectorAll('.analysis-tag')).find(el => el.textContent.includes(currentAnalysisTag));
                if(activeEl) activeEl.classList.add('active');
            }
        }

        let filtered = allVods.filter(v => v.date.startsWith(key));
        // [수정] 태그 필터링 조건 확장
    if (currentAnalysisTag) {
        filtered = filtered.filter(v => {
            if (currentAnalysisTag === '구독+') return v.isPlus;
            if (currentAnalysisTag === '19') return v.isAdult;
            return v.category.includes(currentAnalysisTag);
        });
    }

        sideList.innerHTML = `
        <div style="font-size:14px; font-weight:bold; color:var(--text-sub); margin-bottom:12px; display:flex; justify-content:space-between;">
            <span>📅 ${currentAnalysisTag ? `[${currentAnalysisTag}] 기록` : (key.length === 4 ? `${key}년 전체 기록` : '해당 기간 전체 기록')}</span>
            <span>${filtered.length}개</span>
        </div>
        <div class="report-vod-list">
            ${filtered.map(v => `
                <div class="report-item" onclick="handleAnalysisItemClick('${v.id}')">
                    <div style="width:80px; height:45px; min-width:80px; border-radius:6px; overflow:hidden;">
                        <img src="${v.thumb}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div class="report-item-info">
                        <div class="side-list-title">
                            ${v.title} 
                            ${v.isPlus ? '<span style="color:#e6e02e; font-size:9px; margin-left:4px;">[+]</span>' : ''}
                            ${v.isAdult ? '<span style="color:#ff4757; font-size:9px; margin-left:4px;">[19]</span>' : ''}
                        </div>
                        <div style="font-size:11px; color:var(--text-sub);">${v.date}</div>
                    </div>
                </div>`).join('')}
        </div>`;
}

    function displaySelectedReport() {
        const key = document.getElementById('month-select').value;
        const availableKeys = Object.keys(window.currentStats).sort().reverse();
        const currentIndex = availableKeys.indexOf(key);
        const prevKey = availableKeys[currentIndex + 1];
        
        currentAnalysisTag = null; 
        if (window.currentStats && window.currentStats[key]) {
            document.getElementById('report-container').innerHTML = generateReportHtml(key, window.currentStats[key], prevKey ? window.currentStats[prevKey] : null);
            filterAnalysisSideList(key, null);
        }
    }

    function handleAnalysisItemClick(id) { closeAnalysisModal(); setTimeout(() => { openModalById(id); }, 150); }
