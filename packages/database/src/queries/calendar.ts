import prisma from '../prisma';

// ==================== CALENDAR EVENT QUERIES ====================
export const calendarEventQueries = {
  findAll: async () => {
    return prisma.calendarEvent.findMany({
      orderBy: { scheduledAt: 'asc' }
    });
  },

  findById: async (id: string) => {
    return prisma.calendarEvent.findUnique({
      where: { id }
    });
  },

  findByDate: async (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.calendarEvent.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
  },

  findByDateRange: async (startDate: Date, endDate: Date) => {
    return prisma.calendarEvent.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
  },

  create: async (data: any) => {
    return prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType || 'video',
        scheduledAt: new Date(data.scheduledAt),
        status: data.status || 'scheduled'
      }
    });
  },

  update: async (id: string, data: any) => {
    return prisma.calendarEvent.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      }
    });
  },

  delete: async (id: string) => {
    return prisma.calendarEvent.delete({
      where: { id }
    });
  },
};
