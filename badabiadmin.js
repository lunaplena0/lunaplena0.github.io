const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";
const TURNSTILE_SITE_KEY = "0x4AAAAAAEbQ0YWNiL_WiyKR";

let adminTurnstileToken = "";
let adminTurnstileWidgetId = null;
let adminSessionToken = localStorage.getItem("badabi_session") || "";
let adminUserRole = "";
let rateLimitId = localStorage.getItem("badabi_rate_limit_id") || "";

/* 노래책과 동일한 브라우저 식별값 생성 방식 */
if (!rateLimitId) {
    const rateBytes = new Uint8Array(32);
    crypto.getRandomValues(rateBytes);
    rateLimitId = Array.from(rateBytes, byte => byte.toString(16).padStart(2, "0")).join("");
    localStorage.setItem("badabi_rate_limit_id", rateLimitId);
}

/* 기존 로그인 디자인은 건드리지 않고 Turnstile 영역만 비밀번호 입력창 바로 위에 삽입 */
function ensureAdminTurnstileContainer() {
    const passwordInput = document.getElementById("admin-password");
    if (!passwordInput) return null;

    let container = document.getElementById("adminTurnstileWidget");
    if (!container) {
        container = document.createElement("div");
        container.id = "adminTurnstileWidget";
        container.style.marginBottom = "10px";
        passwordInput.parentNode.insertBefore(container, passwordInput);
    }

    return container;
}

function loadAdminTurnstileScript() {
    return new Promise((resolve, reject) => {
        if (typeof window.turnstile !== "undefined") {
            resolve();
            return;
        }

        const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
        if (existing) {
            existing.addEventListener("load", resolve, { once: true });
            existing.addEventListener("error", reject, { once: true });
            setTimeout(() => {
                if (typeof window.turnstile !== "undefined") resolve();
            }, 1000);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function resetAdminTurnstile() {
    adminTurnstileToken = "";

    if (
        adminTurnstileWidgetId !== null &&
        typeof window.turnstile !== "undefined"
    ) {
        try {
            window.turnstile.reset(adminTurnstileWidgetId);
        } catch (e) {
            console.warn("Turnstile 초기화 실패:", e);
        }
    }
}

function renderAdminTurnstile() {
    const container = ensureAdminTurnstileContainer();

    if (
        !container ||
        !TURNSTILE_SITE_KEY ||
        TURNSTILE_SITE_KEY === "YOUR_TURNSTILE_SITE_KEY" ||
        typeof window.turnstile === "undefined"
    ) {
        return;
    }

    adminTurnstileToken = "";

    try {
        if (adminTurnstileWidgetId !== null) {
            window.turnstile.remove(adminTurnstileWidgetId);
            adminTurnstileWidgetId = null;
        }

        adminTurnstileWidgetId = window.turnstile.render(container, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: token => {
                adminTurnstileToken = token || "";
            },
            "expired-callback": resetAdminTurnstile,
            "timeout-callback": resetAdminTurnstile,
            theme: "auto"
        });
    } catch (err) {
        console.error("Turnstile 렌더링 실패:", err);
    }
}

/* 기존 로그인 화면이 준비된 뒤 Turnstile을 표시 */
async function prepareAdminLogin() {
    try {
        await loadAdminTurnstileScript();
        renderAdminTurnstile();
    } catch (err) {
        console.error("Turnstile 로드 실패:", err);
    }
}

/* 노래책과 동일한 세션 복원 */
async function restoreAdminAuthentication() {
    const token = localStorage.getItem("badabi_session") || adminSessionToken || "";

    if (!token) {
        adminSessionToken = "";
        adminUserRole = "";
        return false;
    }

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionToken: token,
                action: "verify"
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success || !data.role) {
            throw new Error("saved session rejected");
        }

        adminSessionToken = token;
        adminUserRole = data.role || "";

        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").style.display = "block";

        return true;
    } catch (err) {
        console.warn("저장된 관리자 세션이 만료되었거나 유효하지 않습니다.");
        adminSessionToken = "";
        adminUserRole = "";
        localStorage.removeItem("badabi_session");
        return false;
    }
}

async function verifyAndLoad() {
    const input = document.getElementById("admin-password");
    const password = input ? input.value.trim() : "";
    const statusEl = document.getElementById("login-status");

    if (!password) {
        statusEl.textContent = "비밀번호를 입력해주세요.";
        statusEl.style.color = "#ef4444";
        return;
    }

    if (!adminTurnstileToken) {
        statusEl.textContent = "보안 인증을 완료해주세요.";
        statusEl.style.color = "#ef4444";
        return;
    }

    statusEl.textContent = "확인 중...";
    statusEl.style.color = "#0077b6";

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password: password,
                turnstileToken: adminTurnstileToken,
                rateLimitId: rateLimitId,
                action: "verify"
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success || !data.sessionToken) {
            throw new Error(data.error || "인증 실패");
        }

        adminSessionToken = data.sessionToken;
        adminUserRole = data.role || "";

        localStorage.setItem("badabi_session", adminSessionToken);
        localStorage.removeItem("badabi_song_auth_password");

        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").style.display = "block";

        adminTurnstileToken = "";

        if (input) input.value = "";

        statusEl.textContent = "";
    } catch (err) {
        console.error("관리자 로그인 실패:", err);
        statusEl.textContent = err.message || "로그인에 실패했습니다. 다시 시도해주세요.";
        statusEl.style.color = "#ef4444";

        resetAdminTurnstile();

        if (input) {
            input.value = "";
            input.focus();
        }
    }
}

function logoutAdminAuthentication() {
    adminSessionToken = "";
    adminUserRole = "";
    localStorage.removeItem("badabi_session");
    localStorage.removeItem("badabi_song_auth_password");
    resetAdminTurnstile();

    const loginSection = document.getElementById("login-section");
    const appContainer = document.getElementById("admin-app-container");

    if (loginSection) loginSection.style.display = "";
    if (appContainer) appContainer.style.display = "none";

    prepareAdminLogin();
}

/* 페이지 로드 시 저장된 세션을 먼저 확인하고, 없으면 기존 로그인 화면을 유지 */
(async function initAdminAuthentication() {
    const restored = await restoreAdminAuthentication();

    if (!restored) {
        prepareAdminLogin();
    }
})();

function showDashboard() {
    document.getElementById('panel-mainpage').style.display = 'none';
    document.getElementById('panel-intro').style.display = 'none';
    document.getElementById('panel-crynote').style.display = 'none';
    document.getElementById('panel-calendar').style.display = 'none';
    document.getElementById('panel-vodlist').style.display = 'none';
    document.getElementById('panel-songstats').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'block';
}

function showMainPageSettings() { 
    showDashboard(); 
    document.getElementById('dashboard-view').style.display = 'none'; 
    document.getElementById('panel-mainpage').style.display = 'block'; 
    loadMainPageSettingsData(); 
}

function showIntroSettings() { 
    showDashboard(); 
    document.getElementById('dashboard-view').style.display = 'none'; 
    document.getElementById('panel-intro').style.display = 'block'; 
    loadIntroSettingsData(); 
}

function showCryNoteSettings() { 
    showDashboard(); 
    document.getElementById('dashboard-view').style.display = 'none'; 
    document.getElementById('panel-crynote').style.display = 'block'; 
    loadCryNoteSettingsData(); 
}

function showCalendarSettings() { 
    showDashboard(); 
    document.getElementById('dashboard-view').style.display = 'none'; 
    document.getElementById('panel-calendar').style.display = 'block'; 
    loadCalendarSettingsData(); 
}

function showVodListSettings() {
    showDashboard();
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('panel-vodlist').style.display = 'block';
    loadVodListSettingsData();
}

function showSongStatsSettings() {
    showDashboard();
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('panel-songstats').style.display = 'block';
    loadSongStatsSettingsData();
}
// 📌 데이터 백업 다운로드 기능 (10개 파일 일괄 다운로드)
async function downloadDataBackup() {
    if (!confirm("현재 서버에 저장된 모든 데이터 파일들을 JSON 파일로 백업 다운로드하시겠습니까?")) {
        return;
    }

    const targets = [
        { type: 'profile', filename: 'profile_backup.json' },
        { type: 'links', filename: 'links_backup.json' },
        { type: 'songlist', filename: 'songlist_backup.json' },
        { type: 'mainpage', filename: 'mainpage_backup.json' },
        { type: 'fanmainpages', filename: 'fanmainpages_backup.json' },
        { type: 'fanstartpage', filename: 'fanstartpage_backup.json' },
        { type: 'fancrynote', filename: 'fancrynote_backup.json' },
        { type: 'fancalenar', filename: 'fancalenar_backup.json' },
        { type: 'fanvodlist', filename: 'fanvodlist_backup.json' },
        { type: 'fansongstats', filename: 'fansongstats_backup.json' }
    ];

    let successCount = 0;
    const timestamp = new Date().getTime();

    for (const item of targets) {
        try {
            const res = await fetch(`${WORKER_URL}?type=${item.type}&t=${timestamp}`);
            if (!res.ok) throw new Error("네트워크 응답 오류");
            const data = await res.json();

            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = url;
            link.download = item.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            successCount++;
            // 브라우저가 다중 다운로드를 안정적으로 처리할 수 있도록 짧은 딜레이 부여
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
            console.error(`⚠️ ${item.type} 백업 실패:`, err);
        }
    }

    if (successCount > 0) {
        alert(`총 ${successCount}개의 파일 백업 다운로드가 완료되었습니다!`);
    } else {
        alert("데이터 다운로드 중 오류가 발생했습니다. 브라우저 설정을 확인해주세요.");
    }
}
