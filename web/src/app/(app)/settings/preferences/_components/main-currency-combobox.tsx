'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Spinner from '@/components/ui/spinner';
import { updateMainCurrency } from '@/services/users';
import { Currency } from '@/types/Currency';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

interface MainCurrencyComboboxProps {
  currencies: Currency[];
  mainCurrencyId: string;
}

function MainCurrencyCombobox({ currencies, mainCurrencyId }: MainCurrencyComboboxProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(mainCurrencyId);
  const [openCurrencyCombobox, setOpenCurrencyCombobox] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);

    const res = await updateMainCurrency(selectedCurrency);
    if (res.ok) {
      toast.success('Update successful! Your changes have been saved.');
      mutate((key) => typeof key === 'string' && key.startsWith('/auth/session/validate'));
    } else {
      toast.error('Oops! Something went wrong, please try again.');
    }

    setLoading(false);
  }

  return (
    <Card x-chunk="dashboard-04-chunk-2">
      <CardHeader>
        <CardTitle>Main Currency</CardTitle>
        <CardDescription>
          The default currency when adding transactions, and other currencies are converted to your main currency on the
          dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Popover open={openCurrencyCombobox} onOpenChange={setOpenCurrencyCombobox} modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCurrencyCombobox}
                className={
                  'w-full justify-between' +
                  (selectedCurrency ? ' text-foreground' : ' font-normal text-muted-foreground')
                }
              >
                {selectedCurrency
                  ? currencies.find((currency) => currency.id === selectedCurrency)?.code
                  : 'Select currency...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search currency..." />
                <CommandList>
                  <CommandEmpty>No currency found.</CommandEmpty>
                  <CommandGroup>
                    {currencies.map((currency) => (
                      <CommandItem
                        key={currency.id}
                        value={currency.id}
                        keywords={[currency.code]}
                        onSelect={(currentValue) => {
                          setSelectedCurrency(currentValue);
                          setOpenCurrencyCombobox(false);
                        }}
                      >
                        <Check
                          className={'mr-2 h-4 w-4 ' + (selectedCurrency === currency.id ? 'opacity-100' : 'opacity-0')}
                        />
                        {currency.code}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardFooter className="border-t !py-4 px-6">
        <Button disabled={mainCurrencyId === selectedCurrency || loading} onClick={handleSave}>
          {loading ? <Spinner /> : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default MainCurrencyCombobox;
