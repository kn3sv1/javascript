import { Router } from "./Router.js";

const router = Router.init("app");
router.render(location.pathname);