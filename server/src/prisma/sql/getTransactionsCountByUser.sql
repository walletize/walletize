SELECT
  COUNT(*)
FROM
  (
    SELECT
      DATE_TRUNC('day', t.date) AS "transactionDate"
    FROM
      transactions t
      JOIN transaction_categories tc ON t.category_id = tc.id
      JOIN transaction_types tt ON tc.type_id = tt.id
      JOIN financial_accounts fa ON t.account_id = fa.id
      JOIN account_categories ac ON fa.category_id = ac.id
      JOIN account_types at ON ac.type_id = at.id
      JOIN currencies c ON t.currency_id = c.id
      JOIN currencies fc ON fa.currency_id = fc.id
      JOIN users u ON fa.user_id = u.id
      JOIN currencies uc ON u.main_currency_id = uc.id
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
      AND (
        $4::text IS NULL OR $4 = ''
        OR lower(t.description) LIKE lower('%' || $4 || '%')
        OR lower(tc.name) LIKE lower('%' || $4 || '%')
        OR lower(fa.name) LIKE lower('%' || $4 || '%')
      )
    GROUP BY
      "transactionDate"
  ) AS groupedTransactions;
