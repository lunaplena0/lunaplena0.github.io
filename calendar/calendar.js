const TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT8obAx_3kA2YbdK5stQqyyWWgnakjlEjLXjS6hLzQRU5gb4XeewNQUVpxkDQtQGyivJAG86GqxziOn/pub?gid=0&single=true&output=tsv';
let allEvents = [];

async function fetchSchedule() {
    // --- [로딩 시작 코드 추가] ---
    const overlay = document.getElementById('loading-overlay');
    if (typeof prepareWaveText === "function") {
        prepareWaveText("일정들을 확인하고 있어요 . . .");
    }
    // -------------------------
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

            // [수정 후]
if (title === "-") {
    title = ""; 
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

            // [수정된 부분] 오늘 날짜 구하기
            const now = new Date();
            const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            // 오늘 날짜가 달력 데이터에 있는지 확인 (있으면 그 달을, 없으면 마지막 달을 선택)
            const targetMonth = availableMonths.includes(currentYearMonth) 
                                ? currentYearMonth 
                                : availableMonths[availableMonths.length - 1];

            monthSelect.value = targetMonth;
            renderCalendar(targetMonth);
        } else {
            document.getElementById('current-month-display').innerText = "등록된 일정이 없습니다.";
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    } finally {
        // 데이터 로드가 끝났을 때
        if (overlay) {
            // 1. 살짝 대기 후 페이드아웃 시작 (너무 빨리 사라지면 어색함)
            setTimeout(() => {
                overlay.style.opacity = '0';
                overlay.style.visibility = 'hidden'; // 투명해짐과 동시에 클릭 차단 해제
                
                // 2. 완전히 사라진 후(0.5초 뒤) 스크롤 허용 및 정리
                setTimeout(() => {
                    document.body.style.overflow = 'auto'; 
                    // 필요하다면 아예 요소를 제거하거나 display none 처리
                    // overlay.style.display = 'none'; 
                }, 500);
            }, 800);
        }
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
    
    // 1. 모든 아이템에 공통 클래스 및 클릭 이벤트 부여
    evDiv.className = `event-item clickable`;
    evDiv.onclick = (e) => {
        e.stopPropagation();
        openModal(ev);
    };

    // 2. 태그 처리 (휴방은 태그가 없을 테니 빈 값 유지)
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

   // 제목을 보여줄 타입들 (여기에 추가하고 싶은 타입을 넣으세요)
    const showTitleTypes = ["결과발표", "공방참여", "기타", "드롭스", "휴방"];

    // 1. 해당 타입이고 + 제목이 있을 때만 제목 HTML 생성
    const titleHtml = (showTitleTypes.includes(ev.type) && ev.title) 
        ? `<div class="event-title-summary">${ev.title}</div>` 
        : '';
    // 3. HTML 구조 통일 (휴방도 동일하게 뱃지가 표시됨)
    evDiv.innerHTML = `
    <div class="event-meta pc-only">
        ${ev.time ? `<div class="event-time" style="${ev.time === '이어서' ? 'font-style: italic; color: var(--text-sub);' : ''}">${ev.time}</div>` : ''}
        <span class="type-badge type-${ev.type}">${ev.type}</span>
    </div>
    ${titleHtml ? `<div class="pc-only" style="margin-top:2px;">${titleHtml}</div>` : ''}
    
    <div class="mobile-only mobile-event-info">
        ${ev.time ? `<div class="mobile-time">${ev.time}</div>` : ''}
        <div class="mobile-type color-${ev.type}">${ev.type}</div>
        ${titleHtml} 
    </div>

    <div class="tag-container pc-only" style="margin-top: 4px;">${tagsHtml}</div>
`;
    
    cell.appendChild(evDiv);
});
        body.appendChild(cell);
    }
    
// [추가 코드] 달력의 마지막 주 빈칸 채우기 (grid 완성)
    const totalCells = firstDay + lastDate;
    const remainingCells = (7 - (totalCells % 7)) % 7;

    for (let i = 0; i < remainingCells; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'other-month'; // 이 클래스 덕분에 배경색이 어둡게 고정됩니다!
        body.appendChild(emptyDiv);
    }
}

// --- 모달 제어 함수 수정 ---
function openModal(ev) {
    const modal = document.getElementById('event-modal');
    document.getElementById('modal-type').className = `type-badge type-${ev.type}`;
    document.getElementById('modal-type').innerText = ev.type;
    document.getElementById('modal-date').innerText = ev.date.replace(/-/g, '.');
    document.getElementById('modal-title').innerText = ev.title;
    document.getElementById('modal-time').innerText = ev.time ? `방송 시작 시간 : ${ev.time}` : '시간 정보 없음';
    
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
