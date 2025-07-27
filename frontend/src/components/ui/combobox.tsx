'use client';
import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Option = { label: string; value: string };

export function Combobox({
  options,
  placeholder = 'Select…',
  value,
  onChange,
}: {
  options: Option[];
  placeholder?: string;
  value: string | null;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const current = options.find(o => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {current ? current.label : <span className="text-gray-400">{placeholder}</span>}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command value={value ?? ''} onValueChange={v => onChange(v)}>
          <CommandInput placeholder="Search…" />
          <CommandGroup>
            {options.map(o => (
              <CommandItem
                key={o.value}
                value={o.value}
                onSelect={v => {
                  onChange(v);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    o.value === value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {o.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
