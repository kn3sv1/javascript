import { Cat } from "../models/Cat";

export function CatList(
    cats: Cat[],
    onDelete: (id: string) => void
) {
    const ul = document.createElement("ul");

    cats.forEach((cat) => {
        const li = document.createElement("li");

        li.innerHTML = `
            ${cat.name} (${cat.age}) - ${cat.city}
            <button>Delete</button>
        `;

        li.querySelector("button")!.onclick = () =>
            onDelete(cat.id!);

        ul.appendChild(li);
    });

    return ul;
}