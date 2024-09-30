import Elysia from "elysia";
import { authPlugin } from "../middlewares/auth";
import { routerCreateUser } from "./createUser";
import { ACCESS_TOKEN, JWT_NAME, REFRESH_TOKEN } from "../config/constant";
import { prisma } from "@/src/lib/prisma";
import { getExpTimestamp, loginBodySchema } from "../config/config";
import jwt from "@elysiajs/jwt";

export const authRoutes = new Elysia({ prefix: "/auth"})
    .use(
        jwt({
          name: JWT_NAME,
          secret: Bun.env["JWT_SECRET"]!,
        })
      )
    .post("/cadastrar", routerCreateUser)
    .post("/entrar", async ({ body, jwt, cookie: { accessToken, refreshToken }, set }) => {
          // match user email
          const user = await prisma.user.findUnique({
            where: { email: body.email },
            select: {
              id: true,
              email: true,
              password: true,
            },
          });
    
          if (!user) {
            set.status = "Bad Request";
            throw new Error(
              "O email ou senha informado parece incorreto"
            );
          }
    
          // match password
          const matchPassword = await Bun.password.verify(
            body.password,
            user.password,
            "bcrypt"
          );
          if (!matchPassword) {
            set.status = "Bad Request";
            throw new Error(
              "O email ou senha informado parece incorreto"
            );
          }
    
          // create access token
          const accessJWTToken = await jwt.sign({
            sub: user.id,
            exp: getExpTimestamp(ACCESS_TOKEN),
          });
          accessToken.set({
            value: accessJWTToken,
            httpOnly: true,
            maxAge: ACCESS_TOKEN,
            path: "/",
          });
    
          // create refresh token
          const refreshJWTToken = await jwt.sign({
            sub: user.id,
            exp: getExpTimestamp(REFRESH_TOKEN),
          });
          refreshToken.set({
            value: refreshJWTToken,
            httpOnly: true,
            maxAge: REFRESH_TOKEN,
            path: "/",
          });
    
          // set user profile as online
          const updatedUser = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              isOnline: true,
              refreshTokens: refreshJWTToken,
            },
          });
    
          return {
            message: "logado com sucesso",
            data: {
              user: updatedUser,
              accessToken: accessJWTToken,
              refreshToken: refreshJWTToken,
            },
          };
        },
        {
          body: loginBodySchema,
        }
    )
    .use(authPlugin)
    .post("/sair", async ({ cookie: {accessToken, refreshToken}, user
    }) => {
        accessToken.remove();
        refreshToken.remove();

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isOnline: false,
                refreshTokens: null
            }
        })
        return {
            message: "Logout com sucesso!"
        }
    })
    .post("/refresh", async ({ cookie: {accessToken, refreshToken}, jwt, set }) => {
        if(!refreshToken.value) {
            set.status = "Unauthorized"
            throw new Error("Token de refresh não fornecido")
        }
        const jwtPayload = await jwt.verify(refreshToken.value)
        if(!jwtPayload) {
            set.status = "Forbidden"
            throw new Error("Token de refresh inválido")
        }
        const userId = jwtPayload.sub
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!user) {
            set.status = "Forbidden"
            throw new Error("Usuário não encontrado")
        }

        const access = await jwt.sign({
            sub: user.id,
            exp: getExpTimestamp(ACCESS_TOKEN)
        })

        accessToken.set({
            value: access,
            httpOnly: true,
            maxAge: ACCESS_TOKEN,
            path: "/"
        })

        const refresh = await jwt.sign({
            sub: user.id,
            exp: getExpTimestamp(REFRESH_TOKEN)
        })

        refreshToken.set({
            value: refresh,
            httpOnly: true,
            maxAge: REFRESH_TOKEN,
            path: "/"
        })

        await prisma.user.update({
            where:{
                id: userId
            },
            data: {
                refreshTokens: refresh
            }
        })

        return {
            message: "Sessão recarregada com sucesso",
            data: {
                accessToken: access,
                refreshToken: refresh
            }
        }
    })
    .get("/me", ({ user }) => {
        return {
          message: "Dados do usuário",
          data: {
            user,
          },
        };
      }
    );
    