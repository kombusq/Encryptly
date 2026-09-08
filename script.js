const inputSlider = document.querySelector("[data-lengthSlider]");
const lengthDisplay = document.querySelector("[data-lengthNumber]");
const passwordDisplay = document.querySelector("[data-passwordDisplay]");
const copyBtn = document.querySelector("[data-copy]");
const copyMsg = document.querySelector("[data-copyMsg]");
const generatedState = document.querySelector("[data-generatedState]");
const strengthText = document.querySelector("[data-strengthText]");
const strengthMeter = document.querySelector("[data-strengthMeter]");
const formMessage = document.querySelector("[data-formMessage]");
const generateBtn = document.querySelector(".generateButton");
const allCheckBox = [...document.querySelectorAll("input[type=checkbox]")];
const symbols = '~`!@#$%^&*()_-+={[}]|:;"<,>.?/';

let password = "";
let passwordLength = 10;
let copyTimeout;

function randomInRange(min, max) {
    const range = max - min;
    const cutoff = Math.floor(0x100000000 / range) * range;
    const value = new Uint32Array(1);

    do { crypto.getRandomValues(value); } while (value[0] >= cutoff);
    return min + (value[0] % range);
}

function getSelectedGenerators() {
    const generators = [];
    if (document.querySelector("#uppercase").checked) generators.push(() => String.fromCharCode(randomInRange(65, 91)));
    if (document.querySelector("#lowercase").checked) generators.push(() => String.fromCharCode(randomInRange(97, 123)));
    if (document.querySelector("#numbers").checked) generators.push(() => String(randomInRange(0, 10)));
    if (document.querySelector("#symbols").checked) generators.push(() => symbols[randomInRange(0, symbols.length)]);
    return generators;
}

function updateSlider() {
    inputSlider.value = passwordLength;
    lengthDisplay.textContent = passwordLength;
    const percentage = ((passwordLength - Number(inputSlider.min)) * 100) / (Number(inputSlider.max) - Number(inputSlider.min));
    inputSlider.style.setProperty("--fill", `${percentage}%`);
}

function getStrength() {
    const count = getSelectedGenerators().length;
    if (count === 0 || passwordLength < 6) return ["weak", "Weak"];
    if (count <= 1 || passwordLength < 8) return ["fair", "Fair"];
    if (count >= 3 && passwordLength >= 12) return ["strong", "Strong"];
    return ["good", "Good"];
}

function updateStrength() {
    const [level, label] = getStrength();
    strengthText.textContent = label;
    strengthText.style.color = level === "weak" ? "var(--danger)" : level === "strong" ? "var(--mint)" : "var(--warning)";
    strengthMeter.dataset.strength = level;
    strengthMeter.setAttribute("aria-label", `Password strength: ${label.toLowerCase()}`);
}

function shuffle(chars) {
    for (let index = chars.length - 1; index > 0; index--) {
        const randomIndex = randomInRange(0, index + 1);
        [chars[index], chars[randomIndex]] = [chars[randomIndex], chars[index]];
    }
    return chars.join("");
}

function syncOptions() {
    const selected = getSelectedGenerators().length;
    if (passwordLength < selected) passwordLength = selected;
    updateSlider();
    updateStrength();
    formMessage.textContent = "";
}

function generatePassword() {
    const generators = getSelectedGenerators();
    if (!generators.length) {
        formMessage.textContent = "Choose at least one character type to continue.";
        return;
    }
    formMessage.textContent = "";
    const characters = generators.map((generator) => generator());
    while (characters.length < passwordLength) characters.push(generators[randomInRange(0, generators.length)]());
    password = shuffle(characters);
    passwordDisplay.value = password;
    copyBtn.disabled = false;
    generatedState.textContent = "Generated just now";
    generatedState.classList.add("is-ready");
    updateStrength();
}

async function copyContent() {
    try { await navigator.clipboard.writeText(password); copyMsg.textContent = "Copied"; }
    catch { copyMsg.textContent = "Copy failed"; }
    copyMsg.classList.add("active");
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => copyMsg.classList.remove("active"), 1800);
}

inputSlider.addEventListener("input", (event) => { passwordLength = Number(event.target.value); updateSlider(); updateStrength(); });
allCheckBox.forEach((checkbox) => checkbox.addEventListener("change", syncOptions));
generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", () => { if (password) copyContent(); });

updateSlider();
updateStrength();
