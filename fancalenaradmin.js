let allEvents = [];
let currentDate = new Date();
let activeEditingDate = "";

async function loadCalendarSettingsData() {
    const statusEl = document.getElementById('calendar-status');
    statusEl.textContent = "데이터를 불러오는 중...";
    statusEl.style.color = "#0077b6";

    try {
        const response = await fetch(WORKER_URL + "?type=fancalenar&t=" + Date.now());
        if (!response.ok) throw new Error("서버 응답 실패");
        
        const data = await response.json();
        let calendarArray = [];
        if (Array.isArray(data)) {
            calendarArray = data;
        } else if (data && Array.isArray(data.notes)) {
            calendarArray = data.notes;
        } else if (data && Array.isArray(data.events)) {
            calendarArray = data.events;
        }

        allEvents = calendarArray.filter(item => item.date && item.date.trim() !== '' && item.date.trim() !== '-');
        updateDropdownOptions();
        renderCalendar();

        statusEl.textContent = "데이터를 성공적으로 불러왔습니다.";
        statusEl.style.color = "#10b981";
    } catch (err) {
        statusEl.textContent = "데이터를 불러오지 못했습니다. (빈 양식 사용)";
        statusEl.style.color = "#ef4444";
        allEvents = [];
        renderCalendar();
    }
}

function updateDropdownOptions() {
    const selectYearEl = document.getElementById("select-year");
    const selectMonthEl = document.getElementById("select-month");
    const availableYears = new Set();

    allEvents.forEach(event => {
        const parts = event.date.split('-');
        if (parts.length >= 2) availableYears.add(parseInt(parts[0], 10));
    });

    const currentY = currentDate.getFullYear();
    availableYears.add(currentY);

    let yearOptionsHtml = "";
    Array.from(availableYears).sort((a, b) => a - b).forEach(y => {
        yearOptionsHtml += `<option value="${y}" ${y === currentY ? 'selected' : ''}>${y}년</option>`;
    });
    selectYearEl.innerHTML = yearOptionsHtml;
    selectMonthEl.value = currentDate.getMonth() + 1;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById("current-month-label").textContent = `${year}년 ${String(month + 1).padStart(2, '0')}월 📅`;

    const gridEl = document.getElementById("days-grid");
    gridEl.innerHTML = "";

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    let cellsHtml = "";

    // 이전 달 빈 칸
    for (let i = firstDayIndex; i > 0; i--) {
        cellsHtml += `<div class="calendar-cell other-month"><div class="cell-date-num">${prevLastDay - i + 1}</div><div class="cell-schedules"></div></div>`;
    }

    // 이번 달 날짜 칸
    for (let day = 1; day <= lastDay; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let daySchedules = allEvents.filter(event => event.date === dateString);

        let schedulesHtml = "";
        daySchedules.forEach(schedule => {
            const timeText = schedule.time ? schedule.time : "";
            schedulesHtml += `
                <span class="schedule-chip" title="${schedule.title || ''}">
                    ${timeText ? `<span class="chip-time">${timeText}</span>` : ''}${schedule.title || '일정'}
                </span>
            `;
        });

        cellsHtml += `
            <div class="calendar-cell" onclick="openDateModal('${dateString}')">
                <div class="cell-date-num">${day}</div>
                <div class="cell-schedules">${schedulesHtml}</div>
            </div>
        `;
    }

    // 다음 달 빈 칸 (6주 고정)
    const totalCellsSoFar = firstDayIndex + lastDay;
    const nextDaysCount = totalCellsSoFar <= 35 ? (35 - totalCellsSoFar) : (42 - totalCellsSoFar);
    for (let i = 1; i <= nextDaysCount; i++) {
        cellsHtml += `<div class="calendar-cell other-month"><div class="cell-date-num">${i}</div><div class="cell-schedules"></div></div>`;
    }

    gridEl.innerHTML = cellsHtml;
}

function openDateModal(dateString) {
    activeEditingDate = dateString;
    document.getElementById("modal-header-title").textContent = `${dateString} 일정 편집`;
    
    const container = document.getElementById("modal-content-box");
    container.innerHTML = "";

    const daySchedules = allEvents.filter(event => event.date === dateString);
    if (daySchedules.length > 0) {
        daySchedules.forEach(item => addModalScheduleRow(item));
    } else {
        addModalScheduleRow();
    }

    document.getElementById("detail-modal").classList.add("active");
}

function addModalScheduleRow(item = {}) {
    const container = document.getElementById("modal-content-box");
    const row = document.createElement("div");
    row.className = "modal-schedule-row";
    row.innerHTML = `
        <div style="display: flex; gap: 8px;">
            <input type="text" placeholder="시간 (예: 20:00)" class="modal-time" value="${item.time || ''}" style="flex: 1;">
            <input type="text" placeholder="방송유형 (예: 방송)" class="modal-type" value="${item.type || '방송'}" style="flex: 1;">
            <input type="text" placeholder="컨텐츠종류" class="modal-category" value="${item.category || ''}" style="flex: 1;">
        </div>
        <input type="text" placeholder="방송제목" class="modal-title" value="${item.title || ''}">
        <div style="display: flex; gap: 8px;">
            <input type="text" placeholder="다시보기 주소 (URL)" class="modal-url" value="${item.url || ''}" style="flex: 1;">
            <button type="button" class="delete-item-btn" onclick="this.closest('.modal-schedule-row').remove()" style="padding: 8px 12px;">삭제</button>
        </div>
    `;
    container.appendChild(row);
}

function saveModalSchedules() {
    allEvents = allEvents.filter(event => event.date !== activeEditingDate);

    document.querySelectorAll('#modal-content-box .modal-schedule-row').forEach(row => {
        const time = row.querySelector('.modal-time').value.trim();
        const type = row.querySelector('.modal-type').value.trim();
        const category = row.querySelector('.modal-category').value.trim();
        const title = row.querySelector('.modal-title').value.trim();
        const url = row.querySelector('.modal-url').value.trim();

        if (title) {
            allEvents.push({ date: activeEditingDate, time, type, category, title, url });
        }
    });

    renderCalendar();
    closeModal();
    document.getElementById('calendar-status').textContent = "변경사항이 적용되었습니다. 하단의 '월간일정 설정 반영하기'를 눌러 저장하세요.";
    document.getElementById('calendar-status').style.color = "#0284c7";
}

function closeModal() {
    document.getElementById("detail-modal").classList.remove("active");
}

function closeModalOnBackdrop(e) {
    if (e.target.id === "detail-modal") closeModal();
}

function toggleMonthDropdown() {
    const dropdown = document.getElementById("month-dropdown");
    dropdown.classList.toggle('active');
}

function applySelectedMonth() {
    const selectedYear = parseInt(document.getElementById("select-year").value, 10);
    const selectedMonth = parseInt(document.getElementById("select-month").value, 10);

    currentDate.setFullYear(selectedYear);
    currentDate.setMonth(selectedMonth - 1);
    
    renderCalendar();
    document.getElementById("month-dropdown").classList.remove('active');
}

async function saveCalendarSettings() {
    const statusEl = document.getElementById('calendar-status');
    const password = document.getElementById('admin-password').value.trim();
    if (!password) {
        statusEl.textContent = "로그인 정보가 유실되었습니다. 다시 로그인해주세요.";
        statusEl.style.color = "#ef4444";
        return;
    }

    statusEl.textContent = "저장 중...";
    statusEl.style.color = "#0077b6";

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: password,
                fileType: "fancalenar",
                content: { notes: allEvents }
            })
        });

        if (response.ok) {
            statusEl.textContent = "성공적으로 저장되었습니다!";
            statusEl.style.color = "#10b981";
        } else {
            const errText = await response.text();
            throw new Error(errText || "저장 실패");
        }
    } catch (err) {
        statusEl.textContent = "저장 오류: " + err.message;
        statusEl.style.color = "#ef4444";
    }
}
