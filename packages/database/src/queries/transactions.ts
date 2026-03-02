import prisma from '../prisma';

// ==================== TRANSACTION/SALES QUERIES ====================
export const transactionQueries = {
  findAll: async () => {
    return prisma.$queryRaw`SELECT * FROM transactions ORDER BY created_at DESC`;
  },

  findById: async (id: string) => {
    const results = await prisma.$queryRaw`SELECT * FROM transactions WHERE id = ${id}`;
    return (results as any[])[0] || null;
  },

  findByUserId: async (userId: string) => {
    return prisma.$queryRaw`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;
  },

  getStats: async () => {
    const totalResult = await prisma.$queryRaw`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'completed'
    `;
    const countResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM transactions`;
    const avgResult = await prisma.$queryRaw`
      SELECT COALESCE(AVG(amount), 0) as average FROM transactions WHERE status = 'completed'
    `;
    
    return {
      totalRevenue: Number((totalResult as any[])[0]?.total || 0),
      totalTransactions: Number((countResult as any[])[0]?.count || 0),
      avgOrderValue: Number((avgResult as any[])[0]?.average || 0),
    };
  },

  create: async (data: any) => {
    const result = await prisma.$queryRaw`
      INSERT INTO transactions (user_id, amount, currency, status, product_type, product_name)
      VALUES (${data.userId}, ${data.amount}, ${data.currency || 'usd'}, ${data.status || 'completed'}, ${data.productType || 'subscription'}, ${data.productName || null})
      RETURNING *
    `;
    return (result as any[])[0];
  },

  update: async (id: string, data: any) => {
    const result = await prisma.$queryRaw`
      UPDATE transactions 
      SET status = ${data.status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return (result as any[])[0];
  },

  delete: async (id: string) => {
    await prisma.$queryRaw`DELETE FROM transactions WHERE id = ${id}`;
    return { id };
  },
};
