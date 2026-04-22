// 1. 통계 데이터 정의 (나중에 이 부분을 수정하여 데이터를 업데이트하세요)
const statsData = {
    all: {
        summary: [
            { label: "총 곡 수", value: "154곡" },
            { label: "최다 가수", value: "아이유" },
            { label: "최다 장르", value: "J-POP" }
        ],
        table: [
            { rank: 1, title: "밤양갱", artist: "비비", count: "12회" },
            { rank: 2, title: "Hype Boy", artist: "NewJeans", count: "9회" },
            { rank: 3, title: "Ditto", artist: "NewJeans", count: "8회" }
        ]
    },
    monthly: {
        summary: [
            { label: "이달의 곡 수", value: "12곡" },
            { label: "이번 달 가수", value: "데이식스" },
            { label: "기록 날짜", value: "2024.05" }
        ],
        table: [
            { rank: 1, title: "한 페이지가 될 수 있게", artist: "DAY6", count: "5회" },
            { rank: 2, title: "Welcome to the Show", artist: "DAY6", count: "4회" }
        ]
    },
    yearly: {
        summary: [
            { label: "2024년 총 곡", value: "85곡" },
            { label: "올해의 아티스트", value: "QWER" },
            { label: "최고 시청자 수", value: "2,400명" }
        ],
        table: [
            { rank: 1, title: "고민중독", artist: "QWER", count: "21회" },
            { rank: 2, title: "Discord", artist: "QWER", count: "18회" }
        ]
    }
};

// 2. 화면 렌더링 함수
function showStats(category) {
    // 버튼 활성화 상태 변경
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const data = statsData[category];
    const contentArea = document.getElementById('content-area');

    // HTML 구조 생성
    let html = `
        <div class="stats-grid">
            ${data.summary.map(item => `
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
                    ${data.table.map(row => `
                        <tr>
                            <td>${row.rank}</td>
                            <td>${row.title}</td>
                            <td>${row.artist}</td>
                            <td>${row.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    contentArea.innerHTML = html;
}

// 초기화: 첫 화면은 '전체' 통계로 표시
window.onload = () => {
    // 만약 초기 로딩 시 첫 번째 버튼을 클릭된 상태로 만들고 싶다면:
    // showStats('all');
};
