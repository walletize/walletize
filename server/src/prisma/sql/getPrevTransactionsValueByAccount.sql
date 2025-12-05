SELECT
  SUM(
    CASE
      WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate
      ELSE t.amount
    END
  ) AS "prevValue"
FROM
  transactions t
  JOIN transaction_categories tc ON t.category_id = tc.id
  JOIN transaction_types tt ON tc.type_id = tt.id
  JOIN financial_accounts fa ON t.account_id = fa.id
WHERE
  account_id = $1
  AND t.date >= $2::date
  AND t.date <= $3::date
  AND tt.name = $4;
