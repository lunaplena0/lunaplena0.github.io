const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";
const GITHUB_BASE_URL = "https://lunaplena0.github.io/";

let songData = { notice: "", songs: [] };
let profileData = { 
    name: "", image: "", catchphrase: "", details: [], 
    time: "", content: "", bio1: "", bio2: "" 
};
let linksData = []; 

let mainpageData = {
    navBgColor: "rgba(3, 4, 94, 0.9)",
    logoText: "BABABI FAN ARCHIVE",
    mainContent: "", 
    menuItems: []
};

// 🔒 로그인 성공 시 동적으로 주입할 관리자 UI 전체 HTML 템플릿
const adminHtmlTemplate = `
    <!-- 대시보드 메뉴 -->
    <div id="dashboard-section" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #03045e;">🛠️ 관리 메뉴 선택</h3>
            <button onclick="location.reload()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">로그아웃</button>
        </div>
        <p style="color: #64748b; font-size: 14px;">수정할 항목을 선택해주세요.</p>
         
        <div class="menu-grid">
            <div class="menu-card" onclick="showPanel('intro')">
                <h4>👤 자기소개 수정</h4>
                <p>이름, 프로필 이미지, 정보 변경</p>
            </div>
            <div class="menu-card" onclick="showPanel('links')">
                <h4>🔗 링크 수정</h4>
                <p>외부 링크 관리</p>
            </div>
            <div class="menu-card" onclick="showPanel('songs')">
                <h4>🎶 노래책 수정</h4>
                <p>노래 공지, 곡 목록 추가/삭제/편집</p>
            </div>
            <div class="menu-card" onclick="showPanel('mainpage')">
                <h4>🏠 메인페이지 수정</h4>
                <p>메인 화면 설정 및 공통 구성 변경</p>
            </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0 20px 0;">

        <div class="menu-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="menu-card" onclick="showPanel('guide')" style="cursor: pointer;">
                <h4>📌 설정 가이드</h4>
                <p>관리 페이지 사용 방법 안내</p>
            </div>
            <div class="menu-card" style="cursor: default; opacity: 0.7;">
                <h4>📌 임시 메뉴 2</h4>
                <p>추후 확장 예정인 기능입니다</p>
            </div>
            <div class="menu-card" style="cursor: default; opacity: 0.7;">
                <h4>📌 임시 메뉴 3</h4>
                <p>추후 확장 예정인 기능입니다</p>
            </div>
        </div>
    </div>

    <!-- 설정 가이드 패널 -->
    <div id="panel-guide" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">📖 설정 가이드</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; color: #1e293b; line-height: 1.6;">
            <h4 style="color: #0077b6; margin-top: 0;">관리 페이지 이용 안내</h4>
            <p style="font-size: 14px; margin-bottom: 10px;">이곳에 직접 설정 방법을 작성하세요.</p>
        </div>
    </div>

    <!-- 메인페이지 수정 패널 -->
    <div id="panel-mainpage" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">🏠 메인페이지 수정</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>
        <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
            <div style="flex: 1.5; min-width: 300px;">
                <label>네비게이션 배경 색상</label>
                <input type="text" id="mp-nav-bgcolor" placeholder="예: rgba(3, 4, 94, 0.9)">
                <label>로고 텍스트</label>
                <input type="text" id="mp-logo-text" placeholder="예: BABABI FAN ARCHIVE">
                <label>메인페이지 첫 화면 본문/HTML 설정</label>
                <textarea id="mp-main-content" placeholder="메인페이지 상단 본문에 노출할 텍스트나 HTML을 입력하세요" style="height: 120px; resize: vertical;"></textarea>
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
                    <h4 style="color: #0077b6; margin: 0;">네비게이션 메뉴 목록</h4>
                    <button type="button" onclick="addMainPageMenuRow()" style="background-color: #10b981; padding: 4px 10px; font-size: 12px;">+ 메뉴 추가</button>
                </div>
                <div id="mp-menu-rows-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;"></div>
            </div>
            <div style="flex: 1; min-width: 250px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    <h4 style="margin: 0; color: #1e293b; font-size: 15px;">페이지 관련 공지</h4>
                </div>
                <div id="mp-memo-notice-box" style="width: 100%; height: 320px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-size: 13px; color: #0f172a; overflow-y: auto; white-space: pre-wrap; box-sizing: border-box; line-height: 1.5; text-align: center;"></div>
            </div>
        </div>
        <button onclick="saveMainPageSettings()" style="width: 100%; margin-top: 25px; background-color: #0077b6; padding: 14px; font-size: 16px;">메인페이지 설정 반영하기</button>
        <div id="mainpage-status" class="status-msg"></div>
    </div>

    <!-- 자기소개 수정 패널 -->
    <div id="panel-intro" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">👤 자기소개 수정</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>
        <label>활동 이름</label>
        <input type="text" id="p-name" placeholder="예: 바다비。">
        <label>프로필 이미지 (업로드)</label>
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
            <input type="file" id="p-image-file" accept="image/*" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; margin-bottom: 0;">
            <button type="button" onclick="uploadProfileImage()" style="background-color: #0284c7; padding: 10px 16px; font-size: 13px; white-space: nowrap; margin-bottom: 0;">업로드</button>
        </div>
        <div id="image-status" style="font-size: 13px; margin-bottom: 12px; font-weight: 500; min-height: 18px;"></div>
        <input type="text" id="p-image" placeholder="업로드된 이미지 주소가 여기에 자동으로 입력됩니다" readonly style="background: #f1f5f9; color: #475569; font-size: 13px;">
        <label>캐치프레이즈</label>
        <textarea id="p-catchphrase" class="profile-textarea"></textarea>
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
            <h4 style="color: #0077b6; margin: 0;">상세 프로필 정보</h4>
            <button onclick="addDetailRow()" style="background-color: #10b981; padding: 4px 10px; font-size: 12px;">+ 항목 추가</button>
        </div>
        <div id="detail-rows-container"></div>
        <label style="margin-top: 20px;">방송시간</label>
        <input type="text" id="p-time">
        <label>컨텐츠</label>
        <input type="text" id="p-content">
        <h4 style="color: #0077b6; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">하단 소개말</h4>
        <label style="font-size: 13px;">첫 번째 줄</label>
        <input type="text" id="p-bio1">
        <label style="font-size: 13px;">두 번째 줄</label>
        <textarea id="p-bio2" class="profile-textarea"></textarea>
        <button onclick="saveProfile()" style="width: 100%; margin-top: 15px;">페이지에 자기소개 반영하기</button>
        <div id="intro-status" class="status-msg"></div>
    </div>

    <!-- 링크 및 노래책 패널 생략 (기존과 동일) -->
    <div id="panel-links" class="card" style="display: none;">...</div>
    <div id="panel-songs" class="card" style="display: none;">...</div>
`;

function showDashboard() {
    const panels = ['dashboard-section', 'panel-mainpage', 'panel-intro', 'panel-links', 'panel-songs', 'panel-guide'];
    panels.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = (id === 'dashboard-section') ? 'block' : 'none';
    });
}

function showPanel(type) {
    const panels = {
        'dashboard-section': 'none',
        'panel-mainpage': (type === 'mainpage' ? 'block' : 'none'),
        'panel-intro': (type === 'intro' ? 'block' : 'none'),
        'panel-links': (type === 'links' ? 'block' : 'none'),
        'panel-songs': (type === 'songs' ? 'block' : 'none'),
        'panel-guide': (type === 'guide' ? 'block' : 'none')
    };
    
    document.getElementById("dashboard-section").style.display = "none";
    for (const [id, display] of Object.entries(panels)) {
        const el = document.getElementById(id);
        if(el) el.style.display = display;
    }

    if (type === 'mainpage' && typeof window.initMainPagePanel === 'function') window.initMainPagePanel();
    else if (type === 'intro' && typeof initIntroPanel === 'function') initIntroPanel();
    else if (type === 'links' && typeof initLinksPanel === 'function') initLinksPanel();
    else if (type === 'songs' && typeof initSongsPanel === 'function') initSongsPanel();
}

function initMainPagePanel(retryCount = 0) {
    const navBgInput = document.getElementById("mp-nav-bgcolor");
    const logoTextInput = document.getElementById("mp-logo-text");
    const mainContentInput = document.getElementById("mp-main-content");
    const memoNoticeBox = document.getElementById("mp-memo-notice-box"); // 📌 읽기 전용 공지 박스
    const container = document.getElementById("mp-menu-rows-container");

    if (navBgInput) navBgInput.value = mainpageData.navBgColor || "";
    if (logoTextInput) logoTextInput.value = mainpageData.logoText || "";
    if (mainContentInput) mainContentInput.value = mainpageData.mainContent || "";
    
    // 📌 코드에 넣어둔 memo 내용을 읽기 전용 박스에 바로 출력
    if (memoNoticeBox) {
        memoNoticeBox.textContent = mainpageData.memo;
    }

    try {
        if (typeof renderMainPageMenuRows === 'function') {
            renderMainPageMenuRows();
        }
    } catch (err) {
        console.error("⚠️ 메뉴 렌더링 중 에러 발생:", err);
    }
}

function renderMainPageMenuRows() {
    const container = document.getElementById("mp-menu-rows-container");
    if (!container) return;
    
    container.innerHTML = "";
    const items = Array.isArray(mainpageData.menuItems) ? mainpageData.menuItems : [];

    if (items.length === 0) {
        container.innerHTML = `<div style="color: #64748b; font-size: 13px; text-align: center; padding: 10px;">등록된 메뉴가 없습니다. '+ 메뉴 추가' 버튼을 눌러주세요.</div>`;
        return;
    }

    items.forEach((item, index) => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; gap: 10px; align-items: center; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1;";
        row.innerHTML = `
            <input type="text" placeholder="메뉴 이름" value="${escapeHtml(item.name || '')}" oninput="updateMainPageMenu(${index}, 'name', this.value)" style="flex: 1; margin-bottom: 0; padding: 6px;">
            <input type="text" placeholder="연결 주소" value="${escapeHtml(item.url || '')}" oninput="updateMainPageMenu(${index}, 'url', this.value)" style="flex: 1.5; margin-bottom: 0; padding: 6px;">
            <button type="button" onclick="removeMainPageMenu(${index})" style="background-color: #ef4444; padding: 6px 12px; font-size: 13px; margin-bottom: 0;">삭제</button>
        `;
        container.appendChild(row);
    });
}

function updateMainPageMenu(index, field, value) {
    if (mainpageData.menuItems[index]) {
        mainpageData.menuItems[index][field] = value;
    }
}

function addMainPageMenuRow() {
    if (!Array.isArray(mainpageData.menuItems)) mainpageData.menuItems = [];
    mainpageData.menuItems.push({ name: "", url: "" });
    renderMainPageMenuRows();
}

function removeMainPageMenu(index) {
    if (mainpageData.menuItems) {
        mainpageData.menuItems.splice(index, 1);
        renderMainPageMenuRows();
    }
}

async function saveMainPageSettings() {
    const navBgInput = document.getElementById("mp-nav-bgcolor");
    const logoTextInput = document.getElementById("mp-logo-text");
    const mainContentInput = document.getElementById("mp-main-content");

    if (navBgInput) mainpageData.navBgColor = navBgInput.value.trim();
    if (logoTextInput) mainpageData.logoText = logoTextInput.value.trim();
    if (mainContentInput) mainpageData.mainContent = mainContentInput.value.trim();
    
    // 💡 읽기 전용이므로 기존에 서버에서 불러왔던 `mainpageData.memo` 값을 그대로 유지한 채 전송합니다.
    await saveDataToWorker("mainpage", mainpageData, "mainpage-status");
}

async function verifyAndLoad() {
    const password = document.getElementById("admin-password").value;
    const statusEl = document.getElementById("login-status");
    if (!password) { statusEl.style.color = "#ef4444"; statusEl.textContent = "비밀번호를 입력해주세요."; return; }

    statusEl.style.color = "#0077b6";
    statusEl.textContent = "비밀번호 확인 및 데이터 로드 중...";

    try {
        const authResponse = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                password: password, 
                action: "verify",
                fileType: "verify" 
            })
        });

        if (!authResponse.ok) {
            const errResult = await authResponse.json();
            throw new Error(errResult.error || "비밀번호가 틀렸습니다.");
        }

        const timestamp = new Date().getTime();
        const [songRes, profileRes, linksRes, mainpageRes] = await Promise.all([
            fetch(WORKER_URL + "?type=songlist&t=" + timestamp),
            fetch(WORKER_URL + "?type=profile&t=" + timestamp),
            fetch(WORKER_URL + "?type=links&t=" + timestamp),
            fetch(WORKER_URL + "?type=mainpage&t=" + timestamp)
        ]);

        if (songRes.ok) {
            const data = await songRes.json();
            songData = { notice: data.notice || "", songs: Array.isArray(data.songs) ? data.songs : [] };
        }
        if (profileRes.ok) {
            const data = await profileRes.json() || {};
            let details = data.details || [];
            if (!Array.isArray(details) && typeof details === 'object') {
                details = Object.entries(details).map(([k, v]) => ({ key: k, value: v }));
            }
            profileData = {
                name: data.name || "",
                image: data.image || "",
                catchphrase: data.catchphrase || "",
                details: details,
                time: data.time || "",
                content: data.content || "",
                bio1: data.bio1 || "",
                bio2: data.bio2 || ""
            };
        }
        if (linksRes.ok) {
            const data = await linksRes.json();
            if (Array.isArray(data)) {
                linksData = data;
            } else if (data && typeof data === 'object') {
                let list = [];
                if (data.broadcast) list.push({ title: "방송국", url: data.broadcast, target: "_blank" });
                if (data.youtube) list.push({ title: "유튜브", url: data.youtube, target: "_blank" });
                linksData = list;
            } else {
                linksData = [];
            }
        }
        if (mainpageRes.ok) {
            const data = await mainpageRes.json() || {};
            
            mainpageData = {
                navBgColor: data.navBgColor || "rgba(3, 4, 94, 0.9)",
                logoText: data.logoText || "BABABI FAN ARCHIVE",
                logoUrl: data.logoUrl || "mainpages.html",
                mainContent: data.mainContent !== undefined ? data.mainContent : "", 
                menuItems: Array.isArray(data.menuItems) ? data.menuItems : [],
                memo: data.memo || "" 
            };
            window.mainpageData = mainpageData;
        }
        
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").innerHTML = adminHtmlTemplate;

        setTimeout(() => {
            const cards = document.querySelectorAll('.menu-grid .menu-card');
            if (cards.length >= 4) {
                cards[0].onclick = () => showPanel('intro');
                cards[1].onclick = () => showPanel('links');
                cards[2].onclick = () => showPanel('songs');
                cards[3].onclick = () => showPanel('mainpage');
            }
            showDashboard();
        }, 50);
        
    } catch (error) {
        statusEl.style.color = "#ef4444";
        statusEl.textContent = "로그인 실패: " + error.message;
    }
}

async function saveDataToWorker(fileType, contentObj, statusElementId) {
    const password = document.getElementById("admin-password").value;
    const statusEl = document.getElementById(statusElementId);
    statusEl.style.color = "#0077b6";
    statusEl.textContent = "페이지에 반영 중...";

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password: password,
                fileType: fileType,
                content: contentObj
            })
        });
        const result = await response.json();
        if (response.ok) {
            statusEl.style.color = "#10b981";
            statusEl.textContent = "성공적으로 업데이트되었습니다! (1~2분 뒤 반영)";
        } else {
            throw new Error(result.error || "비밀번호 오류");
        }
    } catch (error) {
        statusEl.style.color = "#ef4444";
        statusEl.textContent = "실패: " + error.message;
    }
}

function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
