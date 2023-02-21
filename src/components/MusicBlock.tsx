/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

const MusicBlock = ({ row, col, active, gridState, setGridState, switchBlock, currentSelected, audioParams }: any) => {

  useEffect(() => {
    if (active && currentSelected) {
      audioParams.current[row].value = Math.random();
    }
  }, [active, currentSelected]);

  return (
    <div className={`music-block ${active ? "on" : "off"} ${currentSelected ? "selected" : ""}`}
      onClick={() => switchBlock(row, col, gridState, setGridState)}>
    </div>
  )
}

export default MusicBlock;
