// js/game_manager.js - 게임의 모든 상태를 관리하고, 저장 및 불러오기, 메시지 출력을 담당한다.

const GameManager = (() => {
    // === 내부 게임 상태 저장소 ===
    // 현재 게임의 모든 중요 정보가 여기에 기록된다.
    let currentGameState = {
        currentRoomId: 'room-01', // 현재 플레이어가 있는 방의 ID. 첫 방으로 시작!
        inventory: [],            // 플레이어가 얻은 아이템 (추후 확장)
        solvedPuzzles: {},        // { 'puzzle-id': true/false } 형태로 해결된 퍼즐 기록
        unlockedDoors: {},        // { 'door-id': true/false } 형태로 잠금 해제된 문 기록
        roomSpecificData: {}      // 각 방에만 해당하는 추가적인 데이터 (추후 확장)
    };

    // 메시지 표시를 위한 DOM 요소
    const messageDisplayElement = document.getElementById('message-display');

    // === 상태 게터 (Getter) 함수들 ===
    function getCurrentRoomId() {
        return currentGameState.currentRoomId;
    }

    function isPuzzleSolved(puzzleId) {
        return currentGameState.solvedPuzzles[puzzleId] === true;
    }

    function isDoorUnlocked(doorId) {
        return currentGameState.unlockedDoors[doorId] === true;
    }

    // === 상태 세터 (Setter) 및 업데이트 함수들 ===
    function setCurrentRoomId(newRoomId) {
        console.log(`[GameManager] 방 ID 변경: ${currentGameState.currentRoomId} -> ${newRoomId}`);
        currentGameState.currentRoomId = newRoomId;
    }

    function addSolvedPuzzle(puzzleId) {
        if (!currentGameState.solvedPuzzles[puzzleId]) {
            console.log(`[GameManager] 퍼즐 해결 기록: ${puzzleId}`);
            currentGameState.solvedPuzzles[puzzleId] = true;
        }
    }

    function unlockDoor(doorId) {
        if (!currentGameState.unlockedDoors[doorId]) {
            console.log(`[GameManager] 문 잠금 해제 기록: ${doorId}`);
            currentGameState.unlockedDoors[doorId] = true;
        }
    }

    // === 게임 내 메시지 표시 유틸리티 ===
    // 플레이어에게 시스템의 목소리를 전달하는 유일한 방법이다.
    // XSS 방지를 위해 메시지는 항상 HTML 이스케이프 처리된다.
    // duration (ms): 메시지가 화면에 유지될 시간. 0이면 즉시 사라짐. -1이면 사라지지 않음.
    function showMessage(msg, isError = false, duration = 3000) {
        // HTML 이스케이프 처리: 메시지 내용에 스크립트가 주입되는 것을 막는다.
        const escapedMsg = escapeHTML(msg);

        messageDisplayElement.textContent = escapedMsg;
        messageDisplayElement.classList.remove('error'); // 기존 에러 클래스 제거
        messageDisplayElement.classList.add('show'); // 메시지를 보이게 한다.

        if (isError) {
            messageDisplayElement.classList.add('error'); // 에러 메시지라면 빨간색 스타일 적용
            console.warn(`[GameManager][ERROR_MSG] ${msg}`); // 콘솔에도 경고 로그
        } else {
            console.log(`[GameManager][INFO_MSG] ${msg}`); // 일반 메시지 로그
        }

        // 이전 타이머가 있다면 취소하고 새 타이머를 설정한다.
        if (GameManager.messageTimeout) {
            clearTimeout(GameManager.messageTimeout);
        }

        if (duration > 0) { // 특정 시간 후 메시지를 숨긴다.
            GameManager.messageTimeout = setTimeout(() => {
                messageDisplayElement.classList.remove('show');
            }, duration);
        } else if (duration === 0) { // 즉시 숨김
             messageDisplayElement.classList.remove('show');
        }
        // duration이 -1 이면 메시지를 계속 보여준다 (로딩 메시지 등에 활용)
    }

    // XSS 방지를 위한 HTML 이스케이프 헬퍼 함수
    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // === 게임 저장/불러오기 로직 (localStorage 활용) ===
    function saveGameState() {
        try {
            // 현재 게임 상태 객체를 JSON 문자열로 변환하여 localStorage에 저장한다.
            localStorage.setItem('room_trace_save', JSON.stringify(currentGameState));
            showMessage('시스템이 기록을 저장했다...');
            console.log('[GameManager] 게임 상태 저장 완료:', currentGameState);
        } catch (e) {
            showMessage('시스템 기록 저장 실패! 오류 코드: ' + e.message, true);
            console.error('[GameManager] 게임 저장 중 오류 발생:', e);
        }
    }

    function loadGameState() {
        try {
            const savedState = localStorage.getItem('room_trace_save');
            if (savedState) {
                // 저장된 상태를 불러와 currentGameState 객체에 병합한다.
                // JSON.parse는 오류가 발생할 수 있으므로 try-catch로 감싼다.
                const loadedState = JSON.parse(savedState);
                currentGameState = { ...currentGameState, ...loadedState }; // 현재 상태에 로드된 상태 병합
                showMessage('시스템이 기록을 불러왔다...');
                console.log('[GameManager] 게임 상태 불러오기 완료:', currentGameState);
                return true; // 불러오기 성공
            } else {
                // showMessage('시스템에 저장된 기록이 없다...', true); // main.js에서 호출하므로 여기선 생략
                console.log('[GameManager] 저장된 게임이 없습니다.');
                return false; // 저장된 게임 없음
            }
        } catch (e) {
            showMessage('시스템 기록 불러오기 실패! 기록 파일이 손상된 것 같다.', true);
            console.error('[GameManager] 게임 불러오기 중 오류 발생:', e);
            return false; // 불러오기 실패
        }
    }

    function resetGameState() {
        console.log('[GameManager] 게임 상태를 초기화한다...');
        currentGameState = { // 기본 초기 상태로 재설정
            currentRoomId: 'room-01',
            inventory: [],
            solvedPuzzles: {},
            unlockedDoors: {},
            roomSpecificData: {}
        };
        localStorage.removeItem('room_trace_save'); // 저장된 기록도 삭제
        showMessage('시스템이 모든 기록을 지웠다. 새로운 시작이다...');
    }

    // 외부에 노출할 함수들
    return {
        getCurrentRoomId,
        setCurrentRoomId,
        addSolvedPuzzle,
        isPuzzleSolved,
        unlockDoor,
        isDoorUnlocked,
        saveGameState,
        loadGameState,
        resetGameState,
        showMessage
    };
})();
