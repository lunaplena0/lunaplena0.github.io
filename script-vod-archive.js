 const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfTHMy1hImniay9QEPDcMq5C4Yo5yFpmRtBlWo6UXK-FNxABQYbtfGpEsKom2O-OIJPnEi8LLy1Qqx/pub?gid=0&single=true&output=tsv";
    let allVods = [];
let displayCount = 30; // 초기 노출 개수
let currentMainTag = null;
    let currentAnalysisTag = null;
   const catColors = { 
    '시네티': '#00d8ff',  // 영화/영상 감상 중심의 고화질 시네마틱 감성 (네온 사이언)
    '풀트': '#ff9f43',   // VR 풀트래커를 활용한 역동적인 신체 퍼포먼스 (비비드 오렌지)
    '게임': '#70a1ff',   // 몰입감 있는 플레이와 활동적인 게임 방송 (스카이 블루)
    '노래': '#ff7eb9',   // 보컬 중심의 화사하고 감성적인 음악 콘텐츠 (소프트 핑크)
    '소통': '#2ed573',   // 시청자와의 편안하고 안정적인 대화 시간 (프레시 그린)
    'ASMR': '#cd84f1',   // 청각적 자극과 차분한 수면 유도 분위기 (라벤더 퍼플)
    '대회': '#ee5253',   // 승부의 열정과 긴장감이 감도는 이벤트 경기 (로즈 레드)
    '합방': '#0abde3',   // 타 스트리머와의 신선한 케미가 돋보이는 협업 (터쿼이아 블루)
    '구독+': '#f1c40f',  // 후원자 전용 혜택 및 특별한 가치를 상징 (선플라워 골드)
    '19': '#576574',    // 성인 전용 콘텐츠의 무게감과 주의를 알림 (스틸 그레이)
    '기타': '#d2dae2'    // 특정 카테고리에 속하지 않는 일반적인 항목 (라이트 실버)
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
                   isAdult: p[6] === '예' || p[6] === 'O', 
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
    
    const visibleData = data.slice(0, displayCount);
    const groups = {};
    
    visibleData.forEach(v => { 
        if (!groups[v.date]) groups[v.date] = []; 
        groups[v.date].push(v); 
    });
    
    Object.keys(groups).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'date-group';
        groupDiv.innerHTML = `<div class="date-header">${date}</div><div class="vod-list"></div>`;
        
        groups[date].forEach(v => {
            const item = document.createElement('div'); 
            item.className = 'vod-item'; 
            item.onclick = () => openModalById(v.id);

            const plusTag = v.isPlus ? `<span class="tag-common tag-plus">구독+</span>` : '';
            const adultTag = v.isAdult ? `<span class="tag-common" style="border: 2px solid #ff4757; color:#ff4757; background:rgba(255,71,87,0.1);">19</span>` : '';
            
            item.innerHTML = `
                <div class="vod-thumb">
                    <img src="${v.thumb}" loading="lazy">
                    <span class="duration">${v.totalTime}</span>
                </div>
                <div class="vod-body">
                    <div class="vod-title">
                        <span class="title-text">${v.title}</span>
                        <div class="badge-group">${plusTag}${adultTag}</div>
                    </div>
                    <div class="vod-tags">
                        ${v.category.split(/[,/ ]+/).filter(c => c.trim()).map(c => {
                            const clr = getColor(c);
                            return `<span class="tag-common" style="background:${clr}20; color:${clr}; border:1px solid ${clr}40;">${c}</span>`;
                        }).join('')}
                    </div>
                </div>
            `;
            groupDiv.querySelector('.vod-list').appendChild(item);
        });
        container.appendChild(groupDiv);
    });

    renderExpandButtons(data.length);
}

function renderExpandButtons(totalLength) {
    const container = document.getElementById('vod-content');
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'expand-btn-container';

    // [더보기 버튼]
    if (displayCount < totalLength) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'btn-load-more btn-expand-main';
        moreBtn.innerHTML = `
            <span>더보기</span>
            <span class="load-count">${displayCount} / ${totalLength}</span>
        `;
        moreBtn.onclick = () => {
            displayCount += 30;
            const filtered = currentMainTag ? filterDataByTag(currentMainTag) : allVods;
            renderList(filtered);
        };
        btnWrapper.appendChild(moreBtn);
    }

    // [접기 버튼]
    if (displayCount > 30) {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-load-more btn-collapse-sub';
        resetBtn.innerHTML = `<span>맨 위로 접기</span>`;
        resetBtn.onclick = () => {
            displayCount = 30;
            const filtered = currentMainTag ? filterDataByTag(currentMainTag) : allVods;
            renderList(filtered);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        btnWrapper.appendChild(resetBtn);
    }

    if (btnWrapper.hasChildNodes()) {
        container.appendChild(btnWrapper);
    }
}

// 필터링된 데이터를 반환하는 보조 함수 (버튼 클릭 시 사용)
function filterDataByTag(tag) {
    return allVods.filter(v => {
        if (tag === '구독+') return v.isPlus;
        if (tag === '19') return v.isAdult;
        return v.category.includes(tag);
    });
}
    function renderTagButtons() {
    const container = document.getElementById('tag-filter-container');
    const tags = [...new Set(allVods.flatMap(v => v.category.split(/[,/ ]+/).filter(c => c.trim())))].sort();
    const allUniqueTags = ['구독+', '19', ...tags];

    let html = `
        <div style="width:100%; font-size:11px; color:var(--text-sub); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <span>🏷️ 태그 필터</span>
            <span id="filter-status" style="font-size:10px; color:var(--accent);">전체보기 중</span>
        </div>`;
    
    // 전체보기 버튼 (기본 액센트 컬러 사용)
    html += `<button id="btn-all" onclick="toggleMainTagFilter(null)" class="filter-btn active" data-tag="전체보기" style="--tag-color: var(--accent)">✨ 전체보기</button>`;
    
    // 개별 태그 버튼들
    html += allUniqueTags.map(tag => {
        const clr = getColor(tag); // 이미 있는 getColor 함수 활용!
        return `
            <button id="btn-${tag}" onclick="toggleMainTagFilter('${tag}')" 
                class="filter-btn" 
                data-tag="${tag}" 
                style="--tag-color: ${clr}">
                ${tag}
            </button>
        `;
    }).join('');
    
    container.innerHTML = html;
}
    function toggleMainTagFilter(tag) {
    currentMainTag = tag;
    displayCount = 30; // [중요] 필터를 바꿀 때는 항상 다시 30개부터 보여줌
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tag === null) {
        const btnAll = document.getElementById('btn-all');
        if(btnAll) btnAll.classList.add('active');
        document.getElementById('filter-status').textContent = "전체보기 중";
        renderList(allVods);
    } else {
        const targetBtn = document.getElementById(`btn-${tag}`);
        if(targetBtn) targetBtn.classList.add('active');
        document.getElementById('filter-status').textContent = `[${tag}] 필터링 중`;

        const filtered = filterDataByTag(tag);
        renderList(filtered);
    }
}

    function calculateAllStats(data) {
        let totalSec = 0, plusSec = 0, maxSec = 0, catMap = {};
        let minSec = Infinity; 
        let validCount = 0;

        data.forEach(v => {
            const s = timeToSeconds(v.totalTime);
            if (s > 60) { // 최소 1분 이상인 방송만 통계에 포함
                totalSec += s; 
                if (v.isPlus) plusSec += s; 
                maxSec = Math.max(maxSec, s);
                minSec = Math.min(minSec, s);
                validCount++;
            }        
            
            // 카테고리 집계
            v.category.split(/[,/ ]+/).filter(c => c.trim()).forEach(c => { 
                catMap[c] = (catMap[c] || 0) + 1; 
            });
            if (v.isPlus) catMap['구독+'] = (catMap['구독+'] || 0) + 1;
            if (v.isAdult) catMap['19'] = (catMap['19'] || 0) + 1;
        });
     
    // 만약 유효한 데이터가 없다면 0초로 표시
    // 만약 유효한 데이터가 없다면 0초로 표시
        const finalMinSec = minSec === Infinity ? 0 : minSec;

        document.getElementById('total-hour').textContent = `${Math.floor(totalSec / 3600)}시간 ${Math.floor((totalSec % 3600) / 60)}분`;
        document.getElementById('plus-hour').textContent = `${Math.floor(plusSec / 3600)}시간 ${Math.floor((plusSec % 3600) / 60)}분`;
        document.getElementById('plus-ratio').textContent = `(${(totalSec > 0 ? (plusSec / totalSec * 100) : 0).toFixed(1)}%)`;
        
        document.getElementById('max-time').textContent = secondsToTime(maxSec);
        document.getElementById('min-time').textContent = secondsToTime(finalMinSec);
        const avgSec = validCount > 0 ? Math.floor(totalSec / validCount) : 0;
        document.getElementById('avg-time').textContent = secondsToTime(avgSec);

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

        // 썸네일, 제목, 날짜 설정
        document.getElementById('m-thumb').src = v.thumb;
        document.getElementById('m-title').textContent = v.title;
        document.getElementById('m-date').innerHTML = `
            <div style="font-size: 15px; font-weight: bold; color: var(--text-main); margin-bottom: 4px;">${v.date}</div>
            <div style="font-size: 13px; color: var(--text-sub);">
                총 방송 시간: <span style="color: var(--accent); font-weight: bold;">${v.totalTime}</span>
            </div>
        `;
        document.getElementById('m-link').href = v.link;

        // 배지 설정
        let badgeHtml = '';
if (v.isPlus) {
    badgeHtml += `<span class="tag-common tag-plus" style="padding: 2px 8px; height: auto; font-size: 11px; margin-top:8px; margin-right:4px; border: 2px solid #e6e02e; background: rgba(230, 224, 46, 0.1);">구독플러스</span>`;
}
if (v.isAdult) {
    badgeHtml += `<span class="tag-common" style="padding: 2px 8px; height: auto; font-size: 11px; margin-top:8px; border: 2px solid #ff4757; color: #ff4757; background: rgba(255, 71, 87, 0.1);">19</span>`;
}
document.getElementById('m-plus').innerHTML = badgeHtml;

        // --- [수정된 섹션별 데이터 출력 로직] ---
        const setSec = (id, rowId, data) => {
    const row = document.getElementById(rowId);
    const box = document.getElementById(id);
    
    if (data && data.trim() !== "" && data !== '-') {
        const items = data.split(',')
            .map(item => item.trim())
            .filter(item => item !== "");

        if (items.length > 0) {
            row.style.display = 'block';
            box.innerHTML = items
                .map(item => {
                    // 1. "("를 " - "로 바꿉니다.
                    // 2. ")"를 제거합니다.
                    let formatted = item.replace('(', ' - ').replace(')', '');
                    
                    return `<div style="font-size:13px; margin-bottom:6px; color:var(--text-main); opacity:0.9; line-height:1.5; word-break: break-all;">• ${formatted}</div>`;
                })
                .join('');
            
            if (box.lastElementChild) box.lastElementChild.style.marginBottom = '0';
            return;
        }
    }
    row.style.display = 'none';
};

// 호출 부분
setSec('m-game', 'row-game', v.gData);
setSec('m-song', 'row-song', v.sData);
setSec('m-talk', 'row-talk', v.tData);
setSec('m-content', 'row-content', v.cData);

        // 모달 활성화
        document.getElementById('modal-overlay').style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; document.body.classList.remove('modal-open'); }

    function openAnalysisModal() {
    document.getElementById('analysis-overlay').style.display = 'flex';
    document.body.classList.add('modal-open');
    
    // 1. 데이터에 있는 연도들로 연도 선택 박스 채우기
    const years = [...new Set(allVods.map(v => v.date.split('-')[0]))].sort().reverse();
    const yearSelect = document.getElementById('analysis-year');
    yearSelect.innerHTML = years.map(y => `<option value="${y}">${y}년</option>`).join('');
    
    // 2. 초기 리포트 타입 설정 (월별로 시작하고 싶다면)
    document.getElementById('analysis-type').value = 'month';
    
    // 3. 리포트 생성 실행
    currentAnalysisTag = null;
    renderAnalysis();
}
    function closeAnalysisModal() { 
    // 1. 분석 모달 닫기
    document.getElementById('analysis-overlay').style.display = 'none'; 
    
    // 2. [핵심] 메인 페이지 스크롤 잠금 해제
    document.body.classList.remove('modal-open'); 
}

    function renderAnalysis() {
    const targetYear = document.getElementById('analysis-year').value;
    const viewType = document.getElementById('analysis-type').value;
    const resultDiv = document.getElementById('analysis-result');
    
    // 1. 해당 연도 데이터 1차 필터링
    const yearFiltered = allVods.filter(v => v.date.startsWith(targetYear));
    
    if (yearFiltered.length === 0) {
        resultDiv.innerHTML = "<div style='padding:40px; text-align:center; color:var(--text-sub);'>해당 연도의 데이터가 없습니다.</div>";
        return;
    }

    // 2. 통계 데이터 구조 생성 (월별/연도별)
    const stats = {};
    yearFiltered.forEach(v => {
        const key = viewType === 'month' ? v.date.substring(0, 7) : v.date.substring(0, 4);
        if (!stats[key]) {
            stats[key] = { time: 0, count: 0, cats: {}, subItems: { '게임': {}, '노래': {}, '콘텐츠': {} } };
        }
        const sec = timeToSeconds(v.totalTime);
        stats[key].time += sec;
        stats[key].count++;
        
        // 카테고리 및 배지 집계
        v.category.split(/[,/ ]+/).forEach(c => { if(c.trim()) stats[key].cats[c] = (stats[key].cats[c] || 0) + 1; });
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
    window.currentStats = stats; // 전역 참조용

    // 3. 화면 출력 로직
    if (viewType === 'month') {
    const monthSelect = document.getElementById('month-select');
    
    if (monthSelect) {
        // onchange 속성을 추가하여 선택 시 즉시 함수가 실행되도록 합니다.
        monthSelect.setAttribute('onchange', 'displaySelectedReport()');
        monthSelect.innerHTML = availableKeys.map(k => 
            `<option value="${k}">${k.split('-')[1]}월</option>`
        ).join('');
    }
    
    resultDiv.innerHTML = `<div id="report-container"></div>`;
    displaySelectedReport(); 
} else {
        // 연도별 요약 보기
        resultDiv.innerHTML = availableKeys.map((key, i) => 
            generateReportHtml(key, stats[key], availableKeys[i+1] ? stats[availableKeys[i+1]] : null)
        ).join('');
        
        // 연도별 보기일 때는 사이드 리스트를 즉시 로드
        availableKeys.forEach(key => filterAnalysisSideList(key, null));
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
            return `
                <div style="margin-top:20px; width: 100%;">
                    <div style="font-size:13px; color:${color}; font-weight:bold; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                        <span style="width:4px; height:14px; background:${color}; border-radius:2px;"></span>${title} 기록
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr; gap:6px;">
                        ${sortedItems.map(([name, count]) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
                                <span style="color:#eee; font-size:13px;">${name}</span>
                                <span style="color:${color}; font-size:13px; font-weight:800;">${count}회</span>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        };

        return `
            <div class="analysis-layout">
                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:20px; padding:20px; margin-bottom:15px;">
                    <div style="font-size:18px; font-weight:bold; color:var(--accent); margin-bottom:15px;">${key} 리포트</div>
                    <div style="background:rgba(0,0,0,0.15); border-radius:16px; padding:20px;">
                        <div style="margin-bottom:15px;">
                            <div style="font-size:11px; color:var(--text-sub); margin-bottom:10px;">📊 테마별 분포 (클릭하여 토글 필터링)</div>
                            <div style="display:flex; flex-wrap:wrap; gap:6px;">
                                ${sortedCats.map(([n, c]) => `
                                    <span class="analysis-tag" data-report-key="${key}" onclick="filterAnalysisSideList('${key}', '${n}')" style="font-size:11px; color:${getColor(n)}; border:1px solid ${getColor(n)}40; padding:4px 10px; border-radius:8px; background:rgba(0,0,0,0.3); cursor:pointer;">
                                        ${n} ${c}회
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
                            <div style="background:rgba(0,0,0,0.2); padding:12px; border-radius:12px;">
                                <div style="font-size:10px; color:var(--text-sub);">총 방송</div>
                                <div style="font-size:15px; font-weight:bold;">${Math.floor(s.time/3600)}시간</div>
                                ${getDiffHtml(timeDiff)}
                            </div>
                            <div style="background:rgba(0,0,0,0.2); padding:12px; border-radius:12px;">
                                <div style="font-size:10px; color:var(--text-sub);">평균 시간</div>
                                <div style="font-size:15px; font-weight:bold;">${secondsToTime(Math.floor(avgTime))}</div>
                                ${getDiffHtml(avgDiff)}
                            </div>
                        </div>
                        ${renderSubList('게임', s.subItems['게임'], catColors['게임'])}
                        ${renderSubList('노래', s.subItems['노래'], catColors['노래'])}
                        ${renderSubList('콘텐츠', s.subItems['콘텐츠'], '#00d8ff')}
                    </div>
                </div>
                <div class="report-vod-list" id="report-side-list-${key.replace(/-/g, '')}"></div>
            </div>`;
    }

    function filterAnalysisSideList(key, tagName) {
    const sideList = document.getElementById(`report-side-list-${key.replace(/-/g, '')}`);
    if (!sideList) return;

    // 토글 로직
    currentAnalysisTag = (currentAnalysisTag === tagName) ? null : tagName;

    // 해당 리포트 블록의 태그들만 active 클래스 관리
    const parentReport = sideList.closest('.analysis-layout');
    if (parentReport) {
        parentReport.querySelectorAll('.analysis-tag').forEach(el => el.classList.remove('active'));
        if (currentAnalysisTag) {
            const activeEl = Array.from(parentReport.querySelectorAll('.analysis-tag')).find(el => el.textContent.includes(currentAnalysisTag));
            if (activeEl) activeEl.classList.add('active');
        }
    }

    let filtered = allVods.filter(v => v.date.startsWith(key));
    
    if (currentAnalysisTag) {
        filtered = filtered.filter(v => {
            if (currentAnalysisTag === '구독+') return v.isPlus;
            if (currentAnalysisTag === '19') return v.isAdult;
            return v.category.includes(currentAnalysisTag);
        });
    }

    // [교정 포인트] 백틱 내부의 ${} 구조와 괄호를 명확하게 정리
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
                            ${v.isPlus ? '<span style="color:#e6e02e; font-size:9px; margin-left:4px;">[구독+]</span>' : ''}
                            ${v.isAdult ? '<span style="color:#ff4757; font-size:9px; margin-left:4px;">[19]</span>' : ''}
                        </div>
                        <div style="font-size:11px; color:var(--text-sub);">${v.date}</div>
                    </div>
                </div>`).join('')}
        </div>`;
}

    function displaySelectedReport() {
    const selectEl = document.getElementById('month-select');
    if (!selectEl) return;
    
    const key = selectEl.value; // 선택된 'YYYY-MM' 값
    const availableKeys = Object.keys(window.currentStats).sort().reverse();
    const currentIndex = availableKeys.indexOf(key);
    const prevKey = availableKeys[currentIndex + 1]; // 비교를 위한 이전 달 키
    
    currentAnalysisTag = null; // 태그 필터 초기화
    
    if (window.currentStats && window.currentStats[key]) {
        // 리포트 본문 갱신
        document.getElementById('report-container').innerHTML = 
            generateReportHtml(key, window.currentStats[key], prevKey ? window.currentStats[prevKey] : null);
        
        // 해당 월의 전체 VOD 리스트 갱신
        filterAnalysisSideList(key, null);
    }
}

    function handleAnalysisItemClick(id) { closeAnalysisModal(); setTimeout(() => { openModalById(id); }, 150); }
