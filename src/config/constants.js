const constants = {
  QUERY_MODEL_PARSE_PLACEHOLDER: "__PLACEHOLDER",
  QUERY_MODEL_DISPLAY_PLACEHOLDER: "...",

  EXPR_TYPE: {
    BINARY_EXPR: "binary_expr",
    COLUMN_REF: "column_ref",
    EXPR_LIST: "expr_list",
    NUMBER: "number",
    VALUE_STR: "single_quote_string",
    IDENT_STR: "string",
  },

  CLAUSE_TYPE: {
    FROM: "from",
    WHERE: "where",
  },

  QUERY_TYPE: {
    SELECT: "select",
  },

  SUPPORTED_OPERATORS: {
    SELECT: {
      WHERE: ["IN", "="],
    },
  },
};

export { constants };
