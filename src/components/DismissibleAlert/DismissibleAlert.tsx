import { Alert, AlertProps, createStyles, Group, MantineColor, Stack, Text } from '@mantine/core';
import { StorageType, useStorage } from '~/hooks/useStorage';
import { useIsClient } from '~/providers/IsClientProvider';

export const DismissibleAlert = (props: DismissibleAlertProps) => {
  const isClient = useIsClient();
  if (!isClient) return null;
  if (!props.id) {
    return <AlertContentInner {...props} />;
  }
  return <AlertDismissable {...props} />;
};

function AlertDismissable({
  id,
  getInitialValueInEffect = true,
  storage = 'localStorage',
  ...props
}: DismissibleAlertProps) {
  const [dismissed, setDismissed] = useStorage({
    type: storage,
    key: `alert-dismissed-${id}`,
    defaultValue:
      typeof window !== 'undefined'
        ? window?.localStorage?.getItem(`alert-dismissed-${id}`) === 'true'
        : false,
    getInitialValueInEffect,
  });

  if (dismissed) return null;

  return <AlertContentInner onDismiss={() => setDismissed(true)} {...props} />;
}

function AlertContentInner({
  id,
  title,
  content,
  color = 'blue',
  size = 'md',
  emoji,
  icon,
  className,
  children,
  onDismiss,
  ...props
}: DismissibleAlertProps & { onDismiss?: () => void }) {
  const { classes, cx } = useStyles({ color });
  const contentSize = size === 'md' ? 'sm' : 'xs';
  return (
    <Alert
      py={8}
      {...props}
      className={cx(className, classes.announcement)}
      onClose={onDismiss}
      closeButtonLabel="Close alert"
      withCloseButton={!!onDismiss}
    >
      <Group spacing="xs" noWrap pr="xs">
        {emoji && (
          <Text size={36} p={0} sx={{ lineHeight: 1.2 }}>
            {emoji}
          </Text>
        )}
        {icon}
        <Stack spacing={0}>
          {title && (
            <Text size={size} weight={500} className={classes.title} mb={4}>
              {title}
            </Text>
          )}
          <Text size={contentSize} className={classes.text}>
            {children ?? content}
          </Text>
        </Stack>
      </Group>
    </Alert>
  );
}

type DismissibleAlertProps = {
  id?: string;
  content?: React.ReactNode;
  children?: React.ReactNode;
  title?: React.ReactNode;
  color?: MantineColor;
  emoji?: string | null;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  getInitialValueInEffect?: boolean;
  storage?: StorageType;
} & Omit<AlertProps, 'color' | 'children'>;

const useStyles = createStyles((theme, { color }: { color: MantineColor }) => ({
  announcement: {
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors[color][9] : theme.colors[color][2]
    }`,
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.fn.darken(theme.colors[color][8], 0.5)
        : theme.colors[color][1],
  },
  title: {
    color: theme.colorScheme === 'dark' ? theme.colors[color][0] : theme.colors[color][7],
    lineHeight: 1.1,
  },
  text: {
    color: theme.colorScheme === 'dark' ? theme.colors[color][2] : theme.colors[color][9],
    lineHeight: 1.2,
    '& > div > a': {
      color: theme.colorScheme === 'dark' ? theme.colors[color][1] : theme.colors[color][8],
    },
  },
}));
