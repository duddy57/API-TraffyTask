import { prisma } from "@/src/lib/prisma";
import Elysia from "elysia";
import { firstDayOfWeek, lastDayOfWeek } from "../config/config";
import dayjs from "dayjs";

export const routerGetWeekSummary = new Elysia().get(
    "/resumo-semana",
    async () => {
        const goalsCreateUpToWeek = await prisma.goals.findMany({
            where: {
                createdAt: {
                    lte: lastDayOfWeek
                }
            },
            select:{
                goalsId: true,
                title: true,
                desiredWeeklyFrequency: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })

        const goalsCompleteInWeek = await prisma.goalCompletion.findMany({
            where: {
                createdAt: {
                    gte: firstDayOfWeek,
                    lte: lastDayOfWeek
                }
            },
            include: {
                goal: {
                    select: {
                        goalsId: true,
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt:'desc'
            }
        })
        
        const goalsCompletedByWeekDay: Record<string, {
            completedAtDate: string;
            completion: { id: string; title: string; completedAt: Date; }[];
        }> = {};
        goalsCompleteInWeek.forEach(completion => {
            const completedAtDate = dayjs(completion.createdAt).format('YYYY-MM-DD');

            if (!goalsCompletedByWeekDay[completedAtDate]) {
                goalsCompletedByWeekDay[completedAtDate] = {
                    completedAtDate,
                    completion:[]
                };
            }
            goalsCompletedByWeekDay[completedAtDate].completion.push({
                id: completion.goal.goalsId,
                title: completion.goal.title,
                completedAt: completion.createdAt
            })
        })

        const goalsPerDay = Object.values(goalsCompletedByWeekDay);

        const completedCount = goalsCompleteInWeek.length;
        const totalDesiredFrequency = goalsCreateUpToWeek.reduce((sum, goal) => sum + goal.desiredWeeklyFrequency, 0);

        return {
            summary: {
                completed: completedCount,
                total: totalDesiredFrequency,
                goalsPerDay,
            }
        }
        
    }
) 