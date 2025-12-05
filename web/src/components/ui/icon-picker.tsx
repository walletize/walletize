'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React, { useState } from 'react';

interface IconPickerProps {
  disabled?: boolean | undefined;
  name?: string;
  color: string;
  icon: string;
  setIcon: React.Dispatch<React.SetStateAction<string>>;
  iconColor: string;
  className?: string;
  onBlur?: () => void;
}

const IconPicker = ({
  disabled,
  icon,
  setIcon,
  color,
  iconColor,
  onBlur,
  name,
  className,
  ...props
}: IconPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open} modal={true}>
      <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
        <Button
          {...props}
          className={cn('flex items-center justify-center', className)}
          name={name}
          onClick={() => {
            setOpen(true);
          }}
          size="icon"
          variant="outline"
          style={{ backgroundColor: color }}
        >
          <div className="flex h-5 w-5 items-center justify-center">
            <Image
              src={'/icons/' + icon}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: 'auto', height: 'auto' }}
              alt="Walletize Logo"
              className={iconColor === 'white' ? 'invert' : ''}
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid max-h-80 w-full grid-cols-4 gap-2 overflow-y-auto">
        {icons.map((icon) => (
          <Button
            variant="outline"
            size="icon"
            key={icon}
            onClick={() => {
              setIcon(icon);
              setOpen(false);
            }}
            style={{ backgroundColor: color }}
          >
            <div className="flex h-5 w-5 items-center justify-center">
              <Image
                src={'/icons/' + icon}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
                alt="Walletize Logo"
                className={iconColor === 'white' ? 'invert' : ''}
              />
            </div>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export { IconPicker as IconPicker };

const icons = [
  'antenna.svg',
  'app-window-mac.svg',
  'apple.svg',
  'armchair.svg',
  'arrow-right-left.svg',
  'arrow-up-down.svg',
  'audio-lines.svg',
  'baby.svg',
  'badge-cent.svg',
  'badge-dollar-sign.svg',
  'banknote.svg',
  'bed-double.svg',
  'beer.svg',
  'bike.svg',
  'bitcoin.svg',
  'book.svg',
  'bot.svg',
  'briefcase-business.svg',
  'briefcase.svg',
  'bus.svg',
  'cable.svg',
  'car.svg',
  'carrot.svg',
  'cat.svg',
  'chart-candlestick.svg',
  'chart-spline.svg',
  'chef-hat.svg',
  'circle-dashed.svg',
  'circle-parking.svg',
  'clapperboard.svg',
  'coffee.svg',
  'coins.svg',
  'computer.svg',
  'cookie.svg',
  'credit-card.svg',
  'croissant.svg',
  'cross.svg',
  'cup-soda.svg',
  'dog.svg',
  'drama.svg',
  'drum.svg',
  'dumbbell.svg',
  'ellipsis.svg',
  'fish.svg',
  'flower-2.svg',
  'flower.svg',
  'fuel.svg',
  'gamepad-2.svg',
  'gem.svg',
  'gift.svg',
  'graduation-cap.svg',
  'guitar.svg',
  'hand-coins.svg',
  'headset.svg',
  'heart-pulse.svg',
  'heart.svg',
  'house.svg',
  'lamp-floor.svg',
  'landmark.svg',
  'laptop.svg',
  'loader-pinwheel.svg',
  'martini.svg',
  'microchip.svg',
  'music.svg',
  'notebook-text.svg',
  'palette.svg',
  'paw-print.svg',
  'pc-case.svg',
  'phone.svg',
  'piano.svg',
  'piggy-bank.svg',
  'pill-bottle.svg',
  'plane.svg',
  'plug.svg',
  'receipt.svg',
  'salad.svg',
  'scissors.svg',
  'shapes.svg',
  'shield.svg',
  'shirt.svg',
  'shopping-bag.svg',
  'shopping-basket.svg',
  'shopping-cart.svg',
  'smartphone.svg',
  'stethoscope.svg',
  'tag.svg',
  'train-front.svg',
  'tram-front.svg',
  'user.svg',
  'utensils.svg',
  'wallet.svg',
  'washing-machine.svg',
  'weight.svg',
  'wine.svg',
  'wrench.svg',
  'zap.svg',
];
