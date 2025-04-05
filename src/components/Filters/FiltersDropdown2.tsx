import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Indicator, MantineSize } from '@mantine/core';
import { Icon, IconChevronDown, IconProps } from '@tabler/icons-react';
import { ComponentPropsWithoutRef, ForwardRefExoticComponent, RefAttributes } from 'react';
import clsx from 'clsx';

export type FilterButtonProps = ComponentPropsWithoutRef<'button'> & {
  icon?: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  indicatorCount?: number;
  size?: MantineSize;
  variant?: 'default';
};

export function FiltersDropdown2({
  children,
  icon: Icon,
  indicatorCount,
  variant,
  size,
  className,
  ...props
}: FilterButtonProps) {
  return (
    <Popover className="relative">
      <Indicator
        offset={4}
        label={indicatorCount ? indicatorCount : undefined}
        showZero={false}
        dot={false}
        size={16}
        inline
        zIndex={10}
      >
        <PopoverButton
          {...props}
          className={clsx(
            'group flex items-center gap-1 rounded-3xl text-sm font-semibold text-gray-8 dark:text-white',
            size === 'sm' ? 'h-8 px-2' : 'h-9 pl-4 pr-3',
            !variant
              ? clsx(
                  'hover:bg-gray-2 data-[open]:bg-gray-2',
                  'dark:hover:bg-dark-5 dark:data-[open]:bg-dark-4'
                )
              : clsx(
                  'bg-gray-1 hover:bg-gray-2 data-[open]:bg-gray-2',
                  'dark:bg-gray-8 dark:hover:bg-gray-9 dark:data-[open]:bg-gray-9'
                ),

            className
          )}
        >
          {Icon && <Icon size={16} />}
          <span suppressHydrationWarning>{children}</span>
          <IconChevronDown
            className={clsx('ml-1 transition-transform group-data-[open]:rotate-180')}
            size={16}
          />
        </PopoverButton>
      </Indicator>
      <PopoverPanel
        transition
        anchor="bottom"
        className="divide-y divide-white/5 rounded-xl bg-white/5 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
      >
        <div className="p-3">
          <a className="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="#">
            <p className="font-semibold text-white">Insights</p>
            <p className="text-white/50">Measure actions your users take</p>
          </a>
          <a className="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="#">
            <p className="font-semibold text-white">Automations</p>
            <p className="text-white/50">Create your own targeted content</p>
          </a>
          <a className="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="#">
            <p className="font-semibold text-white">Reports</p>
            <p className="text-white/50">Keep track of your growth</p>
          </a>
        </div>
        <div className="p-3">
          <a className="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="#">
            <p className="font-semibold text-white">Documentation</p>
            <p className="text-white/50">Start integrating products and tools</p>
          </a>
        </div>
      </PopoverPanel>
    </Popover>
  );
}
