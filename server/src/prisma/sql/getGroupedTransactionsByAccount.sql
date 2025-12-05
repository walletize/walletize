SELECT
  DATE_TRUNC('day', t.date) AS "transactionDate",
  array_agg(
    json_build_object(
      'id',
      t.id,
      'description',
      t.description,
      'amount',
      t.amount,
      'accountCurrencyAmount',
      CASE
        WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate
        ELSE t.amount
      END,
      'mainCurrencyAmount',
      CASE
        WHEN t.currency_id != fa.currency_id THEN CASE
          WHEN fa.currency_id != u.main_currency_id THEN t.amount / t.rate / fc.rate * uc.rate
          ELSE t.amount / t.rate
        END
        ELSE CASE
          WHEN t.currency_id != u.main_currency_id THEN t.amount / c.rate * uc.rate
          ELSE t.amount
        END
      END,
      'date',
      t.date,
      'rate',
      t.rate,
      'accountId',
      t.account_id,
      'currencyId',
      t.currency_id,
      'recurrenceId',
      t.recurrence_id,
      'createdAt',
      t.created_at,
      'updatedAt',
      t.updated_at,
      'transactionCategory',
      json_build_object(
        'id',
        tc.id,
        'name',
        tc.name,
        'typeId',
        tc.type_id,
        'icon',
        tc.icon,
        'color',
        tc.color,
        'iconColor',
        tc.icon_color,
        'createdAt',
        tc.created_at,
        'updatedAt',
        tc.updated_at,
        'transactionType',
        json_build_object(
          'id',
          tt.id,
          'name',
          tt.name,
          'createdAt',
          tt.created_at,
          'updatedAt',
          tt.updated_at
        )
      ),
      'financialAccount',
      json_build_object(
        'id',
        fa.id,
        'name',
        fa.name,
        'userId',
        fa.user_id,
        'categoryId',
        fa.category_id,
        'currencyId',
        fa.currency_id,
        'initialValue',
        fa.initial_value,
        'icon',
        fa.icon,
        'color',
        fa.color,
        'iconColor',
        fa.icon_color,
        'createdAt',
        fa.created_at,
        'updatedAt',
        fa.updated_at,
        'currency',
        json_build_object(
          'id',
          fc.id,
          'code',
          fc.code,
          'name',
          fc.name,
          'symbol',
          fc.symbol,
          'rate',
          fc.rate,
          'createdAt',
          fc.created_at,
          'updatedAt',
          fc.updated_at
        ),
        'accountCategory',
        json_build_object(
          'id',
          ac.id,
          'name',
          ac.name,
          'typeId',
          ac.type_id,
          'userId',
          ac.user_id,
          'createdAt',
          ac.created_at,
          'updatedAt',
          ac.updated_at,
          'accountType',
          jsonb_build_object(
            'id',
            at.id,
            'name',
            at.name,
            'createdAt',
            at.created_at,
            'updatedAt',
            at.updated_at
          )
        ),
        'accountInvites',
        (
          SELECT
            COALESCE(
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  ai.id,
                  'status',
                  ai.status,
                  'email',
                  ai.email,
                  'userId',
                  ai.user_id,
                  'accountId',
                  ai.account_id,
                  'createdAt',
                  ai.created_at,
                  'updatedAt',
                  ai.updated_at
                )
              ) FILTER (
                WHERE
                  ai.id IS NOT NULL
              ),
              '[]'
            )
          FROM
            account_invites ai
          WHERE
            ai.account_id = fa.id
            AND ai.status = 'ACCEPTED'
        )
      ),
      'currency',
      json_build_object(
        'id',
        c.id,
        'code',
        c.code,
        'name',
        c.name,
        'symbol',
        c.symbol,
        'rate',
        c.rate,
        'createdAt',
        c.created_at,
        'updatedAt',
        c.updated_at
      ),
      'user',
      json_build_object('id', u.id, 'name', u.name, 'email', u.email),
      'transactionTransfer',
      (
        SELECT
          jsonb_build_object(
            'id',
            tt.id,
            'originTransactionId',
            tt.origin_transaction_id,
            'destinationTransactionId',
            tt.destination_transaction_id,
            'originTransaction',
            CASE
              WHEN tt.origin_transaction_id = t.id THEN json_build_object(
                'id',
                t.id,
                'accountId',
                t.account_id,
                'transactionCategory',
                json_build_object('id', tc.id, 'typeId', tc.type_id),
                'financialAccount',
                json_build_object(
                  'id',
                  fa.id,
                  'name',
                  fa.name,
                  'userId',
                  fa.user_id,
                  'categoryId',
                  fa.category_id,
                  'currencyId',
                  fa.currency_id,
                  'initialValue',
                  fa.initial_value,
                  'icon',
                  fa.icon,
                  'color',
                  fa.color,
                  'iconColor',
                  fa.icon_color,
                  'createdAt',
                  fa.created_at,
                  'updatedAt',
                  fa.updated_at
                )
              )
              ELSE json_build_object(
                'id',
                ot.id,
                'accountId',
                ot.account_id,
                'transactionCategory',
                json_build_object('id', otc.id, 'typeId', otc.type_id),
                'financialAccount',
                json_build_object(
                  'id',
                  ofa.id,
                  'name',
                  ofa.name,
                  'userId',
                  ofa.user_id,
                  'categoryId',
                  ofa.category_id,
                  'currencyId',
                  ofa.currency_id,
                  'initialValue',
                  ofa.initial_value,
                  'icon',
                  ofa.icon,
                  'color',
                  ofa.color,
                  'iconColor',
                  ofa.icon_color,
                  'createdAt',
                  ofa.created_at,
                  'updatedAt',
                  ofa.updated_at
                )
              )
            END,
            'destinationTransaction',
            CASE
              WHEN tt.destination_transaction_id = t.id THEN json_build_object(
                'id',
                t.id,
                'accountId',
                t.account_id,
                'transactionCategory',
                json_build_object('id', tc.id, 'typeId', tc.type_id),
                'financialAccount',
                json_build_object(
                  'id',
                  fa.id,
                  'name',
                  fa.name,
                  'userId',
                  fa.user_id,
                  'categoryId',
                  fa.category_id,
                  'currencyId',
                  fa.currency_id,
                  'initialValue',
                  fa.initial_value,
                  'icon',
                  fa.icon,
                  'color',
                  fa.color,
                  'iconColor',
                  fa.icon_color,
                  'createdAt',
                  fa.created_at,
                  'updatedAt',
                  fa.updated_at
                )
              )
              ELSE json_build_object(
                'id',
                dt.id,
                'accountId',
                dt.account_id,
                'transactionCategory',
                json_build_object('id', dtc.id, 'typeId', dtc.type_id),
                'financialAccount',
                json_build_object(
                  'id',
                  dfa.id,
                  'name',
                  dfa.name,
                  'userId',
                  dfa.user_id,
                  'categoryId',
                  dfa.category_id,
                  'currencyId',
                  dfa.currency_id,
                  'initialValue',
                  dfa.initial_value,
                  'icon',
                  dfa.icon,
                  'color',
                  dfa.color,
                  'iconColor',
                  dfa.icon_color,
                  'createdAt',
                  dfa.created_at,
                  'updatedAt',
                  dfa.updated_at
                )
              )
            END
          )
        FROM
          transaction_transfers tt
          LEFT JOIN transactions dt ON tt.destination_transaction_id = dt.id
          LEFT JOIN financial_accounts dfa ON dt.account_id = dfa.id
          LEFT JOIN transaction_categories dtc ON dt.category_id = dtc.id
          LEFT JOIN transactions ot ON tt.origin_transaction_id = ot.id
          LEFT JOIN financial_accounts ofa ON ot.account_id = ofa.id
          LEFT JOIN transaction_categories otc ON ot.category_id = otc.id
        WHERE
          tt.origin_transaction_id = t.id
          OR tt.destination_transaction_id = t.id
        LIMIT
          1
      )
    )
    ORDER BY
      t.created_at DESC
  ) AS transactions
FROM
  transactions t
  JOIN transaction_categories tc ON t.category_id = tc.id
  JOIN transaction_types tt ON tc.type_id = tt.id
  JOIN financial_accounts fa ON t.account_id = fa.id
  JOIN account_categories ac ON fa.category_id = ac.id
  JOIN account_types at ON ac.type_id = at.id
  JOIN currencies c ON t.currency_id = c.id
  JOIN currencies fc ON fa.currency_id = fc.id
  JOIN users u ON t.user_id = u.id
  JOIN currencies uc ON u.main_currency_id = uc.id
WHERE
  account_id = $1
  AND t.date >= $2::date
  AND t.date <= $3::date
GROUP BY
  "transactionDate"
ORDER BY
  "transactionDate" DESC
LIMIT
  10
OFFSET
  $4;
