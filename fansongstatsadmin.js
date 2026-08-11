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
        
        // 1. 다중 다시보기 소스 렌더링 (처음 5개만 기본 표시)
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

        // 2. 등록된 노래 렌더링 (처음 5개만 기본 표시)
        const regContainer = document.getElementById('registered-songs-container');
        regContainer.innerHTML = "";
        const registeredList = data.registeredSongs || data.registered || [];
        if (registeredList.length > 0) {
            registeredList.forEach((item, index) => addRegisteredSongRow(item, index));
        } else {
            addRegisteredSongRow({}, 0);
        }

        // 3. 미등록된 노래 렌더링 (처음 5개만 기본 표시)
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

// 다시보기 전체 일괄 접기/펼치기 함수 (목록 행 자체 제어)
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

// 다시보기 날짜 및 주소 행 추가 함수 (항상 맨 위에 생성 + 완료 버튼 추가)
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

    // 초기 로딩 시에는 그대로 쌓고, 사용자가 직접 누를 땐 맨 위에 생성
    if (forcedIndex !== null) {
        container.appendChild(row);
        if (forcedIndex >= 5) row.style.display = "none";
    } else {
        container.insertBefore(row, container.firstChild); // 맨 위에 생성!
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

// 특정 컨테이너 안의 모든 노래 목록 행 자체를 일괄 접기/펼치기 하는 함수
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

// 노래책에 등록된 노래 행 추가 (항상 맨 위에 생성 + 완료/아래로 보내기 버튼 추가 가능)
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
    const genreVal = item.genre || ''; // genre 값
    const etcVal = item.etc || '';     // etc 값
    
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

            if (!fullMatchExists) {
                mismatchWarning = `<span style="color: #ef4444; font-size: 11px; font-weight: bold;">⚠️ songlist 정보와 일치하지 않음 (변경됨)</span>`;
            }
        }
    }

    row.innerHTML = `
        <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" placeholder="노래제목" class="reg-title" value="${title}" style="flex: 2; margin-bottom: 0; height: 38px; box-sizing: border-box;" oninput="checkSongChanges(this)">
            <input type="text" placeholder="가수" class="reg-artist" value="${artist}" style="flex: 1.5; margin-bottom: 0; height: 38px; box-sizing: border-box;" oninput="checkSongChanges(this)">
            <input type="text" placeholder="제한 (limit)" class="reg-limit" value="${limitVal}" style="flex: 1; margin-bottom: 0; height: 38px; box-sizing: border-box;" oninput="checkSongChanges(this)">
            <button type="button" onclick="moveToBottomAndDone(this)" style="background-color: #10b981; color: #fff; padding: 0 10px; height: 38px; font-size: 11px; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">✅ 완료</button>
            <button type="button" onclick="toggleSongDetail(this)" style="background-color: #0284c7; color: #fff; padding: 0 10px; height: 38px; font-size: 11px; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">✏️ 수정</button>
            <button type="button" class="delete-item-btn" onclick="this.closest('.menu-item-row').remove()" style="padding: 0 10px; height: 38px; font-size: 11px; margin-bottom: 0; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">삭제</button>
        </div>
        
        <div class="song-detail-box" style="display: none; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 8px; max-height: 250px; overflow-y: auto;">
            <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                <div style="flex: 1;">
                    <label style="font-size: 11px; color: #0077b6; margin-bottom: 3px;">장르 (genre)</label>
                    <input type="text" placeholder="장르 입력" class="reg-genre" value="${genreVal}" style="margin-bottom: 0; background: #fff; font-size: 12px; padding: 8px;">
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 11px; color: #0077b6; margin-bottom: 3px;">기타 (etc)</label>
                    <input type="text" placeholder="기타 정보 입력" class="reg-etc" value="${etcVal}" style="margin-bottom: 0; background: #fff; font-size: 12px; padding: 8px;">
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                <span style="font-size: 12px; font-weight: bold; color: #0077b6;">부른 날짜 및 시간 목록</span>
                <button type="button" onclick="addDateTimeRow(this.closest('.song-detail-box').querySelector('.datetime-container'))" style="background-color: #10b981; padding: 3px 8px; font-size: 11px; margin-bottom: 0;">+ 날짜/시간 추가</button>
            </div>
            <div class="datetime-container" style="display: flex; flex-direction: column; gap: 4px;"></div>
        </div>

        <div class="warning-slot" style="margin-top: 4px;"></div>
    `;

    container.appendChild(row); // 기본 추가

    const dtContainer = row.querySelector('.datetime-container');
    let dateTimes = item.dateTimes || [];
    if (dateTimes.length === 0 && (item.date || item.time)) {
        dateTimes.push({ date: item.date || '', time: item.time || '' });
    }
    if (dateTimes.length > 0) {
        dateTimes.forEach(dt => addDateTimeRow(dtContainer, dt));
    } else {
        addDateTimeRow(dtContainer);
    }

    if (forcedIndex !== null) {
        if (forcedIndex >= 5) row.style.display = "none";
    } else {
        // 맨 위로 이동시키기
        container.insertBefore(row, container.firstChild);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// 실시간 변경 비교 함수
function checkSongChanges(input) {
    const row = input.closest('.menu-item-row');
    const title = row.querySelector('.reg-title').value.trim();
    const artist = row.querySelector('.reg-artist').value.trim();
    const limitVal = row.querySelector('.reg-limit').value.trim();
    const warningSlot = row.querySelector('.warning-slot');

    if (!title || globalSongList.length === 0) {
        warningSlot.innerHTML = "";
        return;
    }

    const exactMatchExists = globalSongList.some(s => 
        (s.title || '').trim() === title && 
        (s.artist || '').trim() === artist
    );

    if (!exactMatchExists) {
        warningSlot.innerHTML = `<span style="color: #f59e0b; font-size: 11px; font-weight: bold;">🔍 songlist에 존재하지 않는 제목입니다.</span>`;
        return;
    }

    const fullMatchExists = globalSongList.some(s => {
        const sTitle = (s.title || '').trim();
        const sArtist = (s.artist || '').trim();
        const sLimit = (s.limit || '').trim();
        return sTitle === title && sArtist === artist && sLimit === limitVal;
    });

    if (!fullMatchExists) {
        warningSlot.innerHTML = `<span style="color: #ef4444; font-size: 11px; font-weight: bold;">⚠️ songlist 정보와 일치하지 않음 (변경됨)</span>`;
    } else {
        warningSlot.innerHTML = "";
    }
}

// 노래책에 미등록된 노래 행 추가 (항상 맨 위에 생성)
function addUnregisteredSongRow(item = {}, forcedIndex = null) {
    const container = document.getElementById('unregistered-songs-container');

    const row = document.createElement('div');
    row.className = 'menu-item-row unreg-song-row';
    row.style.flexDirection = "column";
    row.style.alignItems = "stretch";
    row.style.display = "flex";

    const title = item.title || '';
    const artist = item.artist || '';
    const limitVal = item.limit || item.etc || '';

    row.innerHTML = `
        <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" placeholder="노래제목" class="unreg-title" value="${title}" style="flex: 2; margin-bottom: 0; height: 38px; box-sizing: border-box;">
            <input type="text" placeholder="가수" class="unreg-artist" value="${artist}" style="flex: 1.5; margin-bottom: 0; height: 38px; box-sizing: border-box;">
            <input type="text" placeholder="제한 (limit)" class="unreg-limit" value="${limitVal}" style="flex: 1; margin-bottom: 0; height: 38px; box-sizing: border-box;">
            <button type="button" onclick="moveToBottomAndDone(this)" style="background-color: #10b981; color: #fff; padding: 0 10px; height: 38px; font-size: 11px; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">✅ 완료</button>
            <button type="button" onclick="toggleSongDetail(this)" style="background-color: #0284c7; color: #fff; padding: 0 10px; height: 38px; font-size: 11px; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">✏️ 수정</button>
            <button type="button" class="delete-item-btn" onclick="this.closest('.menu-item-row').remove()" style="padding: 0 10px; height: 38px; font-size: 11px; margin-bottom: 0; white-space: nowrap; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">삭제</button>
        </div>

        <div class="song-detail-box" style="display: none; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 8px; max-height: 200px; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 12px; font-weight: bold; color: #0077b6;">부른 날짜 및 시간 목록</span>
                <button type="button" onclick="addDateTimeRow(this.closest('.song-detail-box').querySelector('.datetime-container'))" style="background-color: #10b981; padding: 3px 8px; font-size: 11px; margin-bottom: 0;">+ 날짜/시간 추가</button>
            </div>
            <div class="datetime-container" style="display: flex; flex-direction: column; gap: 4px;"></div>
        </div>
    `;

    container.appendChild(row);

    const dtContainer = row.querySelector('.datetime-container');
    let dateTimes = item.dateTimes || [];
    if (dateTimes.length === 0 && (item.date || item.time)) {
        dateTimes.push({ date: item.date || '', time: item.time || '' });
    }
    if (dateTimes.length > 0) {
        dateTimes.forEach(dt => addDateTimeRow(dtContainer, dt));
    } else {
        addDateTimeRow(dtContainer);
    }

    if (forcedIndex !== null) {
        if (forcedIndex >= 5) row.style.display = "none";
    } else {
        container.insertBefore(row, container.firstChild);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// [신규] 여러 노래 시간 일괄 추가 모달창 열기 함수
function openBatchTimeImportModal() {
    const rawDateInput = document.getElementById('vod-sources-container').querySelector('.vod-src-date');
    let defaultDate = rawDateInput ? rawDateInput.value.trim() : "";
    if (!defaultDate) {
        defaultDate = new Date().toISOString().slice(0, 10);
    } else {
        defaultDate = defaultDate.replace(/\(\d+\)$/, '').trim();
    }

    document.getElementById('batch-common-date').value = defaultDate;
    document.getElementById('batch-text-input').value = "";
    document.getElementById('batch-result-status').innerHTML = "";
    document.getElementById('batch-time-import-modal').classList.add('active');
}

function closeBatchTimeImportModal() {
    document.getElementById('batch-time-import-modal').classList.remove('active');
}

// [수정] 일괄 추가 텍스트 파싱 및 중복 방지 실행 함수
function executeBatchTimeImport() {
    const commonDateInput = document.getElementById('batch-common-date').value.trim();
    const rawText = document.getElementById('batch-text-input').value.trim();
    const statusEl = document.getElementById('batch-result-status');

    if (!commonDateInput) {
        alert("공통으로 적용할 날짜를 입력해주세요.");
        return;
    }
    if (!rawText) {
        alert("추가할 타임라인 텍스트를 입력해주세요.");
        return;
    }

    const lines = rawText.split('\n');
    
    const rows = [
        ...document.querySelectorAll('#registered-songs-container .reg-song-row'),
        ...document.querySelectorAll('#unregistered-songs-container .unreg-song-row')
    ];
    
    let matchedCount = 0;
    let skippedCount = 0;
    let mismatchLines = [];

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const hasGuitarIcon = trimmedLine.includes('🎸');
        const cleanLine = trimmedLine.replace('🎸', '').trim();

        const match = cleanLine.match(/^(\d{2}:\d{2}(?::\d{2})?)\s*(?:🎵)?\s*(.+?)\s*-\s*(.+)$/);
        
        if (!match) {
            mismatchLines.push(trimmedLine);
            return;
        }

        const timeStr = match[1];
        const targetTitle = match[2].trim().toLowerCase();
        const targetArtist = match[3].trim().toLowerCase();

        let found = false;

        rows.forEach(row => {
            const titleEl = row.querySelector('.reg-title') || row.querySelector('.unreg-title');
            const artistEl = row.querySelector('.reg-artist') || row.querySelector('.unreg-artist');
            const limitEl = row.querySelector('.reg-limit') || row.querySelector('.unreg-limit');
            
            if (!titleEl || !artistEl) return;

            const rowTitle = titleEl.value.trim().toLowerCase();
            const rowArtist = artistEl.value.trim().toLowerCase();
            const rowLimit = limitEl ? limitEl.value.trim().toLowerCase() : "";

            if (rowTitle === targetTitle && rowArtist === targetArtist) {
                const isGuitarMatch = hasGuitarIcon ? (rowLimit === '기타') : (rowLimit !== '기타');

                if (isGuitarMatch) {
                    found = true;
                    const dtContainer = row.querySelector('.datetime-container');
                    
                    let isAlreadyExists = false;
                    const existingSubRows = dtContainer.querySelectorAll('.datetime-sub-row');
                    existingSubRows.forEach(subRow => {
                        const existingDate = subRow.querySelector('.sub-date').value.trim();
                        const existingTime = subRow.querySelector('.sub-time').value.trim();
                        if (existingDate === commonDateInput && existingTime === timeStr) {
                            isAlreadyExists = true;
                        }
                    });

                    if (isAlreadyExists) {
                        skippedCount++;
                        return;
                    }

                    matchedCount++;
                    
                    const firstSubRow = dtContainer.querySelector('.datetime-sub-row');
                    if (firstSubRow && !firstSubRow.querySelector('.sub-date').value && !firstSubRow.querySelector('.sub-time').value) {
                        firstSubRow.querySelector('.sub-date').value = commonDateInput;
                        firstSubRow.querySelector('.sub-time').value = timeStr;
                    } else {
                        addDateTimeRow(dtContainer, { date: commonDateInput, time: timeStr });
                    }
                }
            }
        });

        if (!found) {
            mismatchLines.push(trimmedLine);
        }
    });

    let resultHTML = `<span style="color: #10b981; font-weight: bold;">성공적으로 ${matchedCount}개의 노래에 시간이 추가되었습니다!</span>`;
    if (skippedCount > 0) {
        resultHTML += `<br><span style="color: #3b82f6; font-weight: bold;">ℹ️ 이미 존재하는 동일한 날짜·시간이라 건너뛴 항목: ${skippedCount}개</span>`;
    }
    if (mismatchLines.length > 0) {
        resultHTML += `<br><span style="color: #ef4444; font-weight: bold;">⚠️ 불일치하거나 형식 오류인 항목 (${mismatchLines.length}개):</span>`;
        mismatchLines.forEach(ml => {
            resultHTML += `<br><span style="color: #ef4444; font-size: 12px;">- ${ml} (불일치합니다)</span>`;
        });
    }
    statusEl.innerHTML = resultHTML;
}

// 노래책(songlist) 불러오기 모달 제어 함수
async function openSongListImportModal() {
    if (globalSongList.length === 0) {
        await fetchSongListForComparison();
    }
    
    const container = document.getElementById('songlist-import-items');
    container.innerHTML = "";
    document.getElementById('select-all-songs').checked = false;

    if (globalSongList.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #64748b;">불러올 수 있는 songlist 데이터가 없습니다.</p>`;
    } else {
        globalSongList.forEach((song, idx) => {
            const row = document.createElement('div');
            row.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; border-radius: 6px; margin-bottom: 6px;";
            
            // genre와 etc 정보 포맷팅
            let metaInfo = [];
            if (song.limit) metaInfo.push(`[제한: ${song.limit}]`);
            if (song.genre) metaInfo.push(`[장르: ${song.genre}]`);
            if (song.etc) metaInfo.push(`[기타: ${song.etc}]`);

            row.innerHTML = `
                <input type="checkbox" class="song-import-checkbox" value="${idx}" style="width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1; font-size: 13px;">
                    <strong>${song.title || '제목 없음'}</strong> <span style="color: #64748b;">(${song.artist || '가수 미지정'})</span>
                    <span style="color: #0284c7; margin-left: 6px; font-size: 12px;">${metaInfo.join(' ')}</span>
                </div>
            `;
            container.appendChild(row);
        });
    }

    document.getElementById('songlist-import-modal').classList.add('active');
}

function importSelectedSongsToRegistered(isReplace = false) {
    const checkboxes = document.querySelectorAll('.song-import-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("가져올 노래를 선택해주세요.");
        return;
    }

    const regContainer = document.getElementById('registered-songs-container');
    if (isReplace) {
        if (!confirm("기존에 등록된 노래 목록이 모두 지워지고 선택한 곡들로 대체됩니다. 진행하시겠습니까?")) {
            return;
        }
        regContainer.innerHTML = "";
    }

    checkboxes.forEach(cb => {
        const songData = globalSongList[cb.value];
        if (songData) {
            addRegisteredSongRow({
                title: songData.title || '',
                artist: songData.artist || '',
                limit: songData.limit || '',
                genre: songData.genre || '', // genre 추가
                etc: songData.etc || '',       // etc 추가
                dateTimes: []
            });
        }
    });

    closeSongListImportModal();
}

function importAllSongsToRegistered() {
    if (globalSongList.length === 0) {
        alert("불러올 노래가 없습니다.");
        return;
    }

    const isReplace = confirm("노래책(songlist)의 모든 곡을 등록된 노래 목록에 추가합니다.\n\n[확인]: 기존 목록을 비우고 전체 대체\n[취소]: 기존 목록 아래에 이어서 추가");
    
    const regContainer = document.getElementById('registered-songs-container');
    if (isReplace) {
        regContainer.innerHTML = "";
    }

    globalSongList.forEach(songData => {
        addRegisteredSongRow({
            title: songData.title || '',
            artist: songData.artist || '',
            limit: songData.limit || '',
            genre: songData.genre || '', // genre 추가
            etc: songData.etc || '',       // etc 추가
            dateTimes: []
        });
    });

    closeSongListImportModal();
}

// [수정됨] 양방향 대조 (리스트에 없는 songlist 원본 곡까지 탐지)
async function checkAllSongMismatches() {
    if (globalSongList.length === 0) {
        await fetchSongListForComparison();
    }

    if (globalSongList.length === 0) {
        alert("비교할 songlist 데이터를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.");
        return;
    }

    // 1. 등록된 노래와 미등록된 노래 목록의 행들을 각각 가져오기
    const regRows = document.querySelectorAll('#registered-songs-container .reg-song-row');
    const unregRows = document.querySelectorAll('#unregistered-songs-container .unreg-song-row');

    const matchedSongs = [];       // 완벽히 일치하는 곡 (등록 리스트 기준)
    const missingInSongList = []; // 내 리스트엔 있지만 songlist엔 없는 곡
    const infoChanged = [];       // 제목/가수는 같지만 limit 등이 변경된 곡
    const duplicateInBoth = [];   // 등록 리스트와 미등록 리스트 양쪽에 모두 존재하는 곡

    // 2. 미등록 리스트에 있는 곡들의 고유 키(제목+가수+limit) 세트 만들기
    const unregSongKeys = new Set();
    unregRows.forEach(row => {
        const title = (row.querySelector('.unreg-title')?.value || '').trim();
        const artist = (row.querySelector('.unreg-artist')?.value || '').trim();
        const limitVal = (row.querySelector('.unreg-limit')?.value || '').trim();
        if (title) {
            unregSongKeys.add(`${title}_${artist}_${limitVal}`);
        }
    });

    // 원본 songlist 복사본 (대조하면서 소모함)
    let availableSongList = globalSongList.map(s => ({
        title: (s.title || '').trim(),
        artist: (s.artist || '').trim(),
        limit: (s.limit || '').trim()
    }));

    // 3. 등록된 노래 목록 검사 (1차: 완벽 일치 / 2차: 정보 변경 / 3차: songlist 누락)
    const remainingRows = [];
    regRows.forEach((row) => {
        const title = row.querySelector('.reg-title').value.trim();
        const artist = row.querySelector('.reg-artist').value.trim();
        const limitVal = row.querySelector('.reg-limit').value.trim();

        if (!title) return;

        // 양쪽 리스트에 모두 존재하는지 중복 체크
        if (unregSongKeys.has(`${title}_${artist}_${limitVal}`)) {
            duplicateInBoth.push({ title, artist, limit: limitVal });
        }

        const exactIdx = availableSongList.findIndex(s => 
            s.title === title && s.artist === artist && s.limit === limitVal
        );

        if (exactIdx !== -1) {
            matchedSongs.push({ title, artist, limit: limitVal });
            availableSongList.splice(exactIdx, 1);
        } else {
            remainingRows.push({ row, title, artist, limit: limitVal });
        }
    });

    remainingRows.forEach(item => {
        const { title, artist, limit: limitVal } = item;

        const partialIdx = availableSongList.findIndex(s => 
            s.title === title && s.artist === artist
        );

        if (partialIdx !== -1) {
            const sLimit = availableSongList[partialIdx].limit;
            infoChanged.push({ title, artist, limit: limitVal, serverLimit: sLimit });
            availableSongList.splice(partialIdx, 1);
        } else {
            missingInSongList.push({ title, artist, limit: limitVal });
        }
    });

    const missingInMyList = availableSongList; // songlist엔 있지만 내 리스트엔 없는 곡

    const totalIssueCount = missingInSongList.length + infoChanged.length + missingInMyList.length + duplicateInBoth.length;
    let modalBodyHTML = "";

    if (totalIssueCount === 0) {
        modalBodyHTML += `
            <div style="text-align: center; padding: 20px; color: #10b981; font-weight: bold; font-size: 15px;">
                ✨ 모든 등록된 노래 (${matchedSongs.length}곡)가 songlist와 완벽히 대조 및 일치하며, 리스트 간 중복도 없습니다!
            </div>
        `;
    } else {
        modalBodyHTML += `
            <div style="margin-bottom: 12px; font-weight: bold; font-size: 14px;">
                <span style="color: #10b981;">일치하는 곡 (${matchedSongs.length}곡)</span> / <span style="color: #ef4444;">주의·불일치 항목 (${totalIssueCount}개)</span>
            </div>
        `;

        // 0. 양쪽 리스트(등록 및 미등록)에 모두 존재하는 중복 곡
        if (duplicateInBoth.length > 0) {
            modalBodyHTML += `
                <div style="margin-bottom: 12px;">
                    <strong style="color: #8b5cf6; font-size: 13px;">🔁 두 리스트(등록·미등록)에 동일한 노래가 있습니다 (${duplicateInBoth.length}곡)</strong>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-top: 4px; max-height: 120px; overflow-y: auto;">
                        ${duplicateInBoth.map(song => `<div style="font-size: 12px; padding: 3px 0; border-bottom: 1px solid #f1f5f9;">• <strong>${song.title}</strong> (${song.artist}) <span style="color: #0284c7;">[limit: ${song.limit || '없음'}]</span></div>`).join('')}
                    </div>
                </div>
            `;
        }

        // 1. 노래책에는 있지만 내 리스트에 없는 곡
        if (missingInMyList.length > 0) {
            modalBodyHTML += `
                <div style="margin-bottom: 12px;">
                    <strong style="color: #3b82f6; font-size: 13px;">📥 노래책에만 존재하고 내 리스트에 없는 곡 (${missingInMyList.length}곡)</strong>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-top: 4px; max-height: 120px; overflow-y: auto;">
                        ${missingInMyList.map(song => `<div style="font-size: 12px; padding: 3px 0; border-bottom: 1px solid #f1f5f9;">• <strong>${song.title}</strong> (${song.artist}) <span style="color: #0284c7;">[limit: ${song.limit || '없음'}]</span></div>`).join('')}
                    </div>
                </div>
            `;
        }

        // 2. 내 리스트엔 있지만 노래책엔 없는 곡
        if (missingInSongList.length > 0) {
            modalBodyHTML += `
                <div style="margin-bottom: 12px;">
                    <strong style="color: #f59e0b; font-size: 13px;">🔍 songlist에 없는 곡 (${missingInSongList.length}곡)</strong>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-top: 4px; max-height: 120px; overflow-y: auto;">
                        ${missingInSongList.map(song => `<div style="font-size: 12px; padding: 3px 0; border-bottom: 1px solid #f1f5f9;">• <strong>${song.title}</strong> (${song.artist}) <span style="color: #0284c7;">[limit: ${song.limit || '없음'}]</span></div>`).join('')}
                    </div>
                </div>
            `;
        }

        // 3. 정보가 변경된 곡
        if (infoChanged.length > 0) {
            modalBodyHTML += `
                <div style="margin-bottom: 12px;">
                    <strong style="color: #ef4444; font-size: 13px;">⚠️ 정보(limit 등)가 일치하지 않는 곡 (${infoChanged.length}곡)</strong>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-top: 4px; max-height: 120px; overflow-y: auto;">
                        ${infoChanged.map(song => `<div style="font-size: 12px; padding: 3px 0; border-bottom: 1px solid #f1f5f9;">• <strong>${song.title}</strong> (${song.artist}) <br>&nbsp;&nbsp;→ 입력값: <span style="color: #ef4444;">${song.limit || '없음'}</span> / songlist값: <span style="color: #10b981;">${song.serverLimit || '없음'}</span></div>`).join('')}
                    </div>
                </div>
            `;
        }
    }

    showCustomModal("songlist-compare-modal", "songlist 종합 대조 결과", modalBodyHTML);
}

// 팝업 모달 생성 및 제어 헬퍼 함수
function showCustomModal(modalId, title, contentHTML) {
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = "display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;";
        modal.innerHTML = `
            <div style="background: #fff; width: 480px; max-width: 90%; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; max-height: 80vh;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 12px;">
                    <h3 id="${modalId}-title" style="margin: 0; font-size: 16px; color: #1e293b;"></h3>
                    <button type="button" onclick="document.getElementById('${modalId}').style.display='none'" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b;">✕</button>
                </div>
                <div id="${modalId}-body" style="overflow-y: auto; flex: 1; margin-bottom: 15px;"></div>
                <button type="button" onclick="document.getElementById('${modalId}').style.display='none'" style="background-color: #0284c7; color: #fff; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">확인</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById(`${modalId}-title`).textContent = title;
    document.getElementById(`${modalId}-body`).innerHTML = contentHTML;
    modal.style.display = "flex";
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

    const vodSources = [];
    document.querySelectorAll('#vod-sources-container .vod-source-row').forEach(row => {
        const date = row.querySelector('.vod-src-date').value.trim();
        const url = row.querySelector('.vod-src-url').value.trim();
        if (date || url) {
            vodSources.push({ date, url });
        }
    });

    const registeredSongs = [];
    document.querySelectorAll('#registered-songs-container .reg-song-row').forEach(row => {
        const title = row.querySelector('.reg-title').value.trim();
        const artist = row.querySelector('.reg-artist').value.trim();
        const limit = row.querySelector('.reg-limit').value.trim();
        const genre = row.querySelector('.reg-genre') ? row.querySelector('.reg-genre').value.trim() : ""; // genre 수집
        const etc = row.querySelector('.reg-etc') ? row.querySelector('.reg-etc').value.trim() : "";         // etc 수집
        
        const dateTimes = [];
        row.querySelectorAll('.datetime-sub-row').forEach(subRow => {
            const date = subRow.querySelector('.sub-date').value.trim();
            const time = subRow.querySelector('.sub-time').value.trim();
            if (date || time) {
                dateTimes.push({ date, time });
            }
        });

        if (title) {
            registeredSongs.push({ title, artist, limit, genre, etc, dateTimes });
        }
    });

    const unregisteredSongs = [];
    document.querySelectorAll('#unregistered-songs-container .unreg-song-row').forEach(row => {
        const title = row.querySelector('.unreg-title').value.trim();
        const artist = row.querySelector('.unreg-artist').value.trim();
        const limit = row.querySelector('.unreg-limit').value.trim();
        
        const dateTimes = [];
        row.querySelectorAll('.datetime-sub-row').forEach(subRow => {
            const date = subRow.querySelector('.sub-date').value.trim();
            const time = subRow.querySelector('.sub-time').value.trim();
            if (date || time) {
                dateTimes.push({ date, time });
            }
        });

        if (title) {
            unregisteredSongs.push({ title, artist, limit, dateTimes });
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
// [신규] 입력 완료 시 해당 행을 리스트의 맨 아래로 보내주는 함수
function moveToBottomAndDone(btn) {
    const row = btn.closest('.menu-item-row');
    const container = row.parentNode;

    // 맨 아래로 이동
    container.appendChild(row);

    // 부드럽게 맨 아래로 스크롤 이동
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
