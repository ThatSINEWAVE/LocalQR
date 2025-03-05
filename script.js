const video = document.getElementById("cameraFeed");
const canvas = document.getElementById("qrCanvas");
const resultText = document.getElementById("result");
const ctx = canvas.getContext("2d");
let stream;

async function startCamera() {
    if (stream) {
        stopCamera();
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        video.style.display = "block";
        scanFromCamera();
    } catch (err) {
        alert("Error accessing camera: " + err);
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function scanFromCamera() {
    canvas.style.display = "block";
    const scan = () => {
        if (!stream) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
            resultText.innerText = "QR Code: " + code.data;
            stopCamera();
            video.style.display = "none";
        } else {
            requestAnimationFrame(scan);
        }
    };
    scan();
}

function scanFromImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
        const img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            resultText.innerText = code ? "QR Code: " + code.data : "No QR code found.";
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
}
