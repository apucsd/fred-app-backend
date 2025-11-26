import QueryBuilder from '../../builder/QueryBuilder';
import { monthNames } from '../../constant';
import { prisma } from '../../utils/prisma';

const getAllStatsFromDB = async () => {
    const totalUser = await prisma.user.count({
        where: {
            role: 'USER',
        },
    });
    const totalBusiness = await prisma.user.count({
        where: {
            role: 'BUSINESS',
        },
    });
    const totalPackage = await prisma.package.count({
        where: {
            status: 'ACTIVE',
        },
    });
    const totalSubscription = await prisma.subscription.count({
        where: {
            status: 'ACTIVE',
        },
    });
    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
    });
    const totalPayment = await prisma.payment.count();
    const totalEvent = await prisma.event.count();
    const totalMusic = await prisma.music.count();
    const totalProduct = await prisma.product.count();
    const totalSupportTicket = await prisma.supportTicket.count();

    return {
        totalUser,
        totalBusiness,
        totalPackage,
        totalSubscription,
        totalRevenue: totalRevenue._sum.amount,
        totalPayment,
        totalEvent,
        totalMusic,
        totalProduct,
        totalSupportTicket,
    };
};

const getMonthlyRevenue = async (year: number = 2025): Promise<{ [key: string]: number }> => {
    const startDate = new Date(Number(year), 0, 1);
    const endDate = new Date(Number(year), 11, 31, 23, 59, 59, 999);

    const payments = await prisma.payment.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: 'COMPLETED',
        },
        select: {
            amount: true,
            createdAt: true,
        },
    });

    const revenueByMonth: { [key: string]: number } = {
        jan: 0,
        feb: 0,
        mar: 0,
        apr: 0,
        may: 0,
        jun: 0,
        jul: 0,
        aug: 0,
        sep: 0,
        oct: 0,
        nov: 0,
        dec: 0,
    };

    payments.forEach((payment) => {
        const monthIndex = payment.createdAt.getMonth();
        const monthKey = monthNames[monthIndex];
        revenueByMonth[monthKey] += payment.amount;
    });

    return revenueByMonth;
};

const getMonthlyUser = async (year: number = 2025): Promise<{ [key: string]: number }> => {
    const startDate = new Date(Number(year), 0, 1);
    const endDate = new Date(Number(year), 11, 31, 23, 59, 59, 999);

    const users = await prisma.user.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            createdAt: true,
        },
    });

    const usersByMonth: { [key: string]: number } = {
        jan: 0,
        feb: 0,
        mar: 0,
        apr: 0,
        may: 0,
        jun: 0,
        jul: 0,
        aug: 0,
        sep: 0,
        oct: 0,
        nov: 0,
        dec: 0,
    };

    users.forEach((user) => {
        const monthIndex = user.createdAt.getMonth();
        const monthKey = monthNames[monthIndex];
        usersByMonth[monthKey] += 1;
    });

    return usersByMonth;
};

const getAllPaymentFromDB = async (query: Record<string, any>) => {
    const payments = await new QueryBuilder(prisma.payment, query)
        .include({
            user: {
                select: {
                    name: true,
                    email: true,
                    profile: true,
                },
            },
            package: {
                select: {
                    name: true,
                    price: true,
                },
            },
        })
        .search(['amount', 'user.name', 'user.email'])
        .filter()
        .sort()
        .paginate()
        .execute();
    return payments;
};

export const StatsService = {
    getAllStatsFromDB,
    getMonthlyRevenue,
    getMonthlyUser,
    getAllPaymentFromDB,
};
