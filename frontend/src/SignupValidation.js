function Validation(values) {
  let error = {};
  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d\W_]{8,}$/;
  const phone_pattern = /^\d{10}$/;

  if (values.username === "") {
    error.username = "Username should not be empty";
  }

  if (values.phone === "") {
    error.phone = "Phone number should not be empty";
  } else if (!phone_pattern.test(values.phone)) {
    error.phone = "Phone number should be exactly 10 digits";
  }

  if (values.city === "") {
    error.city = "";
  }

  if (values.email === "") {
    error.email = "Email should not be empty";
  } else if (!email_pattern.test(values.email)) {
    error.email = "Invalid email format";
  }

  if (values.password === "") {
    error.password = "Password should not be empty";
  } else if (!password_pattern.test(values.password)) {
    error.password =
      "Password should have at least one symbol, [a-z] letters, [A-Z] letters, and at least 8 characters";
  }

  return error;
}
export default Validation;
