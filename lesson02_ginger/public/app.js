const API_URL = "/api/posts";

const postList = document.getElementById("postList");
const addBtn = document.getElementById("addBtn");
const titleInput = document.getElementById("titleInput");

let editingId = null;

async function loadPosts() {
  const response = await fetch(API_URL);
  const posts = await response.json();

  postList.innerHTML = "";

  posts.forEach(post => {
    const li = document.createElement("li");

    const text = document.createElement("span");
    text.textContent = post.title;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    editBtn.style.marginLeft = "10px";
    deleteBtn.style.marginLeft = "5px";

    editBtn.addEventListener("click", () => {
      titleInput.value = post.title;
      editingId = post.id;
      addBtn.textContent = "Update Post";
    });

    deleteBtn.addEventListener("click", async () => {
      await deletePost(post.id);
    });

    li.appendChild(text);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    postList.appendChild(li);
  });
}

async function addOrUpdatePost() {
  const title = titleInput.value.trim();

  if (!title) return;

  if (editingId === null) {
    // CREATE
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    });

  } else {
    // UPDATE
    await fetch(`${API_URL}/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: editingId,
        title
      })
    });

    editingId = null;
    addBtn.textContent = "Add Post";
  }

  titleInput.value = "";

  loadPosts();
}

async function deletePost(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  loadPosts();
}

addBtn.addEventListener("click", addOrUpdatePost);

loadPosts();