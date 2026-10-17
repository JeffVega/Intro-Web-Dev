const roles = [
    { id: "fostering", name: "Fostering", interest: "fostering" },
    { id: "animal-care", name: "Animal care", interest: "volunteering" },
    { id: "socialization", name: "Socialization", interest: "volunteering" },
    { id: "outreach", name: "Community outreach", interest: "volunteering" },
];

const rules = {
    name: {
        required: true,
        minLength: 2,
        empty: "We'd love to know who you are. Please add your name.",
        short: "Your name looks a little short. Please use at least 2 characters.",
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        empty: "Please add your email so we can reply to you.",
        format: "That email doesn't look quite right. Try something like name@example.com.",
    },
    phone: {
        required: false,
        pattern: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
        format: "That phone number is missing some digits. Please enter all 10.",
    },
    interest: {
        required: true,
        empty: "Please pick what you're interested in.",
    },
    message: {
        required: true,
        minLength: 10,
        empty: "Please tell us a little about what interests you.",
        short: "Just a bit more, please. Your message needs at least 10 characters.",
    },
};

const STORAGE_KEY = "savedInterests";

/* Input: none. Output: array of saved role ids from localStorage. */
function getSavedInterests() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

/* Input: array of role ids. Output: none (saves them to localStorage). */
function saveInterests(savedIds) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
}

/* Input: role id. Output: matching role object from roles. */
function findRole(id) {
    return roles.find((role) => role.id === id);
}

/* Input: role id. Output: none (saves or un-saves the role, then updates the page). */
function toggleInterest(id) {
    let savedIds = getSavedInterests();

    if (savedIds.includes(id)) {
        savedIds = savedIds.filter((savedId) => savedId !== id);
    } else {
        savedIds.push(id);
    }

    saveInterests(savedIds);
    updateInterestButtons();
    showSavedList();
}

/* Input: none. Output: none (updates button text and pressed state). */
function updateInterestButtons() {
    const savedIds = getSavedInterests();
    const buttons = document.querySelectorAll("[data-role]");

    buttons.forEach((button) => {
        const role = findRole(button.dataset.role);
        const isSaved = savedIds.includes(role.id);

        button.textContent = isSaved
            ? "Saved: " + role.name
            : "Save interest: " + role.name;
        button.setAttribute("aria-pressed", isSaved);
    });
}

/* Input: none. Output: none (fills the "Your saved interests" list). */
function showSavedList() {
    const list = document.getElementById("saved-list");
    if (!list) return;

    const savedIds = getSavedInterests();
    list.innerHTML = "";

    if (savedIds.length === 0) {
        list.innerHTML = "<li>No interests saved yet.</li>";
        return;
    }

    savedIds.forEach((id) => {
        const item = document.createElement("li");
        item.textContent = findRole(id).name;
        list.appendChild(item);
    });
}

/* Input: none. Output: none (adds click events to the role buttons). */
function setUpInterestButtons() {
    const buttons = document.querySelectorAll("[data-role]");

  buttons.forEach((button) => {
      console.log(console.log(button.dataset))
        button.addEventListener("click", () => {
            toggleInterest(button.dataset.role);
        });
    });

    updateInterestButtons();
    showSavedList();
}

/* Input: none. Output: none (fills the topic and message from saved roles). */
function prefillForm() {
    const interestSelect = document.getElementById("interest");
    const messageBox = document.getElementById("message");
    const savedIds = getSavedInterests();

    if (savedIds.length === 0) return;

    const savedRoles = savedIds.map(findRole);
    const roleNames = savedRoles.map((role) => role.name);

    if (interestSelect.value === "") {
        interestSelect.value = savedRoles[0].interest;
    }

    if (messageBox.value === "") {
        messageBox.value = "I'm interested in: " + roleNames.join(", ") + ".";
    }
}

/* Input: form field and error text. Output: none (shows or clears the error). */
function showError(field, message) {
    const error = document.getElementById(field.id + "-error");
    error.textContent = message;
    field.setAttribute("aria-invalid", message !== "");
}

/* Input: phone text. Output: digits formatted as 555-123-4567. */

function formatPhone(value) {
    const digits = value
        .replace(/\D/g, "")
        .replace(/^1(?=\d{10}$)/, "")
        .slice(0, 10);

    return digits.replace(
        /^(\d{3})(\d{0,3})(\d{0,4})$/,
        (_, a, b, c) => [a, b, c].filter(Boolean).join("-")
    );
}


/* Input: form field. Output: true if valid, false if not. */
function checkField(field) {
    const rule = rules[field.id];
    const value = field.value.trim();
    let message = "";

    if (value === "") {
        message = rule.required ? rule.empty : "";
    } else if (rule.minLength && value.length < rule.minLength) {
        message = rule.short;
    } else if (rule.pattern && !rule.pattern.test(value)) {
        message = rule.format;
    }

    showError(field, message);
    return message === "";
}

/* Input: none. Output: none (adds validation events to the contact form). */
function setUpContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.noValidate = true;

    const fields = Object.keys(rules).map((id) => document.getElementById(id));

    const phone = document.getElementById("phone");
    phone.addEventListener("input", () => {
        phone.value = formatPhone(phone.value);
    });

    fields.forEach((field) => {
        field.addEventListener("input", () => {
            if (field.getAttribute("aria-invalid") === "true") {
                checkField(field);
            }
        });
        field.addEventListener("blur", () => checkField(field));
    });
    /* Input event, for an event listener */
    form.addEventListener("submit", (event) => {
        let firstInvalid = null;
        /* Base Case  Value */
        fields.forEach((field) => {
            if (!checkField(field) && firstInvalid === null) {
                firstInvalid = field;
            }
        });

        if (firstInvalid) {
            event.preventDefault();
            firstInvalid.focus();
            return;
        }

        const name = document.getElementById("name").value.trim();
        document.getElementById("demo-note").textContent =
            name + ", we have successfully sent your message.";
        saveInterests([]);
    });

    prefillForm();
}

setUpInterestButtons();
setUpContactForm();
