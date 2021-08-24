const constants = {
  QUERY_MODEL: {
    DISPLAY_PLACEHOLDER: {
      COL_REF: "...\u0000",
      NUM: "...\uFEFF",
      STR: "...\u2028",
      BOOL: "...",
    },
    PARSE_PLACEHOLDER: {
      COL_REF: "col",
      NUM: "0",
      STR: "'a'",
      BOOL: "true",
    },
  },

  EXPR_TYPE: {
    BINARY_EXPR: "binary_expr",
    UNARY_EXPR: "unary_expr",
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
      WHERE: ["IN", "=", "!=", "<>", ">", "<", "<=", ">=", "AND", "OR", "NOT"],
    },
  },
};

export { constants };
