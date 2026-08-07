// VOD 항목을 화면에 추가하는 함수 (가독성과 시인성을 대폭 높인 상세 폼 디자인)
function addVodRow(vod = {}, isNew = false) {
    const container = document.getElementById('vodlist-rows-container');
    const row = document.createElement('div');
    row.className = 'vod-row';
    row.style.cssText = "margin-bottom: 8px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden;";
    
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
        <!-- [요약 뷰] 날짜와 제목만 깔끔하게 표시 -->
        <div class="vod-summary-view" style="display: ${(hasData && !isNew) ? 'flex' : 'none'}; justify-content: space-between; align-items: center; padding: 10px 14px; background-color: #fff;">
            <div style="font-size: 13px; font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
                <span style="color: #0284c7; font-weight: 700; margin-right: 8px;">[${vod.date || '날짜 미지정'}]</span> 
                <span class="summary-title-text">${vod.title || '제목 없음'}</span>
            </div>
            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                <button type="button" onclick="toggleVodEdit(this)" style="background-color: #0284c7; padding: 4px 10px; font-size: 11px; border: none; border-radius: 4px; color: #fff; font-weight: 600; cursor: pointer;">수정</button>
                <button type="button" class="delete-item-btn" onclick="this.closest('.vod-row').remove(); updateVodToggleBtn();" style="background-color: #ef4444; padding: 4px 10px; font-size: 11px; border: none; border-radius: 4px; color: #fff; font-weight: 600; cursor: pointer; margin-bottom:0;">삭제</button>
            </div>
        </div>

        <!-- [상세 편집 뷰] 눈에 잘 띄고 구분하기 쉬운 카드 형태 디자인 -->
        <div class="vod-detail-view" style="display: ${(hasData && !isNew) ? 'none' : 'flex'}; flex-direction: column; gap: 10px; padding: 14px; background-color: #f8fafc;">
            
            <!-- 상단 헤더 타이틀 -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 800; color: #0f172a;">📝 VOD 정보 입력/수정</span>
                <span style="font-size: 11px; color: #0284c7; font-weight: 600;">상단 박스에 탭 구분 텍스트 한 줄 붙여넣기 가능</span>
            </div>

            <!-- 한 줄 일괄 붙여넣기 박스 -->
            <div style="background: #eff6ff; padding: 8px; border-radius: 6px; border: 1px dashed #93c5fd;">
                <label style="font-size: 10px; font-weight: 700; color: #1d4ed8; display: block; margin-bottom: 3px;">✨ 일괄 복사·붙여넣기 영역 (날짜 ~ 성인인증)</label>
                <input type="text" placeholder="여기에 복사한 데이터를 붙여넣으세요 (날짜 [탭] 제목 [탭] 링크 ...)" class="vod-bulk-paste" onpaste="handleVodBulkPaste(event, this)" style="width: 100%; padding: 6px 8px; font-size: 12px; background: #fff; border: 1px solid #bfdbfe; border-radius: 4px; color: #1e3a8a;">
            </div>

            <!-- 개별 입력 필드 그룹들 -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
                
                <!-- 1. 날짜 & 2. 제목 -->
                <div style="display: flex; gap: 8px;">
                    <div style="flex: 1;">
                        <label style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 3px;">1. 날짜</label>
                        <input type="text" placeholder="2026-08-07" class="vod-date" value="${vod.date || ''}" oninput="updateSummaryTitle(this)" style="width: 100%; padding: 6px 8px; font-size: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;">
                    </div>
                    <div style="flex: 2.5;">
                        <label style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 3px;">2. VOD 제목</label>
                        <input type="text" placeholder="제목을 입력하세요" class="vod-title" value="${vod.title || ''}" oninput="updateSummaryTitle(this)" style="width: 100%; padding: 6px 8px; font-size: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;">
                    </div>
                </div>

                <!-- 3. 링크 & 4. 썸네일 -->
                <div style="display: flex; gap: 8px;">
                    <div style="flex: 1;">
                        <label style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 3px;">3. VOD 주소 (링크)</label>
                        <input type="text" placeholder="https://vod.sooplive.com/..." class="vod-link" value="${vod.link || ''}" style="width: 100%; padding: 6px 8px; font-size: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 3px;">4. 썸네일 주소</label>
                        <input type="text" placeholder="https://videoimg..." class="vod-thumbnail" value="${vod.thumbnail || ''}" style="width: 100%; padding: 6px 8px; font-size: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;">
                    </div>
                </div>

                <!-- 5. 시간, 6. 구독여부, 7. 성인인증여부 -->
                <div style="display: flex; gap: 8px;">
                    <div style="flex: 1.2;">
                        <label style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 3px;">5. 시간</label>
                        <input type="text" placeholder="03:25:02" class="vod-duration" value="${vod.duration || ''}" style="width: 100%; padding: 6px 8px; font-size: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 3px;">6. 구독여부</label>
                        <select class="vod-sub-plus" style="width: 100%; padding: 6px; font-size: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;">
                            <option value="N" ${vod.subPlus === 'N' || vod.subPlus === '아니요' ? 'selected' : ''}>아니요 (N)</option>
                            <option value="Y" ${vod.subPlus === 'Y' || vod.subPlus === '예' ? 'selected' : ''}>예 (Y)</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 3px;">7. 성인인증여부</label>
                        <select class="vod-adult" style="width: 100%; padding: 6px; font-size: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;">
                            <option value="N" ${vod.adult === 'N' || vod.adult === '아니요' ? 'selected' : ''}>아니요 (N)</option>
                            <option value="Y" ${vod.adult === 'Y' || vod.adult === '예' ? 'selected' : ''}>예 (Y)</option>
                        </select>
                    </div>
                </div>

                <!-- 추가 정보 (컨텐츠 종류, 상세정보) -->
                <div style="display: flex; gap: 8px;">
                    <div style="flex: 1;">
                        <label style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 3px;">컨텐츠 종류 (선택)</label>
                        <input type="text" placeholder="예: 소통, 노래" class="vod-category" value="${vod.category || ''}" style="width: 100%; padding: 6px 8px; font-size: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;">
                    </div>
                </div>

                <div>
                    <label style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 3px;">컨텐츠 상세정보 (description)</label>
                    <textarea placeholder="상세 내용을 입력하세요" class="vod-description" style="width: 100%; height: 45px; padding: 6px 8px; font-size: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; resize: vertical;">${vod.description || ''}</textarea>
                </div>

            </div>
            
            <!-- 하단 완료/삭제 버튼 -->
            <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 4px;">
                <button type="button" onclick="completeVodEdit(this)" style="background-color: #10b981; padding: 6px 14px; font-size: 12px; border: none; border-radius: 4px; color: #fff; font-weight: 700; cursor: pointer;">✓ 편집 완료 (접기)</button>
                <button type="button" class="delete-item-btn" onclick="this.closest('.vod-row').remove(); updateVodToggleBtn();" style="background-color: #ef4444; padding: 6px 12px; font-size: 12px; border: none; border-radius: 4px; color: #fff; font-weight: 700; cursor: pointer; margin-bottom:0;">삭제</button>
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
            <span style="color: #0284c7; font-weight: 700; margin-right: 8px;">[${dateVal || '날짜 미지정'}]</span> 
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
