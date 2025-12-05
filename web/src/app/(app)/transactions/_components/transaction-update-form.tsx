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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { errorMessages } from '@/lib/messages';
import { cleanNumberInput, cn, formatCurrency, formatCurrencyInput } from '@/lib/utils';
import { addUpdateTransaction, deleteTransaction, updateTransaction } from '@/services/transactions';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { Transaction } from '@/types/Transaction';
import { User } from '@/types/User';
import { format } from 'date-fns';
import { ArrowLeftRight, CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import ExchangeRateDialog from './exchange-rate-dialog';

interface TransactionUpdateFormProps {
  accounts: FinancialAccount[];
  currencies: Currency[];
  account?: FinancialAccount;
  user: User;
  openOverlay: boolean;
  setOpenOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  transaction?: Transaction;
}

function TransactionUpdateForm({
  accounts,
  currencies,
  account,
  openOverlay,
  setOpenOverlay,
  transaction,
}: TransactionUpdateFormProps) {
  const router = useRouter();

  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [openAccountCombobox, setOpenAccountCombobox] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(accounts[0].currency);
  const [openCurrencyCombobox, setOpenCurrencyCombobox] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [amount, setAmount] = useState('');
  const [openCalendar, setOpenCalendar] = useState(false);
  const [date, setDate] = useState<Date>(transaction ? transaction.date : new Date());
  const [openExchangeRateDialog, setOpenExchangeRateDialog] = useState(false);
  const [baseRate, setBaseRate] = useState('1');
  const [quoteRate, setQuoteRate] = useState('1');
  const [lockRates, setLockRates] = useState(false);
  const [swapRates, setSwapRates] = useState(false);
  const [updateType, setUpdateType] = useState(transaction ? 'amount' : 'value');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (openOverlay) {
      setOpenAccountCombobox(false);
      setOpenCurrencyCombobox(false);
      setLoading(false);
      setDeleteLoading(false);

      if (transaction) {
        setNewValue('');
        setAmount(formatCurrency(transaction?.amount, 0, 4));
        setUpdateType('amount');
        setSelectedAccount(accounts.find((account) => account.id === transaction.financialAccount.id) || accounts[0]);
        setSelectedCurrency(transaction.currency);
        setBaseRate('1');
        setQuoteRate(cleanNumberInput(transaction.rate?.toString() || '', 10));
      } else if (account) {
        setNewValue('');
        setAmount('');
        setUpdateType('value');
        setSelectedAccount(account);
        setSelectedCurrency(account.currency);
        setBaseRate('1');
        setQuoteRate('1');
      } else {
        setSelectedAccount(accounts[0]);
        setSelectedCurrency(accounts[0].currency);
        setNewValue('');
        setAmount('');
        setUpdateType('value');
        setBaseRate('1');
        setQuoteRate('1');
      }
    }
  }, [account, accounts, currencies, openOverlay, transaction]);

  function handleChange(e: ChangeEvent<HTMLInputElement>, setValue: (value: SetStateAction<string>) => void) {
    const { value } = e.target;

    const sanitizedValue = value.replace(/[^\d.,-]/g, '');
    const decimalCount = sanitizedValue.split('.').length - 1;

    if (decimalCount <= 1) {
      setValue(sanitizedValue);
    }
  }

  function handleBlur(e: ChangeEvent<HTMLInputElement>, setValue: (value: SetStateAction<string>) => void) {
    const { value } = e.target;

    if (value != '') {
      setValue(formatCurrencyInput(value));
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

    if (updateType === 'value') {
      formData.set('amount', '');
    } else {
      formData.set('newValue', '');
    }
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
        )
      : await addUpdateTransaction(formData, selectedAccount, date, selectedCurrency, baseRate, quoteRate);

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
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="date">Date</Label>
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
      {!transaction && (
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="updateType">Update type</Label>
          <Select
            value={updateType}
            onValueChange={(value) => {
              if (value === 'value') {
                setSelectedCurrency(selectedAccount.currency);
              }
              setUpdateType(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select update type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="value">Value</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <div className="grid grid-cols-3 gap-3">
          {updateType === 'value' ? (
            <div className="col-span-2 grid w-full items-center gap-1.5">
              <Label htmlFor="newValue">New value</Label>
              <Input
                type="text"
                name="newValue"
                placeholder="0.00"
                value={newValue}
                onChange={(e) => handleChange(e, setNewValue)}
                onBlur={(e) => handleBlur(e, setNewValue)}
                required
              />
            </div>
          ) : (
            <div className="col-span-2 grid w-full items-center gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="text"
                name="amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleChange(e, setAmount)}
                onBlur={(e) => handleBlur(e, setAmount)}
                required
              />
            </div>
          )}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="currency">Currency</Label>
            <div className="flex gap-2">
              <Popover open={openCurrencyCombobox} onOpenChange={setOpenCurrencyCombobox} modal={true}>
                <PopoverTrigger asChild disabled={updateType === 'value'}>
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
              {selectedCurrency.id != selectedAccount.currencyId ? (
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

export default TransactionUpdateForm;
