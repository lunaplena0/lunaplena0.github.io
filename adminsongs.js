// 노래책 수정 관련 로직

function initSongsPanel() {
    document.getElementById("notice-input").value = songData.notice || "";
    renderTable();
}

// 팬송 통계 데이터와 노래책 데이터를 함께 저장하는 함수
async function saveSonglist() {
    // 1. 공지사항 저장
    songData.notice = document.getElementById("notice-input").value;
    
    // 2. 노래책 데이터 저장
    await saveDataToWorker("songlist", songData, "status");
    
    // 3. fansongstats 데이터 저장 (vodSources는 절대 건드리지 않고 기존 데이터를 보존합니다)
    if (typeof fansongStatsData !== 'undefined') {
        const payloadToSave = {
            vodSources: fansongStatsData.vodSources || [], 
            registeredSongs: fansongStatsData.registeredSongs || [],
            unregisteredSongs: fansongStatsData.unregisteredSongs || []
        };
        
        await saveDataToWorker("fansongstats", payloadToSave, "status");
    }
    
    showToast("노래책과 통계 데이터가 모두 저장되었습니다.");
}

function renderTable() {
    if (!Array.isArray(songData.songs)) songData.songs = [];
    const badge = document.getElementById("song-count-badge");
    if (badge) badge.textContent = songData.songs.length;
    const searchInput = document.getElementById("search-input");
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const tbody = document.getElementById("song-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    // 📌 이미 unshift로 맨 앞에 추가되어 있으므로 순차적으로 출력하면 최신 곡이 맨 위에 뜸
    songData.songs.forEach((song, originalIndex) => {
        const title = (song.title || "").toLowerCase();
        const artist = (song.artist || "").toLowerCase();
        const genre = (song.genre || "").toLowerCase();

        if (keyword && !title.includes(keyword) && !artist.includes(keyword) && !genre.includes(keyword)) return;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color: #64748b; font-weight: bold;">#${originalIndex + 1}</td>
            <td style="font-weight: 600; color: #0f172a;">${escapeHtml(song.title || '제목 없음')}</td>
            <td>${escapeHtml(song.artist || '-')}</td>
            <td>${escapeHtml(song.genre || '-')}</td>
            <td style="font-size: 12px; color: #475569;">${escapeHtml(song.limit || song.etc ? (song.limit + ' ' + song.etc).trim() : '-')}</td>
            <td style="text-align: center;">
                <button class="edit-btn" onclick="openEditModal(${originalIndex})">수정</button>
                <button class="delete-btn" onclick="deleteSong(${originalIndex})">삭제</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function downloadCsvFile() {
    if (!Array.isArray(songData.songs) || songData.songs.length === 0) { alert("내보낼 데이터가 없습니다."); return; }
    let csvRows = ['"\uFEFF제목","가수","장르","제한","기타"'];
    songData.songs.forEach(song => {
        csvRows.push(`"${(song.title||"").replace(/"/g,'""')}","${(song.artist||"").replace(/"/g,'""')}","${(song.genre||"").replace(/"/g,'""')}","${(song.limit||"").replace(/"/g,'""')}","${(song.etc||"").replace(/"/g,'""')}"`);
    });
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `badabi_songlist_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function openEditModal(index) {
    document.getElementById("edit-index").value = index;
    if (index === -1) {
        document.getElementById("modal-title").textContent = "새 노래 추가";
        ["modal-title-input","modal-artist-input","modal-genre-input","modal-limit-input","modal-etc-input"].forEach(id => document.getElementById(id).value = "");
    } else {
        document.getElementById("modal-title").textContent = `#${index + 1} 곡 정보 수정`;
        const song = songData.songs[index];
        document.getElementById("modal-title-input").value = song.title || "";
        document.getElementById("modal-artist-input").value = song.artist || "";
        document.getElementById("modal-genre-input").value = song.genre || "";
        document.getElementById("modal-limit-input").value = song.limit || "";
        document.getElementById("modal-etc-input").value = song.etc || "";
    }
    document.getElementById("edit-modal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("edit-modal").style.display = "none";
}

function saveModalSong() {
    const index = parseInt(document.getElementById("edit-index").value);
    const newSong = {
        title: document.getElementById("modal-title-input").value.trim(),
        artist: document.getElementById("modal-artist-input").value.trim(),
        genre: document.getElementById("modal-genre-input").value.trim(),
        limit: document.getElementById("modal-limit-input").value.trim(),
        etc: document.getElementById("modal-etc-input").value.trim()
    };

    if (!newSong.title) { alert("노래 제목을 입력해주세요."); return; }

    if (index === -1) {
        // 🚀 신규 추가는 무조건 맨 위로 가도록 unshift 사용
        songData.songs.unshift(newSong);
    } else {
        songData.songs[index] = newSong;
    }

    closeEditModal();
    renderTable();
}

function deleteSong(index) {
    if (confirm(`정말 #${index + 1} 곡을 삭제하시겠습니까?`)) {
        songData.songs.splice(index, 1);
        renderTable();
    }
}

function toggleBatchBox() {
    const body = document.getElementById("batch-body-content");
    const icon = document.getElementById("batch-toggle-icon");
    if (!body) return;
    if (body.style.display === "block") {
        body.style.display = "none";
        icon.textContent = "▼";
    } else {
        body.style.display = "block";
        icon.textContent = "▲";
    }
}

function importBatchSongs() {
    const text = document.getElementById("batch-input").value.trim();
    if (!text) { alert("붙여넣은 내용이 없습니다."); return; }

    const lines = text.split("\n");
    let addedSongs = [];

    lines.forEach(line => {
        const cols = line.split("\t");
        if (cols.length >= 1 && cols[0].trim()) {
            addedSongs.push({
                title: cols[0] ? cols[0].trim() : "",
                artist: cols[1] ? cols[1].trim() : "",
                genre: cols[2] ? cols[2].trim() : "",
                limit: cols[3] ? cols[3].trim() : "",
                etc: cols[4] ? cols[4].trim() : ""
            });
        }
    });

    if (addedSongs.length > 0) {
        // 🚀 일괄 추가된 곡들도 최신 항목이 맨 위로 오도록 역순 배치 후 앞에 삽입
        songData.songs = [...addedSongs.reverse(), ...songData.songs];
        
        showToast(`${addedSongs.length}곡이 성공적으로 추가되었습니다!`);
        document.getElementById("batch-input").value = "";
        renderTable();
    } else {
        alert("가져올 수 있는 유효한 데이터가 없습니다. 구글 시트에서 올바르게 복사했는지 확인해주세요.");
    }
}

// 📌 토스트 중복 생성 방지 함수
function showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
    }

    const existingToasts = container.querySelectorAll(".toast-message");
    for (let t of existingToasts) {
        if (t.textContent === message) return; 
    }

    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    toast.style.cssText = "background: #1e293b; color: #fff; padding: 12px 20px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); opacity: 0; transition: opacity 0.3s ease; font-size: 14px;";
    
    container.appendChild(toast);

    setTimeout(() => { toast.style.opacity = "1"; }, 10);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => { toast.remove(); }, 300);
    }, 3000);
}
