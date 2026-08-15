const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";

let songData = { notice: "", songs: [] };
let profileData = { name: "", image: "", catchphrase: "", details: [], time: "", content: "", bio1: "", bio2: "" };
let linksData = []; 
let mainpageData = { navBgColor: "rgba(3, 4, 94, 0.9)", logoText: "BABABI FAN ARCHIVE", mainContent: "", menuItems: [] };
let fansongStatsData = { unregisteredSongs: [], registeredSongs: [], vodSources: [] };

function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const adminHtmlTemplate = `
    <div id="dashboard-section" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #03045e;">🛠️ 노래 위젯 관리 메뉴</h3>
            <button onclick="location.reload()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">로그아웃</button>
        </div>
        <div class="menu-grid">
            <div class="menu-card" onclick="showPanel('intro')"><h4>👤 자기소개 수정</h4></div>
            <div class="menu-card" onclick="showPanel('links')"><h4>🔗 링크 수정</h4></div>
            <div class="menu-card" onclick="showPanel('songs')"><h4>🎶 노래책 수정</h4></div>
            <div class="menu-card" onclick="showPanel('mainpage')"><h4>🏠 메인페이지 수정</h4></div>
        </div>
    </div>
    <div id="admin-panels">
        <!-- 각 패널은 기존과 동일하게 구성 -->
    </div>
`;

async function verifyAndLoad() {
    const password = document.getElementById("admin-password").value;
    const statusEl = document.getElementById("login-status");
    if (!password) { statusEl.textContent = "비밀번호를 입력해주세요."; return; }

    try {
        // 인증 및 데이터 로딩 로직은 기존과 동일
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").innerHTML = adminHtmlTemplate;
    } catch (error) {
        statusEl.textContent = "로그인 실패: " + error.message;
    }
}

function showPanel(type) {
    // 패널 전환 로직
}

function showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}
