// VOD 항목을 화면에 추가하는 함수 (초기에는 접힌 형태로 로드)
function addVodRow(vod = {}) {
    const container = document.getElementById('vodlist-rows-container');
    const row = document.createElement('div');
    row.className = 'vod-row';
    
    // 데이터가 이미 존재하고 제목/날짜가 있다면 기본적으로 요약(접힌) 상태로 표시
    const hasData = (vod.title || vod.date);
    
    row.innerHTML = `
        <!-- [요약 뷰] 날짜와 제목만 간단히 표시 -->
        <div class="vod-summary-view" style="display: ${hasData ? 'flex' : 'none'}; justify-content: space-between; align-items: center; gap: 10px;">
            <div style="font-size: 14px; font-weight: 600; color: #03045e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
                <span style="color: #0284c7; margin-right: 8px;">[${vod.date || '날짜 미지정'}]</span> 
                <span class="summary-title-text">${vod.title || '제목 없음'}</span>
            </div>
            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                <button type="button" onclick="toggleVodEdit(this)" style="background-color: #0284c7; padding: 6px 12px; font-size: 12px;">수정</button>
                <button type="button" class="delete-item-btn" onclick="this.closest('.vod-row').remove()" style="padding: 6px 12px; font-size: 12px; margin-bottom:0;">삭제</button>
            </div>
        </div>

        <!-- [상세 편집 뷰] 수정 버튼을 누르거나 새로 추가할 때 펼쳐지는 입력 폼 -->
        <div class="vod-detail-view" style="display: ${hasData ? 'none' : 'flex'}; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 4px;">
                <span style="font-size: 13px; font-weight: 700; color: #0077b6;">VOD 상세 정보 편집</span>
                <span style="font-size: 11px; color: #64748b;">작성을 마치면 아래 완료 버튼을 누르세요</span>
            </div>
            <div class="vod-row-inline">
                <input type="text" placeholder="날짜 (예: 2026-06-06)" class="vod-date" value="${vod.date || ''}" oninput="updateSummaryTitle(this)">
                <input type="text" placeholder="컨텐츠 종류" class="vod-category" value="${vod.category || ''}">
                <input type="text" placeholder="다시보기 총시간 (예: 03:15:20)" class="vod-duration" value="${vod.duration || ''}">
            </div>
            <input type="text" placeholder="VOD 제목" class="vod-title" value="${vod.title || ''}" oninput="updateSummaryTitle(this)">
            <div class="vod-row-inline">
                <input type="text" placeholder="링크 (URL)" class="vod-link" value="${vod.link || ''}">
                <input type="text" placeholder="썸네일 이미지 주소 (URL)" class="vod-thumbnail" value="${vod.thumbnail || ''}">
            </div>
            <div class="vod-row-inline">
                <div>
                    <label style="font-size: 12px; margin-bottom: 4px;">구독플러스 여부</label>
                    <select class="vod-sub-plus">
                        <option value="N" ${vod.subPlus === 'N' ? 'selected' : ''}>일반 (N)</option>
                        <option value="Y" ${vod.subPlus === 'Y' ? 'selected' : ''}>구독플러스 (Y)</option>
                    </select>
                </div>
                <div>
                    <label style="font-size: 12px; margin-bottom: 4px;">성인인증 필요 여부</label>
                    <select class="vod-adult">
                        <option value="N" ${vod.adult === 'N' ? 'selected' : ''}>전체이용가 (N)</option>
                        <option value="Y" ${vod.adult === 'Y' ? 'selected' : ''}>성인인증 (Y)</option>
                    </select>
                </div>
            </div>
            <textarea placeholder="컨텐츠 상세정보 입력" class="vod-description" style="height: 70px;">${vod.description || ''}</textarea>
            
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
                <button type="button" onclick="toggleVodEdit(this)" style="background-color: #10b981; padding: 6px 14px; font-size: 12px;">편집 완료 (접기)</button>
                <button type="button" class="delete-item-btn" onclick="this.closest('.vod-row').remove()" style="padding: 6px 12px; font-size: 12px; margin-bottom:0;">삭제</button>
            </div>
        </div>
    `;
    container.appendChild(row);
}

// 수정/완료 버튼 클릭 시 요약 뷰와 상세 뷰를 전환하는 함수
function toggleVodEdit(button) {
    const row = button.closest('.vod-row');
    const summaryView = row.querySelector('.vod-summary-view');
    const detailView = row.querySelector('.vod-detail-view');

    if (summaryView.style.display === 'none') {
        // 상세 뷰 -> 요약 뷰로 전환 (접기)
        summaryView.style.display = 'flex';
        detailView.style.display = 'none';
    } else {
        // 요약 뷰 -> 상세 뷰로 전환 (펼치기)
        summaryView.style.display = 'none';
        detailView.style.display = 'flex';
    }
}

// 입력창에 타이핑할 때 요약 뷰의 제목/날짜 텍스트가 실시간으로 반영되도록 보조
function updateSummaryTitle(input) {
    const row = input.closest('.vod-row');
    const dateVal = row.querySelector('.vod-date').value.trim();
    const titleVal = row.querySelector('.vod-title').value.trim();
    
    const summarySpan = row.querySelector('.vod-summary-view span:first-child');
    summarySpan.innerHTML = `
        <span style="color: #0284c7; margin-right: 8px;">[${dateVal || '날짜 미지정'}]</span> 
        <span>${titleVal || '제목 없음'}</span>
    `;
}

async function loadVodListSettingsData() {
    const statusEl = document.getElementById('vodlist-status');
    statusEl.textContent = "데이터를 불러오는 중...";
    statusEl.style.color = "#0077b6";

    try {
        const response = await fetch(WORKER_URL + "?type=fanvodlist&t=" + Date.now());
        if (!response.ok) throw new Error("서버 응답 실패");
        
        const data = await response.json();
        const container = document.getElementById('vodlist-rows-container');
        container.innerHTML = "";

        let vodArray = [];
        if (Array.isArray(data)) {
            vodArray = data;
        } else if (data && Array.isArray(data.vods)) {
            vodArray = data.vods;
        } else if (data && Array.isArray(data.notes)) {
            vodArray = data.notes;
        }

        if (vodArray.length > 0) {
            vodArray.forEach(item => addVodRow(item));
        } else {
            addVodRow();
        }

        statusEl.textContent = "데이터를 성공적으로 불러왔습니다.";
        statusEl.style.color = "#10b981";
    } catch (err) {
        statusEl.textContent = "데이터를 불러오지 못했습니다. (빈 양식 사용)";
        statusEl.style.color = "#ef4444";
        const container = document.getElementById('vodlist-rows-container');
        if (container.children.length === 0) addVodRow();
    }
}

async function saveVodListSettings() {
    const statusEl = document.getElementById('vodlist-status');
    const password = document.getElementById('admin-password').value.trim();
    if (!password) {
        statusEl.textContent = "로그인 정보가 유실되었습니다. 다시 로그인해주세요.";
        statusEl.style.color = "#ef4444";
        return;
    }

    statusEl.textContent = "저장 중...";
    statusEl.style.color = "#0077b6";

    const vods = [];
    document.querySelectorAll('#vodlist-rows-container .vod-row').forEach(row => {
        const date = row.querySelector('.vod-date').value.trim();
        const category = row.querySelector('.vod-category').value.trim();
        const duration = row.querySelector('.vod-duration').value.trim();
        const title = row.querySelector('.vod-title').value.trim();
        const link = row.querySelector('.vod-link').value.trim();
        const thumbnail = row.querySelector('.vod-thumbnail').value.trim();
        const subPlus = row.querySelector('.vod-sub-plus').value;
        const adult = row.querySelector('.vod-adult').value;
        const description = row.querySelector('.vod-description').value.trim();

        if (title || link) {
            vods.push({
                date,
                title,
                link,
                thumbnail,
                duration,
                subPlus,
                adult,
                description,
                category
            });
        }
    });

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: password,
                fileType: "fanvodlist",
                content: { vods }
            })
        });

        if (response.ok) {
            statusEl.textContent = "성공적으로 저장되었습니다!";
            statusEl.style.color = "#10b981";
        } else {
            const errText = await response.text();
            throw new Error(errText || "저장 실패");
        }
    } catch (err) {
        statusEl.textContent = "저장 오류: " + err.message;
        statusEl.style.color = "#ef4444";
    }
}
