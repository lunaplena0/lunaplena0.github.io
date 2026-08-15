const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";

let songData = { notice: "", songs: [] };
let widgetSelectedSongs = []; // 위젯 전용 선택 목록 데이터
let widgetBgColor = "transparent"; // 위젯 배경색 설정 값
let widgetBgOpacity = 100; // 위젯 배경 불투명도 (0 ~ 100)

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

// 🔒 관리자 UI 템플릿
const adminHtmlTemplate = `
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
                <p style="font-size: 12px;">위젯 목록 및 배경색/투명도 설정</p>
            </div>
        </div>
    </div>

    <div id="panel-widget-songs" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">🎛️ 노래 위젯 관리 및 설정</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>

        <div style="background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 15px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>🎨 위젯 배경색 및 불투명도 설정</strong>
                <button type="button" onclick="setTransparentBg()" style="background-color: #64748b; padding: 6px 10px; font-size: 12px;">완전 투명하게</button>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.6); padding: 8px 12px; border-radius: 6px;">
                <div>색상: <input type="color" id="widget-bg-color-picker" onchange="updateBgColorFromPicker(this.value)" style="width: 32px; height: 30px; border: none; cursor: pointer; background: none;"> <input type="text" id="widget-bg-color-input" oninput="updateBgColorFromInput(this.value)" style="width: 100px; padding: 4px; font-size: 12px;"></div>
                <div>불투명도: <input type="range" id="widget-bg-opacity-slider" min="0" max="100" value="100" oninput="updateBgOpacity(this.value)"> <span id="widget-bg-opacity-text">100%</span></div>
            </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button type="button" id="tab-btn-search" onclick="switchWidgetTab('search')" style="background-color: #0284c7; padding: 6px 14px; font-size: 13px;">🔍 검색해서 추가</button>
            <button type="button" id="tab-btn-manual" onclick="switchWidgetTab('manual')" style="background-color: #64748b; padding: 6px 14px; font-size: 13px;">✏️ 수동 입력 추가</button>
        </div>

        <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px;">
                <div id="sub-panel-search">
                    <input type="text" id="widget-song-search" placeholder="제목 또는 가수 검색..." oninput="renderWidgetSearchPool()" style="margin-bottom: 10px;">
                    <div id="widget-search-results" style="height: 200px; overflow-y: auto; border: 1px solid #cbd5e1; background: #fff; padding: 8px;"></div>
                </div>
                <div id="sub-panel-manual" style="display: none;">
                    <input type="text" id="manual-title" placeholder="노래 제목 *" style="margin-bottom: 10px; padding: 6px;">
                    <input type="text" id="manual-artist" placeholder="아티스트" style="margin-bottom: 10px; padding: 6px;">
                    <input type="text" id="manual-limit" placeholder="Limit 태그" style="margin-bottom: 10px; padding: 6px;">
                    <button type="button" onclick="addManualSongToWidget()" style="background-color: #0284c7; width: 100%; padding: 8px;">추가</button>
                </div>
            </div>
            <div style="flex: 1; min-width: 300px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0;">📋 선택된 목록 (<span id="widget-selected-count">0</span>곡)</h4>
                    <button type="button" onclick="clearWidgetSongs()" style="background-color: #ef4444; padding: 4px 8px; font-size: 11px;">전체 삭제</button>
                </div>
                <div id="widget-selected-list" style="height: 270px; overflow-y: auto; border: 1px solid #cbd5e1; background: #fff; padding: 8px;"></div>
            </div>
        </div>
        <div id="widget-status" class="status-msg" style="margin-top: 10px; font-weight: bold; color: #10b981;"></div>
    </div>
`;

// 📌 핵심 기능 함수들
async function verifyAndLoad() {
    const password = document.getElementById("admin-password").value;
    try {
        const authResponse = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: password, action: "verify", fileType: "verify" })
        });
        if (!authResponse.ok) throw new Error("비밀번호 오류");
        
        const timestamp = new Date().getTime();
        const [songRes, widgetRes] = await Promise.all([
            fetch(WORKER_URL + "?type=songlist&t=" + timestamp),
            fetch(WORKER_URL + "?type=widget&t=" + timestamp)
        ]);
        
        songData = await songRes.json();
        const widgetData = await widgetRes.json();
        widgetSelectedSongs = widgetData.songs || [];
        widgetBgColor = widgetData.bgColor || "transparent";
        widgetBgOpacity = widgetData.bgOpacity ?? 100;
        
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").innerHTML = adminHtmlTemplate;
        showDashboard();
    } catch (e) {
        alert("로그인 실패: " + e.message);
    }
}

function showDashboard() {
    document.getElementById("dashboard-section").style.display = "block";
    document.getElementById("panel-widget-songs").style.display = "none";
}

function showPanel(type) {
    document.getElementById("dashboard-section").style.display = "none";
    if (type === 'widget-songs') {
        document.getElementById("panel-widget-songs").style.display = "block";
        initWidgetSongsPanel();
    }
}

function initWidgetSongsPanel() {
    switchWidgetTab('search');
    document.getElementById("widget-bg-color-input").value = widgetBgColor;
    document.getElementById("widget-bg-opacity-slider").value = widgetBgOpacity;
    document.getElementById("widget-bg-opacity-text").textContent = widgetBgOpacity + "%";
    renderWidgetSearchPool();
    renderWidgetSelectedList();
}

function autoSaveWidgetSongs() {
    fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            password: document.getElementById("admin-password").value,
            fileType: "widget",
            content: { songs: widgetSelectedSongs, bgColor: widgetBgColor, bgOpacity: widgetBgOpacity }
        })
    }).then(() => {
        const statusEl = document.getElementById("widget-status");
        statusEl.textContent = "✅ 변경사항이 실시간으로 저장되었습니다.";
        setTimeout(() => { statusEl.textContent = ""; }, 2000);
    });
}

function addSongToWidget(song) {
    // 중복 체크 로직 제거됨 (이제 중복 추가 가능)
    widgetSelectedSongs.push({ ...song, checked: false });
    renderWidgetSelectedList();
    autoSaveWidgetSongs();
    showToast(`'${song.title}' 추가됨`);
}

function renderWidgetSelectedList() {
    const container = document.getElementById("widget-selected-list");
    const countBadge = document.getElementById("widget-selected-count");
    container.innerHTML = "";
    countBadge.textContent = widgetSelectedSongs.length;
    
    widgetSelectedSongs.forEach((song, index) => {
        const div = document.createElement("div");
        div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 6px; border-bottom: 1px solid #eee;";
        div.innerHTML = `
            <div style="flex: 1; overflow: hidden; white-space: nowrap;">
                <input type="checkbox" ${song.checked ? 'checked' : ''} onchange="toggleWidgetSongCheck(${index}, this.checked)">
                ${getLimitBadgeHTML(song.limit)} <strong>${escapeHtml(song.title)}</strong>
            </div>
            <button onclick="removeSongFromWidget(${index})" style="background: #ef4444; color: #fff; border:none; padding: 2px 6px;">삭제</button>
        `;
        container.appendChild(div);
    });
}

function toggleWidgetSongCheck(index, isChecked) {
    widgetSelectedSongs[index].checked = isChecked;
    autoSaveWidgetSongs();
}

function removeSongFromWidget(index) {
    widgetSelectedSongs.splice(index, 1);
    renderWidgetSelectedList();
    autoSaveWidgetSongs();
}

function clearWidgetSongs() {
    if (confirm("전체 삭제하시겠습니까?")) {
        widgetSelectedSongs = [];
        renderWidgetSelectedList();
        autoSaveWidgetSongs();
    }
}

function switchWidgetTab(mode) {
    document.getElementById("sub-panel-search").style.display = mode === 'search' ? 'block' : 'none';
    document.getElementById("sub-panel-manual").style.display = mode === 'manual' ? 'block' : 'none';
}

function updateBgColorFromInput(val) { widgetBgColor = val; autoSaveWidgetSongs(); }
function updateBgOpacity(val) { widgetBgOpacity = val; document.getElementById("widget-bg-opacity-text").textContent = val + "%"; autoSaveWidgetSongs(); }

function showToast(msg) {
    console.log(msg); // 필요시 alert 또는 UI 구현
}
