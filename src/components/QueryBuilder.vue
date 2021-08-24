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
    const p = constants.QUERY_MODEL_DISPLAY_PLACEHOLDER;
    const pn = constants.QUERY_MODEL_DISPLAY_PLACEHOLDER_NUM;
    const ps = constants.QUERY_MODEL_DISPLAY_PLACEHOLDER_STR;
    const pb = constants.QUERY_MODEL_DISPLAY_PLACEHOLDER_BOOL;

    return {
      models: [
        `SELECT ${p}`,
        `SELECT ${p} FROM ${p}`,
        `SELECT ${p} FROM (SELECT ${p} FROM ${p})`,
        `SELECT ${p} FROM ${p} WHERE ${p} = ${ps}`,
        `SELECT ${p} FROM ${p} WHERE ${p} != ${pb}`,
        `SELECT ${p} FROM ${p} WHERE ${p} IN (${pn})`,
        `SELECT ${p} FROM ${p} WHERE ${p} IN (SELECT ${p} FROM ${p})`,
        `SELECT ${p} FROM ${p} WHERE ${p} IN ((SELECT ${p} FROM ${p}), ${pn})`,
        `SELECT ${p} FROM ${p} WHERE ${p} IN (SELECT ${p} FROM ${p} WHERE ${p} IN (SELECT ${p} FROM ${p} WHERE ${p} IN (SELECT ${p} FROM ${p} WHERE ${p} IN (SELECT ${p} FROM ${p} WHERE ${p} IN (${pn})))))`,
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
      }
    },
  },
  watch: {
    queryObj() {
      console.log("fired");
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
