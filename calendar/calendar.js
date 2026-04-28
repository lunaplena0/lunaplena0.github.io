const TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT8obAx_3kA2YbdK5stQqyyWWgnakjlEjLXjS6hLzQRU5gb4XeewNQUVpxkDQtQGyivJAG86GqxziOn/pub?gid=0&single=true&output=tsv';
let allEvents = [];

async function fetchSchedule() {
    try {
        const response = await fetch(TSV_URL);
        const data = await response.text();
        const rows = data.split('\n').slice(1);

        allEvents = rows.map(row => {
            const columns = row.split('\t');
            if (columns.length < 4) return null;
            const [date, type, title, content] = columns;
            
            // '26.04.28' -> '2026-04-28' 변환
            const formattedDate = '20' + date.trim().replace(/\./g, '-');
            return { date: formattedDate, type: type.trim(), title: title.trim(), content: content.trim() };
        }).filter(Boolean);

        // 1. 데이터가 있는 모든 월 추출 (중복 제거)
        const availableMonths = [...new Set(allEvents.map(e => e.date.substring(0, 7)))].sort();

        if (availableMonths.length > 0) {
            const monthSelect = document.getElementById('month-select');
            monthSelect.innerHTML = ''; // 기존 옵션 초기화

            // 2. 셀렉트 박스 옵션 동적 생성
            availableMonths.forEach(ym => {
                const [y, m] = ym.split('-');
                const option = document.createElement('option');
                option.value = ym;
                option.innerText = `${y}년 ${m}월`;
                monthSelect.appendChild(option);
            });

            // 3. 가장 마지막 월(최신 데이터가 있는 월)을 기본값으로 설정
            const latestMonth = availableMonths[availableMonths.length - 1];
            monthSelect.value = latestMonth;
            renderCalendar(latestMonth);
        } else {
            document.getElementById('current-month-display').innerText = "등록된 일정이 없습니다.";
        }
        
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        document.getElementById('current-month-display').innerText = "데이터를 불러올 수 없습니다.";
    }
}

function renderCalendar(yearMonth) {
    const [year, month] = yearMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();
    
    document.getElementById('current-month-display').innerText = `${year}년 ${month}월`;
    const body = document.getElementById('calendar-body');
    body.innerHTML = '';

    // 요일 헤더
    ['일','월','화','수','목','금','토'].forEach(d => {
        const div = document.createElement('div');
        div.className = 'day-label';
        div.innerText = d;
        body.appendChild(div);
    });

    // 시작 빈칸
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'other-month';
        body.appendChild(emptyDiv);
    }

    // 날짜 채우기
    for (let d = 1; d <= lastDate; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cell = document.createElement('div');
        
        const realToday = new Date();
        if (realToday.getFullYear() === year && (realToday.getMonth() + 1) === month && realToday.getDate() === d) {
            cell.classList.add('today');
        }

        // --- 1. 날짜와 유형을 한 줄에 배치 ---
        const dayEvents = allEvents.filter(e => e.date === dateStr);
        // 해당 날짜에 일정이 있다면 첫 번째 일정의 유형을 가져옴
        const firstEventType = dayEvents.length > 0 ? dayEvents[0].type : '';
        const typeBadge = firstEventType ? `<span class="type-badge type-${firstEventType}">${firstEventType}</span>` : '';
        
        cell.innerHTML = `
            <div class="date-header">
                <span class="date-num">${d}</span>
                ${typeBadge}
            </div>
        `;

        // --- 2. 일정 제목 및 태그 렌더링 ---
        dayEvents.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = `event-item`;

            // 컨텐츠 종류를 쉼표(,)로 나누어 #태그 생성
            const tagsHtml = ev.content.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== "")
                .map(tag => `<span class="hash-tag">#${tag}</span>`)
                .join('');

            evDiv.innerHTML = `
                <div class="event-title">${ev.title}</div>
                <div class="tag-container">${tagsHtml}</div>
            `;
            cell.appendChild(evDiv);
        });

        body.appendChild(cell);
    }
}

document.getElementById('month-select').addEventListener('change', (e) => renderCalendar(e.target.value));
fetchSchedule();

fetchSchedule();
