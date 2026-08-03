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
            <div class="menu-card" style="cursor: default; opacity: 0.7;">
                <h4>📌 임시 메뉴 1</h4>
                <p>추후 확장 예정인 기능입니다</p>
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

    <!-- 메인페이지 수정 패널 -->
    <div id="panel-mainpage" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">🏠 메인페이지 수정</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>

        <!-- 전체 그리드 레이아웃 (좌우 1:1 비율) -->
        <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; align-items: start;">
            <!-- 좌측: 입력 폼 영역 -->
            <div style="min-width: 0;">
                <input type="text" id="mp-nav-bgcolor" placeholder="예: rgba(3, 4, 94, 0.9)" oninput="updateMainPagePreview()" onkeyup="updateMainPagePreview()">
                <input type="text" id="mp-logo-text" placeholder="예: BABABI FAN ARCHIVE" oninput="updateMainPagePreview()" onkeyup="updateMainPagePreview()">
                <textarea id="mp-main-content" placeholder="메인페이지 상단 본문에 노출할 텍스트나 HTML을 입력하세요" style="height: 120px; resize: vertical;" oninput="updateMainPagePreview()" onkeyup="updateMainPagePreview()"></textarea>

                <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
                    <h4 style="color: #0077b6; margin: 0;">네비게이션 메뉴 목록</h4>
                    <button type="button" onclick="addMainPageMenuRow()" style="background-color: #10b981; padding: 4px 10px; font-size: 12px;">+ 메뉴 추가</button>
                </div>
                
                <div id="mp-menu-rows-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;"></div>
            </div>

            <!-- 우측: 실시간 미리보기 영역 -->
            <div style="min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 5px;">
                    <h4 style="color: #0077b6; margin: 0;">👁️ 실시간 미리보기</h4>
                    <div style="display: flex; gap: 6px;">
                        <button type="button" onclick="setPreviewMode('pc')" id="btn-mode-pc" style="background-color: #0284c7; padding: 4px 8px; font-size: 11px; margin-bottom: 0;">💻 PC</button>
                        <button type="button" onclick="setPreviewMode('mobile')" id="btn-mode-mobile" style="background-color: #64748b; padding: 4px 8px; font-size: 11px; margin-bottom: 0;">📱 모바일</button>
                        <button type="button" onclick="updateMainPagePreview()" style="background-color: #059669; padding: 4px 8px; font-size: 11px; margin-bottom: 0;">🔄 새로고침</button>
                    </div>
                </div>

                <!-- 외곽 프레임 -->
                <div id="mp-preview-outer" style="display: flex; justify-content: center; background: #e2e8f0; padding: 15px; border-radius: 12px; transition: all 0.3s ease; width: 100%; box-sizing: border-box; overflow: hidden;">
                    <!-- 스케일(축소)을 적용할 가상 뷰포트 래퍼 -->
                    <div id="mp-preview-wrapper" style="width: 100%; max-width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative;">
                        
                        <!-- 내부 실제 컨텐츠를 담는 고정 해상도 컨테이너 (JS에서 width와 transform scale 제어) -->
                        <div id="preview-viewport" style="width: 1280px; transform-origin: top left; background: #fff;">
                            <div id="preview-nav" style="padding: 16px 30px; display: flex; justify-content: space-between; align-items: center; color: white; transition: background 0.2s;">
                                <span id="preview-logo" style="font-weight: bold; font-size: 18px;">BABABI FAN ARCHIVE</span>
                                <div id="preview-menu-links" style="display: flex; gap: 20px; font-size: 15px; flex-wrap: wrap;"></div>
                            </div>
                            <div id="preview-content" style="padding: 30px; min-height: 250px; font-size: 16px; color: #334155; word-break: break-all;">
                                본문 내용이 여기에 표시됩니다.
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        <button onclick="saveMainPageSettings()" style="width: 100%; margin-top: 20px; background-color: #0077b6; padding: 14px; font-size: 16px;">메인페이지 설정 반영하기</button>
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
        
        // 💡 패널이 화면에 확실히 그려진 직후 데이터 주입 및 미리보기 강제 실행
        setTimeout(() => {
            initMainPagePanel();
        }, 50);

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

function initMainPagePanel() {
    console.log("🛠️ initMainPagePanel 실행됨");

    const navBgInput = document.getElementById("mp-nav-bgcolor");
    const logoTextInput = document.getElementById("mp-logo-text");
    const mainContentInput = document.getElementById("mp-main-content");

    if (navBgInput) {
        navBgInput.value = mainpageData.navBgColor || "rgba(3, 4, 94, 0.9)";
    }
    if (logoTextInput) {
        logoTextInput.value = mainpageData.logoText || "BABABI FAN ARCHIVE";
    }
    if (mainContentInput) {
        mainContentInput.value = mainpageData.mainContent || "";
    }

    try {
        renderMainPageMenuRows();
    } catch (err) {
        console.error("⚠️ 메뉴 렌더링 중 에러 발생:", err);
    }

    // 💡 데이터 세팅 직후 미리보기를 강제로 한 번 그려줌
    updateMainPagePreview();
}

function renderMainPageMenuRows() {
    const container = document.getElementById("mp-menu-rows-container");
    if (!container) {
        console.warn("⚠️ mp-menu-rows-container 요소를 찾을 수 없습니다.");
        return;
    }
    
    container.innerHTML = "";

    const items = Array.isArray(mainpageData.menuItems) ? mainpageData.menuItems : [];
    console.log("📋 렌더링할 메뉴 아이템 목록:", items);

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
// 현재 선택된 미리보기 모드 기억용 변수
let currentPreviewMode = 'pc';

// PC / 모바일 미리보기 비율 전환 및 스케일(축소) 적용 함수
function setPreviewMode(mode) {
    currentPreviewMode = mode || currentPreviewMode;
    const wrapper = document.getElementById("mp-preview-wrapper");
    const outer = document.getElementById("mp-preview-outer");
    const viewport = document.getElementById("preview-viewport");
    const btnPc = document.getElementById("btn-mode-pc");
    const btnMobile = document.getElementById("btn-mode-mobile");

    if (!wrapper || !outer || !viewport) return;

    if (currentPreviewMode === 'mobile') {
        // 모바일 모드 (380px 폭 고정)
        wrapper.style.width = "320px";
        wrapper.style.maxWidth = "100%";
        wrapper.style.borderRadius = "24px";
        wrapper.style.boxShadow = "0 10px 25px -5px rgba(0,0,0,0.3)";
        outer.style.background = "#1e293b";
        outer.style.padding = "20px 10px";
        
        viewport.style.width = "380px";
        viewport.style.height = "675px";
        viewport.style.overflowY = "auto";
        viewport.style.transform = "none";
        wrapper.style.height = "675px";
        
        if (btnMobile) btnMobile.style.backgroundColor = "#0284c7";
        if (btnPc) btnPc.style.backgroundColor = "#64748b";
    } else {
        // PC 모드 (1920 해상도 기준 축소)
        wrapper.style.width = "100%";
        wrapper.style.maxWidth = "100%";
        wrapper.style.borderRadius = "8px";
        wrapper.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.1)";
        outer.style.background = "#e2e8f0";
        outer.style.padding = "15px";

        viewport.style.width = "1920px";
        viewport.style.height = "auto";
        viewport.style.overflowY = "visible";

        if (btnPc) btnPc.style.backgroundColor = "#0284c7";
        if (btnMobile) btnMobile.style.backgroundColor = "#64748b";
    }

    setTimeout(adjustPreviewScale, 30);
}

// 부모 박스 크기에 맞춰 가상 뷰포트 축소 비율(Scale) 및 높이 계산 함수
function adjustPreviewScale() {
    const wrapper = document.getElementById("mp-preview-wrapper");
    const viewport = document.getElementById("preview-viewport");
    if (!wrapper || !viewport) return;

    if (currentPreviewMode === 'mobile') {
        viewport.style.transform = "none";
        viewport.style.width = "380px";
        viewport.style.height = "675px";
        wrapper.style.height = "675px";
        return;
    }

    const parentWidth = wrapper.clientWidth;
    if (!parentWidth) return;
    
    const targetWidth = 1920;

    // 1. 스케일 비율 계산
    const scale = parentWidth / targetWidth;
    
    viewport.style.transformOrigin = "top left";
    viewport.style.transform = `scale(${scale})`;
    viewport.style.width = `${targetWidth}px`;
    
    // 2. 💡 핵심 수정: 뷰포트 내부 콘텐츠의 실제 높이를 가져와 스케일을 곱해 래퍼 높이 지정 (하단 여백 제거)
    const contentHeight = viewport.scrollHeight || 1080;
    wrapper.style.height = `${contentHeight * scale}px`;
}

// 💡 창 크기가 바뀔 때 미리보기가 깨지지 않도록 리사이즈 이벤트 등록
window.addEventListener('resize', () => {
    if (document.getElementById("panel-mainpage")?.style.display === "block") {
        adjustPreviewScale();
    }
});

function updateMainPageMenu(index, field, value) {
    if (mainpageData.menuItems[index]) {
        mainpageData.menuItems[index][field] = value;
        updateMainPagePreview();
    }
}

function addMainPageMenuRow() {
    if (!Array.isArray(mainpageData.menuItems)) mainpageData.menuItems = [];
    mainpageData.menuItems.push({ name: "", url: "" });
    renderMainPageMenuRows();
    updateMainPagePreview();
}

function removeMainPageMenu(index) {
    if (mainpageData.menuItems) {
        mainpageData.menuItems.splice(index, 1);
        renderMainPageMenuRows();
        updateMainPagePreview();
    }
}

function updateMainPagePreview() {
    const navBg = document.getElementById("mp-nav-bgcolor")?.value.trim();
    const logoText = document.getElementById("mp-logo-text")?.value.trim();
    const mainContent = document.getElementById("mp-main-content")?.value.trim() || "";

    // 1. 네비게이션바 배경 및 로고 텍스트 반영
    const previewNav = document.getElementById("preview-nav");
    const previewLogo = document.getElementById("preview-logo");
    if (previewNav) previewNav.style.backgroundColor = navBg || "rgba(3, 4, 94, 0.9)";
    if (previewLogo) previewLogo.textContent = logoText || "BABABI FAN ARCHIVE";

    // 2. 메인 콘텐츠 미리보기 반영
    const previewContent = document.getElementById("preview-content");
    if (previewContent) {
        previewContent.style.padding = "0";
        previewContent.style.background = "#fff";

        if (mainContent.endsWith('.html') || mainContent.startsWith('http://') || mainContent.startsWith('https://')) {
            previewContent.innerHTML = `
                <iframe src="${mainContent}" style="width: 100%; height: 250px; border: none; background: white; margin: 0; display: block;"></iframe>
            `;
        } else if (mainContent === "") {
            previewContent.style.padding = "20px";
            previewContent.innerHTML = "<span style='color: #94a3b8;'>본문 내용이나 연결할 .html 파일 주소를 입력하세요.</span>";
        } else {
            previewContent.style.padding = "20px";
            previewContent.innerHTML = mainContent;
        }
    }

    // 3. 네비게이션 메뉴 목록 실시간 반영
    const previewMenuLinks = document.getElementById("preview-menu-links");
    if (previewMenuLinks) {
        previewMenuLinks.innerHTML = "";
        const items = mainpageData.menuItems || [];

        if (items.length === 0) {
            const span = document.createElement("span");
            span.textContent = "메뉴 없음";
            span.style.opacity = "0.5";
            previewMenuLinks.appendChild(span);
        } else {
            items.forEach(item => {
                if (!item.name) return;
                const a = document.createElement("a");
                a.textContent = item.name;
                a.href = item.url || "#";
                a.style.cssText = "color: #90e0ef; text-decoration: none; font-size: 12px; font-weight: 600;";
                previewMenuLinks.appendChild(a);
            });
        }
    }

    // 💡 미리보기 내용과 메뉴가 모두 그려진 직후 스케일 및 높이 재계산 실행
    setTimeout(adjustPreviewScale, 30);
}

async function saveMainPageSettings() {
    const navBgInput = document.getElementById("mp-nav-bgcolor");
    const logoTextInput = document.getElementById("mp-logo-text");
    const mainContentInput = document.getElementById("mp-main-content");

    if (navBgInput) mainpageData.navBgColor = navBgInput.value.trim();
    if (logoTextInput) mainpageData.logoText = logoTextInput.value.trim();
    if (mainContentInput) mainpageData.mainContent = mainContentInput.value.trim();

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
                menuItems: Array.isArray(data.menuItems) ? data.menuItems : []
            };
            window.mainpageData = mainpageData;
        }
        
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").innerHTML = adminHtmlTemplate;

        // 💡 템플릿 주입 후 대시보드 메뉴 클릭 이벤트 바인딩 및 초기 대시보드 노출
        setTimeout(() => {
            const cards = document.querySelectorAll('.menu-grid .menu-card');
            if (cards.length >= 4) {
                cards[0].onclick = () => showPanel('intro');
                cards[1].onclick = () => showPanel('links');
                cards[2].onclick = () => showPanel('songs');
                cards[3].onclick = () => showPanel('mainpage');
                console.log("✅ 관리자 대시보드 메뉴 버튼 이벤트 강제 바인딩 완료");
            }
            
            // 최초 로그인 시에는 메인 대시보드만 깔끔하게 보여줍니다.
            // (데이터 채우기와 미리보기 초기화는 사용자가 '메인페이지 수정' 카드를 클릭해 패널을 열 때 showPanel에서 실행됩니다.)
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
