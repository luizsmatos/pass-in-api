import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequest } from './_errors/bad-request'

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/events/:eventId/attendees',
    {
      schema: {
        summary: 'Register an attendee',
        tags: ['attendees'],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        response: {
          201: z.object({
            attendeeId: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params
      const { name, email } = request.body

      const attendeeFromEmail = await prisma.attendee.findUnique({
        where: {
          eventId_email: {
            email,
            eventId,
          },
        },
      })

      if (attendeeFromEmail) {
        throw new BadRequest('This e-mail is already registered for this event')
      }

      const [event, amountOfAttendeesForEvent] = await prisma.$transaction([
        prisma.event.findUnique({
          where: {
            id: eventId,
          },
        }),
        prisma.attendee.count({
          where: {
            eventId,
          },
        }),
      ])

      if (
        event?.maximumAttendees &&
        amountOfAttendeesForEvent >= event.maximumAttendees
      ) {
        throw new BadRequest('The maximum number of attendees has been reached')
      }

      const attendee = await prisma.attendee.create({
        data: {
          name,
          email,
          eventId,
        },
      })

      reply.code(201).send({ attendeeId: attendee.id })
    },
  )
}
