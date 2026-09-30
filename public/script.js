const cameras = 7;

let currentCamera = 1;
let nightVision = false;
let gameStarted = false;
let ambientEventTimer = null;

let gameMinutes = 0;
let gameTimer = null;

let falseReports = 0;

// 次に異変が発生するゲーム内時刻
let nextAnomalySpawnTime = 30;


// =========================
// 異変システム
// =========================

const MAX_ANOMALIES = 4;

// 同時多発時の内部制限時間
const MASS_ANOMALY_LIMIT = 20;

let activeAnomalies = [];

let massAnomalyTimer = null;
let massAnomalyRemaining = 0;


// =========================
// 危険異変
// =========================

// 危険異変を放置できる時間（秒）
const DANGER_ANOMALY_LIMIT = 30;

let dangerActive = false;
let dangerCamera = null;
let dangerFile = null;
let dangerKey = null;
let dangerTimer = null;

// 危険動画が実際に再生中か
let dangerVideoPlaying = false;

// 現在見ているカメラで危険演出がONか
let dangerEffectsActive = false;


// =========================
// REPORT 長押し
// =========================

let holdTimer = null;
let holdLoopAudio = null;
let holdStartTime = null;
let holdDuration = 1200;
let holdProgressTimer = null;


// =========================
// 音声
// =========================

let environmentAudio = null;
let heartbeatAudio = null;
let dangerAudio = null;


// =========================
// 出現済み異変
// =========================

const usedNormalAnomalies = new Set();
const usedPairedAnomalies = new Set();
const usedDangerAnomalies = new Set();


// =========================
// DOM
// =========================

const startScreen =
    document.getElementById("startScreen");

const gameScreen =
    document.getElementById("gameScreen");

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

const nightIndicator =
    document.getElementById("nightIndicator");

const nightButton =
    document.getElementById("nightButton");

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

const reportButtonText =
    document.getElementById("reportButtonText");

const reportProgress =
    document.getElementById("reportProgress");

const massAnomalyWarning =
    document.getElementById("massAnomalyWarning");


// =========================
// 通常異変
// =========================

const normalAnomalies = {

    1: {
        normal: [
            "04.jpg"
        ],

        night: [
            "03.jpg",
            "01.jpg"
        ]
    },

    2: {
        normal: [],
        night: []
    },

    3: {
        normal: [],

        night: [
            "07.jpg"
        ]
    },

    4: {
        normal: [],

        night: [
            "06.jpg"
        ]
    },

    5: {
        normal: [],

        night: [
            "6.jpg"
        ]
    },

    6: {
        normal: [],

        night: [
            "4.jpg",
            "8.jpg",
            "9.jpg"
        ]
    },

    7: {
        normal: [],

        night: [
            "06.jpg"
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
        },

        {
            id: "pair2",
            normal: "02.jpg",
            night: "07.jpg"
        },

        {
            id: "pair3",
            normal: "06.jpg",
            night: "08.jpg"
        },

        {
            id: "pair4",
            normal: "04.jpg",
            night: "09.jpg"
        }
    ],

    2: [
        {
            id: "pair1",
            normal: "1.jpg",
            night: "2.jpg"
        }
    ],

    3: [
        {
            id: "pair01",
            normal: "01.jpg",
            night: "04.jpg"
        },

        {
            id: "pair02",
            normal: "06.jpg",
            night: "05.jpg"
        },

        {
            id: "pair03",
            normal: "03.jpg",
            night: "08.jpg"
        },

        {
            id: "pair04",
            normal: "02.jpg",
            night: "09.jpg"
        }
    ],

    4: [
        {
            id: "pair01",
            normal: "05.jpg",
            night: "01.jpg"
        },

        {
            id: "pair02",
            normal: "03.jpg",
            night: "08.jpg"
        },

        {
            id: "pair03",
            normal: "04.jpg",
            night: "07.jpg"
        }
    ],

    5: [
        {
            id: "pair1",
            normal: "1.jpg",
            night: "2.jpg"
        },

        {
            id: "pair2",
            normal: "4.jpg",
            night: "3.jpg"
        },

        {
            id: "pair3",
            normal: "7.jpg",
            night: "8.jpg"
        },

        {
            id: "pair4",
            normal: "10.jpg",
            night: "9.jpg"
        },

        {
            id: "pair5",
            normal: "11.jpg",
            night: "12.jpg"
        },

        {
            id: "pair6",
            normal: "13.jpg",
            night: "14.jpg"
        }
    ],

    6: [
        {
            id: "pair1",
            normal: "1.jpg",
            night: "2.jpg"
        },

        {
            id: "pair2",
            normal: "5.jpg",
            night: "6.jpg"
        },

        {
            id: "pair3",
            normal: "10.jpg",
            night: "11.jpg"
        }
    ],

    7: [
        {
            id: "pair1",
            normal: "3.jpg",
            night: "1.jpg"
        },

        {
            id: "pair2",
            normal: "4.jpg",
            night: "5.jpg"
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

    5: [],

    6: [
        "01.mp4",
        "02.mp4"
    ],

    7: []
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

    if (!gameStarted) {
        return;
    }

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
    // 現在カメラの危険異変
    // =========================

    const currentDanger =
        activeAnomalies.find(
            anomaly =>
                anomaly.type === "danger" &&
                anomaly.camera === currentCamera
        );


    if (currentDanger) {

        cameraImage.style.display =
            "none";

        dangerVideo.style.display =
            "block";

        status.textContent =
            "監視中";

        updateReportButtonStyle();


        // =========================
        // 危険演出
        // =========================

        if (!dangerEffectsActive) {

            startDangerEffects();

            dangerEffectsActive = true;

        }


        const path =
            `anomaly/danger/cam${currentDanger.camera}/${currentDanger.file}`;

        const fullPath =
            new URL(
                path,
                window.location.href
            ).href;


        // =========================
        // 新しい動画
        // =========================

        if (
            dangerVideo.src !== fullPath
        ) {

            dangerVideo.onloadeddata =
                null;

            dangerVideo.onerror =
                null;

            dangerVideo.pause();

            dangerVideo.src =
                path;

            dangerVideo.currentTime =
                0;

            dangerVideo.loop =
                false;

            dangerVideo.muted =
                false;

            dangerVideo.setAttribute(
                "playsinline",
                ""
            );


            dangerVideo.onloadeddata =
                () => {

                    const stillExists =
                        activeAnomalies.some(
                            anomaly =>
                                anomaly.type === "danger" &&
                                anomaly.key === currentDanger.key
                        );

                    if (
                        gameStarted &&
                        stillExists &&
                        currentCamera === currentDanger.camera
                    ) {

                        dangerVideo.play()
                            .then(() => {

                                dangerVideoPlaying =
                                    true;

                            })
                            .catch(() => {});

                    }

                };


            dangerVideo.onerror =
                () => {

                    console.error(
                        "動画ファイルを読み込めません:",
                        path,
                        dangerVideo.error
                    );

                };


            dangerVideo.load();

        } else {

            if (
                dangerVideo.paused &&
                !dangerVideo.ended
            ) {

                dangerVideo.play()
                    .then(() => {

                        dangerVideoPlaying =
                            true;

                    })
                    .catch(() => {});

            }

        }

        return;
    }


    // =========================
    // 危険異変を見ていない
    // =========================

    if (dangerEffectsActive) {

        stopDangerEffects();

    }


    dangerVideo.pause();

    dangerVideo.style.display =
        "none";

    dangerVideoPlaying =
        false;


    // =========================
    // 通常異変
    // =========================

    const currentNormal =
        activeAnomalies.find(
            anomaly =>

                anomaly.type === "normal" &&

                anomaly.camera === currentCamera &&

                anomaly.mode === currentMode
        );


    if (currentNormal) {

        cameraImage.src =
            `anomaly/normal/cam${currentCamera}/${currentNormal.file}`;

        cameraImage.style.display =
            "block";

        status.textContent =
            "監視中";

        updateReportButtonStyle();

        return;
    }


    // =========================
    // セット異変
    // =========================

    const currentPaired =
        activeAnomalies.find(
            anomaly =>

                anomaly.type === "paired" &&

                anomaly.camera === currentCamera
        );


    if (currentPaired) {

        const file =
            currentPaired[currentMode];

        if (file) {

            cameraImage.src =
                `anomaly/normal/cam${currentCamera}/${file}`;

            cameraImage.style.display =
                "block";

            status.textContent =
                "監視中";

            updateReportButtonStyle();

            return;
        }
    }


    // =========================
    // 通常状態
    // =========================

    cameraImage.src =
        nightVision
            ? nightPath
            : normalPath;

    cameraImage.style.display =
        "block";

    status.textContent =
        "監視中";

    updateReportButtonStyle();
}


// =========================
// カメラ切り替え
// =========================

function changeCamera(direction) {

    if (!gameStarted) {
        return;
    }


    // 危険異変を見たら逃げられない
    if (
        dangerActive &&
        currentCamera === dangerCamera
    ) {
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
}


// =========================
// NIGHT VISION
// =========================

function toggleNightVision() {

    if (!gameStarted) {
        return;
    }


    if (
        dangerActive &&
        currentCamera === dangerCamera
    ) {
        return;
    }


    nightVision =
        !nightVision;


    if (nightVision) {

        playSound(
            "night_on.mp3"
        );

    } else {

        playSound(
            "night_off.mp3"
        );

    }


    updateNightButton();

    updateCameraImage();
}


function updateNightButton() {

    if (!nightButton) {
        return;
    }


    if (nightVision) {

        nightButton.textContent =
            "NIGHT VISION ON";

        nightButton.classList.add(
            "active"
        );

    } else {

        nightButton.textContent =
            "NIGHT VISION";

        nightButton.classList.remove(
            "active"
        );

    }
}


// =========================
// 時刻
// =========================

function updateGameTime() {

    const hours =
        Math.floor(
            gameMinutes / 60
        );

    const minutes =
        gameMinutes % 60;


    gameTime.textContent =
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}


// =========================
// ゲーム時間
// =========================

function startGameTimer() {

    if (gameTimer !== null) {

        clearInterval(
            gameTimer
        );

        gameTimer = null;
    }


    gameMinutes = 0;

    updateGameTime();


    // 2秒 = ゲーム内1分
    gameTimer =
        setInterval(() => {

            if (!gameStarted) {
                return;
            }


            gameMinutes++;

            updateGameTime();


            // =========================
            // 異変発生
            // =========================

            if (
                gameMinutes >= nextAnomalySpawnTime &&
                activeAnomalies.length < MAX_ANOMALIES
            ) {

                trySpawnAnomaly();


                nextAnomalySpawnTime =
                    gameMinutes +
                    Math.floor(
                        Math.random() * 6
                    ) +
                    5;

            }


            // =========================
            // 05:00
            // =========================

            if (
                gameMinutes >= 300
            ) {

                clearGame();

            }

        }, 2000);
}


// =========================
// 異変発生抽選
// =========================

function trySpawnAnomaly() {

    if (!gameStarted) {
        return;
    }


    if (
        activeAnomalies.length >=
        MAX_ANOMALIES
    ) {
        return;
    }


    const anomalyCameras =
        [1, 2, 3, 4, 5, 6, 7];


    const currentMode =
        nightVision
            ? "night"
            : "normal";


    const occupiedCameras =
        new Set(
            activeAnomalies.map(
                anomaly =>
                    anomaly.camera
            )
        );


    // =========================
    // 通常異変候補
    // =========================

    const availableNormal = [];


    for (
        const camera
        of anomalyCameras
    ) {

        if (
            camera === currentCamera
        ) {
            continue;
        }


        if (
            occupiedCameras.has(camera)
        ) {
            continue;
        }


        if (
            !normalAnomalies[camera]
        ) {
            continue;
        }


        const files =
            normalAnomalies[camera][
                currentMode
            ];


        if (!files) {
            continue;
        }


        for (
            const file
            of files
        ) {

            const key =
                `${camera}_${currentMode}_${file}`;


            if (
                !usedNormalAnomalies.has(
                    key
                )
            ) {

                availableNormal.push({

                    type: "normal",

                    camera,

                    mode: currentMode,

                    file,

                    key

                });

            }
        }
    }


    // =========================
    // セット異変候補
    // =========================

    const availablePaired = [];


    for (
        const camera
        of anomalyCameras
    ) {

        if (
            camera === currentCamera
        ) {
            continue;
        }


        if (
            occupiedCameras.has(camera)
        ) {
            continue;
        }


        if (
            !pairedAnomalies[camera]
        ) {
            continue;
        }


        for (
            const anomaly
            of pairedAnomalies[camera]
        ) {

            const key =
                `${camera}_${anomaly.id}`;


            if (
                !usedPairedAnomalies.has(
                    key
                )
            ) {

                availablePaired.push({

                    type: "paired",

                    camera,

                    id: anomaly.id,

                    normal:
                        anomaly.normal,

                    night:
                        anomaly.night,

                    key

                });

            }
        }
    }


    // =========================
    // 危険異変候補
    // =========================

    const availableDanger = [];


    // 危険異変は同時に1個
    const dangerAlreadyExists =
        activeAnomalies.some(
            anomaly =>
                anomaly.type ===
                "danger"
        );


    if (!dangerAlreadyExists) {

        for (
            const cameraKey
            in dangerAnomalies
        ) {

            const camera =
                Number(cameraKey);


            if (
                camera ===
                currentCamera
            ) {
                continue;
            }


            if (
                occupiedCameras.has(
                    camera
                )
            ) {
                continue;
            }


            const files =
                dangerAnomalies[
                    camera
                ];


            if (!files) {
                continue;
            }


            for (
                const file
                of files
            ) {

                const key =
                    `${camera}_${file}`;


                if (
                    !usedDangerAnomalies.has(
                        key
                    )
                ) {

                    availableDanger.push({

                        type: "danger",

                        camera,

                        file,

                        key

                    });

                }
            }
        }
    }


    // =========================
    // 候補なし
    // =========================

    if (
        availableNormal.length === 0 &&
        availablePaired.length === 0 &&
        availableDanger.length === 0
    ) {
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
    // 通常・セット
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


    // 通常系がもう無ければ危険
    if (
        availableDanger.length > 0
    ) {

        spawnDangerAnomaly(
            availableDanger
        );

    }
}


// =========================
// 通常・セット異変発生
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
    // 通常
    // =========================

    if (
        selected.type === "normal"
    ) {

        usedNormalAnomalies.add(
            selected.key
        );


        const anomaly = {

            type: "normal",

            camera:
                selected.camera,

            mode:
                selected.mode,

            file:
                selected.file,

            key:
                selected.key

        };


        activeAnomalies.push(
            anomaly
        );


        console.log(
            "通常異変発生:",
            `CAM ${selected.camera}`,
            selected.mode,
            selected.file
        );


        checkMassAnomaly();

        updateCameraImage();

        return;
    }


    // =========================
    // セット
    // =========================

    if (
        selected.type === "paired"
    ) {

        usedPairedAnomalies.add(
            selected.key
        );


        const anomaly = {

            type: "paired",

            camera:
                selected.camera,

            normal:
                selected.normal,

            night:
                selected.night,

            id:
                selected.id,

            key:
                selected.key

        };


        activeAnomalies.push(
            anomaly
        );


        console.log(
            "セット異変発生:",
            `CAM ${selected.camera}`,
            `通常=${selected.normal}`,
            `暗視=${selected.night}`
        );


        checkMassAnomaly();

        updateCameraImage();
    }
}


// =========================
// 危険異変発生
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


    // 念のため二重発生防止
    const existingDanger =
        activeAnomalies.some(
            anomaly =>
                anomaly.type ===
                "danger"
        );


    if (existingDanger) {

        console.warn(
            "危険異変はすでに発生中"
        );

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


    usedDangerAnomalies.add(
        key
    );


    const anomaly = {

        type: "danger",

        camera,

        file,

        key

    };


    activeAnomalies.push(
        anomaly
    );


    dangerActive =
        true;

    dangerCamera =
        camera;

    dangerFile =
        file;

    dangerKey =
        key;

    dangerVideoPlaying =
        false;


    console.log(
        "============================"
    );

    console.log(
        "危険異変発生:",
        `CAM ${camera}`,
        file
    );

    console.log(
        "危険異変KEY:",
        key
    );

    console.log(
        "制限時間:",
        `${DANGER_ANOMALY_LIMIT}秒`
    );

    console.log(
        "現在の異変数:",
        activeAnomalies.length
    );

    console.log(
        "============================"
    );


    updateCameraImage();


    // =========================
    // 古いタイマー完全削除
    // =========================

    if (
        dangerTimer !== null
    ) {

        clearTimeout(
            dangerTimer
        );

        dangerTimer =
            null;

    }


    // このタイマー専用のKEY
    const timerKey =
        key;


    // =========================
    // 30秒タイマー
    // =========================

    dangerTimer =
        setTimeout(() => {

            if (!gameStarted) {
                return;
            }


            const stillExists =
                activeAnomalies.some(
                    anomaly =>

                        anomaly.type ===
                            "danger" &&

                        anomaly.key ===
                            timerKey
                );


            // すでにREPORT済みなら終了
            if (!stillExists) {

                console.log(
                    "危険異変は処理済み:",
                    timerKey
                );

                return;
            }


            console.error(
                "危険異変タイムアウト:",
                timerKey
            );


            dangerTimer =
                null;


            gameOver(
                "danger-timeout"
            );


        }, DANGER_ANOMALY_LIMIT * 1000);


    checkMassAnomaly();
}


// =========================
// 危険演出
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

        heartbeatAudio.loop =
            true;

        heartbeatAudio.volume =
            0.8;

        heartbeatAudio.play()
            .catch(() => {});
    }


    if (!dangerAudio) {

        dangerAudio =
            new Audio(
                "sounds/danger.mp3"
            );

        dangerAudio.loop =
            true;

        dangerAudio.volume =
            0.9;

        dangerAudio.play()
            .catch(() => {});
    }


    dangerEffectsActive =
        true;


    updateReportButtonStyle();
}


// =========================
// 危険演出停止
// =========================

function stopDangerEffects() {

    document.body.classList.remove(
        "danger-mode"
    );


    if (heartbeatAudio) {

        heartbeatAudio.pause();

        heartbeatAudio.currentTime =
            0;

        heartbeatAudio =
            null;
    }


    if (dangerAudio) {

        dangerAudio.pause();

        dangerAudio.currentTime =
            0;

        dangerAudio =
            null;
    }


    dangerEffectsActive =
        false;


    updateReportButtonStyle();
}


// =========================
// 4個同時チェック
// =========================

function checkMassAnomaly() {

    if (
        activeAnomalies.length >=
        MAX_ANOMALIES
    ) {

        if (!massAnomalyTimer) {

            startMassAnomalyTimer();

        }

    } else {

        stopMassAnomalyTimer();

    }
}


// =========================
// 多発タイマー
// =========================

function startMassAnomalyTimer() {

    if (
        massAnomalyTimer !== null
    ) {

        clearInterval(
            massAnomalyTimer
        );

        massAnomalyTimer =
            null;
    }


    massAnomalyRemaining =
        MASS_ANOMALY_LIMIT;


    if (massAnomalyWarning) {

        massAnomalyWarning.classList.add(
            "active"
        );

    }


    playSound(
        "warning.mp3"
    );


    console.warn(
        "異変4個到達:",
        `${MASS_ANOMALY_LIMIT}秒タイマー開始`
    );


    massAnomalyTimer =
        setInterval(() => {

            if (!gameStarted) {
                return;
            }


            if (
                activeAnomalies.length <
                MAX_ANOMALIES
            ) {

                stopMassAnomalyTimer();

                return;
            }


            massAnomalyRemaining--;


            if (
                massAnomalyRemaining <= 0
            ) {

                stopMassAnomalyTimer();


                gameOver(
                    "mass-anomaly"
                );

            }

        }, 1000);
}


function stopMassAnomalyTimer() {

    if (
        massAnomalyTimer !== null
    ) {

        clearInterval(
            massAnomalyTimer
        );

    }


    massAnomalyTimer =
        null;

    massAnomalyRemaining =
        0;


    if (massAnomalyWarning) {

        massAnomalyWarning.classList.remove(
            "active"
        );

    }
}


// =========================
// REPORTボタン状態
// =========================

function updateReportButtonStyle() {

    if (!reportButton) {
        return;
    }


    if (
        dangerActive &&
        currentCamera === dangerCamera
    ) {

        reportButton.classList.add(
            "danger-report"
        );

    } else {

        reportButton.classList.remove(
            "danger-report"
        );

    }
}


// =========================
// REPORT長押し開始
// =========================

function startReportHold() {

    if (!gameStarted) {
        return;
    }


    if (holdTimer) {
        return;
    }


    holdDuration =
        (
            dangerActive &&
            currentCamera ===
                dangerCamera
        )
            ? 2000
            : 1200;


    holdStartTime =
        performance.now();


    playSound(
        "hold_start.mp3"
    );


    holdLoopAudio =
        new Audio(
            "sounds/hold_loop.mp3"
        );


    holdLoopAudio.loop =
        true;

    holdLoopAudio.volume =
        0.7;


    holdLoopAudio.play()
        .catch(() => {});


    reportButton.classList.add(
        "holding"
    );


    if (reportProgress) {

        reportProgress.style.width =
            "0%";

    }


    updateReportHoldProgress();


    holdProgressTimer =
        setInterval(
            updateReportHoldProgress,
            30
        );


    holdTimer =
        setTimeout(() => {

            finishReportHold();

        }, holdDuration);
}


// =========================
// REPORT進捗
// =========================

function updateReportHoldProgress() {

    if (!holdStartTime) {
        return;
    }


    const elapsed =
        performance.now() -
        holdStartTime;


    const remaining =
        Math.max(
            0,
            holdDuration - elapsed
        );


    const progress =
        Math.min(
            100,
            (
                elapsed /
                holdDuration
            ) * 100
        );


    if (reportProgress) {

        reportProgress.style.width =
            `${progress}%`;

    }


    const seconds =
        (
            remaining / 1000
        ).toFixed(1);


    if (reportButtonText) {

        reportButtonText.textContent =
            `${seconds}s`;

    }


    updateReportButtonStyle();
}


// =========================
// REPORT長押し完了
// =========================

function finishReportHold() {

    if (holdLoopAudio) {

        holdLoopAudio.pause();

        holdLoopAudio.currentTime =
            0;

        holdLoopAudio =
            null;
    }


    if (holdTimer) {

        clearTimeout(
            holdTimer
        );

    }


    holdTimer =
        null;


    if (holdProgressTimer) {

        clearInterval(
            holdProgressTimer
        );

    }


    holdProgressTimer =
        null;

    holdStartTime =
        null;


    reportButton.classList.remove(
        "holding"
    );


    if (reportProgress) {

        reportProgress.style.width =
            "0%";

    }


    if (reportButtonText) {

        reportButtonText.textContent =
            "REPORT";

    }


    reportAnomaly();
}


// =========================
// REPORTキャンセル
// =========================

function cancelReportHold() {

    if (!holdTimer) {
        return;
    }


    clearTimeout(
        holdTimer
    );

    holdTimer =
        null;


    if (holdProgressTimer) {

        clearInterval(
            holdProgressTimer
        );

    }


    holdProgressTimer =
        null;

    holdStartTime =
        null;


    if (holdLoopAudio) {

        holdLoopAudio.pause();

        holdLoopAudio.currentTime =
            0;

        holdLoopAudio =
            null;
    }


    reportButton.classList.remove(
        "holding"
    );


    if (reportProgress) {

        reportProgress.style.width =
            "0%";

    }


    if (reportButtonText) {

        reportButtonText.textContent =
            "REPORT";

    }
}


// =========================
// REPORT
// =========================

function reportAnomaly() {

    if (!gameStarted) {
        return;
    }


    const currentMode =
        nightVision
            ? "night"
            : "normal";


    // =========================
    // 危険異変
    // =========================

    const danger =
        activeAnomalies.find(
            anomaly =>

                anomaly.type ===
                    "danger" &&

                anomaly.camera ===
                    currentCamera
        );


    if (danger) {

        console.log(
            "危険異変REPORT成功:",
            danger.key
        );


        // タイマーを最優先で止める
        if (
            dangerTimer !== null
        ) {

            clearTimeout(
                dangerTimer
            );

            dangerTimer =
                null;

        }


        activeAnomalies =
            activeAnomalies.filter(
                anomaly =>
                    anomaly !== danger
            );


        dangerActive =
            false;

        dangerCamera =
            null;

        dangerFile =
            null;

        dangerKey =
            null;

        dangerVideoPlaying =
            false;


        if (dangerVideo) {

            dangerVideo.pause();

            dangerVideo.currentTime =
                0;

            dangerVideo.style.display =
                "none";

        }


        stopDangerEffects();


        falseReports =
            0;

        updateFalseReports();


        checkMassAnomaly();


        showReportSuccess();

        return;
    }


    // =========================
    // 通常異変
    // =========================

    const normal =
        activeAnomalies.find(
            anomaly =>

                anomaly.type ===
                    "normal" &&

                anomaly.camera ===
                    currentCamera
        );


    if (normal) {

        if (
            normal.mode !==
            currentMode
        ) {

            falseReport();

            return;
        }


        activeAnomalies =
            activeAnomalies.filter(
                anomaly =>
                    anomaly !== normal
            );


        falseReports =
            0;


        updateFalseReports();

        checkMassAnomaly();

        showReportSuccess();

        return;
    }


    // =========================
    // セット異変
    // =========================

    const paired =
        activeAnomalies.find(
            anomaly =>

                anomaly.type ===
                    "paired" &&

                anomaly.camera ===
                    currentCamera
        );


    if (paired) {

        activeAnomalies =
            activeAnomalies.filter(
                anomaly =>
                    anomaly !== paired
            );


        falseReports =
            0;


        updateFalseReports();

        checkMassAnomaly();

        showReportSuccess();

        return;
    }


    falseReport();
}


// =========================
// 誤報
// =========================

function falseReport() {

    falseReports++;


    updateFalseReports();


    playSound(
        "report_failure.mp3"
    );


    if (
        falseReports >= 5
    ) {

        gameOver(
            "false-report"
        );

        return;
    }


    showFalseReportMessage();
}


// =========================
// REPORT成功
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
// 誤報メッセージ
// =========================

function showFalseReportMessage() {

    const oldMessage =
        document.getElementById(
            "falseReportMessage"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const message =
        document.createElement(
            "div"
        );


    message.id =
        "falseReportMessage";


    message.textContent =
        "異常はありませんでした";


    message.style.position =
        "fixed";

    message.style.left =
        "50%";

    message.style.top =
        "50%";

    message.style.transform =
        "translate(-50%, -50%)";

    message.style.zIndex =
        "9999";

    message.style.color =
        "white";

    message.style.fontSize =
        "28px";

    message.style.fontWeight =
        "bold";

    message.style.textShadow =
        "0 0 10px black";

    message.style.pointerEvents =
        "none";


    document.body.appendChild(
        message
    );


    setTimeout(() => {

        if (
            message.isConnected
        ) {

            message.remove();

        }

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
// GAME OVER
// =========================

function gameOver(
    reason = "unknown"
) {

    if (!gameStarted) {
        return;
    }


    console.error(
        "============================"
    );

    console.error(
        "GAME OVER"
    );

    console.error(
        "原因:",
        reason
    );

    console.error(
        "ゲーム時刻:",
        gameMinutes
    );

    console.error(
        "現在CAM:",
        currentCamera
    );

    console.error(
        "異変数:",
        activeAnomalies.length
    );

    console.error(
        "異変:",
        activeAnomalies
    );

    console.error(
        "============================"
    );


    gameStarted =
        false;


    if (
        gameTimer !== null
    ) {

        clearInterval(
            gameTimer
        );

        gameTimer =
            null;
    }


    if (
        dangerTimer !== null
    ) {

        clearTimeout(
            dangerTimer
        );

        dangerTimer =
            null;
    }


    stopMassAnomalyTimer();

    stopAmbientEventSounds();

    cancelReportHold();


    activeAnomalies =
        [];


    dangerActive =
        false;

    dangerCamera =
        null;

    dangerFile =
        null;

    dangerKey =
        null;

    dangerVideoPlaying =
        false;

    dangerEffectsActive =
        false;


    stopEnvironmentSound();

    stopDangerEffects();


    if (dangerVideo) {

        dangerVideo.pause();

        dangerVideo.currentTime =
            0;

        dangerVideo.style.display =
            "none";

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
// CLEAR
// =========================

function clearGame() {

    if (!gameStarted) {
        return;
    }


    gameStarted =
        false;


    if (
        gameTimer !== null
    ) {

        clearInterval(
            gameTimer
        );

        gameTimer =
            null;
    }


    if (
        dangerTimer !== null
    ) {

        clearTimeout(
            dangerTimer
        );

        dangerTimer =
            null;
    }


    stopMassAnomalyTimer();

    stopAmbientEventSounds();

    cancelReportHold();


    activeAnomalies =
        [];


    dangerActive =
        false;

    dangerCamera =
        null;

    dangerFile =
        null;

    dangerKey =
        null;

    dangerVideoPlaying =
        false;

    dangerEffectsActive =
        false;


    stopEnvironmentSound();

    stopDangerEffects();


    if (dangerVideo) {

        dangerVideo.pause();

        dangerVideo.currentTime =
            0;

        dangerVideo.style.display =
            "none";

    }


    gameScreen.classList.remove(
        "active"
    );


    clearScreen.classList.add(
        "active"
    );
}


// =========================
// GAME START
// =========================

function startGame() {

    // =========================
    // 前回タイマー完全削除
    // =========================

    if (
        gameTimer !== null
    ) {

        clearInterval(
            gameTimer
        );

        gameTimer =
            null;
    }


    if (
        dangerTimer !== null
    ) {

        clearTimeout(
            dangerTimer
        );

        dangerTimer =
            null;
    }


    stopMassAnomalyTimer();

    stopAmbientEventSounds();

    cancelReportHold();

    stopEnvironmentSound();

    stopDangerEffects();


    // =========================
    // 初期化
    // =========================

    gameStarted =
        true;


    currentCamera =
        1;

    nightVision =
        false;

    falseReports =
        0;

    gameMinutes =
        0;


    activeAnomalies =
        [];


    // 最初の異変は00:30
    nextAnomalySpawnTime =
        30;


    dangerActive =
        false;

    dangerCamera =
        null;

    dangerFile =
        null;

    dangerKey =
        null;

    dangerVideoPlaying =
        false;

    dangerEffectsActive =
        false;


    if (dangerVideo) {

        dangerVideo.pause();

        dangerVideo.currentTime =
            0;

        dangerVideo.removeAttribute(
            "src"
        );

        dangerVideo.load();

        dangerVideo.style.display =
            "none";

    }


    usedNormalAnomalies.clear();

    usedPairedAnomalies.clear();

    usedDangerAnomalies.clear();


    updateFalseReports();

    updateGameTime();

    updateNightButton();

    updateReportButtonStyle();


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


    updateCameraImage();

    startEnvironmentSound();

    startGameTimer();

    startAmbientEventSounds();


    console.log(
        "GAME START"
    );
}


// =========================
// ランダム環境イベント
// =========================

function startAmbientEventSounds() {

    stopAmbientEventSounds();

    scheduleNextAmbientEvent();
}


function scheduleNextAmbientEvent() {

    if (!gameStarted) {
        return;
    }


    // 20～50秒後
    const delay =
        Math.floor(
            Math.random() *
            30000
        ) +
        20000;


    ambientEventTimer =
        setTimeout(() => {

            if (gameStarted) {

                playRandomAmbientEvent();

            }


            scheduleNextAmbientEvent();

        }, delay);
}


function playRandomAmbientEvent() {

    const sounds = [

        "rap1.mp3",
        "rap2.mp3",
        "rap3.mp3",
        "rap4.mp3",
        "rap5.mp3",
        "rap6.mp3",
        "rap7.mp3",
        "rap8.mp3",
        "rap9.mp3",
        "rap10.mp3",
        "rap11.mp3",
        "rap12.mp3",
        "rap13.mp3",
        "rap14.mp3",
        "rap15.mp3",
        "rap16.mp3",
        "rap17.mp3",
        "rap18.mp3",
        "rap19.mp3",
        "rap20.mp3",
        "rap21.mp3",
        "rap22.mp3"

    ];


    const file =
        sounds[
            Math.floor(
                Math.random() *
                sounds.length
            )
        ];


    const audio =
        new Audio(
            `sounds/${file}`
        );


    audio.volume =
        0.8;


    audio.play()
        .catch(() => {});
}


function stopAmbientEventSounds() {

    if (
        ambientEventTimer !== null
    ) {

        clearTimeout(
            ambientEventTimer
        );

    }


    ambientEventTimer =
        null;
}


// =========================
// START
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
    () => {

        changeCamera(-1);

    }
);


nextButton.addEventListener(
    "click",
    () => {

        changeCamera(1);

    }
);


// =========================
// NIGHT VISION
// =========================

if (nightButton) {

    nightButton.addEventListener(
        "click",
        () => {

            toggleNightVision();

        }
    );
}


// =========================
// REPORT マウス
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


// =========================
// REPORT タッチ
// =========================

reportButton.addEventListener(
    "touchstart",
    (e) => {

        e.preventDefault();

        startReportHold();

    },
    {
        passive: false
    }
);


reportButton.addEventListener(
    "touchend",
    (e) => {

        e.preventDefault();

        cancelReportHold();

    },
    {
        passive: false
    }
);


reportButton.addEventListener(
    "touchcancel",
    cancelReportHold
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

            e.preventDefault();


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

            e.preventDefault();

            cancelReportHold();

        }

    }
);