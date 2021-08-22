<template>
  <button class="keyword-btn" v-on:click="click">{{ keyword }}</button>
</template>

<script>
export default {
  name: "KeywordButton",
  props: {
    keyword: String,
    click: Function,
  },
};
</script>

<style scoped>
.keyword-btn {
  margin: 0 5px;
}
</style>
