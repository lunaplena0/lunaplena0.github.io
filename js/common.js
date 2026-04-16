// 프로필 정보가 있는 시트의 범위만 가져오는 URL (가정: profile[2]가 있는 위치)
const CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQ3nX6onmaf-ZHhXGox2s4ChGos7ki7iFjQ_47lArZR6dV935gCIbLbvlDDAS65rTEnswSLIk_7v3R/pub?gid=0&single=true&output=tsv';

async function loadGlobalFavicon() {
    try {
        const response = await fetch(CONFIG_URL + `&t=${Date.now()}`);
        const text = await response.text();
        const rows = text.split(/\r?\n/).map(row => row.split('\t'));
        
        // 메인 시트 구조와 동일하게 3번째 줄(index 2)의 3번째 칸(index 2) 호출
        const imgUrl = rows[2][2]; 

        if (imgUrl && imgUrl.startsWith('http')) {
            const favicon = document.getElementById('favicon');
            if (favicon) {
                const cacheBuster = imgUrl.includes('?') ? `&v=${Date.now()}` : `?v=${Date.now()}`;
                favicon.href = imgUrl.trim() + cacheBuster;
            }
            
            // 혹시 현재 페이지에 프로필 이미지가 있다면 그것도 같이 바꿔줌
            const profileImg = document.querySelector('.profile-img');
            if (profileImg) profileImg.style.backgroundImage = `url('${imgUrl}')`;
        }
    } catch (e) {
        console.error("Favicon load error:", e);
    }
}

// 페이지가 열리자마자 바로 실행
loadGlobalFavicon();
