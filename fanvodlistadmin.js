// VOD 항목을 화면에 추가하는 함수 (순서 완벽 맞춤 및 컴팩트 스타일)
function addVodRow(vod = {}, isNew = false) {
    const container = document.getElementById('vodlist-rows-container');
    const row = document.createElement('div');
    row.className = 'vod-row';
    row.style.cssText = "margin-bottom: 6px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; background-color: #fff;";
    
    const hasData = (vod.title || vod.date);
    
    const currentCount = container.querySelectorAll('.vod-row').length;
    let isCurrentlyExpanded = false;
    const toggleBtn = document.getElementById('vod-expand-toggle-btn');
    if (toggleBtn && toggleBtn.dataset.expanded === 'true') {
        isCurrentlyExpanded = true;
    }

    if (!isNew && currentCount >= 5 && !isCurrentlyExpanded) {
        row.style.display = 'none';
        row.classList.add('vod-hidden-item');
    }
    
    row.innerHTML = `
        <!-- [요약 뷰] 날짜와 제목만 간단히 표시 -->
        <div class="vod-summary-view" style="display: ${(hasData && !isNew) ? 'flex' : 'none'}; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="font-size: 13px; font-weight: 600; color: #03045e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
                <span style="color: #0284c7; margin-right: 6px;">[${vod.date || '날짜 미지정'}]</span> 
                <span class="summary-title-text">${vod.title || '제목 없음'}</span>
            </div>
            <div style="display: flex; gap: 4px; flex-shrink: 0;">
                <button type="button" onclick="toggleVodEdit(this)" style="background-color: #0284c7; padding: 3px 8px; font-size: 11px; border: none; border-radius: 4px; color: #fff; cursor: pointer;">수정</button>
                <button type="button" class="delete-item-btn" onclick="this.closest('.vod-row').remove(); updateVodToggleBtn();" style="background-color: #ef4444; padding: 3px 8px; font-size: 11px; border: none; border-radius: 4px; color: #fff; cursor: pointer; margin-bottom:0;">삭제</button>
            </div>
        </div>

        <!-- [상세 편집 뷰] 지정해주신 순서에 맞춘 컴팩트 UI -->
        <div class="vod-detail-view" style="display: ${(hasData && !isNew) ? 'none' : 'flex'}; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 2px;">
                <span style="font-size: 12px; font-weight: 700; color: #0077b6;">VOD 정보 입력 (순서: 날짜 ➔ 제목 ➔ 링크 ➔ 썸네일 ➔ 시간 ➔ 구독 ➔ 성인)</span>
                <span style="font-size: 10px; color: #64748b;">윗칸에 한 줄로 붙여넣기 가능</span>
            </div>

            <!-- 한 줄 일괄 붙여넣기 지원 인풋 -->
            <div style="background: #f8fafc; padding: 5px; border-radius: 4px; border: 1px dashed #cbd5e1; margin-bottom: 2px;">
                <input type="text" placeholder="예: 2026-08-07 [탭] 제목 [탭] 링크 [탭] 썸네일 [탭] 03:25:02 [탭] 아니요 [탭] 아니요" class="vod-bulk-paste" onpaste="handleVodBulkPaste(event, this)" style="width: 100%; padding: 4px 6px; font-size: 11px; background: #fff; border: 1px solid #cbd5e1; border-radius: 3px;">
            </div>

            <!-- 1. 날짜 / 2. 제목 -->
            <div class="vod-row-inline" style="display: flex; gap: 6px;">
                <input type="text" placeholder="1. 날짜 (예: 2026-08-07)" class="vod-date" value="${vod.date || ''}" oninput="updateSummaryTitle(this)" style="padding: 4px 6px; font-size: 12px; flex: 1;">
                <input type="text" placeholder="2. VOD 제목" class="vod-title" value="${vod.title || ''}" oninput="updateSummaryTitle(this)" style="padding: 4px 6px; font-size: 12px; flex: 2;">
            </div>

            <!-- 3. 링크 / 4. 썸네일 -->
            <div class="vod-row-inline" style="display: flex; gap: 6px;">
                <input type="text" placeholder="3. VOD 주소 (링크)" class="vod-link" value="${vod.link || ''}" style="padding: 4px 6px; font-size: 12px; flex: 1;">
                <input type="text" placeholder="4. 썸네일 주소" class="vod-thumbnail" value="${vod.thumbnail || ''}" style="padding: 4px 6px; font-size: 12px; flex: 1;">
            </div>

            <!-- 5. 시간 / 6. 구독여부 / 7. 성인인증여부 -->
            <div class="vod-row-inline" style="display: flex; gap: 6px; align-items: flex-end;">
                <div style="flex: 1;">
                    <label style="font-size: 10px; margin-bottom: 2px; display: block; color: #475569;">5. 시간 (예: 03:25:02)</label>
                    <input type="text" placeholder="시간" class="vod-duration" value="${vod.duration || ''}" style="padding: 4px 6px; font-size: 12px; width: 100%;">
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 10px; margin-bottom: 2px; display: block; color: #475569;">6. 구독여부</label>
                    <select class="vod-sub-plus" style="padding: 4px; font-size: 11px; width: 100%;">
                        <option value="N" ${vod.subPlus === 'N' || vod.subPlus === '아니요' ? 'selected' : ''}>아니요 (N)</option>
                        <option value="Y" ${vod.subPlus === 'Y' || vod.subPlus === '예' ? 'selected' : ''}>예 (Y)</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 10px; margin-bottom: 2px; display: block; color: #475569;">7. 성인인증여부</label>
                    <select class="vod-adult" style="padding: 4px; font-size: 11px; width: 100%;">
                        <option value="N" ${vod.adult === 'N' || vod.adult === '아니요' ? 'selected' : ''}>아니요 (N)</option>
                        <option value="Y" ${vod.adult === 'Y' || vod.adult === '예' ? 'selected' : ''}>예 (Y)</option>
                    </select>
                </div>
            </div>

            <!-- 추가 선택 정보 (컨텐츠 종류, 상세정보) -->
            <div class="vod-row-inline" style="display: flex; gap: 6px;">
                <input type="text" placeholder="컨텐츠 종류 (선택)" class="vod-category" value="${vod.category || ''}" style="padding: 4px 6px; font-size: 12px; flex: 1;">
            </div>
            
            <textarea placeholder="컨텐츠 상세정보 (description)" class="vod-description" style="height: 38px; padding: 4px 6px; font-size: 12px; resize: vertical;">${vod.description || ''}</textarea>
            
            <div style="display: flex; justify-content: flex-end; gap: 4px;">
                <button type="button" onclick="completeVodEdit(this)" style="background-color: #10b981; padding: 4px 10px; font-size: 11px; border: none; border-radius: 4px; color: #fff; cursor: pointer;">편집 완료</button>
                <button type="button" class="delete-item-btn" onclick="this.closest('.vod-row').remove(); updateVodToggleBtn();" style="background-color: #ef4444; padding: 4px 10px; font-size: 11px; border: none; border-radius: 4px; color: #fff; cursor: pointer; margin-bottom:0;">삭제</button>
            </div>
        </div>
    `;

    if (isNew) {
        container.insertBefore(row, container.firstChild);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        container.appendChild(row);
    }
    
    updateVodToggleBtn();
}

// 텍스트를 통째로 복사 붙여넣기 했을 때 지정 순서대로 자동 매핑해주는 함수
function handleVodBulkPaste(event, inputEl) {
    event.preventDefault();
    const pasteData = (event.clipboardData || window.clipboardData).getData('text');
    if (!pasteData) return;

    let parts = pasteData.split(/\t|,|\s{2,}/).map(item => item.trim()).filter(item => item !== "");
    if (parts.length < 3) {
        parts = pasteData.split('\t').map(item => item.trim());
    }

    const row = inputEl.closest('.vod-row');
    if (!row) return;

    // 순서: 1. 날짜, 2. 제목, 3. 링크, 4. 썸네일, 5. 시간, 6. 구독여부, 7. 성인인증여부
    if (parts[0]) row.querySelector('.vod-date').value = parts[0];
    if (parts[1]) row.querySelector('.vod-title').value = parts[1];
    if (parts[2]) row.querySelector('.vod-link').value = parts[2];
    if (parts[3]) row.querySelector('.vod-thumbnail').value = parts[3];
    if (parts[4]) row.querySelector('.vod-duration').value = parts[4];
    
    if (parts[5]) {
        const subSelect = row.querySelector('.vod-sub-plus');
        const val = parts[5].toUpperCase();
        if (val === 'Y' || val === '예' || val === '구독플러스') subSelect.value = 'Y';
        else subSelect.value = 'N';
    }
    
    if (parts[6]) {
        const adultSelect = row.querySelector('.vod-adult');
        const val = parts[6].toUpperCase();
        if (val === 'Y' || val === '예' || val === '성인인증') adultSelect.value = 'Y';
        else adultSelect.value = 'N';
    }

    updateSummaryTitle(inputEl);
    inputEl.value = ""; 
}

function toggleVodEdit(button) {
    const row = button.closest('.vod-row');
    const summaryView = row.querySelector('.vod-summary-view');
    const detailView = row.querySelector('.vod-detail-view');

    if (summaryView.style.display === 'none') {
        summaryView.style.display = 'flex';
        detailView.style.display = 'none';
    } else {
        summaryView.style.display = 'none';
        detailView.style.display = 'flex';
    }
}

function completeVodEdit(button) {
    const row = button.closest('.vod-row');
    const summaryView = row.querySelector('.vod-summary-view');
    const detailView = row.querySelector('.vod-detail-view');
    const container = row.parentNode;

    summaryView.style.display = 'flex';
    detailView.style.display = 'none';

    container.appendChild(row);
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    const toggleBtn = document.getElementById('vod-expand-toggle-btn');
    if (toggleBtn && toggleBtn.dataset.expanded === 'true') {
        row.style.display = '';
        row.classList.remove('vod-hidden-item');
    }
    updateVodToggleBtn();
}

function updateVodToggleBtn() {
    const container = document.getElementById('vodlist-rows-container');
    if (!container) return;

    let toggleBtnContainer = document.getElementById('vod-toggle-btn-container');
    const allRows = container.querySelectorAll('.vod-row');
    const totalRows = allRows.length;

    if (totalRows > 5) {
        if (!toggleBtnContainer) {
            toggleBtnContainer = document.createElement('div');
            toggleBtnContainer.id = 'vod-toggle-btn-container';
            toggleBtnContainer.style.cssText = "text-align: center; margin-top: 10px;";
            toggleBtnContainer.innerHTML = `
                <button type="button" id="vod-expand-toggle-btn" data-expanded="false" onclick="toggleVodListExpand()" style="background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; width: 100%;">
                    ▼ 전체 목록 펼치기 (${totalRows - 5}개 더보기)
                </button>
            `;
            container.insertAdjacentElement('afterend', toggleBtnContainer);
        } else {
            const btn = document.getElementById('vod-expand-toggle-btn');
            if (btn && btn.dataset.expanded !== 'true') {
                btn.textContent = `▼ 전체 목록 펼치기 (${totalRows - 5}개 더보기)`;
            }
        }
    } else {
        if (toggleBtnContainer) {
            toggleBtnContainer.remove();
        }
    }
}

function toggleVodListExpand() {
    const container = document.getElementById('vodlist-rows-container');
    const btn = document.getElementById('vod-expand-toggle-btn');
    const allRows = container.querySelectorAll('.vod-row');
    
    const isExpanded = btn.dataset.expanded === 'true';

    allRows.forEach((row, index) => {
        if (!isExpanded) {
            row.style.display = '';
            row.classList.remove('vod-hidden-item');
        } else {
            if (index >= 5) {
                row.style.display = 'none';
                row.classList.add('vod-hidden-item');
            }
        }
    });

    if (!isExpanded) {
        btn.dataset.expanded = 'true';
        btn.textContent = '▲ 접기';
    } else {
        btn.dataset.expanded = 'false';
        btn.textContent = `▼ 전체 목록 펼치기 (${allRows.length - 5}개 더보기)`;
    }
}

function updateSummaryTitle(input) {
    const row = input.closest('.vod-row');
    const dateVal = row.querySelector('.vod-date').value.trim();
    const titleVal = row.querySelector('.vod-title').value.trim();
    
    const summarySpan = row.querySelector('.vod-summary-view span:first-child');
    if (summarySpan) {
        summarySpan.innerHTML = `
            <span style="color: #0284c7; margin-right: 6px;">[${dateVal || '날짜 미지정'}]</span> 
            <span>${titleVal || '제목 없음'}</span>
        `;
    }
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
        
        const oldToggle = document.getElementById('vod-toggle-btn-container');
        if (oldToggle) oldToggle.remove();

        let vodArray = [];
        if (Array.isArray(data)) {
            vodArray = data;
        } else if (data && Array.isArray(data.vods)) {
            vodArray = data.vods;
        } else if (data && data.content && Array.isArray(data.content.vods)) {
            vodArray = data.content.vods;
        } else if (data && Array.isArray(data.notes)) {
            vodArray = data.notes;
        }

        if (vodArray.length > 0) {
            vodArray.forEach(item => addVodRow(item, false));
        } else {
            addVodRow({}, true);
        }

        statusEl.textContent = "데이터를 성공적으로 불러왔습니다.";
        statusEl.style.color = "#10b981";
    } catch (err) {
        statusEl.textContent = "데이터를 불러오지 못했습니다. (빈 양식 사용)";
        statusEl.style.color = "#ef4444";
        const container = document.getElementById('vodlist-rows-container');
        if (container.children.length === 0) addVodRow({}, true);
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
