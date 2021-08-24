/* eslint-disable no-unused-vars */
import invariant from "invariant";
import { clauseHandlers } from "./clauseHandlers";
import { generateSpanChild, generateInputChild } from "./util";
import { constants } from "../config/constants";
import { getInputListOnChange } from "./handlerHelpers";

const { QUERY_TYPE, CLAUSE_TYPE, EXPR_TYPE } = constants;

const select = (queryObj, children, nest) => {
  const {
    select: { from: handleFromClause, where: handleWhereClause },
  } = clauseHandlers;

  const cols = queryObj.columns;

  invariant(cols !== undefined, "Columns don't exist on queryObj");
  invariant(Array.isArray(cols), "Columns is not an array");

  children.push(generateSpanChild("SELECT"));
  children.push(
    generateInputChild({
      onChange: getInputListOnChange(
        `select columns, nest ${nest}`,
        cols,
        () => {
          return {
            expr: {
              type: EXPR_TYPE.COLUMN_REF,
              table: null,
              column: null,
            },
            as: null,
          };
        },
        (list, i, value) => {
          list[i].expr.column = value;
        }
      ),
    })
  );

  const from = queryObj[CLAUSE_TYPE.FROM];
  if (from) {
    handleFromClause(from, children, nest);
  }

  const where = queryObj[CLAUSE_TYPE.WHERE];
  if (where) {
    handleWhereClause(where, children, nest);
  }
};

const queryHandlers = {
  select,
};

const generateQueryComponent = (queryObj, nest = 0) => {
  const { select } = queryHandlers;

  const children = [];
  switch (queryObj.type) {
    case QUERY_TYPE.SELECT:
      select(queryObj, children, nest);
      break;
    default:
      throw new Error(`unsupported queryObj type: ${queryObj.type}`);
  }

  const returnAST = false;

  return returnAST
    ? (h) => <pre>{JSON.stringify(queryObj, null, 4)}</pre>
    : (h) => (
        <p style={{ marginLeft: `${nest === 0 ? 0 : 20}px` }}>
          {children.map((child, index) => child(h, index))}
        </p>
      );
};

export { generateQueryComponent };
