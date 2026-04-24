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

        initSelectors(); // 선택 박스 초기화
        showStats('all');
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
}

// 연도 및 월 선택 박스 초기화
function initSelectors() {
    const yearSelect = document.getElementById('select-year');
    const monthSelect = document.getElementById('select-month');
    
    // 2024년부터 2026년까지 (필요시 조정)
    for (let i = 24; i <= 26; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = `20${i}년`;
        yearSelect.appendChild(opt);
    }
    yearSelect.value = "26"; // 기본값 26년

    for (let i = 1; i <= 12; i++) {
        let opt = document.createElement('option');
        opt.value = String(i).padStart(2, '0');
        opt.innerHTML = `${i}월`;
        monthSelect.appendChild(opt);
    }
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    monthSelect.value = currentMonth;
}

// 필터 버튼 클릭 시 호출
function updateDateFilter(category) {
    currentCategory = category;
    const selectors = document.getElementById('date-selectors');
    const monthSelect = document.getElementById('select-month');
    
    selectors.style.display = 'flex';
    monthSelect.style.display = (category === 'monthly') ? 'inline-block' : 'none';
    
    // 버튼 활성화 처리
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    applyDateFilter();
}

function applyDateFilter() {
    showStats(currentCategory);
}

function showStats(category) {
    if (category === 'all') {
        document.getElementById('date-selectors').style.display = 'none';
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        buttons[0].classList.add('active');
    }

    const selYear = document.getElementById('select-year').value;
    const selMonth = document.getElementById('select-month').value;

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
            { label: `20${selYear}년 ${selMonth}월 총 합계`, value: `${filteredData.reduce((acc, cur) => acc + cur.count, 0)}회` },
            { label: "이달의 노래", value: filteredData.length > 0 ? filteredData.sort((a,b)=>b.count-a.count)[0].title : "-" }
        ];
    }
    else if (category === 'yearly') {
        const target = `(${selYear}.`;
        filteredData = rawData.map(item => {
            const yearlyDates = item.dates.filter(d => d.includes(target));
            return { ...item, count: yearlyDates.length };
        }).filter(item => item.count > 0);

        summary = [
            { label: `20${selYear}년 총 합계`, value: `${filteredData.reduce((acc, cur) => acc + cur.count, 0)}회` },
            { label: "해당 연도 곡 수", value: `${filteredData.length}곡` }
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
                        `).join('') : `<tr><td colspan="4" style="text-align:center; padding:20px;">데이터가 없습니다.</td></tr>`
                    }
                </tbody>
            </table>
        </div>
    `;
}

window.onload = loadSheetData;
