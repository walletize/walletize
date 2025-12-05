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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Spinner from '@/components/ui/spinner';
import { useTransactionCategories } from '@/hooks/transactions';
import { EXPENSE_ID } from '@/lib/constants';
import { errorMessages } from '@/lib/messages';
import { cleanNumberInput, cn, formatCurrency, formatCurrencyInput } from '@/lib/utils';
import { addTransaction, deleteTransaction, updateTransaction } from '@/services/transactions';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { Transaction } from '@/types/Transaction';
import { TransactionCategory } from '@/types/TransactionCategory';
import { TransactionType } from '@/types/TransactionType';
import { User } from '@/types/User';
import { format } from 'date-fns';
import { ArrowLeftRight, CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import ExchangeRateDialog from './exchange-rate-dialog';

interface ExpenseIncomeFormProps {
  types: TransactionType[];
  accounts: FinancialAccount[];
  currencies: Currency[];
  account?: FinancialAccount;
  user: User;
  selectedType: TransactionType;
  openOverlay: boolean;
  setOpenOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  transaction?: Transaction;
}

function TransactionExpenseIncomeForm({
  types,
  accounts,
  currencies,
  account,
  user,
  selectedType,
  openOverlay: openAddDialog,
  setOpenOverlay: setOpenAddDialog,
  transaction,
}: ExpenseIncomeFormProps) {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | undefined>(
    types[0].transactionCategories[0],
  );
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [openAccountCombobox, setOpenAccountCombobox] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(accounts[0].currency);
  const [openCurrencyCombobox, setOpenCurrencyCombobox] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openRecurrence, setOpenRecurrence] = useState(false);
  const [openExchangeRateDialog, setOpenExchangeRateDialog] = useState(false);
  const [baseRate, setBaseRate] = useState('1');
  const [quoteRate, setQuoteRate] = useState('1');
  const [lockRates, setLockRates] = useState(false);
  const [swapRates, setSwapRates] = useState(false);
  const [deleteType, setDeleteType] = useState('this');
  const [selectedRecurrence, setSelectedRecurrence] = useState('never');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { isTransactionCategoriesLoading, transactionCategories } = useTransactionCategories(
    selectedAccount.userId,
    selectedType.id,
    selectedAccount.userId === user.id,
  );

  useEffect(() => {
    if (selectedAccount.userId !== user.id && transactionCategories && transactionCategories.length > 0) {
      setSelectedCategory(transactionCategories[0]);
    } else {
      setSelectedCategory(selectedType.transactionCategories[0]);
    }

    if (selectedType.id === EXPENSE_ID) {
      setAmount((a) => (!a.startsWith('-') && a !== '' ? '-' + a : a));
    } else {
      setAmount((a) => a.replace(/^-/, ''));
    }
  }, [selectedAccount, selectedType, transactionCategories, user.id]);

  useEffect(() => {
    if (openAddDialog) {
      setOpenCategoryCombobox(false);
      setOpenAccountCombobox(false);
      setOpenCurrencyCombobox(false);
      setOpenExchangeRateDialog(false);
      setSelectedCategory(types[0].transactionCategories[0]);
      setAmount(transaction ? formatCurrency(transaction.amount, 0, 4) : '');
      setDate(transaction ? transaction.date : new Date());
      setLoading(false);
      setDeleteLoading(false);

      if (transaction) {
        setSelectedCategory(transaction.transactionCategory);
        setSelectedAccount(accounts.find((account) => account.id === transaction.financialAccount.id) || accounts[0]);
        setSelectedCurrency(transaction.currency);
        setBaseRate('1');
        setQuoteRate(cleanNumberInput(transaction.rate?.toString() || '', 10));
      } else if (account) {
        setSelectedAccount(account);
        setSelectedCurrency(account.currency);
      } else {
        setSelectedAccount(accounts[0]);
        setSelectedCurrency(accounts[0].currency);
      }
    }
  }, [account, accounts, currencies, openAddDialog, transaction, types]);

  async function handleDelete() {
    if (transaction) {
      setDeleteLoading(true);

      const res = await deleteTransaction(transaction, deleteType);
      if (res.ok) {
        mutate((key) => typeof key === 'string' && (key.startsWith('/accounts') || key.startsWith('/transactions')));
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
      }

      setDeleteLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    let sanitizedValue = value.replace(/(?!^-)[^\d.,]/g, '');
    if (selectedType.id === EXPENSE_ID) {
      if (!sanitizedValue.startsWith('-')) {
        sanitizedValue = '-' + sanitizedValue;
      }
    } else {
      sanitizedValue = sanitizedValue.replace(/^-/, '');
    }
    const decimalCount = sanitizedValue.split('.').length - 1;

    if (decimalCount <= 1) {
      setAmount(sanitizedValue);
    }
  }

  function handleAmountBlur(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    if (value != '') {
      if (value != '-') {
        setAmount(formatCurrencyInput(value));
      } else {
        setAmount('');
      }
    }
  }

  async function handleSubmit(formData: FormData) {
    if (!selectedCategory) {
      toast.error('Category is required.');
      return;
    }

    setLoading(true);

    const res = transaction
      ? await updateTransaction(
          transaction.id,
          formData,
          selectedCategory,
          selectedAccount,
          date,
          selectedCurrency,
          baseRate,
          quoteRate,
        )
      : await addTransaction(
          formData,
          selectedCategory,
          selectedAccount,
          date,
          selectedCurrency,
          baseRate,
          quoteRate,
          selectedRecurrence,
          recurrenceEndDate,
        );

    if (account && account.id !== selectedAccount.id) {
      if (res.ok) {
        router.push('/accounts/' + selectedAccount.id);
        mutate((key) => typeof key === 'string' && (key.startsWith('/accounts') || key.startsWith('/transactions')));
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
        setLoading(false);
      }
    } else {
      if (res.ok) {
        mutate((key) => typeof key === 'string' && (key.startsWith('/accounts') || key.startsWith('/transactions')));
        setOpenAddDialog(false);
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
      }

      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" action={handleSubmit}>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox} modal={true}>
          <PopoverTrigger asChild disabled={isTransactionCategoriesLoading}>
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
                  {selectedAccount.userId === user.id
                    ? selectedType.transactionCategories.map((category) => (
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
                              'ml-2 h-4 w-4 ' + (selectedCategory?.id === category.id ? 'opacity-100' : 'opacity-0')
                            }
                          />
                        </CommandItem>
                      ))
                    : transactionCategories?.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.id}
                          keywords={[category.name]}
                          onSelect={(currentValue) => {
                            const category = transactionCategories.find((category) => category.id === currentValue);
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
                              'ml-2 h-4 w-4 ' + (selectedCategory?.id === category.id ? 'opacity-100' : 'opacity-0')
                            }
                          />
                        </CommandItem>
                      ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedAccount.userId !== user.id && (
          <p className="text-xs text-muted-foreground">Shared accounts can only use the owner&apos;s categories.</p>
        )}
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="account">Account</Label>
        <Popover open={openAccountCombobox} onOpenChange={setOpenAccountCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openAccountCombobox}
              className={
                'h-12 w-full justify-between' +
                (selectedAccount ? ' text-foreground' : ' font-normal text-muted-foreground')
              }
            >
              <div className="flex items-center gap-3">
                <Avatar className="flex h-7 w-7 items-center justify-center">
                  <AvatarFallback style={{ backgroundColor: selectedAccount.color }}>
                    <div className="flex h-4.5 w-4.5 items-center justify-center">
                      <Image
                        src={'/icons/' + selectedAccount.icon}
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: 'auto', height: 'auto' }}
                        alt="Walletize Logo"
                        className={selectedAccount.iconColor === 'white' ? 'invert' : ''}
                      />
                    </div>
                  </AvatarFallback>
                </Avatar>
                <p>
                  {selectedAccount ? (
                    <>
                      {selectedAccount?.name}&nbsp;
                      <span className="text-muted-foreground">
                        {' '}
                        <span className="px-1 font-thin">|</span> {selectedAccount?.accountCategory.name}{' '}
                        <span className="px-1 font-thin">|</span> {selectedAccount?.currentValue < 0 && '-'}
                        {selectedAccount?.currency.symbol}
                        {formatCurrency(Math.abs(selectedAccount?.currentValue))}
                      </span>
                    </>
                  ) : (
                    'Select account...'
                  )}
                </p>
              </div>
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
                        if (account && account.id !== selectedAccount.id) {
                          setSelectedAccount(account);
                          setSelectedCurrency(account.currency || currencies[0]);
                          setLockRates(false);
                        }
                        setOpenAccountCombobox(false);
                      }}
                      className="flex justify-between"
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
                        className={'ml-2 h-4 w-4 ' + (selectedAccount.id === account.id ? 'opacity-100' : 'opacity-0')}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className={cn('grid gap-3', transaction ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3')}>
        <div className={'grid w-full items-center gap-1.5' + (selectedRecurrence === 'never' ? ' md:col-span-2' : '')}>
          <Label htmlFor="date">{selectedRecurrence === 'never' ? 'Date' : 'Starts'}</Label>
          <Popover open={openDate} onOpenChange={setOpenDate}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, selectedRecurrence === 'never' ? 'PPP' : 'PP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  if (date) {
                    setDate(date);
                    if (date > recurrenceEndDate) {
                      setRecurrenceEndDate(date);
                    }
                    setOpenDate(false);
                  }
                }}
                modifiers={{
                  disabled: [
                    {
                      dayOfWeek:
                        selectedRecurrence === 'everyWeekday'
                          ? [0, 6]
                          : selectedRecurrence === 'everyWeekend'
                            ? [1, 2, 3, 4, 5]
                            : [],
                    },
                  ],
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        {!transaction && (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select value={selectedRecurrence} onValueChange={setSelectedRecurrence}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a recurrence" />
              </SelectTrigger>
              <SelectContent className="max-h-[20rem] overflow-y-auto">
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="everyDay">Every Day</SelectItem>
                <SelectItem value="everyTwoDays">Every 2 Days</SelectItem>
                <SelectItem value="everyWeekday">Every Weekday</SelectItem>
                <SelectItem value="everyWeekend">Every Weekend</SelectItem>
                <SelectItem value="everyWeek">Every Week</SelectItem>
                <SelectItem value="everyTwoWeeks">Every 2 Weeks</SelectItem>
                <SelectItem value="everyFourWeeks">Every 4 Weeks</SelectItem>
                <SelectItem value="everyMonth">Every month</SelectItem>
                <SelectItem value="everyTwoMonths">Every 2 months</SelectItem>
                <SelectItem value="everyThreeMonths">Every 3 months</SelectItem>
                <SelectItem value="everySixMonths">Every 6 months</SelectItem>
                <SelectItem value="everyYear">Every year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {selectedRecurrence !== 'never' && (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="amount">Ends</Label>
            <Popover open={openRecurrence} onOpenChange={setOpenRecurrence}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !recurrenceEndDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {recurrenceEndDate ? format(recurrenceEndDate, 'PP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={recurrenceEndDate}
                  onSelect={(date) => {
                    setRecurrenceEndDate(date || new Date());
                    setOpenRecurrence(false);
                  }}
                  disabled={{ before: date }}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="description">
          Description <span className="text-xs leading-none text-muted-foreground">(optional)</span>
        </Label>
        <Input type="text" name="description" placeholder="TV subscription" defaultValue={transaction?.description} />
      </div>
      <div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 grid w-full items-center gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="text"
              name="amount"
              placeholder={selectedType.id === EXPENSE_ID ? '-0.00' : '0.00'}
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
                        {currencies.map((currency) => (
                          <CommandItem
                            key={currency.id}
                            value={currency.id}
                            keywords={[currency.code]}
                            onSelect={(currentValue) => {
                              const currency = currencies.find((currency) => currency.id === currentValue);
                              if (currency) {
                                setSelectedCurrency(currency);
                                if (currency.id != selectedAccount?.currencyId) {
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
              {selectedCurrency.id !== selectedAccount.currencyId ? (
                <Button type="button" variant="outline" size="icon" onClick={() => setOpenExchangeRateDialog(true)}>
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
        {selectedCurrency.id !== selectedAccount.currencyId &&
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
                {selectedAccount.currency.code}
              </span>{' '}
              ({quoteRate} {selectedCurrency.code} = {baseRate} {selectedAccount.currency.code})
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
                {selectedAccount.currency.code}
              </span>{' '}
              ({baseRate} {selectedAccount.currency.code} = {quoteRate} {selectedCurrency.code})
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
                  This action cannot be undone. This will permanently delete
                  {transaction.recurrenceId ? ':' : ' the transaction.'}
                </AlertDialogDescription>
                {transaction?.recurrenceId && (
                  <RadioGroup value={deleteType} onValueChange={setDeleteType} className="pt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="this" id="r1" />
                      <Label htmlFor="r1">This transaction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="this_and_following" id="r2" />
                      <Label htmlFor="r2">This and following transactions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="r3" />
                      <Label htmlFor="r3">All transactions</Label>
                    </div>
                  </RadioGroup>
                )}
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
        {transaction ? (
          <Button type="submit" disabled={loading || deleteLoading}>
            {loading ? <Spinner /> : 'Update transaction'}
          </Button>
        ) : (
          <Button type="submit" disabled={loading || deleteLoading}>
            {loading ? <Spinner /> : 'Add transaction'}
          </Button>
        )}
      </DialogFooter>
      <ExchangeRateDialog
        openExchangeRateDialog={openExchangeRateDialog}
        setOpenExchangeRateDialog={setOpenExchangeRateDialog}
        baseRate={baseRate}
        setBaseRate={setBaseRate}
        quoteRate={quoteRate}
        setQuoteRate={setQuoteRate}
        selectedAccount={selectedAccount}
        baseCurrency={selectedAccount.currency}
        quoteCurrency={selectedCurrency}
        transaction={transaction}
        lockRates={lockRates}
        setLockRates={setLockRates}
        setSelectedCurrency={setSelectedCurrency}
        swapRates={swapRates}
        setSwapRates={setSwapRates}
      ></ExchangeRateDialog>
    </form>
  );
}

export default TransactionExpenseIncomeForm;
