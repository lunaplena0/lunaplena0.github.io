// 메인페이지 설정 데이터 상태 변수
let mainpageData = {
    navBgColor: "rgba(3, 4, 94, 0.9)",
    logoText: "BABABI FAN ARCHIVE",
    logoUrl: "mainpages.html",
    menuItems: []
};

// 1. 메인페이지 패널 초기화 및 UI 구성
function initMainPagePanel() {
    const container = document.getElementById("panel-mainpage") || document.getElementById("mainpage-content-container");
    if (!container) return;

    // 만약 HTML 템플릿 영역이 아니라 자바스크립트로 직접 UI를 그려야 하는 경우라면 아래와 같이 구성할 수 있습니다.
    // 기존에 admin.html에 HTML 마크업을 두었다면 이 innerHTML 부분은 생략하거나 필요한 부분만 맞추어 쓰시면 됩니다.
    
    // 값 세팅
    const navBgInput = document.getElementById("mp-nav-bgcolor");
    const logoTextInput = document.getElementById("mp-logo-text");
    const logoUrlInput = document.getElementById("mp-logo-url");

    if (navBgInput) navBgInput.value = mainpageData.navBgColor || "";
    if (logoTextInput) logoTextInput.value = mainpageData.logoText || "";
    if (logoUrlInput) logoUrlInput.value = mainpageData.logoUrl || "";

    renderMainPageMenuRows();
}

// 2. 네비게이션 메뉴 행 동적 렌더링
function renderMainPageMenuRows() {
    const container = document.getElementById("mp-menu-rows-container");
    if (!container) return;
    
    container.innerHTML = "";

    (mainpageData.menuItems || []).forEach((item, index) => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; gap: 10px; align-items: center; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1;";
        row.innerHTML = `
            <input type="text" placeholder="메뉴 이름 (예: 프로필)" value="${escapeHtml(item.name)}" oninput="updateMainPageMenu(${index}, 'name', this.value)" style="flex: 1; margin-bottom: 0; padding: 6px;">
            <input type="text" placeholder="연결 주소 (예: profile.html)" value="${escapeHtml(item.url)}" oninput="updateMainPageMenu(${index}, 'url', this.value)" style="flex: 1.5; margin-bottom: 0; padding: 6px;">
            <button type="button" onclick="removeMainPageMenu(${index})" style="background-color: #ef4444; padding: 6px 12px; font-size: 13px; margin-bottom: 0;">삭제</button>
        `;
        container.appendChild(row);
    });
}

// 3. 메뉴 항목 값 변경 감지
function updateMainPageMenu(index, field, value) {
    if (mainpageData.menuItems[index]) {
        mainpageData.menuItems[index][field] = value;
    }
}

// 4. 새 메뉴 행 추가
function addMainPageMenuRow() {
    if (!mainpageData.menuItems) mainpageData.menuItems = [];
    mainpageData.menuItems.push({ name: "", url: "" });
    renderMainPageMenuRows();
}

// 5. 메뉴 행 삭제
function removeMainPageMenu(index) {
    mainpageData.menuItems.splice(index, 1);
    renderMainPageMenuRows();
}

// 6. 메인페이지 설정 서버 저장 함수
async function saveMainPageSettings() {
    const statusEl = document.getElementById("mainpage-status");
    if (statusEl) {
        statusEl.style.color = "#0077b6";
        statusEl.textContent = "메인페이지 설정 저장 중...";
    }

    try {
        // 입력된 값들을 mainpageData에 반영
        const navBgInput = document.getElementById("mp-nav-bgcolor");
        const logoTextInput = document.getElementById("mp-logo-text");
        const logoUrlInput = document.getElementById("mp-logo-url");

        if (navBgInput) mainpageData.navBgColor = navBgInput.value.trim();
        if (logoTextInput) mainpageData.logoText = logoTextInput.value.trim();
        if (logoUrlInput) mainpageData.logoUrl = logoUrlInput.value.trim();

        // 워커로 전송 (`mainpage` 타입으로 KV 저장)
        await saveDataToWorker("mainpage", mainpageData, "mainpage-status");
    } catch (err) {
        if (statusEl) {
            statusEl.style.color = "#ef4444";
            statusEl.textContent = "저장 실패: " + err.message;
        }
    }
}
