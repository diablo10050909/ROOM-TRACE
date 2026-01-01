// js/room_renderer.js - 방의 데이터를 바탕으로 HTML 요소를 생성하여 화면에 렌더링한다.

const RoomRenderer = (() => {
    const roomDisplayElement = document.getElementById('room-display');

    // HTML 태그에서 위험한 문자를 이스케이프 처리하여 XSS 공격 방지
    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // 주어진 방 데이터(roomData)를 사용하여 방을 화면에 렌더링한다.
    function renderRoom(roomData) {
        console.log(`[RoomRenderer] 방 렌더링 시작: ${roomData ? roomData.id : 'No Data'}`);
        if (!roomData) {
            roomDisplayElement.innerHTML = `
                <div class="room-content">
                    <p class="room-description" style="color: #ff5555;">
                        <br> 시스템에 방 데이터가 없다. 이 비극의 책임자를 찾아라!
                    </p>
                </div>`;
            roomDisplayElement.style.backgroundImage = 'none';
            roomDisplayElement.className = 'room-display'; // 기본 클래스로 복원
            return;
        }

        // 1. 방 배경 이미지 설정
        roomDisplayElement.style.backgroundImage = `url(${escapeHTML(roomData.backgroundImage)})`;
        roomDisplayElement.className = `room-display room-${escapeHTML(roomData.id)}`; // 방 ID를 CSS 클래스로 추가하여 개별 스타일링 가능하게 한다.

        // 2. 방 콘텐츠 HTML 구조 생성
        let roomContentHtml = `
            <div class="room-content">
                <h1 class="room-title">${escapeHTML(roomData.title)}</h1>
                <p class="room-description">${escapeHTML(roomData.description)}</p>
        `;

        // 3. 방 내부 오브젝트들을 추가
        roomData.objects.forEach(obj => {
            roomContentHtml += `
                <div class="room-object"
                     id="${escapeHTML(obj.id)}"
                     data-puzzle-id="${escapeHTML(obj.puzzleId)}"
                     style="left: ${escapeHTML(obj.position.left || 'auto')};
                            top: ${escapeHTML(obj.position.top || 'auto')};
                            right: ${escapeHTML(obj.position.right || 'auto')};
                            bottom: ${escapeHTML(obj.position.bottom || 'auto')};
                            width: ${escapeHTML(obj.size.width || 'auto')};
                            height: ${escapeHTML(obj.size.height || 'auto')};">
                    ${escapeHTML(obj.name)}
                </div>
            `;
        });

        // 4. 방의 출구(문)를 추가
        const isDoorUnlocked = GameManager.isDoorUnlocked(roomData.door.id); // GameManager에서 문 잠금 상태 확인
        const doorClass = isDoorUnlocked ? 'unlocked' : 'locked'; // 상태에 따라 CSS 클래스 결정
        roomContentHtml += `
            <div class="room-door ${doorClass}"
                 id="${escapeHTML(roomData.door.id)}"
                 data-door-id="${escapeHTML(roomData.door.id)}"
                 style="left: ${escapeHTML(roomData.door.position.left || 'auto')};
                        top: ${escapeHTML(roomData.door.position.top || 'auto')};
                        right: ${escapeHTML(roomData.door.position.right || 'auto')};
                        bottom: ${escapeHTML(roomData.door.position.bottom || 'auto')};">
                문
            </div>
        `;
        roomContentHtml += `</div>`; // .room-content 닫기

        // 5. 생성된 HTML을 #room-display에 주입
        roomDisplayElement.innerHTML = roomContentHtml;
        console.log(`[RoomRenderer] ${roomData.title} 렌더링 성공.`);
    }

    return {
        renderRoom
    };
})();
