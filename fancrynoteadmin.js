function addCryNoteRow(date = "", description = "", time = "", url = "") {
    const container = document.getElementById('crynote-rows-container');
    const row = document.createElement('div');
    row.className = 'menu-item-row';
    row.innerHTML = `
        <input type="text" placeholder="날짜" class="crynote-date-input" value="${date}" style="flex: 1;">
        <input type="text" placeholder="설명" class="crynote-desc-input" value="${description}" style="flex: 2;">
        <input type="text" placeholder="시간" class="crynote-time-input" value="${time}" style="flex: 1;">
        <input type="text" placeholder="주소" class="crynote-url-input" value="${url}" style="flex: 2;">
        <button type="button" class="delete-item-btn" onclick="this.parentElement.remove()">삭제</button>
    `;
    container.appendChild(row);
}

async function loadCryNoteSettingsData() {
    const statusEl = document.getElementById('crynote-status');
    try {
        const response = await fetch(WORKER_URL + "?type=fancrynote&t=" + Date.now());
        const data = await response.json();
        const container = document.getElementById('crynote-rows-container');
        container.innerHTML = "";
        let notesArray = Array.isArray(data) ? data : (data?.notes || []);
        if (notesArray.length > 0) {
            notesArray.forEach(item => addCryNoteRow(item.date, item.description, item.time, item.url));
        } else { addCryNoteRow(); }
        statusEl.textContent = "불러오기 성공";
        statusEl.style.color = "#10b981";
    } catch (err) {
        statusEl.textContent = "불러오기 실패";
        statusEl.style.color = "#ef4444";
        if (document.getElementById('crynote-rows-container').children.length === 0) addCryNoteRow();
    }
}

async function saveCryNoteSettings() {
    const statusEl = document.getElementById('crynote-status');
    const password = document.getElementById('admin-password').value.trim();
    if (!password) return;

    const notes = [];
    document.querySelectorAll('#crynote-rows-container .menu-item-row').forEach(row => {
        const date = row.querySelector('.crynote-date-input').value.trim();
        const description = row.querySelector('.crynote-desc-input').value.trim();
        const time = row.querySelector('.crynote-time-input').value.trim();
        const url = row.querySelector('.crynote-url-input').value.trim();
        if (date || description || time || url) notes.push({ date, description, time, url });
    });

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, fileType: "fancrynote", content: { notes } })
        });
        if (response.ok) {
            statusEl.textContent = "성공적으로 저장되었습니다!";
            statusEl.style.color = "#10b981";
        } else { throw new Error("저장 실패"); }
    } catch (err) {
        statusEl.textContent = "저장 오류: " + err.message;
        statusEl.style.color = "#ef4444";
    }
}
