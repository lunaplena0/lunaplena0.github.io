const TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQ3nX6onmaf-ZHhXGox2s4ChGos7ki7iFjQ_47lArZR6dV935gCIbLbvlDDAS65rTEnswSLIk_7v3R/pub?gid=0&single=true&output=tsv';
    const SONG_BOOK_URL = 'songlist.html'; 
    
    async function init() {
        const overlay = document.getElementById('loading-overlay');
    
   try {
            // 외부 파일(loading.js)의 함수 호출
            prepareWaveText("바닷속에서 찾고 있어요 . . .");
            
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        // ---------------------------

        const cacheBuster = `&t=${new Date().getTime()}`;
        const finalUrl = TSV_URL + cacheBuster;

        const response = await fetch(finalUrl, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) throw new Error('Network error');

        const text = await response.text();
        const rows = text.split(/\r?\n/).map(row => row.split('\t'));

            const profile = rows[2];
            const liveData = rows[6]; 
            const updateTimeData = rows[1] ? rows[1][5] : null; 
            const statusBox = document.querySelector('.live-status-inline');

            const isOnline = liveData && liveData[5] !== "방송 정보 없음" && liveData[5] !== undefined;

            if (isOnline) {
                const bTitle = liveData[5];
                const bTime = liveData[6];
                const bGrade = liveData[7];
                const bSubOnly = liveData[8];
                const bPwd = liveData[9];

                let onlineBadge = `<div class="badge" style="background:#d32f2f; color:white; margin-bottom:0; padding: 2px 8px; font-size: 9px;">ONLINE</div>`;
                let subTagsHtml = '';
                const subStyle = `padding: 1px 5px; font-size: 8px; margin: 0; background:#121f33; line-height: 1; border: 1px solid var(--border);`;

                if (!["X", "-"].includes(bGrade)) subTagsHtml += `<span class="badge" style="${subStyle} color:#FFAB91;">19</span>`;
                if (!["X", "-"].includes(bSubOnly)) subTagsHtml += `<span class="badge" style="${subStyle} color:#B39DDB;">구독+</span>`;
                if (!["X", "-"].includes(bPwd)) subTagsHtml += `<span class="badge" style="${subStyle} color:#90A4AE;">비밀번호</span>`;

                statusBox.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; margin-bottom: 5px;">
                        ${onlineBadge}
                        <div style="display: flex; gap: 3px; flex-wrap: wrap; justify-content: center;">
                            ${subTagsHtml}
                        </div>
                    </div>
                    <a href="https://play.sooplive.com/bababi" target="_blank" id="stream-title-inline" class="ellipsis" 
                       style="max-width:180px; color:var(--accent-bright); font-size:15px; margin-bottom:1px; text-decoration:none; display:block; cursor:pointer;">
                       ${bTitle}
                    </a>
                    <div id="last-stream-time" style="color:var(--text-sub); font-size:10px;">시작: ${bTime}</div>
                `;
            } else {
                const lastTime = (profile && profile[3]) ? profile[3].trim() : "확인 중";
                statusBox.innerHTML = `
                    <div class="badge offline">OFFLINE</div>
                    <div id="stream-title-inline" style="color: var(--text-sub);">방송 준비 중</div>
                    <div id="last-stream-time">최근 방송: ${lastTime}</div>
                `;
            }

            if (profile) {
    document.getElementById('user-nick').innerText = profile[0] || '닉네임';
    document.getElementById('user-desc').innerText = profile[1] || '';
    
    if(profile[2]) {
        // 1. 프로필 이미지 박스 변경 (기존 코드)
        document.querySelector('.profile-img').style.backgroundImage = `url('${profile[2]}')`;
        
        // 2. 브라우저 탭 마크(Favicon) 변경 (추가할 코드)
        const favicon = document.getElementById('favicon');
        if (favicon) {
            favicon.href = profile[2]; // 시트에서 가져온 PNG 주소를 파비콘에 적용
        }
    }
}

            if (updateTimeData) {
                let updateEl = document.getElementById('update-time');
                if (!updateEl) {
                    updateEl = document.createElement('div');
                    updateEl.id = 'update-time';
                    updateEl.style.cssText = "font-size: 9px; color: var(--text-sub); margin-top: 8px; opacity: 0.6;";
                    statusBox.appendChild(updateEl);
                }
                updateEl.innerText = `갱신: ${updateTimeData}`;
            }

            renderLinks(rows[5]);
            renderPosts(rows.slice(8, 13));
            renderVODs(rows.slice(16, 21));
            renderSchedule(rows.slice(24, 29));

        } catch (e) { 
            console.error("Data Load Error:", e);
        } finally {
            // 외부 파일(loading.js)의 함수 호출로 깔끔하게 마무리
            hideLoadingOverlay();
        }
    }

    // 렌더링 함수 내의 보라색 강조 효과들도 블루로 교체합니다.
    function renderLinks(extraLinks) {
    const targetBox = document.getElementById('extra-links-target');
    if (!targetBox) return;

    // Cloudflare 캐시로 인한 중복 생성 방지: 내부를 한 번 비우고 시작합니다.
    targetBox.innerHTML = '';

    if (extraLinks && Array.isArray(extraLinks)) {
        extraLinks.forEach(l => {
            // 빈 칸이거나 형식이 맞지 않으면 건너뜁니다.
            if (!l || !l.includes(': ')) return;

            const [name, ...urlParts] = l.split(': ');
            const url = urlParts.join(': ').trim();
            
            // 유효한 URL 형태일 때만 버튼을 생성합니다.
            if (url.startsWith('http')) {
                const a = document.createElement('a');
                a.className = 'link-btn';
                a.href = url;
                a.target = '_blank';
                a.innerText = name.trim();
                a.style.borderColor = 'var(--accent-bright)';
                targetBox.appendChild(a);
            }
        });
    }
}

    function renderPosts(data) {
        const postBox = document.getElementById('post-container');
        const postData = data.filter(p => p[1] && p[1].trim() !== "");
        let html = '<h2>📢 최근 게시물</h2>';
        postData.forEach(p => {
            const isNotice = p[3]?.trim() === 'O' ? '<span style="color:var(--accent-bright); margin-left: 5px;">📌</span>' : ''; 
            html += `<div class="item-row" onclick="window.open('${p[2]}', '_blank')" style="display: flex; flex-direction: row; align-items: center;">
                        <div style="flex: 1; min-width: 0;">
                            <div class="item-date">${p[0]}</div>
                            <div class="ellipsis">${p[1]}</div>
                        </div>
                        ${isNotice}
                    </div>`;
        });
        postBox.innerHTML = html;
    }

    function renderVODs(data) {
        const vodBox = document.getElementById('vod-container');
        const vodData = data.filter(v => v[1] && v[1].trim() !== "");
        let html = '<h2>🎬 최근 다시보기</h2>';
        vodData.forEach(v => {
            const isPin = v[4]?.trim() === 'O' ? '<span style="color:var(--accent-bright); margin-left: 5px; flex-shrink: 0;">📌</span>' : '';
            
            html += `<div class="item-row vod-row" onclick="window.open('${v[2]}', '_blank')" style="display: flex; flex-direction: row; align-items: center;">
                        <div class="vod-thumb" style="background-image:url('${v[3]}')"></div>
                        <div style="flex:1; min-width:0; display: flex; flex-direction: column; justify-content: center;">
                            <div class="item-date">${v[0]}</div>
                            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                <div class="ellipsis" style="font-size:11px; flex: 1;">${v[1]}</div>
                                ${isPin}
                            </div>
                        </div>
                    </div>`;
        });
        vodBox.innerHTML = html;
    }
    function renderSchedule(data) {
    const container = document.getElementById('schedule-container');
    if(!container) return;
    container.innerHTML = '';
    const todayStr = new Date().toLocaleDateString('en-CA'); 
    
    data.forEach(row => {
        const date = row[0]?.trim() || '';   
        const day = row[1]?.trim() || '';    
        const time = row[2]?.trim() || '';   
        const content = row[3]?.trim() || ''; 
        const category = row[4]?.trim() || ''; 

        if(!date && !content) return; 

        const isToday = date === todayStr;
        const isDayOff = category.includes('휴방'); 
        
        // 1. 내용은 이제 항상 기본색입니다.
        const contentStyle = 'color: var(--text-main);';
        
        // 2. 시간 표시 여부 (휴방일 땐 숨김)
        const timeInfo = (time && !isDayOff) ? `<span style="color:var(--accent-bright); font-weight:bold; margin-right:5px;">${time}</span>` : '';

        // 3. 분류(category) 스타일: 휴방일 때만 빨간색 bold 적용
        const categoryStyle = isDayOff ? 'color: #ff4d4d; font-weight: bold;' : 'color: var(--text-sub);';

        const rowDiv = document.createElement('div');
        rowDiv.className = `item-row schedule-row ${isToday ? 'today-highlight' : ''}`;
        
        rowDiv.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:1px; flex:1; min-width:0;">
                <span class="day" style="font-size:10px;">${date} (${day})${isToday ? '<span class="badge today-tag" style="font-size:8px; padding:1px 4px;">TODAY</span>' : ''}</span>
                <div style="font-size:12px; ${contentStyle} display:flex; align-items:center;">
                    ${timeInfo} <span class="ellipsis">${content || '일정 없음'}</span>
                </div>
            </div>
            <div style="font-size:10px; ${categoryStyle}">${category}</div>
        `;
        container.appendChild(rowDiv);
    });
}
    // 10분마다 새로고침
    window.onload = () => { init(); setInterval(init, 1000 * 60 * 10); };
