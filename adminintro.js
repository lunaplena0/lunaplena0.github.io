// 자기소개 수정 관련 로직

function initIntroPanel() {
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
}

// 🖼️ 이미지 파일을 Base64로 변환 후 GitHub 저장용 Worker로 전송
async function uploadProfileImage() {
    const fileInput = document.getElementById("p-image-file");
    const statusEl = document.getElementById("image-status"); 
    
    if (!fileInput.files || fileInput.files.length === 0) {
        if (statusEl) {
            statusEl.style.color = "#ef4444";
            statusEl.textContent = "❌ 업로드할 이미지 파일을 선택해주세요.";
        }
        return;
    }

    const file = fileInput.files[0];
    const passwordInput = document.getElementById("admin-password");
    const password = passwordInput ? passwordInput.value : "";

    if (statusEl) {
        statusEl.style.color = "#0284c7";
        statusEl.textContent = "⏳ 이미지를 업로드하는 중입니다...";
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const base64Content = e.target.result.split(',')[1];

            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password: password,
                    action: "upload_image",
                    filename: file.name,
                    filedata: base64Content
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    document.getElementById("p-image").value = result.url;
                    if (statusEl) {
                        statusEl.style.color = "#166534";
                        statusEl.textContent = "✅ 이미지 업로드가 성공적으로 완료되었습니다!";
                    }
                } else {
                    throw new Error(result.error || "업로드 실패");
                }
            } else {
                const errText = await response.text();
                throw new Error(`서버 오류 (${response.status}): ${errText}`);
            }
        } catch (error) {
            if (statusEl) {
                statusEl.style.color = "#ef4444";
                statusEl.textContent = "❌ 업로드 실패: " + error.message;
            }
        }
    };

    reader.onerror = function() {
        if (statusEl) {
            statusEl.style.color = "#ef4444";
            statusEl.textContent = "❌ 파일을 읽는 중 오류가 발생했습니다.";
        }
    };

    reader.readAsDataURL(file);
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
        <button type="button" onclick="moveRow(this, 'up')" style="background-color: #64748b; height: 38px; padding: 0 12px; font-size: 13px; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #fff; cursor: pointer;" title="위로">▲</button>
        <button type="button" onclick="moveRow(this, 'down')" style="background-color: #64748b; height: 38px; padding: 0 12px; font-size: 13px; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #fff; cursor: pointer;" title="아래로">▼</button>
        <button type="button" onclick="this.closest('.detail-item-row').remove()" style="background-color: #ef4444; height: 38px; padding: 0 12px; font-size: 13px; margin-bottom: 0; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #fff; cursor: pointer;" title="삭제">삭제</button>
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

async function saveProfile() {
    const statusEl = document.getElementById("intro-status");
    statusEl.style.color = "#0077b6";
    statusEl.textContent = "프로필 정보 저장 중...";

    try {
        const rows = document.querySelectorAll("#detail-rows-container .detail-item-row");
        let detailsArr = [];
        rows.forEach(row => {
            const k = row.querySelector(".detail-key").value.trim();
            const v = row.querySelector(".detail-val").value.trim();
            if (k) {
                detailsArr.push({ key: k, value: v });
            }
        });

        const imageUrl = document.getElementById("p-image").value.trim();

        profileData = {
            name: document.getElementById("p-name").value.trim(),
            image: imageUrl, 
            catchphrase: document.getElementById("p-catchphrase").value.trim(),
            details: detailsArr,
            time: document.getElementById("p-time").value.trim(),
            content: document.getElementById("p-content").value.trim(),
            bio1: document.getElementById("p-bio1").value.trim(),
            bio2: document.getElementById("p-bio2").value.trim()
        };

        await saveDataToWorker("profile", profileData, "intro-status");

    } catch (err) {
        statusEl.style.color = "#ef4444";
        statusEl.textContent = "저장 실패: " + err.message;
    }
}
