const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIfrVC6MakrvA_D8rsQeTT6oaX_0w4bc8I_aaJuoQi4g_AuuvFi-nCP_lnHwvoSAsFKxagrzhoPy_J/pub?gid=0&single=true&output=tsv";
    
    window.allSongs = [];

    window.onload = async () => {
        const overlay = document.getElementById('loading-overlay');
        prepareWaveText("노래책을 펼치고 있어요 . . .");

        const cacheBuster = `&t=${new Date().getTime()}`;
        const finalUrl = sheetUrl + cacheBuster;

        try {
            const res = await fetch(finalUrl, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            });

            if (!res.ok) throw new Error("Network Error");

            const tsv = await res.text();
            const lines = tsv.split(/\r?\n/).filter(line => line.trim() !== "");
            const tbody = document.getElementById('song-list-body');
            
            let html = ''; 
            let total = 0;
            let guitar = 0;
            window.allSongs = [];

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split('\t').map(item => item.trim());
                if (parts.length < 2 || !parts[0]) continue;

                total++;
                const originalTitle = parts[0]; 
                const artist = parts[1] || "Unknown"; 

                const tagMatch = originalTitle.match(/^\[([^\]]+)\]/);
                let displayTitle = originalTitle;
                let tagHtml = '';

                if (tagMatch) {
                    const fullTag = tagMatch[0];
                    const tagText = tagMatch[1];
                    displayTitle = originalTitle.replace(fullTag, '').trim();
                    
                    let tagClass = 'tag-default';
                    if (tagText.includes("200")) tagClass = 'tag-200';
                    else if (tagText.includes("300")) tagClass = 'tag-300';
                    else if (tagText.includes("기타")) {
                        tagClass = 'tag-기타';
                        guitar++;
                    }
                    tagHtml = `<span class="tag-badge ${tagClass}">${tagText}</span>`;
                }

                window.allSongs.push({ originalTitle, artist });

                html += `<tr>
                    <td>${total}</td>
                    <td class="song-title">${displayTitle}${tagHtml}</td>
                    <td class="song-artist">${artist}</td>
                </tr>`;
            }
            
            tbody.innerHTML = html;
            document.getElementById('total-count').textContent = total;
            document.getElementById('guitar-count').textContent = guitar;
            
            const now = new Date();
            document.getElementById('update-time').textContent = `최근 동기화: ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        } catch (err) {
            console.error("데이터 로드 실패:", err);
            document.getElementById('song-list-body').innerHTML = `<tr><td colspan="3" style="text-align:center; color:#ff4b4b; padding:40px;">데이터를 불러오지 못했습니다.</td></tr>`;
        } finally {
            // 로딩 종료 처리
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.visibility = 'hidden';
                    document.body.style.overflow = 'auto'; // 성공/실패 여부 관계없이 스크롤 복구
                }, 500);
            }, 800);
        }
    };

    function filterSongs() {
        const filter = document.getElementById('songSearch').value.toUpperCase();
        const rows = document.querySelectorAll("#song-list-body tr");
        
        rows.forEach(row => {
            const title = row.querySelector('.song-title')?.textContent.toUpperCase() || "";
            const artist = row.querySelector('.song-artist')?.textContent.toUpperCase() || "";
            if (title.includes(filter) || artist.includes(filter)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }
