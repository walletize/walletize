SELECT
  MAX(t.date),
  MIN(t.date)
FROM
  "transactions" t
  JOIN "financial_accounts" fa ON t."account_id" = fa."id"
WHERE
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
