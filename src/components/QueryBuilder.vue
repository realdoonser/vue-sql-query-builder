<script>
/* eslint-disable no-unused-vars */
import KeywordButton from "./KeywordButton.vue";
import { parseModelString, parser } from "../lib/util";
import { generateQueryComponent } from "../lib/queryHandlers";
import { constants } from "../config/constants";

export default {
  name: "QueryBuilder",
  components: {
    KeywordButton,
  },
  data() {
    // short names to reduce model length
    const {
      COL_REF: c,
      NUM: n,
      STR: s,
      BOOL: b,
    } = constants.QUERY_MODEL.DISPLAY_PLACEHOLDER;

    return {
      models: [
        `SELECT ${c}`,
        `SELECT ${c} FROM ${c}`,
        `SELECT ${c} FROM (SELECT ${c} FROM ${c})`,
        `SELECT ${c} FROM ${c} WHERE (NOT ${c})`,
        `SELECT ${c} FROM ${c} WHERE true`,
        `SELECT ${c} FROM ${c} WHERE ${c} = ${s}`,
        `SELECT ${c} FROM ${c} WHERE ${c} != ${b}`,
        `SELECT ${c} FROM ${c} WHERE ${c} = ${s} AND ${c} != ${s} OR ${c} = (NOT ${c})`,
        `SELECT ${c} FROM ${c} WHERE ${c} IN (${n})`,
        `SELECT ${c} FROM ${c} WHERE ${c} IN (SELECT ${c} FROM ${c})`,
        `SELECT ${c} FROM ${c} WHERE ${c} IN ((SELECT ${c} FROM ${c}), ${n})`,
        `SELECT ${c} FROM ${c} WHERE ${c} IN (SELECT ${c} FROM ${c} WHERE ${c} IN (SELECT ${c} FROM ${c} WHERE ${c} IN (SELECT ${c} FROM ${c} WHERE ${c} IN (SELECT ${c} FROM ${c} WHERE ${c} IN (${n})))))`,
        `SELECT ${c} FROM ${c} GROUP BY ${c}`,
        `SELECT ${c} FROM ${c} HAVING ${c} <> ${s}`,
        `SELECT ${c} FROM ${c} HAVING true`,
        `SELECT ${c} FROM ${c} ORDER BY ${c}`,
        ],
      queryObj: null,
      queryComponent: null,
      setNestedAST: null,
      error: null,
    };
  },
  methods: {
    onModelClick(model) {
      try {
        const newQueryObj = parser.astify(parseModelString(model));
        if (this.setNestedAST === null) {
          this.queryObj = newQueryObj;
        } else {
          this.setNestedAST(newQueryObj);
          // this.setNestedAST should have only deep updated queryObj, but we want to trigger
          // a recomputation of this.queryComponent, so we change the queryObj
          // reference to a new object with copied properties
          this.queryObj = Object.assign({}, this.queryObj);
          this.setNestedAST = null;
        }
        this.error = null;
      } catch (err) {
        this.error = {
          type: "parse-error",
          text: "There was a problem parsing model SQL.",
        };
        console.error(err);
      }
    },
  },
  watch: {
    queryObj() {
      this.queryComponent = generateQueryComponent(this.queryObj, this);
      console.log("recomputed queryComponent");
    },
  },
  render(h) {
    const keywordButtons = this.models.map((model) => (
      <KeywordButton
        key={model}
        keyword={model}
        click={() => {
          this.onModelClick(model);
        }}
      />
    ));

    const query = this.error
      ? this.error.text
      : this.queryComponent
      ? this.queryComponent(h)
      : "No Query. Please select a model from above.";

    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginBottom: "10px",
          }}
        >
          <button
            on-click={() => {
              console.log("queryObj", this.queryObj);
              console.log("setNestedAST", this.setNestedAST);
            }}
            style={{
              marginRight: "5px",
            }}
          >
            Print Data
          </button>
          <button
            on-click={() => {
              this.setNestedAST = null;
            }}
            style={{
              marginRight: "5px",
            }}
          >
            Clear Selected Input
          </button>
          <button
            on-click={() => {
              console.log(parser.sqlify(this.queryObj));
            }}
          >
            Print Query
          </button>
        </div>

        <div class="keyword-list">{keywordButtons}</div>
        <pre id="query">{query}</pre>
      </div>
    );
  },
};
</script>

<style scoped>
.keyword-list {
  display: flex;
  flex-direction: row;
}

#query {
  font-size: 20px;
}

p {
  margin: 0;
}

span,
input {
  margin-right: 10px;
}
</style>
