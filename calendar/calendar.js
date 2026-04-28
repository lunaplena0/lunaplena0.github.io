const TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT8obAx_3kA2YbdK5stQqyyWWgnakjlEjLXjS6hLzQRU5gb4XeewNQUVpxkDQtQGyivJAG86GqxziOn/pub?gid=0&single=true&output=tsv';
    let allEvents = [];

    // 1. 데이터 가져오기
    async function fetchSchedule() {
        try {
            const response = await fetch(TSV_URL);
            const data = await response.text();
            const rows = data.split('\n').slice(1); // 헤더 제외

            allEvents = rows.map(row => {
                const [date, type, title, content] = row.split('\t');
                if (!date) return null;
                
                // '26.04.28' -> '2026-04-28' 변환
                const formattedDate = '20' + date.trim().replace(/\./g, '-');
                return { date: formattedDate, type: type.trim(), title: title.trim(), content: content.trim() };
            }).filter(Boolean);

            renderCalendar(document.getElementById('month-select').value);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
            document.getElementById('current-month-display').innerText = "데이터를 불러올 수 없습니다.";
        }
    }

    // 2. 달력 그리기
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
            body.appendChild(document.createElement('div'));
        }

        // 날짜 채우기
        for (let d = 1; d <= lastDate; d++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const cell = document.createElement('div');
            cell.innerHTML = `<span class="date-num">${d}</span>`;

            // 해당 날짜 일정 필터링
            const dayEvents = allEvents.filter(e => e.date === dateStr);
            dayEvents.forEach(ev => {
                const evDiv = document.createElement('div');
                evDiv.className = `event type-${ev.type}`;
                evDiv.innerHTML = `
                    <strong>[${ev.type}]</strong> ${ev.title}
                    <span class="content-tag">${ev.content}</span>
                `;
                cell.appendChild(evDiv);
            });

            body.appendChild(cell);
        }
    }

    // 이벤트 리스너
    document.getElementById('month-select').addEventListener('change', (e) => renderCalendar(e.target.value));

    // 실행
    fetchSchedule();
