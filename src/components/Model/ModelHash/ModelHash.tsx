import { ActionIcon, Badge, CopyButton, Group, MantineColor, Tooltip } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconChevronRight } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ModelHashType } from '~/shared/utils/prisma/enums';

export const ModelHash = ({
  hashes,
  initialType = 'AutoV2',
  color = 'gray',
  width = 120,
}: Props) => {
  const [preferredType, setPreferredType] = useLocalStorage({
    key: 'preferredModelHashType',
    defaultValue: initialType,
  });
  const [selected, setSelected] = useState(
    hashes.find((hash) => hash.type === preferredType) ?? hashes[0]
  );
  const { hash, type } = selected;
  const hasMore = hashes.length > 1;

  useEffect(() => {
    setSelected(hashes.find((hash) => hash.type === preferredType) ?? hashes[0]);
  }, [preferredType, hashes]);

  const handleNext = () => {
    const next = hashes[(hashes.indexOf(selected) + 1) % hashes.length];
    setPreferredType(next.type);
  };

  return (
    <Group spacing={0} noWrap sx={{ userSelect: 'none' }}>
      <Badge
        variant="outline"
        color={color}
        px={6}
        sx={{
          // width: 60,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderRight: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {type}
      </Badge>
      <CopyButton value={hash}>
        {({ copied, copy }) => (
          <Tooltip label="Copy" withArrow withinPortal>
            <Badge
              px={6}
              variant="outline"
              color={copied ? 'teal' : color}
              sx={{
                cursor: 'pointer',
                overflow: 'hidden',
                width,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: hasMore ? 0 : undefined,
                borderBottomRightRadius: hasMore ? 0 : undefined,
              }}
              onClick={(e) => {
                e.stopPropagation();
                copy();
              }}
            >
              {copied ? 'Copied' : hash}
            </Badge>
          </Tooltip>
        )}
      </CopyButton>
      {hasMore && (
        <ActionIcon
          px={2}
          size={20}
          variant="outline"
          color={color}
          sx={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeft: 0,
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          <IconChevronRight />
        </ActionIcon>
      )}
    </Group>
  );
};

type Props = {
  color?: MantineColor;
  initialType?: ModelHashType;
  hashes: {
    type: ModelHashType;
    hash: string;
  }[];
  width?: number;
};
