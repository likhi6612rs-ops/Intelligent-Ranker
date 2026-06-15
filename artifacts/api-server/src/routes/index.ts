import { Router, type IRouter } from "express";
import healthRouter from "./health";
import candidatesRouter from "./candidates";
import rankingRouter from "./ranking";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/candidates", candidatesRouter);
router.use("/ranking", rankingRouter);

export default router;
