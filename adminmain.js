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
    logoUrl: "mainpages.html",
    menuItems: []
};

// 🔒 로그인 성공 시 동적으로 주입할 관리자 UI 전체 HTML 템플릿 (메인페이지 패널 포함)
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
    </div>

    <div id="panel-mainpage" class="card" style="display: none;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #03045e;">🏠 메인페이지 수정</h3>
        <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
    </div>

    <!-- 네비게이션 배경색 설정 -->
    <label>네비게이션 배경 색상</label>
    <input type="text" id="mp-nav-bgcolor" placeholder="예: rgba(3, 4, 94, 0.9)">

    <!-- 로고 텍스트 설정 -->
    <label>로고 텍스트</label>
    <input type="text" id="mp-logo-text" placeholder="예: BABABI FAN ARCHIVE">

    <!-- [추가됨] 네비게이션바 아래 메인페이지 본문 처음 영역 설정 -->
    <label>메인페이지 첫 화면 본문/HTML 설정</label>
    <textarea id="mp-main-content" placeholder="메인페이지 상단 본문에 노출할 텍스트나 HTML을 입력하세요" style="height: 120px; resize: vertical;"></textarea>

    <!-- 네비게이션 메뉴 목록 관리 영역 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
        <h4 style="color: #0077b6; margin: 0;">네비게이션 메뉴 목록</h4>
        <button type="button" onclick="addMainPageMenuRow()" style="background-color: #10b981; padding: 4px 10px; font-size: 12px;">+ 메뉴 추가</button>
    </div>
    
    <div id="mp-menu-rows-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        <!-- 동적 메뉴 행 -->
    </div>

    <button onclick="saveMainPageSettings()" style="width: 100%; margin-top: 15px; background-color: #0077b6; padding: 14px; font-size: 16px;">메인페이지 설정 반영하기</button>
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

        <label>캐치프레이즈 (닉네임 하단에 파란색 글씨)</label>
        <textarea id="p-catchphrase" class="profile-textarea" placeholder="𝐏 𝐫 𝐨 𝐟 𝐢 𝐥 𝐞"></textarea>

        <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
            <h4 style="color: #0077b6; margin: 0;">상세 프로필 정보</h4>
            <button onclick="addDetailRow()" style="background-color: #10b981; padding: 4px 10px; font-size: 12px;">+ 항목 추가</button>
        </div>
         
        <div id="detail-rows-container"></div>

        <label style="margin-top: 20px;">방송시간</label>
        <input type="text" id="p-time" placeholder="평일 오후 4시 / 주말 오후 2시">

        <label>컨텐츠</label>
        <input type="text" id="p-content" placeholder="소통 & 노래 & 춤 & 기타연주 노래 & ASMR">

        <h4 style="color: #0077b6; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">하단 소개말 (메시지)</h4>
        <label style="font-size: 13px;">첫 번째 줄 (강조 문구)</label>
        <input type="text" id="p-bio1" placeholder="바다의 작은 용 , 잘못 만지면 아파요! ↜(⃔っ•̤ ༝ •̤c)⃕">
         
        <label style="font-size: 13px;">두 번째 줄 (대사/소개)</label>
        <textarea id="p-bio2" class="profile-textarea" placeholder="바다의 작은 용? 아니, 바다의 독가시!..."></textarea>

        <button onclick="saveProfile()" style="width: 100%; margin-top: 15px;">페이지에 자기소개 반영하기</button>
        <div id="intro-status" class="status-msg"></div>
    </div>

    <!-- 링크 수정 패널 -->
    <div id="panel-links" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">🔗 링크 페이지 관리</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>
         
        <p style="color: #64748b; font-size: 14px; margin-bottom: 15px;">
            프로필 링크 페이지에 보여질 버튼들을 자유롭게 추가하고 관리하세요.
        </p>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="color: #0077b6; margin: 0;">링크 목록</h4>
        </div>

        <div id="links-rows-container" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px;"></div>

        <button onclick="addLinkRow()" style="background-color: #10b981; width: 100%; padding: 10px; font-size: 14px; margin-bottom: 20px;">+ 새 링크 추가</button>

        <button onclick="saveLinks()" style="width: 100%; background-color: #0077b6; padding: 14px; font-size: 16px;">페이지에 링크 변경사항 반영하기</button>
        <div id="links-status" class="status-msg"></div>
    </div>
     
    <!-- 노래책 수정 패널 -->
    <div id="panel-songs" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">📝 노래책 내용 편집</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>

        <div style="margin-bottom: 25px;">
            <label for="notice-input">📢 공지사항 내용</label>
            <textarea id="notice-input" placeholder="공지사항을 입력하세요..."></textarea>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 25px;">

        <div class="batch-container">
            <div class="batch-header" onclick="toggleBatchBox()">
                <span>📊 구글 시트(엑셀) 데이터 한 번에 가져오기 (클릭하여 열기/닫기)</span>
                <span id="batch-toggle-icon">▼</span>
            </div>
            <div class="batch-body" id="batch-body-content">
                <p style="font-size: 13px; color: #166534; margin-top: 0; margin-bottom: 10px;">
                    구글 시트에서 행들을 복사(Ctrl+C)한 뒤 아래 칸에 붙여넣고 버튼을 누르세요.<br>
                    (순서: <b>제목 / 가수 / 장르 / 제한 / 기타</b>)
                </p>
                <textarea id="batch-input" placeholder="여기에 구글 시트 복사 내용을 붙여넣으세요..." style="height: 80px; background: #fff;"></textarea>
                <button onclick="importBatchSongs()" style="background-color: #16a34a; padding: 8px 16px; font-size: 13px;">붙여넣은 내용으로 목록에 추가하기</button>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
            <label style="margin: 0;">🎶 노래 목록 (<span id="song-count-badge">0</span>곡)</label>
            <div style="display: flex; gap: 10px; flex: 1; max-width: 350px;">
                <input type="text" id="search-input" placeholder="🔍 제목, 가수, 장르 검색..." oninput="renderTable()" style="margin-bottom: 0; padding: 8px 12px;">
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="downloadCsvFile()" style="background-color: #059669; padding: 8px 12px; font-size: 13px;">📥 시트 파일로 받기(CSV)</button>
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

    <!-- 모달 -->
    <div id="edit-modal">
        <div class="modal-content">
            <h3 id="modal-title" style="margin-top: 0; color: #03045e;">곡 정보 수정</h3>
            <input type="hidden" id="edit-index">
            <label style="font-size: 13px;">노래 제목</label>
            <input type="text" id="modal-title-input" placeholder="제목">
            <label style="font-size: 13px;">가수</label>
            <input type="text" id="modal-artist-input" placeholder="가수">
            <label style="font-size: 13px;">장르</label>
            <input type="text" id="modal-genre-input" placeholder="KPOP, JPOP, POP, 기타연주">
            <label style="font-size: 13px;">제한 / 조건</label>
            <input type="text" id="modal-limit-input" placeholder="200개, 300개, 기타">
            <label style="font-size: 13px;">기타 정보</label>
            <input type="text" id="modal-etc-input" placeholder="특이사항">
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="closeEditModal()" style="background-color: #64748b; flex: 1;">취소</button>
                <button onclick="saveModalSong()" style="background-color: #0077b6; flex: 1;">저장</button>
            </div>
        </div>
    </div>
`;

function showDashboard() {
    document.getElementById("dashboard-section").style.display = "block";
    document.getElementById("panel-mainpage").style.display = "none";
    document.getElementById("panel-intro").style.display = "none";
    document.getElementById("panel-links").style.display = "none";
    document.getElementById("panel-songs").style.display = "none";
}

function showPanel(type) {
    document.getElementById("dashboard-section").style.display = "none";
    document.getElementById("panel-mainpage").style.display = "none";
    document.getElementById("panel-intro").style.display = "none";
    document.getElementById("panel-links").style.display = "none";
    document.getElementById("panel-songs").style.display = "none";

    if (type === 'mainpage') {
        document.getElementById("panel-mainpage").style.display = "block";
        if (typeof initMainPagePanel === 'function') initMainPagePanel();
    } else if (type === 'intro') {
        document.getElementById("panel-intro").style.display = "block";
        if (typeof initIntroPanel === 'function') initIntroPanel();
    } else if (type === 'links') {
        document.getElementById("panel-links").style.display = "block";
        if (typeof initLinksPanel === 'function') initLinksPanel();
    } else if (type === 'songs') {
        document.getElementById("panel-songs").style.display = "block";
        if (typeof initSongsPanel === 'function') initSongsPanel();
    }
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
                menuItems: Array.isArray(data.menuItems) ? data.menuItems : []
            };
        }

        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").innerHTML = adminHtmlTemplate;
        showDashboard();

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
