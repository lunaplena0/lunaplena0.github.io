const WORKER_URL = "https://badabi-api.dalkkumli054.workers.dev/";
const GITHUB_BASE_URL = "https://lunaplena0.github.io/";

let songData = { notice: "", songs: [] };
let profileData = { 
    name: "", image: "", catchphrase: "", details: [], 
    time: "", content: "", bio1: "", bio2: "" 
};
let linksData = []; 

let mainpageData = {
    navBgColor: "rgba(3, 4, 94, 0.9)",
    logoText: "BABABI FAN ARCHIVE",
    mainContent: "", 
    menuItems: []
};

let fansongStatsData = { unregisteredSongs: [], registeredSongs: [], vodSources: [] };

// 📌 escapeHtml 함수
function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

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
            <div class="menu-card" onclick="showPanel('mainpage')">
                <h4>🏠 메인페이지 수정</h4>
                <p>메인 화면 설정 및 공통 구성 변경</p>
            </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0 20px 0;">

        <div class="menu-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="menu-card" onclick="showPanel('guide')" style="cursor: pointer;">
                <h4>📌 설정 가이드</h4>
                <p>관리 페이지 사용 방법 안내</p>
            </div>
            <div class="menu-card" onclick="downloadAllBackupData()" style="cursor: pointer; background: #f0fdf4; border-color: #86efac;">
                <h4 style="color: #16a34a;">💾 데이터 백업 다운로드</h4>
                <p>모든 설정 파일(JSON) 백업받기</p>
            </div>
            <div class="menu-card" style="cursor: default; opacity: 0.7;">
                <h4>📌 임시 메뉴 3</h4>
                <p>추후 확장 예정인 기능입니다</p>
            </div>
        </div>
    </div>

    <!-- 설정 가이드 패널 -->
    <div id="panel-guide" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">📖 설정 가이드</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; color: #1e293b; line-height: 1.6;">
            <h4 style="color: #0077b6; margin-top: 0;">페이지를 게시글에 적용하는 방법입니다 </br> 
            [08.20] 현재 숲 게시글 iframe패치로 게시글에 화면을 보여주는 방법이 막혔습니다. </br>
            https://badabi.pages.dev/필요한 주소 에 맞게 사용해주세요 </br>
            (예시)https://badabi.pages.dev/songlist, https://badabi.pages.dev/mainpages
            </h4>
            
            <div style="margin: 20px 0; display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px;">
                <span style="font-weight: 600;">1-1. 메인페이지로 시작하는 경우</span>
                <button onclick="copyGuideCode('mainpage')" style="background-color: #10b981; padding: 8px 14px; font-size: 13px;">클릭시 복사</button>
            </div>
            
            <div style="margin: 20px 0; display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px;">
                <span style="font-weight: 600;">1-2. 노래책으로 시작 경우</span>
                <button onclick="copyGuideCode('songlist')" style="background-color: #10b981; padding: 8px 14px; font-size: 13px;">클릭시 복사</button>
            </div>
            
            <p style="font-size: 14px; border-top: 1px solid #cbd5e1; padding-top: 15px; margin-top: 20px;">
                2. 각각 원하는 것을 클릭하여 복사 후,<br>
                <b>게시글 &gt; 오른쪽에 있는 '기본'을 'HTML'로 변경</b> 후 입력되어 있는 글을 지우고 복사한 데이터를 넣은 후 게시해주세요.
            </p>
        </div>
    </div>

    <!-- 메인페이지 수정 패널 -->
    <div id="panel-mainpage" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">🏠 메인페이지 수정</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>

        <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
            <div style="flex: 1.5; min-width: 300px;">
                <label>네비게이션 배경 색상</label>
                <input type="text" id="mp-nav-bgcolor" placeholder="예: rgba(3, 4, 94, 0.9)">

                <label>로고 텍스트</label>
                <input type="text" id="mp-logo-text" placeholder="예: BABABI FAN ARCHIVE">

                <label>메인페이지 첫 화면 본문/HTML 설정</label>
                <textarea id="mp-main-content" placeholder="메인페이지 상단 본문에 노출할 텍스트나 HTML을 입력하세요" style="height: 120px; resize: vertical;"></textarea>

                <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
                    <h4 style="color: #0077b6; margin: 0;">네비게이션 메뉴 목록</h4>
                    <button type="button" onclick="addMainPageMenuRow()" style="background-color: #10b981; padding: 4px 10px; font-size: 12px;">+ 메뉴 추가</button>
                </div>
                
                <div id="mp-menu-rows-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;"></div>
            </div>

            <div style="flex: 1; min-width: 250px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    <h4 style="margin: 0; color: #1e293b; font-size: 15px;">페이지 관련 공지</h4>
                    <span style="font-size: 12px; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; font-weight: 500;">Read-Only</span>
                </div>
                <p style="font-size: 12px; color: #475569; margin-top: 0; margin-bottom: 12px; line-height: 1.4;">
                    페이지 관련 공지(읽기 전용)
                </p>
                <div id="mp-memo-notice-box" style="width: 100%; height: 320px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-size: 13px; color: #0f172a; overflow-y: auto; white-space: pre-wrap; box-sizing: border-box; line-height: 1.5; text-align: center;">
현재 등록된 URI 목록\n프로필 : profile.html\n주소모음 : link.html\n노래책 : songlist.html
</div>
            </div>
        </div>

        <button onclick="saveMainPageSettings()" style="width: 100%; margin-top: 25px; background-color: #0077b6; padding: 14px; font-size: 16px;">메인페이지 설정 반영하기</button>
        <div id="mainpage-status" class="status-msg"></div>
    </div>

    <!-- 자기소개 수정 패널 -->
    <div id="panel-intro" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">👤 자기소개 수정</h3>
            <button onclick="showDashboard()" style="background-color: #64748b; padding: 6px 12px; font-size: 13px;">← 메뉴 목록으로</button>
        </div>

        <label>활동 이름</label>
        <input type="text" id="p-name" placeholder="예: 바다비。">

        <label>프로필 이미지 (업로드)</label>
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
            <input type="file" id="p-image-file" accept="image/*" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; margin-bottom: 0;">
            <button type="button" onclick="uploadProfileImage()" style="background-color: #0284c7; padding: 10px 16px; font-size: 13px; white-space: nowrap; margin-bottom: 0;">업로드</button>
        </div>
        <div id="image-status" style="font-size: 13px; margin-bottom: 12px; font-weight: 500; min-height: 18px;"></div>
         
        <input type="text" id="p-image" placeholder="업로드된 이미지 주소가 여기에 자동으로 입력됩니다" readonly style="background: #f1f5f9; color: #475569; font-size: 13px;">

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

        <div id="links-rows-container" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px;"></div>

        <button onclick="addLinkRow()" style="background-color: #10b981; width: 100%; padding: 10px; font-size: 14px; margin-bottom: 20px;">+ 새 링크 추가</button>

        <button onclick="saveLinks()" style="width: 100%; background-color: #0077b6; padding: 14px; font-size: 16px;">페이지에 링크 변경사항 반영하기</button>
        <div id="links-status" class="status-msg"></div>
    </div>
     
    <!-- 노래책 수정 패널 -->
    <div id="panel-songs" class="card" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #03045e;">📝 노래책 내용 편집 (현재 관련 페이지 대대적인 수정중입니다)</h3>
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
                <button onclick="downloadCsvFile()" style="background-color: #059669; padding: 8px 12px; font-size: 13px;">📥 시트로 받기</button>
                <button onclick="openSungModal()" style="background-color: #d97706; padding: 8px 12px; font-size: 13px;">🎤 불렀던 곡 등록</button>
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

    <!-- 곡 수정 모달 -->
    <div id="edit-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
        <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 400px; max-width: 90%;">
            <h3 id="modal-title" style="margin-top: 0; color: #03045e;">곡 정보 수정</h3>
            <input type="hidden" id="edit-index">
            <label style="font-size: 13px;">노래 제목</label>
            <input type="text" id="modal-title-input" placeholder="제목">
            <label style="font-size: 13px;">가수</label>
            <input type="text" id="modal-artist-input" placeholder="가수">
            <label style="font-size: 13px;">장르</label>
            <input type="text" id="modal-genre-input" placeholder="KPOP, JPOP, POP, 기타연주">
            <label style="font-size: 13px;">제한 / 조건</label>
            <input type="text" id="modal-limit-input" placeholder="200개, 300개, 기타">
            <label style="font-size: 13px;">기타 정보</label>
            <input type="text" id="modal-etc-input" placeholder="특이사항">
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="closeEditModal()" style="background-color: #64748b; flex: 1; padding: 8px;">취소</button>
                <button onclick="saveModalSong()" style="background-color: #0077b6; flex: 1; padding: 8px;">저장</button>
            </div>
        </div>
    </div>

    <!-- 불렀던 곡 등록 팝업(모달) -->
    <div id="sung-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
        <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 450px; max-width: 90%; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin-top: 0; color: #03045e;">🎤 불렀던 곡 목록 (미등록 곡)</h3>
            <p style="font-size: 13px; color: #64748b;">노래책에 등록되지 않은 곡들입니다. 등록 버튼을 누르면 노래책에 추가되고 이동됩니다.</p>
            <div id="sung-modal-input" style="max-height: 300px; overflow-y: auto; margin-bottom: 15px; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; background: #f8fafc;"></div>
            <div style="display: flex; gap: 10px;">
                <button onclick="closeSungModal()" style="background-color: #64748b; flex: 1; padding: 8px;">닫기</button>
            </div>
        </div>
    </div>
`;

// 📌 데이터 백업 다운로드 기능
async function downloadAllBackupData() {
    if (!confirm("현재 서버에 저장된 모든 데이터 파일(profile, links, songlist, mainpage)을 JSON 파일로 백업 다운로드하시겠습니까?")) {
        return;
    }

    const targets = [
        { type: 'profile', filename: 'profile_backup.json' },
        { type: 'links', filename: 'links_backup.json' },
        { type: 'songlist', filename: 'songlist_backup.json' },
        { type: 'mainpage', filename: 'mainpage_backup.json' }
    ];

    let successCount = 0;
    const timestamp = new Date().getTime();

    for (const item of targets) {
        try {
            const res = await fetch(`${WORKER_URL}?type=${item.type}&t=${timestamp}`);
            if (!res.ok) throw new Error("네트워크 응답 오류");
            const data = await res.json();

            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = url;
            link.download = item.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            successCount++;
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
            console.error(`⚠️ ${item.type} 백업 실패:`, err);
        }
    }

    if (successCount > 0) {
        showToast(`총 ${successCount}개의 파일 백업 다운로드가 완료되었습니다!`);
    } else {
        showToast("데이터 다운로드 중 오류가 발생했습니다.");
    }
}

// 📌 가이드 코드 복사 함수
function copyGuideCode(type) {
    let code = "";
    if (type === 'mainpage') {
        code = '<div style="display: flex; justify-content: center; width: 100%;">\n<iframe src="https://badabi.pages.dev/mainpages" frameborder="0" id="pandaFrame" style="width: 100%; height: 1000px;" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture" scrolling="yes"></iframe>\n</div>';
    } else if (type === 'songlist') {
        code = '<div style="display: flex; justify-content: center; width: 100%;">\n<iframe src="https://badabi.pages.dev/songlist" frameborder="0" id="pandaFrame" style="width: 100%; height: 1000px;" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture" scrolling="yes"></iframe>\n</div>';
    }

    navigator.clipboard.writeText(code).then(() => {
        showToast("코드가 클립보드에 복사되었습니다!");
    }).catch(err => {
        showToast("복사 실패: " + err);
    });
}

function showDashboard() {
    document.getElementById("dashboard-section").style.display = "block";
    document.getElementById("panel-mainpage").style.display = "none";
    document.getElementById("panel-intro").style.display = "none";
    document.getElementById("panel-links").style.display = "none";
    document.getElementById("panel-songs").style.display = "none";
    document.getElementById("panel-guide").style.display = "none";
}

function showPanel(type) {
    document.getElementById("dashboard-section").style.display = "none";
    document.getElementById("panel-mainpage").style.display = "none";
    document.getElementById("panel-intro").style.display = "none";
    document.getElementById("panel-links").style.display = "none";
    document.getElementById("panel-songs").style.display = "none";
    document.getElementById("panel-guide").style.display = "none";

    if (type === 'mainpage') {
        document.getElementById("panel-mainpage").style.display = "block";
        setTimeout(() => {
            if (typeof window.initMainPagePanel === 'function') {
                window.initMainPagePanel();
            }
        }, 50);
    } else if (type === 'intro') {
        document.getElementById("panel-intro").style.display = "block";
        if (typeof initIntroPanel === 'function') initIntroPanel();
    } else if (type === 'links') {
        document.getElementById("panel-links").style.display = "block";
        if (typeof initLinksPanel === 'function') initLinksPanel();
    } else if (type === 'songs') {
        document.getElementById("panel-songs").style.display = "block";
        if (typeof initSongsPanel === 'function') initSongsPanel();
    } else if (type === 'guide') {
        document.getElementById("panel-guide").style.display = "block";
    }
}

function initMainPagePanel(retryCount = 0) {
    const navBgInput = document.getElementById("mp-nav-bgcolor");
    const logoTextInput = document.getElementById("mp-logo-text");
    const mainContentInput = document.getElementById("mp-main-content");
    const memoNoticeBox = document.getElementById("mp-memo-notice-box");

    if (navBgInput) navBgInput.value = mainpageData.navBgColor || "";
    if (logoTextInput) logoTextInput.value = mainpageData.logoText || "";
    if (mainContentInput) mainContentInput.value = mainpageData.mainContent || "";
    
    if (memoNoticeBox) {
        memoNoticeBox.textContent = mainpageData.memo;
    }

    try {
        if (typeof renderMainPageMenuRows === 'function') {
            renderMainPageMenuRows();
        }
    } catch (err) {
        console.error("⚠️ 메뉴 렌더링 중 에러 발생:", err);
    }
}

function renderMainPageMenuRows() {
    const container = document.getElementById("mp-menu-rows-container");
    if (!container) return;
    
    container.innerHTML = "";
    const items = Array.isArray(mainpageData.menuItems) ? mainpageData.menuItems : [];

    if (items.length === 0) {
        container.innerHTML = `<div style="color: #64748b; font-size: 13px; text-align: center; padding: 10px;">등록된 메뉴가 없습니다. '+ 메뉴 추가' 버튼을 눌러주세요.</div>`;
        return;
    }

    items.forEach((item, index) => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; gap: 10px; align-items: center; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1;";
        row.innerHTML = `
            <input type="text" placeholder="메뉴 이름" value="${escapeHtml(item.name || '')}" oninput="updateMainPageMenu(${index}, 'name', this.value)" style="flex: 1; margin-bottom: 0; padding: 6px;">
            <input type="text" placeholder="연결 주소" value="${escapeHtml(item.url || '')}" oninput="updateMainPageMenu(${index}, 'url', this.value)" style="flex: 1.5; margin-bottom: 0; padding: 6px;">
            <button type="button" onclick="removeMainPageMenu(${index})" style="background-color: #ef4444; padding: 6px 12px; font-size: 13px; margin-bottom: 0;">삭제</button>
        `;
        container.appendChild(row);
    });
}

function updateMainPageMenu(index, field, value) {
    if (mainpageData.menuItems[index]) {
        mainpageData.menuItems[index][field] = value;
    }
}

function addMainPageMenuRow() {
    if (!Array.isArray(mainpageData.menuItems)) mainpageData.menuItems = [];
    mainpageData.menuItems.push({ name: "", url: "" });
    renderMainPageMenuRows();
}

function removeMainPageMenu(index) {
    if (mainpageData.menuItems) {
        mainpageData.menuItems.splice(index, 1);
        renderMainPageMenuRows();
    }
}

async function saveMainPageSettings() {
    const navBgInput = document.getElementById("mp-nav-bgcolor");
    const logoTextInput = document.getElementById("mp-logo-text");
    const mainContentInput = document.getElementById("mp-main-content");

    if (navBgInput) mainpageData.navBgColor = navBgInput.value.trim();
    if (logoTextInput) mainpageData.logoText = logoTextInput.value.trim();
    if (mainContentInput) mainpageData.mainContent = mainContentInput.value.trim();
    
    await saveDataToWorker("mainpage", mainpageData, "mainpage-status");
}

async function verifyAndLoad() {
    const password = document.getElementById("admin-password").value;
    const statusEl = document.getElementById("login-status");
    if (!password) { statusEl.style.color = "#ef4444"; statusEl.textContent = "비밀번호를 입력해주세요."; return; }

    statusEl.style.color = "#0077b6";
    statusEl.textContent = "비밀번호 확인 및 데이터 로드 중...";

    try {
        const authResponse = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                password: password, 
                action: "verify",
                fileType: "verify" 
            })
        });

        if (!authResponse.ok) {
            const errResult = await authResponse.json();
            throw new Error(errResult.error || "비밀번호가 틀렸습니다.");
        }

        const timestamp = new Date().getTime();
        const [songRes, profileRes, linksRes, mainpageRes, statsRes] = await Promise.all([
            fetch(WORKER_URL + "?type=songlist&t=" + timestamp),
            fetch(WORKER_URL + "?type=profile&t=" + timestamp),
            fetch(WORKER_URL + "?type=links&t=" + timestamp),
            fetch(WORKER_URL + "?type=mainpage&t=" + timestamp),
            fetch(WORKER_URL + "?type=fansongstats&t=" + timestamp)
        ]);

        if (statsRes.ok) {
            const data = await statsRes.json() || {};
            fansongStatsData = {
                vodSources: Array.isArray(data.vodSources) ? data.vodSources : [],
                unregisteredSongs: Array.isArray(data.unregisteredSongs) ? data.unregisteredSongs : [],
                registeredSongs: Array.isArray(data.registeredSongs) ? data.registeredSongs : []
            };
        }

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
        if (mainpageRes.ok) {
            const data = await mainpageRes.json() || {};
            mainpageData = {
                navBgColor: data.navBgColor || "rgba(3, 4, 94, 0.9)",
                logoText: data.logoText || "BABABI FAN ARCHIVE",
                logoUrl: data.logoUrl || "mainpages.html",
                mainContent: data.mainContent !== undefined ? data.mainContent : "", 
                menuItems: Array.isArray(data.menuItems) ? data.menuItems : [],
                memo: data.memo || "" 
            };
            window.mainpageData = mainpageData;
        }
        
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-app-container").innerHTML = adminHtmlTemplate;

        setTimeout(() => {
            const cards = document.querySelectorAll('.menu-grid .menu-card');
            if (cards.length >= 4) {
                cards[0].onclick = () => showPanel('intro');
                cards[1].onclick = () => showPanel('links');
                cards[2].onclick = () => showPanel('songs');
                cards[3].onclick = () => showPanel('mainpage');
            }
            showDashboard();
        }, 50);
        
    } catch (error) {
        statusEl.style.color = "#ef4444";
        statusEl.textContent = "로그인 실패: " + error.message;
    }
}

async function saveDataToWorker(fileType, contentObj, statusElementId) {
    showToast("페이지에 반영 중...");

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password: document.getElementById("admin-password").value,
                fileType: fileType,
                content: contentObj
            })
        });
        const result = await response.json();
        if (response.ok) {
            showToast("성공적으로 업데이트되었습니다! (1~2분 뒤 반영)");
        } else {
            throw new Error(result.error || "비밀번호 오류");
        }
    } catch (error) {
        showToast("실패: " + error.message);
    }
}

async function saveSonglist() {
    songData.notice = document.getElementById("notice-input").value;
    
    await saveDataToWorker("songlist", songData, "status");
    
    const statsPayload = {
        vodSources: Array.isArray(fansongStatsData.vodSources) ? fansongStatsData.vodSources : [],
        registeredSongs: Array.isArray(fansongStatsData.registeredSongs) ? fansongStatsData.registeredSongs : [],
        unregisteredSongs: Array.isArray(fansongStatsData.unregisteredSongs) ? fansongStatsData.unregisteredSongs : []
    };

    await saveDataToWorker("fansongstats", statsPayload, "status");
}

function initSongsPanel() {
    document.getElementById("notice-input").value = songData.notice || "";
    renderTable();
}

// 📌 렌더링 함수: 신규 곡이 항상 맨 위에 오도록 unshift 처리된 배열을 순서대로 출력
function renderTable() {
    if (!Array.isArray(songData.songs)) songData.songs = [];
    const badge = document.getElementById("song-count-badge");
    if (badge) badge.textContent = songData.songs.length;
    
    const searchInput = document.getElementById("search-input");
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const tbody = document.getElementById("song-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    songData.songs.forEach((song, index) => {
        const title = (song.title || "").toLowerCase();
        const artist = (song.artist || "").toLowerCase();
        const genre = (song.genre || "").toLowerCase();

        if (keyword && !title.includes(keyword) && !artist.includes(keyword) && !genre.includes(keyword)) return;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="color: #64748b; font-weight: bold;">#${index + 1}</td>
            <td style="font-weight: 600; color: #0f172a;">${escapeHtml(song.title || '제목 없음')}</td>
            <td>${escapeHtml(song.artist || '-')}</td>
            <td>${escapeHtml(song.genre || '-')}</td>
            <td style="font-size: 12px; color: #475569;">${escapeHtml(song.limit || song.etc ? (song.limit + ' ' + song.etc).trim() : '-')}</td>
            <td style="text-align: center;">
                <button class="edit-btn" onclick="openEditModal(${index})">수정</button>
                <button class="delete-btn" onclick="deleteSong(${index})">삭제</button>
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

// 📌 새 노래 추가/수정 (신규 추가는 무조건 unshift로 맨 앞에 배치)
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
        songData.songs.unshift(newSong); // 👈 맨 앞에 추가
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

function importBatchSongs() {
    const text = document.getElementById("batch-input").value.trim();
    if (!text) { alert("붙여넣은 내용이 없습니다."); return; }

    const lines = text.split("\n");
    let addedSongs = [];

    lines.forEach(line => {
        const cols = line.split("\t");
        if (cols.length >= 1 && cols[0].trim()) {
            addedSongs.push({
                title: cols[0] ? cols[0].trim() : "",
                artist: cols[1] ? cols[1].trim() : "",
                genre: cols[2] ? cols[2].trim() : "",
                limit: cols[3] ? cols[3].trim() : "",
                etc: cols[4] ? cols[4].trim() : ""
            });
        }
    });

    if (addedSongs.length > 0) {
        songData.songs = [...addedSongs.reverse(), ...songData.songs];
        
        showToast(`${addedSongs.length}곡이 추가되었습니다!`);
        document.getElementById("batch-input").value = "";
        renderTable();
    } else {
        alert("가져올 수 있는 유효한 데이터가 없습니다.");
    }
}

function openSungModal() {
    const modal = document.getElementById("sung-modal");
    const container = document.getElementById("sung-modal-input");
    
    if (!fansongStatsData.unregisteredSongs || fansongStatsData.unregisteredSongs.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">미등록된 곡이 없습니다.</div>`;
        modal.style.display = "flex";
        return;
    }

    let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
    fansongStatsData.unregisteredSongs.forEach((song, index) => {
        html += `
            <li style="padding: 10px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #fff; margin-bottom: 6px; border-radius: 4px;">
                <div>
                    <strong style="color: #0f172a;">${escapeHtml(song.title)}</strong> 
                    <span style="color: #64748b; font-size: 12px;">(${escapeHtml(song.artist || '가수 미상')})</span>
                </div>
                <button onclick="registerUnregisteredSong(${index})" style="background-color: #10b981; padding: 6px 12px; font-size: 12px; margin-bottom: 0;">등록하기</button>
            </li>`;
    });
    html += '</ul>';
    
    container.innerHTML = html;
    modal.style.display = "flex";
}

function closeSungModal() {
    const modal = document.getElementById("sung-modal");
    if (modal) {
        modal.style.display = "none";
    }
}

function registerUnregisteredSong(index) {
    const songToMove = fansongStatsData.unregisteredSongs[index];

    songData.songs.unshift({
        title: songToMove.title,
        artist: songToMove.artist || "",
        genre: songToMove.genre || "", 
        limit: songToMove.limit || "",
        etc: songToMove.etc || ""
    });

    if (!Array.isArray(fansongStatsData.registeredSongs)) {
        fansongStatsData.registeredSongs = [];
    }
    
    fansongStatsData.registeredSongs.unshift({
        title: songToMove.title,
        artist: songToMove.artist || "",
        limit: songToMove.limit || "",
        dateTimes: songToMove.dateTimes || []
    });

    fansongStatsData.unregisteredSongs.splice(index, 1);

    showToast("노래책 상단에 등록되었습니다!");
    
    openSungModal();
    renderTable(); 
}

// 📌 토스트 중복 출력 원천 차단 함수
function showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(container);
    }

    // 이미 같은 메시지의 토스트가 떠 있다면 새로 만들지 않음
    const existingToasts = container.querySelectorAll(".toast-message");
    for (let t of existingToasts) {
        if (t.textContent === message) {
            return; 
        }
    }

    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    toast.style.cssText = "background: #1e293b; color: #fff; padding: 12px 20px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); opacity: 0; transition: opacity 0.3s ease; font-size: 14px;";
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "1";
    }, 10);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
