SELECT
  tc.id AS "id",
  tc.name AS "name",
  tc.type_id AS "typeId",
  tc.user_id AS "userId",
  tc.icon AS "icon",
  tc.color AS "color",
  tc.icon_color AS "iconColor",
  SUM(
    CASE
      WHEN t."currency_id" != fa."currency_id" THEN CASE
        WHEN fa."currency_id" = u."main_currency_id" THEN ABS(t."amount" / t."rate")
        ELSE ABS(t."amount" / t."rate" / ca."rate" * cu."rate")
      END
      ELSE CASE
        WHEN fa."currency_id" = u."main_currency_id" THEN ABS(t."amount")
        ELSE ABS(t."amount" / ca."rate" * cu."rate")
      END
    END
  ) AS "totalAmount",
  jsonb_build_object('transactions', COUNT(t.id)::integer) AS "_count",
  jsonb_build_object('id', uc.id, 'name', uc.name) AS "user"
FROM
  transactions AS t
  JOIN transaction_categories AS tc ON t.category_id = tc.id
  JOIN transaction_types AS tt ON tc.type_id = tt.id
  JOIN financial_accounts AS fa ON t.account_id = fa.id
  JOIN users u ON fa.user_id = u.id
  JOIN users uc ON tc.user_id = uc.id
  JOIN currencies ca ON fa."currency_id" = ca."id"
  JOIN currencies cu ON u."main_currency_id" = cu."id"
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
  AND tt.name = $2
  AND t.date >= $3::date
  AND t.date <= $4::date
GROUP BY
  tc.id,
  tc.name,
  tc.type_id,
  tc.user_id,
  tc.icon,
  tc.color,
  tc.icon_color,
  uc.id;
