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
            WHEN t.account_id = $4 THEN CASE
              WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate
              ELSE t.amount
            END
            ELSE 0
          END
        ),
        0
      ) AS totalAmount,
      COALESCE(
        SUM(
          CASE
            WHEN t.account_id = $4
            AND tt."name" = 'Income' THEN CASE
              WHEN t.currency_id != fa.currency_id THEN t.amount / t.rate
              ELSE t.amount
            END
            ELSE 0
          END
        ),
        0
      ) AS totalIncome,
      COALESCE(
        SUM(
          CASE
            WHEN t.account_id = $4
            AND tt."name" = 'Expense' THEN CASE
              WHEN t.currency_id != fa.currency_id THEN ABS(t.amount / t.rate)
              ELSE ABS(t.amount)
            END
            ELSE 0
          END
        ),
        0
      ) AS totalExpenses
    FROM
      all_dates ad
      LEFT JOIN "transactions" t ON ad.date = t.date
      LEFT JOIN "transaction_categories" tc ON t."category_id" = tc."id"
      LEFT JOIN "transaction_types" tt ON tc."type_id" = tt."id"
      LEFT JOIN "financial_accounts" fa ON t."account_id" = fa."id"
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
      date,
      SUM(totalAmount) OVER (
        ORDER BY
          date
      ) + $5 AS "cumulativeAmount",
      SUM(totalIncome) OVER (
        ORDER BY
          date
      ) AS "cumulativeIncome",
      SUM(totalExpenses) OVER (
        ORDER BY
          date
      ) AS "cumulativeExpenses"
    FROM
      aggregated_data
  )
SELECT
  cd.date,
  cd."cumulativeAmount",
  cd."cumulativeIncome",
  cd."cumulativeExpenses"
FROM
  cumulative_data cd
  JOIN date_series ds ON cd.date = ds.date
ORDER BY
  cd.date;
