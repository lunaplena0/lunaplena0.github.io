const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";

async function verifyAndLoad() {
    const password = document.getElementById('admin-password').value.trim();
    const statusEl = document.getElementById('login-status');

    if (!password) {
        statusEl.textContent = "비밀번호를 입력해주세요.";
        statusEl.style.color = "#ef4444";
        return;
    }

    statusEl.textContent = "확인 중...";
    statusEl.style.color = "#0077b6";

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password, action: "verify", fileType: "verify" })
        });

        if (!response.ok) {
            const errResult = await response.json();
            throw new Error(errResult.error || "비밀번호가 틀렸습니다.");
        }

        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-app-container').style.display = 'block';
    } catch (err) {
        console.error("인증 실패:", err);
        statusEl.textContent = err.message || "비밀번호가 올바르지 않습니다.";
        statusEl.style.color = "#ef4444";
    }
}

function showDashboard() {
    document.getElementById('panel-mainpage').style.display = 'none';
    document.getElementById('panel-intro').style.display = 'none';
    document.getElementById('panel-crynote').style.display = 'none';
    document.getElementById('panel-calendar').style.display = 'none';
    document.getElementById('panel-vodlist').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'block';
}

function showMainPageSettings() { 
    showDashboard(); 
    document.getElementById('dashboard-view').style.display = 'none'; 
    document.getElementById('panel-mainpage').style.display = 'block'; 
    loadMainPageSettingsData(); // 이 부분이 호출되는지 확인
}

function showIntroSettings() { 
    showDashboard(); 
    document.getElementById('dashboard-view').style.display = 'none'; 
    document.getElementById('panel-intro').style.display = 'block'; 
    loadIntroSettingsData(); // 이 부분이 호출되는지 확인
}

function showCryNoteSettings() { 
    showDashboard(); 
    document.getElementById('dashboard-view').style.display = 'none'; 
    document.getElementById('panel-crynote').style.display = 'block'; 
    loadCryNoteSettingsData(); // 이 부분이 호출되는지 확인
}

function showCalendarSettings() { 
    showDashboard(); 
    document.getElementById('dashboard-view').style.display = 'none'; 
    document.getElementById('panel-calendar').style.display = 'block'; 
    loadCalendarSettingsData(); // 이 부분이 호출되는지 확인
}

function showVodListSettings() {
    showDashboard();
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('panel-vodlist').style.display = 'block';
    loadVodListSettingsData(); // 이 부분이 호출되는지 확인
}
