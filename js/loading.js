// loading.js

/**
 * 글자를 한 글자씩 나누고 애니메이션 지연 시간을 설정하는 함수
 * @param {string} text - 로딩창에 표시할 문구
 */
function prepareWaveText(text) {
    const container = document.getElementById('wave-text');
    if (!container) return;
    
    container.innerHTML = ''; // 기존 내용 초기화

    // 글자를 배열로 나누고, 공백은 특수문자로 처리
    const letters = text.split('').map(char => char === ' ' ? '&nbsp;' : char);

    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.innerHTML = letter;
        // 각 글자마다 0.1초씩 지연시켜 파도 효과를 만듦
        span.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(span);
    });
}

/**
 * 로딩 오버레이를 숨기는 함수
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;

    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.visibility = 'hidden';
            document.body.style.overflow = 'auto'; // 스크롤 다시 허용
        }, 500);
    }, 800);
}
