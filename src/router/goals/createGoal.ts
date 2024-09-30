import { prisma } from "@/src/lib/prisma";
import Elysia from "elysia";

interface CreateGoalRequest {
  authorId: string;
  title: string
  desiredWeeklyFrequency: number;
}

export const routerCreateGoals = new Elysia().post(
    "/criar",
    async ({
        body
    }) => {
        const { authorId, title, desiredWeeklyFrequency } = body as CreateGoalRequest;

        if (!authorId ||!title ||!desiredWeeklyFrequency) {
            return {
                status: 400,
                message:'Todos os campos são obrigatórios'
            };
        }

        const user = await prisma.user.findUnique({
            where: {
                id: authorId,
            },
        });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        try{
            const goal = await prisma.goals.create({
                data: {
                    authorId,
                    title,
                    desiredWeeklyFrequency
                },
            })

            return {
                status: 201,
                message: 'Meta criada com sucesso',
                data: {
                    goal
                },
            }
        } 
        catch (error) {
            console.error("Detalhes do erro:", error);
            return {
              status: 500,
              message: 'Erro ao tentar criar a meta',
              error: error,
            };
          }
    }
)