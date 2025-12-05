SELECT
  SUM(
    CASE
      WHEN t.currency_id != fa.currency_id THEN (t.amount / c.rate * fc.rate)
      ELSE t.amount
    END
  ) AS "prevValue"
FROM
  transactions t
  INNER JOIN financial_accounts fa ON t.account_id = fa.id
  INNER JOIN account_categories ac ON fa.category_id = ac.id
  INNER JOIN account_types at ON ac.type_id = at.id
  LEFT JOIN currencies c ON t.currency_id = c.id
  LEFT JOIN currencies fc ON fa.currency_id = fc.id
WHERE
  at.name = $1
  AND fa.user_id = $2
  AND t.date < $3::date;
