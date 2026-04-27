
// 1. 점수 데이터 테이블 (수정 없음)
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
        { limit: 500, s: 60 },
        { limit: 100, s: 50 } 
    ]
};

// 2. 점수 추출 로직 (수정 없음)
function getPoint(val, type) {
    if (!val || val < 0) return 0;
    const list = scoreTable[type];
    for (let item of list) {
        if (val >= item.limit) return item.s;
    }
    return 0;
}

// 3. 최종 계산 함수 (통합 버전)
function updateScores() {
    // 입력 값 수집
    const vVal = parseInt(document.getElementById('score-viewer').value) || 0;
    const fVal = parseInt(document.getElementById('score-fan').value) || 0;
    const tVal = parseInt(document.getElementById('score-time').value) || 0;

    // 가산점 수치 수집
    const vodScore = parseInt(document.getElementById('add-vod-count').value) || 0;
    const rateScore = parseInt(document.getElementById('add-vod-rate').value) || 0;
    const expertScore = document.getElementById('add-expert').checked ? 5 : 0;

    const totalScoreElement = document.getElementById('total-score');
    
    // 방송 시간 100시간 미만 체크 (필수 조건)
    if (tVal < 100) {
        totalScoreElement.innerText = "신청 불가 (시간 부족)";
        totalScoreElement.style.color = "#f44336";
        return;
    }

    // [계산 1] 정량 평가 점수 (가중치 적용)
    const vPoint = getPoint(vVal, 'viewer');
    const fPoint = getPoint(fVal, 'fan');
    const tPoint = getPoint(tVal, 'time');
    const baseTotal = (vPoint * 0.4) + (fPoint * 0.4) + (tPoint * 0.2);

    // [계산 2] 가산점 합산
    const finalTotal = baseTotal + vodScore + rateScore + expertScore;

    // [결과 출력]
    totalScoreElement.innerText = finalTotal.toFixed(1) + "점";
    totalScoreElement.style.color = "#3498db";
}
