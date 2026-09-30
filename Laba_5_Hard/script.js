document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");
  const successMessage = document.getElementById("form-success");
  if (!form) return;

  const fields = {
    name: {
      input: document.getElementById("name"),
      icon: document.getElementById("name-icon"),
      error: document.getElementById("name-error"),
      validate: (value) => value.trim().length >= 2,
      message: "Имя должно содержать минимум 2 символа.",
    },
    email: {
      input: document.getElementById("email"),
      icon: document.getElementById("email-icon"),
      error: document.getElementById("email-error"),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: "Введите корректный e-mail.",
    },
    password: {
      input: document.getElementById("password"),
      icon: document.getElementById("password-icon"),
      error: document.getElementById("password-error"),
      validate: (value) => /^(?=.*\d).{6,}$/.test(value),
      message: "Пароль: минимум 6 символов и хотя бы одна цифра.",
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

  Object.values(fields).forEach((field) => {
    field.input.addEventListener("input", () => validateField(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    successMessage.classList.remove("show");

    let isFormValid = true;
    Object.values(fields).forEach((field) => {
      if (!validateField(field, true)) isFormValid = false;
    });

    if (isFormValid) {
      successMessage.classList.add("show");
      form.reset();
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