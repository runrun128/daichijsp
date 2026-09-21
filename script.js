// ========================================
// SETTINGS
// ========================================

const CAMERA_COUNT = 7;


// 異変が発生するまでの時間
const MIN_EVENT_TIME = 5000;
const MAX_EVENT_TIME = 15000;


// ========================================
// 異変設定
//
// normal = 通常カメラで見える異変
// night  = 暗視カメラで見える異変
//
// 同じカメラに両方入れられる。
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
    document.getElementById("startScreen");

const gameScreen =
    document.getElementById("gameScreen");

const startButton =
    document.getElementById("startButton");

const cameraImage =
    document.getElementById("cameraImage");

const cameraName =
    document.getElementById("cameraName");

const cameraNumber =
    document.getElementById("cameraNumber");

const cameraButtons =
    document.querySelectorAll(".camButton");

const reportButton =
    document.getElementById("reportButton");

const message =
    document.getElementById("message");

const clock =
    document.getElementById("clock");

const nightIndicator =
    document.getElementById("nightIndicator");


// ========================================
// GAME STATE
// ========================================

let currentCamera = 1;

let nightVision = false;

let anomalyCamera = null;

let anomalyType = null;

let anomalyImage = null;

let anomalyTimer = null;

let holdTimer = null;

let gameStarted = false;

let startTime = null;


// ========================================
// AUDIO
// ========================================

const sounds = {

    camera:
        new Audio("sounds/camera.mp3"),

    nightOn:
        new Audio("sounds/night_on.mp3"),

    nightOff:
        new Audio("sounds/night_off.mp3"),

    holdStart:
        new Audio("sounds/hold_start.mp3"),

    holdLoop:
        new Audio("sounds/hold_loop.mp3"),

    success:
        new Audio("sounds/report_success.mp3"),

    failure:
        new Audio("sounds/report_failure.mp3")

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
// PLAY SOUND
// ========================================

function playSound(sound) {

    sound.currentTime = 0;

    sound.play().catch(() => {});

}


// ========================================
// START
// ========================================

startButton.addEventListener(
    "click",
    () => {

        startScreen.style.display =
            "none";

        gameScreen.style.display =
            "block";

        gameStarted = true;

        startGame();

    }
);


// ========================================
// START GAME
// ========================================

function startGame() {

    currentCamera = 1;

    nightVision = false;

    anomalyCamera = null;

    anomalyType = null;

    anomalyImage = null;

    updateCamera();

    scheduleAnomaly();

    startClock();

}


// ========================================
// CAMERA BUTTON
// ========================================

cameraButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const camera =
                Number(
                    button.dataset.camera
                );

            switchCamera(camera);

        }
    );

});


// ========================================
// CAMERA SWITCH
// ========================================

function switchCamera(camera) {

    if (
        camera === currentCamera
    ) {

        return;

    }


    currentCamera = camera;

    playSound(sounds.camera);

    updateCamera();

}


// ========================================
// UPDATE CAMERA
// ========================================

function updateCamera() {

    cameraButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

            if (
                Number(
                    button.dataset.camera
                )
                === currentCamera
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    cameraName.textContent =
        `CAM ${currentCamera}`;

    cameraNumber.textContent =
        String(currentCamera)
            .padStart(2, "0");


    if (nightVision) {

        nightIndicator
            .classList
            .remove("hidden");

    } else {

        nightIndicator
            .classList
            .add("hidden");

    }


    updateImage();

}


// ========================================
// IMAGE
// ========================================

function updateImage() {

    // ------------------------------------
    // 現在のカメラに異変がある
    // ------------------------------------

    if (
        anomalyCamera === currentCamera
    ) {

        // 異変の種類と現在のモードが一致
        if (
            anomalyType ===
            (nightVision ? "night" : "normal")
        ) {

            cameraImage.src =
                `images/anomaly/cam${currentCamera}/${anomalyType}/${anomalyImage}`;

            return;

        }

    }


    // ------------------------------------
    // 通常画像
    // ------------------------------------

    if (nightVision) {

        cameraImage.src =
            `images/night/cam${currentCamera}.jpg`;

    } else {

        cameraImage.src =
            `images/normal/cam${currentCamera}.jpg`;

    }

}


// ========================================
// NIGHT VISION
// ========================================

function toggleNightVision() {

    nightVision = !nightVision;


    if (nightVision) {

        playSound(sounds.nightOn);

    } else {

        playSound(sounds.nightOff);

    }


    updateCamera();

}


// ========================================
// KEYBOARD
// ========================================

document.addEventListener(
    "keydown",
    event => {

        if (!gameStarted) return;


        const key =
            event.key.toLowerCase();


        // A / ←

        if (
            key === "a" ||
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();

            let next =
                currentCamera - 1;

            if (next < 1) {

                next = CAMERA_COUNT;

            }

            switchCamera(next);

        }


        // D / →

        if (
            key === "d" ||
            event.key === "ArrowRight"
        ) {

            event.preventDefault();

            let next =
                currentCamera + 1;

            if (
                next > CAMERA_COUNT
            ) {

                next = 1;

            }

            switchCamera(next);

        }


        // W

        if (
            key === "w" &&
            !event.repeat
        ) {

            toggleNightVision();

        }

    }
);


// ========================================
// RANDOM ANOMALY
// ========================================

function scheduleAnomaly() {

    clearTimeout(anomalyTimer);


    const delay =
        random(
            MIN_EVENT_TIME,
            MAX_EVENT_TIME
        );


    anomalyTimer =
        setTimeout(
            createAnomaly,
            delay
        );

}


// ========================================
// CREATE ANOMALY
// ========================================

function createAnomaly() {

    // すでに異変がある
    if (
        anomalyCamera !== null
    ) {

        scheduleAnomaly();

        return;

    }


    const possible = [];


    // ------------------------------------
    // 異変を持っているカメラを探す
    // ------------------------------------

    for (
        let camera = 1;
        camera <= CAMERA_COUNT;
        camera++
    ) {

        const data =
            anomalies[camera];


        if (
            data.normal &&
            data.normal.length > 0
        ) {

            possible.push({

                camera,
                type: "normal"

            });

        }


        if (
            data.night &&
            data.night.length > 0
        ) {

            possible.push({

                camera,
                type: "night"

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
                Math.random()
                * possible.length
            )
        ];


    anomalyCamera =
        selected.camera;

    anomalyType =
        selected.type;


    const list =
        anomalies[
            anomalyCamera
        ][
            anomalyType
        ];


    anomalyImage =
        list[
            Math.floor(
                Math.random()
                * list.length
            )
        ];


    updateImage();


    console.log(
        "ANOMALY:",
        anomalyCamera,
        anomalyType,
        anomalyImage
    );

}


// ========================================
// REPORT
// ========================================

function startReport() {

    if (!gameStarted) return;


    reportButton.classList.add(
        "holding"
    );


    message.textContent =
        "REPORTING...";


    playSound(
        sounds.holdStart
    );


    // ループ音

    sounds.holdLoop.currentTime = 0;

    sounds.holdLoop.loop = true;

    sounds.holdLoop.play().catch(
        () => {}
    );


    holdTimer =
        setTimeout(
            reportAnomaly,
            1200
        );

}


function cancelReport() {

    clearTimeout(holdTimer);


    reportButton.classList.remove(
        "holding"
    );


    sounds.holdLoop.pause();

    sounds.holdLoop.currentTime = 0;


    if (
        message.textContent
        === "REPORTING..."
    ) {

        message.textContent = "";

    }

}


// ========================================
// REPORT RESULT
// ========================================

function reportAnomaly() {

    reportButton.classList.remove(
        "holding"
    );


    sounds.holdLoop.pause();

    sounds.holdLoop.currentTime = 0;


    // ------------------------------------
    // 正解
    // ------------------------------------

    if (
        anomalyCamera !== null &&
        anomalyCamera === currentCamera &&
        anomalyType ===
            (nightVision
                ? "night"
                : "normal")
    ) {

        playSound(
            sounds.success
        );


        message.textContent =
            "異常を検知しました。";


        anomalyCamera = null;

        anomalyType = null;

        anomalyImage = null;


        updateImage();


        scheduleAnomaly();

    }


    // ------------------------------------
    // 間違い
    // ------------------------------------

    else {

        playSound(
            sounds.failure
        );


        message.textContent =
            "異常は確認されませんでした。";

    }


    setTimeout(
        () => {

            message.textContent = "";

        },
        2000
    );

}


// ========================================
// MOUSE
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
// TOUCH
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
// CLOCK
// ========================================

function startClock() {

    startTime = Date.now();


    setInterval(
        () => {

            const elapsed =
                Date.now()
                - startTime;


            const seconds =
                Math.floor(
                    elapsed / 1000
                );


            const hours =
                Math.floor(
                    seconds / 3600
                );


            const minutes =
                Math.floor(
                    (seconds % 3600)
                    / 60
                );


            const secs =
                seconds % 60;


            clock.textContent =

                `${String(hours)
                    .padStart(2, "0")}:` +

                `${String(minutes)
                    .padStart(2, "0")}:` +

                `${String(secs)
                    .padStart(2, "0")}`;

        },
        1000
    );

}


// ========================================
// RANDOM
// ========================================

function random(min, max) {

    return Math.floor(
        Math.random()
        * (max - min + 1)
    ) + min;

}