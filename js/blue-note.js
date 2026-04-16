const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsvaqEEGjtHB20R3qPkIAXyAySm8FnLzcs0rIsZevLuLP65D43gSuoRzYVU0pmhRbvyg5AW-Ce1cmL/pub?gid=0&single=true&output=tsv";
    const startDate = new Date("2026-04-20"); 
    
    window.onload = () => {
        const overlay = document.getElementById('loading-overlay');

        // 로딩 문구 설정
        prepareWaveText("눈물을 모으고 있어요 . . .");
        
        const cacheBuster = `&t=${new Date().getTime()}`;
        
        fetch(sheetUrl + cacheBuster, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        })
            .then(res => res.text())
            .then(tsv => {
                const lines = tsv.split(/\r?\n/).filter(line => line.trim() !== "");
                let cries = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const parts = lines[i].split('\t').map(item => item.trim());
                    if (!parts[0] || !parts[2] || parts[0] === "" || parts[2] === "") continue;
                    
                    let displayMonth = parts[0];
                    if (displayMonth.includes(',')) {
                        const [y, m] = displayMonth.split(',');
                        if (!y || !m) continue; 
                        displayMonth = `20${y}년 ${m}월`;
                    } else {
                        continue;
                    }

                    cries.push({ 
                        rawMonth: parts[0], 
                        formattedMonth: displayMonth,
                        date: parts[1] || '', 
                        desc: parts[2], 
                        time: parts[3] || '--:--:--', 
                        link: parts[4] || '#' 
                    });
                }
                renderList(cries);
                renderStats(cries);
                
                const now = new Date();
                const timeString = now.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                document.getElementById('update-time').textContent = `최근 업데이트: ${timeString}`;
                
                // 로딩 종료 처리
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        overlay.style.visibility = 'hidden';
                        document.body.style.overflow = 'auto'; // 스크롤 활성화
                    }, 500);
                }, 800);
            })
            .catch(err => {
                console.error(err);
                document.getElementById('stats-area').innerHTML = "데이터를 불러오는 중 오류가 발생했습니다.";
                overlay.style.display = 'none';
            });
    };

    function renderStats(data) {
        const statsArea = document.getElementById('stats-area');
        const total = data.length;
        const stats = {};

        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const averageCycle = total > 0 ? (diffDays / total).toFixed(1) : 0;

        data.forEach(item => {
            const [y, m] = item.rawMonth.split(',').map(Number);
            const year = `20${y}년`;
            const month = `${m}월`;
            if (!stats[year]) stats[year] = { months: {}, yearTotal: 0 };
            if (!stats[year].months[month]) stats[year].months[month] = 0;
            stats[year].months[month]++;
            stats[year].yearTotal++;
        });

        let statsHtml = `
            <div class="stats-summary" style="margin-bottom: 12px;">
                <span class="stats-total" style="margin-bottom: 4px;">전체 기록: ${total}회</span>
                <div style="font-size: 13px; color: var(--text-sub);">
                    📅 <strong>${startDate.toLocaleDateString()}</strong>로부터 <strong>${diffDays}일</strong>째 기록 중<br>
                    📉 약 <strong>${averageCycle}일</strong>에 한 번 꼴로 울고 계시네요!
                </div>
            </div>
        `;
        
        statsHtml += `<div class="stats-detail" style="border-top: 1px solid var(--border); padding-top: 10px;">`;
        
        Object.keys(stats).sort((a, b) => a.localeCompare(b)).forEach(year => {
            const yearData = stats[year];
            const monthDetails = Object.keys(yearData.months)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(m => `${m} ${yearData.months[m]}회`)
                .join(', ');
                
            statsHtml += `<div class="year-block"><strong>${year} 합계 ${yearData.yearTotal}회</strong> (${monthDetails})</div>`;
        });
        
        statsHtml += `</div>`;
        statsArea.innerHTML = statsHtml;
    }

    function renderList(data) {
        const container = document.getElementById('main-content');
        container.innerHTML = '';

        data.sort((a, b) => {
            const [yearA, monthA] = a.rawMonth.split(',').map(Number);
            const [yearB, monthB] = b.rawMonth.split(',').map(Number);
            if (yearA !== yearB) return yearA - yearB;
            if (monthA !== monthB) return monthA - monthB;
            const getDateNum = (dateStr) => parseFloat(dateStr.split('~')[0]);
            const dateA = getDateNum(a.date);
            const dateB = getDateNum(b.date);
            if (dateA !== dateB) return dateA - dateB;
            return a.time.localeCompare(b.time);
        });

        const groups = {};
        data.forEach(item => {
            if (!groups[item.formattedMonth]) groups[item.formattedMonth] = [];
            groups[item.formattedMonth].push(item);
        });

        const sortedMonthKeys = Object.keys(groups).sort((a, b) => {
            const parseM = (s) => {
                const match = s.match(/(\d+)년\s+(\d+)월/);
                if (!match) return 0;
                return parseInt(match[1]) * 100 + parseInt(match[2]);
            };
            return parseM(a) - parseM(b);
        });

        sortedMonthKeys.forEach(month => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'month-group';
            groupDiv.innerHTML = `
                <div class="month-title">${month}</div>
                <div class="cry-list">
                    ${groups[month].map(cry => {
                        const hasLink = cry.link && cry.link !== '#' && cry.link.trim() !== '';
                        const linkAttr = hasLink ? `href="${cry.link}" target="_blank"` : `href="javascript:void(0)"`;
                        const noLinkClass = hasLink ? "" : "no-link";

                        return `
                            <a ${linkAttr} class="cry-item ${noLinkClass}">
                                <div class="cry-date">${cry.date.replace(' ~ ', '\n').replace('~', '\n')}</div>
                                <div class="cry-content">
                                    <div class="cry-desc">${cry.desc}</div>
                                    <div class="cry-time">
                                        🕒 ${cry.time} 
                                        ${hasLink ? '<span class="link-hint">다시보기 ↗</span>' : ''}
                                    </div>
                                </div>
                            </a>
                        `;
                    }).join('')}
                </div>
            `;
            container.appendChild(groupDiv);
        });
    }
