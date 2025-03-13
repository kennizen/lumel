import { Data, Row, RowChildState, RowState } from "../App";

function helper(rowChildState: RowChildState, parentId: string, children: Row["children"]) {
  const res: string[] = [];

  for (const child of children) {
    res.push(child.id);
    rowChildState[child.id] = {
      id: child.id,
      label: child.label,
      value: child.value,
      parentId: parentId,
      variance: 0,
      inputVal: "",
    };
  }

  return res;
}

export function handleTransformRawData(data: Data) {
  const rowState: RowState = {};
  const rowChildState: RowChildState = {};

  for (const row of data.rows) {
    rowState[row.id] = {
      id: row.id,
      label: row.label,
      value: row.value,
      variance: 0,
      inputVal: "",
      children: helper(rowChildState, row.id, row.children),
    };
  }

  return { rowState, rowChildState };
}

export function getIncreasedPercentageValue(originalVal: number, percentage: number) {
  return originalVal + originalVal * (percentage / 100);
}

export function getVariance(originalVal: number, newVal: number) {
  return ((newVal - originalVal) / originalVal) * 100;
}
