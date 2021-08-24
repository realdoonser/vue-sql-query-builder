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
      ],
      queryObj: null,
      queryComponent: null,
      error: null,
    };
  },
  methods: {
    onModelClick(model) {
      try {
        this.queryObj = parser.astify(parseModelString(model));
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
      this.queryComponent = generateQueryComponent(this.queryObj);
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
        <button
          on-click={() => {
            console.log(this.queryObj);
          }}
          style={{
            marginBottom: "10px",
          }}
        >
          Print Data
        </button>
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
