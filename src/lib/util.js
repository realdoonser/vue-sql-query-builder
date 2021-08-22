/* eslint-disable no-unused-vars */
import { Parser } from "node-sql-parser";
import { constants } from "../config/constants";

export const parser = new Parser();

const parseModelString = (str) => {
  return str
    .replaceAll(
      constants.QUERY_MODEL_DISPLAY_PLACEHOLDER,
      constants.QUERY_MODEL_PARSE_PLACEHOLDER
    )
    .replaceAll(
      constants.QUERY_MODEL_DISPLAY_PLACEHOLDER_NUM,
      constants.QUERY_MODEL_PARSE_PLACEHOLDER_NUM
    )
    .replaceAll(
      constants.QUERY_MODEL_DISPLAY_PLACEHOLDER_STR,
      constants.QUERY_MODEL_PARSE_PLACEHOLDER_STR
    )
    .replaceAll(
      constants.QUERY_MODEL_DISPLAY_PLACEHOLDER_BOOL,
      constants.QUERY_MODEL_PARSE_PLACEHOLDER_BOOL
    );
};

const generateSpanChild = (text, style, newlineBefore, newlineAfter) => {
  return (h, key) => (
    <span key={key} style={style}>
      {newlineBefore && <br />}
      {text}
      {newlineAfter && <br />}
    </span>
  );
};

const generateInputChild = ({ onChange } = { onChange: () => {} }) => {
  return (h, key) => <input key={key} on-change={onChange}></input>;
};

const isNested = (arr) => {
  if (typeof arr !== "object") {
    throw new Error(`Non-object parameter passed to isNested: ${arr}`);
  }

  if (!Array.isArray(arr)) {
    arr = [arr];
  }

  return arr.some(
    (item) =>
      item.type === constants.QUERY_TYPE.SELECT || (item.expr && item.expr.ast)
  );
};

export { parseModelString, generateInputChild, generateSpanChild, isNested };
