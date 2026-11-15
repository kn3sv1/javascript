import { layout } from "./layout.js";

export function loginView({ error, user }) {
  let errorMessage = "";
  if (error) {
    errorMessage = `<p class="error">${error}</p>`;
  }

  const content = `
    <style>
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 300px;
      }
      .login-form input {
        padding: 8px;
      }
      .error {
        color: red;
      }
    </style>

    <h1>Login</h1>
    ${errorMessage}

    <form class="login-form" method="POST" action="/login">
      <label>
        Login<br />
        <input type="text" name="username" required />
      </label>
      <label>
        Password<br />
        <input type="password" name="password" required />
      </label>
      <button type="submit">Log in</button>
    </form>
  `;

  return layout({ title: "Login", content, user });
}
