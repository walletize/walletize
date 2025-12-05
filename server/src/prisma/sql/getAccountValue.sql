SELECT
  SUM(
    CASE
      WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate
      ELSE t.amount
    END
  )
FROM
  transactions t
  JOIN financial_accounts fa ON t.account_id = fa.id
WHERE
  t.account_id = $1;
