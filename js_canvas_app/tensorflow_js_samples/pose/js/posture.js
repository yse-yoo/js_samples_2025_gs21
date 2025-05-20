let detector;
let badPostureCount = 0;
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('webcam');
const feedback = document.getElementById('feedback');
const badPostureDisplay = document.getElementById('bad-posture-count');
const resetButton = document.getElementById('reset-btn');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream;
    await video.play();
}

async function setupDetector() {
    const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
    );
    return detector;
}

function drawKeypoints(keypoints) {
    keypoints.forEach(kp => {
        if (kp.score > 0.5) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
        }
    });
}

function isBadPosture(keypoints) {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const leftEar = keypoints.find(kp => kp.name === 'left_ear');

    if (leftShoulder && leftEar && leftShoulder.score > 0.5 && leftEar.score > 0.5) {
        const deltaY = Math.abs(leftShoulder.y - leftEar.y);
        return deltaY < 20;
    }
    return false;
}

async function detectPose() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const poses = await detector.estimatePoses(video, { flipHorizontal: true });
    if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        drawKeypoints(keypoints);
        if (isBadPosture(keypoints)) {
            feedback.textContent = "⚠️ 猫背になっています！";
            feedback.classList.remove('text-green-600');
            feedback.classList.add('text-red-600');
            badPostureCount++;
            badPostureDisplay.textContent = badPostureCount;
        } else {
            feedback.textContent = "✅ 良い姿勢です";
            feedback.classList.remove('text-red-600');
            feedback.classList.add('text-green-600');
        }
    }
    requestAnimationFrame(detectPose);
}

resetButton.addEventListener('click', () => {
    badPostureCount = 0;
    badPostureDisplay.textContent = 0;
});

async function main() {
    await setupCamera();
    await setupDetector();
    detectPose();
}

main();