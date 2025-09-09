const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: '507f1f77bcf86cd799439011' }
    })

    if (existingUser) {
      console.log('Demo user already exists')
      return
    }

    // Create demo user
    const user = await prisma.user.create({
      data: {
        id: '507f1f77bcf86cd799439011',
        name: 'Lara Ajailat',
        email: 'demo@example.com',
        password: 'demo' // Not used anymore but required by schema
      }
    })

    console.log('Demo user created:', user)
  } catch (error) {
    console.error('Error creating demo user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUser()
