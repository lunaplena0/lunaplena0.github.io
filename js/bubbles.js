/**
 * 바다비 아카이브 - 물방울 배경 효과
 * 설명: 화면 하단에서 위로 올라가는 물방울들을 생성합니다.
 */
function createBubbles() {
    // 모바일 성능을 고려하여 물방울 개수 조절 (8~10개 적당)
    const bubbleCount = 10; 
    const body = document.body;

    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 크기 랜덤 설정 (15px ~ 55px)
        const size = Math.random() * 40 + 15 + 'px';
        bubble.style.width = size;
        bubble.style.height = size;
        
        // 가로 위치 랜덤 (0 ~ 100vw)
        bubble.style.left = Math.random() * 100 + 'vw';
        
        // [수정된 부분] 초기 시작 위치를 화면 전체(0~100vh)에 랜덤하게 배치
        // 이렇게 하면 페이지 로드 즉시 화면 중간중간에 물방울이 보입니다.
        bubble.style.top = Math.random() * 100 + 'vh'; 
        
        // 애니메이션 속도 및 지연 시간 랜덤
        bubble.style.animationDuration = Math.random() * 8 + 10 + 's';
        
        // 음수 딜레이를 주어 애니메이션이 이미 진행 중인 것처럼 보이게 함
        bubble.style.animationDelay = Math.random() * -10 + 's'; 
        
        body.appendChild(bubble);
    }
}

// 페이지 로드 시 실행
if (document.readyState === 'complete') {
    createBubbles();
} else {
    window.addEventListener('load', createBubbles);
}
