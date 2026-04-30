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
            // 6개 열(다시보기 주소 포함)을 체크하지만, 주소가 없을 수도 있으므로 유연하게 처리
            if (columns.length < 5) return null;
            
            // 데이터 매핑 (6번째 열 추가)
            let [date, time, type, title, content, replayUrl] = columns.map(col => col ? col.trim() : "");

            if (!date || date === "") {
                date = lastValidDate;
            } else {
                lastValidDate = date;
            }

            if (!date) return null;

            const formattedDate = '20' + date.replace(/\./g, '-');

            if (title === "-" || type === "휴방") {
                title = (type === "휴방") ? "휴방" : ""; 
            }

            return { 
                date: formattedDate, 
                time: time === "-" ? "" : time,
                type: type, 
                title: title, 
                content: content === "-" ? "" : content,
                replayUrl: replayUrl // 다시보기 주소 저장
            };
        }).filter(ev => ev && (ev.title !== "" || ev.type === "휴방"));

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
    }
}

function renderCalendar(yearMonth) {
    const [year, month] = yearMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();
    
    document.getElementById('current-month-display').innerText = `${year}년 ${month}월`;
    const body = document.getElementById('calendar-body');
    body.innerHTML = '';

    ['일','월','화','수','목','금','토'].forEach(d => {
        const div = document.createElement('div');
        div.className = 'day-label';
        div.innerText = d;
        body.appendChild(div);
    });

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'other-month';
        body.appendChild(emptyDiv);
    }

    for (let d = 1; d <= lastDate; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cell = document.createElement('div');
        
        const realToday = new Date();
        if (realToday.getFullYear() === year && (realToday.getMonth() + 1) === month && realToday.getDate() === d) {
            cell.classList.add('today');
        }

        cell.innerHTML = `
            <div class="date-header"><span class="date-num">${d}</span></div>
            <div class="date-divider"></div> 
        `;

        const dayEvents = allEvents.filter(e => e.date === dateStr);
        
        dayEvents.forEach(ev => {
    const evDiv = document.createElement('div');
    
    if (ev.type === "휴방") {
        evDiv.className = "event-item off-day";
        evDiv.innerHTML = `<div class="event-title" style="color: var(--text-sub); opacity: 0.7; font-size: 0.75rem;">🚫 휴방</div>`;
    } else {
        evDiv.className = `event-item clickable`;
        evDiv.onclick = () => openModal(ev);

        // 태그 로직 유지
        const allTags = ev.content ? ev.content.split(',').map(tag => tag.trim()).filter(tag => tag !== "") : [];
        const limit = 2;
        let tagsHtml = "";

        if (allTags.length > 0) {
            const visibleTags = allTags.slice(0, limit);
            const remainingCount = allTags.length - limit;
            tagsHtml = visibleTags.map(tag => `<span class="hash-tag">#${tag}</span>`).join('');
            if (remainingCount > 0) {
                tagsHtml += `<span class="hash-tag tag-more-box">+${remainingCount}</span>`;
            }
        }

        // [변경점] .event-title 제거
        evDiv.innerHTML = `
            // renderCalendar 안의 evDiv.innerHTML 생성 부분
<div class="event-meta">
    ${ev.time ? `
        <div class="event-time" style="${ev.time === '이어서' ? 'font-style: italic; color: var(--text-sub);' : ''}">
            ${ev.time}
        </div>
    ` : ''}
    <span class="type-badge type-${ev.type}">${ev.type}</span>
</div>
            <div class="tag-container" style="margin-top: 4px;">${tagsHtml}</div>
        `;
    }
    cell.appendChild(evDiv);
});
        body.appendChild(cell);
    }
}

// --- 모달 제어 함수 수정 ---
function openModal(ev) {
    const modal = document.getElementById('event-modal');
    document.getElementById('modal-type').className = `type-badge type-${ev.type}`;
    document.getElementById('modal-type').innerText = ev.type;
    document.getElementById('modal-date').innerText = ev.date.replace(/-/g, '.');
    document.getElementById('modal-title').innerText = ev.title;
    document.getElementById('modal-time').innerText = ev.time ? `방송 시작 시간: ${ev.time}` : '시간 정보 없음';
    
    // 태그 전체 표시
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = ev.content 
        ? ev.content.split(',').map(tag => `<span class="hash-tag">#${tag.trim()}</span>`).join('') 
        : '';

    // --- 다시보기 버튼 처리 ---
    const replayBtnContainer = document.getElementById('modal-replay-container');
    if (ev.replayUrl && ev.replayUrl !== "" && ev.replayUrl !== "-") {
        replayBtnContainer.innerHTML = `
            <a href="${ev.replayUrl}" target="_blank" class="btn replay-btn">
                <span>🎬 다시보기 보러가기</span>
            </a>
        `;
    } else {
        replayBtnContainer.innerHTML = ''; // 주소가 없으면 버튼 안 보임
    }

    modal.style.display = 'flex';
}

// 이벤트 리스너 등록
document.querySelector('.modal-close-btn').onclick = () => {
    document.getElementById('event-modal').style.display = 'none';
};

window.onclick = (event) => {
    const modal = document.getElementById('event-modal');
    if (event.target === modal) modal.style.display = 'none';
};

document.getElementById('month-select').addEventListener('change', (e) => renderCalendar(e.target.value));

fetchSchedule();
