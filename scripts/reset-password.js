const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'cassiano@gmail.com';
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
  
  console.log(`Password for ${email} has been updated to: 123456`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
