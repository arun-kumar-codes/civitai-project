import { Box, Center, createStyles, Group, Stack, Text, Title } from '@mantine/core';
import { InferGetServerSidePropsType } from 'next/types';
import { SortFilter } from '~/components/Filters';
import { MasonryContainer } from '~/components/MasonryColumns/MasonryContainer';
import { MasonryProvider } from '~/components/MasonryColumns/MasonryProvider';
import { Meta } from '~/components/Meta/Meta';
import { ModelFiltersDropdown } from '~/components/Model/Infinite/ModelFiltersDropdown';
import { ModelsInfinite } from '~/components/Model/Infinite/ModelsInfinite';
import { useModelQueryParams } from '~/components/Model/model.utils';
import { env } from '~/env/client';
import { constants } from '~/server/common/constants';
import { createServerSideProps } from '~/server/utils/server-side-helpers';
import { containerQuery } from '~/utils/mantine-css-helpers';
import { trpc } from '~/utils/trpc';

export const getServerSideProps = createServerSideProps({
  useSSG: true,
  resolver: async ({ ctx, ssg }) => {
    const tagname = ctx.query.tagname as string;
    if (tagname) await ssg?.tag.getTagWithModelCount.prefetch({ name: tagname });

    return { props: { tagname } };
  },
});

export default function TagPage({
  tagname,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { set, ...queryFilters } = useModelQueryParams();

  const { data = [] } = trpc.tag.getTagWithModelCount.useQuery({ name: tagname });
  const [tag] = data;

  const { classes } = useStyles();

  return (
    <>
      <Meta
        title={`${tag?.name} Stable Diffusion & Flux AI Models | Civitai`}
        description={`Browse ${tag?.name} Stable Diffusion & Flux models, checkpoints, hypernetworks, textual inversions, embeddings, Aesthetic Gradients, and LORAs`}
        links={[{ href: `${env.NEXT_PUBLIC_BASE_URL}/tag/${tagname}`, rel: 'canonical' }]}
      />
      {tag && (
        <Box className={classes.banner} mb="md">
          <Center>
            <Stack spacing="xs">
              <Title order={1} align="center">
                {tag.name}
              </Title>
            </Stack>
          </Center>
        </Box>
      )}
      <MasonryProvider
        columnWidth={constants.cardSizes.model}
        maxColumnCount={7}
        maxSingleColumnWidth={450}
      >
        <MasonryContainer>
          <Stack spacing="xs">
            <Group position="right">
              <SortFilter type="models" />
              <ModelFiltersDropdown size="sm" compact />
            </Group>
            <ModelsInfinite
              filters={{ ...queryFilters, followed: false, hidden: false }}
              showEof
              showAds
            />
          </Stack>
        </MasonryContainer>
      </MasonryProvider>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  banner: {
    marginTop: `-${theme.spacing.md}px`,
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[1],

    [containerQuery.smallerThan('xs')]: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
  },
  image: {
    width: '128px',
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  wrapper: {
    alignItems: 'flex-start',
    [containerQuery.smallerThan('xs')]: {
      alignItems: 'center',
    },
  },
  outsideImage: {
    display: 'none',
    [containerQuery.smallerThan('xs')]: {
      display: 'block',
    },
  },
  insideImage: {
    [containerQuery.smallerThan('xs')]: {
      display: 'none',
    },
  },
  card: {
    [containerQuery.smallerThan('xs')]: {
      width: '100%',
    },
  },
}));
