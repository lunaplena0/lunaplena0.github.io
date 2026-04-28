// 1. 일정 데이터 (여기에 일정을 추가하세요)
    const eventData = {
        "2024-05-01": [{ title: "정기 뱅송", color: "#5d5fef" }],
        "2024-05-06": [{ title: "유튜브 업로드", color: "#ff9f43" }],
        "2024-05-15": [{ title: "합방 일정", color: "#2ecc71" }],
        "2024-04-10": [{ title: "4월 특별방송", color: "#e74c3c" }]
    };

    const calendarBody = document.getElementById('calendar-body');
    const monthSelect = document.getElementById('month-select');
    const monthDisplay = document.getElementById('current-month-display');

    function renderCalendar(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number);
        const firstDay = new Date(year, month - 1, 1).getDay();
        const lastDate = new Date(year, month, 0).getDate();
        
        monthDisplay.innerText = `${year}년 ${month}월`;
        calendarBody.innerHTML = ''; // 초기화

        // 요일 생성
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        days.forEach(d => {
            const div = document.createElement('div');
            div.className = 'day-label';
            div.innerText = d;
            calendarBody.appendChild(div);
        });

        // 빈칸 (지난달)
        for (let i = 0; i < firstDay; i++) {
            const div = document.createElement('div');
            div.className = 'other-month';
            calendarBody.appendChild(div);
        }

        // 날짜 생성
        for (let date = 1; date <= lastDate; date++) {
            const dateCell = document.createElement('div');
            dateCell.className = 'date-cell';
            
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            
            // 오늘 날짜 표시 (실제 오늘 기준)
            const today = new Date();
            if(today.getFullYear() === year && today.getMonth()+1 === month && today.getDate() === date) {
                dateCell.classList.add('today');
            }

            let html = `<span class="date-num">${date}</span>`;
            
            // 일정 데이터 매칭
            if (eventData[dateStr]) {
                eventData[dateStr].forEach(ev => {
                    html += `<div class="event" style="background-color: ${ev.color}">${ev.title}</div>`;
                });
            }

            dateCell.innerHTML = html;
            calendarBody.appendChild(dateCell);
        }
    }

    // 선택 박스 변경 이벤트
    monthSelect.addEventListener('change', (e) => {
        renderCalendar(e.target.value);
    });

    // 초기 실행 (5월)
    renderCalendar('2024-05');
