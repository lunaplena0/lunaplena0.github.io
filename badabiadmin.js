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
async function downloadDataBackup() {
    const keysToBackup = [
        "profile", "links", "songlist", "mainpage", "fanmainpages", 
        "fanstartpage", "fancrynote", "fancalenar", "fanvodlist", "fansongstats"
    ];
    
    keysToBackup.forEach(key => {
        const data = localStorage.getItem(key);
        // 데이터가 존재할 때만 개별 파일로 다운로드 시도 (원하신다면 data가 null이어도 빈 파일로 받도록 수정 가능)
        if (data) {
            let parsedData;
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                parsedData = data; // JSON 형식이 아니면 텍스트 그대로 처리
            }
            
            const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${key}.json`; // 각 이름별 파일명 (예: profile.json, songlist.json 등)
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
}
