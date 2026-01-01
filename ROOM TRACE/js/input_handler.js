// js/input_handler.js - 플레이어의 모든 입력을 감지하고, 해당 로직을 처리하는 콜백 함수를 호출한다.

const InputHandler = (() => {
    // === 콜백 함수 저장소 ===
    // main.js에서 제공하는 이벤트 핸들러 함수들을 저장한다.
    let callbacks = {
        onObjectClick: null,
        onDoorClick: null,
        onSubmitButtonClick: null,
        onSaveButtonClick: null,
        onLoadButtonClick: null,
        onWASDMove: null // WASD 이동용 (추후 구현 시 사용)
    };

    // === 초기화 함수 ===
    // main.js로부터 이벤트 처리 콜백 함수들을 받아와 내부 callbacks 객체에 등록한다.
    function init(cb) {
        console.log('[InputHandler] 이벤트 리스너 초기화 시작...');
        callbacks = { ...callbacks, ...cb }; // 전달받은 콜백 함수들로 업데이트

        // === 이벤트 위임을 통한 방 내부 요소 처리 ===
        // #room-display 요소에 클릭 리스너를 단 한 번만 등록한다.
        // 동적으로 생성되는 방 오브젝트나 문에도 이벤트를 감지할 수 있다.
        document.getElementById('room-display').addEventListener('click', (event) => {
            const target = event.target; // 클릭된 실제 요소

            if (target.classList.contains('room-object') && callbacks.onObjectClick) {
                // 클릭된 요소가 .room-object 클래스를 가지고 있다면 오브젝트 클릭 콜백 호출
                callbacks.onObjectClick(target.id, target.dataset.puzzleId);
            } else if (target.classList.contains('room-door') && callbacks.onDoorClick) {
                // 클릭된 요소가 .room-door 클래스를 가지고 있다면 문 클릭 콜백 호출
                callbacks.onDoorClick(target.id);
            }
        });

        // === UI 버튼 이벤트 처리 ===
        // 정답 제출 버튼
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.addEventListener('click', () => {
                const answerInput = document.getElementById('answer-input');
                if (callbacks.onSubmitButtonClick) {
                    callbacks.onSubmitButtonClick(answerInput.value);
                    answerInput.value = ''; // 입력창은 제출 후 항상 비워준다.
                }
            });
        }

        // 게임 저장 버튼
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                if (callbacks.onSaveButtonClick) {
                    callbacks.onSaveButtonClick();
                }
            });
        }

        // 게임 불러오기 버튼
        const loadButton = document.getElementById('load-button');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                if (callbacks.onLoadButtonClick) {
                    callbacks.onLoadButtonClick();
                }
                document.getElementById('answer-input').focus(); // 로드 후 입력창에 포커스
            });
        }


        // === WASD 이동 입력 (추후 구현) ===
        document.addEventListener('keydown', (event) => {
            // 입력창이 포커스되어 있을 때는 게임 이동 입력을 받지 않는다.
            if (document.activeElement === document.getElementById('answer-input')) {
                return;
            }

            if (callbacks.onWASDMove) {
                const key = event.key.toLowerCase();
                if (['w', 'a', 's', 'd'].includes(key)) {
                    // console.log(`[InputHandler] WASD 입력 감지: ${key}`);
                    // callbacks.onWASDMove(key); // 나중에 콜백 호출
                }
            }
        });

        console.log('[InputHandler] 이벤트 리스너 초기화 완료.');
    }

    // 외부에 노출할 함수들
    return {
        init
    };
})();
