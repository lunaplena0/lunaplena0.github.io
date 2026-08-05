function addIntroLinkRow(name = "", url = "") {
    const container = document.getElementById('intro-link-rows-container');
    const row = document.createElement('div');
    row.className = 'menu-item-row';
    row.innerHTML = `
        <input type="text" placeholder="링크 이름" class="link-name-input" value="${name}" style="flex: 1;">
        <input type="text" placeholder="연결 주소 (URL)" class="link-url-input" value="${url}" style="flex: 2.5;">
        <button type="button" class="delete-item-btn" onclick="this.parentElement.remove()">삭제</button>
    `;
    container.appendChild(row);
}

function addIntroTimelineRow(time = "", text = "") {
    const container = document.getElementById('intro-timeline-rows-container');
    const row = document.createElement('div');
    row.className = 'menu-item-row';
    row.innerHTML = `
        <input type="text" placeholder="시간/일시" class="timeline-time-input" value="${time}" style="flex: 1;">
        <input type="text" placeholder="내용" class="timeline-text-input" value="${text}" style="flex: 2.5;">
        <button type="button" class="delete-item-btn" onclick="this.parentElement.remove()">삭제</button>
    `;
    container.appendChild(row);
}

async function uploadIntroImage() {
    const fileInput = document.getElementById("intro-image-file");
    const statusEl = document.getElementById("intro-image-status"); 
    if (!fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const password = document.getElementById("admin-password").value;
    statusEl.style.color = "#0284c7";
    statusEl.textContent = "⏳ 이미지를 업로드하는 중입니다...";

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const base64Content = e.target.result.split(',')[1];
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, action: "upload_image", filename: file.name, filedata: base64Content })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                document.getElementById("intro-image").value = result.url;
                statusEl.style.color = "#166534";
                statusEl.textContent = "✅ 이미지 업로드 완료!";
            } else { throw new Error(result.error || "업로드 실패"); }
        } catch (error) {
            statusEl.style.color = "#ef4444";
            statusEl.textContent = "❌ 업로드 실패: " + error.message;
        }
    };
    reader.readAsDataURL(file);
}

async function loadIntroSettingsData() {
    const statusEl = document.getElementById('intro-status');
    try {
        const response = await fetch(WORKER_URL + "?type=fanstartpage&t=" + Date.now());
        const data = await response.json();
        if (data) {
            document.getElementById('intro-name').value = data.name || "";
            document.getElementById('intro-image').value = data.image || "";
            document.getElementById('intro-message').value = data.message || "";
            document.getElementById('intro-notice').value = data.notice || "";
            document.getElementById('intro-vod').value = data.vod || "";

            const linkContainer = document.getElementById('intro-link-rows-container');
            linkContainer.innerHTML = "";
            (data.links || []).forEach(item => addIntroLinkRow(item.name, item.url));
            if(linkContainer.children.length === 0) addIntroLinkRow();

            const container = document.getElementById('intro-timeline-rows-container');
            container.innerHTML = "";
            (data.timeline || []).forEach(item => addIntroTimelineRow(item.time, item.text));
            if(container.children.length === 0) addIntroTimelineRow();
        }
        statusEl.textContent = "불러오기 성공";
        statusEl.style.color = "#10b981";
    } catch (err) {
        statusEl.textContent = "불러오기 실패";
        statusEl.style.color = "#ef4444";
    }
}

async function saveIntroSettings() {
    const statusEl = document.getElementById('intro-status');
    const password = document.getElementById('admin-password').value.trim();
    if (!password) return;

    const name = document.getElementById('intro-name').value.trim();
    const image = document.getElementById('intro-image').value.trim();
    const message = document.getElementById('intro-message').value.trim();
    const notice = document.getElementById('intro-notice').value.trim();
    const vod = document.getElementById('intro-vod').value.trim();
    const links = [];
    document.querySelectorAll('#intro-link-rows-container .menu-item-row').forEach(row => {
        const name = row.querySelector('.link-name-input').value.trim();
        const url = row.querySelector('.link-url-input').value.trim();
        if (name || url) links.push({ name, url });
    });
    const timeline = [];
    document.querySelectorAll('#intro-timeline-rows-container .menu-item-row').forEach(row => {
        const time = row.querySelector('.timeline-time-input').value.trim();
        const text = row.querySelector('.timeline-text-input').value.trim();
        if (time || text) timeline.push({ time, text });
    });

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, fileType: "fanstartpage", content: { name, image, message, notice, vod, links, timeline } })
        });
        if (response.ok) {
            statusEl.textContent = "성공적으로 저장되었습니다!";
            statusEl.style.color = "#10b981";
        } else { throw new Error("저장 실패"); }
    } catch (err) {
        statusEl.textContent = "저장 오류: " + err.message;
        statusEl.style.color = "#ef4444";
    }
}
