const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";
const TURNSTILE_SITE_KEY = "0x4AAAAAAEbQ0YWNiL_WiyKR";

let adminTurnstileToken = "";
let adminTurnstileWidgetId = null;
let adminSessionToken = localStorage.getItem("badabi_session") || "";
let adminUserRole = "";
let rateLimitId = localStorage.getItem("badabi_rate_limit_id") || "";

// 기존 관리자 페이지의 저장 함수가 사용하는 전역 인증 상태와 연결
function syncAdminAuthGlobals() {
    window.adminSessionToken = adminSessionToken;
    window.sessionToken = adminSessionToken;
    window.adminUserRole = adminUserRole;
    window.isAdminAuthenticated = !!adminSessionToken;
    window.adminAuthenticated = !!adminSessionToken;
}

syncAdminAuthGlobals();

/*
 * 관리자 저장 요청에도 노래책과 동일한 badabi_session 세션 토큰을 사용합니다.
 * 기존 저장 함수가 sessionToken을 누락하더라도 여기서 보완하여
 * "로그인 정보가 유실되었습니다" 문제가 발생하지 않도록 합니다.
 */
const nativeAdminFetch = window.fetch.bind(window);
window.fetch = async function(input, init) {
    try {
        const requestUrl = typeof input === "string" ? input : (input && input.url) || "";
        const method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();

        if (method === "POST" && requestUrl.startsWith(WORKER_URL)) {
            const headers = new Headers((init && init.headers) || (input && input.headers) || {});
            const contentType = headers.get("Content-Type") || headers.get("content-type") || "";

            if (contentType.toLowerCase().includes("application/json") && init && typeof init.body === "string") {
                try {
                    const bodyData = JSON.parse(init.body);

                    if (bodyData && String(bodyData.action || "").toLowerCase() === "save") {
                        const savedToken = localStorage.getItem("badabi_session") || adminSessionToken || window.adminSessionToken || window.sessionToken || "";
                        if (savedToken) {
                            adminSessionToken = savedToken;
                            bodyData.sessionToken = savedToken;
                            syncAdminAuthGlobals();
                            init = { ...init, body: JSON.stringify(bodyData) };
                        }
                    }
                } catch (e) {
                    // JSON이 아닌 기존 요청은 그대로 통과시킵니다.
                }
            }
        }
    } catch (e) {
        console.warn("관리자 세션 요청 보완 실패:", e);
    }

    const response = await nativeAdminFetch(input, init);

    if (response.status === 401) {
        try {
            const requestUrl = typeof input === "string" ? input : (input && input.url) || "";
            if (requestUrl.startsWith(WORKER_URL)) {
                adminSessionToken = "";
                adminUserRole = "";
                localStorage.removeItem("badabi_session");
            }
        } catch (e) {}
    }

    return response;
};

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

/* 기존 저장 함수가 직접 호출할 수 있는 관리자 세션 확인 함수 */
window.getAdminSessionToken = function() {
    const savedToken = localStorage.getItem("badabi_session") || adminSessionToken || window.adminSessionToken || window.sessionToken || "";
    if (savedToken) {
        adminSessionToken = savedToken;
        syncAdminAuthGlobals();
    }
    return adminSessionToken;
};

window.ensureAdminSession = async function() {
    const token = window.getAdminSessionToken();
    if (token) return true;
    return await restoreAdminAuthentication();
};

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
        localStorage.setItem("badabi_session", adminSessionToken);
        syncAdminAuthGlobals();

        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").style.display = "block";

        return true;
    } catch (err) {
        console.warn("저장된 관리자 세션이 만료되었거나 유효하지 않습니다.");
        adminSessionToken = "";
        adminUserRole = "";
        localStorage.removeItem("badabi_session");
        syncAdminAuthGlobals();
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
        syncAdminAuthGlobals();

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
    syncAdminAuthGlobals();
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
// 📌 전체 데이터 JSON 백업 다운로드
async function downloadDataBackup() {
    if (!confirm("현재 서버에 저장된 모든 데이터 파일을 각각 JSON으로 백업하고, 날짜별 폴더에 저장하시겠습니까?")) {
        return;
    }

    // 현재 Worker에 등록된 전체 데이터 타입
    const dataTypes = [
        "profile",
        "links",
        "songlist",
        "mainpage",
        "fanmainpages",
        "fanstartpage",
        "fancrynote",
        "fancalenar",
        "fanvodlist",
        "fansongstats",
        "widget",
        "talk"
    ];

    // 한국 시간 기준으로 날짜 폴더명을 만듭니다.
    const dateString = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

    // 브라우저의 폴더 쓰기 기능을 사용합니다.
    // 지원 브라우저에서는 사용자가 선택한 위치에 YYYY-MM-DD 폴더를 자동 생성합니다.
    if (window.showDirectoryPicker) {
        try {
            const parentDirectory = await window.showDirectoryPicker({
                mode: "readwrite"
            });

            const backupDirectory = await parentDirectory.getDirectoryHandle(dateString, {
                create: true
            });

            let successCount = 0;
            let failCount = 0;
            const timestamp = Date.now();

            for (const type of dataTypes) {
                try {
                    const res = await fetch(
                        `${WORKER_URL}?type=${encodeURIComponent(type)}&t=${timestamp}`,
                        { cache: "no-store" }
                    );

                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}`);
                    }

                    const data = await res.json();
                    const fileHandle = await backupDirectory.getFileHandle(`${type}.json`, {
                        create: true
                    });
                    const writable = await fileHandle.createWritable();

                    await writable.write(JSON.stringify(data, null, 2));
                    await writable.close();

                    successCount++;
                } catch (err) {
                    console.error(`⚠️ ${type} 백업 실패:`, err);
                    failCount++;
                }
            }

            if (successCount === 0) {
                alert("데이터 백업 중 오류가 발생했습니다. 서버 연결 또는 폴더 권한을 확인해주세요.");
                return;
            }

            if (failCount === 0) {
                alert(`전체 데이터 백업이 완료되었습니다.\n저장 폴더: ${dateString}\n총 ${successCount}개 파일`);
            } else {
                alert(`데이터 백업이 완료되었습니다.\n저장 폴더: ${dateString}\n성공: ${successCount}개 / 실패: ${failCount}개`);
            }

            return;
        } catch (err) {
            // 사용자가 폴더 선택을 취소한 경우에는 아무 작업도 하지 않습니다.
            if (err && err.name === "AbortError") {
                return;
            }

            console.error("폴더 백업 저장 실패:", err);
            alert("폴더에 직접 저장할 수 없습니다. 브라우저가 폴더 저장 기능을 지원하지 않을 수 있습니다.");
            return;
        }
    }

    // File System Access API를 지원하지 않는 브라우저용 fallback
    // 이 경우 브라우저가 각 JSON 파일을 개별 다운로드합니다.
    const timestamp = Date.now();
    let successCount = 0;
    let failCount = 0;

    for (const type of dataTypes) {
        try {
            const res = await fetch(
                `${WORKER_URL}?type=${encodeURIComponent(type)}&t=${timestamp}`,
                { cache: "no-store" }
            );

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], {
                type: "application/json;charset=utf-8;"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `${type}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 1000);

            successCount++;

            // 브라우저의 다중 다운로드 차단을 줄이기 위한 짧은 간격
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
            console.error(`⚠️ ${type} 백업 실패:`, err);
            failCount++;
        }
    }

    if (successCount === 0) {
        alert("데이터 백업 중 오류가 발생했습니다. 서버 연결을 확인해주세요.");
    } else if (failCount === 0) {
        alert(`전체 데이터 백업이 완료되었습니다.\n총 ${successCount}개 파일`);
    } else {
        alert(`데이터 백업이 완료되었습니다.\n성공: ${successCount}개 / 실패: ${failCount}개`);
    }
}
