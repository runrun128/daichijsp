/* =========================================================
   JSP PARODY
   Surveillance Horror Game
========================================================= */


/* =========================================================
   GAME SETTINGS
========================================================= */

const CAMERA_COUNT = 7;

const GAME_END_MINUTES = 300;

// 10分 = 600秒
const REAL_GAME_LENGTH = 10 * 60 * 1000;

// 300 game minutesを10分で進める
// 1 game minute = 2秒
const GAME_MINUTE_MS =
    REAL_GAME_LENGTH / GAME_END_MINUTES;

// 最初の30分間は異変なし
const NO_ANOMALY_UNTIL = 30;

// 誤報5回でゲームオーバー
const MAX_FALSE_REPORTS = 5;

// 報告長押し時間
const REPORT_HOLD_TIME = 1200;

// 報告演出
const REPORT_SCREEN_TIME = 2000;

// 危険異変の制限時間
const DANGER_TIME_LIMIT = 10000;


/* =========================================================
   GAME STATE
========================================================= */

let currentCamera = 1;

let nightVision = false;

let gameMinutes = 0;

let falseReports = 0;

let gameRunning = false;

let gameEnded = false;


/* =========================================================
   ANOMALY STATE
========================================================= */

// 通常異変
let normalAnomalyActive = false;

let normalAnomalyCamera = null;

let normalAnomalyFile = null;

let normalAnomalyMode = null;

let normalAnomalyTimer = null;


// 危険異変
let dangerAnomalyActive = false;

let dangerAnomalyCamera = null;

let dangerAnomalyFile = null;

let dangerAnomalyTimer = null;

let dangerTimeoutTimer = null;


/* =========================================================
   REPORT STATE
========================================================= */

let reportHolding = false;

let reportTimer = null;

let holdLoopAudio = null;


/* =========================================================
   OTHER TIMERS
========================================================= */

let gameClockTimer = null;

let nextAnomalyTimer = null;

let reportScreenTimer = null;


/* =========================================================
   ELEMENTS
========================================================= */

const startScreen =
    document.getElementById("startScreen");

const gameScreen =
    document.getElementById("gameScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const clearScreen =
    document.getElementById("clearScreen");

const reportScreen =
    document.getElementById("reportScreen");


const startButton =
    document.getElementById("startButton");

const retryButton =
    document.getElementById("retryButton");

const clearButton =
    document.getElementById("clearButton");


const cameraImage =
    document.getElementById("cameraImage");

const dangerVideo =
    document.getElementById("dangerVideo");


const cameraName =
    document.getElementById("cameraName");

const cameraNumber =
    document.getElementById("cameraNumber");

const gameTime =
    document.getElementById("gameTime");

const falseReportsDisplay =
    document.getElementById("falseReports");

const status =
    document.getElementById("status");

const nightIndicator =
    document.getElementById("nightIndicator");


const prevCameraButton =
    document.getElementById("prevCamera");

const nextCameraButton =
    document.getElementById("nextCamera");

const reportButton =
    document.getElementById("reportButton");


/* =========================================================
   SOUNDS
========================================================= */

const cameraSound =
    new Audio("sounds/camera.mp3");

const nightOnSound =
    new Audio("sounds/night_on.mp3");

const nightOffSound =
    new Audio("sounds/night_off.mp3");

const reportSuccessSound =
    new Audio("sounds/report_success.mp3");

const reportFailureSound =
    new Audio("sounds/report_failure.mp3");

const holdStartSound =
    new Audio("sounds/hold_start.mp3");

const heartbeatSound =
    new Audio("sounds/heartbeat.mp3");


// 長押しループ
holdLoopAudio =
    new Audio("sounds/hold_loop.mp3");

holdLoopAudio.loop = true;


// 環境音
const environmentSounds = {

    1: new Audio("sounds/env_cam1.mp3"),

    2: new Audio("sounds/env_cam2.mp3"),

    3: new Audio("sounds/env_cam3.mp3"),

    4: new Audio("sounds/env_cam4.mp3"),

    5: new Audio("sounds/env_cam5.mp3"),

    6: new Audio("sounds/env_cam6.mp3"),

    7: new Audio("sounds/env_cam7.mp3")

};


Object.values(environmentSounds).forEach(sound => {

    sound.loop = true;

    sound.volume = 0.5;

});


heartbeatSound.loop = true;

heartbeatSound.volume = 0.8;


/* =========================================================
   ANOMALY DATA
========================================================= */

/*
    通常異変

    normal:
        通常モードで出る画像

    night:
        ナイトビジョンで出る画像
*/


const normalAnomalies = {

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


/*
    危険異変

    動画ファイルを置くだけ。

    例:

    danger/cam1/01.mp4

*/

const dangerAnomalies = {

    1: [
        "01.mp4"
    ],

    2: [
        "01.mp4"
    ],

    3: [
        "01.mp4"
    ],

    4: [
        "01.mp4"
    ],

    5: [
        "01.mp4"
    ],

    6: [
        "01.mp4"
    ],

    7: [
        "01.mp4"
    ]

};


/* =========================================================
   UTILITY
========================================================= */

function randomItem(array) {

    if (!array || array.length === 0) {
        return null;
    }

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];
}


function formatTime(minutes) {

    const minute =
        Math.floor(minutes / 60);

    const second =
        minutes % 60;

    return (
        String(minute).padStart(2, "0")
        +
        ":"
        +
        String(second).padStart(2, "0")
    );
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    // 全状態リセット
    currentCamera = 1;

    nightVision = false;

    gameMinutes = 0;

    falseReports = 0;

    gameRunning = true;

    gameEnded = false;


    // 異変リセット
    normalAnomalyActive = false;

    normalAnomalyCamera = null;

    normalAnomalyFile = null;

    normalAnomalyMode = null;


    dangerAnomalyActive = false;

    dangerAnomalyCamera = null;

    dangerAnomalyFile = null;


    // タイマー停止
    clearTimeout(nextAnomalyTimer);

    clearTimeout(normalAnomalyTimer);

    clearTimeout(dangerTimeoutTimer);

    clearTimeout(reportScreenTimer);

    clearInterval(gameClockTimer);


    // 危険状態解除
    document.body.classList.remove("danger-mode");


    // 動画停止
    dangerVideo.pause();

    dangerVideo.removeAttribute("src");

    dangerVideo.load();

    dangerVideo.style.display = "none";


    // 表示更新
    updateFalseReports();

    updateGameTime();

    updateCameraImage();

    updateCameraUI();


    // 画面
    startScreen.classList.remove("active");

    gameOverScreen.classList.remove("active");

    clearScreen.classList.remove("active");

    gameScreen.classList.add("active");


    status.textContent =
        "最初の30分間は異変が発生しません。";


    // 環境音
    changeEnvironmentSound(currentCamera);


    // ゲーム時計開始
    gameClockTimer = setInterval(
        advanceGameTime,
        GAME_MINUTE_MS
    );

}


/* =========================================================
   GAME CLOCK
========================================================= */

function advanceGameTime() {

    if (!gameRunning || gameEnded) {
        return;
    }


    gameMinutes++;

    updateGameTime();


    // 05:00
    if (gameMinutes >= GAME_END_MINUTES) {

        gameClear();

        return;
    }


    // 00:30になった瞬間
    if (gameMinutes === NO_ANOMALY_UNTIL) {

        status.textContent =
            "異変の監視を開始します。";


        scheduleNextAnomaly();

    }

}


/* =========================================================
   GAME TIME DISPLAY
========================================================= */

function updateGameTime() {

    gameTime.textContent =
        formatTime(gameMinutes);

}


/* =========================================================
   CAMERA
========================================================= */

function changeCamera(direction) {

    if (!gameRunning || gameEnded) {
        return;
    }


    // 危険異変中は移動禁止
    if (dangerAnomalyActive) {

        status.textContent =
            "ERROR : CAMERA LOCKED";

        return;
    }


    currentCamera += direction;


    if (currentCamera < 1) {
        currentCamera = CAMERA_COUNT;
    }


    if (currentCamera > CAMERA_COUNT) {
        currentCamera = 1;
    }


    cameraSound.currentTime = 0;

    cameraSound.play().catch(() => {});


    updateCameraImage();

    updateCameraUI();

    changeEnvironmentSound(currentCamera);

}


/* =========================================================
   CAMERA IMAGE
========================================================= */

function updateCameraImage() {

    /*
        危険異変中は動画を優先
    */

    if (dangerAnomalyActive) {
        return;
    }


    /*
        通常異変が現在カメラにある場合
    */

    if (
        normalAnomalyActive &&
        normalAnomalyCamera === currentCamera &&
        normalAnomalyMode === getCurrentMode()
    ) {

        cameraImage.src =
            `anomaly/normal/cam${currentCamera}/${normalAnomalyFile}`;

        return;
    }


    /*
        通常画像
    */

    if (nightVision) {

        cameraImage.src =
            `images/night/cam${currentCamera}.jpg`;

    } else {

        cameraImage.src =
            `images/normal/cam${currentCamera}.jpg`;

    }

}


/* =========================================================
   CAMERA UI
========================================================= */

function updateCameraUI() {

    const number =
        String(currentCamera).padStart(2, "0");


    cameraName.textContent =
        `CAM ${number}`;


    cameraNumber.textContent =
        number;


    if (nightVision) {

        nightIndicator.classList.add("active");

    } else {

        nightIndicator.classList.remove("active");

    }

}


/* =========================================================
   NIGHT VISION
========================================================= */

function toggleNightVision() {

    if (!gameRunning || gameEnded) {
        return;
    }


    nightVision = !nightVision;


    if (nightVision) {

        nightOnSound.currentTime = 0;

        nightOnSound.play().catch(() => {});

    } else {

        nightOffSound.currentTime = 0;

        nightOffSound.play().catch(() => {});

    }


    updateCameraImage();

    updateCameraUI();

}


/* =========================================================
   CURRENT MODE
========================================================= */

function getCurrentMode() {

    return nightVision
        ? "night"
        : "normal";

}


/* =========================================================
   ENVIRONMENT SOUND
========================================================= */

function changeEnvironmentSound(camera) {

    Object.values(environmentSounds)
        .forEach(sound => {

            sound.pause();

            sound.currentTime = 0;

        });


    const sound =
        environmentSounds[camera];


    if (!sound) {
        return;
    }


    sound.currentTime = 0;

    sound.play().catch(() => {});

}


/* =========================================================
   ANOMALY SCHEDULER
========================================================= */

function scheduleNextAnomaly() {

    if (!gameRunning || gameEnded) {
        return;
    }


    if (gameMinutes < NO_ANOMALY_UNTIL) {
        return;
    }


    if (gameMinutes >= GAME_END_MINUTES) {
        return;
    }


    if (
        normalAnomalyActive ||
        dangerAnomalyActive
    ) {
        return;
    }


    clearTimeout(nextAnomalyTimer);


    /*
        5〜15秒後
    */

    const delay =
        5000 +
        Math.random() * 10000;


    nextAnomalyTimer =
        setTimeout(
            createRandomAnomaly,
            delay
        );

}


/* =========================================================
   CREATE RANDOM ANOMALY
========================================================= */

function createRandomAnomaly() {

    if (!gameRunning || gameEnded) {
        return;
    }


    if (
        normalAnomalyActive ||
        dangerAnomalyActive
    ) {
        return;
    }


    /*
        カメラをランダム選択
    */

    const camera =
        Math.floor(
            Math.random() * CAMERA_COUNT
        ) + 1;


    /*
        20%くらいで危険異変

        必要ならここを変更。

        0.20 = 20%
        0.10 = 10%
        0.30 = 30%
    */

    const isDanger =
        Math.random() < 0.20;


    if (isDanger) {

        const files =
            dangerAnomalies[camera];


        if (
            files &&
            files.length > 0
        ) {

            createDangerAnomaly(
                camera,
                randomItem(files)
            );

            return;
        }

    }


    /*
        危険異変を選んだが
        動画が存在しない場合など
        → 通常異変
    */

    createNormalAnomaly(camera);

}


/* =========================================================
   CREATE NORMAL ANOMALY
========================================================= */

function createNormalAnomaly(camera) {

    const mode =
        Math.random() < 0.5
            ? "normal"
            : "night";


    const files =
        normalAnomalies[camera]?.[mode];


    if (!files || files.length === 0) {

        /*
            このカメラ・モードに
            異変画像がない場合は
            別のカメラを探す
        */

        scheduleNextAnomaly();

        return;
    }


    normalAnomalyActive = true;

    normalAnomalyCamera = camera;

    normalAnomalyFile =
        randomItem(files);

    normalAnomalyMode = mode;


    /*
        現在カメラなら即表示
    */

    if (
        currentCamera === camera &&
        getCurrentMode() === mode
    ) {

        updateCameraImage();

        status.textContent =
            "異変を検知しています。";

    }


    /*
        通常異変は20秒間
    */

    clearTimeout(normalAnomalyTimer);

    normalAnomalyTimer =
        setTimeout(
            endNormalAnomaly,
            20000
        );

}


/* =========================================================
   END NORMAL ANOMALY
========================================================= */

function endNormalAnomaly() {

    normalAnomalyActive = false;

    normalAnomalyCamera = null;

    normalAnomalyFile = null;

    normalAnomalyMode = null;


    updateCameraImage();


    status.textContent =
        "監視を継続してください。";


    scheduleNextAnomaly();

}


/* =========================================================
   CREATE DANGER ANOMALY
========================================================= */

function createDangerAnomaly(
    camera,
    file
) {

    dangerAnomalyActive = true;

    dangerAnomalyCamera = camera;

    dangerAnomalyFile = file;


    /*
        危険異変発生

        現在のカメラに強制切り替え
    */

    currentCamera = camera;


    updateCameraUI();


    /*
        通常画像を隠す
    */

    cameraImage.style.display =
        "none";


    /*
        動画設定
    */

    dangerVideo.src =
        `danger/cam${camera}/${file}`;


    dangerVideo.currentTime = 0;

    dangerVideo.style.display =
        "block";


    /*
        危険モード
    */

    document.body.classList.add(
        "danger-mode"
    );


    status.textContent =
        "！！！ 危険な異変を検知 ！！！";


    /*
        心拍開始
    */

    heartbeatSound.currentTime = 0;

    heartbeatSound.play().catch(() => {});


    /*
        動画再生
    */

    dangerVideo.play().catch(() => {});


    /*
        制限時間
    */

    clearTimeout(dangerTimeoutTimer);

    dangerTimeoutTimer =
        setTimeout(
            dangerTimeOver,
            DANGER_TIME_LIMIT
        );

}


/* =========================================================
   DANGER TIME OVER
========================================================= */

function dangerTimeOver() {

    if (!dangerAnomalyActive) {
        return;
    }


    gameOver();

}


/* =========================================================
   END DANGER ANOMALY
========================================================= */

function endDangerAnomaly() {

    dangerAnomalyActive = false;

    dangerAnomalyCamera = null;

    dangerAnomalyFile = null;


    clearTimeout(dangerTimeoutTimer);


    heartbeatSound.pause();

    heartbeatSound.currentTime = 0;


    dangerVideo.pause();

    dangerVideo.removeAttribute("src");

    dangerVideo.load();

    dangerVideo.style.display =
        "none";


    cameraImage.style.display =
        "block";


    document.body.classList.remove(
        "danger-mode"
    );


    updateCameraImage();


    status.textContent =
        "監視を継続してください。";


    scheduleNextAnomaly();

}


/* =========================================================
   VIDEO ENDED
========================================================= */

dangerVideo.addEventListener(
    "ended",
    () => {

        /*
            動画が終わっただけでは
            危険異変を解除しない。

            プレイヤーが報告するまで
            危険状態を維持する。
        */

        dangerVideo.currentTime =
            dangerVideo.duration;

    }
);


/* =========================================================
   REPORT
========================================================= */

function startReport() {

    if (!gameRunning || gameEnded) {
        return;
    }


    if (reportHolding) {
        return;
    }


    reportHolding = true;


    reportButton.classList.add(
        "holding"
    );


    status.textContent =
        "REPORTING...";


    /*
        長押し開始音
    */

    holdStartSound.currentTime = 0;

    holdStartSound.play().catch(() => {});


    /*
        ループ音
    */

    holdLoopAudio.currentTime = 0;

    holdLoopAudio.play().catch(() => {});


    /*
        長押し完了
    */

    reportTimer =
        setTimeout(
            reportAnomaly,
            REPORT_HOLD_TIME
        );

}


/* =========================================================
   CANCEL REPORT
========================================================= */

function cancelReport() {

    if (!reportHolding) {
        return;
    }


    reportHolding = false;


    clearTimeout(reportTimer);


    holdLoopAudio.pause();

    holdLoopAudio.currentTime = 0;


    reportButton.classList.remove(
        "holding"
    );


    if (!dangerAnomalyActive) {

        status.textContent =
            "監視を継続してください。";

    }

}


/* =========================================================
   REPORT ANOMALY
========================================================= */

function reportAnomaly() {

    reportHolding = false;


    clearTimeout(reportTimer);


    holdLoopAudio.pause();

    holdLoopAudio.currentTime = 0;


    reportButton.classList.remove(
        "holding"
    );


    /*
        危険異変
    */

    if (dangerAnomalyActive) {

        /*
            現在のカメラに
            危険異変があるので成功
        */

        reportSuccessSound.currentTime = 0;

        reportSuccessSound.play()
            .catch(() => {});


        endDangerAnomaly();


        /*
            誤報回数リセット
        */

        falseReports = 0;

        updateFalseReports();


        showReportScreen();

        return;
    }


    /*
        通常異変
    */

    const correct =
        normalAnomalyActive &&
        normalAnomalyCamera === currentCamera &&
        normalAnomalyMode === getCurrentMode();


    if (correct) {

        /*
            成功
        */

        reportSuccessSound.currentTime = 0;

        reportSuccessSound.play()
            .catch(() => {});


        endNormalAnomaly();


        /*
            誤報回数リセット
        */

        falseReports = 0;

        updateFalseReports();


        showReportScreen();

        return;
    }


    /*
        失敗
    */

    falseReports++;

    updateFalseReports();


    reportFailureSound.currentTime = 0;

    reportFailureSound.play()
        .catch(() => {});


    status.textContent =
        "異変は確認されませんでした。";


    /*
        5回でゲームオーバー
    */

    if (
        falseReports >= MAX_FALSE_REPORTS
    ) {

        gameOver();

    }

}


/* =========================================================
   FALSE REPORT DISPLAY
========================================================= */

function updateFalseReports() {

    falseReportsDisplay.textContent =
        `${falseReports}/${MAX_FALSE_REPORTS}`;

}


/* =========================================================
   REPORT SCREEN
========================================================= */

function showReportScreen() {

    reportScreen.classList.add(
        "active"
    );


    clearTimeout(reportScreenTimer);


    reportScreenTimer =
        setTimeout(
            () => {

                reportScreen.classList.remove(
                    "active"
                );

            },
            REPORT_SCREEN_TIME
        );

}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    if (gameEnded) {
        return;
    }


    gameEnded = true;

    gameRunning = false;


    /*
        タイマー停止
    */

    clearInterval(gameClockTimer);

    clearTimeout(nextAnomalyTimer);

    clearTimeout(normalAnomalyTimer);

    clearTimeout(dangerTimeoutTimer);


    /*
        報告停止
    */

    cancelReport();


    /*
        心拍停止
    */

    heartbeatSound.pause();

    heartbeatSound.currentTime = 0;


    /*
        動画停止
    */

    dangerVideo.pause();


    /*
        危険状態解除
    */

    document.body.classList.remove(
        "danger-mode"
    );


    /*
        環境音停止
    */

    Object.values(environmentSounds)
        .forEach(sound => {

            sound.pause();

            sound.currentTime = 0;

        });


    /*
        画面
    */

    gameScreen.classList.remove(
        "active"
    );

    reportScreen.classList.remove(
        "active"
    );

    gameOverScreen.classList.add(
        "active"
    );

}


/* =========================================================
   GAME CLEAR
========================================================= */

function gameClear() {

    if (gameEnded) {
        return;
    }


    gameEnded = true;

    gameRunning = false;


    /*
        タイマー停止
    */

    clearInterval(gameClockTimer);

    clearTimeout(nextAnomalyTimer);

    clearTimeout(normalAnomalyTimer);

    clearTimeout(dangerTimeoutTimer);


    /*
        心拍停止
    */

    heartbeatSound.pause();

    heartbeatSound.currentTime = 0;


    /*
        動画停止
    */

    dangerVideo.pause();


    /*
        環境音停止
    */

    Object.values(environmentSounds)
        .forEach(sound => {

            sound.pause();

            sound.currentTime = 0;

        });


    document.body.classList.remove(
        "danger-mode"
    );


    gameScreen.classList.remove(
        "active"
    );

    reportScreen.classList.remove(
        "active"
    );

    clearScreen.classList.add(
        "active"
    );

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

startButton.addEventListener(
    "click",
    startGame
);


retryButton.addEventListener(
    "click",
    startGame
);


clearButton.addEventListener(
    "click",
    startGame
);


/* =========================================================
   CAMERA BUTTONS
========================================================= */

prevCameraButton.addEventListener(
    "click",
    () => {

        changeCamera(-1);

    }
);


nextCameraButton.addEventListener(
    "click",
    () => {

        changeCamera(1);

    }
);


/* =========================================================
   REPORT BUTTON
========================================================= */

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


/*
    タッチ端末対応
*/

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


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
            長押し報告
        */

        if (
            event.key === " "
            ||
            event.key === "Enter"
        ) {

            if (
                gameRunning &&
                !event.repeat
            ) {

                startReport();

            }

        }


        /*
            A / 左
        */

        if (
            event.key.toLowerCase() === "a"
            ||
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();

            changeCamera(-1);

        }


        /*
            D / 右
        */

        if (
            event.key.toLowerCase() === "d"
            ||
            event.key === "ArrowRight"
        ) {

            event.preventDefault();

            changeCamera(1);

        }


        /*
            W
        */

        if (
            event.key.toLowerCase() === "w"
        ) {

            if (!event.repeat) {

                toggleNightVision();

            }

        }

    }
);


/* =========================================================
   KEYBOARD REPORT RELEASE
========================================================= */

document.addEventListener(
    "keyup",
    event => {

        if (
            event.key === " "
            ||
            event.key === "Enter"
        ) {

            cancelReport();

        }

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

updateCameraImage();

updateCameraUI();

updateFalseReports();

updateGameTime();