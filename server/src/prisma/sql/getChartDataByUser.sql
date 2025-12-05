WITH
  date_series AS (
    SELECT
      generate_series(
        $1::date,
        $2::date - interval '1 day',
        $3::interval
      )::date AS date
    UNION
    SELECT
      $2::date AS date
  ),
  all_dates AS (
    SELECT
      generate_series($1::date, $2::date, '1 day'::interval)::date AS date
  ),
  aggregated_data AS (
    SELECT
      ad.date,
      COALESCE(
        SUM(
          CASE
            WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate / ca.rate * cu.rate
            ELSE CASE
              WHEN t.currency_id = u.main_currency_id THEN t.amount
              ELSE t.amount / ca.rate * cu.rate
            END
          END
        ),
        0
      ) AS totalAmount,
      COALESCE(
        SUM(
          CASE
            WHEN tt."name" = 'Income' THEN CASE
              WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate / ca.rate * cu.rate
              ELSE CASE
                WHEN t.currency_id = u.main_currency_id THEN t.amount
                ELSE t.amount / ca.rate * cu.rate
              END
            END
            ELSE 0
          END
        ),
        0
      ) AS totalIncome,
      COALESCE(
        SUM(
          CASE
            WHEN tt.name = 'Expense' THEN CASE
              WHEN t.currency_id != fa.currency_id THEN ABS(t.amount / t.rate / ca.rate * cu.rate)
              ELSE CASE
                WHEN t.currency_id = u.main_currency_id THEN ABS(t.amount)
                ELSE ABS(t.amount / ca.rate * cu.rate)
              END
            END
            ELSE 0
          END
        ),
        0
      ) AS totalExpenses,
      COALESCE(
        SUM(
          CASE
            WHEN at."name" = 'Asset' THEN CASE
              WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate / ca.rate * cu.rate
              ELSE CASE
                WHEN t.currency_id = u.main_currency_id THEN t.amount
                ELSE t.amount / ca.rate * cu.rate
              END
            END
            ELSE 0
          END
        ),
        0
      ) AS totalAssetsTransactions,
      COALESCE(
        SUM(
          CASE
            WHEN at."name" = 'Liability' THEN CASE
              WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate / ca.rate * cu.rate
              ELSE CASE
                WHEN t.currency_id = u.main_currency_id THEN t.amount
                ELSE t.amount / ca.rate * cu.rate
              END
            END
            ELSE 0
          END
        ),
        0
      ) AS totalLiabilitiesTransactions
    FROM
      all_dates ad
      LEFT JOIN "transactions" t ON ad.date = t.date
      LEFT JOIN "transaction_categories" tc ON t."category_id" = tc."id"
      LEFT JOIN "transaction_types" tt ON tc."type_id" = tt."id"
      LEFT JOIN "financial_accounts" fa ON t."account_id" = fa."id"
      AND (
        fa.user_id = $4
        OR EXISTS (
          SELECT
            1
          FROM
            account_invites
          WHERE
            account_id = fa.id
            AND user_id = $4
            AND status = 'ACCEPTED'
        )
      )
      LEFT JOIN "account_categories" ac ON fa."category_id" = ac."id"
      LEFT JOIN "account_types" at ON ac."type_id" = at."id"
      LEFT JOIN "users" u ON fa."user_id" = u."id"
      LEFT JOIN "currencies" ca ON fa."currency_id" = ca."id"
      LEFT JOIN "currencies" cu ON u."main_currency_id" = cu."id"
    GROUP BY
      ad.date
    ORDER BY
      ad.date
  ),
  cumulative_data AS (
    SELECT
      ag.date,
      SUM(ag.totalAmount) OVER (
        ORDER BY
          ag.date
      ) + $5 + $6 AS "cumulativeAmount",
      SUM(ag.totalIncome) OVER (
        ORDER BY
          ag.date
      ) AS "cumulativeIncome",
      SUM(ag.totalExpenses) OVER (
        ORDER BY
          ag.date
      ) AS "cumulativeExpenses",
      SUM(ag.totalAssetsTransactions) OVER (
        ORDER BY
          ag.date
      ) + $5 AS "cumulativeAssetsTransactions",
      SUM(ag.totalLiabilitiesTransactions) OVER (
        ORDER BY
          ag.date
      ) + $6 AS "cumulativeLiabilitiesTransactions"
    FROM
      aggregated_data ag
  )
SELECT
  cd.date,
  cd."cumulativeAmount",
  cd."cumulativeIncome",
  cd."cumulativeExpenses",
  cd."cumulativeAssetsTransactions",
  cd."cumulativeLiabilitiesTransactions"
FROM
  cumulative_data cd
  JOIN date_series ds ON cd.date = ds.date
ORDER BY
  cd.date;
