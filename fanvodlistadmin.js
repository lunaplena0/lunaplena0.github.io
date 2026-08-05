function addVodRow(vod = {}) {
    const container = document.getElementById('vodlist-rows-container');
    const row = document.createElement('div');
    row.className = 'vod-row';
    row.innerHTML = `
        <div class="vod-row-inline">
            <input type="text" placeholder="날짜 (예: 2026-06-06)" class="vod-date" value="${vod.date || ''}">
            <input type="text" placeholder="컨텐츠 종류" class="vod-category" value="${vod.category || ''}">
            <input type="text" placeholder="다시보기 총시간 (예: 03:15:20)" class="vod-duration" value="${vod.duration || ''}">
        </div>
        <input type="text" placeholder="VOD 제목" class="vod-title" value="${vod.title || ''}">
        <div class="vod-row-inline">
            <input type="text" placeholder="링크 (URL)" class="vod-link" value="${vod.link || ''}">
            <input type="text" placeholder="썸네일 이미지 주소 (URL)" class="vod-thumbnail" value="${vod.thumbnail || ''}">
        </div>
        <div class="vod-row-inline">
            <div>
                <label style="font-size: 12px; margin-bottom: 4px;">구독플러스 여부</label>
                <select class="vod-sub-plus">
                    <option value="N" ${vod.subPlus === 'N' ? 'selected' : ''}>일반 (N)</option>
                    <option value="Y" ${vod.subPlus === 'Y' ? 'selected' : ''}>구독플러스 (Y)</option>
                </select>
            </div>
            <div>
                <label style="font-size: 12px; margin-bottom: 4px;">성인인증 필요 여부</label>
                <select class="vod-adult">
                    <option value="N" ${vod.adult === 'N' ? 'selected' : ''}>전체이용가 (N)</option>
                    <option value="Y" ${vod.adult === 'Y' ? 'selected' : ''}>성인인증 (Y)</option>
                </select>
            </div>
        </div>
        <textarea placeholder="컨텐츠 상세정보 입력" class="vod-description" style="height: 70px;">${vod.description || ''}</textarea>
        <div style="text-align: right;">
            <button type="button" class="delete-item-btn" onclick="this.closest('.vod-row').remove()" style="padding: 6px 12px; font-size: 13px;">항목 삭제</button>
        </div>
    `;
    container.appendChild(row);
}

async function loadVodListSettingsData() {
    const statusEl = document.getElementById('vodlist-status');
    statusEl.textContent = "데이터를 불러오는 중...";
    statusEl.style.color = "#0077b6";

    try {
        const response = await fetch(WORKER_URL + "?type=fanvodlist&t=" + Date.now());
        if (!response.ok) throw new Error("서버 응답 실패");
        
        const data = await response.json();
        const container = document.getElementById('vodlist-rows-container');
        container.innerHTML = "";

        let vodArray = [];
        if (Array.isArray(data)) {
            vodArray = data;
        } else if (data && Array.isArray(data.vods)) {
            vodArray = data.vods;
        } else if (data && Array.isArray(data.notes)) {
            vodArray = data.notes;
        }

        if (vodArray.length > 0) {
            vodArray.forEach(item => addVodRow(item));
        } else {
            addVodRow();
        }

        statusEl.textContent = "데이터를 성공적으로 불러왔습니다.";
        statusEl.style.color = "#10b981";
    } catch (err) {
        statusEl.textContent = "데이터를 불러오지 못했습니다. (빈 양식 사용)";
        statusEl.style.color = "#ef4444";
        const container = document.getElementById('vodlist-rows-container');
        if (container.children.length === 0) addVodRow();
    }
}

async function saveVodListSettings() {
    const statusEl = document.getElementById('vodlist-status');
    const password = document.getElementById('admin-password').value.trim();
    if (!password) {
        statusEl.textContent = "로그인 정보가 유실되었습니다. 다시 로그인해주세요.";
        statusEl.style.color = "#ef4444";
        return;
    }

    statusEl.textContent = "저장 중...";
    statusEl.style.color = "#0077b6";

    const vods = [];
    document.querySelectorAll('#vodlist-rows-container .vod-row').forEach(row => {
        const date = row.querySelector('.vod-date').value.trim();
        const category = row.querySelector('.vod-category').value.trim();
        const duration = row.querySelector('.vod-duration').value.trim();
        const title = row.querySelector('.vod-title').value.trim();
        const link = row.querySelector('.vod-link').value.trim();
        const thumbnail = row.querySelector('.vod-thumbnail').value.trim();
        const subPlus = row.querySelector('.vod-sub-plus').value;
        const adult = row.querySelector('.vod-adult').value;
        const description = row.querySelector('.vod-description').value.trim();

        if (title || link) {
            vods.push({
                date,
                title,
                link,
                thumbnail,
                duration,
                subPlus,
                adult,
                description,
                category
            });
        }
    });

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: password,
                fileType: "fanvodlist",
                content: { vods }
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
