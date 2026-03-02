import prisma from '../prisma';

// ==================== ARTIST QUERIES ====================
export const artistQueries = {
  findAll: async () => {
    return prisma.$queryRaw`
      SELECT a.*, 
        (SELECT COUNT(*)::int FROM revshare_agreements WHERE "artistId" = a.id) as agreement_count
      FROM artists a 
      WHERE a."isActive" = true 
      ORDER BY a."createdAt" DESC
    `;
  },

  findById: async (id: string) => {
    const results = await prisma.$queryRaw`SELECT * FROM artists WHERE id = ${id}::uuid`;
    return (results as any[])[0] || null;
  },

  create: async (data: any) => {
    const result = await prisma.$queryRaw`
      INSERT INTO artists (id, name, email, bio, "subscriptionSplit", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${data.name}, ${data.email}, ${data.bio || null}, ${data.subscriptionSplit ?? 0}, true, NOW(), NOW())
      RETURNING *
    `;
    return (result as any[])[0];
  },

  update: async (id: string, data: any) => {
    const result = await prisma.$queryRaw`
      UPDATE artists 
      SET name = ${data.name}, email = ${data.email}, bio = ${data.bio}, 
          "subscriptionSplit" = ${data.subscriptionSplit}, "isActive" = ${data.isActive},
          "updatedAt" = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;
    return (result as any[])[0];
  },

  delete: async (id: string) => {
    await prisma.$queryRaw`UPDATE artists SET "isActive" = false WHERE id = ${id}::uuid`;
    return { id };
  },
};

// ==================== REVENUE SHARE AGREEMENT QUERIES ====================
export const revShareAgreementQueries = {
  findAll: async () => {
    return prisma.$queryRaw`
      SELECT ra.*, a.name as artist_name, a.email as artist_email
      FROM revshare_agreements ra
      JOIN artists a ON ra."artistId" = a.id
      ORDER BY ra."createdAt" DESC
    `;
  },

  findById: async (id: string) => {
    const results = await prisma.$queryRaw`
      SELECT ra.*, a.name as artist_name 
      FROM revshare_agreements ra
      JOIN artists a ON ra."artistId" = a.id
      WHERE ra.id = ${id}::uuid
    `;
    return (results as any[])[0] || null;
  },

  create: async (data: any) => {
    const result = await prisma.$queryRaw`
      INSERT INTO revshare_agreements ("artistId", "agreementType", "durationMonths", "revenueSharePercent", "listingFee", "isActive")
      VALUES (${data.artistId}::uuid, ${data.agreementType || 'non_exclusive'}, ${data.durationMonths || 12}, ${data.revenueSharePercent || 50}, ${data.listingFee || 0}, true)
      RETURNING *
    `;
    return (result as any[])[0];
  },

  update: async (id: string, data: any) => {
    const result = await prisma.$queryRaw`
      UPDATE revshare_agreements 
      SET "agreementType" = ${data.agreementType}, "revenueSharePercent" = ${data.revenueSharePercent},
          "isActive" = ${data.isActive}, "updatedAt" = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;
    return (result as any[])[0];
  },

  delete: async (id: string) => {
    await prisma.$queryRaw`DELETE FROM revshare_agreements WHERE id = ${id}::uuid`;
    return { id };
  },
};
