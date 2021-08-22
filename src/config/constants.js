const constants = {
  QUERY_MODEL_DISPLAY_PLACEHOLDER: "...\u0000",
  QUERY_MODEL_PARSE_PLACEHOLDER: "__PLACEHOLDER",

  QUERY_MODEL_DISPLAY_PLACEHOLDER_NUM: "...\uFEFF",
  QUERY_MODEL_PARSE_PLACEHOLDER_NUM: "0",

  QUERY_MODEL_DISPLAY_PLACEHOLDER_STR: "...\u2028",
  QUERY_MODEL_PARSE_PLACEHOLDER_STR: "'a'",

  QUERY_MODEL_DISPLAY_PLACEHOLDER_BOOL: "...",
  QUERY_MODEL_PARSE_PLACEHOLDER_BOOL: "true",

  EXPR_TYPE: {
    BINARY_EXPR: "binary_expr",
    COLUMN_REF: "column_ref",
    EXPR_LIST: "expr_list",
    NUMBER: "number",
    BOOL: "bool",
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
      WHERE: ["IN", "=", "!=", "<>", ">", "<", "<=", ">="],
    },
  },
};

export { constants };
