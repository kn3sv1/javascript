import { CatsService } from "../services/cats.service";
import { HomeView } from "../views/HomeView";
import { Cat } from "../models/Cat";

export class HomePage {
    private cats: Cat[] = [];

    async render(root: HTMLElement) {
        this.cats = await CatsService.getAll();

        const refresh = async () => {
            this.cats = await CatsService.getAll();

            root.innerHTML = "";
            root.appendChild(
                HomeView(
                    this.cats,
                    async (cat) => {
                        await CatsService.create(cat);
                        await refresh();
                    },
                    async (id) => {
                        await CatsService.delete(id);
                        await refresh();
                    }
                )
            );
        };

        await refresh();
    }
}