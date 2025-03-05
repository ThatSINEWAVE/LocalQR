const video = document.getElementById("cameraFeed");
const canvas = document.getElementById("qrCanvas");
const resultText = document.getElementById("result");
const uploadedPreview = document.getElementById("uploadedPreview");
const ctx = canvas.getContext("2d");
let stream;

async function startCamera() {
    if (stream) {
        stopCamera();
    }

    try {
        // Hide uploaded image and show camera feed
        uploadedPreview.style.display = "none";
        video.style.display = "block";

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment"
            }
        });
        video.srcObject = stream;
        scanFromCamera();
    } catch (err) {
        showResult("Error accessing camera: " + err.message, "error");
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.style.display = "none";
}

function scanFromCamera() {
    const scan = () => {
        if (!stream) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, canvas.height);

            if (code) {
                showResult("QR Code detected: " + code.data, "success");
                stopCamera();
            } else {
                requestAnimationFrame(scan);
            }
        } catch (error) {
            showResult("Scanning error: " + error.message, "error");
        }
    };
    scan();
}

function scanFromImage(event) {
    stopCamera(); // Stop camera if running
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedPreview.onload = function() {
            // Display uploaded image
            uploadedPreview.style.display = "block";
            video.style.display = "none";

            canvas.width = uploadedPreview.naturalWidth;
            canvas.height = uploadedPreview.naturalHeight;
            ctx.drawImage(uploadedPreview, 0, 0);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, canvas.height);

                if (code) {
                    showResult("QR Code detected: " + code.data, "success");
                } else {
                    showResult("No QR code found in image", "error");
                }
            } catch (error) {
                showResult("Scanning error: " + error.message, "error");
            }
        };
        uploadedPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showResult(text, status = "normal") {
    resultText.innerHTML = `<i class="fas fa-${status === "success" ? "check-circle" : "exclamation-circle"}"></i> ${text}`;
    resultText.className = status;
}