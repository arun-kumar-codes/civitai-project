import {
  Badge,
  Button,
  ButtonProps,
  Group,
  Tooltip,
  createPolymorphicComponent,
  useMantineTheme,
  Text,
} from '@mantine/core';
import { IconBolt, IconDownload } from '@tabler/icons-react';
import { forwardRef } from 'react';
import { JoinPopover } from '~/components/JoinPopover/JoinPopover';
import { abbreviateNumber } from '~/utils/number-helpers';

const _DownloadButton = forwardRef<HTMLButtonElement, Props>(
  ({ iconOnly, canDownload, downloadPrice, children, tooltip, joinAlert, ...buttonProps }, ref) => {
    const theme = useMantineTheme();
    const purchaseIcon = (
      <Badge
        radius="sm"
        size="sm"
        variant="filled"
        color="yellow.7"
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          boxShadow: theme.shadows.sm,
          padding: '4px 2px',
          paddingRight: '6px',
        }}
      >
        <Group spacing={0}>
          <IconBolt style={{ fill: theme.colors.dark[9] }} color="dark.9" size={16} />{' '}
          <Text color="dark.9">{abbreviateNumber(downloadPrice ?? 0, { decimals: 0 })}</Text>
        </Group>
      </Badge>
    );

    const button = iconOnly ? (
      <Tooltip label={tooltip ?? 'Download options'} withArrow>
        <Button pos="relative" ref={ref} {...buttonProps} variant="light">
          <IconDownload size={24} />
          {downloadPrice && <>{purchaseIcon}</>}
        </Button>
      </Tooltip>
    ) : (
      <Button pos="relative" ref={ref} {...buttonProps}>
        <Group spacing={8} noWrap>
          <IconDownload size={20} />
          {downloadPrice && <>{purchaseIcon}</>}
          {children}
        </Group>
      </Button>
    );

    return canDownload || (downloadPrice ?? 0) > 0 ? (
      button
    ) : (
      <JoinPopover message={joinAlert ?? 'You need to be a member to start the download'}>
        {button}
      </JoinPopover>
    );
  }
);
_DownloadButton.displayName = 'DownloadButton';

type Props = ButtonProps & {
  iconOnly?: boolean;
  canDownload?: boolean;
  downloadPrice?: number;
  modelVersionId?: number;
  tooltip?: string;
  joinAlert?: string;
};

export const DownloadButton = createPolymorphicComponent<'button', Props>(_DownloadButton);
