const TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQ3nX6onmaf-ZHhXGox2s4ChGos7ki7iFjQ_47lArZR6dV935gCIbLbvlDDAS65rTEnswSLIk_7v3R/pub?gid=0&single=true&output=tsv';
const CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQ3nX6onmaf-ZHhXGox2s4ChGos7ki7iFjQ_47lArZR6dV935gCIbLbvlDDAS65rTEnswSLIk_7v3R/pub?gid=0&single=true&output=tsv';
const TIMELINE_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQapO60c8dgTwJr4Ua8otMnwxJ9yx9gqE2jsoY5YAgwc3nzVTbBx-b0YcnyIADrv0PsYQRRBgjKlZSY/pub?output=tsv';
const CRY_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRaLjP1nClrC7K6dnBraEYxSapXRDZWy48v0h71BeMUws7ItzqlmOYihwc4DCSDC1LDQasHdMaDY3JE/pub?output=tsv';

let allTimelineData = [];
const INITIAL_SHOW = 5;
let isExpanded = false;

// 로딩 텍스트 변경
function prepareWaveText(msg) {
    const el = document.getElementById('loading-text');
    if (el) el.innerText = msg;
}

// 로딩 오버레이 숨기기
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.visibility = 'hidden', 500);
    }
}

// 메인 데이터 초기화 및 렌더링
async function init() {
    const overlay = document.getElementById('loading-overlay');
    try {
        prepareWaveText("바닷속에서 찾고 있어요 . . .");
        if (overlay) {
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        }

        const cacheBuster = `&t=${new Date().getTime()}`;
        const finalUrl = TSV_URL + cacheBuster;

        const response = await fetch(finalUrl, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) throw new Error('Network error');

        const text = await response.text();
        const rows = text.split(/\r?\n/).map(row => row.split('\t'));

        const profile = rows[2];
        const liveData = rows[6]; 
        const statusBox = document.getElementById('live-status-target');

        const isOnline = liveData && liveData[5] !== "방송 정보 없음" && liveData[5] !== undefined && liveData[5] !== "";

        if (isOnline) {
            const bTitle = liveData[5];
            const bTime = liveData[6];
            const bGrade = liveData[7];
            const bSubOnly = liveData[8];
            const bPwd = liveData[9];

            let subTagsHtml = '';
            if (!["X", "-", "0"].includes(bGrade)) {
                subTagsHtml += `<span class="px-1.5 py-0.5 bg-marine-reef border border-marine-coral/40 text-marine-coral rounded text-[9px] font-bold">19</span>`;
            }
            if (!["X", "-"].includes(bSubOnly)) {
                subTagsHtml += `<span class="px-1.5 py-0.5 bg-marine-reef border border-purple-400/40 text-purple-400 rounded text-[9px] font-bold">구독+</span>`;
            }
            if (!["X", "-"].includes(bPwd)) {
                subTagsHtml += `<span class="px-1.5 py-0.5 bg-marine-reef border border-marine-spray/40 text-marine-spray rounded text-[9px] font-bold">비밀번호</span>`;
            }

            statusBox.innerHTML = `
                <div class="flex items-center gap-3 min-w-0 flex-grow">
                    <div class="relative flex-shrink-0 flex items-center justify-center">
                        <span class="absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                        <div class="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                    </div>
                    <span class=" font-black text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded tracking-wider shrink-0">ONLINE</span>
                    <div class="flex items-center gap-2 min-w-0">
                        <a href="https://play.sooplive.com/bababi" target="_blank" class="text-xs sm:text-sm font-bold text-marine-foam hover:text-marine-cyan truncate max-w-[160px] sm:max-w-[320px] md:max-w-[480px] transition-colors decoration-none">
                            ${bTitle}
                        </a>
                        <div class="flex items-center gap-1 shrink-0 ml-1">${subTagsHtml}</div>
                    </div>
                </div>
                <div class="text-[10px] text-marine-spray shrink-0 bg-marine-shallow/60 px-2 py-0.5 rounded-lg border border-marine-border ml-2">
                    <i class="fa-regular fa-clock mr-1 text-[9px]"></i>시작: ${bTime}
                </div>
            `;
        } else {
            const lastTime = (profile && profile[3]) ? profile[3].trim() : "확인 중";
            statusBox.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-marine-spray/40"></div>
                    <span class=" font-black text-[10px] bg-marine-shallow border border-marine-border text-marine-spray px-1.5 py-0.5 rounded tracking-wider">OFFLINE</span>
                    <span class="text-xs sm:text-sm font-bold text-marine-spray/80">방송 준비 중</span>
                </div>
                <div class="text-[10px] text-marine-spray/70 shrink-0 bg-marine-deep px-2 py-0.5 rounded border border-marine-border ml-2">
                    최근 방송: ${lastTime}
                </div>
            `;
        }

        if (profile) {
            document.getElementById('user-nick').innerText = profile[0] || '닉네임';
            document.getElementById('user-desc').innerText = profile[1] || '';
            if (profile[2]) {
                document.getElementById('profile-img-bg').style.backgroundImage = `url('${profile[2]}')`;
            }
        }

        renderLinks(rows[5]);
        renderPosts(rows.slice(8, 13));
        renderVODs(rows.slice(16, 21));
        renderSchedule(rows.slice(24, 29));

    } catch (e) { 
        console.error("Data Load Error:", e);
    } finally {
        hideLoadingOverlay();
    }
}

// 링크 렌더링
function renderLinks(extraLinks) {
    const targetBox = document.getElementById('extra-links-target');
    if (!targetBox) return;
    targetBox.innerHTML = '';

    if (extraLinks && Array.isArray(extraLinks)) {
        extraLinks.forEach(l => {
            if (!l || !l.includes(': ')) return;
            const [name, ...urlParts] = l.split(': ');
            const url = urlParts.join(': ').trim();
            
            if (url.startsWith('http')) {
                const a = document.createElement('a');
                a.className = 'px-3 py-1.5 bg-marine-shallow/40 hover:bg-marine-cyan hover:text-marine-deep border border-marine-cyan/30 text-marine-foam transition-all duration-300 rounded-xl text-xs font-bold shadow-sm';
                a.href = url;
                a.target = '_blank';
                a.innerText = name.trim();
                targetBox.appendChild(a);
            }
        });
    }
}

// 최근 공지 렌더링
function renderPosts(data) {
    const postBox = document.getElementById('post-container');
    if (!postBox) return;
    const postData = data.filter(p => p[1] && p[1].trim() !== "");
    
    let html = '';
    postData.forEach(p => {
        const isNotice = p[3]?.trim() === 'O';
        html += `
            <div onclick="window.open('${p[2]}', '_blank')" class="flex items-center justify-between px-3 h-[48px] hover:bg-marine-shallow/20 transition-all duration-300 cursor-pointer group relative">
                <div class="min-w-0 flex-grow pr-2">
                    <div class="flex items-center gap-1.5">
                        <h4 class="text-xs font-bold text-marine-foam group-hover:text-marine-cyan truncate transition-colors leading-tight">${p[1]}</h4>
                    </div>
                    <span class="text-[9px] text-marine-spray/40 block mt-0.5">${p[0]}</span>
                </div>
                ${isNotice ? '<i class="fa-solid fa-thumbtack text-[9px] text-marine-coral shrink-0 ml-1"></i>' : '<i class="fa-regular fa-file-lines text-[9px] text-marine-spray/30 shrink-0 ml-1"></i>'}
            </div>`;
    });
    postBox.innerHTML = html || `<div class="text-xs text-marine-spray/40 text-center py-8">등록된 공지사항이 없습니다.</div>`;
}

// 최근 다시보기 렌더링
function renderVODs(data) {
    const vodBox = document.getElementById('vod-container');
    if (!vodBox) return;
    const vodData = data.filter(v => v[1] && v[1].trim() !== "" && !v[1].includes("[클립]"));

    let html = '';
    vodData.forEach(v => {
        const isPin = v[4]?.trim() === 'O';
        html += `
            <div onclick="window.open('${v[2]}', '_blank')" class="flex items-center gap-2.5 px-3 py-1 h-[48px] hover:bg-marine-shallow/20 transition-all duration-300 cursor-pointer group relative">
                <div class="relative aspect-[16/9] h-full rounded overflow-hidden shrink-0 bg-marine-void border border-marine-border/40">
                    <img src="${v[3]}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="VOD">
                </div>
                <div class="min-w-0 flex-grow flex flex-col justify-center">
                    <h4 class="text-xs font-bold text-marine-foam group-hover:text-marine-cyan truncate leading-tight transition-colors">${v[1]}</h4>
                    <span class="text-[9px] text-marine-spray/40 block mt-0.5">${v[0]}</span>
                </div>
                ${isPin ? '<i class="fa-solid fa-star text-[9px] text-marine-cyan shrink-0 mr-1"></i>' : ''}
            </div>`;
    });
    vodBox.innerHTML = html || `<div class="text-xs text-marine-spray/40 text-center py-8">가져온 다시보기가 없습니다.</div>`;
}

// 주간 일정 렌더링
function renderSchedule(data) {
    const container = document.getElementById('schedule-container');
    if (!container) return;
    container.innerHTML = '';
    
    const todayStr = new Date().toLocaleDateString('en-CA'); 
    let count = 0;

    data.forEach(row => {
        const date = row[0]?.trim() || '';    
        const day = row[1]?.trim() || '';    
        const time = row[2]?.trim() || '';   
        const content = row[3]?.trim() || '';  
        const category = row[4]?.trim() || ''; 

        if (!date && !content) return; 
        count++;

        const isToday = date === todayStr;
        const isDayOff = category.includes('휴방'); 
        
        let badgeColor = "bg-marine-shallow/50 border-marine-border/40 text-marine-spray";
        if (isDayOff) badgeColor = "bg-red-500/10 border-red-500/20 text-red-400 font-bold";
        else if (category.includes('노래') || category.includes('뱅온')) badgeColor = "bg-marine-cyan/10 border-marine-cyan/20 text-marine-cyan";
        else if (category.includes('소통')) badgeColor = "bg-marine-mint/10 border-marine-mint/20 text-marine-mint";

        const rowDiv = document.createElement('div');
        rowDiv.className = `flex items-center justify-between px-3 h-[48px] transition-all duration-300 ${isToday ? 'bg-marine-cyan/10' : 'hover:bg-marine-shallow/20'} cursor-pointer`;
        
        rowDiv.innerHTML = `
            <div class="min-w-0 flex-grow pr-2 flex flex-col justify-center">
                <div class="flex items-center gap-1">
                    <span class=" font-extrabold text-[11px] text-marine-cyan w-[80px] text-left shrink-0">${date}</span>
                    <span class="text-[8px] text-marine-foam px-1 bg-marine-shallow border border-marine-border/40 rounded shrink-0 w-8 text-center leading-none py-0.5">${day}</span>
                    ${isToday ? '<span class="ml-1 px-1 bg-marine-mint text-marine-deep text-[8px] font-extrabold rounded tracking-tighter scale-90 origin-left">TODAY</span>' : ''}
                </div>
                <div class="text-xs text-marine-foam truncate font-semibold leading-tight mt-0.5">
                    ${time && !isDayOff ? `<span class="text-marine-mint font-bold mr-1">${time}</span>` : ''}${content || '일정 없음'}
                </div>
            </div>
            <span class="px-1.5 py-0.5 border rounded text-[8px] font-bold shrink-0 ${badgeColor}">${category || '미정'}</span>
        `;
        container.appendChild(rowDiv);
    });
    
    if (count === 0) {
        container.innerHTML = `<div class="text-xs text-marine-spray/40 text-center py-8">편성된 주간 일정이 없습니다.</div>`;
    }
}

// 타임라인 데이터 가져오기
async function renderTimeline() {
    const timelineContainer = document.getElementById('timeline-body');
    const btnContainer = document.getElementById('timeline-btn-container');
    if (!timelineContainer) return;

    try {
        const response = await fetch(TIMELINE_TSV_URL + `&t=${new Date().getTime()}`, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });
        const text = await response.text();
        const rows = text.split(/\r?\n/).map(row => row.split('\t'));
        
        allTimelineData = rows.slice(1).filter(r => r[0] && r[1]);
        allTimelineData.sort((a, b) => new Date(a[0]) - new Date(b[0]));

        updateTimelineDisplay(isExpanded);

        if (allTimelineData.length > INITIAL_SHOW) {
            btnContainer.classList.remove('hidden');
        }
    } catch (e) {
        console.error("Timeline Load Error:", e);
        timelineContainer.innerHTML = '<p class="text-xs text-marine-spray text-center py-10">히스토리를 불러올 수 없습니다.</p>';
    }
}

// 타임라인 화면 갱신
function updateTimelineDisplay(expanded) {
    const container = document.getElementById('timeline-body');
    const displayData = expanded ? allTimelineData : allTimelineData.slice(0, 5);
    
    container.className = "relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8 mt-6"; 
    
    let html = `<div class="absolute top-2 left-[7px] h-full w-[2px] bg-marine-cyan/20 lg:hidden"></div>`;
    
    displayData.forEach((row, index) => {
        const isLastInRow = (index + 1) % 5 === 0;
        
        html += `
            <div class="relative flex flex-row lg:flex-col items-start lg:items-center">
                ${!isLastInRow ? `
                    <div class="absolute top-2 left-[50%] w-[calc(100%-16px)] h-[2px] bg-marine-cyan/20 hidden lg:block translate-x-4"></div>
                ` : ''}
                <div class="relative z-10 w-4 h-4 rounded-full bg-marine-deep border-2 border-marine-cyan shadow-[0_0_10px_#00e5ff] flex-shrink-0"></div>
                <div class="w-full ml-4 lg:ml-0 lg:mt-4 px-2 z-10">
                    <div class="text-[10px] text-marine-cyan font-bold  mb-1 text-left lg:text-center">
                        ${row[0].trim()}
                    </div>
                    <div class="text-xs text-marine-foam p-3 bg-marine-reef/40 border border-marine-border rounded-lg shadow-sm">
                        ${row[1].trim()}
                    </div>
                </div>
            </div>`;
    });
    
    container.innerHTML = html;
}

// 타임라인 더보기/접기 토글
function toggleTimeline() {
    isExpanded = !isExpanded;
    updateTimelineDisplay(isExpanded);
    
    const btn = document.getElementById('timeline-toggle-btn');
    btn.innerHTML = isExpanded ? 
        '접기 <i class="fa-solid fa-chevron-up ml-1"></i>' : 
        '더보기 <i class="fa-solid fa-chevron-down ml-1"></i>';
}

// 울보 노트 시간을 초(Second)로 변환하는 함수
function convertTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':').map(Number);
    if (parts.some(isNaN)) return 0;

    let seconds = 0;
    if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        seconds = parts[0];
    }
    return seconds;
}

// 울보 노트 데이터 렌더링 (부분 스피너 적용)
async function renderCryNote() {
    const container = document.getElementById('cry-container');
    const daysCountEl = document.getElementById('cry-days-count');
    const totalCountEl = document.getElementById('cry-total-count');
    const avgIntervalEl = document.getElementById('cry-avg-interval');
    if (!container) return;

    // 🔥 울보 노트 영역 내부만 부분 스피너 로딩 표시
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 gap-4">
            <div class="relative w-12 h-12">
                <div class="absolute inset-0 border-2 border-marine-cyan/20 rounded-full"></div>
                <div class="absolute inset-0 border-2 border-marine-cyan border-t-transparent rounded-full animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-marine-cyan text-sm">
                    <i class="fa-solid fa-droplet animate-pulse"></i>
                </div>
            </div>
            <p class="text-xs text-marine-spray/70 font-display tracking-wider animate-pulse">눈물을 모으고 있어요 . . .</p>
        </div>
    `;

    const startDate = new Date('2026-04-20');
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const activeDays = diffDays > 0 ? diffDays : 1;
    
    if(daysCountEl) daysCountEl.innerText = activeDays;

    try {
        const response = await fetch(CRY_TSV_URL + `&t=${new Date().getTime()}`);
        const text = await response.text();
        const rows = text.split(/\r?\n/).map(row => row.split('\t'));
        
        let cryData = rows.slice(1).filter(r => r[0] && r[0].trim() !== "");

        // 오래된 날짜가 위로 오도록 오름차순 정렬
        cryData.sort((a, b) => new Date(a[0].trim()) - new Date(b[0].trim()));

        const totalCount = cryData.length;
        if(totalCountEl) totalCountEl.innerText = totalCount;

        if(avgIntervalEl) {
            if (totalCount > 0) {
                const avg = (activeDays / totalCount).toFixed(1);
                avgIntervalEl.innerText = avg;
            } else {
                avgIntervalEl.innerText = '0';
            }
        }

        if (totalCount === 0) {
            container.innerHTML = `<div class="text-xs text-marine-spray/40 text-center py-16">기록된 울보 노트가 없습니다.</div>`;
            return;
        }

        // 데이터 구조화: 연도별 -> 월별 그룹화
        let groupedData = {};
        cryData.forEach(row => {
            const dateStr = row[0]?.trim() || '';
            const dateObj = new Date(dateStr);
            
            let year = '기타';
            let month = '기타';

            if (!isNaN(dateObj)) {
                year = dateObj.getFullYear().toString();
                month = String(dateObj.getMonth() + 1).padStart(2, '0');
            } else {
                const parts = dateStr.split(/[-./]/);
                if (parts.length >= 2) {
                    year = parts[0];
                    month = parts[1].padStart(2, '0');
                }
            }

            if (!groupedData[year]) groupedData[year] = {};
            if (!groupedData[year][month]) groupedData[year][month] = [];
            groupedData[year][month].push(row);
        });

        // 연도 오름차순
        const sortedYears = Object.keys(groupedData).sort((a, b) => a.localeCompare(b));

        let html = '';
        sortedYears.forEach(year => {
            const sortedMonths = Object.keys(groupedData[year]).sort((a, b) => a.localeCompare(b));
            
            html += `
                <div class="space-y-6">
                    <div class="flex items-center gap-3">
                        <span class="font-display font-black text-lg text-marine-cyan tracking-wider">${year}년</span>
                        <div class="flex-grow h-[1px] bg-marine-border"></div>
                    </div>
            `;

            sortedMonths.forEach(month => {
                const monthRows = groupedData[year][month];
                monthRows.sort((a, b) => new Date(a[0].trim()) - new Date(b[0].trim()));

                html += `
                    <div class="bg-marine-deep/30 border border-marine-border/50 rounded-2xl p-4 sm:p-5 shadow-inner space-y-3">
                        <div class="flex items-center justify-between border-b border-marine-border/30 pb-2.5 mb-2">
                            <h3 class="font-display font-bold text-sm text-marine-foam flex items-center gap-2">
                                <i class="fa-solid fa-folder-open text-marine-mint text-xs"></i> ${Number(month)}월
                            </h3>
                            <span class="text-[10px] bg-marine-shallow/80 text-marine-spray px-2.5 py-0.5 rounded-full border border-marine-border font-medium">
                                총 ${monthRows.length}회 기록
                            </span>
                        </div>
                        <div class="divide-y divide-marine-border/30">
                `;

                monthRows.forEach((row) => {
                    const date = row[0]?.trim() || '';
                    const description = row[1]?.trim() || '내용 없음';
                    const timecode = row[2]?.trim() || '';
                    const address = row[3]?.trim() || '';

                    let actionButtonHtml = '';
                    if (address && address.startsWith('http')) {
                        const totalSeconds = convertTimeToSeconds(timecode);
                        const separator = address.includes('?') ? '&' : '?';
                        const finalAddress = `${address}${separator}change_second=${totalSeconds}`;

                        actionButtonHtml = `
                            <a href="${finalAddress}" target="_blank" class="px-3 py-1.5 bg-marine-cyan/10 hover:bg-marine-cyan hover:text-marine-deep border border-marine-cyan/30 text-marine-cyan transition-all duration-300 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm">
                                <i class="fa-regular fa-clock text-[10px]"></i>
                                <span>${timecode || '00:00'}</span>
                                <i class="fa-solid fa-arrow-up-right-from-square text-[9px] ml-0.5 opacity-70"></i>
                            </a>
                        `;
                    } else if (timecode) {
                        actionButtonHtml = `
                            <span class="px-3 py-1.5 bg-marine-deep/80 border border-marine-cyan/20 text-marine-mint rounded-xl text-xs font-mono shrink-0 flex items-center gap-1.5">
                                <i class="fa-regular fa-clock text-[10px]"></i>
                                <span>${timecode}</span>
                            </span>
                        `;
                    }

                    html += `
                        <div class="flex items-center justify-between gap-3 py-3 first:pt-2 last:pb-2 group">
                            <div class="flex items-center gap-3 sm:gap-4 flex-grow min-w-0 pr-2">
                                <span class="font-body font-bold text-xs sm:text-sm text-marine-cyan w-[115px] sm:w-[135px] shrink-0 flex items-center gap-2 whitespace-nowrap">
                                    <div class="w-1.5 h-1.5 rounded-full bg-marine-mint shadow-[0_0_6px_#05ffa6] shrink-0"></div>
                                    ${date}
                                </span>
                                <span class="text-xs sm:text-sm text-marine-foam truncate font-medium group-hover:text-marine-cyan transition-colors flex-grow">${description}</span>
                            </div>
                            <div class="shrink-0">
                                ${actionButtonHtml}
                            </div>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });

            html += `
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (e) {
        console.error("Cry Note Load Error:", e);
        container.innerHTML = `<div class="text-xs text-marine-spray/40 text-center py-16">울보 노트를 불러올 수 없습니다.</div>`;
    }
}

// 파비콘 동적 업데이트 (캐시 방지 적용)
async function updateFavicon() {
    try {
        const cacheBuster = `&t=${Date.now()}`;
        const response = await fetch(CONFIG_URL + cacheBuster, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });
        const text = await response.text();
        const rows = text.split(/\r?\n/).map(row => row.split('\t'));
        
        const newFaviconUrl = rows[2]?.[2]?.trim(); 

        if (newFaviconUrl && newFaviconUrl.startsWith('http')) {
            let favicon = document.querySelector("link[rel~='icon']");
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            
            favicon.href = newFaviconUrl + `?t=${Date.now()}`;
            console.log("Favicon updated to:", newFaviconUrl);
        }
    } catch (e) {
        console.error("Favicon update error:", e);
    }
}

// 페이지가 열릴 때 모든 초기화 함수 한 번에 실행 및 주기적 갱신 설정
window.addEventListener('DOMContentLoaded', () => {
    init();
    renderTimeline();
    renderCryNote();
    updateFavicon();

    // 10분마다 자동 갱신
    setInterval(() => {
        init();
        renderTimeline();
        renderCryNote();
        updateFavicon();
    }, 1000 * 60 * 10);
});
