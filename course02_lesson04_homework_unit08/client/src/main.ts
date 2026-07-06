async function loadUsers() {
  const response = await fetch("/api/users");

  const users = await response.json();

  console.log(users);

  document.body.innerHTML += `
    <ul>
      ${users.map((u: any) => `<li>${u.name}</li>`).join("")}
    </ul>
  `;
}

loadUsers();