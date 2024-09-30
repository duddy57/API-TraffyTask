import { prisma } from "@/src/lib/prisma";
import Elysia from "elysia";

export const routerRemoveGoals = new Elysia().delete(
    "/remover/:goalsId", // Adicionando o parâmetro à rota
    async ({ params }) => {
        const { goalsId } = params;

        try{

            await prisma.$transaction(async (tx) => {

                await tx.goalCompletion.deleteMany({
                    where: {
                        goalId: goalsId
                    }
                })

                await tx.goals.delete({
                    where: {
                        goalsId: goalsId
                    }
                })

            })

            return {
                status: 200,
                message: "Meta excluídas com sucesso!"
            }

        } catch (error) {
            console.error("Detalhes do erro:", error);
            return {
                status: 500,
                message: "Erro ao tentar excluir a meta",
                error: error
            }
        }
    
    }
)