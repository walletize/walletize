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
  JOIN users u ON fa.user_id = u.id
  JOIN currencies c ON t.currency_id = c.id
  JOIN currencies fc ON fa.currency_id = fc.id
  JOIN currencies uc ON u.main_currency_id = uc.id
WHERE
  account_id = $1
  AND t.date <= $2::date;
