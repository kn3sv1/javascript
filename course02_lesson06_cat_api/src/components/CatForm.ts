import { Cat } from "../models/Cat";
import {UuidService } from "../services/uuid.service";

export function CatForm(onSubmit: (cat: Cat) => void) {
    const form = document.createElement("form");

    form.innerHTML = `
        <input id="name" placeholder="Name">
        <input id="age" type="number" placeholder="Age">
        <input id="city" placeholder="City">
        <input id="photo" placeholder="Photo">
        <button>Add Cat</button>
    `;

    form.onsubmit = (e) => {
        e.preventDefault();

        onSubmit({
            id: UuidService.getUuidv7(),
            name: (form.querySelector("#name") as HTMLInputElement).value,
            age: Number((form.querySelector("#age") as HTMLInputElement).value),
            city: (form.querySelector("#city") as HTMLInputElement).value,
            photo: (form.querySelector("#photo") as HTMLInputElement).value,
        });

        form.reset();
    };

    return form;
}