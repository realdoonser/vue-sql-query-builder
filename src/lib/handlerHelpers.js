import invariant from "invariant";

const getInputListOnChange = (name, list, constructItem, onSetItem) => (e) => {
  const newValue = e.target.value;

  // remove spaces potentially before or after commas
  const values = newValue.split(",").map((item) => item.trim());

  const lengthDifference = list.length - values.length;
  if (lengthDifference > 0) {
    // there are less items now, list has too many
    let dif = lengthDifference;
    while (dif-- > 0) list.pop();
  } else if (lengthDifference < 0) {
    // there are more items now, list doesn't have enough
    let dif = -lengthDifference; // lengthDifference is negative
    while (dif-- > 0) list.push(constructItem());
  }

  invariant(
    values.length === list.length,
    "values.length and list.length are different"
  );

  for (let i = 0; i < list.length; ++i) {
    onSetItem(list, i, values[i]);
  }

  if (newValue === "") {
    while (list.length > 0) list.pop();
  }

  console.log(`list '${name}' updated:`, list);
};

const coerceValueToType = (value, location) => {
  let foundType = false;

  value = value.toLowerCase();

  if (value[0] !== "'" || value[value.length - 1] !== "'") {
    if (!isNaN(Number.parseInt(value))) {
      value = Number.parseInt(value);
      foundType = true;
    } else if (value === "true" || value === "false") {
      value = value === "true" ? true : false;
      foundType = true;
    }
  } else {
    // string type case
    value = value.substring(1, value.length - 1);
    foundType = true;
  }

  if (!foundType) {
    throw new Error(`${location} could not parse value: ${value}`);
  }

  return value;
};

export { getInputListOnChange, coerceValueToType };
