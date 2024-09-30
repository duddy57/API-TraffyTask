import { prisma } from "@/src/lib/prisma";
import Elysia from "elysia";
import { firstDayOfWeek, lastDayOfWeek } from "../config/config";

interface CompleteGoalRequest {
    goalId: string;
}


export const routerCreateGoalsCompletions = new Elysia().post(
    "/concluir-meta",
    async ({ body }) => {
        const { goalId } = body as CompleteGoalRequest;

        try {
            const goal = await prisma.goals.findUnique({
                where: {
                    goalsId: goalId,
                },
                select: {
                    desiredWeeklyFrequency: true,
                },
            });

            if (!goal) {
                return {
                    status: 404,
                    message: 'Meta não encontrada',
                };
            }

            const result = await prisma.goalCompletion.groupBy({
                by: ["goalId"],
                _count: {
                    id: true,
                },
                where: {
                    createdAt: {
                        gte: firstDayOfWeek,
                        lte: lastDayOfWeek,
                    },
                    goalId: goalId,
                },
            });

            const completionCount = result.length > 0 ? result[0]._count.id : 0;

            if (completionCount >= goal.desiredWeeklyFrequency) {
                throw new Error('Ops! Parece que essa meta já foi alcançada essa semana');
            }

            const goalCompletion = await prisma.goalCompletion.create({
                data: {
                    goalId,
                },
            });

            return {
                status: 201,
                message: 'Meta concluída com sucesso',
                goalCompletion,
            };
        } catch (error) {
            console.error("Detalhes do erro:", error);
            return {
                status: 500,
                message: 'Erro ao tentar concluir a meta',
                error: error
            };
        }
    }
);
