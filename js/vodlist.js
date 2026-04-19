let visibleCount = 10;
    // 1. 구글 시트 웹 게시 CSV URL (여기에 복사한 URL을 넣으세요)
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfTHMy1hImniay9QEPDcMq5C4Yo5yFpmRtBlWo6UXK-FNxABQYbtfGpEsKom2O-OIJPnEi8LLy1Qqx/pub?gid=0&single=true&output=tsv";

document.addEventListener("DOMContentLoaded", function() {
    // 1. 글자를 먼저 생성 (이게 먼저 실행되어야 글자가 보입니다)
    if (typeof prepareWaveText === "function") {
        prepareWaveText("소중한 기록들을 정리하고 있어요 . . .");
    }

    // 2. 오버레이를 강제로 보여줌
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
    }

    // 3. 데이터 로딩 시작
    loadSheetData();
});

// 통계 계산용 ID를 HTML 태그에 맞춰 설정하기 위해 선택자 준비
function updateTagStatistics(data) {
    let totalVods = 0;
    let totalSec = 0;
    let plusTotalSec = 0;
    let maxSec = 0;
    let minSec = Infinity;
    let maxDate = "";
    
    const tagCount = {};
    let totalTagInstances = 0;

    // 1. 데이터 순회 및 기본 수치 계산
    data.forEach(row => {
        if (!row['날짜']) return;
        totalVods++;

        const currentSec = timeToSeconds(row['다시보기 총시간']);
        totalSec += currentSec;

        if (row['구독플러스여부'] === '예') {
            plusTotalSec += currentSec;
        }

        if (currentSec > maxSec) {
            maxSec = currentSec;
            maxDate = row['날짜'];
        }
        if (currentSec > 0 && currentSec < minSec) minSec = currentSec;

        // 태그 추출 및 카운트
        let rowTags = row['컨텐츠 종류'] ? row['컨텐츠 종류'].split(',').map(t => t.trim()) : [];
        if (row['구독플러스여부'] === '예') rowTags.push('구독+');
        if (row['성인인증 필요 여부'] === '예') rowTags.push('19');

        rowTags.forEach(tag => {
            if (tag && tag !== '-') {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
                totalTagInstances++;
            }
        });
    });

    // 2. 메인 대시보드 상단 수치 업데이트
    document.getElementById('statTotalTime').innerText = secondsToText(totalSec);
    const plusPercent = totalSec > 0 ? Math.round((plusTotalSec / totalSec) * 100) : 0;
    document.getElementById('statPlusTimeRatio').innerText = `${secondsToText(plusTotalSec)} (${plusPercent}%)`;
    document.getElementById('statMaxTime').innerText = secondsToText(maxSec);
    const avgSec = totalVods > 0 ? Math.floor(totalSec / totalVods) : 0;
    document.getElementById('statAvgTime').innerText = secondsToText(avgSec);
    document.getElementById('statMinTime').innerText = (minSec === Infinity) ? '-' : secondsToText(minSec);

    // 3. 태그 데이터 정렬
    const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);

    // 4. [태그 비중 (Top 5)] 카드 업데이트
    const ratioContainer = document.querySelector('.card:nth-child(2)'); 
    if (ratioContainer) {
        let ratioHtml = '<h2>📈 통합 태그 비중 (Top 5)</h2>';
        const top5 = sortedTags.slice(0, 5);
        const othersCount = sortedTags.slice(5).reduce((acc, curr) => acc + curr[1], 0);

        top5.forEach(([name, count]) => {
            const percentage = Math.round((count / totalTagInstances) * 100);
            // 4번 섹션 내 barColor 결정 로직 (필요시 수정)
const barColor = name.includes('구독') ? '#ffcc00' : (name.includes('19') || name.includes('성인') ? '#ff4444' : 'var(--accent-bright)');
            ratioHtml += `
                <div class="item-row">
                    <div style="display: flex; justify-content: space-between;"><span>${name.startsWith('#') || name.startsWith('⭐') || name.startsWith('🔞') ? name : '#'+name}</span><strong>${percentage}%</strong></div>
                    <div class="graph-bar-container"><div class="graph-bar" style="width: ${percentage}%; background: ${barColor};"></div></div>
                </div>`;
        });
        if (othersCount > 0) {
            const othersPercent = Math.round((othersCount / totalTagInstances) * 100);
            ratioHtml += `
                <div class="item-row">
                    <div style="display: flex; justify-content: space-between; color: var(--text-sub);"><span>기타 (외 ${sortedTags.length - 5}종)</span><strong>${othersPercent}%</strong></div>
                    <div class="graph-bar-container"><div class="graph-bar" style="width: ${othersPercent}%; opacity: 0.5;"></div></div>
                </div>`;
        }
        ratioContainer.innerHTML = ratioHtml;
    }

   // 5. [전체 태그 순위] 그리드 업데이트
    // 5. [전체 태그 순위] 그리드 업데이트 부분 수정
const rankGrid = document.querySelector('.rank-grid');
if (rankGrid) {
    rankGrid.innerHTML = ''; 
    sortedTags.forEach(([name, count], index) => {
        const rank = index + 1;
        const isTop = rank <= 3 ? 'top-rank' : '';
        
        let finalName = name;
        let specialStyle = '';

        // 이름에 '구독'이 포함된 경우 (구독+)
        if (name.includes('구독')) {
            finalName = '#구독+'; 
            specialStyle = 'color:#ffcc00; font-weight:bold;';
        } 
        // 이름에 '19'가 포함된 경우 (성인인증)
        else if (name.includes('19')) {
            finalName = '#19';    
            specialStyle = 'color:#ff4444; font-weight:bold;';
        } 
        // 그 외 일반 태그
        else {
            finalName = name.startsWith('#') ? name : '#' + name;
        }

        const rankItem = `
            <div class="rank-item" 
                 data-tag="${name}" 
                 onclick="toggleTagFilter('${name}')" 
                 style="${specialStyle} cursor:pointer; padding: 6px 8px; margin: 2px 0; display: flex; align-items: center;">
                <span class="rank-badge ${isTop}">${rank}</span>
                <span class="tag-text" style="margin-left: 5px;">${finalName}</span>
            </div>`;
        rankGrid.insertAdjacentHTML('beforeend', rankItem);
    });
}

    // 6. 요약 보고서 기본 연동 데이터
    let topTag = sortedTags.length > 0 ? sortedTags[0][0] : '-';
    let topTagName = topTag;

    // 요약 칸에서도 기호 제거
    if (topTag.includes('구독')) {
        topTagName = '구독+';
    } else if (topTag.includes('성인')) {
        topTagName = '19';
    } else if (topTag !== '-') {
        topTagName = topTag.startsWith('#') ? topTag : '#' + topTag;
    }
    
    if(document.getElementById('sumTotalTime')) document.getElementById('sumTotalTime').innerText = secondsToText(totalSec);
    if(document.getElementById('sumTotalCount')) document.getElementById('sumTotalCount').innerText = `${totalVods}회`;
    if(document.getElementById('sumTopTag')) document.getElementById('sumTopTag').innerText = topTagName;

    // 요약 리포트용 연간 데이터 기초
    if(document.getElementById('sumYearlyTime')) document.getElementById('sumYearlyTime').innerText = secondsToText(totalSec);
    const uniqueMonths = new Set(data.map(row => row['날짜'] ? row['날짜'].substring(0, 7) : null).filter(Boolean)).size;
    const avgMonthlySec = uniqueMonths > 0 ? Math.floor(totalSec / uniqueMonths) : 0;
    if(document.getElementById('sumAvgMonthlyTime')) document.getElementById('sumAvgMonthlyTime').innerText = secondsToText(avgMonthlySec);
    if(document.getElementById('sumMaxDay')) document.getElementById('sumMaxDay').innerText = maxDate ? `${maxDate.split('-')[1]}월 ${maxDate.split('-')[2]}일` : '-';
}
// 시간 변환 보조 함수들 (기존과 동일하게 유지)
function timeToSeconds(timeStr) {
    if (!timeStr || timeStr === '-') return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
}

function secondsToText(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}시간 ${m}분`;
}
let currentPopupTag = null; // 팝업 내 선택된 태그 상태 저장

function filterPopupVodByTag(tagName) {
    const targetYear = document.getElementById('selectYear').value;
    const targetMonth = document.getElementById('selectMonth').value;
    let baseData = (targetMonth === 'all') 
        ? Object.values(groupedData[targetYear] || {}).flat() 
        : groupedData[targetYear]?.[targetMonth] || [];

    if (currentPopupTag === tagName) {
        currentPopupTag = null; 
        renderRptVodList(baseData);
        updatePopupTagHighlight(null);
    } else {
        currentPopupTag = tagName;
        const filtered = baseData.filter(row => {
            // 일반 태그 리스트 생성
            const rowTags = row['컨텐츠 종류'] ? row['컨텐츠 종류'].split(',').map(t => t.trim()) : [];
            
            // --- 이 부분을 수정합니다 ---
            if (tagName === '구독+') {
                return row['구독플러스여부'] === '예';
            } else if (tagName === '19') {
                return row['성인인증 필요 여부'] === '예';
            } else {
                // 일반 #태그 필터링 (샵 기호 제거 후 비교)
                return rowTags.some(t => t.replace('#','') === tagName.replace('#',''));
            }
        });

        renderRptVodList(filtered);
        updatePopupTagHighlight(tagName);
    }
}
      // [보강] 팝업 내 태그 클릭 시 시각적 효과
function updatePopupTagHighlight(tagName) {
    const items = document.querySelectorAll('#rptTags .rank-item');
    items.forEach(item => {
        // 태그 텍스트 추출 (예: "#게임" -> "게임")
        const tagTextElement = item.querySelector('span:nth-child(2)');
        if (!tagTextElement) return; // 요소가 없으면 건너뜀

        const itemTag = tagTextElement.innerText.replace('#','').trim();
        
        // 클릭된 태그와 일치할 경우 (강조 효과)
        if (tagName && itemTag === tagName.replace('#','').trim()) {
            item.style.backgroundColor = 'rgba(51, 133, 255, 0.3)';
            item.style.border = '1px solid var(--accent-bright)';
            item.style.borderRadius = '6px';
        } 
        // 선택되지 않은 경우 (원래 CSS 디자인으로 복구)
        else {
            item.style.backgroundColor = ''; 
            item.style.border = '';         
            item.style.borderRadius = '';   
        }
    });
}
let allData = []; // 전체 데이터를 저장할 변수
let currentFilter = null; // 현재 선택된 태그

// 기존 loadSheetData 함수 수정
function loadSheetData() {
    
    Papa.parse(sheetURL, {
        download: true,
        header: true,
        complete: function(results) {
            allData = results.data.filter(row => row['날짜']); 
            
            renderVODList(allData); 
            updateTagStatistics(allData); 
            // 리포트 데이터 그룹화 및 초기 렌더링 호출
            initializeReportData(allData);
            updateReport(); 
           // 로딩 종료 (loading.js에 있는 함수)
            if (typeof hideLoadingOverlay === "function") {
                hideLoadingOverlay();
            }
        }
    });
}
        // [추가] 리포트 전용 VOD 리스트 렌더링
function renderRptVodList(data) {
    const listContainer = document.getElementById('rptVodList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (data.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-sub);">조건에 맞는 방송이 없습니다.</div>';
        return;
    }

    data.forEach(row => {
        const item = `
            <div class="item-row" style="cursor:pointer; padding:10px; border-bottom:1px solid var(--border);" onclick="openDetailedModal(${JSON.stringify(row).replace(/"/g, '&quot;')})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:11px; font-weight:bold; color:var(--text-sub);">${row['날짜'].substring(5).replace('-','.')}</span>
                    <span style="font-size:13px; flex:1; margin: 0 12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${row['제목']}</span>
                    <span style="font-size:11px; color:var(--accent-bright); font-family:monospace;">${row['다시보기 총시간']}</span>
                </div>
            </div>`;
        listContainer.insertAdjacentHTML('beforeend', item);
    });
}
        // [보강] 태그 순위 및 필터링 렌더링 (리포트용)
// 리포트용 태그 리스트 (5개 제한 삭제 후 전체 출력)
function renderRptTags(data) {
    const tagCount = {};
    
    data.forEach(row => {
        let rowTags = row['컨텐츠 종류'] ? row['컨텐츠 종류'].split(',').map(t => t.trim()) : [];
        
        // 기호 대신 텍스트로 변환하여 추가
        if (row['구독플러스여부'] === '예') rowTags.push('구독+'); 
        if (row['성인인증 필요 여부'] === '예') rowTags.push('19');

        rowTags.forEach(tag => { 
            if(tag && tag !== '-') {
                tagCount[tag] = (tagCount[tag] || 0) + 1; 
            }
        });
    });

    const sorted = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
    const container = document.getElementById('rptTags');
    
    container.innerHTML = sorted.map(([name, count], i) => {
        // 스타일 구분을 위한 체크
        const isPlus = name === '구독+';
        const isAdult = name === '19';
        const specialStyle = isPlus ? 'color:#ffcc00;' : (isAdult ? 'color:#ff4444;' : '');
        
        // [수정] 모든 태그 앞에 #이 붙도록 통일 (이미 #이 있으면 중복 방지)
        const displayName = name.startsWith('#') ? name : '#' + name;

        return `
            <div class="rank-item" onclick="filterPopupVodByTag('${name}')" 
                 style="font-size:12px; padding:6px 10px; margin-bottom:4px; cursor:pointer; ${specialStyle}">
                <span class="rank-badge ${i < 3 ? 'top-rank' : ''}">${i + 1}</span>
                <span style="flex:1; margin-left:8px;">${displayName}</span>
                <small style="color:var(--text-sub);">${count}회</small>
            </div>
        `;
    }).join('') || '<p style="color:var(--text-sub); font-size:12px;">데이터 없음</p>';
}
function toggleTagFilter(tagName) {
    visibleCount = 10;
    const listContainer = document.querySelector('.vod-list');
    
    // 이미 선택된 태그를 다시 클릭하면 해제
    if (currentFilter === tagName) {
        currentFilter = null;
    } else {
        currentFilter = tagName;
    }

    // 필터링 적용
    const filteredData = currentFilter 
        ? allData.filter(row => {
            const rowTags = row['컨텐츠 종류'] ? row['컨텐츠 종류'].split(',').map(t => t.trim()) : [];
            if (row['구독플러스여부'] === '예') rowTags.push('구독+');
            if (row['성인인증 필요 여부'] === '예') rowTags.push('19');
            
            // #이 붙어있든 아니든 비교할 수 있게 처리
            return rowTags.some(t => t.replace('#','') === currentFilter.replace('#',''));
        })
        : allData;

    renderVODList(filteredData);
    updateRankHighlight(); // 순위표 하이라이트 업데이트
}
// 순위표에서 선택된 태그 강조 스타일 업데이트
function updateRankHighlight() {
    document.querySelectorAll('.rank-item').forEach(item => {
        const tagValue = item.getAttribute('data-tag'); 
        
        if (currentFilter && tagValue === currentFilter) {
            // [선택된 상태] 강조 스타일 적용
            item.style.background = 'rgba(51, 133, 255, 0.25)';
            item.style.borderColor = 'var(--accent-bright)';
            item.style.borderRadius = '6px';
            item.style.boxShadow = 'inset 0 0 5px rgba(51, 133, 255, 0.2)';
            item.style.borderWidth = '1px'; // 테두리 두께 보장
            item.style.borderStyle = 'solid'; // 테두리 스타일 보장
        } else {
            // [기본 상태] JS가 강제로 넣었던 스타일을 제거하여 CSS 파일 설정으로 복구
            item.style.background = '';      
            item.style.borderColor = '';     
            item.style.borderRadius = '';    
            item.style.boxShadow = '';
            item.style.borderWidth = '';
            item.style.borderStyle = '';
        }
    });
}
function renderVODList(data) {
    const listContainer = document.querySelector('.vod-list');
    listContainer.innerHTML = ''; 

    if (data.length === 0) {
        listContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:50px; color:var(--text-sub);">해당 태그의 다시보기가 없습니다.</div>';
        updatePaginationButtons(0);
        return;
    }

    const displayData = data.slice(0, visibleCount);

    displayData.forEach((row) => {
    if(!row['날짜']) return;

    // 1. 날짜 처리
    const dateParts = row['날짜'].split('-');
    const displayDate = dateParts.length === 3 ? `${dateParts[1]}.${dateParts[2]}` : row['날짜'];

    // --- [중요] 변수 선언을 태그 생성보다 위로 올립니다 ---
    const isAdult = row['성인인증 필요 여부'] === '예';
    const isPlus = row['구독플러스여부'] === '예';

    // 2. 컨텐츠 종류 태그화 로직
    const tagsRaw = row['컨텐츠 종류'] ? row['컨텐츠 종류'].split(',').map(t => t.trim()) : [];
    // [추가] 모바일 여부 판단 (768px 미만일 때 모바일로 간주)
const isMobile = window.innerWidth <= 768;
// 모바일일 때는 2개만, PC일 때는 전체 다 보여줌
const maxVisibleTags = isMobile ? 2 : tagsRaw.length;
    let tagHtml = '';

    // 구독+는 무조건 가장 먼저! (이제 isPlus를 안전하게 사용할 수 있습니다)
    if (isPlus) {
        tagHtml += `<span class="vod-tag" style="background:#ffcc00; color:#000; font-weight:bold; flex-shrink:0;">구독+</span>`;
    }

    // 일반 태그 2개 노출
    tagsRaw.slice(0, maxVisibleTags).forEach(tag => {
        if(tag) tagHtml += `<span class="vod-tag">#${tag}</span>`;
    });

    // 넘치는 개수 표시
    if (tagsRaw.length > maxVisibleTags) {
        tagHtml += `<span class="vod-tag plus-tag" style="background:rgba(255,255,255,0.1); opacity:0.7;">+${tagsRaw.length - maxVisibleTags}</span>`;
    }

    // 3. 아이템 생성 및 렌더링
    const vodItem = document.createElement('div');
    vodItem.className = 'vod-item';
    
    const adultBadge = isAdult ? '<span class="badge-19" style="background:#ff4444; color:#fff; font-size:10px; padding:1px 4px; border-radius:3px; margin-left:4px; vertical-align:middle;">19</span>' : '';

    vodItem.innerHTML = `
        <div class="vod-thumb">
            <img src="${row['썸네일'] && row['썸네일'].trim() !== '' ? row['썸네일'] : 'https://placehold.co/160x90/16243a/5c7285?text=No+Image'}" alt="VOD">
        </div>
        <div class="vod-date">
            <span class="date-day">${displayDate}</span>
            <span class="date-duration">${row['다시보기 총시간']}</span>
        </div>
        <div class="vod-info">
            <div class="vod-title">
                <span class="title-text">${row['제목']}</span>
                ${adultBadge} 
            </div>
            <div class="vod-meta" style="display:flex; flex-wrap:nowrap; gap:4px; overflow:hidden;">
                ${tagHtml}
            </div>
        </div>
    `;

    vodItem.onclick = () => openDetailedModal(row);
    listContainer.appendChild(vodItem);
});
    // 2. 더보기 / 접기 버튼 관리
    updatePaginationButtons(data.length);
}
        function updatePaginationButtons(totalLength) {
    // 기존 버튼이 있다면 삭제
    const existingControl = document.getElementById('vod-control');
    if (existingControl) existingControl.remove();

    if (totalLength === 0) return;

    const controlDiv = document.createElement('div');
    controlDiv.id = 'vod-control';
    controlDiv.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:10px; margin-top:20px; width:100%; padding-bottom:30px;';

    // 표시 상태 텍스트 (예: 10/30)
    const currentShown = Math.min(visibleCount, totalLength);
    const statusText = `<span style="color:var(--text-sub); font-size:13px; font-family:monospace;">${currentShown} / ${totalLength}</span>`;

    let buttonsHtml = statusText;
    buttonsHtml += `<div style="display:flex; gap:10px;">`;

    // 더보기 버튼 (데이터가 더 남아있을 때만 표시)
    if (visibleCount < totalLength) {
        buttonsHtml += `<button onclick="loadMoreVods()" class="btn-pagination">더보기</button>`;
    }

    // 접기 버튼 (10개 초과로 보고 있을 때만 표시)
    if (visibleCount > 10) {
        buttonsHtml += `<button onclick="resetVods()" class="btn-pagination" style="background:rgba(255,255,255,0.1); color:var(--text-main);">접기</button>`;
    }

    buttonsHtml += `</div>`;
    controlDiv.innerHTML = buttonsHtml;
    
    // 리스트 컨테이너 뒤에 삽입
    document.querySelector('.vod-list').after(controlDiv);
}

// 더보기 로직
function loadMoreVods() {
    visibleCount += 10;
    // 현재 필터링된 데이터가 있다면 그 데이터를 기준으로 다시 렌더링
    const targetData = currentFilter ? getFilteredData() : allData;
    renderVODList(targetData);
}

// 접기 로직
function resetVods() {
    visibleCount = 10;
    const targetData = currentFilter ? getFilteredData() : allData;
    renderVODList(targetData);
    // 스크롤을 리스트 상단으로 이동 (선택 사항)
    document.querySelector('.vod-list').scrollIntoView({ behavior: 'smooth' });
}

// 현재 필터 상태의 데이터를 가져오는 보조 함수
function getFilteredData() {
    return allData.filter(row => {
        const rowTags = row['컨텐츠 종류'] ? row['컨텐츠 종류'].split(',').map(t => t.trim()) : [];
        if (row['구독플러스여부'] === '예') rowTags.push('구독+');
        if (row['성인인증 필요 여부'] === '예') rowTags.push('19');
        return rowTags.some(t => t.replace('#','') === currentFilter.replace('#',''));
    });
}
// 전역 변수 설정
let groupedData = {}; // { "2026": { "04": [...], "03": [...] } }

// 1. 데이터 초기 그룹화 (loadSheetData 완료 시 호출)
function initializeReportData(data) {
    groupedData = {};
    const yearSelect = document.getElementById('selectYear');
    const years = new Set();

    data.forEach(row => {
        if (!row['날짜']) return;
        const [y, m] = row['날짜'].split('-');
        if (!groupedData[y]) groupedData[y] = {};
        if (!groupedData[y][m]) groupedData[y][m] = [];
        groupedData[y][m].push(row);
        years.add(y);
    });

    // 연도 셀렉트박스 채우기
    yearSelect.innerHTML = Array.from(years).sort().reverse()
        .map(y => `<option value="${y}">${y}년</option>`).join('');
    
    // 이벤트 리스너 등록
    document.getElementById('selectYear').addEventListener('change', updateReport);
    document.getElementById('selectMonth').addEventListener('change', updateReport);
}

// 2. 리포트 업데이트 함수
function updateReport() {
    const targetYear = document.getElementById('selectYear').value;
    const targetMonth = document.getElementById('selectMonth').value;

    let currentData = [];
    let prevData = [];

    if (targetMonth === 'all') {
        // 연도별 데이터 처리 및 작년 데이터 비교 로직 (생략 가능)
        currentData = Object.values(groupedData[targetYear] || {}).flat();
        prevData = Object.values(groupedData[parseInt(targetYear)-1] || {}).flat();
    } else {
        // 월별 데이터 처리 및 전달 데이터 비교
        currentData = groupedData[targetYear]?.[targetMonth] || [];
        const prevMonth = parseInt(targetMonth) === 1 ? '12' : (parseInt(targetMonth)-1).toString().padStart(2, '0');
        const prevYear = parseInt(targetMonth) === 1 ? (parseInt(targetYear)-1).toString() : targetYear;
        prevData = groupedData[prevYear]?.[prevMonth] || [];
    }

    renderStats(currentData, prevData);
    renderCategorySummary(currentData);
    renderRptVodList(currentData);
}

// 3. 수치 및 비교 렌더링
function renderStats(curr, prev) {
    const currTotal = curr.reduce((acc, r) => acc + timeToSeconds(r['다시보기 총시간']), 0);
    const prevTotal = prev.reduce((acc, r) => acc + timeToSeconds(r['다시보기 총시간']), 0);
    
    // 현재 총 시간 표시
    document.getElementById('rptTotalTime').innerText = secondsToText(currTotal);
    
    // [수정] 시간 차이 계산 (단순 unit 전달 대신 직접 텍스트 생성)
    setDiffTime('diffTotalTime', currTotal, prevTotal);

    // 방송 횟수 표시 및 차이 계산
    document.getElementById('rptCount').innerText = `${curr.length}회`;
    setDiff('diffCount', curr.length, prev.length, "회");

    // 평균 시간 차이 계산
    const currAvg = curr.length > 0 ? currTotal / curr.length : 0;
    const prevAvg = prev.length > 0 ? prevTotal / prev.length : 0;
    document.getElementById('rptAvgTime').innerText = secondsToText(currAvg);
    setDiffTime('diffAvgTime', currAvg, prevAvg);
}

// 1. 일반 숫자 비교 함수 (방송 횟수 등에 사용)
function setDiff(id, curr, prev, unit) {
    const el = document.getElementById(id);
    if (!el) return;
    if (prev === 0) { el.innerText = "신규"; el.style.color = "var(--accent-bright)"; return; }
    
    const diff = curr - prev;
    if (diff === 0) { el.innerText = "변동 없음"; el.style.color = "var(--text-sub)"; return; }

    const color = diff > 0 ? "#ff4444" : "#3385ff";
    const sign = diff > 0 ? "▲" : "▼";
    el.style.color = color;
    el.innerText = `${sign} ${Math.abs(diff)}${unit}`;
}

// 2. 시간 전용 비교 함수 (총 방송 시간 등에 사용)
function setDiffTime(id, curr, prev) {
    const el = document.getElementById(id);
    if (!el) return;
    if (prev === 0) { el.innerText = "신규 기록"; el.style.color = "var(--accent-bright)"; return; }

    const diff = curr - prev;
    if (diff === 0) { el.innerText = "변동 없음"; el.style.color = "var(--text-sub)"; return; }

    const color = diff > 0 ? "#ff4444" : "#3385ff";
    const sign = diff > 0 ? "▲" : "▼";
    
    const absDiff = Math.abs(diff);
    const h = Math.floor(absDiff / 3600);
    const m = Math.floor((absDiff % 3600) / 60);

    let diffText = "";
    if (h > 0) diffText += `${h}시간 `;
    if (m > 0 || h === 0) diffText += `${m}분`; // 0분이어도 표시하거나 분 단위 노출

    el.style.color = color;
    el.innerText = `${sign} ${diffText.trim()}`;
}
// 카테고리별(게임, 노래 등) 텍스트 요약
function renderCategorySummary(data) {
    const categories = {
        'game': { icon: '🎮', label: '게임 기록', items: {} },
        'song': { icon: '🎤', label: '노래 기록', items: {} },
        'content': { icon: '🎬', label: '콘텐츠 기록', items: {} }
    };

    data.forEach(r => {
        const process = (key, category) => {
            if (r[key] && r[key] !== '-' && r[key] !== '0') {
                r[key].split(',').forEach(item => {
                    let name = item.split('(')[0].trim();
                    if (name) {
                        categories[category].items[name] = (categories[category].items[name] || 0) + 1;
                    }
                });
            }
        };
        process('게임(시간)', 'game');
        process('노래(시간)', 'song');
        process('컨텐츠(시간)', 'content');
    });

    // 현재 화면 너비 확인 (모바일 여부 판단)
    const isMobile = window.innerWidth <= 768;

    const generateHtml = (cat) => {
        const sortedItems = Object.entries(cat.items).sort((a, b) => b[1] - a[1]);
        
        // PC는 3열(혹은 6열), 모바일은 1열로 자동 전환
        const gridColumns = isMobile ? '1fr' : 'repeat(6, 1fr)';
        
        let html = `<div style="width: 100%; margin-bottom: 30px;">
                        <b style="color:var(--accent-bright); font-size:14px; display:block; margin-bottom:12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
                            ${cat.icon} ${cat.label}
                        </b>
                        <div style="display: grid; grid-template-columns: ${gridColumns}; gap: 10px;">`;
        
        if (sortedItems.length > 0) {
            html += sortedItems.map(([name, count]) => `
                <div style="background:rgba(255,255,255,0.05); padding:12px 15px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; box-sizing: border-box;">
                    <span style="font-size:13px; color:var(--text-main);">${name}</span>
                    <strong style="font-size:12px; color:var(--accent-bright);">${count}회</strong>
                </div>
            `).join('');
        } else {
            html += `<div style="grid-column: 1/-1; color:var(--text-sub); font-size:12px; padding:10px; text-align:center;">데이터 없음</div>`;
        }
        html += `</div></div>`;
        return html;
    };

    const container = document.getElementById('rptCategory');
    container.style.display = 'block'; 
    container.innerHTML = 
        generateHtml(categories.game) + 
        generateHtml(categories.song) + 
        generateHtml(categories.content);
    
    renderRptTags(data);
}

// 상세 팝업 오픈 (시트 데이터 기반)
function openDetailedModal(data) {
    document.getElementById('modalThumb').src = data['썸네일'] && data['썸네일'].trim() !== '' 
        ? data['썸네일'] 
        : 'https://placehold.co/160x90/16243a/5c7285?text=No+Image';

    // --- 제목 및 특수 태그 처리 추가 ---
    const isAdult = data['성인인증 필요 여부'] === '예';
    const isPlus = data['구독플러스여부'] === '예';
    const rawUrl = data['링크'] ? data['링크'].trim() : "";
    const isValidUrl = rawUrl.startsWith('http'); // http로 시작하는 진짜 주소인지 확인
    
    // 제목을 클릭하면 새 창으로 이동하게 <a> 태그 적용
    // 링크가 없을 경우를 대비해 조건부로 처리합니다.
    let titleHtml = '';
    if (isValidUrl) {
        // 유효한 링크가 있을 때만 <a> 태그 적용
        titleHtml = `<a href="${rawUrl}" target="_blank" title="다시보기 보러가기" style="color: inherit; text-decoration: none; cursor: pointer;">${data['제목']} <small style="font-size: 10px; opacity: 0.5;">🔗</small></a>`;
    } else {
        // 링크가 없거나 '-'인 경우 그냥 텍스트만 표시
        titleHtml = data['제목'];
    }
    
    // 19세 태그 추가
    if (isAdult) {
        titleHtml += ` <span style="background:#ff4444; color:#fff; font-size:11px; padding:2px 6px; border-radius:4px; font-weight:bold; vertical-align:middle; margin-left:5px;">19</span>`;
    }
    // 구독+ 태그 추가
    if (isPlus) {
        titleHtml += ` <span style="background:#ffcc00; color:#000; font-size:11px; padding:2px 6px; border-radius:4px; font-weight:bold; vertical-align:middle; margin-left:5px;">구독+</span>`;
    }
    // 최종 제목 적용
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.innerHTML = titleHtml;

    // 제목에 호버 효과 추가 (선택 사항)
    modalTitle.onmouseover = () => { if(vodUrl) modalTitle.style.textDecoration = 'underline'; };
    modalTitle.onmouseout = () => { modalTitle.style.textDecoration = 'none'; };

    // innerText 대신 innerHTML을 사용하여 태그가 렌더링되게 합니다.
    document.getElementById('modalTitle').innerHTML = titleHtml;
    
    document.getElementById('modalDate').innerText = data['날짜'];
    document.getElementById('modalDuration').innerText = data['다시보기 총시간'];

    const tagContainer = document.getElementById('modalTags');
    
    // 1. 상단 컨텐츠 종류 태그 (기존 스타일 유지)
    const typeTags = data['컨텐츠 종류'] ? data['컨텐츠 종류'].split(',') : [];
    let typeHtml = typeTags.map(tag => `<span class="vod-tag" style="background:var(--accent); color:white;">#${tag.trim()}</span>`).join('');

    // 2. 상세 시간 정보 (줄바꿈 리스트 형식)
    const details = [
        { label: '🎮 게임', key: '게임(시간)' },
        { label: '🎤 노래', key: '노래(시간)' },
        { label: '💬 소통', key: '소통(시간)' },
        { label: '🎬 컨텐츠', key: '컨텐츠(시간)' }
    ];

    let detailHtml = '';
    details.forEach(d => {
        const val = data[d.key];
        // 데이터가 유효한 경우에만 (예: -, 0 등이 아닐 때)
        if (val && val !== '-' && val !== '0' && val !== '0시간') {
            // 쉼표로 구분된 항목들을 배열로 변환
            const subItems = val.split(',');
            
            detailHtml += `
                <div style="width:100%; margin-top:12px;">
                    <label style="display:block; font-size:11px; color:var(--accent-bright); margin-bottom:6px; font-weight:bold;">${d.label}</label>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        ${subItems.map(item => `
                            <div style="background:rgba(22, 36, 58, 0.6); padding:8px 12px; border-radius:6px; border:1px solid var(--border); font-size:12px; color:var(--text-main);">
                                ${item.trim()}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });

    tagContainer.innerHTML = typeHtml + detailHtml;

    document.getElementById('vodModal').style.display = 'flex';
}
// 기존 팝업 닫기 및 요약 로직 유지
function closeModal() { document.getElementById('vodModal').style.display = 'none'; }
function openSummary(e) { e.preventDefault(); document.getElementById('summaryModal').style.display = 'flex'; }
function closeSummary() { document.getElementById('summaryModal').style.display = 'none'; }
function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.currentTarget.classList.add('active');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal();
        closeSummary();
    }
}
