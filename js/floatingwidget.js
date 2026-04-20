function closeWidget() {
        document.getElementById('dday-widget').style.display = 'none';
    }

    let destinationUrl = "timer.html"; 

    function handleWidgetClick() {
        window.open(destinationUrl, '_blank');
    }

    const TARGET_DATE = new Date("2026-04-20T16:00:00").getTime();
    // 1시간을 밀리초로 계산 (3600초 * 1000)
    const ONE_HOUR_AFTER = 3600000; 

    function updateTimer() {
        const now = new Date().getTime();
        const diff = TARGET_DATE - now;
        const widget = document.getElementById('dday-widget');
        const timerEl = document.getElementById('timer');
        const msgEl = document.getElementById('widget-msg');

        if (!timerEl || !widget) return;

        // 1. 방송 시작 후 1시간이 지났을 때만 위젯을 숨김
        if (diff <= -ONE_HOUR_AFTER) {
            widget.style.display = 'none';
            return;
        }

        // 2. 시간 상태에 따른 처리
        if (diff <= 0) {
            // --- 방송 시작 후 (0분 ~ 60분 사이) ---
            destinationUrl = "https://play.sooplive.com/bababi";
            timerEl.innerText = "LIVE NOW"; // 타이머 대신 표시할 문구
            timerEl.style.color = "#ff4d4d"; // 빨간색 강조
            msgEl.innerText = "클릭 시 방송으로 이동합니다";
            msgEl.style.color = "#ff4d4d";
        } 
        else if (diff <= 300000) { 
            // --- 방송 시작 5분 전 ---
            destinationUrl = "https://play.sooplive.com/bababi";
            msgEl.innerText = "클릭 시 방송으로 이동합니다";
            msgEl.style.color = "#ff4d4d";
            
            // 타이머 시간 계산
            formatTimer(diff, timerEl);
        } 
        else {
            // --- 평상시 ---
            destinationUrl = "timer.html";
            msgEl.innerText = "클릭 시 타이머로 이동합니다";
            msgEl.style.color = "#3385ff";
            
            formatTimer(diff, timerEl);
        }
    }

    // 타이머 포맷팅 함수 분리
    function formatTimer(diff, element) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        let timeString = "";
        if(days > 0) timeString += days + "d ";
        timeString += String(hours).padStart(2, '0') + ":" + 
                      String(mins).padStart(2, '0') + ":" + 
                      String(secs).padStart(2, '0');
        
        element.innerText = timeString;
    }

    setInterval(updateTimer, 1000);
    updateTimer();
