import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { EXPENSE_ID, INCOME_ID } from '@/lib/constants';
import { darkenHexColor, formatCurrency } from '@/lib/utils';
import { Currency } from '@/types/Currency';
import { TransactionCategory } from '@/types/TransactionCategory';
import { User } from '@/types/User';
import Image from 'next/image';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';

interface TransactionCategoryChartProps {
  typeId: typeof INCOME_ID | typeof EXPENSE_ID;
  data: TransactionCategory[];
  currency: Currency | undefined;
  user: User;
}

function TransactionCategoryChart({ typeId, data, currency, user }: TransactionCategoryChartProps) {
  const transactionsCount = data.reduce((acc, item) => acc + (item._count?.transactions || 0), 0);
  const emptyData = [
    {
      name: 'No data',
      totalAmount: 1,
      color: typeId === INCOME_ID ? '#2dba75' : '#ff3344',
      icon: '#45a7e6',
      iconColor: '#45a7e6',
    },
  ];

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <Card>
          <div className="flex items-center gap-3 p-4 text-sm">
            <Avatar className="flex h-9 w-9 items-center justify-center">
              <AvatarFallback style={{ backgroundColor: payload[0].payload.color }}>
                <div className="flex h-5 w-5 items-center justify-center">
                  <Image
                    src={'/icons/' + payload[0].payload.icon}
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: 'auto', height: 'auto' }}
                    alt="Walletize Logo"
                    className={payload[0].payload.iconColor === 'white' ? 'invert' : ''}
                  />
                </div>
              </AvatarFallback>
            </Avatar>
            <div>
              <p>{payload[0].name}</p>
              {user.id !== payload[0].payload.userId && (
                <p className="text-xs text-muted-foreground">{payload[0].payload.user.name}&apos;s category</p>
              )}
              {payload[0].value != undefined ? (
                <p className="flex items-center gap-1 font-bold">
                  <span className="text-xs text-muted-foreground">
                    {typeId === INCOME_ID ? '+' : '-'}
                    {currency?.symbol}
                  </span>
                  <span className={typeId === INCOME_ID ? 'text-positive' : 'text-negative'}>
                    {formatCurrency(payload[0].value)}
                  </span>
                </p>
              ) : (
                <p className="text-muted-foreground">No data found</p>
              )}
            </div>
          </div>
        </Card>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardContent className="flex h-full flex-col !p-0">
        <div className="relative flex h-60 w-full min-w-0 items-center justify-center lg:h-full">
          <div className="absolute flex flex-col gap-1 text-center">
            <p className="text-4xl font-bold lg:text-3xl xl:text-4xl">{transactionsCount}</p>
            <div>
              <p className="text-sm lg:text-xs xl:text-sm">{typeId === INCOME_ID ? 'Income' : 'Expense'} entries</p>
              <p className="text-sm text-muted-foreground lg:text-xs xl:text-sm">
                {data.length} {data.length === 1 ? 'category' : 'categories'}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data.length > 0 ? data : emptyData}
                dataKey="totalAmount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="75%"
                outerRadius="85%"
                stroke="none"
              >
                {data.length > 0
                  ? data.map((entry, index) => <Cell key={`cell-${index}`} fill={darkenHexColor(entry.color, 10)} />)
                  : emptyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={darkenHexColor(entry.color, 20)} />
                    ))}
              </Pie>
              <Pie
                data={data.length > 0 ? data : emptyData}
                dataKey="totalAmount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="75%"
                stroke="none"
              >
                {data.length > 0
                  ? data.map((entry, index) => <Cell key={`cell-${index}`} fill={darkenHexColor(entry.color, 40)} />)
                  : emptyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={darkenHexColor(entry.color, 40)} />
                    ))}
              </Pie>
              <Pie
                data={data.length > 0 ? data : emptyData}
                dataKey="totalAmount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="68%"
                stroke="none"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, payload, percent }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 2.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  if (percent < 0.1 || data.length === 0) return null;

                  return (
                    <foreignObject x={x - 18} y={y - 18} width={40} height={40} className="pointer-events-none">
                      <Avatar className="flex h-9 w-9 items-center justify-center">
                        <AvatarFallback style={{ backgroundColor: payload.payload.color }}>
                          <div className="flex h-5 w-5 items-center justify-center">
                            <Image
                              src={'/icons/' + payload.payload.icon}
                              width={0}
                              height={0}
                              sizes="100vw"
                              style={{ width: 'auto', height: 'auto' }}
                              alt="Walletize Logo"
                              className={payload.payload.iconColor === 'white' ? 'invert' : ''}
                            />
                          </div>
                        </AvatarFallback>
                      </Avatar>
                    </foreignObject>
                  );
                }}
              >
                {data.length > 0
                  ? data.map((entry, index) => <Cell key={`cell-${index}`} fill={darkenHexColor(entry.color, 60)} />)
                  : emptyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={darkenHexColor(entry.color, 60)} />
                    ))}
              </Pie>
              {data.length > 0 && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default TransactionCategoryChart;
