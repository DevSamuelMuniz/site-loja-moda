import { config as loadEnv } from 'dotenv';
import { getPrisma } from '@/lib/db';

loadEnv({ path: ['.env.local', '.env'], quiet: true });

const prisma = getPrisma();
const users = await prisma.user.findMany({ select: { email: true, role: true, active: true } });
console.warn(`usuarios: ${users.length}`);
for (const user of users) console.warn(`- ${user.email} ${user.role} active=${user.active}`);
console.warn(`clientes: ${await prisma.customer.count()}`);
console.warn(`pedidos: ${await prisma.order.count()}`);
console.warn(`produtos: ${await prisma.product.count()}`);
process.exit(0);
