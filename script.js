const cameras = 7;

let currentCamera = 1;
let nightVision = false;
let gameStarted = false;

let gameMinutes = 0;
let gameTimer = null;

let falseReports = 0;

let anomalyActive = false;
let currentAnomaly = null;

let dangerActive = false;
let dangerCamera = null;
let dangerFile = null;
let dangerTimer = null;
let dangerVideoPlaying = false;

let holdTimer = null;
let holdLoopStarted = false;

let environmentAudio = null;
let heartbeatAudio = null;


// =========================
// 出現済み異変
// =========================

const usedNormalAnomalies = new Set();
const usedPairedAnomalies = new Set();
const usedDangerAnomalies = new Set();


// =========================
// DOM
// =========================

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");

const startButton = document.getElementById("startButton");
const retryButton = document.getElementById("retryButton");
const clearButton = document.getElementById("clearButton");

const cameraImage = document.getElementById("cameraImage");
const dangerVideo = document.getElementById("dangerVideo");

const cameraName = document.getElementById("cameraName");
const cameraNumber = document.getElementById("cameraNumber");

const gameTime = document.getElementById("gameTime");
const falseReportsDisplay =
    document.getElementById("falseReports");

const nightIndicator =
    document.getElementById("nightIndicator");

const status =
    document.getElementById("status");

const reportButton =
    document.getElementById("reportButton");

const previousButton =
    document.getElementById("prevCamera");

const nextButton =
    document.getElementById("nextCamera");

const reportScreen =
    document.getElementById("reportScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const clearScreen =
    document.getElementById("clearScreen");


// =========================
// 通常異変
// =========================

const normalAnomalies = {

    1: {
        normal: [
            "01.jpg",
            "02.jpg",
            "04.jpg",
            "06.jpg"
        ],

        night: [
            "03.jpg",
            "05.jpg"
        ]
    },

    2: {
        normal: [
            "01.jpg",
            "02.jpg",
            "03.jsp"
        ],

        night: [
            "04.jpg"
        ]
    },

    3: {
        normal: [
            "02.jpg",
            "03.jsp"
        ],

        night: []
    },

    4: {
        normal: [
            "02.jpg",
            "03.jpg",
            "04.jpg"
        ],

        night: []
    },

    5: {
        normal: [
            "01.jpg",
            "02.jpg",
            "03.jsp"
        ],

        night: [
            "04.jpg"
        ]
    },

    6: {
        normal: [
            "01.jpg"
        ],

        night: [
            "01.jpg"
        ]
    },

    7: {
        normal: [
            "01.jpg"
        ],

        night: [
            "01.jpg"
        ]
    }
};


// =========================
// セット異変
// =========================

const pairedAnomalies = {

    1: [
        {
            id: "pair01",
            normal: "1pea2.jpg",
            night: "1pea1.jpg"
        }
    ],

    3: [
        {
            id: "pair01",
            normal: "01.jpg",
            night: "04.jpg"
        }
    ],

    4: [
        {
            id: "pair01",
            normal: "05.jpg",
            night: "01.jpg"
        }
    ]
};


// =========================
// 危険異変
// =========================

const dangerAnomalies = {

    1: [
        "01.mp4",
        "02.mp4"
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


// =========================
// サウンド
// =========================

function playSound(file) {

    const audio =
        new Audio(`sounds/${file}`);

    audio.play().catch(() => {});

    return audio;
}


// =========================
// 環境音
// =========================

function startEnvironmentSound() {

    stopEnvironmentSound();

    environmentAudio =
        new Audio(
            `sounds/env_cam${currentCamera}.mp3`
        );

    environmentAudio.loop = true;
    environmentAudio.volume = 0.7;

    environmentAudio.play().catch(() => {});
}


function stopEnvironmentSound() {

    if (!environmentAudio) {
        return;
    }

    environmentAudio.pause();
    environmentAudio.currentTime = 0;
    environmentAudio = null;
}


// =========================
// カメラ表示
// =========================

function updateCameraImage() {

    const normalPath =
        `images/normal/cam${currentCamera}.jpg`;

    const nightPath =
        `images/night/cam${currentCamera}.jpg`;

    const currentMode =
        nightVision
            ? "night"
            : "normal";


    cameraImage.src =
        nightVision
            ? nightPath
            : normalPath;


    cameraNumber.textContent =
        String(currentCamera).padStart(2, "0");

    cameraName.textContent =
        `CAM ${String(currentCamera).padStart(2, "0")}`;


    nightIndicator.style.display =
        nightVision
            ? "block"
            : "none";


    // =========================
    // 危険異変
    // =========================

    if (
        dangerActive &&
        dangerCamera === currentCamera
    ) {

        cameraImage.style.display = "none";
        dangerVideo.style.display = "block";

        startDangerEffects();

        return;
    }


    // =========================
    // 通常異変
    // =========================

    if (
        anomalyActive &&
        currentAnomaly &&
        currentAnomaly.type === "normal" &&
        currentAnomaly.camera === currentCamera &&
        currentAnomaly.mode === currentMode
    ) {

        cameraImage.src =
            `anomaly/normal/cam${currentCamera}/${currentAnomaly.file}`;

        cameraImage.style.display = "block";

        dangerVideo.pause();
        dangerVideo.style.display = "none";

        stopDangerEffects();

        status.textContent = "監視中";

        return;
    }


    // =========================
    // セット異変
    // =========================

    if (
        anomalyActive &&
        currentAnomaly &&
        currentAnomaly.type === "paired" &&
        currentAnomaly.camera === currentCamera
    ) {

        const file =
            currentAnomaly[currentMode];

        if (file) {

            cameraImage.src =
                `anomaly/normal/cam${currentCamera}/${file}`;

            cameraImage.style.display = "block";

            dangerVideo.pause();
            dangerVideo.style.display = "none";

            stopDangerEffects();

            status.textContent = "監視中";

            return;
        }
    }


    // =========================
    // 通常状態
    // =========================

    dangerVideo.pause();
    dangerVideo.style.display = "none";

    cameraImage.style.display = "block";

    stopDangerEffects();

    status.textContent = "監視中";
}


// =========================
// カメラ切り替え
// =========================

function changeCamera(direction) {

    if (!gameStarted) {
        return;
    }


    // 危険異変中は移動禁止
    if (dangerActive) {
        return;
    }


    currentCamera += direction;


    if (currentCamera > cameras) {
        currentCamera = 1;
    }


    if (currentCamera < 1) {
        currentCamera = cameras;
    }


    playSound("camera.mp3");

    updateCameraImage();

    startEnvironmentSound();


    // =========================
    // 00:30以降
    // =========================

    if (
        gameMinutes >= 30 &&
        !anomalyActive &&
        !dangerActive
    ) {

        trySpawnAnomaly();
    }
}


// =========================
// 夜間モード
// =========================

function toggleNightVision() {

    if (!gameStarted) {
        return;
    }


    nightVision = !nightVision;


    if (nightVision) {
        playSound("night_on.mp3");
    } else {
        playSound("night_off.mp3");
    }


    updateCameraImage();
}


// =========================
// 時刻表示
// =========================

function updateGameTime() {

    const hours =
        Math.floor(gameMinutes / 60);

    const minutes =
        gameMinutes % 60;


    gameTime.textContent =
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}


// =========================
// ゲーム時間
// =========================

function startGameTimer() {

    clearInterval(gameTimer);

    gameMinutes = 0;

    updateGameTime();


    // 2秒 = ゲーム内1分
    gameTimer = setInterval(() => {

        if (!gameStarted) {
            return;
        }


        gameMinutes++;

        updateGameTime();


        // 05:00
        if (gameMinutes >= 300) {

            clearGame();

        }

    }, 2000);
}


// =========================
// 異変発生抽選
// =========================

function trySpawnAnomaly() {

    if (anomalyActive || dangerActive) {
        return;
    }


    // 通常異変は CAM1 / CAM3 / CAM4
    const anomalyCameras =
        [1, 3, 4];


    const currentMode =
        nightVision
            ? "night"
            : "normal";


    // =========================
    // 通常異変
    // =========================

    const availableNormal = [];


    for (const camera of anomalyCameras) {

        if (!normalAnomalies[camera]) {
            continue;
        }


        const files =
            normalAnomalies[camera][currentMode];


        if (!files) {
            continue;
        }


        for (const file of files) {

            const key =
                `${camera}_${currentMode}_${file}`;


            if (!usedNormalAnomalies.has(key)) {

                availableNormal.push({

                    type: "normal",

                    camera: camera,

                    mode: currentMode,

                    file: file,

                    key: key

                });
            }
        }
    }


    // =========================
    // セット異変
    // =========================

    const availablePaired = [];


    for (const camera of anomalyCameras) {

        if (!pairedAnomalies[camera]) {
            continue;
        }


        for (
            const anomaly
            of pairedAnomalies[camera]
        ) {

            const key =
                `${camera}_${anomaly.id}`;


            if (!usedPairedAnomalies.has(key)) {

                availablePaired.push({

                    type: "paired",

                    camera: camera,

                    id: anomaly.id,

                    normal: anomaly.normal,

                    night: anomaly.night,

                    key: key

                });
            }
        }
    }


    // =========================
    // 危険異変
    // =========================

    const availableDanger = [];


    if (dangerAnomalies[currentCamera]) {

        for (
            const file
            of dangerAnomalies[currentCamera]
        ) {

            const key =
                `${currentCamera}_${file}`;


            if (!usedDangerAnomalies.has(key)) {

                availableDanger.push({

                    camera: currentCamera,

                    file: file,

                    key: key

                });
            }
        }
    }


    // =========================
    // 全部出現済み
    // =========================

    if (
        availableNormal.length === 0 &&
        availablePaired.length === 0 &&
        availableDanger.length === 0
    ) {

        console.log(
            "この時点で出現可能な異変がありません"
        );

        return;
    }


    // =========================
    // 危険異変 10%
    // =========================

    if (
        availableDanger.length > 0 &&
        Math.random() < 0.10
    ) {

        spawnDangerAnomaly(
            availableDanger
        );

        return;
    }


    // =========================
    // 通常＋セット
    // =========================

    const availableNormalTypes = [
        ...availableNormal,
        ...availablePaired
    ];


    if (
        availableNormalTypes.length > 0
    ) {

        spawnNormalAnomaly(
            availableNormalTypes
        );

        return;
    }


    // =========================
    // 通常系がなくなった場合
    // =========================

    if (availableDanger.length > 0) {

        spawnDangerAnomaly(
            availableDanger
        );
    }
}


// =========================
// 通常異変・セット異変
// =========================

function spawnNormalAnomaly(
    availableAnomalies
) {

    if (
        !availableAnomalies ||
        availableAnomalies.length === 0
    ) {
        return;
    }


    const selected =
        availableAnomalies[
            Math.floor(
                Math.random() *
                availableAnomalies.length
            )
        ];


    // =========================
    // 通常異変
    // =========================

    if (selected.type === "normal") {

        usedNormalAnomalies.add(
            selected.key
        );


        anomalyActive = true;


        currentAnomaly = {

            type: "normal",

            camera: selected.camera,

            mode: selected.mode,

            file: selected.file

        };


        console.log(
            "通常異変発生:",
            `CAM ${selected.camera}`,
            selected.mode,
            selected.file
        );


        updateCameraImage();

        return;
    }


    // =========================
    // セット異変
    // =========================

    if (selected.type === "paired") {

        usedPairedAnomalies.add(
            selected.key
        );


        anomalyActive = true;


        currentAnomaly = {

            type: "paired",

            camera: selected.camera,

            normal: selected.normal,

            night: selected.night,

            id: selected.id

        };


        console.log(
            "セット異変発生:",
            `CAM ${selected.camera}`,
            `通常=${selected.normal}`,
            `暗視=${selected.night}`
        );


        updateCameraImage();

    }
}


// =========================
// 危険異変
// =========================

function spawnDangerAnomaly(
    availableDanger
) {

    if (
        !availableDanger ||
        availableDanger.length === 0
    ) {
        return;
    }


    const selected =
        availableDanger[
            Math.floor(
                Math.random() *
                availableDanger.length
            )
        ];


    const camera =
        selected.camera;

    const file =
        selected.file;

    const key =
        selected.key;


    usedDangerAnomalies.add(key);


    dangerActive = true;

    dangerCamera = camera;

    dangerFile = file;

    dangerVideoPlaying = false;


    console.log(
        "危険異変発生:",
        `CAM ${camera}`,
        file
    );


    // =========================
    // 動画準備
    // =========================

    cameraImage.style.display = "none";

    dangerVideo.style.display = "block";

    const path =
        `anomaly/danger/cam${camera}/${file}`;


    // 以前のイベントを解除
    dangerVideo.onloadeddata = null;
    dangerVideo.onerror = null;


    dangerVideo.src = path;

    dangerVideo.currentTime = 0;

    dangerVideo.loop = false;

    // 音あり
    dangerVideo.muted = false;

    // ブラウザ側でインライン再生
    dangerVideo.setAttribute(
        "playsinline",
        ""
    );


    dangerVideo.load();


    // =========================
    // 動画読み込み完了後に再生
    // =========================

    dangerVideo.onloadeddata = () => {

        console.log(
            "動画読み込み完了:",
            path
        );


        dangerVideo.play()
            .then(() => {

                dangerVideoPlaying = true;


                console.log(
                    "危険異変動画 再生開始:",
                    path
                );

            })
            .catch(error => {

                console.error(
                    "危険異変動画の再生に失敗:",
                    error
                );

            });

    };


    dangerVideo.onerror = () => {

        console.error(
            "動画ファイルを読み込めません:",
            path,
            dangerVideo.error
        );

    };


    startDangerEffects();

    startEnvironmentSound();


    clearTimeout(
        dangerTimer
    );


    dangerTimer =
        setTimeout(() => {

            if (dangerActive) {

                gameOver();

            }

        }, 10000);
}


// =========================
// 危険異変演出
// =========================

function startDangerEffects() {

    document.body.classList.add(
        "danger-mode"
    );


    if (!heartbeatAudio) {

        heartbeatAudio =
            new Audio(
                "sounds/heartbeat.mp3"
            );

        heartbeatAudio.loop = true;

        heartbeatAudio.volume = 0.8;

        heartbeatAudio.play()
            .catch(() => {});

    }
}


// =========================
// 危険異変演出停止
// =========================

function stopDangerEffects() {

    document.body.classList.remove(
        "danger-mode"
    );


    if (heartbeatAudio) {

        heartbeatAudio.pause();

        heartbeatAudio.currentTime = 0;

        heartbeatAudio = null;

    }
}


// =========================
// REPORT 長押し
// =========================

function startReportHold() {

    if (!gameStarted) {
        return;
    }


    if (holdTimer) {
        return;
    }


    playSound(
        "hold_start.mp3"
    );


    const holdLoop =
        new Audio(
            "sounds/hold_loop.mp3"
        );


    holdLoop.loop = true;

    holdLoop.volume = 0.7;

    holdLoopStarted = true;


    holdLoop.play()
        .catch(() => {});


    holdTimer =
        setTimeout(() => {

            holdLoop.pause();

            holdLoop.currentTime = 0;

            holdTimer = null;

            holdLoopStarted = false;

            reportAnomaly();

        }, 1200);
}


function cancelReportHold() {

    if (!holdTimer) {
        return;
    }


    clearTimeout(
        holdTimer
    );

    holdTimer = null;

    holdLoopStarted = false;
}


// =========================
// REPORT
// =========================

function reportAnomaly() {

    // =========================
    // 危険異変
    // =========================

    if (dangerActive) {

        clearTimeout(
            dangerTimer
        );

        dangerTimer = null;


        dangerActive = false;

        dangerCamera = null;

        dangerFile = null;


        dangerVideo.pause();

        dangerVideo.currentTime = 0;

        dangerVideo.style.display = "none";

        dangerVideoPlaying = false;


        stopDangerEffects();


        falseReports = 0;

        updateFalseReports();


        showReportSuccess();

        return;
    }


    // =========================
    // 通常・セット異変
    // =========================

    if (
        anomalyActive &&
        currentAnomaly &&
        currentAnomaly.camera === currentCamera
    ) {

        // 通常異変
        if (
            currentAnomaly.type === "normal" &&
            currentAnomaly.mode !==
                (
                    nightVision
                        ? "night"
                        : "normal"
                )
        ) {

            falseReports++;

            updateFalseReports();

            playSound(
                "report_failure.mp3"
            );


            if (falseReports >= 5) {

                gameOver();

                return;
            }


            showFalseReportMessage();

            return;
        }


        // 正解
        anomalyActive = false;

        currentAnomaly = null;

        falseReports = 0;

        updateFalseReports();

        showReportSuccess();

        return;
    }


    // =========================
    // 誤報
    // =========================

    falseReports++;

    updateFalseReports();


    playSound(
        "report_failure.mp3"
    );


    if (falseReports >= 5) {

        gameOver();

        return;
    }


    showFalseReportMessage();
}


// =========================
// 正しいREPORT
// =========================

function showReportSuccess() {

    reportScreen.classList.add(
        "active"
    );


    playSound(
        "report_success.mp3"
    );


    setTimeout(() => {

        reportScreen.classList.remove(
            "active"
        );


        updateCameraImage();

    }, 2000);
}


// =========================
// 誤報告メッセージ
// =========================

function showFalseReportMessage() {

    const message =
        document.createElement("div");


    message.id =
        "falseReportMessage";


    message.textContent =
        "異常はありませんでした";


    message.style.position = "fixed";

    message.style.left = "50%";

    message.style.top = "50%";

    message.style.transform =
        "translate(-50%, -50%)";

    message.style.zIndex = "9999";

    message.style.color = "white";

    message.style.fontSize = "28px";

    message.style.fontWeight = "bold";

    message.style.textShadow =
        "0 0 10px black";

    message.style.pointerEvents =
        "none";


    document.body.appendChild(
        message
    );


    setTimeout(() => {

        message.remove();

    }, 1500);
}


// =========================
// 誤報表示
// =========================

function updateFalseReports() {

    falseReportsDisplay.textContent =
        `${falseReports}/5`;
}


// =========================
// ゲームオーバー
// =========================

function gameOver() {

    gameStarted = false;


    clearInterval(gameTimer);

    clearTimeout(dangerTimer);


    dangerTimer = null;


    dangerActive = false;

    dangerCamera = null;

    dangerFile = null;

    dangerVideoPlaying = false;


    anomalyActive = false;

    currentAnomaly = null;


    stopEnvironmentSound();

    stopDangerEffects();


    if (dangerVideo) {

        dangerVideo.pause();

        dangerVideo.currentTime = 0;

        dangerVideo.style.display = "none";

    }


    reportScreen.classList.remove(
        "active"
    );


    gameScreen.classList.remove(
        "active"
    );


    gameOverScreen.classList.add(
        "active"
    );
}


// =========================
// クリア
// =========================

function clearGame() {

    gameStarted = false;


    clearInterval(gameTimer);

    clearTimeout(dangerTimer);


    dangerTimer = null;


    anomalyActive = false;

    currentAnomaly = null;


    dangerActive = false;

    dangerCamera = null;

    dangerFile = null;

    dangerVideoPlaying = false;


    stopEnvironmentSound();

    stopDangerEffects();


    if (dangerVideo) {

        dangerVideo.pause();

        dangerVideo.currentTime = 0;

        dangerVideo.style.display = "none";

    }


    gameScreen.classList.remove(
        "active"
    );


    clearScreen.classList.add(
        "active"
    );
}


// =========================
// ゲーム開始
// =========================

function startGame() {

    gameStarted = true;


    currentCamera = 1;

    nightVision = false;

    falseReports = 0;


    anomalyActive = false;

    currentAnomaly = null;


    dangerActive = false;

    dangerCamera = null;

    dangerFile = null;

    dangerVideoPlaying = false;


    usedNormalAnomalies.clear();

    usedPairedAnomalies.clear();

    usedDangerAnomalies.clear();


    updateFalseReports();

    updateGameTime();

    updateCameraImage();


    startEnvironmentSound();

    startGameTimer();


    startScreen.classList.remove(
        "active"
    );

    gameOverScreen.classList.remove(
        "active"
    );

    clearScreen.classList.remove(
        "active"
    );

    gameScreen.classList.add(
        "active"
    );
}


// =========================
// イベント
// =========================

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
    () => {

        startScreen.classList.add(
            "active"
        );

        clearScreen.classList.remove(
            "active"
        );

    }
);


// =========================
// カメラボタン
// =========================

previousButton.addEventListener(
    "click",
    () => changeCamera(-1)
);


nextButton.addEventListener(
    "click",
    () => changeCamera(1)
);


// =========================
// REPORT
// =========================

reportButton.addEventListener(
    "mousedown",
    startReportHold
);


reportButton.addEventListener(
    "mouseup",
    cancelReportHold
);


reportButton.addEventListener(
    "mouseleave",
    cancelReportHold
);


reportButton.addEventListener(
    "touchstart",
    (e) => {

        e.preventDefault();

        startReportHold();

    }
);


reportButton.addEventListener(
    "touchend",
    (e) => {

        e.preventDefault();

        cancelReportHold();

    }
);


// =========================
// キーボード
// =========================

document.addEventListener(
    "keydown",
    (e) => {

        if (!gameStarted) {
            return;
        }


        // A / ←
        if (
            e.key === "a" ||
            e.key === "A" ||
            e.key === "ArrowLeft"
        ) {

            changeCamera(-1);

        }


        // D / →
        if (
            e.key === "d" ||
            e.key === "D" ||
            e.key === "ArrowRight"
        ) {

            changeCamera(1);

        }


        // W
        if (
            e.key === "w" ||
            e.key === "W"
        ) {

            if (!e.repeat) {

                toggleNightVision();

            }

        }


        // SPACE / ENTER
        if (
            e.key === " " ||
            e.key === "Enter"
        ) {

            if (!e.repeat) {

                startReportHold();

            }

        }

    }
);


document.addEventListener(
    "keyup",
    (e) => {

        if (
            e.key === " " ||
            e.key === "Enter"
        ) {

            cancelReportHold();

        }

    }
);