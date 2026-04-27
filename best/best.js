const scoreTable = {
    viewer: [
        { limit: 1000, s: 100 }, { limit: 750, s: 98 }, { limit: 500, s: 96 }, { limit: 450, s: 94 }, { limit: 400, s: 92 },
        { limit: 350, s: 90 }, { limit: 300, s: 88 }, { limit: 250, s: 86 }, { limit: 200, s: 84 }, { limit: 160, s: 82 },
        { limit: 130, s: 80 }, { limit: 100, s: 78 }, { limit: 90, s: 76 }, { limit: 80, s: 74 }, { limit: 70, s: 72 },
        { limit: 60, s: 70 }, { limit: 50, s: 68 }, { limit: 40, s: 66 }, { limit: 30, s: 64 }, { limit: 20, s: 62 },
        { limit: 10, s: 60 }
    ],
    fan: [
        { limit: 50000, s: 100 }, { limit: 40000, s: 98 }, { limit: 30000, s: 96 }, { limit: 20000, s: 94 }, { limit: 10000, s: 92 },
        { limit: 9000, s: 90 }, { limit: 8000, s: 88 }, { limit: 7000, s: 86 }, { limit: 6000, s: 84 }, { limit: 5600, s: 82 },
        { limit: 5200, s: 80 }, { limit: 4800, s: 78 }, { limit: 4400, s: 76 }, { limit: 4000, s: 74 }, { limit: 3600, s: 72 },
        { limit: 3200, s: 70 }, { limit: 2800, s: 68 }, { limit: 2400, s: 66 }, { limit: 2000, s: 64 }, { limit: 1500, s: 62 },
        { limit: 1000, s: 60 }
    ],
    time: [
        { limit: 10000, s: 100 }, { limit: 9500, s: 98 }, { limit: 9000, s: 96 }, { limit: 8500, s: 94 }, { limit: 8000, s: 92 },
        { limit: 7500, s: 90 }, { limit: 7000, s: 88 }, { limit: 6500, s: 86 }, { limit: 6000, s: 84 }, { limit: 5500, s: 82 },
        { limit: 5000, s: 80 }, { limit: 4500, s: 78 }, { limit: 4000, s: 76 }, { limit: 3500, s: 74 }, { limit: 3000, s: 72 },
        { limit: 2600, s: 70 }, { limit: 2200, s: 68 }, { limit: 1800, s: 66 }, { limit: 1400, s: 64 }, { limit: 1000, s: 62 },
        { limit: 500, s: 60 }, { limit: 100, s: 50 }
    ]
};

function resetData() {
    if(confirm("입력한 모든 데이터를 삭제할까요?")) {
        localStorage.removeItem('badabi_calc_data');
        location.reload();
    }
}

function getPoint(val, type) {
    if (!val || val < 0) return 0;
    const list = scoreTable[type];
    for (let item of list) {
        if (val >= item.limit) return item.s;
    }
    return 0;
}

window.onload = function() {
    loadSavedData();
    updateScores();
};

function saveCurrentData() {
    const data = {
        viewer: document.getElementById('score-viewer').value,
        fan: document.getElementById('score-fan').value,
        time: document.getElementById('score-time').value,
        day: document.getElementById('day-val').value,
        edu: document.getElementById('edu-val').value,
        punish: document.getElementById('punish-check').checked,
        warnCount: document.getElementById('warn-count').value,
        warnSame: document.getElementById('warn-same').checked,
        vodCount: document.getElementById('add-vod-count').value,
        vodRate: document.getElementById('add-vod-rate').value,
        expert: document.getElementById('add-expert').checked
    };
    localStorage.setItem('badabi_calc_data', JSON.stringify(data));
}

function loadSavedData() {
    const savedData = localStorage.getItem('badabi_calc_data');
    if (!savedData) return;

    const data = JSON.parse(savedData);
    document.getElementById('score-viewer').value = data.viewer || '';
    document.getElementById('score-fan').value = data.fan || '';
    document.getElementById('score-time').value = data.time || '';
    document.getElementById('day-val').value = data.day || '';
    document.getElementById('edu-val').value = data.edu || '';
    document.getElementById('punish-check').checked = data.punish || false;
    document.getElementById('warn-count').value = data.warnCount || '';
    document.getElementById('warn-same').checked = data.warnSame || false;
    document.getElementById('add-vod-count').value = data.vodCount || '0';
    document.getElementById('add-vod-rate').value = data.vodRate || '0';
    document.getElementById('add-expert').checked = data.expert || false;
}

function updateScores() {
    // 1. 값 수집
    const viewer = parseInt(document.getElementById('score-viewer').value) || 0;
    const fan = parseInt(document.getElementById('score-fan').value) || 0;
    const time = parseInt(document.getElementById('score-time').value) || 0;
    const day = parseInt(document.getElementById('day-val').value) || 0;
    const edu = parseInt(document.getElementById('edu-val').value) || 0;
    const noPunish = document.getElementById('punish-check').checked;
    const warnCount = parseInt(document.getElementById('warn-count').value) || 0;
    const isWarnSame = document.getElementById('warn-same').checked;

    const vodScore = parseInt(document.getElementById('add-vod-count').value) || 0;
    const rateScore = parseInt(document.getElementById('add-vod-rate').value) || 0;
    const expertScore = document.getElementById('add-expert').checked ? 5 : 0;

    const totalScoreElement = document.getElementById('total-score');
    const resultPanel = document.getElementById('result-panel');
    const resultDesc = document.getElementById('result-desc');

    // 2. 가중치 점수 계산
    const vPoint = getPoint(viewer, 'viewer');
    const fPoint = getPoint(fan, 'fan');
    const tPoint = getPoint(time, 'time');
    
    const vWeighted = vPoint * 0.4;
    const fWeighted = fPoint * 0.4;
    const tWeighted = tPoint * 0.2;

    document.getElementById('val-viewer').innerText = `(${vWeighted.toFixed(1)}점)`;
    document.getElementById('val-fan').innerText = `(${fWeighted.toFixed(1)}점)`;
    document.getElementById('val-time').innerText = `(${tWeighted.toFixed(1)}점)`;

    // 3. 경고 페널티 계산
    let warnPenalty = 0;
    if (isWarnSame && warnCount >= 1) {
        warnPenalty = -20;
    } else if (warnCount >= 2) {
        warnPenalty = -10 - ((warnCount - 2) * 10);
    }
    document.getElementById('val-warn').innerText = `(${warnPenalty}점)`;

    // 4. 최종 합계
    const finalTotal = vWeighted + fWeighted + tWeighted + vodScore + rateScore + expertScore + warnPenalty;
    const displayScore = Math.max(0, finalTotal).toFixed(1);
    totalScoreElement.innerText = displayScore;

    // 5. 필수 조건 체크 및 결과 출력
    let failReasons = [];
    if (time < 100) failReasons.push("방송 시간 100시간 미달");
    if (fan < 500) failReasons.push("애청자 500명 미달");
    if (day < 30) failReasons.push("방송 일수 30일 미달");
    if (edu < 5) failReasons.push("교육 수강 5개 미달");
    if (!noPunish) failReasons.push("정지 기록 체크 안됨");

    if (failReasons.length > 0) {
        resultPanel.className = "result-box fail"; 
        resultDesc.innerHTML = `<span style="color: #f44336; font-weight:bold;">[신청 불가 - 기본 조건 미달]</span><br><small>${failReasons.join(", ")}</small>`;
    } else {
        if (finalTotal >= 85) {
            resultPanel.className = "result-box pass";
            resultDesc.innerHTML = `<span style="color: #00ffcc; font-weight:bold;">[합격 안정권]</span><br>75점을 크게 상회합니다. 선발 가능성이 매우 높습니다!`;
        } else if (finalTotal >= 75) {
            resultPanel.className = "result-box pass";
            resultDesc.innerHTML = `<span style="color: #3385ff; font-weight:bold;">[합격권 - 경합 예상]</span><br>75점을 넘겼으나 인원 초과 시 상대평가가 중요해집니다.`;
        } else {
            resultPanel.className = "result-box warning"; 
            resultDesc.innerHTML = `<span style="color: #ff9800; font-weight:bold;">[점수 미달 - 차순위 대기]</span><br>75점 미만입니다. 신청 인원이 40명 미만일 경우에만 선발될 수 있습니다.`;
        }
    }

    // 6. 프로그레스 바 업데이트
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
        const progress = Math.min((finalTotal / 100) * 100, 100);
        progressBar.style.width = Math.max(0, progress) + "%";
    }

    saveCurrentData();
}
