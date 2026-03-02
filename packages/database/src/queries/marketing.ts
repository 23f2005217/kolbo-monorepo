import prisma from '../prisma';

// ==================== PUSH NOTIFICATION QUERIES ====================
export const pushNotificationQueries = {
  findAll: async () => {
    return prisma.$queryRaw`
      SELECT * FROM push_notifications ORDER BY created_at DESC
    `;
  },

  findById: async (id: string) => {
    const results = await prisma.$queryRaw`
      SELECT * FROM push_notifications WHERE id = ${id}
    `;
    return (results as any[])[0] || null;
  },

  create: async (data: any) => {
    const result = await prisma.$queryRaw`
      INSERT INTO push_notifications (title, message, target_audience, scheduled_at, status)
      VALUES (${data.title}, ${data.message}, ${data.targetAudience || 'all'}, ${data.scheduledAt || null}, ${data.status || 'draft'})
      RETURNING *
    `;
    return (result as any[])[0];
  },

  update: async (id: string, data: any) => {
    const result = await prisma.$queryRaw`
      UPDATE push_notifications 
      SET title = ${data.title}, message = ${data.message}, status = ${data.status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return (result as any[])[0];
  },

  delete: async (id: string) => {
    await prisma.$queryRaw`DELETE FROM push_notifications WHERE id = ${id}`;
    return { id };
  },
};

// ==================== COUPON QUERIES ====================
export const couponQueries = {
  findAll: async () => {
    return prisma.$queryRaw`SELECT * FROM coupons ORDER BY created_at DESC`;
  },

  findById: async (id: string) => {
    const results = await prisma.$queryRaw`SELECT * FROM coupons WHERE id = ${id}`;
    return (results as any[])[0] || null;
  },

  findByCode: async (code: string) => {
    const results = await prisma.$queryRaw`SELECT * FROM coupons WHERE code = ${code}`;
    return (results as any[])[0] || null;
  },

  create: async (data: any) => {
    const result = await prisma.$queryRaw`
      INSERT INTO coupons (code, discount_type, discount_value, applies_to, expires_at, usage_limit)
      VALUES (${data.code}, ${data.discountType || 'percentage'}, ${data.discountValue}, ${data.appliesTo || 'all'}, ${data.expiresAt || null}, ${data.usageLimit || null})
      RETURNING *
    `;
    return (result as any[])[0];
  },

  update: async (id: string, data: any) => {
    const result = await prisma.$queryRaw`
      UPDATE coupons 
      SET code = ${data.code}, discount_value = ${data.discountValue}, is_active = ${data.isActive}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return (result as any[])[0];
  },

  delete: async (id: string) => {
    await prisma.$queryRaw`DELETE FROM coupons WHERE id = ${id}`;
    return { id };
  },
};

// ==================== UPSELL OFFER QUERIES ====================
export const upsellOfferQueries = {
  findAll: async () => {
    return prisma.$queryRaw`SELECT * FROM upsell_offers ORDER BY created_at DESC`;
  },

  findById: async (id: string) => {
    const results = await prisma.$queryRaw`SELECT * FROM upsell_offers WHERE id = ${id}`;
    return (results as any[])[0] || null;
  },

  create: async (data: any) => {
    const result = await prisma.$queryRaw`
      INSERT INTO upsell_offers (name, trigger, discount, description, is_active)
      VALUES (${data.name}, ${data.trigger}, ${data.discount}, ${data.description || null}, ${data.isActive !== false})
      RETURNING *
    `;
    return (result as any[])[0];
  },

  update: async (id: string, data: any) => {
    const result = await prisma.$queryRaw`
      UPDATE upsell_offers 
      SET name = ${data.name}, discount = ${data.discount}, is_active = ${data.isActive}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return (result as any[])[0];
  },

  delete: async (id: string) => {
    await prisma.$queryRaw`DELETE FROM upsell_offers WHERE id = ${id}`;
    return { id };
  },
};
