async function loadMainPageSettingsData() {
    const statusEl = document.getElementById('mainpage-status');
    statusEl.textContent = "데이터를 불러오는 중...";
    statusEl.style.color = "#0077b6";

    try {
        const timestamp = new Date().getTime();
        const response = await fetch(WORKER_URL + "?type=fanmainpages&t=" + timestamp);
        if (!response.ok) throw new Error("서버 응답 실패");
        
        const data = await response.json();
        if (data) {
            document.getElementById('mp-nav-bgcolor').value = data.navBgColor || "";
            document.getElementById('mp-logo-text').value = data.logoText || "";
            document.getElementById('mp-main-content').value = data.mainContent || "";

            const container = document.getElementById('mp-menu-rows-container');
            container.innerHTML = "";
            if (Array.isArray(data.menuItems) && data.menuItems.length > 0) {
                data.menuItems.forEach(item => addMainPageMenuRow(item.name, item.url));
            } else {
                addMainPageMenuRow();
            }
        }
        statusEl.textContent = "데이터를 성공적으로 불러왔습니다.";
        statusEl.style.color = "#10b981";
    } catch (err) {
        statusEl.textContent = "데이터를 불러오지 못했습니다. (기본값 사용)";
        statusEl.style.color = "#ef4444";
        const container = document.getElementById('mp-menu-rows-container');
        if (container.children.length === 0) addMainPageMenuRow();
    }
}

function addMainPageMenuRow(name = "", url = "") {
    const container = document.getElementById('mp-menu-rows-container');
    const row = document.createElement('div');
    row.className = 'menu-item-row';
    row.innerHTML = `
        <input type="text" placeholder="메뉴 이름" class="menu-name-input" value="${name}" style="flex: 1;">
        <input type="text" placeholder="연결 주소 (URL 또는 .html)" class="menu-url-input" value="${url}" style="flex: 2;">
        <button type="button" class="delete-item-btn" onclick="this.parentElement.remove()">삭제</button>
    `;
    container.appendChild(row);
}

async function saveMainPageSettings() {
    const statusEl = document.getElementById('mainpage-status');
    const password = document.getElementById('admin-password').value.trim();
    if (!password) return;

    const navBgColor = document.getElementById('mp-nav-bgcolor').value.trim();
    const logoText = document.getElementById('mp-logo-text').value.trim();
    const mainContent = document.getElementById('mp-main-content').value.trim();
    const menuItems = [];
    document.querySelectorAll('#mp-menu-rows-container .menu-item-row').forEach(row => {
        const name = row.querySelector('.menu-name-input').value.trim();
        const url = row.querySelector('.menu-url-input').value.trim();
        if (name) menuItems.push({ name, url });
    });

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, fileType: "fanmainpages", content: { navBgColor, logoText, menuItems, mainContent } })
        });
        if (response.ok) {
            statusEl.textContent = "성공적으로 저장되었습니다!";
            statusEl.style.color = "#10b981";
        } else { throw new Error("저장 실패"); }
    } catch (err) {
        statusEl.textContent = "저장 오류: " + err.message;
        statusEl.style.color = "#ef4444";
    }
}
