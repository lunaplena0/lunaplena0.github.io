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

function getPoint(val, type) {
    if (!val || val < 0) return 0;
    const list = scoreTable[type];
    for (let item of list) {
        if (val >= item.limit) return item.s;
    }
    return 0;
}

function updateScores() {
    // 값 수집
    const viewer = parseInt(document.getElementById('score-viewer').value) || 0;
    const fan = parseInt(document.getElementById('score-fan').value) || 0;
    const time = parseInt(document.getElementById('score-time').value) || 0;
    const day = parseInt(document.getElementById('day-val').value) || 0;
    const edu = parseInt(document.getElementById('edu-val').value) || 0;
    const noPunish = document.getElementById('punish-check').checked;

    const vodScore = parseInt(document.getElementById('add-vod-count').value) || 0;
    const rateScore = parseInt(document.getElementById('add-vod-rate').value) || 0;
    const expertScore = document.getElementById('add-expert').checked ? 5 : 0;

    const totalScoreElement = document.getElementById('total-score');
    const resultPanel = document.getElementById('result-panel');
    const resultDesc = document.getElementById('result-desc');

    // 1. 필수 조건 체크
    let failReasons = [];
    if (time < 100) failReasons.push("방송 시간 100시간 미달");
    if (fan < 500) failReasons.push("애청자 500명 미달");
    if (day < 30) failReasons.push("방송 일수 30일 미달");
    if (edu < 5) failReasons.push("교육 수강 5개 미달");
    if (!noPunish) failReasons.push("정지 기록 있음 체크 해제됨");

    // 2. 점수 계산
    const vPoint = getPoint(viewer, 'viewer');
    const fPoint = getPoint(fan, 'fan');
    const tPoint = getPoint(time, 'time');
    const baseTotal = (vPoint * 0.4) + (fPoint * 0.4) + (tPoint * 0.2);
    const finalTotal = baseTotal + vodScore + rateScore + expertScore;

    totalScoreElement.innerText = finalTotal.toFixed(1);

    // 3. 결과 출력
    if (failReasons.length > 0) {
        resultPanel.className = "fail";
        resultDesc.innerHTML = `<span style="color: #f44336;">[신청 불가]</span><br>${failReasons.join(", ")}`;
    } else {
        resultPanel.className = "pass";
        resultDesc.innerHTML = `<span style="color: #4caf50;">[신청 가능]</span> 모든 필수 조건을 충족했습니다!`;
    }
}
