import { Group, Progress, Skeleton, Stack, Text, createStyles } from '@mantine/core';
import { Fragment, createContext, useContext } from 'react';

import { IconBadge } from '~/components/IconBadge/IconBadge';
import {
  getAverageRating,
  getRatingCount,
  roundRating,
  useQueryResourceReviewTotals,
} from '~/components/ResourceReview/resourceReview.utils';
import { StarRating } from '~/components/StartRating/StarRating';
import { ThumbsUpIcon } from '~/components/ThumbsIcon/ThumbsIcon';
import { ResourceReviewRatingTotals } from '~/types/router';
import { containerQuery } from '~/utils/mantine-css-helpers';
import { abbreviateNumber } from '~/utils/number-helpers';

type ContextState = {
  count: number;
  rating: number;
  modelId: number;
  loading?: boolean;
  totals?: ResourceReviewRatingTotals;
  modelVersionId?: number;
};

type Props = {
  modelId: number;
  modelVersionId?: number;
  children: React.ReactNode;
};

const SummaryContext = createContext<ContextState | null>(null);
const useSummaryContext = () => {
  const context = useContext(SummaryContext);
  if (!context) throw new Error('SummaryContext not in tree');
  return context;
};

export function ResourceReviewSummary({ modelId, modelVersionId, children }: Props) {
  const { totals, loading } = useQueryResourceReviewTotals({
    modelId,
    modelVersionId,
  });

  const count = getRatingCount(totals);
  const rating = getAverageRating(totals, count);

  return (
    <SummaryContext.Provider
      value={{
        count,
        rating,
        loading,
        totals,
        modelVersionId,
        modelId,
      }}
    >
      {children}
    </SummaryContext.Provider>
  );
}

ResourceReviewSummary.Header = function Header({
  rating: initialRating,
  count: initialCount,
}: {
  rating?: number;
  count?: number;
}) {
  const { rating, count, modelVersionId, loading } = useSummaryContext();
  const showSkeleton = loading && (!initialRating || !initialCount);
  const roundedRating = roundRating(rating ?? initialRating ?? 0);

  return (
    <Stack spacing={0}>
      {showSkeleton ? (
        <>
          <Skeleton height={12.8} my={6} />
          <Skeleton height={12.8} my={6} />
        </>
      ) : (
        <>
          <Group>
            <Text>Reviews</Text>
            <Text size="sm" color="dimmed">
              {count ?? initialCount} {!!modelVersionId ? 'version' : ''} ratings
            </Text>
          </Group>
          <Group>
            <StarRating value={roundedRating} />
            <Text>{roundedRating} out of 5</Text>
          </Group>
        </>
      )}
    </Stack>
  );
};

const ratings = ['5', '4', '3', '2', '1'] as (keyof ResourceReviewRatingTotals)[];
ResourceReviewSummary.Totals = function Totals() {
  const { classes } = useStyles();
  const { totals, count, loading } = useSummaryContext();

  return loading ? (
    <Stack spacing={4}>
      {ratings.map((r) => (
        <Skeleton height={12} my={6} key={r} />
      ))}
    </Stack>
  ) : (
    <div className={classes.grid}>
      {ratings.map((rating) => {
        const progress = (totals && count ? totals[rating] / count : 0) * 100;
        const rounded = Math.ceil(progress);
        return (
          <Fragment key={rating}>
            <Text>{rating} star</Text>
            <Progress value={progress} color="yellow" size="lg" />
            <Text align="right">{rounded}%</Text>
          </Fragment>
        );
      })}
    </div>
  );
};

ResourceReviewSummary.Simple = function Simple({
  rating: initialRating,
  count: initialCount,
  onClick,
}: {
  rating?: number;
  count?: number;
  onClick: () => void;
}) {
  const { rating, count, loading } = useSummaryContext();
  const roundedRating = roundRating(rating ?? initialRating ?? 0);
  const { classes } = useStyles();

  if (loading && initialRating === undefined && initialCount === undefined) {
    return null;
  }

  return (
    <Stack spacing={0}>
      <IconBadge
        radius="sm"
        color="gray"
        size="lg"
        icon={<StarRating value={roundedRating} />}
        sx={{ cursor: 'pointer' }}
        onClick={onClick}
      >
        <Text className={classes.badgeText}>{abbreviateNumber(count ?? 0)}</Text>
      </IconBadge>
    </Stack>
  );
};

const useStyles = createStyles((theme) => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr max-content',
    alignItems: 'center',
    columnGap: theme.spacing.md,
    rowGap: 4,
  },

  badgeText: {
    fontSize: theme.fontSizes.md,
    [containerQuery.smallerThan('md')]: {
      fontSize: theme.fontSizes.sm,
    },
  },
}));
