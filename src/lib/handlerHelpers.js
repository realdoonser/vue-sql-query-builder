const getInputListOnChange = (name, list, defaultItem, onSetItem) => (e) => {
  const newValue = e.target.value;

  // remove spaces potentially before or after commas
  const colNames = newValue.split(",").map((col) => col.trim());

  const lengthDifference = list.length - colNames.length;
  if (lengthDifference > 0) {
    // there are less columns now, list has too many
    let dif = lengthDifference;
    while (dif-- > 0) list.pop();
  } else if (lengthDifference < 0) {
    // there are more columns now, list doesn't have enough
    let dif = -lengthDifference; // lengthDifference is negative
    while (dif-- > 0) list.push(defaultItem);
  }

  for (let i = 0; i < list.length; ++i) {
    onSetItem(list, i, colNames[i]);
  }

  if (newValue === "") {
    while (list.length > 0) list.pop();
  }

  console.log(`list '${name}' updated:`, list);
};

export { getInputListOnChange };
