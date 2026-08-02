// 링크 수정 관련 로직

function initLinksPanel() {
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
