import { ChangeEvent, Fragment, useEffect, useState } from "react";
import { getIncreasedPercentageValue, getVariance, handleTransformRawData } from "./utils/helper";
import data from "./data/data.json";

export type Child = {
  id: string;
  label: string;
  value: number;
};

export type Row = {
  id: string;
  label: string;
  value: number;
  children: Child[];
};

export type Data = {
  rows: Row[];
};

export type RowState = Record<
  string,
  {
    id: string;
    label: string;
    value: number;
    variance: number;
    inputVal: string;
    children: string[];
  }
>;

export type RowChildState = Record<
  string,
  {
    id: string;
    label: string;
    value: number;
    variance: number;
    inputVal: string;
    parentId: string;
  }
>;

const tableHeaders = ["Label", "Value", "Input", "Allocation %", "Allocation Val", "Variance %"];

function App() {
  // states
  const [rowState, setRowState] = useState<RowState | null>(null);
  const [rowChildState, setRowChildState] = useState<RowChildState | null>(null);

  // method

  function handleUpdateParentRowInput(e: ChangeEvent<HTMLInputElement>, id: string) {
    setRowState((prev) => (prev ? { ...prev, [id]: { ...prev[id], inputVal: e.target.value } } : prev));
  }

  function handleUpdateChildInput(e: ChangeEvent<HTMLInputElement>, id: string) {
    setRowChildState((prev) => (prev ? { ...prev, [id]: { ...prev[id], inputVal: e.target.value } } : prev));
  }

  function handleUpdateChild(childId: string, type: "percentage" | "value") {
    let newVal = 0;

    if (type === "percentage") {
      newVal = getIncreasedPercentageValue(
        Number(rowChildState![childId].value),
        Number(rowChildState![childId].inputVal)
      );
      const variance = getVariance(Number(rowChildState![childId].value), newVal);
      setRowChildState((prev) => ({ ...prev!, [childId]: { ...prev![childId], value: newVal, variance: variance } }));
    } else if (type === "value") {
      newVal = Number(rowChildState![childId].inputVal);
      const variance = getVariance(Number(rowChildState![childId].value), newVal);
      setRowChildState((prev) => ({ ...prev!, [childId]: { ...prev![childId], value: newVal, variance: variance } }));
    }

    const parentId = rowChildState![childId].parentId;
    const filteredChildrens = rowState![parentId].children.filter((child) => child !== childId);
    let sumVal = newVal;
    filteredChildrens.forEach((child) => {
      sumVal += rowChildState![child].value;
    });
    const parentVariance = getVariance(Number(rowState![parentId].value), sumVal);
    setRowState((prev) => ({
      ...prev!,
      [parentId]: { ...prev![parentId], value: sumVal, variance: parentVariance },
    }));
  }

  function handleUpdateParent(parentId: string, type: "percentage" | "value") {
    let newVal = 0;

    if (type === "percentage") {
      newVal = getIncreasedPercentageValue(Number(rowState![parentId].value), Number(rowState![parentId].inputVal));
      const variance = getVariance(Number(rowState![parentId].value), newVal);
      setRowState((prev) => ({
        ...prev!,
        [parentId]: { ...prev![parentId], value: newVal, variance: variance },
      }));
    } else if (type === "value") {
      newVal = Number(rowState![parentId].inputVal);
      const variance = getVariance(Number(rowState![parentId].value), newVal);
      setRowState((prev) => ({
        ...prev!,
        [parentId]: { ...prev![parentId], value: newVal, variance: variance },
      }));
    }

    const res: RowChildState = rowChildState!;

    rowState![parentId].children.forEach((child) => {
      const contribution = (rowChildState![child].value / rowState![parentId].value) * 100;
      const nv = newVal * (contribution / 100);
      res[child].variance = getVariance(rowChildState![child].value, newVal);
      res[child].value = nv;
    });

    setRowChildState(res);
  }

  // effects
  useEffect(() => {
    const { rowChildState, rowState } = handleTransformRawData(data);
    setRowState(rowState);
    setRowChildState(rowChildState);
  }, []);

  return (
    <div className="w-full h-screen overflow-auto p-4">
      {rowState && rowChildState ? (
        <table className="bg-slate-200 w-full border-collapse border">
          <thead>
            <tr className="text-left border-b">
              {tableHeaders.map((header, i) => (
                <th className="p-2" key={header + i}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(rowState).map((row, i) => (
              <Fragment key={row.id + i}>
                <tr>
                  <td className="p-2">{row.label}</td>
                  <td className="p-2">{Math.round(row.value)}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border"
                      value={rowState[row.id].inputVal}
                      onChange={(e) => handleUpdateParentRowInput(e, row.id)}
                    />
                  </td>
                  <td className="p-2">
                    <button
                      className="border p-1 cursor-pointer"
                      onClick={() => handleUpdateParent(row.id, "percentage")}
                    >
                      allocate %
                    </button>
                  </td>
                  <td className="p-2">
                    <button className="border p-1 cursor-pointer" onClick={() => handleUpdateParent(row.id, "value")}>
                      allocate val
                    </button>
                  </td>
                  <td className="p-2">{Math.round(rowState[row.id].variance)}%</td>
                </tr>
                {row.children.map((child, j) => (
                  <tr key={child + j}>
                    <td className="p-2">--{rowChildState[child].label}</td>
                    <td className="p-2">{Math.round(rowChildState[child].value)}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="border"
                        value={rowChildState[child].inputVal}
                        onChange={(e) => handleUpdateChildInput(e, child)}
                      />
                    </td>
                    <td className="p-2">
                      <button
                        className="border p-1 cursor-pointer"
                        onClick={() => handleUpdateChild(child, "percentage")}
                      >
                        allocate %
                      </button>
                    </td>
                    <td className="p-2">
                      <button className="border p-1 cursor-pointer" onClick={() => handleUpdateChild(child, "value")}>
                        allocate val
                      </button>
                    </td>
                    <td className="p-2">{Math.round(rowChildState[child].variance)}%</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
