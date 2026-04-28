const TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT8obAx_3kA2YbdK5stQqyyWWgnakjlEjLXjS6hLzQRU5gb4XeewNQUVpxkDQtQGyivJAG86GqxziOn/pub?gid=0&single=true&output=tsv';
let allEvents = [];

async function fetchSchedule() {
    try {
        const response = await fetch(TSV_URL);
        const data = await response.text();
        const rows = data.split('\n').slice(1);

        let lastValidDate = ""; 

        allEvents = rows.map(row => {
            const columns = row.split('\t');
            if (columns.length < 5) return null;
            
            let [date, time, type, title, content] = columns.map(col => col ? col.trim() : "");

            // 1. 날짜 상속 로직
            if (!date || date === "") {
                date = lastValidDate;
            } else {
                lastValidDate = date;
            }

            if (!date) return null;

            // 2. 날짜 포맷 변환 (26.04.28 -> 2026-04-28)
            const formattedDate = '20' + date.replace(/\./g, '-');

            // 3. 휴방 및 "-" 처리
            if (title === "-" || type === "휴방") {
                title = (type === "휴방") ? "휴방" : ""; 
            }

            return { 
                date: formattedDate, 
                time: time === "-" ? "" : time,
                type: type, 
                title: title, 
                content: content === "-" ? "" : content 
            };
        }).filter(ev => ev && (ev.title !== "" || ev.type === "휴방"));

        // 4. 월 선택기(Select) 업데이트
        const availableMonths = [...new Set(allEvents.map(e => e.date.substring(0, 7)))].sort();
        if (availableMonths.length > 0) {
            const monthSelect = document.getElementById('month-select');
            monthSelect.innerHTML = ''; 
            availableMonths.forEach(ym => {
                const [y, m] = ym.split('-');
                const option = document.createElement('option');
                option.value = ym;
                option.innerText = `${y}년 ${m}월`;
                monthSelect.appendChild(option);
            });

            const latestMonth = availableMonths[availableMonths.length - 1];
            monthSelect.value = latestMonth;
            renderCalendar(latestMonth);
        } else {
            document.getElementById('current-month-display').innerText = "등록된 일정이 없습니다.";
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        document.getElementById('current-month-display').innerText = "데이터 로드 실패";
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
    
    // 오늘 표시 로직
    const realToday = new Date();
    if (realToday.getFullYear() === year && (realToday.getMonth() + 1) === month && realToday.getDate() === d) {
        cell.classList.add('today');
    }

    // --- 날짜 헤더와 아래 일정 사이에 선(divider) 추가 ---
    cell.innerHTML = `
        <div class="date-header">
            <span class="date-num">${d}</span>
        </div>
        <div class="date-divider"></div> 
    `;

    const dayEvents = allEvents.filter(e => e.date === dateStr);
    
    dayEvents.forEach(ev => {
            // 휴방 처리
            if (ev.type === "휴방") {
                const offDiv = document.createElement('div');
                offDiv.className = "event-item off-day";
                offDiv.innerHTML = `<div class="event-title" style="color: #ff4757; font-weight: bold;">🚫 휴방</div>`;
                cell.appendChild(offDiv);
                return;
            }

            const evDiv = document.createElement('div');
            evDiv.className = `event-item`;

            const tagsHtml = ev.content ? ev.content.split(',')
                .map(tag => `<span class="hash-tag">#${tag.trim()}</span>`).join('') : '';

            // --- 시간 옆에 방송유형 배지 배치 ---
            // calendar.js 내 렌더링 부분 수정 예시
evDiv.innerHTML = `
    <div class="event-meta" style="display: flex; align-items: center; gap: 5px; margin-bottom: 3px;">
        ${ev.time ? `<div class="event-time" style="margin-bottom:0;">${ev.time}</div>` : ''}
        <span class="type-badge type-${ev.type}" style="font-size: 0.6rem; padding: 1px 4px;">${ev.type}</span>
    </div>
    <div class="event-title" title="${ev.title}">${ev.title}</div>
    <div class="tag-container">${tagsHtml}</div>
`;
            cell.appendChild(evDiv);
        });
        body.appendChild(cell);
    }
}

document.getElementById('month-select').addEventListener('change', (e) => renderCalendar(e.target.value));

// 실행
fetchSchedule();
