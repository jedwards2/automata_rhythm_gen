import "./App.css";
import { useRef, useState, useEffect } from "react";
import { createDevice } from "@rnbo/js";
import MusicBlock from "./components/MusicBlock";

const App = () => {
  //gridHeight can be max 8 due to RNBO patch
  const gridHeight = 8;
  const gridWidth = 16;
  //USE STATES-------------------------------------------------------------------------------------------
  //count determines currentSelected column
  const [count, setCount] = useState(0);
  //running refers to the count being updated as the audio context and interval run from page load
  const [running, setRunning] = useState(false);
  //state for setting automata rule
  const [currentRule, setCurrentRule] = useState(30);
  //state for entire grid -- includes dummy info for initialization
  const [gridState, setGridState] = useState([[false]]);
  //state for currently selected column on grid
  const [currentSelected, setCurrentSelected] = useState([
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  //set inital state of form
  const [formState, setFormState] = useState(0);

  //USE REFS -------------------------------------------------------------------------------------------
  let context = useRef(new AudioContext());
  //param is used for the testing drone
  let param = useRef({ value: 0 });
  //params actually used in the rhythm
  let audioParams = useRef([
    { value: 0 },
    { value: 0 },
    { value: 0 },
    { value: 0 },
    { value: 0 },
    { value: 0 },
    { value: 0 },
    { value: 0 },
  ]);

  //USE EFFECTS-------------------------------------------------------------------------------------------
  useEffect(() => {
    audioSetup();
    //fills gridState with default all-false grid
    const initialBlockState: boolean[][] = [];

    for (let i = 0; i < gridHeight; i++) {
      initialBlockState.push([]);
    }
    for (let i = 0; i < gridHeight; i++) {
      for (let j = 0; j < gridWidth; j++) {
        initialBlockState[i].push(false);
      }
    }
    setGridState(initialBlockState);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (running) {
        setCount((prevCount) => prevCount + 1);

        setCurrentSelected((prevState) => {
          let index = count % prevState.length;
          let nextIndex = (count + 1) % prevState.length;
          let newState = [...prevState];

          newState[index] = !prevState[index];
          newState[nextIndex] = !prevState[nextIndex];

          if (index === gridState[0].length - 1) {
            gridState.forEach((row, idx) => compute_new_row(row, idx));
          }

          return newState;
        });
      }
    }, 250);
    // clearing interval
    return () => clearInterval(timer);
  });

  //ALL OTHER FUNCTIONS --------------------------------------------------------------------------------

  const audioSetup = async () => {
    //default setup for audio
    let rawPatcher = await fetch("/automata_rhythm_gen/exports/main.export.json");
    let patcher = await rawPatcher.json();
    const device = await createDevice({ context: context.current, patcher });
    device.node.connect(context.current.destination);

    param.current = device.parametersById.get("test");
    //watch gridHeight, device only supports 8 channels
    for (let i = 0; i < gridHeight; i++) {
      audioParams.current[i] = device.parametersById.get(`drum_${i}`);
    }
  };

  //creates an array of rows
  const rows = gridState.map((index, idx1) => {
    let row = index.map((item, idx2) => {
      return (
        <MusicBlock
          key={idx1 - idx2}
          row={idx1}
          col={idx2}
          active={item}
          gridState={gridState}
          setGridState={setGridState}
          switchBlock={switchBlock}
          currentSelected={currentSelected[idx2]}
          audioParams={audioParams}
        />
      );
    });
    return (
      <div key={idx1} className="grid-div">
        {row}
      </div>
    );
  });

  //switches block between t/f and updates entire grid state
  function switchBlock(
    row: any,
    column: any,
    gridState: any,
    setGridState: any
  ): void {
    let newState = [...gridState];
    newState[row][column] = !newState[row][column];
    setGridState(newState);
  }

  //takes in an integer and returns binary form
  const int_to_binary = (inputted_int: number) => {
    let new_binary_list = [];
    while (inputted_int > 0) {
      new_binary_list.push(inputted_int % 2);
      //add remainder of inputted_int to first position of binary_list
      inputted_int = Math.floor(inputted_int / 2);
      //divide inputted_int into 2 for next test
    }
    new_binary_list = new_binary_list.reverse();
    //reverse and show original list

    var addendum = 7 - new_binary_list.length;
    for (let i = 0; i <= addendum; i++) {
      new_binary_list.unshift(0);
    }
    return new_binary_list;
    //add remaining 0's onto original binary_list
  }

  // runs over every row of the table and applies the current rule
  const compute_new_row = (row: any, idx: number) => {
    let a1 = 0;
    let a2 = 0;
    let a3 = 0;
    let a_full;
    let new_index: any[] = [];
    let binary_list = int_to_binary(currentRule);

    for (let i = 0; i < row.length; i++) {
      if (row[i - 1] === undefined) {
        a1 = 0;
      } else {
        if (row[i - 1]) {
          a1 = 1;
        } else {
          a1 = 0;
        }
      }

      if (row[i]) {
        a2 = 1;
      } else {
        a2 = 0;
      }

      if (row[i + 1] === undefined) {
        a3 = 0;
      } else {
        if (row[i + 1]) {
          a3 = 1;
        } else {
          a3 = 0;
        }
      }

      a_full = a1.toString() + a2.toString() + a3.toString();
      //creates groups of 3 (i-1, i, i+1) so that tests determining the future state can be run

      switch (a_full) {
        case "111":
          new_index[i] = binary_list[0];
          break;
        case "110":
          new_index[i] = binary_list[1];
          break;
        case "101":
          new_index[i] = binary_list[2];
          break;
        case "100":
          new_index[i] = binary_list[3];
          break;
        case "011":
          new_index[i] = binary_list[4];
          break;
        case "010":
          new_index[i] = binary_list[5];
          break;
        case "001":
          new_index[i] = binary_list[6];
          break;
        case "000":
          new_index[i] = binary_list[7];
          break;
        default:
          console.log("error computing binary index");
        //runs test determining future and places it in new array
      }
    }

    setGridState((prevState) => {
      let newState = [...prevState];
      newState[idx] = new_index;

      return newState;
    });
    //replaces current index with contents of new index
  }

  //form submit
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    let newRule = formState;
    if (newRule > 127) {
      newRule = 126;
    }
    if (newRule < 0) {
      newRule = 0;
    }
    if (newRule) {
      setCurrentRule(newRule);
    }
  };

  const onOffSwitch = async () => {
    if (running) {
      await context.current.suspend().then(() => setRunning(false));
    } else {
      await context.current.resume().then(() => setRunning(true));
    }
  };

  //playNote exists for testing audio in development
  // const playNote = (): void => {
  // param.current.value = Math.random();
  // };

  return (
    <div className="App">
      <header>
        <h1>Elementary Cellular Automata Rhythm Generator</h1>
      </header>

      <div className="control-panel">
        <form onSubmit={(e) => handleSubmit(e)} className="form-div">
          <label htmlFor="numInput">Ruleset - Current: {currentRule}</label>
          <div>
            <input
              name="numInput"
              type="number"
              min="0"
              max="126"
              value={formState}
              onChange={(e) => setFormState(Number(e.target.value))}
            ></input>
            <input type="submit" value="Submit"></input>
          </div>
        </form>
        <button className="start-stop-button" onClick={() => onOffSwitch()}>
          {running ? "Stop" : "Start"} Audio
        </button>
        {/* <button onClick={() => playNote()}>Play</button> */}
      </div>

      <div>{rows}</div>
      <div className="footer">
        <p>created by: </p>
        <a href="https://github.com/jedwards2">jedwards2</a>
      </div>
    </div>
  );
};

export default App;
