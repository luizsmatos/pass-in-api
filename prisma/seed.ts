import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  await prisma.event.create({
    data: {
      id: 'ec755272-e528-4a70-969d-c5e136f065ee',
      title: 'NodeJS Summit',
      details: 'The best NodeJS conference in the world',
      slug: 'nodejs-summit',
      maximumAttendees: 120,
    },
  })
}

seed().then(() => {
  console.log('Database seeded.')
  prisma.$disconnect()
})
