// Задача: форма регистрации студента 
// Проверка заполнения обязательных полей: ФИО, e-mail, курс, согласие с правилами

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");
  const successMessage = document.getElementById("form-success");

  if (!form) return;

  const fields = {
    fullname: {
      input: document.getElementById("fullname"),
      error: document.getElementById("fullname-error"),
      validate: (value) => value.trim().length > 0,
      message: "Заполните ФИО.",
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("email-error"),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: "Введите корректный e-mail.",
    },
    course: {
      input: document.getElementById("course"),
      error: document.getElementById("course-error"),
      validate: (value) => value !== "",
      message: "Выберите курс.",
    },
    agreement: {
      input: document.getElementById("agreement"),
      error: document.getElementById("agreement-error"),
      validate: (_, input) => input.checked,
      message: "Необходимо согласие с правилами.",
    },
  };

  function validateField(field) {
    const { input, error, validate, message } = field;
    const value = input.value;
    const isValid = validate(value, input);

    if (isValid) {
      input.classList.remove("invalid");
      error.textContent = "";
    } else {
      input.classList.add("invalid");
      error.textContent = message;
    }

    return isValid;
  }

  Object.values(fields).forEach((field) => {
    const eventType =
      field.input.type === "checkbox" || field.input.tagName === "SELECT"
        ? "change"
        : "input";
    field.input.addEventListener(eventType, () => validateField(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    successMessage.classList.remove("show");

    let isFormValid = true;

    Object.values(fields).forEach((field) => {
      const valid = validateField(field);
      if (!valid) isFormValid = false;
    });

    if (isFormValid) {
      successMessage.classList.add("show");
      form.reset();
      Object.values(fields).forEach((field) =>
        field.input.classList.remove("invalid")
      );
    } else {
      // фокус на первое невалидное поле
      const firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
    }
  });
});