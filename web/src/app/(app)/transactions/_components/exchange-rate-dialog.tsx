import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cleanNumberInput, formatDate } from '@/lib/utils';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { Transaction } from '@/types/Transaction';
import { ArrowLeftRight } from 'lucide-react';
import React, { ChangeEvent, useEffect } from 'react';

interface ExchangeRateDialogProps {
  openExchangeRateDialog: boolean;
  setOpenExchangeRateDialog: React.Dispatch<React.SetStateAction<boolean>>;
  baseRate: string;
  setBaseRate: React.Dispatch<React.SetStateAction<string>>;
  quoteRate: string;
  setQuoteRate: React.Dispatch<React.SetStateAction<string>>;
  selectedAccount: FinancialAccount | null;
  setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>;
  baseCurrency?: Currency;
  quoteCurrency?: Currency;
  transaction?: Transaction;
  lockRates: boolean;
  setLockRates: React.Dispatch<React.SetStateAction<boolean>>;
  swapRates: boolean;
  setSwapRates: React.Dispatch<React.SetStateAction<boolean>>;
  lockSelectedCurrency?: boolean;
}

function ExchangeRateDialog({
  openExchangeRateDialog,
  setOpenExchangeRateDialog,
  baseRate,
  setBaseRate,
  quoteRate,
  setQuoteRate,
  selectedAccount,
  setSelectedCurrency,
  baseCurrency,
  quoteCurrency,
  transaction,
  lockRates,
  setLockRates,
  swapRates,
  setSwapRates,
  lockSelectedCurrency = false,
}: ExchangeRateDialogProps) {
  let baseRelativeRate = '';
  let quoteRelativeRate = '';

  if (baseCurrency && quoteCurrency) {
    baseRelativeRate = cleanNumberInput(((1 / quoteCurrency?.rate) * baseCurrency.rate).toString(), 8);
    quoteRelativeRate = cleanNumberInput(((1 / baseCurrency?.rate) * quoteCurrency.rate).toString(), 8);
  }

  useEffect(() => {
    if (openExchangeRateDialog && !lockRates) {
      setSwapRates(false);
      setBaseRate('1');
      if (transaction?.rate && quoteCurrency?.id === transaction?.currencyId) {
        setQuoteRate(cleanNumberInput(transaction.rate.toString(), 8));
      } else {
        setQuoteRate(quoteRelativeRate);
      }
    }
  }, [
    quoteCurrency,
    quoteRelativeRate,
    baseCurrency,
    setBaseRate,
    setQuoteRate,
    transaction,
    openExchangeRateDialog,
    lockRates,
    setSwapRates,
  ]);

  function handleSwap() {
    if (swapRates) {
      setBaseRate(quoteRate);
      if (quoteCurrency && baseCurrency) {
        if (transaction?.rate) {
          setQuoteRate(cleanNumberInput(transaction.rate.toString(), 8));
        } else {
          setQuoteRate(quoteRelativeRate);
        }
      }
    } else {
      setQuoteRate(baseRate);
      if (quoteCurrency && baseCurrency) {
        if (transaction?.rate) {
          setBaseRate(
            cleanNumberInput(
              (
                (Number(quoteRelativeRate.replaceAll(',', '')) / transaction.rate) *
                Number(baseRelativeRate.replaceAll(',', ''))
              ).toString(),
              8,
            ),
          );
        } else {
          setBaseRate(baseRelativeRate);
        }
      }
    }

    setSwapRates(!swapRates);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { value, name } = e.target;
    const sanitizedValue = value.replace(/[^\d.,-]/g, '');
    const decimalCount = sanitizedValue.split('.').length - 1;
    if (decimalCount <= 1) {
      if (name == 'baseRate') {
        setBaseRate(sanitizedValue);
      } else if (name === 'quoteRate') {
        setQuoteRate(sanitizedValue);
      }
    }
  }

  function handleBlur(e: ChangeEvent<HTMLInputElement>) {
    const { value, name } = e.target;

    if (value != '') {
      const cleanNumber = value.replace(/,/g, '');
      const roundedNumber = parseFloat(cleanNumber).toFixed(8);
      const formattedNumber = parseFloat(roundedNumber).toLocaleString('en-US', { maximumFractionDigits: 8 });

      if (name == 'baseRate') {
        setBaseRate(formattedNumber);
      } else if (name === 'quoteRate') {
        setQuoteRate(formattedNumber);
      }
    }
  }

  function resetRates() {
    if (!swapRates) {
      setBaseRate('1');
      if (quoteCurrency && baseCurrency) {
        setQuoteRate(quoteRelativeRate);
      }
    } else {
      setQuoteRate('1');
      if (quoteCurrency && baseCurrency) {
        setBaseRate(baseRelativeRate);
      }
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOpenExchangeRateDialog(false);
    setLockRates(true);
  }

  return (
    <Dialog
      open={openExchangeRateDialog}
      onOpenChange={(open) => {
        if (!open && !lockRates) {
          setBaseRate('1');
          if (transaction?.rate) {
            setQuoteRate(cleanNumberInput(transaction.rate.toString(), 8));
          } else {
            if (selectedAccount) {
              if (quoteCurrency === selectedAccount.currency) {
                setQuoteRate(quoteRelativeRate);
              } else {
                if (!lockSelectedCurrency) {
                  setQuoteRate(baseRelativeRate);
                } else {
                  setQuoteRate(quoteRelativeRate);
                }
              }
              if (!lockSelectedCurrency) {
                setSelectedCurrency(selectedAccount.currency);
              }
            }
          }
        }

        setOpenExchangeRateDialog(open);
      }}
    >
      <DialogContent className="sm:max-w-[525px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Set exchange rate</DialogTitle>
          <DialogDescription>Set the exchange rate for this transaction.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="flex gap-2">
              {swapRates ? (
                <>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="quoteRate">{quoteCurrency?.code}</Label>
                    <Input
                      type="text"
                      name="quoteRate"
                      placeholder="1"
                      min={0.0001}
                      value={quoteRate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  <Button variant="outline" size="icon" className="mt-auto px-2" onClick={handleSwap} type="button">
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="baseRate">{baseCurrency?.code}</Label>
                    <Input
                      type="text"
                      name="baseRate"
                      min={0.0001}
                      placeholder="1"
                      value={baseRate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="baseRate">{baseCurrency?.code}</Label>
                    <Input
                      type="text"
                      name="baseRate"
                      min={0.0001}
                      placeholder="1"
                      value={baseRate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  <Button variant="outline" size="icon" className="mt-auto px-2" onClick={handleSwap} type="button">
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="quoteRate">{quoteCurrency?.code}</Label>
                    <Input
                      type="text"
                      name="quoteRate"
                      min={0.0001}
                      placeholder="1"
                      value={quoteRate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mb-3">
              {swapRates ? (
                <p className="text-sm text-muted-foreground">
                  1 {quoteCurrency?.code} = {baseRelativeRate} {baseCurrency?.code} as of{' '}
                  {baseCurrency ? formatDate(new Date(baseCurrency.updatedAt)) : ''}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  1 {baseCurrency?.code} = {quoteRelativeRate} {quoteCurrency?.code} as of{' '}
                  {baseCurrency ? formatDate(new Date(baseCurrency.updatedAt)) : ''}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => resetRates()} type="button" variant="secondary">
              Reset to latest rates
            </Button>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ExchangeRateDialog;
