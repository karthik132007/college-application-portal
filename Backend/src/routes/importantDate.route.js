import { Router } from "express";
import { getDates, updateDates } from "../controllers/importantDate.controller.js";

const datesRouter = Router();

datesRouter.get('/', getDates);
datesRouter.put('/', updateDates);

export default datesRouter;
