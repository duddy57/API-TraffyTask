import { prisma } from "@/src/lib/prisma";
import Elysia from "elysia";
import { firstDayOfWeek, lastDayOfWeek } from "../config/config";


export const routerGetWeekPendingGoals = new Elysia().get(
    "/pendentes",
    async () => {
        const goalsCreateUpToWeek = await prisma.goals.findMany({
            where: {
                createdAt:{
                    lte: lastDayOfWeek
                },
            },
            select: {
                goalsId: true,
                title: true,
                desiredWeeklyFrequency: true
            }
        });

        const goalCompletionCounts = await prisma.goalCompletion.groupBy({
            by: ["goalId"],
            where: {
                createdAt: {
                    gte: firstDayOfWeek,
                    lte: lastDayOfWeek,
                },
            },
            _count: {
                id: true,
            }
        })

        const completionCountMap = goalCompletionCounts.reduce<Record<string, number>>((acc, completion) => {
            acc[completion.goalId] = completion._count.id;
            return acc;
        }, {})

        const pendingGoals = goalsCreateUpToWeek.map(goals => ({
            goalsId: goals.goalsId,
            title: goals.title,
            desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
            completedCount: completionCountMap[goals.goalsId] || 0,
        }))

        return {
            pendingGoals: pendingGoals.length > 0 ? pendingGoals : "Parece que vc não tem nenhuma meta pendente, que tal criar outra?"
        }
        
    }
)