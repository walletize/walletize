SELECT
  fa.id AS "id",
  fa.name AS "name",
  fa.user_id AS "userId",
  fa.category_id AS "categoryId",
  fa.currency_id AS "currencyId",
  fa.initial_value AS "initialValue",
  fa.icon AS "icon",
  fa.color AS "color",
  fa.icon_color AS "iconColor",
  (
    SELECT
      COUNT(*)
    FROM
      transactions t
    WHERE
      t.account_id = fa.id
  ) AS "transactionsCount",
  fa.created_at AS "createdAt",
  fa.updated_at AS "updatedAt",
  jsonb_build_object(
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
  ) AS "accountCategory",
  jsonb_build_object(
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
  ) AS "currency",
  jsonb_build_object(
    'id',
    u.id,
    'name',
    u.name,
    'email',
    u.email,
    'createdAt',
    u.created_at,
    'updatedAt',
    u.updated_at
  ) AS "user",
  (
    SELECT
      fa.initial_value + COALESCE(
        SUM(
          CASE
            WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate
            ELSE t.amount
          END
        ),
        0
      )
    FROM
      transactions t
    WHERE
      t.account_id = fa.id
  ) AS "currentValue",
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
            ai.updated_at,
            'user',
            jsonb_build_object(
              'id',
              ui.id,
              'name',
              ui.name,
              'email',
              ui.email,
              'createdAt',
              ui.created_at,
              'updatedAt',
              ui.updated_at
            )
          )
          ORDER BY
            ai.status DESC
        ) FILTER (
          WHERE
            ai.id IS NOT NULL
        ),
        '[]'
      )
    FROM
      account_invites ai
      LEFT JOIN users ui ON ai.user_id = ui.id
    WHERE
      ai.account_id = fa.id
  ) AS "accountInvites"
FROM
  financial_accounts fa
  JOIN account_categories ac ON fa.category_id = ac.id
  JOIN account_types at ON ac.type_id = at.id
  JOIN currencies c ON fa.currency_id = c.id
  JOIN users u ON fa.user_id = u.id
WHERE
  fa.id = $1
GROUP BY
  fa.id,
  ac.id,
  at.id,
  c.id,
  u.id
