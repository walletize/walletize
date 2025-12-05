SELECT
  MAX(t.date),
  MIN(t.date)
FROM
  "transactions" t
  JOIN "financial_accounts" fa ON t."account_id" = fa."id"
WHERE
  "account_id" = $1
