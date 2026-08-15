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

// 🔒 관리자 UI 템플릿 (깔끔한 정렬 및 박스 모델 적용)
const adminHtmlTemplate = `
    <div id="dashboard-section" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #03045e;">🛠️ 관리자 대시보드</h3>
            <button onclick="location.reload()" style="background-color: #64748b; color: white; border: none; padding: 6px 12px; font-size: 13px; border-radius: 6px; cursor: pointer;">로그아웃</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-top: 20px;">
            <div class="menu-card" onclick="window.open('https://lunaplena0.github.io/admin.html', '_blank')" style="cursor: pointer; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; transition: 0.2s;">
                <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #0284c7;">관리페이지로 이동</h4>
                <p style="margin: 0; font-size: 12px; color: #64748b;">전체 관리 페이지 새 창으로 열기</p>
            </div>
            <div class="menu-card" onclick="showPanel('widget-songs')" style="cursor: pointer; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; transition: 0.2s;">
                <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #0284c7;">노래위젯 관리 및 설정</h4>
                <p style="margin: 0; font-size: 12px; color: #64748b;">위젯 목록 및 배경색/투명도 설정</p>
            </div>
        </div>
    </div>

    <div id="panel-widget-songs" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">🎛️ 노래 위젯 관리 및 설정</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; color: white; border: none; padding: 6px 12px; font-size: 13px; border-radius: 6px; cursor: pointer;">← 메뉴 목록으로</button>
        </div>

        <div style="background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <strong style="color: #0369a1; font-size: 14px;">🎨 위젯 배경색 및 불투명도 설정</strong>
                <button type="button" onclick="setTransparentBg()" style="background-color: #64748b; color: white; border: none; padding: 5px 10px; font-size: 12px; border-radius: 4px; cursor: pointer;">완전 투명하게</button>
            </div>
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px; background: rgba(255,255,255,0.7); padding: 10px 14px; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 13px; font-weight: 500;">색상:</span>
                    <input type="color" id="widget-bg-color-picker" onchange="updateBgColorFromPicker(this.value)" style="width: 32px; height: 30px; border: none; cursor: pointer; background: none; vertical-align: middle;">
                    <input type="text" id="widget-bg-color-input" oninput="updateBgColorFromInput(this.value)" style="width: 95px; padding: 5px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 220px;">
                    <span style="font-size: 13px; font-weight: 500;">불투명도:</span>
                    <input type="range" id="widget-bg-opacity-slider" min="0" max="100" value="100" oninput="updateBgOpacity(this.value)" style="flex: 1; cursor: pointer;">
                    <span id="widget-bg-opacity-text" style="font-size: 13px; font-weight: 600; width: 35px; text-align: right;">100%</span>
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button type="button" id="tab-btn-search" onclick="switchWidgetTab('search')" style="background-color: #0284c7; color: white; border: none; padding: 6px 14px; font-size: 13px; border-radius: 6px; cursor: pointer;">🔍 검색해서 추가</button>
            <button type="button" id="tab-btn-manual" onclick="switchWidgetTab('manual')" style="background-color: #64748b; color: white; border: none; padding: 6px 14px; font-size: 13px; border-radius: 6px; cursor: pointer;">✏️ 수동 입력 추가</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; align-items: start;">
            <!-- 왼쪽: 추가 패널 (검색 / 수동) -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; box-sizing: border-box;">
                <div id="sub-panel-search">
                    <input type="text" id="widget-song-search" placeholder="제목 또는 가수 검색..." oninput="renderWidgetSearchPool()" style="margin-bottom: 10px; width: 100%; padding: 8px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    <div id="widget-search-results" style="height: 235px; overflow-y: auto; border: 1px solid #cbd5e1; background: #fff; padding: 6px; border-radius: 6px;"></div>
                </div>
                <div id="sub-panel-manual" style="display: none;">
                    <input type="text" id="manual-title" placeholder="노래 제목 *" style="margin-bottom: 10px; padding: 8px; font-size: 13px; width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    <input type="text" id="manual-artist" placeholder="아티스트" style="margin-bottom: 10px; padding: 8px; font-size: 13px; width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    <input type="text" id="manual-limit" placeholder="Limit 태그" style="margin-bottom: 10px; padding: 8px; font-size: 13px; width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    <button type="button" onclick="addManualSongToWidget()" style="background-color: #0284c7; width: 100%; padding: 8px; color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600;">추가하기</button>
                </div>
            </div>
            <!-- 오른쪽: 선택된 목록 -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; box-sizing: border-box;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0; font-size: 14px; color: #1e293b;">📋 선택된 목록 (<span id="widget-selected-count">0</span>곡)</h4>
                    <button type="button" onclick="clearWidgetSongs()" style="background-color: #ef4444; color: white; border: none; padding: 4px 8px; font-size: 11px; border-radius: 4px; cursor: pointer;">전체 삭제</button>
                </div>
                <div id="widget-selected-list" style="height: 270px; overflow-y: auto; border: 1px solid #cbd5e1; background: #fff; padding: 6px; border-radius: 6px;"></div>
            </div>
        </div>
        <div id="widget-status" class="status-msg" style="margin-top: 12px; font-weight: bold; color: #10b981; font-size: 13px; min-height: 20px;"></div>
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
    if (widgetBgColor !== "transparent" && widgetBgColor.startsWith('#')) {
        document.getElementById("widget-bg-color-picker").value = widgetBgColor;
    }
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
        if (statusEl) {
            statusEl.textContent = "✅ 변경사항이 실시간으로 저장되었습니다.";
            setTimeout(() => { statusEl.textContent = ""; }, 2000);
        }
    });
}

// 📌 검색 풀 렌더링 함수
function renderWidgetSearchPool() {
    const searchInput = document.getElementById("widget-song-search");
    const container = document.getElementById("widget-search-results");
    if (!container) return;

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    container.innerHTML = "";

    const songs = songData.songs || [];
    const filtered = songs.filter(song => {
        const title = (song.title || "").toLowerCase();
        const artist = (song.artist || "").toLowerCase();
        return title.includes(query) || artist.includes(query);
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="padding: 15px; color: #64748b; text-align: center; font-size: 13px;">검색 결과가 없습니다.</div>`;
        return;
    }

    filtered.forEach((song) => {
        const div = document.createElement("div");
        div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px solid #f1f5f9; cursor: pointer; border-radius: 4px; transition: background 0.1s;";
        div.onmouseover = () => div.style.background = "#e2e8f0";
        div.onmouseout = () => div.style.background = "transparent";

        div.innerHTML = `
            <div style="flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13px; margin-right: 8px;">
                ${getLimitBadgeHTML(song.limit)} <strong style="color: #1e293b;">${escapeHtml(song.title)}</strong> <span style="color: #64748b; font-size: 12px;">(${escapeHtml(song.artist || '-')})</span>
            </div>
            <button type="button" style="background-color: #0284c7; color: white; border: none; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; flex-shrink: 0;">추가</button>
        `;
        div.onclick = () => addSongToWidget(song);
        container.appendChild(div);
    });
}

function addSongToWidget(song) {
    widgetSelectedSongs.push({ ...song, checked: false });
    renderWidgetSelectedList();
    autoSaveWidgetSongs();
    showToast(`'${song.title}' 추가됨`);
}

// 📌 수동 입력 추가 함수
function addManualSongToWidget() {
    const titleInput = document.getElementById("manual-title");
    const artistInput = document.getElementById("manual-artist");
    const limitInput = document.getElementById("manual-limit");

    const title = titleInput.value.trim();
    if (!title) {
        alert("노래 제목을 입력해주세요.");
        titleInput.focus();
        return;
    }

    const newSong = {
        title: title,
        artist: artistInput.value.trim(),
        limit: limitInput.value.trim(),
        checked: false
    };

    widgetSelectedSongs.push(newSong);
    renderWidgetSelectedList();
    autoSaveWidgetSongs();
    showToast(`'${title}' 수동 추가됨`);

    titleInput.value = "";
    artistInput.value = "";
    limitInput.value = "";
    titleInput.focus();
}

function renderWidgetSelectedList() {
    const container = document.getElementById("widget-selected-list");
    const countBadge = document.getElementById("widget-selected-count");
    if (!container || !countBadge) return;
    
    container.innerHTML = "";
    countBadge.textContent = widgetSelectedSongs.length;
    
    if (widgetSelectedSongs.length === 0) {
        container.innerHTML = `<div style="padding: 15px; color: #64748b; text-align: center; font-size: 13px;">선택된 노래가 없습니다.</div>`;
        return;
    }

    widgetSelectedSongs.forEach((song, index) => {
        const div = document.createElement("div");
        div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px solid #f1f5f9; gap: 8px;";
        div.innerHTML = `
            <div style="display: flex; align-items: center; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13px; gap: 6px;">
                <input type="checkbox" ${song.checked ? 'checked' : ''} onchange="toggleWidgetSongCheck(${index}, this.checked)" style="cursor: pointer; flex-shrink: 0;">
                <div style="overflow: hidden; text-overflow: ellipsis; flex: 1;">
                    ${getLimitBadgeHTML(song.limit)} <strong style="color: #1e293b;">${escapeHtml(song.title)}</strong>
                </div>
            </div>
            <button type="button" onclick="removeSongFromWidget(${index})" style="background: #ef4444; color: #fff; border:none; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; flex-shrink: 0;">삭제</button>
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
    
    const searchBtn = document.getElementById("tab-btn-search");
    const manualBtn = document.getElementById("tab-btn-manual");
    if (searchBtn && manualBtn) {
        searchBtn.style.backgroundColor = mode === 'search' ? '#0284c7' : '#64748b';
        manualBtn.style.backgroundColor = mode === 'manual' ? '#0284c7' : '#64748b';
    }
}

function updateBgColorFromInput(val) {
    widgetBgColor = val;
    const picker = document.getElementById("widget-bg-color-picker");
    if (picker && val.startsWith('#') && val.length === 7) {
        picker.value = val;
    }
    autoSaveWidgetSongs();
}

function updateBgColorFromPicker(val) {
    widgetBgColor = val;
    const input = document.getElementById("widget-bg-color-input");
    if (input) {
        input.value = val;
    }
    autoSaveWidgetSongs();
}

function setTransparentBg() {
    widgetBgColor = "transparent";
    const input = document.getElementById("widget-bg-color-input");
    if (input) input.value = "transparent";
    autoSaveWidgetSongs();
}

function updateBgOpacity(val) {
    widgetBgOpacity = val;
    const textEl = document.getElementById("widget-bg-opacity-text");
    if (textEl) textEl.textContent = val + "%";
    autoSaveWidgetSongs();
}

function showToast(msg) {
    console.log(msg);
}
