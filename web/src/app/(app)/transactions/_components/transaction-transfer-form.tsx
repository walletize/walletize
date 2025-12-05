import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import Spinner from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip as TooltipComponent, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTransactionCategories } from '@/hooks/transactions';
import { EXPENSE_ID, INCOME_ID, TRANSFER_ID } from '@/lib/constants';
import { errorMessages } from '@/lib/messages';
import { cleanNumberInput, cn, formatCurrency, formatCurrencyInput } from '@/lib/utils';
import { addTransferTransaction, deleteTransaction, updateTransaction } from '@/services/transactions';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { Transaction } from '@/types/Transaction';
import { TransactionType } from '@/types/TransactionType';
import { User } from '@/types/User';
import { format } from 'date-fns';
import { ArrowLeftRight, CalendarIcon, Check, ChevronsUpDown, Info } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import ExchangeRateDialog from './exchange-rate-dialog';

interface TransferFormProps {
  accounts: FinancialAccount[];
  account?: FinancialAccount;
  user: User;
  currencies: Currency[];
  openOverlay: boolean;
  setOpenOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  transaction?: Transaction;
  types: TransactionType[];
}

function TransactionTransferForm({
  accounts,
  account,
  user,
  currencies,
  openOverlay,
  setOpenOverlay,
  transaction,
  types,
}: TransferFormProps) {
  const router = useRouter();

  const [originAccount, setOriginAccount] = useState<FinancialAccount | null>(accounts[0]);
  const [openOriginAccountCombobox, setOpenOriginAccountCombobox] = useState(false);
  const [destinationAccount, setDestinationAccount] = useState<FinancialAccount | null>(null);
  const [openDestinationAccountCombobox, setOpenDestinationAccountCombobox] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(accounts[0].currency);
  const [openCurrencyCombobox, setOpenCurrencyCombobox] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState('');
  const [openExchangeRateDialog, setOpenExchangeRateDialog] = useState(false);
  const [baseRate, setBaseRate] = useState('1');
  const [quoteRate, setQuoteRate] = useState('1');
  const [lockRates, setLockRates] = useState(false);
  const [swapRates, setSwapRates] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>(types[0]);
  const [showAsExpenseOrIncome, setShowAsExpenseOrIncome] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(types[0].transactionCategories[0]);
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState(() => currencies);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { isTransactionCategoriesLoading, transactionCategories } = useTransactionCategories(
    originAccount?.userId !== user.id ? originAccount?.userId : destinationAccount?.userId,
    selectedType.id,
    originAccount?.userId === user.id && destinationAccount?.userId === user.id,
  );

  const baseCurrency = originAccount
    ? originAccount.currency.id === selectedCurrency.id
      ? destinationAccount?.currency
      : originAccount?.currency
    : destinationAccount?.currency;

  useEffect(() => {
    if (openOverlay) {
      setOpenCategoryCombobox(false);
      setOpenDestinationAccountCombobox(false);
      setOpenCurrencyCombobox(false);
      setOpenExchangeRateDialog(false);
      setLockRates(false);
      setSwapRates(false);
      setBaseRate('1');
      setOpenCalendar(false);
      setLoading(false);
      setDeleteLoading(false);

      if (transaction) {
        const originAccount =
          accounts.find((account) => account.id === transaction.transactionTransfer?.originTransaction?.accountId) ||
          null;
        const destinationAccount =
          accounts.find(
            (account) => account.id === transaction.transactionTransfer?.destinationTransaction?.accountId,
          ) || null;
        const type =
          transaction.transactionTransfer?.originTransaction?.transactionCategory.typeId !== TRANSFER_ID
            ? types.find(
                (type) => type.id === transaction.transactionTransfer?.originTransaction?.transactionCategory.typeId,
              ) || types[0]
            : transaction.transactionTransfer?.destinationTransaction?.transactionCategory.typeId !== TRANSFER_ID
              ? types.find(
                  (type) =>
                    type.id === transaction.transactionTransfer?.destinationTransaction?.transactionCategory.typeId,
                ) || types[0]
              : types[0];

        setAmount(formatCurrency(Math.abs(transaction.amount), 0, 4));
        setOriginAccount(originAccount);
        setDestinationAccount(destinationAccount);
        setDate(transaction.date);
        setSelectedCurrency(transaction.currency);
        setQuoteRate(cleanNumberInput(transaction.rate?.toString() || '', 10));
        setSelectedType(type);
        setShowAsExpenseOrIncome(
          transaction.transactionTransfer?.originTransaction?.transactionCategory.typeId === EXPENSE_ID ||
            transaction.transactionTransfer?.destinationTransaction?.transactionCategory.typeId === INCOME_ID ||
            transaction.transactionTransfer?.originTransaction?.transactionCategory.id === EXPENSE_ID ||
            transaction.transactionTransfer?.destinationTransaction?.transactionCategory.id === INCOME_ID,
        );
        setAvailableCurrencies(
          !originAccount || !destinationAccount
            ? currencies
            : currencies.filter((currency) => {
                return currency.id === originAccount.currency.id || currency.id === destinationAccount.currency.id;
              }),
        );
      } else {
        const originAccount = account ? account : accounts[0];
        const destinationAccount =
          accounts.length > 1 ? (accounts[1].id === originAccount.id ? accounts[0] : accounts[1]) : null;
        const quoteCurrency = originAccount.currency;
        const baseCurrency = destinationAccount?.currency;
        const quoteRelativeRate = baseCurrency
          ? cleanNumberInput(((1 / baseCurrency.rate) * quoteCurrency.rate).toString(), 8)
          : '1';

        setAmount('');
        setOriginAccount(originAccount);
        setDestinationAccount(destinationAccount);
        setDate(new Date());
        setSelectedCurrency(originAccount.currency);
        setQuoteRate(quoteRelativeRate);
        setSelectedType(types[0]);
        setShowAsExpenseOrIncome(false);
        setSelectedCategory(types[0].transactionCategories[0]);
        setAvailableCurrencies(
          !originAccount || !destinationAccount
            ? currencies
            : currencies.filter((currency) => {
                return currency.id === originAccount.currency.id || currency.id === destinationAccount.currency.id;
              }),
        );
      }
    }
  }, [account, accounts, currencies, openOverlay, transaction, types]);

  useEffect(() => {
    if (openOverlay) {
      if (transaction) {
        const type =
          transaction.transactionTransfer?.originTransaction?.transactionCategory.typeId !== TRANSFER_ID
            ? types.find(
                (type) => type.id === transaction.transactionTransfer?.originTransaction?.transactionCategory.typeId,
              ) || types[0]
            : transaction.transactionTransfer?.destinationTransaction?.transactionCategory.typeId !== TRANSFER_ID
              ? types.find(
                  (type) =>
                    type.id === transaction.transactionTransfer?.destinationTransaction?.transactionCategory.typeId,
                ) || types[0]
              : types[0];

        setSelectedCategory(
          type.transactionCategories.find(
            (category) =>
              category.id === transaction.transactionTransfer?.destinationTransaction?.transactionCategory.id,
          ) || type.transactionCategories[0],
        );
      } else {
        if (
          ((selectedType.id === EXPENSE_ID && originAccount?.userId !== user.id) ||
            (selectedType.id === INCOME_ID && destinationAccount?.userId !== user.id)) &&
          transactionCategories
        ) {
          setSelectedCategory(transactionCategories[0]);
        } else {
          setSelectedCategory(selectedType.transactionCategories[0]);
        }
      }
    }
  }, [destinationAccount, openOverlay, originAccount, selectedType, transaction, transactionCategories, types, user]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    const sanitizedValue = value.replace(/[^\d.,-]/g, '');
    const decimalCount = sanitizedValue.split('.').length - 1;

    if (decimalCount <= 1) {
      setAmount(sanitizedValue);
    }
  }

  function handleAmountBlur(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    if (value != '') {
      setAmount(formatCurrencyInput(value));
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);

    if (transaction) {
      const res = await deleteTransaction(transaction);
      if (res.ok) {
        mutate((key) => typeof key === 'string' && (key.startsWith('/accounts') || key.startsWith('/transactions')));
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
      }
    }

    setDeleteLoading(false);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const res = transaction
      ? await updateTransaction(
          transaction.id,
          formData,
          transaction.transactionCategory,
          transaction.financialAccount,
          date,
          selectedCurrency,
          baseRate,
          quoteRate,
          transaction.transactionTransfer ?? undefined,
        )
      : await addTransferTransaction(
          formData,
          originAccount,
          destinationAccount,
          date,
          selectedCurrency,
          baseRate,
          quoteRate,
          showAsExpenseOrIncome && originAccount && destinationAccount ? selectedCategory : undefined,
          showAsExpenseOrIncome && originAccount && destinationAccount ? selectedType : undefined,
        );

    if (account && originAccount?.id !== account.id && destinationAccount?.id !== account.id) {
      if (res.ok) {
        if (originAccount) {
          router.push('/accounts/' + originAccount.id);
        } else if (destinationAccount) {
          router.push('/accounts/' + destinationAccount.id);
        }
        mutate((key) => typeof key === 'string' && (key.startsWith('/accounts') || key.startsWith('/transactions')));
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
        setLoading(false);
      }
    } else {
      if (res.ok) {
        mutate((key) => typeof key === 'string' && (key.startsWith('/accounts') || key.startsWith('/transactions')));
        setOpenOverlay(false);
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
      }

      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" action={handleSubmit}>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="account">From account</Label>
        <Popover open={openOriginAccountCombobox} onOpenChange={setOpenOriginAccountCombobox}>
          <PopoverTrigger asChild disabled={transaction ? true : false}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openOriginAccountCombobox}
              className="h-12 w-full justify-between text-foreground"
            >
              {originAccount ? (
                <div className="flex items-center gap-3">
                  <Avatar className="flex h-7 w-7 items-center justify-center">
                    <AvatarFallback style={{ backgroundColor: originAccount?.color }}>
                      <div className="flex h-4.5 w-4.5 items-center justify-center">
                        <Image
                          src={'/icons/' + originAccount?.icon}
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ width: 'auto', height: 'auto' }}
                          alt="Walletize Logo"
                          className={originAccount?.iconColor === 'white' ? 'invert' : ''}
                        />
                      </div>
                    </AvatarFallback>
                  </Avatar>
                  <p>
                    {originAccount?.name}&nbsp;
                    <span className="text-muted-foreground">
                      {' '}
                      <span className="px-1 font-thin">|</span> {originAccount?.accountCategory.name}{' '}
                      <span className="px-1 font-thin">|</span> {originAccount?.currentValue < 0 && '-'}
                      {originAccount?.currency.symbol}
                      {formatCurrency(Math.abs(originAccount?.currentValue))}
                    </span>
                  </p>
                </div>
              ) : (
                <p>Out of Walletize</p>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search account..." />
              <CommandList>
                <CommandEmpty>No account found.</CommandEmpty>
                <CommandGroup>
                  {accounts.map((account) => (
                    <CommandItem
                      key={account.id}
                      value={account.id}
                      keywords={[account.name]}
                      onSelect={(currentValue) => {
                        const account = accounts.find((account) => account.id === currentValue);

                        if (!account) {
                          setOpenOriginAccountCombobox(false);
                          return;
                        }

                        if (account.id === destinationAccount?.id) {
                          setOriginAccount(destinationAccount);
                          setDestinationAccount(originAccount);
                        } else {
                          if (account.id !== originAccount?.id) {
                            const availableCurrencies = destinationAccount
                              ? currencies.filter(
                                  (currency) =>
                                    currency.id === account.currencyId ||
                                    currency.id === destinationAccount?.currencyId,
                                )
                              : currencies;

                            setOriginAccount(account);
                            setAvailableCurrencies(availableCurrencies);

                            if (!availableCurrencies.some((currency) => currency.id === selectedCurrency.id)) {
                              const quoteRelativeRate = cleanNumberInput(
                                ((1 / account.currency.rate) * availableCurrencies[0].rate).toString(),
                                8,
                              );
                              setQuoteRate(quoteRelativeRate);
                              setSelectedCurrency(availableCurrencies[0]);
                            } else {
                              const quoteRelativeRate = cleanNumberInput(
                                ((1 / account.currency.rate) * selectedCurrency.rate).toString(),
                                8,
                              );
                              setQuoteRate(quoteRelativeRate);
                            }
                          }
                        }

                        setOpenOriginAccountCombobox(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="flex h-7 w-7 items-center justify-center">
                          <AvatarFallback style={{ backgroundColor: account.color }}>
                            <div className="flex h-4.5 w-4.5 items-center justify-center">
                              <Image
                                src={'/icons/' + account.icon}
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{ width: 'auto', height: 'auto' }}
                                alt="Walletize Logo"
                                className={account.iconColor === 'white' ? 'invert' : ''}
                              />
                            </div>
                          </AvatarFallback>
                        </Avatar>
                        <p>
                          {account.name}&nbsp;
                          <span className="text-muted-foreground">
                            {' '}
                            <span className="px-1 font-thin">|</span> {account.accountCategory.name}{' '}
                            <span className="px-1 font-thin">|</span> {account.currentValue < 0 && '-'}
                            {account.currency.symbol}
                            {formatCurrency(Math.abs(account.currentValue))}
                          </span>
                        </p>
                      </div>
                      <Check
                        className={'ml-2 h-4 w-4 ' + (originAccount?.id === account.id ? 'opacity-100' : 'opacity-0')}
                      />
                    </CommandItem>
                  ))}
                  <CommandItem
                    keywords={['Out of Walletize']}
                    onSelect={() => {
                      if (destinationAccount) {
                        setAvailableCurrencies(currencies);
                        setSelectedCurrency(destinationAccount?.currency || currencies[0]);
                        setOriginAccount(null);
                        setOpenOriginAccountCombobox(false);
                      } else {
                        setDestinationAccount(originAccount);
                        setOriginAccount(null);
                        setOpenOriginAccountCombobox(false);
                      }
                    }}
                  >
                    <Check className={'mr-2 h-4 w-4 ' + (!originAccount ? 'opacity-100' : 'opacity-0')} />
                    Out of Walletize
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="account">To account</Label>
        <Popover open={openDestinationAccountCombobox} onOpenChange={setOpenDestinationAccountCombobox}>
          <PopoverTrigger asChild disabled={transaction ? true : false}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openDestinationAccountCombobox}
              className="h-12 w-full justify-between text-foreground"
            >
              {destinationAccount ? (
                <div className="flex items-center gap-3">
                  <Avatar className="flex h-7 w-7 items-center justify-center">
                    <AvatarFallback style={{ backgroundColor: destinationAccount?.color }}>
                      <div className="flex h-4.5 w-4.5 items-center justify-center">
                        <Image
                          src={'/icons/' + destinationAccount?.icon}
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ width: 'auto', height: 'auto' }}
                          alt="Walletize Logo"
                          className={destinationAccount?.iconColor === 'white' ? 'invert' : ''}
                        />
                      </div>
                    </AvatarFallback>
                  </Avatar>
                  <p>
                    {destinationAccount?.name}&nbsp;
                    <span className="text-muted-foreground">
                      {' '}
                      <span className="px-1 font-thin">|</span> {destinationAccount.accountCategory.name}{' '}
                      <span className="px-1 font-thin">|</span> {destinationAccount.currentValue < 0 && '-'}
                      {destinationAccount.currency.symbol}
                      {formatCurrency(Math.abs(destinationAccount.currentValue))}
                    </span>
                  </p>
                </div>
              ) : (
                <p>Out of Walletize</p>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search account..." />
              <CommandList>
                <CommandEmpty>No account found.</CommandEmpty>
                <CommandGroup>
                  {accounts.map((account) => (
                    <CommandItem
                      key={account.id}
                      value={account.id}
                      keywords={[account.name]}
                      onSelect={(currentValue) => {
                        const account = accounts.find((account) => account.id === currentValue);

                        if (!account) {
                          setOpenDestinationAccountCombobox(false);
                          return;
                        }

                        if (account.id === originAccount?.id) {
                          setDestinationAccount(originAccount);
                          setOriginAccount(destinationAccount);
                        } else {
                          if (account.id !== destinationAccount?.id) {
                            const availableCurrencies = originAccount
                              ? currencies.filter(
                                  (currency) =>
                                    currency.id === account.currencyId || currency.id === originAccount?.currencyId,
                                )
                              : currencies;

                            setDestinationAccount(account);
                            setAvailableCurrencies(availableCurrencies);

                            if (!availableCurrencies.some((currency) => currency.id === selectedCurrency.id)) {
                              const quoteRelativeRate = cleanNumberInput(
                                ((1 / account.currency.rate) * availableCurrencies[0].rate).toString(),
                                8,
                              );
                              setQuoteRate(quoteRelativeRate);
                              setSelectedCurrency(availableCurrencies[0]);
                            } else {
                              const quoteRelativeRate = cleanNumberInput(
                                ((1 / account.currency.rate) * selectedCurrency.rate).toString(),
                                8,
                              );
                              setQuoteRate(quoteRelativeRate);
                            }
                          }
                        }

                        setOpenDestinationAccountCombobox(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="flex h-7 w-7 items-center justify-center">
                          <AvatarFallback style={{ backgroundColor: account.color }}>
                            <div className="flex h-4.5 w-4.5 items-center justify-center">
                              <Image
                                src={'/icons/' + account.icon}
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{ width: 'auto', height: 'auto' }}
                                alt="Walletize Logo"
                                className={account.iconColor === 'white' ? 'invert' : ''}
                              />
                            </div>
                          </AvatarFallback>
                        </Avatar>
                        <p>
                          {account.name}&nbsp;
                          <span className="text-muted-foreground">
                            {' '}
                            <span className="px-1 font-thin">|</span> {account.accountCategory.name}{' '}
                            <span className="px-1 font-thin">|</span> {account.currentValue < 0 && '-'}
                            {account.currency.symbol}
                            {formatCurrency(Math.abs(account.currentValue))}
                          </span>
                        </p>
                      </div>
                      <Check
                        className={
                          'ml-2 h-4 w-4 ' + (destinationAccount?.id === account.id ? 'opacity-100' : 'opacity-0')
                        }
                      />
                    </CommandItem>
                  ))}
                  <CommandItem
                    keywords={['Out of Walletize']}
                    onSelect={() => {
                      if (originAccount) {
                        setAvailableCurrencies(currencies);
                        setSelectedCurrency(originAccount?.currency || currencies[0]);
                        setDestinationAccount(null);
                        setOpenDestinationAccountCombobox(false);
                      } else {
                        setOriginAccount(destinationAccount);
                        setDestinationAccount(null);
                        setOpenDestinationAccountCombobox(false);
                      }
                    }}
                  >
                    <Check className={'mr-2 h-4 w-4 ' + (!destinationAccount ? 'opacity-100' : 'opacity-0')} />
                    Out of Walletize
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {originAccount && destinationAccount && (
        <>
          <div className="flex-center flex gap-3">
            <Switch
              checked={showAsExpenseOrIncome}
              onCheckedChange={setShowAsExpenseOrIncome}
              className="my-auto"
              disabled={transaction ? true : false}
            />
            <div>
              <Label htmlFor="showAsExpenseOrIncome">Show as expense or income</Label>
              <div className="flex gap-1 text-sm text-muted-foreground">
                <span>(this transfer will be categorized as an expense or income)</span>
                <TooltipComponent>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <div className="flex max-w-80 flex-col gap-1 text-xs text-muted-foreground">
                      <p>If an expense category is chosen, the outgoing transfer will be categorized as an expense.</p>
                      <p>
                        Otherwise, if an income category is chosen, the incoming transfer will be categorized as an
                        income.
                      </p>
                    </div>
                  </TooltipContent>
                </TooltipComponent>
              </div>
            </div>
          </div>
          {showAsExpenseOrIncome && (
            <>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Type</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  className="grid grid-cols-2"
                  value={selectedType.id}
                  disabled={transaction ? true : false}
                >
                  <ToggleGroupItem
                    value={types[0].id}
                    className="!text-red-500"
                    onClick={() => {
                      setSelectedType(types[0]);
                      setSelectedCategory(types[0].transactionCategories[0]);
                    }}
                  >
                    Expense
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value={types[1].id}
                    className="!text-green-500"
                    onClick={() => {
                      setSelectedType(types[1]);
                      setSelectedCategory(types[1].transactionCategories[0]);
                    }}
                  >
                    Income
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox} modal={true}>
                  <PopoverTrigger asChild disabled={isTransactionCategoriesLoading || transaction ? true : false}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategoryCombobox}
                      className={
                        'h-12 w-full justify-between' +
                        (selectedCategory ? ' text-foreground' : ' font-normal text-muted-foreground')
                      }
                    >
                      <div className="flex items-center gap-3">
                        {isTransactionCategoriesLoading || !selectedCategory ? (
                          <>
                            <Skeleton className="h-7 w-7 rounded-full" />
                            <Skeleton className="h-5 w-20" />
                          </>
                        ) : (
                          <>
                            <Avatar className="flex h-7 w-7 items-center justify-center">
                              <AvatarFallback style={{ backgroundColor: selectedCategory.color }}>
                                <div className="flex h-4.5 w-4.5 items-center justify-center">
                                  <Image
                                    src={'/icons/' + selectedCategory.icon}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    style={{ width: 'auto', height: 'auto' }}
                                    alt={transaction?.transactionCategory.name || 'Category icon'}
                                    className={selectedCategory.iconColor === 'white' ? 'invert' : ''}
                                  />
                                </div>
                              </AvatarFallback>
                            </Avatar>
                            <p>{selectedCategory ? selectedCategory.name : 'Select category...'}</p>
                          </>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search category..." />
                      <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {(selectedType.id === EXPENSE_ID && originAccount.userId !== user.id) ||
                          (selectedType.id === INCOME_ID && destinationAccount.userId !== user.id)
                            ? transactionCategories?.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  value={category.id}
                                  keywords={[category.name]}
                                  onSelect={(currentValue) => {
                                    const category = transactionCategories.find(
                                      (category) => category.id === currentValue,
                                    );
                                    if (category) {
                                      setSelectedCategory(category);
                                    }
                                    setOpenCategoryCombobox(false);
                                  }}
                                  className="flex justify-between"
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="flex h-7 w-7 items-center justify-center">
                                      <AvatarFallback style={{ backgroundColor: category.color }}>
                                        <div className="flex h-4.5 w-4.5 items-center justify-center">
                                          <Image
                                            src={'/icons/' + category.icon}
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            style={{ width: 'auto', height: 'auto' }}
                                            alt="Walletize Logo"
                                            className={category.iconColor === 'white' ? 'invert' : ''}
                                          />
                                        </div>
                                      </AvatarFallback>
                                    </Avatar>
                                    <p>{category.name}</p>
                                  </div>
                                  <Check
                                    className={
                                      'ml-2 h-4 w-4 ' +
                                      (selectedCategory.id === category.id ? 'opacity-100' : 'opacity-0')
                                    }
                                  />
                                </CommandItem>
                              ))
                            : selectedType.transactionCategories.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  value={category.id}
                                  keywords={[category.name]}
                                  onSelect={(currentValue) => {
                                    const category = selectedType.transactionCategories.find(
                                      (category) => category.id === currentValue,
                                    );
                                    if (category) {
                                      setSelectedCategory(category);
                                    }
                                    setOpenCategoryCombobox(false);
                                  }}
                                  className="flex justify-between"
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="flex h-7 w-7 items-center justify-center">
                                      <AvatarFallback style={{ backgroundColor: category.color }}>
                                        <div className="flex h-4.5 w-4.5 items-center justify-center">
                                          <Image
                                            src={'/icons/' + category.icon}
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            style={{ width: 'auto', height: 'auto' }}
                                            alt="Walletize Logo"
                                            className={category.iconColor === 'white' ? 'invert' : ''}
                                          />
                                        </div>
                                      </AvatarFallback>
                                    </Avatar>
                                    <p>{category.name}</p>
                                  </div>
                                  <Check
                                    className={
                                      'ml-2 h-4 w-4 ' +
                                      (selectedCategory.id === category.id ? 'opacity-100' : 'opacity-0')
                                    }
                                  />
                                </CommandItem>
                              ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {((selectedType.id === EXPENSE_ID && originAccount.userId !== user.id) ||
                  (selectedType.id === INCOME_ID && destinationAccount.userId !== user.id)) && (
                  <p className="text-xs text-muted-foreground">
                    Shared accounts can only use the owner&apos;s categories.
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="amount">Date</Label>
        <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date || new Date());
                setOpenCalendar(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="description">
          Description <span className="text-xs leading-none text-muted-foreground">(optional)</span>
        </Label>
        <Input
          type="text"
          name="description"
          placeholder="Price appreciation"
          defaultValue={transaction?.description}
        />
      </div>
      <div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 grid w-full items-center gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="text"
              name="amount"
              placeholder="10,000"
              value={amount}
              onChange={handleChange}
              onBlur={handleAmountBlur}
              required
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="currency">Currency</Label>
            <div className="flex gap-2">
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
                    {selectedCurrency ? selectedCurrency.code : 'Select currency...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search currency..." />
                    <CommandList>
                      <CommandEmpty>No currency found.</CommandEmpty>
                      <CommandGroup>
                        {availableCurrencies.map((currency) => (
                          <CommandItem
                            key={currency.id}
                            value={currency.id}
                            keywords={[currency.code]}
                            onSelect={(currentValue) => {
                              const currency = currencies.find((currency) => currency.id === currentValue);
                              if (currency) {
                                const baseCurrency = originAccount
                                  ? originAccount.currency.id === currency.id
                                    ? destinationAccount?.currency
                                    : originAccount?.currency
                                  : destinationAccount?.currency;
                                const quoteRelativeRate = baseCurrency
                                  ? cleanNumberInput(((1 / baseCurrency.rate) * currency.rate).toString(), 8)
                                  : '1';
                                setQuoteRate(quoteRelativeRate);

                                setSelectedCurrency(currency);
                                if (
                                  currency.id != originAccount?.currencyId &&
                                  currency.id != destinationAccount?.currencyId
                                ) {
                                  setLockRates(false);
                                  setOpenExchangeRateDialog(true);
                                }
                              }
                              setOpenCurrencyCombobox(false);
                            }}
                          >
                            <Check
                              className={
                                'mr-2 h-4 w-4 ' + (selectedCurrency.id === currency.id ? 'opacity-100' : 'opacity-0')
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
              {originAccount && destinationAccount && originAccount?.currencyId != destinationAccount?.currencyId ? (
                <Button type="button" variant="outline" size="icon" onClick={() => setOpenExchangeRateDialog(true)}>
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
        {((selectedCurrency.id !== originAccount?.currencyId && originAccount) ||
          (selectedCurrency.id !== destinationAccount?.currencyId && destinationAccount)) &&
          (swapRates ? (
            <div className="mt-1.5 text-sm text-muted-foreground">
              <span className="font-semibold">
                ={' '}
                {formatCurrency(
                  Number(amount.replaceAll(',', '')) /
                    (Math.floor((Number(quoteRate.replaceAll(',', '')) / Number(baseRate.replaceAll(',', ''))) * 1e8) /
                      1e8 /
                      1e8) /
                    10000,
                )}{' '}
                {baseCurrency?.code}
              </span>{' '}
              ({quoteRate} {selectedCurrency.code} = {baseRate} {baseCurrency?.code})
            </div>
          ) : (
            <div className="mt-1.5 text-sm text-muted-foreground">
              <span className="font-semibold">
                ={' '}
                {formatCurrency(
                  Number(amount.replaceAll(',', '')) /
                    (Math.floor((Number(quoteRate.replaceAll(',', '')) / Number(baseRate.replaceAll(',', ''))) * 1e8) /
                      1e8 /
                      1e8) /
                    10000,
                )}{' '}
                {baseCurrency?.code}
              </span>{' '}
              ({baseRate} {baseCurrency?.code} = {quoteRate} {selectedCurrency.code})
            </div>
          ))}
      </div>
      <DialogFooter>
        {transaction && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteLoading || loading}>
                {deleteLoading ? <Spinner /> : 'Delete transaction'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete both origin and destination transactions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button type="submit" disabled={loading || deleteLoading}>
          {loading ? <Spinner /> : !transaction ? 'Add transaction' : 'Update transaction'}
        </Button>
      </DialogFooter>
      {transaction && (
        <p className="-mt-2 text-end text-xs text-muted-foreground">
          This will apply to both origin and destination transactions.
        </p>
      )}
      <ExchangeRateDialog
        openExchangeRateDialog={openExchangeRateDialog}
        setOpenExchangeRateDialog={setOpenExchangeRateDialog}
        baseRate={baseRate}
        setBaseRate={setBaseRate}
        quoteRate={quoteRate}
        setQuoteRate={setQuoteRate}
        selectedAccount={originAccount || destinationAccount}
        baseCurrency={baseCurrency}
        quoteCurrency={selectedCurrency}
        transaction={transaction}
        lockRates={lockRates}
        setLockRates={setLockRates}
        setSelectedCurrency={setSelectedCurrency}
        swapRates={swapRates}
        setSwapRates={setSwapRates}
        lockSelectedCurrency={originAccount && destinationAccount ? true : false}
      ></ExchangeRateDialog>
    </form>
  );
}

export default TransactionTransferForm;
