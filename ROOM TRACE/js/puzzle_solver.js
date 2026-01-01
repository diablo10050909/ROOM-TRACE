// js/puzzle_solver.js - 퍼즐의 정의를 관리하고, 플레이어의 정답을 검증하는 역할을 수행한다.

const PuzzleSolver = (() => {
    // 모든 퍼즐 정의를 저장할 객체. DataLoader에서 불러온 데이터로 초기화된다.
    let allPuzzles = {};

    // DataLoader로부터 받은 모든 퍼즐 정의 데이터를 설정한다.
    function setAllPuzzles(puzzles) {
        allPuzzles = puzzles;
        console.log(`[PuzzleSolver] ${Object.keys(allPuzzles).length}개의 퍼즐 정의 로드 완료.`);
    }

    // 주어진 퍼즐 ID와 플레이어의 입력값을 비교하여 정답 여부를 판별한다.
    function checkAnswer(puzzleId, playerAnswer) {
        const puzzle = allPuzzles[puzzleId]; // 해당 ID의 퍼즐 정의를 가져온다.

        if (!puzzle) {
            console.warn(`[PuzzleSolver] 퍼즐 ID "${puzzleId}"를 찾을 수 없다. 퍼즐 정의 파일에 이 퍼즐이 있는가?`);
            return { correct: false, message: "알 수 없는 퍼즐이다. 시스템이 인식할 수 없다..." };
        }

        // 플레이어의 답과 정답을 대소문자 구분 없이 비교한다.
        // trim()으로 앞뒤 공백 제거는 기본이다!
        if (playerAnswer.trim().toUpperCase() === puzzle.correctAnswer.toUpperCase()) {
            GameManager.addSolvedPuzzle(puzzleId); // GameManager에 이 퍼즐이 해결되었다고 기록한다.
            console.log(`[PuzzleSolver] 퍼즐 "${puzzleId}" 정답 확인!`);
            return { correct: true, message: "정답이다! 시스템이 다음 흔적을 열었다." };
        } else {
            console.log(`[PuzzleSolver] 퍼즐 "${puzzleId}" 오답! 입력: "${playerAnswer}"`);
            return { correct: false, message: "틀렸다. 시스템이 오답을 거부한다." };
        }
    }

    // 퍼즐 ID에 해당하는 질문, 힌트 등 퍼즐의 상세 정보를 반환한다.
    function getPuzzleInfo(puzzleId) {
        return allPuzzles[puzzleId];
    }

    // 외부에 노출할 함수들
    return {
        setAllPuzzles,
        checkAnswer,
        getPuzzleInfo
    };
})();
