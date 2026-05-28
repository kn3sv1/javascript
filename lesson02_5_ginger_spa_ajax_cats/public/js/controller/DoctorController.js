import { IndexDoctorsPage } from "../view/IndexDoctorsPage.js";
import { DoctorRepository } from "../repository/DoctorRepository.js";

export const DoctorController = {
    init(selector) {
        this.selector = selector;

        return this;
    },

    async index() {
        const doctors = await DoctorRepository.getAll();
        const page = IndexDoctorsPage.init(this.selector);
        page.render(doctors);
    },
};