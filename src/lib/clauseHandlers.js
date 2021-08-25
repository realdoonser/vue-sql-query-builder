/* eslint-disable no-unused-vars */
import invariant from "invariant";
import { generateQueryComponent } from "./queryHandlers";
import {
  isNested,
  generateSpanChild,
  generateInputChild,
  getASTValue,
  getASTTable,
  assignAST,
} from "./util";
import { constants } from "../config/constants";

const { EXPR_TYPE, SUPPORTED_OPERATORS, QUERY_TYPE } = constants;

const validValueTypes = [
  EXPR_TYPE.NUMBER,
  EXPR_TYPE.VALUE_STR,
  EXPR_TYPE.BOOL,
  EXPR_TYPE.UNARY_EXPR,
];

const select_from = (from, select, component, children, nest) => {
  children.push(generateSpanChild("FROM"));

  if (isNested(from)) {
    // nested
    const subqueryComponentArr = from
      .map((item) => {
        return item.expr?.ast
          ? generateQueryComponent(item.expr.ast, component, nest + 1)
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
        onChange: (e) => {
          assignAST(from, getASTTable(e.target.value));
          console.log(`select from, nest ${nest}`);
        },
        onFocus: () => {
          component.setAST = (newQueryObj) => {
            console.log(select);
            select.from = [
              {
                as: null,
                expr: {
                  ast: newQueryObj,
                },
              },
            ];
          };
        },
      })
    );
  }
};

const unary_op = (operator, value, component, children, nest) => {
  const isColumnRef = value.type === EXPR_TYPE.COLUMN_REF;
  const expressionIsValid =
    isColumnRef ||
    validValueTypes.some((validType) => value.type === validType);

  invariant(
    expressionIsValid,
    `Unsupported unary expression type ${value.type}`
  );

  children.push(generateSpanChild(operator));
  children.push(
    generateInputChild({
      onChange: (e) => {
        const astValue = getASTValue(e.target.value);

        if (
          astValue.type !== EXPR_TYPE.COLUMN_REF &&
          !validValueTypes.includes(astValue.type)
        ) {
          throw new Error(
            `Invalid type ${astValue.type} for value ${value} in 'unary op nest ${nest}'`
          );
        }
        value.expr = astValue;

        console.log(`unary op nest ${nest} updated`);
      },
    })
  );
};

const where_cmp = (operator, left, right, component, children, nest) => {
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

  let leftToAssign = left;
  if (left.type === EXPR_TYPE.UNARY_EXPR) {
    children.push(generateSpanChild(left.operator));
    leftToAssign = left.expr;
  }

  children.push(
    generateInputChild({
      onChange: (e) => {
        assignAST(leftToAssign, getASTValue(e.target.value));
        console.log(`where cmp ${operator} left ${nest} updated`);
      },
    })
  );

  children.push(generateSpanChild(operator));

  let rightToAssign = right;
  if (right.type === EXPR_TYPE.UNARY_EXPR) {
    children.push(generateSpanChild(right.operator));
    rightToAssign = right.expr;
  }

  children.push(
    generateInputChild({
      onChange: (e) => {
        assignAST(rightToAssign, getASTValue(e.target.value));
        console.log(`where cmp ${operator} right ${nest} updated`);
      },
    })
  );
};

const where_log = (operator, left, right, component, children, nest) => {
  const expressionIsValid =
    left.type === EXPR_TYPE.BINARY_EXPR && right.type === EXPR_TYPE.BINARY_EXPR;

  invariant(
    expressionIsValid,
    `Unsupported logical operator ${operator} type pair: ${left.type} ${operator} ${right.type}`
  );

  select_where(left, children, nest, false);
  children.push(generateSpanChild(operator));
  select_where(right, children, nest, false);
};

const where_in = (operator, left, right, component, children, nest) => {
  const expressionIsValid =
    left.type === EXPR_TYPE.COLUMN_REF && right.type === EXPR_TYPE.EXPR_LIST;

  invariant(
    expressionIsValid,
    `Unsupported WHERE binary expression 'IN' type pair: Left = ${left.type}, Right = ${right.type}`
  );

  children.push(
    generateInputChild({
      onChange: (e) => {
        assignAST(left, getASTValue(e.target.value));
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
              ? generateQueryComponent(item, component, nest + 1)
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
              const astValue = getASTValue(e.target.value);

              if (!validValueTypes.includes(astValue.type)) {
                throw new Error(
                  `Invalid type ${astValue.type} for value ${e.target.value} in 'where in right, nest ${nest}'`
                );
              }

              right.value[index] = astValue;

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
        onChange: (e) => {
          assignAST(right, getASTValue(e.target.value));
          console.log(`where in right, nest ${nest} updated`);
        },
      })
    );
  }
};

const clause_value = (value, component, children, nest) => {
  children.push(
    generateInputChild({
      onChange: (e) => {
        assignAST(value, getASTValue(e.target.value));
        console.log(`clause value nest ${nest} updated`);
      },
    })
  );
};

const cmpOperators = {
  "=": true,
  "!=": true,
  "<>": true,
  ">": true,
  "<": true,
  "<=": true,
  ">=": true,
};
const logicalOperators = { AND: true, OR: true, NOT: true };

const select_where = (where, component, children, nest, pushWhere = true) => {
  if (pushWhere) {
    children.push(generateSpanChild("WHERE"));
  }

  const { type } = where;

  invariant(
    type === EXPR_TYPE.BINARY_EXPR || validValueTypes.includes(type),
    `Unsupported WHERE expression type: ${type}`
  );

  if (type !== EXPR_TYPE.BINARY_EXPR && type !== EXPR_TYPE.UNARY_EXPR) {
    clause_value(where, component, children, nest);
  } else {
    // certainly an expression with an operator

    // ensure alphabetic operators are always upper-case by convention
    where.operator = where.operator.toUpperCase();

    const { operator } = where;

    invariant(
      SUPPORTED_OPERATORS.SELECT.WHERE.some(
        (supportedOp) => supportedOp === operator
      ),
      `Unsupported WHERE expression operator: ${operator}`
    );

    if (type === EXPR_TYPE.BINARY_EXPR) {
      const { left, right } = where;
      if (cmpOperators[operator]) {
        where_cmp(operator, left, right, component, children, nest);
      } else if (logicalOperators[operator]) {
        where_log(operator, left, right, component, children, nest);
      } else if (operator === "IN") {
        where_in(operator, left, right, component, children, nest);
      } else {
        console.error(`unhandled operator for SELECT ... WHERE: ${operator}`);
      }
    } else if (type === EXPR_TYPE.UNARY_EXPR) {
      // NOT is the only unary operator in SUPPORTED_OPERATORS, so operator === 'NOT' is surely true
      unary_op(operator, where, component, children, nest);
    }
  }
};

const clauseHandlers = {
  select: {
    from: select_from,
    where: select_where,
  },
};

export { clauseHandlers };
