const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQmWkxsDxTFSxtnLX0nBapwtNcSW9FQiTDv61z9F89_lqZNq5pKGgmuaAKGo5Fd1r4_hfDtxSqSYdpf/pub?gid=0&single=true&output=tsv";

let rawData = []; 
let currentCategory = 'all';

async function loadSheetData() {
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

        // 데이터 기반으로 선택창 목록 생성
        initDynamicSelectors(); 
        showStats('all');
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
}

// 1. 실제 데이터가 있는 연도만 추출하여 연도 셀렉트 박스 생성
function initDynamicSelectors() {
    const yearSelect = document.getElementById('select-year');
    const availableYears = new Set();
    
    rawData.forEach(item => {
        item.dates.forEach(dateStr => {
            const year = dateStr.substring(1, 3); // (26.04.24) -> 26
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

    // 연도 로드 후 해당 연도에 맞는 월 목록 로드
    updateMonthSelector();
}

// 2. 선택된 연도 내에서 데이터가 있는 월만 추출하여 월 셀렉트 박스 생성
function updateMonthSelector() {
    const yearSelect = document.getElementById('select-year');
    const monthSelect = document.getElementById('select-month');
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

// 연도 변경 시 실행
function onYearChange() {
    updateMonthSelector();
    applyDateFilter();
}

// 필터 카테고리(전체/월별/연도별) 변경
function updateDateFilter(category) {
    currentCategory = category;
    const selectors = document.getElementById('date-selectors');
    const monthSelect = document.getElementById('select-month');
    
    selectors.style.display = 'flex';
    monthSelect.style.display = (category === 'monthly') ? 'inline-block' : 'none';
    
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }

    applyDateFilter();
}

function applyDateFilter() {
    showStats(currentCategory);
}

function showStats(category) {
    // '전체' 탭일 경우 날짜 선택창 숨김 및 버튼 활성화 제어
    if (category === 'all') {
        document.getElementById('date-selectors').style.display = 'none';
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        if(buttons[0]) buttons[0].classList.add('active');
    }

    const yearEl = document.getElementById('select-year');
    const monthEl = document.getElementById('select-month');
    const selYear = yearEl ? yearEl.value : "";
    const selMonth = monthEl ? monthEl.value : "";

    let filteredData = [];
    let summary = [];

    if (category === 'all') {
        filteredData = rawData.map(d => ({...d, count: d.dates.length}));
        const artistCount = {};
        filteredData.forEach(d => artistCount[d.artist] = (artistCount[d.artist] || 0) + d.count);
        const topArtist = Object.entries(artistCount).sort((a,b) => b[1] - a[1])[0];

        summary = [
            { label: "전체 누적 횟수", value: `${filteredData.reduce((acc, cur) => acc + cur.count, 0)}회` },
            { label: "등록된 곡 종류", value: `${filteredData.length}곡` },
            { label: "가장 많이 부른 가수", value: topArtist ? topArtist[0] : "-" }
        ];
    } 
    else if (category === 'monthly') {
        const target = `(${selYear}.${selMonth}.`; 
        filteredData = rawData.map(item => {
            const monthlyDates = item.dates.filter(d => d.includes(target));
            return { ...item, count: monthlyDates.length };
        }).filter(item => item.count > 0);

        summary = [
            { label: `20${selYear}년 ${selMonth}월 합계`, value: `${filteredData.reduce((acc, cur) => acc + cur.count, 0)}회` },
            { label: "이달의 노래", value: filteredData.length > 0 ? filteredData.sort((a,b)=>b.count-a.count)[0].title : "-" }
        ];
    }
    else if (category === 'yearly') {
        const target = `(${selYear}.`;
        filteredData = rawData.map(item => {
            const yearlyDates = item.dates.filter(d => d.includes(target));
            return { ...item, count: yearlyDates.length };
        }).filter(item => item.count > 0);

        // 연도별 데이터 내에서 가수별 횟수 재집계
        const yearlyArtistCount = {};
        filteredData.forEach(d => {
            yearlyArtistCount[d.artist] = (yearlyArtistCount[d.artist] || 0) + d.count;
        });
        
        // 가장 많이 부른 가수 추출
        const topArtistEntry = Object.entries(yearlyArtistCount).sort((a, b) => b[1] - a[1])[0];
        const topArtistName = topArtistEntry ? topArtistEntry[0] : "-";

        summary = [
            { label: `20${selYear}년 총 합계`, value: `${filteredData.reduce((acc, cur) => acc + cur.count, 0)}회` },
            { label: "올해 가장 많이 부른 가수", value: topArtistName },
            { label: "올해 부른 곡 수", value: `${filteredData.length}곡` }
        ];
    }

    filteredData.sort((a, b) => b.count - a.count);

    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="stats-grid">
            ${summary.map(item => `
                <div class="stat-item">
                    <span class="stat-label">${item.label}</span>
                    <span class="stat-value">${item.value}</span>
                </div>
            `).join('')}
        </div>
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr><th>순위</th><th>곡 제목</th><th>가수</th><th>횟수</th></tr>
                </thead>
                <tbody>
                    ${filteredData.length > 0 ? 
                        filteredData.map((row, idx) => `
                        <tr><td>${idx + 1}</td><td>${row.title}</td><td>${row.artist}</td><td>${row.count}회</td></tr>
                        `).join('') : `<tr><td colspan="4" style="text-align:center; padding:20px;">해당 기간의 데이터가 없습니다.</td></tr>`
                    }
                </tbody>
            </table>
        </div>
    `;
}

window.onload = loadSheetData;
