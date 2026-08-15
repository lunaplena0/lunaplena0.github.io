const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";

let songData = { notice: "", songs: [] };
let widgetSelectedSongs = []; // 위젯 전용 선택 목록 데이터

// 📌 escapeHtml 함수
function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 🔒 2개 버튼으로 구성된 관리자 UI 템플릿
const adminHtmlTemplate = `
    <!-- 대시보드 메뉴 -->
    <div id="dashboard-section" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #03045e;">🛠️ 관리자 대시보드</h3>
            <button onclick="location.reload()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">로그아웃</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
            <!-- 버튼 1: 관리페이지로 이동 -->
            <div class="menu-card" onclick="window.open('https://lunaplena0.github.io/admin.html', '_blank')">
                <h4 style="font-size: 16px;">관리페이지로 이동</h4>
                <p style="font-size: 12px;">전체 관리 페이지 새 창으로 열기</p>
            </div>
            
            <!-- 버튼 2: 노래위젯 관리 및 설정 -->
            <div class="menu-card" onclick="showPanel('widget-songs')">
                <h4 style="font-size: 16px;">노래위젯 관리 및 설정</h4>
                <p style="font-size: 12px;">songlist 읽어와서 위젯 목록 구성</p>
            </div>
        </div>
    </div>

    <!-- 🎵 노래 위젯 목록 구성 패널 -->
    <div id="panel-widget-songs" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">🎛️ 노래 위젯 목록 구성</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>

        <p style="color: #64748b; font-size: 14px; margin-bottom: 15px;">
            songlist 데이터를 읽어와서 검색 후 위젯에 표시할 목록을 구성합니다. (여기서 삭제해도 원본 songlist는 안전합니다.)
        </p>

        <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
            
            <!-- 왼쪽: 노래 검색 및 선택 영역 -->
            <div style="flex: 1; min-width: 300px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px;">
                <h4 style="color: #0077b6; margin-top: 0;">🔍 노래 검색</h4>
                <input type="text" id="widget-song-search" placeholder="제목 또는 가수 검색..." oninput="renderWidgetSearchPool()" style="margin-bottom: 10px;">
                
                <!-- 높이가 고정된 검색 결과 창 -->
                <div id="widget-search-results" style="height: 250px; max-height: 250px; overflow-y: auto; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 8px;">
                    <div style="padding: 10px; color: #64748b; text-align: center; font-size: 13px;">검색어를 입력해주세요.</div>
                </div>
            </div>

            <!-- 오른쪽: 선택된 위젯 목록 영역 -->
            <div style="flex: 1; min-width: 300px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="color: #0077b6; margin: 0;">📋 선택된 위젯 목록 (<span id="widget-selected-count">0</span>곡)</h4>
                    <button type="button" onclick="clearWidgetSongs()" style="background-color: #ef4444; padding: 4px 8px; font-size: 11px; margin-bottom: 0;">전체 삭제</button>
                </div>
                
                <!-- 높이가 고정된 선택 목록 창 -->
                <div id="widget-selected-list" style="height: 250px; max-height: 250px; overflow-y: auto; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 8px; margin-bottom: 15px;">
                    <div style="padding: 10px; color: #64748b; text-align: center; font-size: 13px;">선택된 곡이 없습니다.</div>
                </div>

                <button onclick="saveWidgetSongs()" style="width: 100%; background-color: #0077b6; padding: 12px; font-size: 15px;">위젯 데이터 저장하기</button>
            </div>

        </div>
        <div id="widget-status" class="status-msg"></div>
    </div>
`;

// 📌 로그인 및 데이터 불러오기 (songlist 읽어오기 포함)
async function verifyAndLoad() {
    const password = document.getElementById("admin-password").value;
    const statusEl = document.getElementById("login-status");
    if (!password) { 
        statusEl.style.color = "#ef4444"; 
        statusEl.textContent = "비밀번호를 입력해주세요."; 
        return; 
    }

    statusEl.style.color = "#0077b6";
    statusEl.textContent = "비밀번호 확인 및 songlist 로드 중...";

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
    const panelWidgetSongs = document.getElementById("panel-widget-songs");
    if (dashboard) dashboard.style.display = "block";
    if (panelWidgetSongs) panelWidgetSongs.style.display = "none";
}

function showPanel(type) {
    const dashboard = document.getElementById("dashboard-section");
    const panelWidgetSongs = document.getElementById("panel-widget-songs");
    
    if (dashboard) dashboard.style.display = "none";
    if (panelWidgetSongs) panelWidgetSongs.style.display = "none";

    if (type === 'widget-songs') {
        if (panelWidgetSongs) panelWidgetSongs.style.display = "block";
        initWidgetSongsPanel();
    }
}

function initWidgetSongsPanel() {
    const searchInput = document.getElementById("widget-song-search");
    if (searchInput) searchInput.value = "";
    renderWidgetSearchPool();
    renderWidgetSelectedList();
}

// 1. 검색 풀 렌더링 (songlist 기반 - 실시간 반영)
function renderWidgetSearchPool() {
    const searchInput = document.getElementById("widget-song-search");
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const resultContainer = document.getElementById("widget-search-results");
    
    if (!resultContainer) return;
    resultContainer.innerHTML = "";

    if (!songData.songs || songData.songs.length === 0) {
        resultContainer.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center; font-size: 13px;">등록된 노래가 없습니다.</div>`;
        return;
    }

    if (!keyword) {
        resultContainer.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center; font-size: 13px;">검색어를 입력해주세요.</div>`;
        return;
    }

    const filteredSongs = songData.songs.filter(song => {
        const title = (song.title || "").toLowerCase();
        const artist = (song.artist || "").toLowerCase();
        return title.includes(keyword) || artist.includes(keyword);
    });

    if (filteredSongs.length === 0) {
        resultContainer.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center; font-size: 13px;">검색 결과가 없습니다.</div>`;
        return;
    }

    filteredSongs.forEach((song) => {
        const div = document.createElement("div");
        div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px;";
        div.innerHTML = `
            <div>
                <strong>${escapeHtml(song.title)}</strong> 
                <span style="color: #64748b;">(${escapeHtml(song.artist || '가수 미상')})</span>
            </div>
            <button type="button" onclick='addSongToWidget(${JSON.stringify(song)})' style="background-color: #10b981; padding: 4px 8px; font-size: 12px; margin-bottom: 0;">선택</button>
        `;
        resultContainer.appendChild(div);
    });
}

// 2. 검색된 곡을 위젯 목록에 추가 (즉시 반영)
function addSongToWidget(song) {
    const exists = widgetSelectedSongs.some(item => item.title === song.title && item.artist === song.artist);
    if (exists) {
        showToast("이미 위젯 목록에 추가된 곡입니다.");
        return;
    }

    widgetSelectedSongs.push({ ...song, checked: false });
    renderWidgetSelectedList();
}

// 3. 선택된 위젯 목록 렌더링
function renderWidgetSelectedList() {
    const container = document.getElementById("widget-selected-list");
    const countBadge = document.getElementById("widget-selected-count");
    if (!container) return;

    container.innerHTML = "";
    if (countBadge) countBadge.textContent = widgetSelectedSongs.length;

    if (widgetSelectedSongs.length === 0) {
        container.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center; font-size: 13px;">선택된 곡이 없습니다.</div>`;
        return;
    }

    widgetSelectedSongs.forEach((song, index) => {
        const div = document.createElement("div");
        div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; background: #fff; margin-bottom: 4px; border-radius: 4px;";
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; overflow: hidden;">
                <input type="checkbox" style="margin-bottom: 0;" ${song.checked ? 'checked' : ''} onchange="toggleWidgetSongCheck(${index}, this.checked)">
                <span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${escapeHtml(song.title)}">
                    <strong>${escapeHtml(song.title)}</strong> <span style="color: #64748b; font-size: 11px;">(${escapeHtml(song.artist || '-')})</span>
                </span>
            </div>
            <button type="button" onclick="removeSongFromWidget(${index})" style="background-color: #ef4444; padding: 4px 8px; font-size: 12px; margin-bottom: 0; white-space: nowrap;">삭제</button>
        `;
        container.appendChild(div);
    });
}

// 4. 체크 상태 변경 핸들러 (즉시 반영)
function toggleWidgetSongCheck(index, isChecked) {
    if (widgetSelectedSongs[index]) {
        widgetSelectedSongs[index].checked = isChecked;
    }
}

// 5. 위젯 목록에서 특정 항목 제거 (즉시 반영)
function removeSongFromWidget(index) {
    widgetSelectedSongs.splice(index, 1);
    renderWidgetSelectedList();
}

// 6. 위젯 목록 전체 삭제 (즉시 반영)
function clearWidgetSongs() {
    if (widgetSelectedSongs.length === 0) return;
    if (confirm("위젯 목록에 있는 모든 곡을 삭제하시겠습니까?")) {
        widgetSelectedSongs = [];
        renderWidgetSelectedList();
        showToast("위젯 목록이 초기화되었습니다.");
    }
}

// 7. 위젯 데이터 최종 저장 (위젯 전용 파일 타입으로 저장)
async function saveWidgetSongs() {
    showToast("위젯 목록 반영 중...");

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password: document.getElementById("admin-password").value,
                fileType: "widget_songs", 
                content: { songs: widgetSelectedSongs }
            })
        });
        const result = await response.json();
        if (response.ok) {
            showToast("위젯 목록이 성공적으로 업데이트되었습니다!");
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
