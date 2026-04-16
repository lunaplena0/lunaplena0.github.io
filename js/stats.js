const BOOK_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIfrVC6MakrvA_D8rsQeTT6oaX_0w4bc8I_aaJuoQi4g_AuuvFi-nCP_lnHwvoSAsFKxagrzhoPy_J/pub?gid=0&single=true&output=tsv";
    const STAT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vReuzG6rmwJOtpxrYtHJELuVxn3BJcW_YWhIrW27Ad5W2W6t__IxlPomhGw5c1j6z8GAPKYz7QCEsYx/pub?gid=1357240589&single=true&output=tsv";
    
    let fullArtistData = [];
    let fullSongData = [];
    let isArtistExpanded = false;
    let isSongExpanded = false;
    let artistSearchQuery = "";
    let songSearchQuery = "";
    let artistSortTarget = 'songCount';

    function parseTitleWithTag(originalTitle) {
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
            else if (tagText.includes("기타")) tagClass = 'tag-기타';
            tagHtml = `<span class="tag-badge ${tagClass}">${tagText}</span>`;
        }
        return `${displayTitle}${tagHtml}`;
    }

    function setArtistSort(target) {
        artistSortTarget = target;
        document.getElementById('sort-icon-count').innerText = target === 'songCount' ? '▼' : '';
        document.getElementById('sort-icon-sing').innerText = target === 'totalSing' ? '▼' : '';
        render('artist');
    }

    async function initStats() {
        const overlay = document.getElementById('loading-overlay');
        prepareWaveText("기록을 정리하고 있어요 . . .");

        try {
            const cacheBuster = `&t=${new Date().getTime()}`;
            const [bookRes, statRes] = await Promise.all([
                fetch(BOOK_SHEET_URL + cacheBuster),
                fetch(STAT_SHEET_URL + cacheBuster)
            ]);

            const bookText = await bookRes.text();
            const statText = await statRes.text();

            const parseTSV = (text) => text.split(/\r?\n/).filter(line => line.trim() !== "");
            const bookLines = parseTSV(bookText).slice(1);
            const statLines = parseTSV(statText).slice(1);

            const artistMap = new Map(); 
            const songMap = new Map();

            bookLines.forEach((line, index) => {
                const parts = line.split('\t').map(item => item.trim());
                if (parts[0]) {
                    const title = parts[0];
                    const artist = parts[1] || "미지정";
                    const dateRaw = parts[2] || "";
                    const history = dateRaw ? dateRaw.split(',').map(d => d.trim()).filter(d => d !== "") : [];
                    const uniqueKey = `${index}_${title}`; 
                    
                    songMap.set(uniqueKey, { 
                        title, artist, history: [...history], count: history.length 
                    });
                }
            });

            statLines.forEach((line) => {
                const parts = line.split('\t').map(item => item.trim());
                if (parts[0]) {
                    const title = parts[0];
                    const artist = parts[1] || "미지정";
                    const sHistory = parts[2] ? parts[2].split(',').map(d => d.trim()).filter(d => d !== "") : [];
                    for (let song of songMap.values()) {
                        if (song.title === title && song.artist === artist) {
                            song.history = [...new Set([...song.history, ...sHistory])].sort();
                            song.count = song.history.length;
                        }
                    }
                }
            });

            fullSongData = Array.from(songMap.values()).map(song => {
                const lastDate = song.count > 0 ? song.history[song.history.length - 1] : "-";
                if (!artistMap.has(song.artist)) artistMap.set(song.artist, { songCount: 0, totalSing: 0, lastSing: "-" });
                const aData = artistMap.get(song.artist);
                aData.songCount += 1;
                aData.totalSing += song.count;
                if (lastDate !== "-" && (aData.lastSing === "-" || lastDate > aData.lastSing)) aData.lastSing = lastDate;
                return { ...song, lastDate };
            }).sort((a, b) => b.count - a.count);

            fullArtistData = Array.from(artistMap.entries());
            render('artist');
            render('song');

        } catch (e) {
            console.error("데이터 로드 오류:", e);
            document.getElementById('artist-stats-body').innerHTML = `<tr><td colspan="4" style="text-align:center;">데이터 로드 중 오류가 발생했습니다.</td></tr>`;
        } finally {
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.visibility = 'hidden';
                    document.body.style.overflow = 'auto';
                }, 500);
            }, 800);
        }
    }

    function onSearch(type) {
        if (type === 'artist') artistSearchQuery = document.getElementById('artist-search').value.toLowerCase();
        else songSearchQuery = document.getElementById('song-search').value.toLowerCase();
        render(type);
    }

    function render(type) {
        const isExpanded = type === 'artist' ? isArtistExpanded : isSongExpanded;
        const query = type === 'artist' ? artistSearchQuery : songSearchQuery;
        let data = type === 'artist' ? [...fullArtistData] : [...fullSongData];

        if (query) {
            if (type === 'artist') data = data.filter(([name]) => name.toLowerCase().includes(query));
            else data = data.filter(s => s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query));
        }

        if (type === 'artist') data.sort((a, b) => b[1][artistSortTarget] - a[1][artistSortTarget]);

        const tbody = document.getElementById(type === 'artist' ? 'artist-stats-body' : 'song-detail-body');
        const btn = document.getElementById(`${type}-toggle`);
        const displayData = (isExpanded || query) ? data : data.slice(0, 5);
        
        btn.style.display = (data.length > 5 && !query) ? 'block' : 'none';
        if (btn.style.display === 'block') btn.innerText = isExpanded ? '▲ 접기' : `▼ 더보기 (${data.length - 5}개)`;

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-sub); padding:30px;">결과가 없습니다.</td></tr>`;
            return;
        }

        tbody.innerHTML = displayData.map(item => {
            if (type === 'artist') {
                const [name, info] = item;
                return `<tr onclick="showArtistDetail('${name.replace(/'/g, "\\'")}')">
                    <td><strong>${name}</strong></td>
                    <td><span class="count-text">${info.songCount}</span> 곡</td>
                    <td>${info.totalSing} 회</td>
                    <td><span class="badge">${info.lastSing}</span></td>
                </tr>`;
            } else {
                return `<tr onclick="showSongDetail('${item.title.replace(/'/g, "\\'")}', '${item.artist.replace(/'/g, "\\'")}')">
                    <td>${parseTitleWithTag(item.title)}</td>
                    <td style="color:var(--text-sub);">${item.artist}</td>
                    <td><span class="count-text">${item.count}</span> 회</td>
                    <td style="font-size:12px; color:var(--text-sub);">${item.lastDate}</td>
                </tr>`;
            }
        }).join('');
    }

    function showArtistDetail(name) {
        const item = fullArtistData.find(a => a[0] === name);
        if(!item) return;
        document.getElementById('modal-title').innerText = `🎤 ${name}`;
        document.getElementById('modal-subtitle').innerText = `보유: ${item[1].songCount}곡 / 총 가창: ${item[1].totalSing}회`;
        document.getElementById('modal-list').innerHTML = fullSongData.filter(s => s.artist === name).map(s => `
            <div class="detail-item"><span>${parseTitleWithTag(s.title)}</span><span class="count-text">${s.count}회</span></div>
        `).join('');
        document.getElementById('detailModal').style.display = 'flex';
    }

    function showSongDetail(title, artist) {
        const song = fullSongData.find(s => s.title === title && s.artist === artist);
        if(!song) return;
        document.getElementById('modal-title').innerHTML = `🎵 ${parseTitleWithTag(song.title)}`;
        document.getElementById('modal-subtitle').innerText = `가수: ${song.artist} / 총 ${song.count}회 가창`;
        document.getElementById('modal-list').innerHTML = song.history.length > 0 ? song.history.map(d => `
            <div class="detail-item"><span>가창 기록</span><span class="badge">${d}</span></div>
        `).join('') : `<div style="text-align:center; padding:20px; color:var(--text-sub);">기록 없음</div>`;
        document.getElementById('detailModal').style.display = 'flex';
    }

    function closeModal() { document.getElementById('detailModal').style.display = 'none'; }
    window.onclick = e => { if (e.target == document.getElementById('detailModal')) closeModal(); }
    function toggleDisplay(type) {
        if (type === 'artist') isArtistExpanded = !isArtistExpanded;
        else isSongExpanded = !isSongExpanded;
        render(type);
    }
    window.onload = initStats;
