// js/data_loader.js - 모든 게임 데이터를 비동기적으로 불러오는 역할을 수행한다.

const DataLoader = (() => {
    // 지정된 경로에서 JSON 파일을 불러오는 핵심 비동기 함수
    async function loadJSON(filePath) {
        try {
            const response = await fetch(filePath); // 파일을 가져온다
            if (!response.ok) { // HTTP 응답이 성공적이지 않다면
                // 이 빌어먹을 오류 메시지를 똑바로 뱉어라!
                throw new Error(`[DataLoader] JSON 로드 실패! ${filePath}: ${response.status} ${response.statusText}`);
            }
            return await response.json(); // JSON 형태로 파싱하여 반환
        } catch (error) {
            console.error(`[DataLoader] ${filePath} 로딩 중 치명적인 오류 발생:`, error);
            // 오류 발생 시 null 반환 또는 오류 재throw
            throw error; // 오류를 다시 던져서 main.js에서 처리하도록 한다
        }
    }

    // 게임 시작 시 필요한 모든 핵심 데이터를 한 번에 불러오는 함수
    async function loadAllGameData() {
        console.log('[DataLoader] 모든 게임 데이터 로딩 시작...');
        try {
            // Promise.all을 사용하여 여러 파일을 동시에 비동기적으로 로드하여 성능을 최적화한다.
            // basic_rooms.json: 게임의 모든 방에 대한 정의
            // puzzle_definitions.json: 모든 퍼즐의 정답, 힌트 등 상세 정의
            const [rooms, puzzles] = await Promise.all([
                loadJSON('data/rooms/basic_rooms.json'),
                loadJSON('data/puzzles/puzzle_definitions.json')
                // 나중에 random_templates.json, story_events.json, room_packs 등도 여기에 추가한다.
                // 예: loadJSON('data/rooms/random_templates.json'),
                // 예: loadJSON('data/rooms/story_events.json'),
                // 예: loadJSON('data/room_packs/room_pack_01.json')
            ]);

            console.log('[DataLoader] 모든 핵심 데이터 로딩 완료!');
            return { rooms, puzzles }; // 불러온 데이터를 객체 형태로 반환
        } catch (error) {
            console.error('[DataLoader] 모든 게임 데이터 로딩 중 오류 발생:', error);
            throw new Error(`[DataLoader] 필수 게임 데이터 로드 실패: ${error.message}`);
        }
    }

    // 외부에 노출할 함수들 (캡슐화 패턴)
    return {
        loadJSON,
        loadAllGameData
    };
})();
