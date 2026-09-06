const secretInput = document.querySelector("#secret");
const generateButton = document.querySelector("#generate");

const result = document.querySelector("#result");
const codeElement = document.querySelector("#code");

const secondsElement = document.querySelector("#seconds");
const progress = document.querySelector("#progress");

const errorElement = document.querySelector("#error");

let currentCode = "";
let expiresAt = 0;

async function generateCode() {

    const secret = secretInput.value.trim();

    if (!secret) {
        showError("Please enter a Base32 secret.");
        return;
    }

    hideError();

    generateButton.disabled = true;
    generateButton.textContent = "Generating...";

    try {

        const response = await fetch("/api/totp", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                secret
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to generate the code.");
        }

        currentCode = data.code;

        expiresAt = Date.now() + data.expiresIn * 1000;

        codeElement.textContent = currentCode.slice(0, 3) + " " + currentCode.slice(3);

        result.classList.remove("hidden");

        updateTimer();

    } catch (error) {

        showError(error.message || "Something went wrong.");

    } finally {

        generateButton.disabled = false;
        generateButton.textContent = "Generate code";
    }
}

function updateTimer() {

    if (!expiresAt) {
        return;
    }

    const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

    secondsElement.textContent = `${remaining}s`;

    progress.style.transform = `scaleX(${remaining / 30})`;

    if (remaining <= 0) {

        generateCode();

        return;
    }

    requestAnimationFrame(updateTimer);
}

function showError(message) {

    errorElement.textContent = message;

    errorElement.classList.remove("hidden");
}

function hideError() {

    errorElement.textContent = "";

    errorElement.classList.add("hidden");
}

generateButton.addEventListener("click", generateCode);

secretInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        generateCode();
    }

}
);
