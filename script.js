window.onload = () => {
    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
        client_id: "147934510488-allie69121uoboqbr26nhql7u0205res.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        scope: "https://www.googleapis.com/auth/drive.file"
    });

    // Render Google Sign-In Button
    window.google.accounts.id.renderButton(
        document.querySelector(".g_id_signin"),
        { theme: "outline", size: "large" }
    );
};

// Handle Google Sign-In Response
function handleCredentialResponse(response) {
    const idToken = response.credential;
    console.log("Encoded JWT ID token:", idToken);
    alert("Sign-In successful!");

    window.localStorage.setItem("google_id_token", idToken);
    document.getElementById("fileInput").style.display = "inline-block";
    document.getElementById("uploadBtn").disabled = false;
}

// File Input Change Event
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
let selectedFiles = [];

fileInput.addEventListener("change", (event) => {
    fileList.innerHTML = ""; // Clear previous list
    selectedFiles = Array.from(event.target.files); // Update selected files array
    selectedFiles.forEach((file) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";
        fileItem.textContent = file.name;
        fileItem.onclick = () => toggleFileSelection(fileItem);
        fileList.appendChild(fileItem);
    });
});

// Toggle File Selection
function toggleFileSelection(fileItem) {
    fileItem.classList.toggle("highlighted");
}

// Handle File Upload
document.getElementById("uploadBtn").addEventListener("click", () => {
    const idToken = window.localStorage.getItem("google_id_token");
    if (!idToken) {
        alert("Please sign in first.");
        return;
    }

    selectedFiles.forEach((file) => {
        uploadFileToGoogleDrive(file, idToken);
    });
});

// Function to Upload Files to Google Drive
function uploadFileToGoogleDrive(file, idToken) {
    const uploadStatus = document.getElementById("uploadStatus");
    uploadStatus.textContent = `Uploading ${file.name}...`;

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart");
    xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            uploadStatus.textContent = `Uploading ${file.name}: ${progress}%`;
        }
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            uploadStatus.textContent = `${file.name} uploaded successfully!`;
        } else {
            uploadStatus.textContent = `Failed to upload ${file.name}.`;
        }
    };

    xhr.onerror = () => {
        uploadStatus.textContent = `Error uploading ${file.name}.`;
    };

    xhr.send(formData);
}
