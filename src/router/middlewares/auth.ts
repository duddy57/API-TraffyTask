import { prisma } from "@/src/lib/prisma";
import jwt from "@elysiajs/jwt";
import type Elysia from "elysia";
import { JWT_NAME } from "../config/constant";

interface Env{
    JWT_SECRET: string;
}

const env: Env = Bun.env as unknown as Env;

export const authPlugin = (app:Elysia) => 
    app
    .use(
        jwt({
            name: JWT_NAME,
            secret: env.JWT_SECRET!,
        })
    )
    .derive(async({ jwt, cookie:{accessToken}, set }) => {
        if(!accessToken.value) {
            set.status = "Unauthorized"
            throw new Error("Token de acesso não fornecido")
        }
        const jwtPayload = await jwt.verify(accessToken.value)
        if(!jwtPayload) {
            set.status = "Forbidden"
            throw new Error("Token de acesso inválido")
        }

        const userId = jwtPayload.sub

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user) {
            set.status = "Forbidden"
            throw new Error("Token de acesso inválido")
        }

        return {
            user,
        }
    })