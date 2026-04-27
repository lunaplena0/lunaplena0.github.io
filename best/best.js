function checkCondition() {
    const target = parseFloat(document.getElementById('target-value').value);
    const current = parseFloat(document.getElementById('current-value').value);
    const resultDisplay = document.getElementById('result-display');
    const resultText = document.getElementById('result-text');
    const progressBar = document.getElementById('progress-bar-fill');

    if (isNaN(target) || isNaN(current)) {
        alert("수치를 모두 입력해주세요.");
        return;
    }

    resultDisplay.style.display = 'block';
    
    // 달성률 계산
    const percentage = Math.min((current / target) * 100, 100);
    progressBar.style.width = percentage + "%";

    if (current >= target) {
        resultText.innerHTML = `<strong style="color: #4caf50;">조건 충족!</strong> (달성률: ${percentage.toFixed(1)}%)`;
        progressBar.style.backgroundColor = '#4caf50';
    } else {
        const diff = target - current;
        resultText.innerHTML = `<strong style="color: #f44336;">조건 미달</strong> (앞으로 <b>${diff}</b>만큼 더 필요합니다)`;
        progressBar.style.backgroundColor = '#ff9800';
    }
}
