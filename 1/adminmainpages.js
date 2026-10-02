// 메인페이지 설정 데이터 상태 변수 (이미 선언되어 있다면 생략 가능)
if (!window.mainpageData) {
    window.mainpageData = {
        navBgColor: "rgba(3, 4, 94, 0.9)",
        logoText: "BABABI FAN ARCHIVE",
        mainContent: "",
        menuItems: []
    };
}

// 1. 메인페이지 패널 초기화 및 UI 구성 (필수!)
window.initMainPagePanel = function() {
    const container = document.getElementById("panel-mainpage");
    if (!container) return;
    
    // HTML 입력창 요소들 가져오기
    const navBgInput = document.getElementById("mp-nav-bgcolor");
    const logoTextInput = document.getElementById("mp-logo-text");
    const mainContentInput = document.getElementById("mp-main-content");

    // 전역 변수(mainpageData)에 담긴 값을 실제 화면 입력창에 세팅
    if (navBgInput) navBgInput.value = window.mainpageData.navBgColor || "";
    if (logoTextInput) logoTextInput.value = window.mainpageData.logoText || "";
    if (mainContentInput) mainContentInput.value = window.mainpageData.mainContent || "";

    // 메뉴 목록 행 렌더링 함수 호출
    window.renderMainPageMenuRows();
}

// 2. 네비게이션 메뉴 행 동적 렌더링
window.renderMainPageMenuRows = function() {
    const container = document.getElementById("mp-menu-rows-container");
    if (!container) return;
    
    container.innerHTML = "";

    (window.mainpageData.menuItems || []).forEach((item, index) => {
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
window.updateMainPageMenu = function(index, field, value) {
    if (window.mainpageData.menuItems[index]) {
        window.mainpageData.menuItems[index][field] = value;
    }
}

// 4. 새 메뉴 행 추가
window.addMainPageMenuRow = function() {
    if (!Array.isArray(window.mainpageData.menuItems)) {
        window.mainpageData.menuItems = [];
    }
    window.mainpageData.menuItems.push({ name: "", url: "" });
    window.renderMainPageMenuRows();
}

// 5. 메뉴 행 삭제
window.removeMainPageMenu = function(index) {
    if (window.mainpageData.menuItems) {
        window.mainpageData.menuItems.splice(index, 1);
        window.renderMainPageMenuRows();
    }
}

// 6. 메인페이지 설정 서버 저장 함수
window.saveMainPageSettings = async function() {
    const statusEl = document.getElementById("mainpage-status");
    if (statusEl) {
        statusEl.style.color = "#0077b6";
        statusEl.textContent = "메인페이지 설정 저장 중...";
    }

    try {
        // 입력된 값들을 mainpageData에 반영
        const navBgInput = document.getElementById("mp-nav-bgcolor");
        const logoTextInput = document.getElementById("mp-logo-text");
        const mainContentInput = document.getElementById("mp-main-content");

        if (navBgInput) window.mainpageData.navBgColor = navBgInput.value.trim();
        if (logoTextInput) window.mainpageData.logoText = logoTextInput.value.trim();
        if (mainContentInput) window.mainpageData.mainContent = mainContentInput.value.trim();

        // 워커로 전송 (`mainpage` 타입으로 KV 저장)
        await saveDataToWorker("mainpage", window.mainpageData, "mainpage-status");
    } catch (err) {
        if (statusEl) {
            statusEl.style.color = "#ef4444";
            statusEl.textContent = "저장 실패: " + err.message;
        }
    }
}
