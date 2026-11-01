// Names of the form's inputs that fail their HTML constraints (required, pattern, type…).
export const invalidFields = (form) => [...form.querySelectorAll('input[name]')].filter((i) => !i.checkValidity()).map((i) => i.name);
