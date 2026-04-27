function calculateBestBJ() {
    // 값 가져오기
    const time = parseInt(document.getElementById('time-val').value) || 0;
    const fan = parseInt(document.getElementById('fan-val').value) || 0;
    const day = parseInt(document.getElementById('day-val').value) || 0;
    const edu = parseInt(document.getElementById('edu-val').value) || 0;
    const noPunish = document.getElementById('punish-check').checked;

    const resultPanel = document.getElementById('result-panel');
    const resultTitle = document.getElementById('result-title');
    const resultDesc = document.getElementById('result-desc');

    // 조건 판별
    let fails = [];
    if (time < 100) fails.push(`방송 시간 ${100 - time}시간 부족`);
    if (fan < 500) fails.push(`애청자 ${500 - fan}명 부족`);
    if (day < 30) fails.push(`방송 일수 ${30 - day}일 부족`);
    if (edu < 5) fails.push(`교육 수강 ${5 - edu}개 부족`);
    if (!noPunish) fails.push(`정지 기록 확인 필요`);

    resultPanel.style.display = 'block';

    if (fails.length === 0) {
        resultPanel.className = 'pass';
        resultTitle.innerText = "신청 가능 대상입니다!";
        resultDesc.innerText = "모든 필수 조건을 충족하셨습니다. 베스트 BJ에 도전해보세요!";
    } else {
        resultPanel.className = 'fail';
        resultTitle.innerText = "조건 미충족";
        resultDesc.innerHTML = fails.join('<br>');
    }
}
