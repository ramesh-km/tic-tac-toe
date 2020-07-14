import React from 'react'
import ReactDOM from 'react-dom'
import './App.scss';

class Square extends React.Component {
  render() {
    return (
      <button
        className='square'
        onClick={this.props.handleClick}
        style={this.props.style}>
      {this.props.value}
      </button>
    )
  }
}

class Board extends React.Component {
  render() {
    const squares = this.props.squares;
    const squaresList = squares.map((element, index) => {
      return (
        <Square
          key={index}
          value={element}
          style={this.props.winRow ? this.props.winRow.includes(index) ? {backgroundColor: 'blue', color: 'yellow'} : null : null}
          handleClick={() => this.props.onSquareClick(index)}>
        </Square>
      );
    });
    return (
      <div className='board'>
        {squaresList}
      </div>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{squares: Array(9).fill(null)},],
      move: 0,
      isToggleOn: false,
    }

    this.handleSquareClick = this.handleSquareClick.bind(this);
  }

  handleSquareClick(index) {
    const history = this.state.history.slice(0, this.state.move + 1);
    const current = history[history.length - 1].squares.slice();
    if (current[index] || calculateWinner(current)) {
      return;
    }
    current[index] = this.state.move % 2 === 0 ? 'X' : 'O';

    // Saving this to show move or click position in history progress list.
    this.currentIndex = index;

    this.setState({
      history: history.concat([{squares: current}]),
      move: this.state.move + 1,
    });
  }

  jumpTo(move) {
    this.setState({
      // history: this.state.history.slice(0, move + 1),
      move: move
    });
  }

  handleToggleChange = () => {
    this.setState({
      isToggleOn: !this.state.isToggleOn
    });
  }

  render() {
    const current = this.state.history[this.state.move].squares;
    const win = calculateWinner(current);
    let status;
    if (win) {
      status = <span>Winner is <b>{win.winner}</b></span>
    } else {
      status = (<span>Next player: <b>{this.state.move % 2 === 0 ? 'X' : 'O'}</b></span>)
      if (this.state.move === 9) {
        status = "Match draw"
      }
    }

    const gameProgress = [];
    for (let index = 0; index < this.state.history.length; index++) {
      let previousMove;
      try {
        previousMove = (this.state.history[index - 1].squares);
      } catch(e) {
        // console.log(e.message);
        previousMove = null;
      }
      const changedMove = compareMoves(this.state.history[index].squares, previousMove);
      let desc = index ?
        <span>Move to step{`(${changedMove.x}, ${changedMove.y})`} <b>#{index}</b></span> :
        <span>Go to game start <b>#0</b></span>;

      // Bold selected move
      desc = this.state.move === index ? <b style={{'color': 'blue'}}>{desc}</b> : desc;
      gameProgress.push(
        <li key={index}><button onClick={() => this.jumpTo(index)}>{desc}</button></li>
      );
    }
    if (this.state.isToggleOn) {
      gameProgress.reverse();
    }

    function compareMoves(b, a) {
      if (!a) {
        return {x: null, y: null};
      }

      for (let index = 0; index < b.length; index++) {
        if (b[index] !== a[index]) {
          return ({
            x: Math.floor(index / 3),
            y: index % 3
          });
        }
      }

    }

    return (
      <div className='game'>
        <Board
          squares={current}
          onSquareClick={this.handleSquareClick}
          winRow={win ? win.winRow : null}>
        </Board>
        <div className='game-info'>
          <div className='status'>{status}</div>
          <div className='game-progress'>
            <Toggle value={this.state.isToggleOn} handleClick={this.handleToggleChange}></Toggle>
            <ol>{gameProgress}</ol>
          </div>
        </div>
      </div>
    )
  }
}

class Toggle extends React.Component {
  render() {
    return (
      <label>
        Show moves in reverse order ?
        <input type='checkbox' checked={this.props.value} onChange={this.props.handleClick}></input>
      </label>
    )
  }
}

function calculateWinner(squares) {
  const LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let index = 0; index < LINES.length; index++) {
    const line = LINES[index];
    const [a, b, c] = line;
    
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winRow: line
      };
    }
  }
  return null;
}

ReactDOM.render(
  <Game></Game>,
  document.getElementById('root')
)
