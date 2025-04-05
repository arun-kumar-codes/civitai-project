import { Alert, createStyles, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBellFilled } from '@tabler/icons-react';

import { trpc } from '~/utils/trpc';
import React, { useMemo } from 'react';

import { constants } from '~/server/common/constants';
import { MediaHash } from '~/components/ImageHash/ImageHash';
import { ProfileSidebar } from '~/components/Profile/ProfileSidebar';
import { DaysFromNow } from '~/components/Dates/DaysFromNow';
import { CustomMarkdown } from '~/components/Markdown/CustomMarkdown';
import { ProfileNavigation } from '~/components/Profile/ProfileNavigation';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { containerQuery } from '~/utils/mantine-css-helpers';
import { useContainerSmallerThan } from '~/components/ContainerProvider/useContainerSmallerThan';
import { useApplyHiddenPreferences } from '~/components/HiddenPreferences/useApplyHiddenPreferences';
import { ImageGuard2 } from '~/components/ImageGuard/ImageGuard2';
import { ImageContextMenu } from '~/components/Image/ContextMenu/ImageContextMenu';
import { EdgeMedia } from '~/components/EdgeMedia/EdgeMedia';

const useStyles = createStyles((theme) => ({
  message: {
    [containerQuery.smallerThan('sm')]: {
      borderRadius: 0,
      width: 'auto',
      marginLeft: '-16px',
      marginRight: '-16px',
      paddingTop: 2,
      paddingBottom: 2,
    },
  },
  coverImageNSFWActions: {
    height: '100%',
    width: '100%',
  },
  coverImageWrapper: {
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    [containerQuery.smallerThan('sm')]: {
      width: 'auto',
      marginLeft: '-16px',
      marginRight: '-16px',
      maxHeight: 'auto',
      borderRadius: 0,
      display: 'block',
    },
  },
  coverImage: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    height: 0,
    paddingBottom: `${(constants.profile.coverImageAspectRatio * 100).toFixed(3)}%`,

    [containerQuery.smallerThan('sm')]: {
      width: 'auto',
      borderRadius: 0,
      paddingBottom: `${(constants.profile.mobileCoverImageAspectRatio * 100).toFixed(3)}%`,

      div: {
        borderRadius: 0,
      },
    },

    '& > div': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
  profileSection: {
    width: 'auto',
    marginLeft: '-16px',
    marginRight: '-16px',
    padding: '16px',
    position: 'relative',
    background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
  },
  profileSectionWithCoverImage: {
    padding: '0 16px',

    '& > div': {
      position: 'relative',
      height: 'auto',
      top: '-36px', // Half the avatar size.
      marginBottom: '-18px', // half of top.
    },
  },
}));

export function ProfileHeader({ username }: { username: string }) {
  const { data: user } = trpc.userProfile.get.useQuery({
    username,
  });
  const isMobile = useContainerSmallerThan('sm');
  const { classes, cx } = useStyles();

  const cover = user?.profile?.coverImage;
  const images = useMemo(
    () =>
      cover
        ? [cover].map((image) => ({ ...image, tagIds: image.tags.map((x) => x.id) }))
        : undefined,
    [cover]
  );
  const { items } = useApplyHiddenPreferences({
    type: 'images',
    data: images,
    allowLowerLevels: true,
  });
  const image = items[0];

  if (!user) {
    return null;
  }

  const { profile, stats } = user;

  const renderCoverImage = () => {
    if (!image) {
      return null;
    }

    return (
      <div className={classes.coverImageWrapper}>
        <div className={classes.coverImage}>
          <ImageGuard2 image={image}>
            {(safe) => (
              <>
                {!safe ? (
                  <MediaHash {...image} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <EdgeMedia
                    src={image.url}
                    name={image.name ?? image.id.toString()}
                    alt={image.name ?? undefined}
                    type={image.type}
                    width={Math.min(image.width ?? 1920, 1920)}
                    style={{ maxWidth: '100%' }}
                    className="w-full max-w-full absolute-center"
                  />
                )}
                <div className={classes.coverImageNSFWActions}>
                  <ImageGuard2.BlurToggle className="absolute left-2 top-2 z-10" />
                  <ImageContextMenu image={image} className="absolute right-2 top-2 z-10" />
                </div>
              </>
            )}
          </ImageGuard2>
        </div>
      </div>
    );
  };

  const renderMessage = () => {
    if (!profile.message || user.muted) {
      return;
    }

    return (
      <Alert px="xs" className={classes.message}>
        <Group spacing="xs" noWrap>
          <ThemeIcon
            size={32}
            // @ts-ignore: transparent variant does work
            variant="transparent"
            p={0}
          >
            <IconBellFilled />
          </ThemeIcon>
          <Stack spacing={0}>
            <Text>
              <CustomMarkdown
                rehypePlugins={[rehypeRaw, remarkGfm]}
                allowedElements={['a', 'p']}
                unwrapDisallowed
              >
                {profile.message}
              </CustomMarkdown>
            </Text>
            {profile.messageAddedAt && (
              <Text color="dimmed" size="xs">
                <DaysFromNow date={profile.messageAddedAt} />
              </Text>
            )}
          </Stack>
        </Group>
      </Alert>
    );
  };

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {renderMessage()}
        <div className="flex flex-col">
          {renderCoverImage()}
          <div
            className={cx(classes.profileSection, {
              [classes.profileSectionWithCoverImage]: !!image,
            })}
          >
            <ProfileSidebar username={username} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Stack>
      {renderCoverImage()}
      {renderMessage()}
    </Stack>
  );
}
