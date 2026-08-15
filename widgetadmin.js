const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";

let songData = { notice: "", songs: [] };
let profileData = { name: "", image: "", catchphrase: "", details: [], time: "", content: "", bio1: "", bio2: "" };
let linksData = []; 
let mainpageData = { navBgColor: "rgba(3, 4, 94, 0.9)", logoText: "BABABI FAN ARCHIVE", mainContent: "", menuItems: [] };
let fansongStatsData = { unregisteredSongs: [], registeredSongs: [], vodSources: [] };

// 📌 escapeHtml 함수
function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 🔒 2개 버튼으로 축소된 관리자 UI 템플릿
const adminHtmlTemplate = `
    <!-- 대시보드 메뉴 -->
    <div id="dashboard-section" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #03045e;">🛠️ 관리자 대시보드</h3>
            <button onclick="location.reload()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">로그아웃</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
            <!-- 버튼 1: 관리페이지 이동 -->
            <div class="menu-card" onclick="window.open('https://lunaplena0.github.io/', '_blank')">
                <h4 style="font-size: 16px;">관리페이지로 이동</h4>
                <p style="font-size: 12px;">전체 대시보드 접속</p>
            </div>
            
            <!-- 버튼 2: 노래위젯 관리 및 설정 -->
            <div class="menu-card" onclick="showPanel('songs')">
                <h4 style="font-size: 16px;">노래위젯 관리 및 설정</h4>
                <p style="font-size: 12px;">목록 수정 및 환경설정</p>
            </div>
        </div>
    </div>

    <!-- 노래책 수정 패널 (노래위젯 관리 클릭 시 표시됨) -->
    <div id="panel-songs" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">📝 노래위젯 내용 편집</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>

        <div style="margin-bottom: 25px;">
            <label for="notice-input">📢 공지사항 내용</label>
            <textarea id="notice-input" placeholder="공지사항을 입력하세요..." style="height: 150px; resize: vertical;"></textarea>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 25px;">

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
            <label style="margin: 0;">🎶 노래 목록 (<span id="song-count-badge">0</span>곡)</label>
            <div style="display: flex; gap: 10px; flex: 1; max-width: 350px;">
                <input type="text" id="search-input" placeholder="🔍 제목, 가수, 장르 검색..." oninput="renderTable()" style="margin-bottom: 0; padding: 8px 12px;">
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="openEditModal(-1)" style="background-color: #10b981; padding: 8px 12px; font-size: 13px;">+ 새 노래 추가하기</button>
            </div>
        </div>

        <div class="song-table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width: 8%;">번호</th>
                        <th style="width: 27%;">제목</th>
                        <th style="width: 20%;">가수</th>
                        <th style="width: 15%;">장르</th>
                        <th style="width: 15%;">제한/기타</th>
                        <th style="width: 15%; text-align: center;">관리</th>
                    </tr>
                </thead>
                <tbody id="song-table-body"></tbody>
            </table>
        </div>

        <button onclick="saveSonglist()" style="width: 100%; margin-top: 20px; background-color: #0077b6; padding: 14px; font-size: 16px;">페이지에 변경사항 반영하기</button>
        <div id="status" class="status-msg"></div>
    </div>

    <!-- 곡 수정 모달 -->
    <div id="edit-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
        <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 400px; max-width: 90%;">
            <h3 id="modal-title" style="margin-top: 0; color: #03045e;">곡 정보 수정</h3>
            <input type="hidden" id="edit-index">
            <label style="font-size: 13px;">노래 제목</label>
            <input type="text" id="modal-title-input" placeholder="제목">
            <label style="font-size: 13px;">가수</label>
            <input type="text" id="modal-artist-input" placeholder="가수">
            <label style="font-size: 13px;">장르</label>
            <input type="text" id="modal-genre-input" placeholder="장르">
            <label style="font-size: 13px;">제한 / 조건</label>
            <input type="text" id="modal-limit-input" placeholder="제한">
            <label style="font-size: 13px;">기타 정보</label>
            <input type="text" id="modal-etc-input" placeholder="특이사항">
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="closeEditModal()" style="background-color: #64748b; flex: 1; padding: 8px;">취소</button>
                <button onclick="saveModalSong()" style="background-color: #0077b6; flex: 1; padding: 8px;">저장</button>
            </div>
        </div>
    </div>
`;

// 📌 로그인 및 데이터 불러오기
async function verifyAndLoad() {
    const password = document.getElementById("admin-password").value;
    const statusEl = document.getElementById("login-status");
    if (!password) { 
        statusEl.style.color = "#ef4444"; 
        statusEl.textContent = "비밀번호를 입력해주세요."; 
        return; 
    }

    statusEl.style.color = "#0077b6";
    statusEl.textContent = "비밀번호 확인 및 데이터 로드 중...";

    try {
        const authResponse = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: password, action: "verify", fileType: "verify" })
        });

        if (!authResponse.ok) {
            const errResult = await authResponse.json();
            throw new Error(errResult.error || "비밀번호가 틀렸습니다.");
        }

        const timestamp = new Date().getTime();
        const songRes = await fetch(WORKER_URL + "?type=songlist&t=" + timestamp);

        if (songRes.ok) {
            const data = await songRes.json();
            songData = { notice: data.notice || "", songs: Array.isArray(data.songs) ? data.songs : [] };
        }
        
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").innerHTML = adminHtmlTemplate;
        showDashboard();
        
    } catch (error) {
        statusEl.style.color = "#ef4444";
        statusEl.textContent = "로그인 실패: " + error.message;
    }
}

function showDashboard() {
    const dashboard = document.getElementById("dashboard-section");
    const panelSongs = document.getElementById("panel-songs");
    if (dashboard) dashboard.style.display = "block";
    if (panelSongs) panelSongs.style.display = "none";
}

function showPanel(type) {
    const dashboard = document.getElementById("dashboard-section");
    const panelSongs = document.getElementById("panel-songs");
    
    if (dashboard) dashboard.style.display = "none";
    if (panelSongs) panelSongs.style.display = "none";

    if (type === 'songs') {
        if (panelSongs) panelSongs.style.display = "block";
        initSongsPanel();
    }
}

function initSongsPanel() {
    const noticeInput = document.getElementById("notice-input");
    if (noticeInput) noticeInput.value = songData.notice || "";
    renderTable();
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

    songData.songs.forEach((song, index) => {
        const title = (song.title || "").toLowerCase();
        const artist = (song.artist || "").toLowerCase();
        const genre = (song.genre || "").toLowerCase();

        if (keyword && !title.includes(keyword) && !artist.includes(keyword) && !genre.includes(keyword)) return;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color: #64748b; font-weight: bold;">#${index + 1}</td>
            <td style="font-weight: 600; color: #0f172a;">${escapeHtml(song.title || '제목 없음')}</td>
            <td>${escapeHtml(song.artist || '-')}</td>
            <td>${escapeHtml(song.genre || '-')}</td>
            <td style="font-size: 12px; color: #475569;">${escapeHtml(song.limit || song.etc ? (song.limit + ' ' + song.etc).trim() : '-')}</td>
            <td style="text-align: center;">
                <button class="edit-btn" onclick="openEditModal(${index})" style="background-color: #0284c7; padding: 5px 10px; font-size: 12px; margin-right: 5px; color:white; border:none; border-radius:4px; cursor:pointer;">수정</button>
                <button class="delete-btn" onclick="deleteSong(${index})" style="background-color: #ef4444; padding: 5px 10px; font-size: 12px; color:white; border:none; border-radius:4px; cursor:pointer;">삭제</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
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

async function saveSonglist() {
    const noticeInput = document.getElementById("notice-input");
    if (noticeInput) songData.notice = noticeInput.value;
    
    showToast("페이지에 반영 중...");

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password: document.getElementById("admin-password").value,
                fileType: "songlist",
                content: songData
            })
        });
        const result = await response.json();
        if (response.ok) {
            showToast("성공적으로 업데이트되었습니다!");
        } else {
            throw new Error(result.error || "비밀번호 오류");
        }
    } catch (error) {
        showToast("실패: " + error.message);
    }
}

function showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
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
