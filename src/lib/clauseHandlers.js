/* eslint-disable no-unused-vars */
import invariant from "invariant";
import { generateQueryComponent } from "./queryHandlers";
import { isNested, generateSpanChild, generateInputChild } from "./util";
import { constants } from "../config/constants";
import { getInputListOnChange, coerceValueToType } from "./handlerHelpers";

const { EXPR_TYPE, SUPPORTED_OPERATORS, QUERY_TYPE } = constants;

const validValueTypes = [EXPR_TYPE.NUMBER, EXPR_TYPE.VALUE_STR, EXPR_TYPE.BOOL];

const select_from = (from, children, nest) => {
  children.push(generateSpanChild("FROM"));

  if (isNested(from)) {
    // nested
    const subqueryComponentArr = from
      .map((item) => {
        return item.expr?.ast
          ? generateQueryComponent(item.expr.ast, nest + 1)
          : undefined;
      })
      .filter((item) => item !== undefined);

    children.push(generateSpanChild("("));
    // note that generateQueryComponent always returns a block-level <p>,
    // so every element inside subqueryComponentArr will start on its own line
    children.push(...subqueryComponentArr);
    children.push(generateSpanChild(")"));
  } else {
    // not nested
    children.push(
      generateInputChild({
        onChange: getInputListOnChange(
          `select from, nest ${nest}`,
          from,
          () => {
            return {
              db: null,
              table: null,
              as: null,
            };
          },
          (list, i, value) => {
            list[i].table = value;
          }
        ),
      })
    );
  }
};

const where_cmp = (operator, left, right, children, nest) => {
  const leftIsColumn = left.type === EXPR_TYPE.COLUMN_REF;
  const rightIsColumn = right.type === EXPR_TYPE.COLUMN_REF;

  const expressionIsValid =
    (leftIsColumn || rightIsColumn) &&
    validValueTypes.some(
      (validType) => left.type === validType || right.type === validType
    );

  invariant(
    expressionIsValid,
    `Unsupported WHERE binary expression '${operator}' type pair: Left = ${left.type}, Right = ${right.type}`
  );

  const leftProperty = leftIsColumn ? "column" : "value";
  children.push(
    generateInputChild({
      onChange: (e) => {
        left[leftProperty] = e.target.value;
        console.log(`where cmp ${operator} left ${nest} updated`);
      },
    })
  );

  children.push(generateSpanChild(operator));

  const rightProperty = rightIsColumn ? "column" : "value";
  children.push(
    generateInputChild({
      onChange: (e) => {
        right[rightProperty] = e.target.value;
        console.log(`where cmp ${operator} right ${nest} updated`);
      },
    })
  );
};

const where_in = (operator, left, right, children, nest) => {
  const expressionIsValid =
    left.type === EXPR_TYPE.COLUMN_REF && right.type === EXPR_TYPE.EXPR_LIST;

  invariant(
    expressionIsValid,
    `Unsupported WHERE binary expression 'IN' type pair: Left = ${left.type}, Right = ${right.type}`
  );

  children.push(
    generateInputChild({
      onChange: (e) => {
        left.column = e.target.value;
        console.log(`where in left ${nest} updated`);
      },
    })
  );
  children.push(generateSpanChild(operator));

  // isNested uses a .some() on the right.value expression list array
  // this line really means "if at least one expression in the "in" is nested"
  if (isNested(right.value)) {
    let hasOuterParen = false;
    if (Array.isArray(right.value) && right.value.length > 1) {
      children.push(generateSpanChild("(", { marginRight: "0px" }));
      hasOuterParen = true;
    }

    right.value.forEach((item, index) => {
      if (isNested(item)) {
        const subqueryComponentArr = right.value
          .map((item) => {
            if (!item) return undefined;

            return item.type === QUERY_TYPE.SELECT
              ? generateQueryComponent(item, nest + 1)
              : undefined;
          })
          .filter((item) => item !== undefined);

        children.push(generateSpanChild("("));
        children.push(...subqueryComponentArr);
        children.push(generateSpanChild(")", { marginRight: "0px" }));
        children.push(generateSpanChild(", ", { marginRight: "0px" }));
      } else {
        invariant(
          validValueTypes.includes(item.type),
          `Unsupported right value type for WHERE .. IN (..) call: ${item.type}`
        );

        children.push(
          generateInputChild({
            onChange: (e) => {
              const value = coerceValueToType(
                e.target.value,
                `where in right nest ${nest} index ${index}`
              );

              right.value[index] = {
                type: null,
                value: null,
              };

              switch (typeof value) {
                case "string":
                  right.value[index].type = EXPR_TYPE.VALUE_STR;
                  break;
                case "number":
                  right.value[index].type = EXPR_TYPE.NUMBER;
                  break;
                case "boolean":
                  right.value[index].type = EXPR_TYPE.BOOL;
                  break;
                default:
                  throw new Error(
                    `invalid type for value in 'where in right, nest ${nest}': ${typeof value}`
                  );
              }
              right.value[index].value = value;

              console.log(`where in right nest ${nest} index ${index} updated`);
            },
          })
        );
        children.push(generateSpanChild(", ", { marginRight: "0px" }));
      }
    });

    // remove trailing comma and space
    children.pop();

    if (hasOuterParen) {
      children.push(generateSpanChild(")"));
    }
  } else {
    invariant(
      right.value.every((expr) => validValueTypes.includes(expr.type)),
      'Expression list for "in" operator contains one or more values that are not strings, numbers, or booleans'
    );
    children.push(
      generateInputChild({
        onChange: getInputListOnChange(
          `where in right, nest ${nest}`,
          right.value,
          () => {
            return {
              type: undefined,
              value: undefined,
            };
          },
          (list, i, value) => {
            if (value === "") {
              return;
            }

            value = coerceValueToType(value, `where in right, nest ${nest}`);

            switch (typeof value) {
              case "string":
                list[i].type = EXPR_TYPE.VALUE_STR;
                break;
              case "number":
                list[i].type = EXPR_TYPE.NUMBER;
                break;
              case "boolean":
                list[i].type = EXPR_TYPE.BOOL;
                break;
              default:
                throw new Error(
                  `invalid type for value in 'where in right, nest ${nest}': ${typeof value}`
                );
            }
            list[i].value = value;
          }
        ),
      })
    );
  }
};

const cmpOperators = ["=", "!=", "<>", ">", "<", "<=", ">="];

const select_where = (where, children, nest) => {
  children.push(generateSpanChild("WHERE"));

  const { operator, type, left, right } = where;

  invariant(
    type === EXPR_TYPE.BINARY_EXPR,
    `Unsupported WHERE expression type: ${type}`
  );
  invariant(
    SUPPORTED_OPERATORS.SELECT.WHERE.some(
      (supportedOp) => supportedOp === operator
    ),
    `Unsupported WHERE expression operator: ${operator}`
  );

  if (cmpOperators.includes(operator)) {
    where_cmp(operator, left, right, children, nest);
  } else if (operator === "IN") {
    where_in(operator, left, right, children, nest);
  }
};

const clauseHandlers = {
  select: {
    from: select_from,
    where: select_where,
  },
};

export { clauseHandlers };
