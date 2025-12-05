SELECT
  SUM(
    CASE
      WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate / ca.rate * cu.rate
      ELSE CASE
        WHEN t.currency_id = u.main_currency_id THEN t.amount
        ELSE t.amount / ca.rate * cu.rate
      END
    END
  ) AS "prevValue"
FROM
  transactions t
  JOIN transaction_categories tc ON t.category_id = tc.id
  JOIN transaction_types tt ON tc.type_id = tt.id
  JOIN financial_accounts fa ON t.account_id = fa.id
  JOIN users u ON fa.user_id = u.id
  JOIN currencies c ON t.currency_id = c.id
  JOIN currencies ca ON fa.currency_id = ca.id
  JOIN currencies cu ON u.main_currency_id = cu.id
WHERE
  (
    fa.user_id = $1
    OR EXISTS (
      SELECT
        1
      FROM
        account_invites
      WHERE
        account_id = fa.id
        AND user_id = $1
        AND status = 'ACCEPTED'
    )
  )
  AND t.date >= $2::date
  AND t.date <= $3::date
  AND tt.name = $4
