const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";

let songData = { notice: "", songs: [] };
let widgetSelectedSongs = []; // 위젯 전용 선택 목록 데이터
let widgetBgColor = "transparent"; // 위젯 배경색 설정 값

// 📌 escapeHtml 함수
function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 📌 limit 배지 생성 헬퍼 함수
function getLimitBadgeHTML(limit) {
    let limitVal = limit ? limit.replace(/[\[\]]/g, '').trim() : '';
    if (limitVal === "") return "";

    let badgeColor = "#0ea5e9";
    if (limitVal.includes("200")) badgeColor = "#10b981";
    else if (limitVal.includes("300")) badgeColor = "#f97316";
    else if (limitVal.includes("기타")) {
        badgeColor = "#8b5cf6";
        limitVal = "기타 연주";
    }
    
    return `<span style="background-color: ${badgeColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; margin-right: 6px; display: inline-block; vertical-align: middle;">${escapeHtml(limitVal)}</span>`;
}

// 🔒 관리자 UI 템플릿 (배경색 설정 영역 추가)
const adminHtmlTemplate = `
    <!-- 대시보드 메뉴 -->
    <div id="dashboard-section" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #03045e;">🛠️ 관리자 대시보드</h3>
            <button onclick="location.reload()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">로그아웃</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
            <div class="menu-card" onclick="window.open('https://lunaplena0.github.io/admin.html', '_blank')">
                <h4 style="font-size: 16px;">관리페이지로 이동</h4>
                <p style="font-size: 12px;">전체 관리 페이지 새 창으로 열기</p>
            </div>
            
            <div class="menu-card" onclick="showPanel('widget-songs')">
                <h4 style="font-size: 16px;">노래위젯 관리 및 설정</h4>
                <p style="font-size: 12px;">위젯 목록 및 배경색 설정</p>
            </div>
        </div>
    </div>

    <!-- 🎵 노래 위젯 관리 패널 -->
    <div id="panel-widget-songs" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">🎛️ 노래 위젯 관리 및 설정</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>

        <!-- 🎨 위젯 배경색 설정 영역 -->
        <div style="background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 15px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div>
                <strong>🎨 위젯 배경색 설정</strong>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #0369a1;">방송 화면(OBS 등)에 맞게 위젯 배경을 설정합니다.</p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <input type="color" id="widget-bg-color-picker" onchange="updateBgColorFromPicker(this.value)" style="width: 35px; height: 32px; border: none; cursor: pointer; background: none;">
                <input type="text" id="widget-bg-color-input" placeholder="transparent 또는 색상코드" oninput="updateBgColorFromInput(this.value)" style="margin-bottom: 0; width: 180px; padding: 5px; font-size: 13px;">
                <button type="button" onclick="setTransparentBg()" style="background-color: #64748b; padding: 6px 10px; font-size: 12px; margin-bottom: 0;">투명하게</button>
            </div>
        </div>

        <!-- 탭 전환 버튼 -->
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button type="button" id="tab-btn-search" onclick="switchWidgetTab('search')" style="background-color: #0284c7; padding: 6px 14px; font-size: 13px; margin-bottom: 0;">🔍 검색해서 추가</button>
            <button type="button" id="tab-btn-manual" onclick="switchWidgetTab('manual')" style="background-color: #64748b; padding: 6px 14px; font-size: 13px; margin-bottom: 0;">✏️ 수동 입력 추가</button>
        </div>

        <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
            
            <!-- 왼쪽: 검색 / 수동입력 -->
            <div style="flex: 1; min-width: 300px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px;">
                
                <!-- 검색 탭 -->
                <div id="sub-panel-search">
                    <h4 style="color: #0077b6; margin-top: 0;">🔍 노래 검색</h4>
                    <input type="text" id="widget-song-search" placeholder="제목 또는 가수 검색..." oninput="renderWidgetSearchPool()" style="margin-bottom: 10px;">
                    <div id="widget-search-results" style="height: 200px; max-height: 200px; overflow-y: auto; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 8px;">
                        <div style="padding: 10px; color: #64748b; text-align: center; font-size: 13px;">검색어를 입력해주세요.</div>
                    </div>
                </div>

                <!-- 수동 입력 탭 -->
                <div id="sub-panel-manual" style="display: none;">
                    <h4 style="color: #0077b6; margin-top: 0;">✏️ 수동 노래 추가</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 3px;">노래 제목 *</label>
                            <input type="text" id="manual-title" placeholder="예: 그때가 좋았어" style="margin-bottom: 0; padding: 6px;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 3px;">아티스트 (가수)</label>
                            <input type="text" id="manual-artist" placeholder="예: 케이시 (선택사항)" style="margin-bottom: 0; padding: 6px;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 3px;">Limit 태그</label>
                            <input type="text" id="manual-limit" placeholder="예: [200], [300], 기타 (선택사항)" style="margin-bottom: 0; padding: 6px;">
                        </div>
                        <button type="button" onclick="addManualSongToWidget()" style="background-color: #0284c7; padding: 8px; font-size: 13px; margin-top: 5px; margin-bottom: 0; width: 100%;">수동으로 위젯에 추가</button>
                    </div>
                </div>

            </div>

            <!-- 오른쪽: 선택된 위젯 목록 -->
            <div style="flex: 1; min-width: 300px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="color: #0077b6; margin: 0;">📋 선택된 위젯 목록 (<span id="widget-selected-count">0</span>곡)</h4>
                    <button type="button" onclick="clearWidgetSongs()" style="background-color: #ef4444; padding: 4px 8px; font-size: 11px; margin-bottom: 0;">전체 삭제</button>
                </div>
                
                <div id="widget-selected-list" style="height: 270px; max-height: 270px; overflow-y: auto; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 8px;">
                    <div style="padding: 10px; color: #64748b; text-align: center; font-size: 13px;">선택된 곡이 없습니다.</div>
                </div>
            </div>

        </div>
        <div id="widget-status" class="status-msg"></div>
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
        
        // 1. 원본 songlist 불러오기
        const songRes = await fetch(WORKER_URL + "?type=songlist&t=" + timestamp);
        if (songRes.ok) {
            const data = await songRes.json();
            songData = { notice: data.notice || "", songs: Array.isArray(data.songs) ? data.songs : [] };
        }

        // 2. 서버에서 위젯 전용 목록 불러오기
        const widgetRes = await fetch(WORKER_URL + "?type=widget&t=" + timestamp);
        if (widgetRes.ok) {
            const widgetData = await widgetRes.json();
            widgetSelectedSongs = Array.isArray(widgetData.songs) ? widgetData.songs : [];
            widgetBgColor = widgetData.bgColor || "transparent"; // 배경색 불러오기
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
    switchWidgetTab('search');
    const searchInput = document.getElementById("widget-song-search");
    if (searchInput) searchInput.value = "";
    
    // 배경색 UI 반영
    const bgInput = document.getElementById("widget-bg-color-input");
    const bgPicker = document.getElementById("widget-bg-color-picker");
    if (bgInput) bgInput.value = widgetBgColor;
    if (bgPicker && widgetBgColor.startsWith('#')) bgPicker.value = widgetBgColor;

    renderWidgetSearchPool();
    renderWidgetSelectedList();
}

// 🎨 배경색 변경 핸들러
function updateBgColorFromPicker(color) {
    const bgInput = document.getElementById("widget-bg-color-input");
    if (bgInput) bgInput.value = color;
    widgetBgColor = color;
    autoSaveWidgetSongs();
}

function updateBgColorFromInput(color) {
    widgetBgColor = color.trim() || "transparent";
    const bgPicker = document.getElementById("widget-bg-color-picker");
    if (bgPicker && widgetBgColor.startsWith('#')) {
        bgPicker.value = widgetBgColor;
    }
    autoSaveWidgetSongs();
}

function setTransparentBg() {
    widgetBgColor = "transparent";
    const bgInput = document.getElementById("widget-bg-color-input");
    if (bgInput) bgInput.value = "transparent";
    autoSaveWidgetSongs();
    showToast("위젯 배경이 투명으로 설정되었습니다.");
}

// 탭 전환 기능
function switchWidgetTab(mode) {
    const searchSubPanel = document.getElementById("sub-panel-search");
    const manualSubPanel = document.getElementById("sub-panel-manual");
    const searchBtn = document.getElementById("tab-btn-search");
    const manualBtn = document.getElementById("tab-btn-manual");

    if (!searchSubPanel || !manualSubPanel) return;

    if (mode === 'search') {
        searchSubPanel.style.display = "block";
        manualSubPanel.style.display = "none";
        if (searchBtn) searchBtn.style.backgroundColor = "#0284c7";
        if (manualBtn) manualBtn.style.backgroundColor = "#64748b";
    } else {
        searchSubPanel.style.display = "none";
        manualSubPanel.style.display = "block";
        if (searchBtn) searchBtn.style.backgroundColor = "#64748b";
        if (manualBtn) manualBtn.style.backgroundColor = "#0284c7";
    }
}

// 검색 풀 렌더링
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
        
        const badgeHTML = getLimitBadgeHTML(song.limit);

        div.innerHTML = `
            <div style="display: flex; align-items: center; overflow: hidden; flex: 1; margin-right: 10px;">
                ${badgeHTML}
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <strong>${escapeHtml(song.title)}</strong> 
                    <span style="color: #64748b;">(${escapeHtml(song.artist || '가수 미상')})</span>
                </div>
            </div>
            <button type="button" onclick='addSongToWidget(${JSON.stringify(song)})' style="background-color: #10b981; padding: 4px 8px; font-size: 12px; margin-bottom: 0; white-space: nowrap;">선택</button>
        `;
        resultContainer.appendChild(div);
    });
}

function addSongToWidget(song) {
    const exists = widgetSelectedSongs.some(item => item.title === song.title && item.artist === song.artist);
    if (exists) {
        showToast("이미 위젯 목록에 추가된 곡입니다.");
        return;
    }

    widgetSelectedSongs.push({ ...song, checked: false });
    renderWidgetSelectedList();
    autoSaveWidgetSongs();
    showToast(`'${song.title}' 곡이 추가되었습니다.`);
}

function addManualSongToWidget() {
    const titleInput = document.getElementById("manual-title");
    const artistInput = document.getElementById("manual-artist");
    const limitInput = document.getElementById("manual-limit");

    const title = titleInput ? titleInput.value.trim() : "";
    const artist = artistInput ? artistInput.value.trim() : "";
    const limit = limitInput ? limitInput.value.trim() : "";

    if (!title) {
        alert("노래 제목을 입력해주세요.");
        if (titleInput) titleInput.focus();
        return;
    }

    const newSong = {
        title: title,
        artist: artist,
        genre: "",
        limit: limit,
        etc: "",
        checked: false
    };

    widgetSelectedSongs.push(newSong);
    renderWidgetSelectedList();
    autoSaveWidgetSongs();

    if (titleInput) titleInput.value = "";
    if (artistInput) artistInput.value = "";
    if (limitInput) limitInput.value = "";

    showToast(`'${title}' 곡이 수동 추가되었습니다.`);
}

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
        
        const badgeHTML = getLimitBadgeHTML(song.limit);

        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px; flex: 1; overflow: hidden; margin-right: 10px;">
                <input type="checkbox" style="margin-bottom: 0;" ${song.checked ? 'checked' : ''} onchange="toggleWidgetSongCheck(${index}, this.checked)">
                ${badgeHTML}
                <span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${escapeHtml(song.title)}">
                    <strong>${escapeHtml(song.title)}</strong> <span style="color: #64748b; font-size: 11px;">(${escapeHtml(song.artist || '-')})</span>
                </span>
            </div>
            <button type="button" onclick="removeSongFromWidget(${index})" style="background-color: #ef4444; padding: 4px 8px; font-size: 12px; margin-bottom: 0; white-space: nowrap;">삭제</button>
        `;
        container.appendChild(div);
    });
}

function toggleWidgetSongCheck(index, isChecked) {
    if (widgetSelectedSongs[index]) {
        widgetSelectedSongs[index].checked = isChecked;
        autoSaveWidgetSongs();
    }
}

function removeSongFromWidget(index) {
    widgetSelectedSongs.splice(index, 1);
    renderWidgetSelectedList();
    autoSaveWidgetSongs();
}

function clearWidgetSongs() {
    if (widgetSelectedSongs.length === 0) return;
    if (confirm("위젯 목록에 있는 모든 곡을 삭제하시겠습니까?")) {
        widgetSelectedSongs = [];
        renderWidgetSelectedList();
        autoSaveWidgetSongs();
        showToast("위젯 목록이 초기화되었습니다.");
    }
}

// 📌 서버 저장 (songs 목록과 배경색인 bgColor를 함께 저장)
async function autoSaveWidgetSongs() {
    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password: document.getElementById("admin-password").value,
                fileType: "widget", 
                content: { 
                    songs: widgetSelectedSongs,
                    bgColor: widgetBgColor 
                }
            })
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "자동 저장 실패");
        }
    } catch (error) {
        showToast("저장 오류: " + error.message);
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
