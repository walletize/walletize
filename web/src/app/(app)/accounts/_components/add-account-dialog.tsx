'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconPicker } from '@/components/ui/icon-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Spinner from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ASSET_ID, LIABILITY_ID } from '@/lib/constants';
import { formatCurrencyInput, getInitials } from '@/lib/utils';
import { addFinancialAccount } from '@/services/accounts';
import { AccountInvite } from '@/types/AccountInvite';
import { AccountType } from '@/types/AccountType';
import { Currency } from '@/types/Currency';
import { User } from '@/types/User';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { mutate } from 'swr';
import InviteUserDialog from './invite-user-dialog';

interface AddAccountDialogProps {
  children: React.ReactNode;
  types: AccountType[];
  addType?: string;
  currencies: Currency[];
  user: User;
}

function AddAccountDialog({ children, types, addType, currencies, user }: AddAccountDialogProps) {
  const [selectedType, setSelectedType] = useState<AccountType>(types[0]);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (types[0].accountCategories.length > 0) {
      return types[0].accountCategories[0];
    } else {
      return undefined;
    }
  });
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user.mainCurrency);
  const [openCurrencyCombobox, setOpenCurrencyCombobox] = useState(false);
  const [initialValue, setInitialValue] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [color, setColor] = useState('#27272a');
  const [icon, setIcon] = useState('circle-dashed.svg');
  const [iconColor, setIconColor] = useState('white');
  const [accountInvites, setAccountInvites] = useState<AccountInvite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openAddDialog) {
      setInitialValue('');
      setSelectedType(types[0]);
      setSelectedCategory(types[0].accountCategories[0]);
      setOpenCategoryCombobox(false);
      setSelectedCurrency(user.mainCurrency);
      setOpenCurrencyCombobox(false);
      setColor('#27272a');
      setIcon('circle-dashed.svg');
      setIconColor('white');
      setAccountInvites([]);
      setLoading(false);

      if (addType === LIABILITY_ID) {
        setSelectedType(types[1]);
        setSelectedCategory(types[1].accountCategories[0]);
      } else {
        setSelectedType(types[0]);
        setSelectedCategory(types[0].accountCategories[0]);
      }
    }
  }, [addType, currencies, openAddDialog, types, user.mainCurrency]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    const sanitizedValue = value.replace(/[^\d.,-]/g, '');
    const decimalCount = sanitizedValue.split('.').length - 1;

    if (decimalCount <= 1) {
      setInitialValue(sanitizedValue);
    }
  }

  function handleInitialValueBlur(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    if (value != '') {
      setInitialValue(formatCurrencyInput(value));
    }
  }

  function handleChangeType(type: AccountType) {
    setSelectedType(type);
    setSelectedCategory(type.accountCategories[0]);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    if (selectedCategory && selectedCurrency) {
      await addFinancialAccount(
        formData,
        user,
        selectedCategory,
        selectedCurrency,
        icon,
        color,
        iconColor,
        accountInvites,
      );
      mutate((key) => typeof key === 'string' && (key.startsWith('/accounts/user') || key.startsWith('/transactions')));
    }

    setOpenAddDialog(false);
    setOpenCategoryCombobox(false);
    setOpenCurrencyCombobox(false);
    setLoading(false);
  }

  return (
    <>
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new account</DialogTitle>
            <DialogDescription>Create a new asset or liability for your potfolio.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(new FormData(e.currentTarget));
            }}
          >
            <div className="grid gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Type</Label>
                <ToggleGroup type="single" variant="outline" className="grid grid-cols-2" value={selectedType.id}>
                  <ToggleGroupItem
                    value={types[0].id}
                    className="!text-green-500"
                    onClick={() => handleChangeType(types[0])}
                  >
                    Asset
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value={types[1].id}
                    className="!text-red-500"
                    onClick={() => handleChangeType(types[1])}
                  >
                    Liability
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox} modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCategoryCombobox}
                        className={
                          'w-full justify-between' +
                          (selectedCategory ? ' text-foreground' : ' font-normal text-muted-foreground')
                        }
                      >
                        {selectedCategory
                          ? selectedType.accountCategories.find((category) => category.id === selectedCategory.id)?.name
                          : 'Select category...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search category..." />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {selectedType.accountCategories.map((category) => (
                              <CommandItem
                                key={category.id}
                                value={category.id}
                                keywords={[category.name]}
                                onSelect={(currentValue) => {
                                  const category = selectedType.accountCategories.find(
                                    (category) => category.id === currentValue,
                                  );
                                  if (category) {
                                    setSelectedCategory(category);
                                  }
                                  setOpenCategoryCombobox(false);
                                }}
                              >
                                <Check
                                  className={
                                    'mr-2 h-4 w-4 ' +
                                    (selectedCategory?.id === category.id ? 'opacity-100' : 'opacity-0')
                                  }
                                />
                                {category.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="currency">Currency</Label>
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
                          ? currencies.find((currency) => currency.id === selectedCurrency.id)?.code
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
                                  const currency = currencies.find((currency) => currency.id === currentValue);
                                  if (currency) {
                                    setSelectedCurrency(currency);
                                  }
                                  setOpenCurrencyCombobox(false);
                                }}
                              >
                                <Check
                                  className={
                                    'mr-2 h-4 w-4 ' +
                                    (selectedCurrency?.id === currency.id ? 'opacity-100' : 'opacity-0')
                                  }
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
              </div>
              <div className="flex gap-3">
                <div className="grid items-center gap-1.5">
                  <Label htmlFor="name">Icon</Label>
                  <IconPicker icon={icon} setIcon={setIcon} color={color} iconColor={iconColor} />
                </div>
                <div className="grid items-center gap-1.5">
                  <Label htmlFor="name">Color</Label>
                  <ColorPicker
                    onChange={(v) => {
                      setColor(v);
                    }}
                    value={color}
                    iconColor={iconColor}
                    setIconColor={setIconColor}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="name">Account name</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder={selectedType.id === ASSET_ID ? 'BAC Savings' : 'BAC Loan'}
                    required
                  />
                </div>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="initialValue">
                  Initial value <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  type="text"
                  name="initialValue"
                  placeholder="0.00"
                  value={initialValue}
                  onChange={handleChange}
                  onBlur={handleInitialValueBlur}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="initialValue">
                    Share account <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <InviteUserDialog setAccountInvites={setAccountInvites} user={user}>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-accent-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </InviteUserDialog>
                </div>
                <Card className="shadow-none">
                  <CardContent className="flex flex-col gap-3 !p-3">
                    {accountInvites.length > 0 ? (
                      accountInvites.map((accountInvite, index) => (
                        <div key={accountInvite.email} className="flex justify-between">
                          <div className="col-span-2 flex items-center gap-3">
                            <Avatar className="flex h-7 w-7 items-center justify-center">
                              <AvatarFallback className="text-xs">{getInitials(accountInvite.email)}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm">{accountInvite.email}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-6 w-6 p-0 text-destructive hover:text-red-700"
                            onClick={() => {
                              const tempAccountInvites = [...accountInvites];
                              tempAccountInvites.splice(index, 1);
                              setAccountInvites(tempAccountInvites);
                            }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="w-full text-center text-sm text-muted-foreground">No users have been invited.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button className="min-w-20" type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Add account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddAccountDialog;
