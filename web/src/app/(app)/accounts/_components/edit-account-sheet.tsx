'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import { IconPicker } from '@/components/ui/icon-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Spinner from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ASSET_ID } from '@/lib/constants';
import { errorMessages } from '@/lib/messages';
import { formatCurrency, formatCurrencyInput, getInitials } from '@/lib/utils';
import { deleteAccountInvite, deleteFinancialAccount, updateFinancialAccount } from '@/services/accounts';
import { AccountCategory } from '@/types/AccountCategory';
import { AccountInvite, InviteStatus } from '@/types/AccountInvite';
import { AccountType } from '@/types/AccountType';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { User } from '@/types/User';
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import DeleteAccountInviteDialog from './delete-account-invite-dialog';
import InviteUserDialog from './invite-user-dialog';

interface EditAccountSheetProps {
  types: AccountType[];
  account: FinancialAccount;
  children: React.ReactNode;
  currencies: Currency[];
  user: User;
}

function EditAccountSheet({ types, account, children, user, currencies }: EditAccountSheetProps) {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<AccountCategory | undefined>(account.accountCategory);
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(account.currency);
  const [openCurrencyCombobox, setOpenCurrencyCombobox] = useState(false);
  const [openEditSheet, setOpenEditSheet] = useState(false);
  const formattedInitialValue = formatCurrency(account.initialValue, 0, 4);
  const [initialValue, setInitialValue] = useState(formattedInitialValue);
  const accountType = types.find((type) => type.id === account.accountCategory.typeId);
  const [selectedType, setSelectedType] = useState<AccountType>(accountType || types[0]);
  const [color, setColor] = useState(account.color);
  const [icon, setIcon] = useState(account.icon);
  const [iconColor, setIconColor] = useState(account.iconColor);
  const [accountInvites, setAccountInvites] = useState<AccountInvite[]>(account.accountInvites);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (openEditSheet) {
      setInitialValue(formattedInitialValue);
      setSelectedType(accountType || types[0]);
      setOpenCategoryCombobox(false);
      setSelectedCurrency(account.currency);
      setOpenCurrencyCombobox(false);
      setColor(account.color);
      setIcon(account.icon);
      setIconColor(account.iconColor);
      setAccountInvites(account.accountInvites);
      setUpdateLoading(false);
      setDeleteLoading(false);
    }
  }, [account, accountType, formattedInitialValue, openEditSheet, types]);

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

  async function handleSubmit(formData: FormData) {
    setUpdateLoading(true);

    if (selectedCategory) {
      const res = await updateFinancialAccount(
        formData,
        selectedCategory,
        account,
        selectedCurrency,
        user,
        icon,
        color,
        iconColor,
      );

      if (res.ok) {
        mutate((key) => typeof key === 'string' && (key.startsWith('/accounts') || key.startsWith('/transactions')));
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
      }
    }

    setOpenEditSheet(false);
    setUpdateLoading(false);
  }

  async function handleDelete() {
    setDeleteLoading(true);

    if (account) {
      const res = await deleteFinancialAccount(account);
      if (res.ok) {
        router.replace('/accounts');
        mutate((key) => typeof key === 'string' && key.startsWith('/accounts/user'));
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
        setDeleteLoading(false);
      }
    }
  }

  function handleChangeType(type: AccountType) {
    setSelectedType(type);
    if (type.id === account.accountCategory.accountType.id) {
      setSelectedCategory(account.accountCategory);
    } else {
      setSelectedCategory(type.accountCategories[0]);
    }
  }

  async function handleDeleteAccountInvite(accountInvite: AccountInvite) {
    if (!accountInvite.id) {
      return;
    }
    const res = await deleteAccountInvite(accountInvite.id);
    if (res.ok) {
      toast.success('You have successfully removed the invite');
      mutate((key) => typeof key === 'string' && key.startsWith('/account'));
    } else {
      toast.error('Oops! Something went wrong, please try again');
    }
  }

  return (
    <>
      <Sheet open={openEditSheet} onOpenChange={setOpenEditSheet}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Edit account</SheetTitle>
            <SheetDescription>Modify the details of your account.</SheetDescription>
          </SheetHeader>
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
                  {account.transactionsCount && account.transactionsCount > 0 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled
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
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-52 leading-tight">
                          You cannot change the currency of an account with transactions.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
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
                  )}
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
                    defaultValue={account.name}
                    required
                  />
                </div>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="initialValue">Initial value (optional)</Label>
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
                  <InviteUserDialog setAccountInvites={setAccountInvites} user={user} accountId={account.id}>
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
                      accountInvites.map((accountInvite) => (
                        <div key={accountInvite.email} className="flex justify-between">
                          <div className="col-span-2 flex items-center gap-3">
                            <Avatar className="flex h-7 w-7 items-center justify-center">
                              <AvatarFallback className="text-xs">{getInitials(accountInvite.email)}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm">
                              {accountInvite.user && accountInvite.status === InviteStatus.ACCEPTED
                                ? accountInvite.user.name
                                : accountInvite.email}{' '}
                              {accountInvite.status === InviteStatus.PENDING && (
                                <span className="text-muted-foreground">(pending)</span>
                              )}
                            </p>
                          </div>
                          {accountInvite.status === InviteStatus.ACCEPTED ? (
                            <DeleteAccountInviteDialog
                              user={accountInvite.user}
                              onConfirm={async () => await handleDeleteAccountInvite(accountInvite)}
                            >
                              <Button
                                type="button"
                                variant="outline"
                                className="h-6 w-6 p-0 text-destructive hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </DeleteAccountInviteDialog>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              className="h-6 w-6 p-0 text-destructive hover:text-red-700"
                              onClick={async () => await handleDeleteAccountInvite(accountInvite)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="w-full text-center text-sm text-muted-foreground">No users have been invited.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            <SheetFooter>
              <ConfirmDeleteDialog
                description="the account"
                name={account.name}
                onConfirm={handleDelete}
                extraDescription=" and all transactions associated with it."
              >
                <Button
                  className="min-w-20"
                  variant="destructive"
                  type="button"
                  disabled={deleteLoading || updateLoading}
                >
                  {deleteLoading ? <Spinner /> : 'Delete account'}
                </Button>
              </ConfirmDeleteDialog>
              <Button className="min-w-20" type="submit" disabled={updateLoading || deleteLoading}>
                {updateLoading ? <Spinner /> : 'Update account'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default EditAccountSheet;
