import { Elysia } from "elysia";
import { prisma } from "@/src/lib/prisma";
import { signupBodySchema } from "../config/config";

export const routerCreateUser = new Elysia().post(
    "/cadastro",
    async ({
        body
    }) => {
       const hash = await Bun.password.hash(body.password, {
        algorithm: "bcrypt",
        cost: 10
       })

       const user = await prisma.user.create({
        data: {
            ...body,
            password:hash
        }
       })
       return {
        message: "Usuário criado com sucesso",
        data: {
            user
        }
       }
    },
    {
        body: signupBodySchema,
        error({code, set, body}) {
            if((code as unknown) === "P2002") {
                set.status = "Conflict"
                return {
                    message: `O e-mail: ${body.email} ,parece já estar cadastrado`
                }
            }
        }
    }
)