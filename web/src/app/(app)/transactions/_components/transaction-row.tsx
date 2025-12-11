import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { cn, formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types/Transaction';
import { User } from '@/types/User';
import { ArrowRight, Repeat } from 'lucide-react';
import Image from 'next/image';

interface TransactionRowProps {
  transaction: Transaction;
  user: User;
  showMainCurrencyAmount?: boolean;
  highlight?: string;
}

function TransactionRow({ transaction, user, showMainCurrencyAmount, highlight }: TransactionRowProps) {
  const mainAmount = showMainCurrencyAmount ? transaction.mainCurrencyAmount : transaction.accountCurrencyAmount;

  return (
    <div
      key={transaction.id}
      className="grid grid-cols-2 items-center overflow-hidden rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors hover:cursor-pointer hover:bg-muted md:grid-cols-4"
    >
      <div className="flex items-center gap-4">
        <Avatar className="flex h-9 w-9 items-center justify-center">
          <AvatarFallback style={{ backgroundColor: transaction.transactionCategory.color }}>
            <div className="flex h-5 w-5 items-center justify-center">
              <Image
                src={'/icons/' + transaction.transactionCategory.icon}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
                alt={transaction.transactionCategory.name}
                className={transaction.transactionCategory.iconColor === 'white' ? 'invert' : ''}
              />
            </div>
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-3">
          <div>
            <p>
              <HighlightedText text={transaction.transactionCategory.name} highlight={highlight} />
            </p>
            {transaction.financialAccount.accountInvites.length > 0 && (
              <p className="text-xs text-muted-foreground">{transaction.user.name}</p>
            )}
          </div>
          {transaction.recurrenceId && <Repeat size={16} className="text-muted-foreground" />}
        </div>
      </div>
      <div className="hidden md:block">
        {transaction.description ? (
          <p>
            <HighlightedText text={transaction.description} highlight={highlight} />
          </p>
        ) : !transaction.transactionTransfer ? (
          <p>-</p>
        ) : (
          ''
        )}
        {transaction.transactionTransfer && transaction.id === transaction.transactionTransfer.originTransactionId && (
          <p className="flex items-center gap-1">
            <span className="text-xs font-light text-muted-foreground">To</span>
            <span className="text-xs text-muted-foreground">
              {transaction.transactionTransfer.destinationTransaction?.financialAccount.name ?? 'Out of Walletize'}
            </span>
          </p>
        )}
        {transaction.transactionTransfer &&
          transaction.id === transaction.transactionTransfer.destinationTransactionId && (
            <p className="flex items-center gap-1">
              <span className="text-xs font-light text-muted-foreground">From</span>
              <span className="text-xs text-muted-foreground">
                {transaction.transactionTransfer.originTransaction?.financialAccount.name ?? 'Out of Walletize'}
              </span>
            </p>
          )}
      </div>
      <div className="hidden items-center gap-3 md:flex">
        <Avatar className="flex h-7 w-7 items-center justify-center">
          <AvatarFallback style={{ backgroundColor: transaction.financialAccount.color }}>
            <div className="flex h-4.5 w-4.5 items-center justify-center">
              <Image
                src={'/icons/' + transaction.financialAccount.icon}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
                alt="Walletize Logo"
                className={transaction.financialAccount.iconColor === 'white' ? 'invert' : ''}
              />
            </div>
          </AvatarFallback>
        </Avatar>
        <p>
          <HighlightedText text={transaction.financialAccount.name} highlight={highlight} />
        </p>
      </div>
      <div className="text-right">
        <p className="flex items-center justify-end gap-1 font-bold">
          <span className="text-xs text-muted-foreground">
            {mainAmount > 0 ? '+' : mainAmount < 0 ? '-' : ''}
            {showMainCurrencyAmount ? user.mainCurrency?.symbol : transaction.financialAccount.currency.symbol}
          </span>
          <span className={mainAmount > 0 ? 'text-positive' : mainAmount < 0 ? 'text-negative' : ''}>
            {formatCurrency(Math.abs(mainAmount))}
          </span>
        </p>
        <div className="flex items-center justify-end gap-1">
          {(transaction.financialAccount.currencyId != transaction.currencyId ||
            (user.mainCurrencyId != transaction.currencyId && showMainCurrencyAmount)) && (
            <p className="flex items-center justify-end gap-1 font-bold">
              <span className="text-[0.6rem] text-muted-foreground/75">
                {transaction.amount > 0 ? '+' : transaction.amount < 0 ? '-' : ''}
                {transaction.currency.symbol}
              </span>
              <span
                className={cn(
                  'text-xs',
                  transaction.amount > 0
                    ? 'text-positive/75'
                    : transaction.amount < 0
                      ? 'text-negative/75'
                      : 'text-primary/75',
                )}
              >
                {formatCurrency(Math.abs(transaction.amount))}
              </span>
            </p>
          )}
          {showMainCurrencyAmount &&
            transaction.currencyId != transaction.financialAccount.currencyId &&
            transaction.financialAccount.currencyId != user.mainCurrencyId && (
              <>
                <ArrowRight size={14} className="text-muted-foreground/75" />
                <p className="flex items-center justify-end gap-1 font-bold">
                  <span className="text-[0.6rem] text-muted-foreground/75">
                    {transaction.accountCurrencyAmount > 0 ? '+' : transaction.accountCurrencyAmount < 0 ? '-' : ''}
                    {transaction.financialAccount.currency.symbol}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      transaction.accountCurrencyAmount > 0
                        ? 'text-positive/75'
                        : transaction.accountCurrencyAmount < 0
                          ? 'text-negative/75'
                          : 'text-primary/75',
                    )}
                  >
                    {formatCurrency(Math.abs(transaction.accountCurrencyAmount))}
                  </span>
                </p>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

export default TransactionRow;
