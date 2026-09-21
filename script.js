// ========================================
// SETTINGS
// ========================================

const CAMERA_COUNT = 7;


// ゲーム時間
// 00:00 → 05:00
// 現実時間 約10分

const GAME_END_MINUTES = 300;

const REAL_GAME_LENGTH =
    10 * 60 * 1000;


// ゲーム内1分 = 現実何msか

const GAME_MINUTE_MS =
    REAL_GAME_LENGTH /
    GAME_END_MINUTES;


// 最初の30分間は異常なし

const NO_ANOMALY_UNTIL = 30;


// 誤報告上限

const MAX_FALSE_REPORTS = 5;


// ========================================
// ANOMALIES
// ========================================
//
// normal
// → 通常カメラでしか見えない異常
//
// night
// → 暗視カメラでしか見えない異常
//
// ========================================

const anomalies = {

    1: {

        normal: [
            "01.jpg",
            "02.jpg"
        ],

        night: [
            "01.jpg"
        ]

    },


    2: {

        normal: [
            "01.jpg"
        ],

        night: [
            "01.jpg",
            "02.jpg"
        ]

    },


    3: {

        normal: [],

        night: [
            "01.jpg"
        ]

    },


    4: {

        normal: [
            "01.jpg"
        ],

        night: []

    },


    5: {

        normal: [],

        night: [
            "01.jpg"
        ]

    },


    6: {

        normal: [
            "01.jpg"
        ],

        night: []

    },


    7: {

        normal: [],

        night: [
            "01.jpg"
        ]

    }

};


// ========================================
// DOM
// ========================================

const startScreen =
    document.getElementById(
        "startScreen"
    );


const gameScreen =
    document.getElementById(
        "gameScreen"
    );


const startButton =
    document.getElementById(
        "startButton"
    );


const cameraImage =
    document.getElementById(
        "cameraImage"
    );


const cameraName =
    document.getElementById(
        "cameraName"
    );


const cameraNumber =
    document.getElementById(
        "cameraNumber"
    );


const cameraButtons =
    document.querySelectorAll(
        ".camButton"
    );


const reportButton =
    document.getElementById(
        "reportButton"
    );


const message =
    document.getElementById(
        "message"
    );


const gameTime =
    document.getElementById(
        "gameTime"
    );


const falseReportsDisplay =
    document.getElementById(
        "falseReports"
    );


const statusMessage =
    document.getElementById(
        "statusMessage"
    );


const nightIndicator =
    document.getElementById(
        "nightIndicator"
    );


// ========================================
// GAME STATE
// ========================================

let currentCamera = 1;

let nightVision = false;


// 現在発生している異常

let anomalyCamera = null;

let anomalyType = null;

let anomalyImage = null;


// タイマー

let anomalyTimer = null;

let gameTimeTimer = null;

let holdTimer = null;


// ゲーム時間

let gameMinutes = 0;


// 誤報告回数

let falseReports = 0;


// ゲーム状態

let gameStarted = false;


// ========================================
// AUDIO
// ========================================

const sounds = {

    camera:
        new Audio(
            "sounds/camera.mp3"
        ),

    nightOn:
        new Audio(
            "sounds/night_on.mp3"
        ),

    nightOff:
        new Audio(
            "sounds/night_off.mp3"
        ),

    holdStart:
        new Audio(
            "sounds/hold_start.mp3"
        ),

    holdLoop:
        new Audio(
            "sounds/hold_loop.mp3"
        ),

    success:
        new Audio(
            "sounds/report_success.mp3"
        ),

    failure:
        new Audio(
            "sounds/report_failure.mp3"
        )

};


// 音量

sounds.camera.volume = 0.5;

sounds.nightOn.volume = 0.5;

sounds.nightOff.volume = 0.5;

sounds.holdStart.volume = 0.5;

sounds.holdLoop.volume = 0.5;

sounds.success.volume = 0.6;

sounds.failure.volume = 0.5;


// ========================================
// SOUND
// ========================================

function playSound(sound) {

    sound.currentTime = 0;

    sound.play().catch(
        () => {}
    );

}


// ========================================
// START
// ========================================

startButton.addEventListener(
    "click",
    startGame
);


// ========================================
// START GAME
// ========================================

function startGame() {

    // ------------------------------------
    // 初期化
    // ------------------------------------

    currentCamera = 1;

    nightVision = false;

    anomalyCamera = null;

    anomalyType = null;

    anomalyImage = null;

    gameMinutes = 0;

    falseReports = 0;

    gameStarted = true;


    // ------------------------------------
    // 表示更新
    // ------------------------------------

    updateFalseReports();

    updateGameTime();

    updateCamera();


    // ------------------------------------
    // 最初の30分
    // ------------------------------------

    statusMessage.textContent =
        "最初の30分間は異常が発生しません。";

    statusMessage.classList.add(
        "warning"
    );


    startScreen.style.display =
        "none";

    gameScreen.style.display =
        "block";


    startButton.textContent =
        "START";


    // ------------------------------------
    // ゲーム時計開始
    // ------------------------------------

    startGameClock();

}


// ========================================
// GAME CLOCK
// ========================================

function startGameClock() {

    clearInterval(
        gameTimeTimer
    );


    gameTimeTimer =
        setInterval(
            () => {

                gameMinutes++;

                updateGameTime();


                // ==================================
                // 00:30
                // ==================================

                if (
                    gameMinutes ===
                    NO_ANOMALY_UNTIL
                ) {

                    statusMessage.textContent =
                        "通常監視を開始します。";

                    statusMessage.classList.remove(
                        "warning"
                    );


                    scheduleAnomaly();

                }


                // ==================================
                // 05:00
                // ==================================

                if (
                    gameMinutes >=
                    GAME_END_MINUTES
                ) {

                    gameClear();

                }

            },
            GAME_MINUTE_MS
        );

}


// ========================================
// GAME TIME DISPLAY
// ========================================

function updateGameTime() {

    const hours =
        Math.floor(
            gameMinutes / 60
        );


    const minutes =
        gameMinutes % 60;


    gameTime.textContent =

        `${String(hours)
            .padStart(2, "0")}:` +

        `${String(minutes)
            .padStart(2, "0")}`;

}


// ========================================
// FALSE REPORT DISPLAY
// ========================================

function updateFalseReports() {

    falseReportsDisplay.textContent =
        `${falseReports}/${MAX_FALSE_REPORTS}`;

}


// ========================================
// CAMERA BUTTONS
// ========================================

cameraButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const camera =
                    Number(
                        button.dataset.camera
                    );


                switchCamera(
                    camera
                );

            }
        );

    }
);


// ========================================
// CAMERA SWITCH
// ========================================

function switchCamera(camera) {

    if (
        camera ===
        currentCamera
    ) {

        return;

    }


    currentCamera =
        camera;


    playSound(
        sounds.camera
    );


    updateCamera();

}


// ========================================
// UPDATE CAMERA
// ========================================

function updateCamera() {

    // ------------------------------------
    // ボタン
    // ------------------------------------

    cameraButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );


            if (
                Number(
                    button.dataset.camera
                ) === currentCamera
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    // ------------------------------------
    // テキスト
    // ------------------------------------

    cameraName.textContent =
        `CAM ${currentCamera}`;


    cameraNumber.textContent =
        String(currentCamera)
            .padStart(2, "0");


    // ------------------------------------
    // 暗視表示
    // ------------------------------------

    if (nightVision) {

        nightIndicator
            .classList
            .remove(
                "hidden"
            );

    } else {

        nightIndicator
            .classList
            .add(
                "hidden"
            );

    }


    // ------------------------------------
    // 画像
    // ------------------------------------

    updateImage();

}


// ========================================
// UPDATE IMAGE
// ========================================

function updateImage() {

    // ------------------------------------
    // 異常が発生している場合
    // ------------------------------------

    if (
        anomalyCamera ===
        currentCamera
    ) {

        // 現在のモードと
        // 異常の種類が一致

        if (
            anomalyType ===
            (
                nightVision
                    ? "night"
                    : "normal"
            )
        ) {

            cameraImage.src =
                `images/anomaly/` +
                `cam${currentCamera}/` +
                `${anomalyType}/` +
                `${anomalyImage}`;


            return;

        }

    }


    // ------------------------------------
    // 通常画像
    // ------------------------------------

    if (nightVision) {

        cameraImage.src =
            `images/night/` +
            `cam${currentCamera}.jpg`;

    } else {

        cameraImage.src =
            `images/normal/` +
            `cam${currentCamera}.jpg`;

    }

}


// ========================================
// NIGHT VISION
// ========================================

function toggleNightVision() {

    nightVision =
        !nightVision;


    if (nightVision) {

        playSound(
            sounds.nightOn
        );

    } else {

        playSound(
            sounds.nightOff
        );

    }


    updateCamera();

}


// ========================================
// KEYBOARD
// ========================================

document.addEventListener(
    "keydown",
    event => {

        if (!gameStarted) {

            return;

        }


        const key =
            event.key.toLowerCase();


        // --------------------------------
        // A / ←
        // --------------------------------

        if (
            key === "a" ||
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();


            let nextCamera =
                currentCamera - 1;


            if (
                nextCamera < 1
            ) {

                nextCamera =
                    CAMERA_COUNT;

            }


            switchCamera(
                nextCamera
            );

        }


        // --------------------------------
        // D / →
        // --------------------------------

        if (
            key === "d" ||
            event.key === "ArrowRight"
        ) {

            event.preventDefault();


            let nextCamera =
                currentCamera + 1;


            if (
                nextCamera >
                CAMERA_COUNT
            ) {

                nextCamera = 1;

            }


            switchCamera(
                nextCamera
            );

        }


        // --------------------------------
        // W
        // --------------------------------

        if (
            key === "w" &&
            !event.repeat
        ) {

            toggleNightVision();

        }

    }
);


// ========================================
// SCHEDULE ANOMALY
// ========================================

function scheduleAnomaly() {

    clearTimeout(
        anomalyTimer
    );


    // 00:30前は異常なし

    if (
        gameMinutes <
        NO_ANOMALY_UNTIL
    ) {

        return;

    }


    // 05:00以降は異常なし

    if (
        gameMinutes >=
        GAME_END_MINUTES
    ) {

        return;

    }


    // 5～15秒後

    const delay =
        random(
            5000,
            15000
        );


    anomalyTimer =
        setTimeout(
            () => {

                if (
                    gameMinutes >=
                    NO_ANOMALY_UNTIL &&

                    gameMinutes <
                    GAME_END_MINUTES
                ) {

                    createAnomaly();

                }

            },
            delay
        );

}


// ========================================
// CREATE ANOMALY
// ========================================

function createAnomaly() {

    // すでに異常があるなら
    // 新しい異常を出さない

    if (
        anomalyCamera !== null
    ) {

        scheduleAnomaly();

        return;

    }


    const possible = [];


    // ------------------------------------
    // 異常候補を作る
    // ------------------------------------

    for (
        let camera = 1;
        camera <= CAMERA_COUNT;
        camera++
    ) {

        const data =
            anomalies[camera];


        // 通常異常

        if (
            data.normal &&
            data.normal.length > 0
        ) {

            possible.push({

                camera:
                    camera,

                type:
                    "normal"

            });

        }


        // 暗視異常

        if (
            data.night &&
            data.night.length > 0
        ) {

            possible.push({

                camera:
                    camera,

                type:
                    "night"

            });

        }

    }


    if (
        possible.length === 0
    ) {

        return;

    }


    // ------------------------------------
    // ランダム選択
    // ------------------------------------

    const selected =
        possible[
            Math.floor(
                Math.random() *
                possible.length
            )
        ];


    anomalyCamera =
        selected.camera;


    anomalyType =
        selected.type;


    const imageList =
        anomalies[
            anomalyCamera
        ][
            anomalyType
        ];


    anomalyImage =
        imageList[
            Math.floor(
                Math.random() *
                imageList.length
            )
        ];


    // ------------------------------------
    // 現在のカメラなら即表示
    // ------------------------------------

    updateImage();


    console.log(
        "ANOMALY:",
        anomalyCamera,
        anomalyType,
        anomalyImage
    );

}


// ========================================
// REPORT START
// ========================================

function startReport() {

    if (!gameStarted) {

        return;

    }


    reportButton.classList.add(
        "holding"
    );


    message.textContent =
        "REPORTING...";


    // 開始音

    playSound(
        sounds.holdStart
    );


    // ループ音

    sounds.holdLoop.currentTime =
        0;

    sounds.holdLoop.loop =
        true;


    sounds.holdLoop.play().catch(
        () => {}
    );


    // 1.2秒長押し

    holdTimer =
        setTimeout(
            () => {

                reportAnomaly();

            },
            1200
        );

}


// ========================================
// REPORT CANCEL
// ========================================

function cancelReport() {

    clearTimeout(
        holdTimer
    );


    reportButton.classList.remove(
        "holding"
    );


    sounds.holdLoop.pause();

    sounds.holdLoop.currentTime =
        0;


    if (
        message.textContent ===
        "REPORTING..."
    ) {

        message.textContent =
            "";

    }

}


// ========================================
// REPORT ANOMALY
// ========================================

function reportAnomaly() {

    reportButton.classList.remove(
        "holding"
    );


    sounds.holdLoop.pause();

    sounds.holdLoop.currentTime =
        0;


    // ====================================
    // 正解
    // ====================================

    if (

        anomalyCamera !== null &&

        anomalyCamera ===
            currentCamera &&

        anomalyType ===
            (
                nightVision
                    ? "night"
                    : "normal"
            )

    ) {

        // 成功音

        playSound(
            sounds.success
        );


        message.textContent =
            "異常を検知しました。";


        // --------------------------------
        // 異常を消す
        // --------------------------------

        anomalyCamera =
            null;

        anomalyType =
            null;

        anomalyImage =
            null;


        updateImage();


        // --------------------------------
        // ★ 誤報告回数を0に戻す
        // --------------------------------

        falseReports =
            0;


        updateFalseReports();


        // --------------------------------
        // 次の異常
        // --------------------------------

        scheduleAnomaly();

    }


    // ====================================
    // 誤報告
    // ====================================

    else {

        // 誤報告音

        playSound(
            sounds.failure
        );


        // --------------------------------
        // ★ 1増やす
        // --------------------------------

        falseReports++;


        // --------------------------------
        // ★ 表示更新
        //
        // 0/5
        // ↓
        // 1/5
        // ↓
        // 2/5
        // ...
        // --------------------------------

        updateFalseReports();


        message.textContent =
            "誤報告です。";


        // --------------------------------
        // 5回到達
        // --------------------------------

        if (
            falseReports >=
            MAX_FALSE_REPORTS
        ) {

            gameOver();

            return;

        }

    }


    // メッセージを消す

    setTimeout(
        () => {

            message.textContent =
                "";

        },
        2000
    );

}


// ========================================
// REPORT BUTTON - MOUSE
// ========================================

reportButton.addEventListener(
    "mousedown",
    startReport
);


reportButton.addEventListener(
    "mouseup",
    cancelReport
);


reportButton.addEventListener(
    "mouseleave",
    cancelReport
);


// ========================================
// REPORT BUTTON - TOUCH
// ========================================

reportButton.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();

        startReport();

    }
);


reportButton.addEventListener(
    "touchend",
    event => {

        event.preventDefault();

        cancelReport();

    }
);


// ========================================
// GAME OVER
// ========================================

function gameOver() {

    clearInterval(
        gameTimeTimer
    );

    clearTimeout(
        anomalyTimer
    );


    gameStarted =
        false;


    message.textContent =
        "監視失敗";


    setTimeout(
        () => {

            gameScreen.style.display =
                "none";


            startScreen.style.display =
                "flex";


            startButton.textContent =
                "RETRY";


            statusMessage.textContent =
                "";

        },
        2500
    );

}


// ========================================
// GAME CLEAR
// ========================================

function gameClear() {

    clearInterval(
        gameTimeTimer
    );

    clearTimeout(
        anomalyTimer
    );


    gameStarted =
        false;


    gameMinutes =
        GAME_END_MINUTES;


    updateGameTime();


    message.textContent =
        "監視終了";


    setTimeout(
        () => {

            gameScreen.style.display =
                "none";


            startScreen.style.display =
                "flex";


            startButton.textContent =
                "CLEAR";

        },
        3000
    );

}


// ========================================
// RANDOM
// ========================================

function random(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}