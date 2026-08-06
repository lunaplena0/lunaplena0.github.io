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

    await fetchSongListForComparison();

    try {
        const response = await fetch(WORKER_URL + "?type=fansongstats&t=" + Date.now());
        if (!response.ok) throw new Error("서버 응답 실패");
        
        const data = await response.json();
        
        // 1. 다중 다시보기 소스 렌더링 (구조 호환성 지원)
        const vodContainer = document.getElementById('vod-sources-container');
        vodContainer.innerHTML = "";
        let vodSources = data.vodSources || [];
        // 기존 단일 필드 데이터가 존재할 경우 마이그레이션 흡수
        if (vodSources.length === 0 && (data.vodDate || data.vodUrl || data.date || data.url)) {
            vodSources.push({ date: data.vodDate || data.date || "", url: data.vodUrl || data.url || "" });
        }
        if (vodSources.length > 0) {
            vodSources.forEach(item => addVodSourceRow(item));
        } else {
            addVodSourceRow();
        }

        // 2. 등록된 노래 렌더링
        const regContainer = document.getElementById('registered-songs-container');
        regContainer.innerHTML = "";
        const registeredList = data.registeredSongs || data.registered || [];
        if (registeredList.length > 0) {
            registeredList.forEach(item => addRegisteredSongRow(item));
        } else {
            addRegisteredSongRow();
        }

        // 3. 미등록된 노래 렌더링
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
        document.getElementById('vod-sources-container').innerHTML = "";
        document.getElementById('registered-songs-container').innerHTML = "";
        document.getElementById('unregistered-songs-container').innerHTML = "";
        addVodSourceRow();
        addRegisteredSongRow();
        addUnregisteredSongRow();
    }
}

// 다시보기 날짜 및 주소 행 추가 함수
function addVodSourceRow(item = {}) {
    const container = document.getElementById('vod-sources-container');
    const row = document.createElement('div');
    row.className = 'menu-item-row vod-source-row';
    row.innerHTML = `
        <div style="flex: 1; display: flex; gap: 8px;">
            <input type="text" placeholder="다시보기 날짜 (예: 2026-06-06)" class="vod-src-date" value="${item.date || ''}" style="flex: 1;">
            <input type="text" placeholder="다시보기 주소 (URL)" class="vod-src-url" value="${item.url || ''}" style="flex: 2;">
        </div>
        <button type="button" class="delete-item-btn" onclick="this.closest('.menu-item-row').remove()">삭제</button>
    `;
    container.appendChild(row);
}

// 노래책에 등록된 노래 행 추가
function addRegisteredSongRow(item = {}) {
    const container = document.getElementById('registered-songs-container');
    const row = document.createElement('div');
    row.className = 'menu-item-row reg-song-row';
    
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

// 실시간 변경 비교 함수
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
    row.className = 'menu-item-row unreg-song-row';
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

// --- [추가] 노래책(songlist) 불러오기 모달 제어 함수 ---
async function openSongListImportModal() {
    if (globalSongList.length === 0) {
        await fetchSongListForComparison();
    }
    
    const container = document.getElementById('songlist-import-items');
    container.innerHTML = "";

    if (globalSongList.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #64748b;">불러올 수 있는 songlist 데이터가 없습니다.</p>`;
    } else {
        globalSongList.forEach((song, idx) => {
            const row = document.createElement('div');
            row.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; border-radius: 6px; margin-bottom: 6px;";
            row.innerHTML = `
                <input type="checkbox" class="song-import-checkbox" value="${idx}" style="width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1; font-size: 13px;">
                    <strong>${song.title || '제목 없음'}</strong> <span style="color: #64748b;">(${song.artist || '가수 미지정'})</span>
                    ${(song.etc || song.limit) ? `<span style="color: #0284c7; margin-left: 6px; font-size: 12px;">[${song.etc || song.limit}]</span>` : ''}
                </div>
            `;
            container.appendChild(row);
        });
    }

    document.getElementById('songlist-import-modal').classList.add('active');
}

function closeSongListImportModal() {
    document.getElementById('songlist-import-modal').classList.remove('active');
}

// 모달에서 선택한 노래들을 등록된 노래 목록으로 추가
function importSelectedSongsToRegistered() {
    const checkboxes = document.querySelectorAll('.song-import-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("추가할 노래를 선택해주세요.");
        return;
    }

    checkboxes.forEach(cb => {
        const songData = globalSongList[cb.value];
        if (songData) {
            addRegisteredSongRow({
                title: songData.title || '',
                artist: songData.artist || '',
                etc: songData.etc || songData.limit || '',
                date: '',
                time: ''
            });
        }
    });

    closeSongListImportModal();
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

    // 1. 다중 다시보기 소스 수집
    const vodSources = [];
    document.querySelectorAll('#vod-sources-container .vod-source-row').forEach(row => {
        const date = row.querySelector('.vod-src-date').value.trim();
        const url = row.querySelector('.vod-src-url').value.trim();
        if (date || url) {
            vodSources.push({ date, url });
        }
    });

    // 2. 등록된 노래 수집
    const registeredSongs = [];
    document.querySelectorAll('#registered-songs-container .reg-song-row').forEach(row => {
        const title = row.querySelector('.reg-title').value.trim();
        const artist = row.querySelector('.reg-artist').value.trim();
        const etc = row.querySelector('.reg-etc').value.trim();
        const date = row.querySelector('.reg-date').value.trim();
        const time = row.querySelector('.reg-time').value.trim();

        if (title) {
            registeredSongs.push({ title, artist, etc, date, time });
        }
    });

    // 3. 미등록된 노래 수집
    const unregisteredSongs = [];
    document.querySelectorAll('#unregistered-songs-container .unreg-song-row').forEach(row => {
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
                content: { vodSources, registeredSongs, unregisteredSongs }
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
