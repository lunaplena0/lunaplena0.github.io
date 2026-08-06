let globalSongList = []; // songlist 데이터를 담을 변수

// songlist 데이터를 사전에 불러오는 함수
async function fetchSongListForComparison() {
    try {
        const response = await fetch(WORKER_URL + "?type=songlist&t=" + Date.now());
        if (response.ok) {
            const data = await response.json();
            globalSongList = Array.isArray(data) ? data : (data.songs || data.list || []);
        }
    } catch (err) {
        console.error("songlist 불러오기 실패:", err);
    }
}

async function loadSongStatsSettingsData() {
    const statusEl = document.getElementById('songstats-status');
    statusEl.textContent = "데이터를 불러오는 중...";
    statusEl.style.color = "#0077b6";

    // 비교군이 될 songlist를 먼저 로드
    await fetchSongListForComparison();

    try {
        const response = await fetch(WORKER_URL + "?type=fansongstats&t=" + Date.now());
        if (!response.ok) throw new Error("서버 응답 실패");
        
        const data = await response.json();
        
        // 기본 정보 채우기
        document.getElementById('songstats-vod-date').value = data.vodDate || data.date || "";
        document.getElementById('songstats-vod-url').value = data.vodUrl || data.url || "";

        // 등록된 노래 렌더링
        const regContainer = document.getElementById('registered-songs-container');
        regContainer.innerHTML = "";
        const registeredList = data.registeredSongs || data.registered || [];
        if (registeredList.length > 0) {
            registeredList.forEach(item => addRegisteredSongRow(item));
        } else {
            addRegisteredSongRow();
        }

        // 미등록된 노래 렌더링
        const unregContainer = document.getElementById('unregistered-songs-container');
        unregContainer.innerHTML = "";
        const unregisteredList = data.unregisteredSongs || data.unregistered || [];
        if (unregisteredList.length > 0) {
            unregisteredList.forEach(item => addUnregisteredSongRow(item));
        } else {
            addUnregisteredSongRow();
        }

        statusEl.textContent = "데이터를 성공적으로 불러왔습니다.";
        statusEl.style.color = "#10b981";
    } catch (err) {
        statusEl.textContent = "데이터를 불러오지 못했습니다. (빈 양식 사용)";
        statusEl.style.color = "#ef4444";
        document.getElementById('registered-songs-container').innerHTML = "";
        document.getElementById('unregistered-songs-container').innerHTML = "";
        addRegisteredSongRow();
        addUnregisteredSongRow();
    }
}

// 노래책에 등록된 노래 행 추가 (songlist와 비교 기능 포함)
function addRegisteredSongRow(item = {}) {
    const container = document.getElementById('registered-songs-container');
    const row = document.createElement('div');
    row.className = 'menu-item-row';
    
    // songlist와 비교하여 변경 여부 확인 로직
    const title = item.title || '';
    const artist = item.artist || '';
    const etc = item.etc || item.limit || '';
    
    let mismatchWarning = "";
    if (title && globalSongList.length > 0) {
        const matched = globalSongList.find(s => s.title === title);
        if (matched) {
            const matchedArtist = matched.artist || '';
            const matchedEtc = matched.etc || matched.limit || '';
            if (matchedArtist !== artist || matchedEtc !== etc) {
                mismatchWarning = `<span style="color: #ef4444; font-size: 11px; font-weight: bold; margin-left: 5px;">⚠️ songlist 정보와 일치하지 않음 (변경됨)</span>`;
            }
        }
    }

    row.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; gap: 6px;">
                <input type="text" placeholder="노래제목" class="reg-title" value="${title}" style="flex: 1;" oninput="checkSongChanges(this)">
                <input type="text" placeholder="가수" class="reg-artist" value="${artist}" style="flex: 1;" oninput="checkSongChanges(this)">
                <input type="text" placeholder="제한 / 기타" class="reg-etc" value="${etc}" style="flex: 1;" oninput="checkSongChanges(this)">
            </div>
            <div style="display: flex; gap: 6px;">
                <input type="text" placeholder="부른 날짜 (예: 2026-06-06)" class="reg-date" value="${item.date || ''}" style="flex: 1;">
                <input type="text" placeholder="부른 시간 (예: 21:30)" class="reg-time" value="${item.time || ''}" style="flex: 1;">
            </div>
            <div class="warning-slot">${mismatchWarning}</div>
        </div>
        <button type="button" class="delete-item-btn" onclick="this.closest('.menu-item-row').remove()">삭제</button>
    `;
    container.appendChild(row);
}

// 실시간으로 입력값 변경 시 songlist와 비교해 경고 문구를 띄워주는 함수
function checkSongChanges(input) {
    const row = input.closest('.menu-item-row');
    const title = row.querySelector('.reg-title').value.trim();
    const artist = row.querySelector('.reg-artist').value.trim();
    const etc = row.querySelector('.reg-etc').value.trim();
    const warningSlot = row.querySelector('.warning-slot');

    if (!title || globalSongList.length === 0) {
        warningSlot.innerHTML = "";
        return;
    }

    const matched = globalSongList.find(s => s.title === title);
    if (matched) {
        const matchedArtist = matched.artist || '';
        const matchedEtc = matched.etc || matched.limit || '';
        if (matchedArtist !== artist || matchedEtc !== etc) {
            warningSlot.innerHTML = `<span style="color: #ef4444; font-size: 11px; font-weight: bold; margin-left: 5px;">⚠️ songlist 정보와 일치하지 않음 (변경됨)</span>`;
        } else {
            warningSlot.innerHTML = "";
        }
    } else {
        warningSlot.innerHTML = `<span style="color: #f59e0b; font-size: 11px; font-weight: bold; margin-left: 5px;">🔍 songlist에 존재하지 않는 제목입니다.</span>`;
    }
}

// 노래책에 미등록된 노래 행 추가
function addUnregisteredSongRow(item = {}) {
    const container = document.getElementById('unregistered-songs-container');
    const row = document.createElement('div');
    row.className = 'menu-item-row';
    row.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; gap: 6px;">
                <input type="text" placeholder="노래제목" class="unreg-title" value="${item.title || ''}" style="flex: 1;">
                <input type="text" placeholder="가수" class="unreg-artist" value="${item.artist || ''}" style="flex: 1;">
                <input type="text" placeholder="제한 / 기타" class="unreg-etc" value="${item.etc || ''}" style="flex: 1;">
            </div>
            <div style="display: flex; gap: 6px;">
                <input type="text" placeholder="부른 날짜 (예: 2026-06-06)" class="unreg-date" value="${item.date || ''}" style="flex: 1;">
                <input type="text" placeholder="부른 시간 (예: 21:30)" class="unreg-time" value="${item.time || ''}" style="flex: 1;">
            </div>
        </div>
        <button type="button" class="delete-item-btn" onclick="this.closest('.menu-item-row').remove()">삭제</button>
    `;
    container.appendChild(row);
}

// 서버 저장 함수
async function saveSongStatsSettings() {
    const statusEl = document.getElementById('songstats-status');
    const password = document.getElementById('admin-password').value.trim();
    if (!password) {
        statusEl.textContent = "로그인 정보가 유실되었습니다. 다시 로그인해주세요.";
        statusEl.style.color = "#ef4444";
        return;
    }

    statusEl.textContent = "저장 중...";
    statusEl.style.color = "#0077b6";

    const vodDate = document.getElementById('songstats-vod-date').value.trim();
    const vodUrl = document.getElementById('songstats-vod-url').value.trim();

    // 등록된 노래 수집
    const registeredSongs = [];
    document.querySelectorAll('#registered-songs-container .menu-item-row').forEach(row => {
        const title = row.querySelector('.reg-title').value.trim();
        const artist = row.querySelector('.reg-artist').value.trim();
        const etc = row.querySelector('.reg-etc').value.trim();
        const date = row.querySelector('.reg-date').value.trim();
        const time = row.querySelector('.reg-time').value.trim();

        if (title) {
            registeredSongs.push({ title, artist, etc, date, time });
        }
    });

    // 미등록된 노래 수집
    const unregisteredSongs = [];
    document.querySelectorAll('#unregistered-songs-container .menu-item-row').forEach(row => {
        const title = row.querySelector('.unreg-title').value.trim();
        const artist = row.querySelector('.unreg-artist').value.trim();
        const etc = row.querySelector('.unreg-etc').value.trim();
        const date = row.querySelector('.unreg-date').value.trim();
        const time = row.querySelector('.unreg-time').value.trim();

        if (title) {
            unregisteredSongs.push({ title, artist, etc, date, time });
        }
    });

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: password,
                fileType: "fansongstats",
                content: { vodDate, vodUrl, registeredSongs, unregisteredSongs }
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
