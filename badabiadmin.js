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
