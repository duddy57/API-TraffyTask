import { Elysia } from "elysia";
import { authRoutes } from "../router/auth";
import { goalsRoutes } from "../router/goals";

const app = new Elysia();
  app
    .use(authRoutes)
    .use(goalsRoutes)

app.listen(3000)
