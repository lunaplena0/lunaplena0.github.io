const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQmWkxsDxTFSxtnLX0nBapwtNcSW9FQiTDv61z9F89_lqZNq5pKGgmuaAKGo5Fd1r4_hfDtxSqSYdpf/pub?gid=0&single=true&output=tsv";

let rawData = []; 
let visibleCount = 20; // 20개 단위 표시를 위한 변수
let currentCategory = 'all';
let artistChartInstance = null;
let genreChartInstance = null;

async function loadSheetData() {
    // --- [로딩 시작 코드 추가] ---
    const overlay = document.getElementById('loading-overlay');
    if (typeof prepareWaveText === "function") {
        prepareWaveText("노래 기록을 정리하고 있어요 . . .");
    }
    // -------------------------

    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const rows = data.split('\n').map(row => row.split('\t'));
        
        rawData = rows.slice(1).map(row => {
            const dates = row[3] ? row[3].match(/\(\d{2}\.\d{2}\.\d{2}\)/g) || [] : [];
            return {
                title: row[0]?.trim(),
                artist: row[1]?.trim(),
                genre: row[2]?.trim(),
                dates: dates,
                count: dates.length
            };
        }).filter(item => item.title);

        initDynamicSelectors(); 
        showStats('all');
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        const contentArea = document.getElementById('content-area');
        if (contentArea) contentArea.innerHTML = `<p style="text-align:center; color:#ff4b4b;">데이터 로드 중 오류가 발생했습니다.</p>`;
    } finally {
        // --- [로딩 종료 및 페이드아웃 추가] ---
        if (overlay) {
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.visibility = 'hidden';
                    document.body.style.overflow = 'auto'; 
                }, 500);
            }, 800);
        }
        // ----------------------------------
    }
}

// 1. 실제 데이터가 있는 연도만 추출하여 연도 셀렉트 박스 생성
function initDynamicSelectors() {
    const yearSelect = document.getElementById('select-year');
    if (!yearSelect) return;
    
    const availableYears = new Set();
    rawData.forEach(item => {
        item.dates.forEach(dateStr => {
            const year = dateStr.substring(1, 3);
            availableYears.add(year);
        });
    });

    yearSelect.innerHTML = "";
    [...availableYears].sort((a, b) => b - a).forEach(year => {
        let opt = document.createElement('option');
        opt.value = year;
        opt.innerHTML = `20${year}년`;
        yearSelect.appendChild(opt);
    });

    updateMonthSelector();
}

// 2. 선택된 연도 내 데이터가 있는 월만 추출
function updateMonthSelector() {
    const yearSelect = document.getElementById('select-year');
    const monthSelect = document.getElementById('select-month');
    if (!yearSelect || !monthSelect) return;

    const selectedYear = yearSelect.value;
    const availableMonths = new Set();

    if (!selectedYear) return;

    rawData.forEach(item => {
        item.dates.forEach(dateStr => {
            if (dateStr.startsWith(`(${selectedYear}.`)) {
                const month = dateStr.substring(4, 6);
                availableMonths.add(month);
            }
        });
    });

    monthSelect.innerHTML = "";
    [...availableMonths].sort((a, b) => a - b).forEach(month => {
        let opt = document.createElement('option');
        opt.value = month;
        opt.innerHTML = `${parseInt(month)}월`;
        monthSelect.appendChild(opt);
    });
}

function onYearChange() {
    updateMonthSelector();
    applyDateFilter();
}

// 필터 변경 시 초기화
function updateDateFilter(category, target) {
    visibleCount = 20; 
    currentCategory = category;
    
    // 1. 셀렉트 박스 표시 제어
    const selectors = document.getElementById('date-selectors');
    const monthSelect = document.getElementById('select-month');
    
    if (selectors) selectors.style.display = (category === 'all') ? 'none' : 'flex';
    if (monthSelect) monthSelect.style.display = (category === 'monthly') ? 'inline-block' : 'none';
    
    // 2. 버튼 활성화 스타일 제어
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active')); // 모든 버튼에서 active 제거
    
    if (target) {
        target.classList.add('active'); // 클릭된 버튼에만 active 추가
    } else {
        // 만약 target이 없이 호출되었다면(예: 초기 로드), 첫 번째 버튼을 찾아서 active 추가
        const allBtn = document.querySelector(".filter-btn[onclick*='all']");
        if (allBtn) allBtn.classList.add('active');
    }

    applyDateFilter();
}
// "더보기" 버튼 클릭 시
function loadMore() {
    visibleCount += 20; 
    applyDateFilter();
}

// "처음으로" 버튼 클릭 시
function resetVisibleCount() {
    visibleCount = 20;
    applyDateFilter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function applyDateFilter() {
    showStats(currentCategory);
}

function showStats(category) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // 🔍 1. 입력값 가져오기
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || "";
    const yearEl = document.getElementById('select-year');
    const monthEl = document.getElementById('select-month');
    const selYear = yearEl ? yearEl.value : "";
    const selMonth = monthEl ? monthEl.value : "";

    let filteredData = [];
    let dashboardHTML = "";

    // 📅 2. 카테고리별 날짜 필터링
    if (category === 'all') {
        filteredData = rawData.map(d => ({ ...d, count: d.dates.length }));
    } else if (category === 'yearly') {
        const target = `(${selYear}.`;
        filteredData = rawData.map(item => {
            const yearlyDates = item.dates.filter(d => d.includes(target));
            return { ...item, count: yearlyDates.length };
        }).filter(item => item.count > 0);
    } else if (category === 'monthly') {
        const target = `(${selYear}.${selMonth}.`;
        filteredData = rawData.map(item => {
            const monthlyDates = item.dates.filter(d => d.includes(target));
            return { ...item, count: monthlyDates.length };
        }).filter(item => item.count > 0);
    }

    // 🔍 3. 검색어 필터링 (날짜 필터된 결과에서 검색어 적용)
    if (searchTerm) {
    filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        item.artist.toLowerCase().includes(searchTerm) ||
        (item.genre && item.genre.toLowerCase().includes(searchTerm)) // 장르 검색 조건 추가
    );
}

    // 📊 4. 통계 데이터 계산 (필터링이 완료된 최종 데이터 기준)
    const artistMap = {};
    const genreMap = {};
    const monthCounts = {};
    const yearTarget = `(${selYear}.`;

    filteredData.forEach(d => {
        artistMap[d.artist] = (artistMap[d.artist] || 0) + d.count;
        genreMap[d.genre] = (genreMap[d.genre] || 0) + d.count;
        
        // 연도별 보기일 때만 월별 통계 추가 계산
        if (category === 'yearly') {
            d.dates.filter(date => date.includes(yearTarget)).forEach(date => {
                const m = date.substring(4, 6);
                monthCounts[m] = (monthCounts[m] || 0) + 1;
            });
        }
    });

    const top5Artists = Object.entries(artistMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const totalCountVal = filteredData.reduce((acc, cur) => acc + cur.count, 0);
    const topSong = [...filteredData].sort((a, b) => b.count - a.count)[0];

    // 🖥️ 5. 대시보드 UI 구성
    let statLabel1 = "총 가창 횟수";
    let statLabel3 = "최다 가창 곡";
    let statValue3 = topSong ? topSong.title : "-";

    if (category === 'yearly') {
        statLabel1 = `${selYear}년 가창`;
        const bestMonthEntry = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
        statLabel3 = "가장 많이 부른 달";
        statValue3 = bestMonthEntry ? `${parseInt(bestMonthEntry[0])}월` : "-";
    } else if (category === 'monthly') {
        statLabel1 = `${parseInt(selMonth)}월 가창`;
        statLabel3 = "이달의 아티스트";
        statValue3 = top5Artists[0] ? top5Artists[0][0] : "-";
    }

    dashboardHTML = `
        <div class="stats-grid">
            <div class="stat-item"><span class="stat-label">검색/필터 곡 수</span><span class="stat-value">${filteredData.length}곡</span></div>
            <div class="stat-item"><span class="stat-label">${statLabel1}</span><span class="stat-value">${totalCountVal}회</span></div>
            <div class="stat-item"><span class="stat-label">${statLabel3}</span><span class="stat-value" style="font-size:13px">${statValue3}</span></div>
        </div>
        <div class="chart-section">
            <div class="chart-container"><canvas id="artistChart"></canvas></div>
            <div class="chart-container"><canvas id="genreChart"></canvas></div>
        </div>
    `;

    // 📋 6. 테이블 및 버튼 렌더링
   filteredData.sort((a, b) => b.count - a.count);
const displayData = filteredData.slice(0, visibleCount);

// 차트 아래에 들어갈 검색창 HTML
const searchBarHTML = `
    <div class="search-container" style="margin: 20px 0; display: flex; gap: 8px;">
        <input type="text" id="search-input" placeholder="곡 제목, 가수 또는 장르 검색..."  // <- 문구 수정
               onkeyup="handleSearch(event)" value="${searchTerm}"
               style="flex: 1; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); border-radius: 20px; padding: 10px 15px; color: var(--text-main); outline: none;">
        <button class="search-btn" onclick="applySearch()">검색</button>
    </div>
`;

// 최종 결합: 대시보드(차트포함) + 검색창 + 테이블
contentArea.innerHTML = dashboardHTML + searchBarHTML + `
    <div class="data-table-container">
        <table class="data-table">
            <thead><tr><th>순위</th><th>곡 제목</th><th>가수</th><th>횟수</th></tr></thead>
            <tbody>
                ${displayData.length > 0 ? displayData.map((row, idx) => `
                    <tr onclick="openModal('${encodeURIComponent(row.title)}')">
                        <td>${idx + 1}</td>
                        <td style="color:var(--text-main); font-weight:500;">${row.title}</td>
                        <td>${row.artist}</td>
                        <td>${row.count}회</td>
                    </tr>`).join('') : `<tr><td colspan="4" style="text-align:center; padding:40px; color:var(--text-sub);">결과가 없습니다.</td></tr>`}
            </tbody>
        </table>
    </div>
    ${filteredData.length > visibleCount ? `
        <div style="text-align: center; margin-top: 20px;">
            <button class="filter-btn active" onclick="loadMore()" style="width: 220px;">더보기 (${displayData.length}/${filteredData.length}) ▼</button>
        </div>
    ` : (filteredData.length > 20 ? `
        <div style="text-align: center; margin-top: 20px;">
            <button class="filter-btn" onclick="resetVisibleCount()" style="width: 220px; opacity: 0.7;">처음으로 ▲</button>
        </div>
    ` : '')}
`;

    // 📊 7. 차트 그리기 (DOM 업데이트 후 실행)
    setTimeout(() => renderAllCharts(top5Artists, genreMap), 50);
}

// 3. 차트 렌더링 함수
function renderAllCharts(artists, genres) {
    const ctxArtist = document.getElementById('artistChart');
    const ctxGenre = document.getElementById('genreChart');
    if (!ctxArtist || !ctxGenre) return;

    // 기존 차트 인스턴스가 있으면 삭제 (중복 방지)
    if (artistChartInstance) artistChartInstance.destroy();
    if (genreChartInstance) genreChartInstance.destroy();

    artistChartInstance = new Chart(ctxArtist, {
    type: 'bar', // 그대로 bar로 둡니다.
    data: {
        labels: artists.map(a => a[0]),
        datasets: [{
            label: '가창 횟수',
            data: artists.map(a => a[1]),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: { 
        indexAxis: 'y', // 가로 막대형으로 만드는 핵심 옵션!
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false }, 
            title: { display: true, text: '최다 가창 가수 TOP 5', color: '#fff' } 
        },
        scales: { 
            x: { // 가로축이 수치가 되므로 beginAtZero를 x로 이동
                beginAtZero: true, 
                grid: { color: 'rgba(255,255,255,0.1)' }, 
                ticks: { color: '#aaa' } 
            },
            y: { // 세로축이 이름이 됨
                ticks: { color: '#aaa' } 
            }
        }
    }
});
    genreChartInstance = new Chart(ctxGenre, {
        type: 'doughnut',
        data: {
            labels: Object.keys(genres),
            datasets: [{
                data: Object.values(genres),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                title: { display: true, text: '장르별 점유율', color: '#fff' }, 
                legend: { position: 'bottom', labels: { color: '#ccc', padding: 15, boxWidth: 12 } } 
            }
        }
    });
}
// 팝업 열기
function openModal(encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    // rawData에서 해당 곡 찾기
    const song = rawData.find(item => item.title === title);
    
    if (!song) return;

    // 🎵 아이콘 추가 및 곡 제목 업데이트
    document.getElementById('modal-title').innerHTML = `🎵 ${song.title}`;
    
    // 🎤 아이콘 추가 및 가수가 어두울 경우 대비해 직접 스타일(밝은색) 지정
    const artistElement = document.getElementById('modal-artist');
    artistElement.innerHTML = `${song.artist}`;
    artistElement.style.color = "#ffffff"; // 가수 이름을 밝은 흰색으로 강제 지정
    artistElement.style.fontWeight = "bold";

    // 횟수 아이콘 추가
    document.getElementById('modal-count').innerText = song.dates.length;

    // 날짜 목록 생성
    const dateContainer = document.getElementById('modal-dates');
    dateContainer.innerHTML = song.dates.map(d => 
        `<span class="date-tag">${d.replace(/[()]/g, '')}</span>`
    ).join('');

    document.getElementById('song-modal').style.display = 'flex';
}

// 팝업 닫기
function closeModal() {
    document.getElementById('song-modal').style.display = 'none';
}

// 배경 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('song-modal');
    if (event.target == modal) {
        closeModal();
    }
}
// 엔터키 입력 처리
function handleSearch(event) {
    if (event.key === 'Enter') {
        applySearch();
    }
}

// 검색 버튼 클릭 시 호출
function applySearch() {
    visibleCount = 20; // 검색 결과는 처음부터 보여줌
    applyDateFilter(); // 현재 필터 상태(전체/월별/연도별) 유지하며 검색 적용
}

window.onload = loadSheetData;
