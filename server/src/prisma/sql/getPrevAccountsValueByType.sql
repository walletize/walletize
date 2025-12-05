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
  JOIN "financial_accounts" fa ON t."account_id" = fa."id"
  JOIN "account_categories" ac ON fa."category_id" = ac."id"
  JOIN "account_types" at ON ac."type_id" = at."id"
  JOIN "users" u ON fa."user_id" = u."id"
  JOIN "currencies" ca ON fa."currency_id" = ca."id"
  JOIN "currencies" cu ON u."main_currency_id" = cu."id"
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
  AND at.name = $2
  AND t.date <= $3::date;
