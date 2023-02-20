const MusicBlock = ({ row, col, active, gridState, setGridState, switchBlock, currentSelected }: any) => {
  console.log(currentSelected)
  return (
    <div className={`music-block ${active ? "on" : "off"} ${currentSelected ? "selected" : ""}`}
      onClick={() => switchBlock(row, col, gridState, setGridState)}>
    </div>
  )
}

export default MusicBlock;
