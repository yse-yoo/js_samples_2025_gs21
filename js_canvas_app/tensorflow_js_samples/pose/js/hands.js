const video = document.getElementById('webcam');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

let detector;

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 960 }
    });
    video.srcObject = stream;
    await video.play();
}

async function setupModel() {
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    detector = await handPoseDetection.createDetector(model, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
        modelType: '',      // lite or 'full'
        maxHands: 2,            // ← 両手を認識するために必要！
    });
}

function drawHandLandmarks(keypoints) {
    keypoints.forEach((point, index) => {
        const x = point.x * canvas.width / video.videoWidth;
        const y = point.y * canvas.height / video.videoHeight;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'lime';
        ctx.fill();
    });
}

async function detectHands() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hands = await detector.estimateHands(video, { flipHorizontal: true });

    hands.forEach((hand, index) => {
        drawHandLandmarks(hand.keypoints);
    });
    requestAnimationFrame(detectHands);
}

async function app() {
    await setupCamera();
    await setupModel();
    detectHands();
}

app();