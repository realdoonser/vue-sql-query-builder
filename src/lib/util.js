/* eslint-disable no-unused-vars */
import { Parser } from "node-sql-parser";
import { constants } from "../config/constants";

export const parser = new Parser();

// note that bool must be parsed last, since its display placeholder '...' has no
// empty character after like the other value types do, so if its placeholders
// were to be replaced before the others, it would overwrite all other remaining
// placeholders and leave empty unicode character remnants over
const valueTypes = ["COL_REF", "NUM", "STR", "BOOL"];

const parseModelString = (str) => {
  return valueTypes.reduce(
    (returnStr, nextValueType) =>
      returnStr.replaceAll(
        constants.QUERY_MODEL.DISPLAY_PLACEHOLDER[nextValueType],
        constants.QUERY_MODEL.PARSE_PLACEHOLDER[nextValueType]
      ),
    str
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

const efn = () => {};

const generateInputChild = (
  { onChange = efn, onFocus = efn, onBlur = efn } = {
    onChange: efn,
    onBlur: efn,
    onFocus: efn,
  }
) => {
  return (h, key) => (
    <input
      key={key}
      on-change={onChange}
      on-focus={onFocus}
      on-blur={onBlur}
    ></input>
  );
};

const getOnFocus = (component, setNestedAST) => (e) => {
  component.setNestedAST = setNestedAST;
  console.log("did focus", e.target);
};

const getOnBlur = (component, setNestedAST) => (e) => {
  // blur on a timeout, otherwise clicking a model button after focusing an input
  // would cause the input to be blurred before the model button onClick fires,
  // which means that by the time the onClick fires to nest the model into the
  // current input, setNestedAST would already be null in the case with no timeout
  setTimeout(() => {
    if (component.setNestedAST === setNestedAST) {
      component.setNestedAST = null;
      console.log("did blur", e.target);
    } else {
      console.log(
        "tried to blur",
        e.target,
        "but something else already overwrote setNestedAST"
      );
    }
  }, 500);
};

const getOnFocusAndOnBlur = (component, setNestedAST) => {
  return {
    onFocus: getOnFocus(component, setNestedAST),
    onBlur: getOnBlur(component, setNestedAST),
  };
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

const parseSelectValue = (value) => {
  return parser.astify(`SELECT ${value}`);
};

const getASTValue = (value) => {
  return parseSelectValue(value).columns[0].expr;
};

const getASTArr = (value) => {
  return parseSelectValue(value).columns;
};

const getASTTable = (value) => {
  return parser.astify(`SELECT * FROM ${value}`).from;
};

const assignAST = (obj, ast) => {
  for (const prop in obj) {
    delete obj[prop];
  }
  Object.assign(obj, ast);
};

export {
  parseModelString,
  generateInputChild,
  generateSpanChild,
  isNested,
  getASTValue,
  getASTArr,
  getASTTable,
  assignAST,
  getOnFocus,
  getOnBlur,
  getOnFocusAndOnBlur,
};
