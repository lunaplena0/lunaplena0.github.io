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
        
        // 1. 다중 다시보기 소스 렌더링
        const vodContainer = document.getElementById('vod-sources-container');
        vodContainer.innerHTML = "";
        let vodSources = data.vodSources || [];
        if (vodSources.length === 0 && (data.vodDate || data.vodUrl || data.date || data.url)) {
            vodSources.push({ date: data.vodDate || data.date || "", url: data.vodUrl || data.url || "" });
        }
        if (vodSources.length > 0) {
            vodSources.forEach((item, index) => addVodSourceRow(item, index));
        } else {
            addVodSourceRow({}, 0);
        }

        // 2. 등록된 노래 렌더링
        const regContainer = document.getElementById('registered-songs-container');
        regContainer.innerHTML = "";
        const registeredList = data.registeredSongs || data.registered || [];
        if (registeredList.length > 0) {
            registeredList.forEach((item, index) => addRegisteredSongRow(item, index));
        } else {
            addRegisteredSongRow({}, 0);
        }

        // 3. 미등록된 노래 렌더링
        const unregContainer = document.getElementById('unregistered-songs-container');
        unregContainer.innerHTML = "";
        const unregisteredList = data.unregisteredSongs || data.unregistered || [];
        if (unregisteredList.length > 0) {
            unregisteredList.forEach((item, index) => addUnregisteredSongRow(item, index));
        } else {
            addUnregisteredSongRow({}, 0);
        }

        statusEl.textContent = "데이터를 성공적으로 불러왔습니다.";
        statusEl.style.color = "#10b981";
    } catch (err) {
        statusEl.textContent = "데이터를 불러오지 못했습니다. (빈 양식 사용)";
        statusEl.style.color = "#ef4444";
        document.getElementById('vod-sources-container').innerHTML = "";
        document.getElementById('registered-songs-container').innerHTML = "";
        document.getElementById('unregistered-songs-container').innerHTML = "";
        addVodSourceRow({}, 0);
        addRegisteredSongRow({}, 0);
        addUnregisteredSongRow({}, 0);
    }
}

// 다시보기 개별 상세 메모 영역 접기/펼치기 토글 함수
function toggleVodDetail(btn) {
    const detailBox = btn.closest('.vod-source-row').querySelector('.vod-detail-box');
    if (detailBox.style.display === "none") {
        detailBox.style.display = "block";
        btn.textContent = "➖ 닫기";
        btn.style.backgroundColor = "#64748b";
    } else {
        detailBox.style.display = "none";
        btn.textContent = "✏️ 수정";
        btn.style.backgroundColor = "#0284c7";
    }
}

// 다시보기 전체 일괄 접기/펼치기 함수
function toggleAllVodDetails(expand = true) {
    const container = document.getElementById('vod-sources-container');
    if (!container) return;
    
    const rows = container.querySelectorAll('.vod-source-row');
    rows.forEach(row => {
        if (expand) {
            row.style.display = "flex";
        } else {
            row.style.display = "none";
        }
    });
}

// 다시보기 날짜 및 주소 행 추가 함수
function addVodSourceRow(item = {}, forcedIndex = null) {
    const container = document.getElementById('vod-sources-container');
    
    const row = document.createElement('div');
    row.className = 'menu-item-row vod-source-row';
    row.style.flexDirection = "column";
    row.style.alignItems = "stretch";
    row.style.display = "flex";

    const date = item.date || '';
    const url = item.url || '';

    row.innerHTML = `
        <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" placeholder="다시보기 날짜 (예: 2026-06-06(1))" class="vod-src-date" value="${date}" style="flex: 1; margin-bottom: 0; height: 38px; box-sizing: border-box;">
            <input type="text" placeholder="다시보기 주소 (URL)" class="vod-src-url" value="${url}" style="flex: 2; margin-bottom: 0; height: 38px; box-sizing: border-box;">
            <button type="button" onclick="moveToBottomAndDone(this)" style="background-color: #10b981; color: #fff; padding: 0 10px; height: 38px; font-size: 11px; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">✅ 완료</button>
            <button type="button" onclick="toggleVodDetail(this)" style="background-color: #0284c7; color: #fff; padding: 0 10px; height: 38px; font-size: 11px; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">✏️ 수정</button>
            <button type="button" class="delete-item-btn" onclick="this.closest('.menu-item-row').remove()" style="padding: 0 10px; height: 38px; font-size: 11px; margin-bottom: 0; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">삭제</button>
        </div>
        
        <div class="vod-detail-box" style="display: none; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 8px;">
            <span style="font-size: 12px; color: #64748b;">이 다시보기 항목에 대한 상세 메모나 부가 설정을 입력할 수 있습니다.</span>
        </div>
    `;

    if (forcedIndex !== null) {
        container.appendChild(row);
        if (forcedIndex >= 5) row.style.display = "none";
    } else {
        container.insertBefore(row, container.firstChild);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// 부른 날짜/시간 개별 항목 추가 서브 함수
function addDateTimeRow(containerEl, item = {}) {
    const row = document.createElement('div');
    row.className = 'datetime-sub-row';
    row.style.cssText = "display: flex; gap: 6px; align-items: center; margin-top: 4px;";
    row.innerHTML = `
        <input type="text" placeholder="부른 날짜 (예: 2026-06-06(1))" class="sub-date" value="${item.date || ''}" style="flex: 1; margin-bottom: 0; background: #fff;">
        <input type="text" placeholder="부른 시간 (예: 21:30)" class="sub-time" value="${item.time || ''}" style="flex: 1; margin-bottom: 0; background: #fff;">
        <button type="button" class="delete-item-btn" onclick="this.closest('.datetime-sub-row').remove()" style="padding: 6px 10px; font-size: 11px; margin-bottom: 0;">삭제</button>
    `;
    containerEl.appendChild(row);
}

// 상세 영역 개별 접기/펼치기 토글 함수
function toggleSongDetail(btn) {
    const detailBox = btn.closest('.reg-song-row, .unreg-song-row').querySelector('.song-detail-box');
    if (detailBox.style.display === "none") {
        detailBox.style.display = "block";
        btn.textContent = "➖ 닫기";
        btn.style.backgroundColor = "#64748b";
    } else {
        detailBox.style.display = "none";
        btn.textContent = "✏️ 수정";
        btn.style.backgroundColor = "#0284c7";
    }
}

// 특정 컨테이너 안의 모든 노래 목록 행 자체를 일괄 접기/펼치기
function toggleAllSongDetails(containerId, expand = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const rows = container.querySelectorAll('.reg-song-row, .unreg-song-row');
    rows.forEach(row => {
        if (expand) {
            row.style.display = "flex";
        } else {
            row.style.display = "none";
        }
    });
}

// 등록된 노래 및 미등록된 노래 통합 검색 필터링 함수
function filterRegisteredSongs(queryInput) {
    const keyword = queryInput.value.trim().toLowerCase();
    
    const allSongRows = document.querySelectorAll('#registered-songs-container .reg-song-row, #unregistered-songs-container .unreg-song-row');
    
    allSongRows.forEach(row => {
        const titleEl = row.querySelector('.reg-title') || row.querySelector('.unreg-title');
        const artistEl = row.querySelector('.reg-artist') || row.querySelector('.unreg-artist');
        const limitEl = row.querySelector('.reg-limit') || row.querySelector('.unreg-limit');

        const title = titleEl ? titleEl.value.toLowerCase() : "";
        const artist = artistEl ? artistEl.value.toLowerCase() : "";
        const limit = limitEl ? limitEl.value.toLowerCase() : "";
        
        if (!keyword || title.includes(keyword) || artist.includes(keyword) || limit.includes(keyword)) {
            row.style.display = "flex";
        } else {
            row.style.display = "none";
        }
    });
}

// 노래책에 등록된 노래 행 추가 (genre, etc 포함)
function addRegisteredSongRow(item = {}, forcedIndex = null) {
    const container = document.getElementById('registered-songs-container');

    const row = document.createElement('div');
    row.className = 'menu-item-row reg-song-row';
    row.style.flexDirection = "column";
    row.style.alignItems = "stretch";
    row.style.display = "flex";
    
    const title = item.title || '';
    const artist = item.artist || '';
    const limitVal = item.limit || '';
    const genreVal = item.genre || '';
    const etcVal = item.etc || '';
    
    let mismatchWarning = "";
    if (title && globalSongList.length > 0) {
        const exactMatchExists = globalSongList.some(s => 
            (s.title || '').trim() === title.trim() && 
            (s.artist || '').trim() === artist.trim()
        );

        if (!exactMatchExists) {
            mismatchWarning = `<span style="color: #f59e0b; font-size: 11px; font-weight: bold;">🔍 songlist에 존재하지 않는 제목입니다.</span>`;
        } else {
            const fullMatchExists = globalSongList.some(s => {
                const sTitle = (s.title || '').trim();
                const sArtist = (s.artist || '').trim();
                const sLimit = (s.limit || '').trim();
                return sTitle === title.trim() && sArtist === artist.trim() && sLimit === limitVal.trim();
            });
