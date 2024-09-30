import Elysia from "elysia";
import { authPlugin } from "../middlewares/auth";
import { routerCreateGoals } from "./createGoal";
import { routerCreateGoalsCompletions } from "./createGoalsCompletion";
import { routerGetWeekSummary } from "./getWeekSummary";
import { routerGetWeekPendingGoals } from "./getPendingGoals";
import { routerRemoveGoals } from "./removeGoal";

export const goalsRoutes = new Elysia({ prefix: "/metas"})
    .use(authPlugin)
    .use(routerCreateGoals)
    .use(routerCreateGoalsCompletions)
    .use(routerGetWeekSummary)
    .use(routerGetWeekPendingGoals)
    .use(routerRemoveGoals)