import { Cat } from "../models/Cat";
import { CatForm } from "../components/CatForm";
import { CatList } from "../components/CatList";

export function HomeView(
    cats: Cat[],
    onCreate: (cat: Cat) => void,
    onDelete: (id: string) => void
) {
    const root = document.createElement("div");

    root.appendChild(CatForm(onCreate));
    root.appendChild(CatList(cats, onDelete));

    return root;
}