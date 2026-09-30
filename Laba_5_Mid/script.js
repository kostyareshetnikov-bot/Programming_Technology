document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");
  const successMessage = document.getElementById("form-success");
  if (!form) return;

  const loginInput = document.getElementById("login");
  const passwordInput = document.getElementById("password");

  const reqLength = document.getElementById("req-length");
  const reqDigit = document.getElementById("req-digit");

  const MIN_LENGTH = 6;

  const passwordRules = {
    length: (value) => value.length >= MIN_LENGTH,
    digit: (value) => /\d/.test(value),
  };

  function isPasswordValid(value) {
    return passwordRules.length(value) && passwordRules.digit(value);
  }

  function updateRequirements(value) {
    const isEmpty = value.length === 0;
    const lengthOk = passwordRules.length(value);
    const digitOk = passwordRules.digit(value);

    reqLength.classList.remove("met", "unmet");
    reqDigit.classList.remove("met", "unmet");

    if (isEmpty) {
      const li = reqLength.querySelector(".req-icon");
      const di = reqDigit.querySelector(".req-icon");
      if (li) li.textContent = "";
      if (di) di.textContent = "";
      return;
    }

    reqLength.classList.add(lengthOk ? "met" : "unmet");
    const lengthIcon = reqLength.querySelector(".req-icon");
    if (lengthIcon) lengthIcon.textContent = lengthOk ? "✓" : "✕";

    reqDigit.classList.add(digitOk ? "met" : "unmet");
    const digitIcon = reqDigit.querySelector(".req-icon");
    if (digitIcon) digitIcon.textContent = digitOk ? "✓" : "✕";
  }

  const fields = {
    login: {
      input: loginInput,
      icon: document.getElementById("login-icon"),
      error: document.getElementById("login-error"),
      validate: (value) => /^[a-zA-Z0-9_]{3,}$/.test(value.trim()),
      message: "Логин: минимум 3 символа, только буквы, цифры и «_».",
    },
    password: {
      input: passwordInput,
      icon: document.getElementById("password-icon"),
      error: document.getElementById("password-error"),
      validate: (value) => isPasswordValid(value),
      message: "Пароль не соответствует требованиям ниже.",
    },
  };

  function setStatus(field, isValid, hasValue) {
    const { input, icon, error, message } = field;
    input.classList.remove("valid", "invalid");
    icon.classList.remove("valid", "invalid");
    icon.textContent = "";

    if (!hasValue) {
      error.textContent = "";
      return;
    }

    if (isValid) {
      input.classList.add("valid");
      icon.classList.add("valid");
      icon.textContent = "✓";
      error.textContent = "";
    } else {
      input.classList.add("invalid");
      icon.classList.add("invalid");
      icon.textContent = "✕";
      error.textContent = message;
    }
  }

  function validateField(field, forceShow = false) {
    const value = field.input.value;
    const hasValue = value.length > 0 || forceShow;
    const isValid = field.validate(value);
    setStatus(field, isValid, hasValue);
    return isValid;
  }

  loginInput.addEventListener("input", () => validateField(fields.login));

  passwordInput.addEventListener("input", () => {
    updateRequirements(passwordInput.value);
    validateField(fields.password);
  });

  updateRequirements("");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    successMessage.classList.remove("show");

    const loginValid = validateField(fields.login, true);
    const passwordValid = validateField(fields.password, true);
    updateRequirements(passwordInput.value);

    if (loginValid && passwordValid) {
      successMessage.classList.add("show");
      form.reset();
      updateRequirements("");
      Object.values(fields).forEach((field) => {
        field.input.classList.remove("valid", "invalid");
        field.icon.classList.remove("valid", "invalid");
        field.icon.textContent = "";
        field.error.textContent = "";
      });
    } else {
      const firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
    }
  });
});