import {
  createCustomerHandler,
  createSubscriptionSessionHandler,
  createManageSubscriptionSessionHandler,
  createDonateSessionHandler,
  getBuzzPackagesHandler,
  createBuzzSessionHandler,
  getPaymentIntentHandler,
  getSetupIntentHandler,
  createCancelSubscriptionSessionHandler,
} from './../controllers/stripe.controller';
import { publicProcedure, router, protectedProcedure } from '~/server/trpc';
import * as Schema from '../schema/stripe.schema';

export const stripeRouter = router({
  createCustomer: protectedProcedure
    .input(Schema.createCustomerSchema)
    .mutation(createCustomerHandler),
  createSubscriptionSession: protectedProcedure
    .input(Schema.createSubscribeSessionSchema)
    .mutation(createSubscriptionSessionHandler),
  createManageSubscriptionSession: protectedProcedure.mutation(
    createManageSubscriptionSessionHandler
  ),
  createCancelSubscriptionSession: protectedProcedure.mutation(
    createCancelSubscriptionSessionHandler
  ),
  createDonateSession: protectedProcedure
    .input(Schema.createDonateSessionSchema)
    .mutation(createDonateSessionHandler),
  getBuzzPackages: publicProcedure.query(getBuzzPackagesHandler),
  createBuzzSession: protectedProcedure
    .input(Schema.createBuzzSessionSchema)
    .mutation(createBuzzSessionHandler),
  getPaymentIntent: protectedProcedure
    .input(Schema.paymentIntentCreationSchema)
    .mutation(getPaymentIntentHandler),
  getSetupIntent: protectedProcedure
    .input(Schema.setupIntentCreateSchema)
    .query(getSetupIntentHandler),
});
