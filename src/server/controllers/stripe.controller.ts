import {
  throwAuthorizationError,
  throwDbError,
  throwNotFoundError,
} from '~/server/utils/errorHandling';
import {
  createCustomer,
  createSubscribeSession,
  createManageSubscriptionSession,
  createDonateSession,
  getBuzzPackages,
  createBuzzSession,
  getPaymentIntent,
  getSetupIntent,
  createCancelSubscriptionSession,
} from './../services/stripe.service';
import { Context } from '~/server/createContext';
import * as Schema from '../schema/stripe.schema';

import { getTRPCErrorFromUnknown } from '@trpc/server';
import { createRecaptchaAssesment } from '../recaptcha/client';
import { RECAPTCHA_ACTIONS } from '../common/constants';

export const createCustomerHandler = async ({
  input,
  ctx,
}: {
  input: Schema.CreateCustomerInput;
  ctx: DeepNonNullable<Context>;
}) => {
  return await createCustomer({ ...input });
};

export const createDonateSessionHandler = async ({
  input: { returnUrl },
  ctx,
}: {
  input: Schema.CreateDonateSessionInput;
  ctx: DeepNonNullable<Context>;
}) => {
  const { id, email, customerId } = ctx.user;
  if (!email) throw throwAuthorizationError('email required');
  const result = await createDonateSession({
    returnUrl,
    customerId,
    user: { id, email },
  });

  await ctx.track.userActivity({
    type: 'Donate',
    targetUserId: id,
  });

  return result;
};

export const createSubscriptionSessionHandler = async ({
  input: { priceId },
  ctx,
}: {
  input: Schema.CreateSubscribeSessionInput;
  ctx: DeepNonNullable<Context>;
}) => {
  const { id, email, customerId } = ctx.user;
  if (!email) throw throwAuthorizationError('email required');
  const result = await createSubscribeSession({
    priceId,
    customerId,
    user: { id, email },
  });

  await ctx.track.userActivity({
    type: 'Subscribe',
    targetUserId: id,
  });

  return result;
};

export const createManageSubscriptionSessionHandler = async ({
  ctx,
}: {
  ctx: DeepNonNullable<Context>;
}) => {
  if (!ctx.user.customerId) throw throwNotFoundError('customerId not found');
  return await createManageSubscriptionSession({ customerId: ctx.user.customerId });
};

export const getBuzzPackagesHandler = async () => {
  try {
    const packages = await getBuzzPackages();

    return packages;
  } catch (error) {
    throw throwDbError(error);
  }
};

export const createBuzzSessionHandler = async ({
  input,
  ctx,
}: {
  input: Schema.CreateBuzzSessionInput;
  ctx: DeepNonNullable<Context>;
}) => {
  try {
    const { id, email, customerId } = ctx.user;
    if (!email) throw throwAuthorizationError('email required');

    const result = await createBuzzSession({
      ...input,
      customerId,
      user: { id, email },
    });

    // await ctx.track.userActivity({
    //   type: 'Buy',
    //   targetUserId: id,
    // });

    return result;
  } catch (error) {
    throw getTRPCErrorFromUnknown(error);
  }
};

export const getPaymentIntentHandler = async ({
  input,
  ctx,
}: {
  input: Schema.PaymentIntentCreationSchema;
  ctx: DeepNonNullable<Context>;
}) => {
  try {
    const { id, email, customerId } = ctx.user;

    if (!email) throw throwAuthorizationError('email required');

    const { recaptchaToken } = input;

    if (!recaptchaToken) throw throwAuthorizationError('recaptchaToken required');

    const { score, reasons } = await createRecaptchaAssesment({
      token: recaptchaToken,
      recaptchaAction: RECAPTCHA_ACTIONS.STRIPE_TRANSACTION,
    });

    if ((score || 0) < 0.7) {
      if (reasons.length) {
        throw throwAuthorizationError(
          `Recaptcha Failed. The following reasons were detected: ${reasons.join(', ')}`
        );
      } else {
        throw throwAuthorizationError('We could not verify the authenticity of your request.');
      }
    }

    const result = await getPaymentIntent({
      ...input,
      user: {
        id,
        email,
      },
      customerId,
    });

    return result;
  } catch (error) {
    throw getTRPCErrorFromUnknown(error);
  }
};

export const getSetupIntentHandler = async ({
  input,
  ctx,
}: {
  input: Schema.SetupIntentCreateSchema;
  ctx: DeepNonNullable<Context>;
}) => {
  try {
    const { id, email, customerId } = ctx.user;

    if (!email) throw throwAuthorizationError('email required');

    const result = await getSetupIntent({
      ...input,
      user: {
        id,
        email,
      },
      customerId,
    });

    return result;
  } catch (error) {
    throw getTRPCErrorFromUnknown(error);
  }
};

export const createCancelSubscriptionSessionHandler = async ({
  ctx,
}: {
  ctx: DeepNonNullable<Context>;
}) => {
  if (!ctx.user.customerId) throw throwNotFoundError('customerId not found');
  try {
    return await createCancelSubscriptionSession({ customerId: ctx.user.customerId });
  } catch (error) {
    throw getTRPCErrorFromUnknown(error);
  }
};
