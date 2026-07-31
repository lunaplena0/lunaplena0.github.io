    const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";
    const GITHUB_BASE_URL = "https://lunaplena0.github.io/";

    let songData = { notice: "", songs: [] };
    let profileData = { 
        name: "", image: "", catchphrase: "", details: [], 
        time: "", content: "", bio1: "", bio2: "" 
    };
    let linksData = []; // 배열 형태로 관리 (항목별 {title, url, target} 객체 배열)

    // 🔒 로그인 성공 시 동적으로 주입할 관리자 UI 전체 HTML 템플릿
    const adminHtmlTemplate = `
        <!-- 대시보드 메뉴 -->
        <div id="dashboard-section" class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #03045e;">🛠️ 관리 메뉴 선택</h3>
                <button onclick="location.reload()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">로그아웃</button>
            </div>
            <p style="color: #64748b; font-size: 14px;">수정할 항목을 선택해주세요.</p>
            
            <div class="menu-grid">
                <div class="menu-card" onclick="showPanel('intro')">
                    <h4>👤 자기소개 수정</h4>
                    <p>이름, 프로필 이미지, 정보 변경</p>
                </div>
                <div class="menu-card" onclick="showPanel('links')">
                    <h4>🔗 링크 수정</h4>
                    <p>외부 링크 관리</p>
                </div>
                <div class="menu-card" onclick="showPanel('songs')">
                    <h4>🎶 노래책 수정</h4>
                    <p>노래 공지, 곡 목록 추가/삭제/편집</p>
                </div>
            </div>
        </div>

        <!-- 자기소개 수정 패널 -->
        <div id="panel-intro" class="card" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #03045e;">👤 자기소개 수정</h3>
                <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
            </div>

            <label>활동 이름</label>
            <input type="text" id="p-name" placeholder="예: 바다비。">

            <label>프로필 이미지 주소 (아바타/로고)</label>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="p-image" placeholder="https://... 또는 아래에서 이미지 업로드" style="margin-bottom: 0; flex: 1;">
            </div>
            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <label style="font-size: 12px; color: #0284c7; margin-bottom: 5px;">🖼️ 새 프로필 이미지 업로드 (원본 형식 유지)</label>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <input type="file" id="profile-file-input" accept="image/gif, image/png, image/jpeg, image/webp" style="flex: 1; font-size: 13px; margin-bottom: 0; background: #fff;">
                    <button onclick="uploadProfileImage()" style="background-color: #0284c7; padding: 6px 12px; font-size: 12px;">업로드 후 주소 자동입력</button>
                </div>
                <div id="profile-upload-status" style="font-size: 11px; margin-top: 4px; color: #64748b;"></div>
            </div>

            <label>캐치프레이즈 (닉네임 하단에 파란색 글씨)</label>
            <textarea id="p-catchphrase" class="profile-textarea" placeholder="𝐏 𝐫 𝐨 𝐟 𝐢 𝐥 𝐞"></textarea>

            <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
                <h4 style="color: #0077b6; margin: 0;">상세 프로필 정보</h4>
                <button onclick="addDetailRow()" style="background-color: #10b981; padding: 4px 10px; font-size: 12px;">+ 항목 추가</button>
            </div>
            
            <div id="detail-rows-container"></div>

            <label style="margin-top: 20px;">방송시간</label>
            <input type="text" id="p-time" placeholder="평일 오후 4시 / 주말 오후 2시">

            <label>컨텐츠</label>
            <input type="text" id="p-content" placeholder="소통 & 노래 & 춤 & 기타연주 노래 & ASMR">

            <h4 style="color: #0077b6; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">하단 소개말 (메시지)</h4>
            <label style="font-size: 13px;">첫 번째 줄 (강조 문구)</label>
            <input type="text" id="p-bio1" placeholder="바다의 작은 용 , 잘못 만지면 아파요! ↜(⃔っ•̤ ༝ •̤c)⃕">
            
            <label style="font-size: 13px;">두 번째 줄 (대사/소개)</label>
            <textarea id="p-bio2" class="profile-textarea" placeholder="바다의 작은 용? 아니, 바다의 독가시!..."></textarea>

            <button onclick="saveProfile()" style="width: 100%; margin-top: 15px;">페이지에 자기소개 반영하기</button>
            <div id="intro-status" class="status-msg"></div>
        </div>

        <!-- 링크 수정 패널 -->
        <div id="panel-links" class="card" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #03045e;">🔗 링크 페이지 관리</h3>
                <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-bottom: 15px;">
                프로필 링크 페이지에 보여질 버튼들을 자유롭게 추가하고 관리하세요.
            </p>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="color: #0077b6; margin: 0;">링크 목록</h4>
            </div>

            <!-- 링크 목록이 표시되는 영역 -->
            <div id="links-rows-container" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px;"></div>

            <!-- 새 링크 추가 버튼을 목록 하단으로 이동 -->
            <button onclick="addLinkRow()" style="background-color: #10b981; width: 100%; padding: 10px; font-size: 14px; margin-bottom: 20px;">+ 새 링크 추가</button>

            <button onclick="saveLinks()" style="width: 100%; background-color: #0077b6; padding: 14px; font-size: 16px;">페이지에 링크 변경사항 반영하기</button>
            <div id="links-status" class="status-msg"></div>
        </div>
        
        <!-- 노래책 수정 패널 -->
        <div id="panel-songs" class="card" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #03045e;">📝 노래책 내용 편집</h3>
                <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
            </div>

            <div style="margin-bottom: 25px;">
                <label for="notice-input">📢 공지사항 내용</label>
                <textarea id="notice-input" placeholder="공지사항을 입력하세요..."></textarea>
            </div>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 25px;">

            <div class="batch-container">
                <div class="batch-header" onclick="toggleBatchBox()">
                    <span>📊 구글 시트(엑셀) 데이터 한 번에 가져오기 (클릭하여 열기/닫기)</span>
                    <span id="batch-toggle-icon">▼</span>
                </div>
                <div class="batch-body" id="batch-body-content">
                    <p style="font-size: 13px; color: #166534; margin-top: 0; margin-bottom: 10px;">
                        구글 시트에서 행들을 복사(Ctrl+C)한 뒤 아래 칸에 붙여넣고 버튼을 누르세요.<br>
                        (순서: <b>제목 / 가수 / 장르 / 제한 / 기타</b>)
                    </p>
                    <textarea id="batch-input" placeholder="여기에 구글 시트 복사 내용을 붙여넣으세요..." style="height: 80px; background: #fff;"></textarea>
                    <button onclick="importBatchSongs()" style="background-color: #16a34a; padding: 8px 16px; font-size: 13px;">붙여넣은 내용으로 목록에 추가하기</button>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                <label style="margin: 0;">🎶 노래 목록 (<span id="song-count-badge">0</span>곡)</label>
                <div style="display: flex; gap: 10px; flex: 1; max-width: 350px;">
                    <input type="text" id="search-input" placeholder="🔍 제목, 가수, 장르 검색..." oninput="renderTable()" style="margin-bottom: 0; padding: 8px 12px;">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="downloadCsvFile()" style="background-color: #059669; padding: 8px 12px; font-size: 13px;">📥 시트 파일로 받기(CSV)</button>
                    <button onclick="openEditModal(-1)" style="background-color: #10b981; padding: 8px 12px; font-size: 13px;">+ 새 노래 추가하기</button>
                </div>
            </div>

            <div class="song-table-container">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 8%;">번호</th>
                            <th style="width: 27%;">제목</th>
                            <th style="width: 20%;">가수</th>
                            <th style="width: 15%;">장르</th>
                            <th style="width: 15%;">제한/기타</th>
                            <th style="width: 15%; text-align: center;">관리</th>
                        </tr>
                    </thead>
                    <tbody id="song-table-body"></tbody>
                </table>
            </div>

            <button onclick="saveSonglist()" style="width: 100%; margin-top: 20px; background-color: #0077b6; padding: 14px; font-size: 16px;">페이지에 변경사항 반영하기</button>
            <div id="status" class="status-msg"></div>
        </div>

        <!-- 모달 -->
        <div id="edit-modal">
            <div class="modal-content">
                <h3 id="modal-title" style="margin-top: 0; color: #03045e;">곡 정보 수정</h3>
                <input type="hidden" id="edit-index">
                <label style="font-size: 13px;">노래 제목</label>
                <input type="text" id="modal-title-input" placeholder="제목">
                <label style="font-size: 13px;">가수</label>
                <input type="text" id="modal-artist-input" placeholder="가수">
                <label style="font-size: 13px;">장르</label>
                <input type="text" id="modal-genre-input" placeholder="장르">
                <label style="font-size: 13px;">제한 / 조건</label>
                <input type="text" id="modal-limit-input" placeholder="조건">
                <label style="font-size: 13px;">기타 정보</label>
                <input type="text" id="modal-etc-input" placeholder="특이사항">
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="closeEditModal()" style="background-color: #64748b; flex: 1;">취소</button>
                    <button onclick="saveModalSong()" style="background-color: #0077b6; flex: 1;">저장</button>
                </div>
            </div>
        </div>
    `;

    function showDashboard() {
        document.getElementById("dashboard-section").style.display = "block";
        document.getElementById("panel-intro").style.display = "none";
        document.getElementById("panel-links").style.display = "none";
        document.getElementById("panel-songs").style.display = "none";
    }

    function showPanel(type) {
        document.getElementById("dashboard-section").style.display = "none";
        document.getElementById("panel-intro").style.display = "none";
        document.getElementById("panel-links").style.display = "none";
        document.getElementById("panel-songs").style.display = "none";

        if (type === 'intro') {
            document.getElementById("panel-intro").style.display = "block";
            document.getElementById("p-name").value = profileData.name || "";
            document.getElementById("p-image").value = profileData.image || "";
            document.getElementById("p-catchphrase").value = profileData.catchphrase || "";
            document.getElementById("p-time").value = profileData.time || "";
            document.getElementById("p-content").value = profileData.content || "";
            document.getElementById("p-bio1").value = profileData.bio1 || "";
            document.getElementById("p-bio2").value = profileData.bio2 || "";

            const container = document.getElementById("detail-rows-container");
            container.innerHTML = "";
            let detailsList = profileData.details;
            if (detailsList && !Array.isArray(detailsList)) {
                detailsList = Object.entries(detailsList).map(([k, v]) => ({ key: k, value: v }));
            }
            if (!detailsList || detailsList.length === 0) {
                detailsList = [
                    { key: "나이", value: "20살" },
                    { key: "생일", value: "1월 9일" },
                    { key: "성별", value: "여자" },
                    { key: "인간키", value: "152cm" },
                    { key: "종족", value: "미니블루드래곤(갯민숭달팽이) 💙" },
                    { key: "데뷔일", value: "2026년 4월 20일" }
                ];
            }
            detailsList.forEach(item => {
                addDetailRow(item.key, item.value);
            });

        } else if (type === 'links') {
            // 🔗 새로 교체하신 링크 동적 행 생성 코드
            document.getElementById("panel-links").style.display = "block";
            const container = document.getElementById("links-rows-container");
            container.innerHTML = "";

            let list = Array.isArray(linksData) ? linksData : [];
            if (list.length === 0 && !Array.isArray(linksData)) {
                if (linksData.broadcast) list.push({ title: "방송국", url: linksData.broadcast, target: "_blank" });
                if (linksData.youtube) list.push({ title: "유튜브", url: linksData.youtube, target: "_blank" });
            }

            if (list.length === 0) {
                list = [
                    { title: "🎤 노래책", url: "https://badabi.pages.dev/songlist", target: "_blank" },
                    { title: "📁 팬아카이브", url: "https://badabi.pages.dev/", target: "_blank" }
                ];
            }

            list.forEach(item => {
                addLinkRow(item.title, item.url, item.target);
            });
        } 
        else if (type === 'songs') {
            // 🎶 기존에 유지하시는 노래책 패널 코드
            document.getElementById("panel-songs").style.display = "block";
            document.getElementById("notice-input").value = songData.notice || "";
            renderTable();
        }
    }

    function addLinkRow(title = "", url = "", target = "_blank") {
        const container = document.getElementById("links-rows-container");
        if (!container) return;
        const row = document.createElement("div");
        row.className = "link-item-row";
        row.style.cssText = "background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 6px;";
        
        row.innerHTML = `
            <div style="display: flex; gap: 6px; align-items: center;">
                <input type="text" class="link-title" placeholder="버튼 이름 (예: 🎤 노래책)" value="${escapeHtml(title)}" style="flex: 1; height: 38px; padding: 0 12px; margin-bottom: 0; box-sizing: border-box;">
                <select class="link-target" style="height: 38px; padding: 0 12px; border: 1px solid rgba(0, 119, 190, 0.25); border-radius: 8px; background: #fff; font-weight: 600; color: #0077b6; margin-bottom: 0; box-sizing: border-box;">
                    <option value="_blank" ${target === '_blank' ? 'selected' : ''}>새 창</option>
                    <option value="_self" ${target === '_self' ? 'selected' : ''}>현재 창</option>
                </select>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
                <input type="text" class="link-url" placeholder="주소 (https://...)" value="${escapeHtml(url)}" style="flex: 1; height: 38px; padding: 0 12px; margin-bottom: 0; box-sizing: border-box;">
                <button onclick="moveRow(this, 'up')" style="background-color: #64748b; height: 38px; padding: 0 12px; font-size: 13px; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #fff; cursor: pointer;" title="위로">▲</button>
                <button onclick="moveRow(this, 'down')" style="background-color: #64748b; height: 38px; padding: 0 12px; font-size: 13px; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #fff; cursor: pointer;" title="아래로">▼</button>
                <button onclick="this.closest('.link-item-row').remove()" style="background-color: #ef4444; height: 38px; padding: 0 12px; font-size: 13px; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #fff; cursor: pointer;" title="삭제">삭제</button>
            </div>
        `;
        container.appendChild(row);
    }
    function moveRow(button, direction) {
            const row = button.closest('.detail-item-row') || button.closest('.link-item-row');
            if (!row) return;
    
            if (direction === 'up') {
                const prevRow = row.previousElementSibling;
                if (prevRow) {
                    row.parentNode.insertBefore(row, prevRow);
                }
            } else if (direction === 'down') {
                const nextRow = row.nextElementSibling;
                if (nextRow) {
                    row.parentNode.insertBefore(nextRow, row);
                }
            }
        }

    function saveLinks() {
        const rows = document.querySelectorAll("#links-rows-container .link-item-row");
        let newLinksArr = [];
        rows.forEach(row => {
            const t = row.querySelector(".link-title").value.trim();
            const u = row.querySelector(".link-url").value.trim();
            const tg = row.querySelector(".link-target").value;
            if (t || u) {
                newLinksArr.push({ title: t, url: u, target: tg });
            }
        });
        linksData = newLinksArr;
        saveDataToWorker("links", linksData, "links-status");
    }
    
    function addDetailRow(key = "", val = "") {
        const container = document.getElementById("detail-rows-container");
        if (!container) return;
        const row = document.createElement("div");
        row.className = "detail-item-row";
        row.style.cssText = "display: flex; gap: 6px; align-items: center; margin-bottom: 8px;";
        
        row.innerHTML = `
            <input type="text" class="detail-key" placeholder="항목 이름 (예: 나이)" value="${escapeHtml(key)}" style="flex: 1; height: 38px; padding: 0 12px; margin-bottom: 0; box-sizing: border-box;">
            <input type="text" class="detail-val" placeholder="내용 (예: 20살)" value="${escapeHtml(val)}" style="flex: 2; height: 38px; padding: 0 12px; margin-bottom: 0; box-sizing: border-box;">
            <button onclick="moveRow(this, 'up')" style="background-color: #64748b; height: 38px; padding: 0 12px; font-size: 13px; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #fff; cursor: pointer;" title="위로">▲</button>
            <button onclick="moveRow(this, 'down')" style="background-color: #64748b; height: 38px; padding: 0 12px; font-size: 13px; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #fff; cursor: pointer;" title="아래로">▼</button>
            <button onclick="this.closest('.detail-item-row').remove()" style="background-color: #ef4444; height: 38px; padding: 0 12px; font-size: 13px; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #fff; cursor: pointer;" title="삭제">삭제</button>
        `;
        container.appendChild(row);
    }

    function toggleBatchBox() {
        const body = document.getElementById("batch-body-content");
        const icon = document.getElementById("batch-toggle-icon");
        if (!body) return;
        if (body.style.display === "block") {
            body.style.display = "none";
            icon.textContent = "▼";
        } else {
            body.style.display = "block";
            icon.textContent = "▲";
        }
    }

    async function verifyAndLoad() {
    const password = document.getElementById("admin-password").value;
    const statusEl = document.getElementById("login-status");
    if (!password) { statusEl.style.color = "#ef4444"; statusEl.textContent = "비밀번호를 입력해주세요."; return; }

    statusEl.style.color = "#0077b6";
    statusEl.textContent = "비밀번호 확인 및 데이터 로드 중...";

    try {
        // 🔒 로그인 요청 시 서버(Worker)가 fileType이나 action을 요구하는 방식에 맞춤
        const authResponse = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                password: password, 
                action: "verify",
                fileType: "verify" // 만약 Worker가 fileType을 필수로 체크한다면 이 줄을 추가해줍니다.
            })
        });

        if (!authResponse.ok) {
            const errResult = await authResponse.json();
            throw new Error(errResult.error || "비밀번호가 틀렸습니다.");
        }

        // 이후 데이터 로드 코드 동일...
        const timestamp = new Date().getTime();
        const [songRes, profileRes, linksRes] = await Promise.all([
            fetch(WORKER_URL + "?type=songlist&t=" + timestamp),
            fetch(WORKER_URL + "?type=profile&t=" + timestamp),
            fetch(WORKER_URL + "?type=links&t=" + timestamp)
        ]);

        if (songRes.ok) {
            const data = await songRes.json();
            songData = { notice: data.notice || "", songs: Array.isArray(data.songs) ? data.songs : [] };
        }
        if (profileRes.ok) {
            const data = await profileRes.json() || {};
            let details = data.details || [];
            if (!Array.isArray(details) && typeof details === 'object') {
                details = Object.entries(details).map(([k, v]) => ({ key: k, value: v }));
            }
            profileData = {
                name: data.name || "",
                image: data.image || "",
                catchphrase: data.catchphrase || "",
                details: details,
                time: data.time || "",
                content: data.content || "",
                bio1: data.bio1 || "",
                bio2: data.bio2 || ""
            };
        }
        if (linksRes.ok) {
            const data = await linksRes.json();
            if (Array.isArray(data)) {
                linksData = data;
            } else if (data && typeof data === 'object') {
                let list = [];
                if (data.broadcast) list.push({ title: "방송국", url: data.broadcast, target: "_blank" });
                if (data.youtube) list.push({ title: "유튜브", url: data.youtube, target: "_blank" });
                linksData = list;
            } else {
                linksData = [];
            }
        }

        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").innerHTML = adminHtmlTemplate;
        showDashboard();

    } catch (error) {
        statusEl.style.color = "#ef4444";
        statusEl.textContent = "로그인 실패: " + error.message;
    }
}

    async function saveDataToWorker(fileType, contentObj, statusElementId) {
        const password = document.getElementById("admin-password").value;
        const statusEl = document.getElementById(statusElementId);
        statusEl.style.color = "#0077b6";
        statusEl.textContent = "페이지에 반영 중...";

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password: password,
                    fileType: fileType,
                    content: contentObj
                })
            });
            const result = await response.json();
            if (response.ok) {
                statusEl.style.color = "#10b981";
                statusEl.textContent = "성공적으로 업데이트되었습니다! (1~2분 뒤 반영)";
            } else {
                throw new Error(result.error || "비밀번호 오류");
            }
        } catch (error) {
            statusEl.style.color = "#ef4444";
            statusEl.textContent = "실패: " + error.message;
        }
    }

    async function getOriginalFileBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const base64String = event.target.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    }

    async function uploadProfileImage() {
        const password = document.getElementById("admin-password").value;
        const fileInput = document.getElementById("profile-file-input");
        const statusDiv = document.getElementById("profile-upload-status");

        if (!fileInput.files || fileInput.files.length === 0) { alert("이미지를 선택해주세요."); return; }

        const file = fileInput.files[0];
        statusDiv.style.color = "#0077b6";
        statusDiv.textContent = "프로필 이미지 업로드 중...";

        try {
            const base64Data = await getOriginalFileBase64(file);

            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    password: password, 
                    action: "upload_image", 
                    filename: file.name, 
                    filedata: base64Data 
                })
            });
            const result = await response.json();
            if (response.ok && result.url) {
                statusDiv.style.color = "#10b981";
                statusDiv.textContent = "업로드 성공! 주소가 자동 입력되었습니다.";
                document.getElementById("p-image").value = result.url;
                fileInput.value = "";
            } else {
                throw new Error(result.error || "업로드 실패");
            }
        } catch (err) {
            statusDiv.style.color = "#ef4444";
            statusDiv.textContent = "오류: " + err.message;
        }
    }

    function saveProfile() {
        profileData.name = document.getElementById("p-name").value.trim();
        profileData.image = document.getElementById("p-image").value.trim();
        profileData.catchphrase = document.getElementById("p-catchphrase").value.trim();
        
        const rows = document.querySelectorAll("#detail-rows-container .detail-item-row");
        let detailsArr = [];
        rows.forEach(row => {
            const k = row.querySelector(".detail-key").value.trim();
            const v = row.querySelector(".detail-val").value.trim();
            if (k) {
                detailsArr.push({ key: k, value: v });
            }
        });
        profileData.details = detailsArr;

        profileData.time = document.getElementById("p-time").value.trim();
        profileData.content = document.getElementById("p-content").value.trim();
        profileData.bio1 = document.getElementById("p-bio1").value.trim();
        profileData.bio2 = document.getElementById("p-bio2").value.trim();

        saveDataToWorker("profile", profileData, "intro-status");
    }
    function saveSonglist() {
        songData.notice = document.getElementById("notice-input").value;
        saveDataToWorker("songlist", songData, "status");
    }

    function renderTable() {
        if (!Array.isArray(songData.songs)) songData.songs = [];
        const badge = document.getElementById("song-count-badge");
        if (badge) badge.textContent = songData.songs.length;
        const searchInput = document.getElementById("search-input");
        const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const tbody = document.getElementById("song-table-body");
        if (!tbody) return;
        tbody.innerHTML = "";

        songData.songs.forEach((song, originalIndex) => {
            const title = (song.title || "").toLowerCase();
            const artist = (song.artist || "").toLowerCase();
            const genre = (song.genre || "").toLowerCase();

            if (keyword && !title.includes(keyword) && !artist.includes(keyword) && !genre.includes(keyword)) return;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="color: #64748b; font-weight: bold;">#${originalIndex + 1}</td>
                <td style="font-weight: 600; color: #0f172a;">${escapeHtml(song.title || '제목 없음')}</td>
                <td>${escapeHtml(song.artist || '-')}</td>
                <td>${escapeHtml(song.genre || '-')}</td>
                <td style="font-size: 12px; color: #475569;">${escapeHtml(song.limit || song.etc ? (song.limit + ' ' + song.etc).trim() : '-')}</td>
                <td style="text-align: center;">
                    <button class="edit-btn" onclick="openEditModal(${originalIndex})">수정</button>
                    <button class="delete-btn" onclick="deleteSong(${originalIndex})">삭제</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function downloadCsvFile() {
        if (!Array.isArray(songData.songs) || songData.songs.length === 0) { alert("내보낼 데이터가 없습니다."); return; }
        let csvRows = ['"\uFEFF제목","가수","장르","제한","기타"'];
        songData.songs.forEach(song => {
            csvRows.push(`"${(song.title||"").replace(/"/g,'""')}","${(song.artist||"").replace(/"/g,'""')}","${(song.genre||"").replace(/"/g,'""')}","${(song.limit||"").replace(/"/g,'""')}","${(song.etc||"").replace(/"/g,'""')}"`);
        });
        const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `badabi_songlist_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    function openEditModal(index) {
        document.getElementById("edit-index").value = index;
        if (index === -1) {
            document.getElementById("modal-title").textContent = "새 노래 추가";
            ["modal-title-input","modal-artist-input","modal-genre-input","modal-limit-input","modal-etc-input"].forEach(id => document.getElementById(id).value = "");
        } else {
            document.getElementById("modal-title").textContent = `#${index + 1} 곡 정보 수정`;
            const song = songData.songs[index];
            document.getElementById("modal-title-input").value = song.title || "";
            document.getElementById("modal-artist-input").value = song.artist || "";
            document.getElementById("modal-genre-input").value = song.genre || "";
            document.getElementById("modal-limit-input").value = song.limit || "";
            document.getElementById("modal-etc-input").value = song.etc || "";
        }
        document.getElementById("edit-modal").style.display = "flex";
    }

    function closeEditModal() {
        document.getElementById("edit-modal").style.display = "none";
    }

    function saveModalSong() {
        const index = parseInt(document.getElementById("edit-index").value);
        const newSong = {
            title: document.getElementById("modal-title-input").value.trim(),
            artist: document.getElementById("modal-artist-input").value.trim(),
            genre: document.getElementById("modal-genre-input").value.trim(),
            limit: document.getElementById("modal-limit-input").value.trim(),
            etc: document.getElementById("modal-etc-input").value.trim()
        };

        if (!newSong.title) { alert("노래 제목을 입력해주세요."); return; }

        if (index === -1) {
            songData.songs.push(newSong);
        } else {
            songData.songs[index] = newSong;
        }

        closeEditModal();
        renderTable();
    }

    function deleteSong(index) {
        if (confirm(`정말 #${index + 1} 곡을 삭제하시겠습니까?`)) {
            songData.songs.splice(index, 1);
            renderTable();
        }
    }

    function importBatchSongs() {
        const text = document.getElementById("batch-input").value.trim();
        if (!text) { alert("붙여넣은 내용이 없습니다."); return; }

        const lines = text.split("\n");
        let addedCount = 0;

        lines.forEach(line => {
            const cols = line.split("\t");
            if (cols.length >= 1 && cols[0].trim()) {
                songData.songs.push({
                    title: cols[0] ? cols[0].trim() : "",
                    artist: cols[1] ? cols[1].trim() : "",
                    genre: cols[2] ? cols[2].trim() : "",
                    limit: cols[3] ? cols[3].trim() : "",
                    etc: cols[4] ? cols[4].trim() : ""
                });
                addedCount++;
            }
        });

        if (addedCount > 0) {
            alert(`${addedCount}곡이 성공적으로 추가되었습니다! (하단의 최종 반영 버튼을 눌러주세요)`);
            document.getElementById("batch-input").value = "";
            renderTable();
        } else {
            alert("가져올 수 있는 유효한 데이터가 없습니다. 구글 시트에서 올바르게 복사했는지 확인해주세요.");
        }
    }

    function escapeHtml(str) {
        return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
