// 구글 시트 TSV URL
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQmWkxsDxTFSxtnLX0nBapwtNcSW9FQiTDv61z9F89_lqZNq5pKGgmuaAKGo5Fd1r4_hfDtxSqSYdpf/pub?gid=0&single=true&output=tsv";

let rawData = []; // 시트에서 가져온 원본 데이터

// 1. 데이터 로드 함수
async function loadSheetData() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // TSV 파싱 (줄바꿈으로 나누고 탭으로 나누기)
        const rows = data.split('\n').map(row => row.split('\t'));
        
        // 첫 줄(헤더) 제외하고 객체 배열로 변환
        // 구조: 노래제목, 가수, 장르, 부른날짜
        rawData = rows.slice(1).map(row => {
            const dates = row[3] ? row[3].match(/\(\d{2}\.\d{2}\.\d{2}\)/g) || [] : [];
            return {
                title: row[0]?.trim(),
                artist: row[1]?.trim(),
                genre: row[2]?.trim(),
                dates: dates, // ['(26.01.01)', '(26.01.05)'] 형태
                count: dates.length
            };
        }).filter(item => item.title); // 빈 행 제거

        showStats('all'); // 초기 화면 표시
    } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error);
        document.getElementById('content-area').innerHTML = "<p style='text-align:center;'>데이터를 로드할 수 없습니다.</p>";
    }
}

// 2. 통계 계산 및 화면 렌더링
function showStats(category) {
    // 버튼 활성화 UI 처리
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    // 클릭 이벤트가 있는 경우에만 활성화 (초기 로드 시 예외 처리)
    if(event) event.currentTarget.classList.add('active');

    const now = new Date();
    const currentYear = String(now.getFullYear()).slice(-2); // '26'
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0'); // '04'

    let filteredData = [];
    let summary = [];

    if (category === 'all') {
        filteredData = [...rawData];
        // 많이 부른 가수 찾기
        const artistCount = {};
        filteredData.forEach(d => artistCount[d.artist] = (artistCount[d.artist] || 0) + d.count);
        const topArtist = Object.entries(artistCount).sort((a,b) => b[1] - a[1])[0];

        summary = [
            { label: "총 부른 곡 수", value: `${filteredData.reduce((acc, cur) => acc + cur.count, 0)}회` },
            { label: "등록된 곡 종류", value: `${filteredData.length}곡` },
            { label: "가장 많이 부른 가수", value: topArtist ? topArtist[0] : "-" }
        ];
    } 
    else if (category === 'monthly') {
        const targetPattern = `(${currentYear}.${currentMonth}.`; // (26.04. 형태 찾기
        filteredData = rawData.map(item => {
            const monthlyDates = item.dates.filter(d => d.includes(targetPattern));
            return { ...item, count: monthlyDates.length };
        }).filter(item => item.count > 0);

        summary = [
            { label: `${currentMonth}월 총 횟수`, value: `${filteredData.reduce((acc, cur) => acc + cur.count, 0)}회` },
            { label: "이달의 노래", value: filteredData[0] ? filteredData.sort((a,b)=>b.count-a.count)[0].title : "-" }
        ];
    }
    else if (category === 'yearly') {
        const targetPattern = `(${currentYear}.`; // (26. 형태 찾기
        filteredData = rawData.map(item => {
            const yearlyDates = item.dates.filter(d => d.includes(targetPattern));
            return { ...item, count: yearlyDates.length };
        }).filter(item => item.count > 0);

        summary = [
            { label: `20${currentYear}년 총 횟수`, value: `${filteredData.reduce((acc, cur) => acc + cur.count, 0)}회` },
            { label: "올해의 장르", value: "계산 중..." } // 필요 시 장르 집계 로직 추가 가능
        ];
    }

    // 순위 정렬 (횟수 내림차순)
    filteredData.sort((a, b) => b.count - a.count);

    // HTML 생성
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
                    <tr>
                        <th>순위</th>
                        <th>곡 제목</th>
                        <th>가수</th>
                        <th>횟수</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map((row, idx) => `
                        <tr>
                            <td>${idx + 1}</td>
                            <td>${row.title}</td>
                            <td>${row.artist}</td>
                            <td>${row.count}회</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 페이지 로드 시 실행
window.onload = loadSheetData;
