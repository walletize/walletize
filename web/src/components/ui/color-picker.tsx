'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  disabled?: boolean | undefined;
  value?: string;
  name?: string;
  className?: string;
  iconColor: string;
  setIconColor: React.Dispatch<React.SetStateAction<string>>;
  onChange: (_value: string) => void;
  onBlur?: () => void;
}

const ColorPicker = ({
  disabled,
  value,
  onChange,
  onBlur,
  name,
  className,
  iconColor,
  setIconColor,
  ...props
}: ColorPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
        <Button
          {...props}
          className={cn('block', className)}
          name={name}
          onClick={() => {
            setOpen(true);
          }}
          size="icon"
          style={{
            backgroundColor: value,
          }}
          variant="outline"
        >
          <div />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-full flex-col items-center justify-center gap-4">
        <HexColorPicker color={value} onChange={onChange} />
        <Input
          maxLength={7}
          onChange={(e) => {
            onChange(e?.currentTarget?.value);
          }}
          value={value}
        />
        <ToggleGroup type="single" variant="outline" className="grid w-full grid-cols-2" value={iconColor}>
          <ToggleGroupItem value="white" onClick={() => setIconColor('white')}>
            White icon
          </ToggleGroupItem>
          <ToggleGroupItem value="black" onClick={() => setIconColor('black')}>
            Black icon
          </ToggleGroupItem>
        </ToggleGroup>
      </PopoverContent>
    </Popover>
  );
};

export { ColorPicker };
