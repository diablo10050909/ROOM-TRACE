// js/main.js - ROOM : TRACE 게임의 심장부. 모든 모듈을 조율하고 게임 흐름을 제어한다.

// DOMContentLoaded 이벤트는 HTML 문서가 완전히 로드되고 파싱되었을 때 발생한다.
// 모든 스크립트 실행은 이 이벤트 이후에 시작되어야 안전하다.
document.addEventListener('DOMContentLoaded', async () => {
    // === 게임 전역 데이터 및 상태 ===
    let allGameData = {}; // DataLoader를 통해 불러올 모든 게임 데이터 (방, 퍼즐 정의 등)

    // === 핵심 게임 로직 초기화 함수 ===
    async function initGame() {
        console.log('[main.js] 게임 초기화 시작...');

        // 1. 모든 게임 데이터 로드
        try {
            GameManager.showMessage('시스템 데이터 로드 중...', false, 9999); // 로딩 메시지 고정
            allGameData = await DataLoader.loadAllGameData();
            if (!allGameData.rooms || !allGameData.puzzles) {
                throw new Error('핵심 게임 데이터(방 또는 퍼즐)를 불러오지 못했다. 파일을 확인해라!');
            }
            PuzzleSolver.setAllPuzzles(allGameData.puzzles); // PuzzleSolver에 퍼즐 정의 주입
            GameManager.showMessage('데이터 로드 완료. 시스템 준비 완료!');
            console.log('[main.js] 모든 게임 데이터 불러오기 완료:', allGameData);
        } catch (error) {
            GameManager.showMessage(`데이터 로드 실패: ${error.message}. 시스템이 붕괴된다...`, true, 9999);
            console.error('[main.js] 데이터 로드 중 치명적인 오류 발생:', error);
            return; // 데이터 로드 실패 시 더 이상 게임 진행 불가
        }

        // 2. 게임 상태 로드 또는 초기화
        const loadSuccess = GameManager.loadGameState(); // 저장된 게임이 있는지 시도
        if (!loadSuccess) {
            GameManager.showMessage('저장된 기록이 없다. 새로운 게임을 시작한다...');
            GameManager.resetGameState(); // 없으면 초기 상태로 시작
        }

        // 3. 현재 방 렌더링 및 이벤트 리스너 바인딩
        renderCurrentRoom();

        console.log('[main.js] 게임 초기화 완료.');
    }

    // === 방 렌더링 및 이벤트 바인딩 ===
    // 현재 게임 상태(GameManager)에 따라 방을 렌더링하고 모든 이벤트 리스너를 다시 설정한다.
    function renderCurrentRoom() {
        const currentRoomId = GameManager.getCurrentRoomId();
        const roomData = allGameData.rooms[currentRoomId];

        if (!roomData) {
            GameManager.showMessage(`알 수 없는 방 ID: ${currentRoomId}. 시스템 오류.`, true);
            console.error(`[main.js] Room data not found for ID: ${currentRoomId}`);
            return;
        }

        RoomRenderer.renderRoom(roomData); // RoomRenderer를 이용해 방을 화면에 그린다.
        bindRoomEventListeners(); // 동적으로 생성된 요소들에 이벤트 리스너를 다시 연결한다.
        GameManager.showMessage(`현재: ${roomData.title}`); // 현재 방 정보를 표시.
        console.log(`[main.js] 방 렌더링 완료: ${roomData.title} (${currentRoomId})`);
    }

    // === 이벤트 리스너 바인딩 ===
    // InputHandler를 통해 모든 UI 및 방 내부 오브젝트의 이벤트를 처리한다.
    function bindRoomEventListeners() {
        InputHandler.init({
            onObjectClick: handleObjectClick,
            onDoorClick: handleDoorClick,
            onSubmitButtonClick: handleSubmitAnswer,
            onSaveButtonClick: handleSaveGame,
            onLoadButtonClick: handleLoadGame
            // 여기에 WASD 이동 로직이 추가되면 onWASDMove 콜백도 추가할 수 있다.
        });
        console.log('[main.js] 이벤트 리스너 바인딩 완료.');
    }

    // === 이벤트 핸들러 함수들 (플레이어의 행동을 처리) ===

    // 룸 오브젝트 클릭 시 처리 (data-puzzle-id에 연결된 퍼즐 정보 표시)
    function handleObjectClick(objectId, puzzleId) {
        console.log(`[main.js] 오브젝트 클릭: ${objectId}, 관련 퍼즐 ID: ${puzzleId}`);
        if (GameManager.isPuzzleSolved(puzzleId)) {
            GameManager.showMessage('이미 해결된 퍼즐이다. 새로운 것은 없다.');
            return;
        }

        const puzzleInfo = PuzzleSolver.getPuzzleInfo(puzzleId);
        if (puzzleInfo) {
            GameManager.showMessage(`[단서 발견] ${escapeHTML(puzzleInfo.question)} (힌트: ${escapeHTML(puzzleInfo.hint)})`);
            // 여기서 GameManager.addInventoryItem(clue) 같은 로직으로 인벤토리에 단서를 추가할 수 있다.
        } else {
            GameManager.showMessage("이것은 평범한 오브젝트다. 아무것도 없다...", true);
        }
    }

    // 방의 문 클릭 시 처리 (잠금 상태 확인 및 이동 시도)
    function handleDoorClick(doorId) {
        console.log(`[main.js] 문 클릭: ${doorId}`);
        const currentRoomId = GameManager.getCurrentRoomId();
        const roomData = allGameData.rooms[currentRoomId];

        if (!roomData || roomData.door.id !== doorId) {
            GameManager.showMessage('알 수 없는 문이다...', true);
            return;
        }

        if (GameManager.isDoorUnlocked(doorId)) {
            GameManager.showMessage('문이 열려있다. 다음 공간으로 이동한다...');
            // 실제 다음 방으로 이동 로직 호출
            setTimeout(() => {
                moveToNextRoom();
            }, 1000); // 메시지 보여준 후 잠시 딜레이
        } else {
            GameManager.showMessage('문이 잠겨있다. 흔적을 찾아 답을 해라.', true);
        }
    }

    // 정답 입력 및 제출 버튼 클릭 시 처리
    async function handleSubmitAnswer(playerAnswer) {
        console.log(`[main.js] 정답 제출 시도: "${playerAnswer}"`);
        const currentRoomId = GameManager.getCurrentRoomId();
        const roomData = allGameData.rooms[currentRoomId];

        if (!roomData || !roomData.door.answer) {
            GameManager.showMessage('여기서는 정답을 입력할 수 없다.', true);
            return;
        }

        // 퍼즐 해결기를 이용해 방 탈출 정답을 검증한다.
        // 이 로직은 나중에 각 개별 퍼즐을 해결하는 데도 사용될 수 있다.
        const { correct, message } = PuzzleSolver.checkAnswer(roomData.door.id, playerAnswer); // 문 ID를 퍼즐 ID로 활용
        GameManager.showMessage(message, !correct);

        if (correct) {
            GameManager.unlockDoor(roomData.door.id); // GameManager에 문 잠금 해제 기록
            renderCurrentRoom(); // 문 상태 변경을 위해 방을 다시 렌더링
        }
    }

    // 게임 저장 버튼 클릭 시
    function handleSaveGame() {
        console.log('[main.js] 게임 저장 버튼 클릭');
        GameManager.saveGameState();
    }

    // 게임 불러오기 버튼 클릭 시
    function handleLoadGame() {
        console.log('[main.js] 게임 불러오기 버튼 클릭');
        if (GameManager.loadGameState()) {
            renderCurrentRoom(); // 불러오기 성공 시 현재 방 다시 렌더링
        }
    }

    // === 다음 방으로 이동하는 로직 (핵심 확장 지점) ===
    function moveToNextRoom() {
        console.log('[main.js] 다음 방으로 이동...');
        const currentRoomId = GameManager.getCurrentRoomId();
        let nextRoomId;

        // 임시 로직: 기본 방 팩에서 다음 순서 방으로 이동
        // 실제로는 GameManager가 어떤 방식으로 다음 방을 결정할지 로직이 필요.
        // 예를 들어, basic_rooms.json의 키를 순회하거나, random_templates를 사용.
        const roomKeys = Object.keys(allGameData.rooms);
        const currentIndex = roomKeys.indexOf(currentRoomId);

        if (currentIndex !== -1 && currentIndex < roomKeys.length - 1) {
            nextRoomId = roomKeys[currentIndex + 1]; // 다음 방 ID
        } else {
            // 더 이상 미리 정의된 방이 없다면 (이때 RoomGenerator가 활약!)
            GameManager.showMessage('더 이상 미리 정의된 방이 없다. 새로운 미로를 생성한다...', false, 3000);
            // 이곳에서 RoomGenerator.generateRandomRoom() 등을 호출해야 한다.
            // 하지만 현재는 RoomGenerator가 비어있으므로, 일단 다시 첫 방으로 돌려보낸다.
            nextRoomId = 'room-01'; // 임시로 다시 첫 방으로 이동시키거나 게임 끝!
            GameManager.showMessage('미로의 끝에 도달했거나, 시작점으로 회귀한다...', false);
        }

        GameManager.setCurrentRoomId(nextRoomId); // GameManager의 현재 방 ID 업데이트
        renderCurrentRoom(); // 새로운 방 렌더링
    }

    // === XSS 방지를 위한 HTML 이스케이프 유틸리티 ===
    // GameManager.showMessage에서도 사용되며, 잠재적인 스크립트 삽입 공격을 방지한다.
    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // === 게임 시작 ===
    initGame();
});
