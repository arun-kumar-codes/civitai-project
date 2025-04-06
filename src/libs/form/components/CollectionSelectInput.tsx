import {
  ActionIcon,
  Button,
  Input,
  InputWrapperProps,
  LoadingOverlay,
  Paper,
  Text,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { openCollectionSelectModal } from '~/components/Dialog/dialog-registry';
import { EdgeMedia2 } from '~/components/EdgeMedia/EdgeMedia';
import { trpc } from '~/utils/trpc';

export function CollectionSelectInput({ value, username, onChange, ...inputWrapperProps }: Props) {
  const { data, isInitialLoading, isRefetching } = trpc.collection.getById.useQuery(
    { id: value as number },
    { enabled: !!value }
  );

  const handleSelect = (collection: Props['value']) => {
    onChange?.(collection);
  };

  const image = data?.collection ? data.collection.image : null;

  return (
    <Input.Wrapper {...inputWrapperProps}>
      <Paper className="relative" px="sm" py="xs" mt={5} withBorder>
        <LoadingOverlay visible={isInitialLoading || isRefetching} />
        {!data?.collection || !value ? (
          <Button
            variant="outline"
            onClick={() => {
              openCollectionSelectModal({ username, onSelect: handleSelect });
            }}
            fullWidth
          >
            Click here to select a collection
          </Button>
        ) : (
          <div className="flex flex-nowrap items-center justify-between">
            <div className="flex flex-nowrap items-center gap-2">
              {image && (
                <div className="relative size-16 shrink-0 grow-0 overflow-hidden rounded-md">
                  <EdgeMedia2 src={image.url} type="image" width={450} anim={false} />
                </div>
              )}
              <Text lineClamp={1}>{data?.collection?.name}</Text>
            </div>
            <ActionIcon radius="xl" color="red" variant="light" onClick={() => onChange?.(null)}>
              <IconX />
            </ActionIcon>
          </div>
        )}
      </Paper>
    </Input.Wrapper>
  );
}

type Props = Omit<InputWrapperProps, 'children' | 'onChange'> & {
  username: string;
  value?: number;
  onChange?: (value?: number | null) => void;
};
