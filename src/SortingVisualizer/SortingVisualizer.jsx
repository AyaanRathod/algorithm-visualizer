import React from "react";
import './SortingVisualizer.css'
import * as SortingAlgorithms from '../SortingAlgorithms/SortingAlgorithms.js';

// Animation constants
const ANIMATION_SPEED_MS = 3;
const PRIMARY_COLOR = '#ff69b4';
const SECONDARY_COLOR = '#32CD32';
const BUBBLE_COMPARISON_COLOR = '#FFA500'; // Orange for bubble sort comparisons
const BUBBLE_SWAP_COLOR = '#FF4500';       // Red-orange for swaps



// Audio context and settings
let audioContext = null;

export default class SortingVisualizer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      array: [],
      isSorting: false,
      soundEnabled: true,
      arraySize: 310, // Sound toggle state
      animationSpeed:500,
    };
  }

  componentDidMount() {
    this.resetArray();
    document.addEventListener('click', this.initAudioContext, { once: true });
  }

  initAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Play a sound with frequency based on the array value
  playNote = (value, duration = 0.1) => {
    if (!this.state.soundEnabled || !audioContext) return;
    
    // Map array value to audible frequency range (higher value = higher pitch)
    const minFreq = 200;
    const maxFreq = 800;
    const frequency = minFreq + ((value / 500) * (maxFreq - minFreq));
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Add fade in/out to avoid clicks
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  toggleSound = () => {
    this.setState(prevState => ({ soundEnabled: !prevState.soundEnabled }));
    this.initAudioContext(); // Ensure audio context is initialized when enabling sound
  }

  handleSizeChange = (e) => {
  const newSize = parseInt(e.target.value);
  this.setState({ arraySize: newSize }, this.resetArray);
}

handleSpeedChange = (e) => {
  const newSpeed = parseInt(e.target.value);
  this.setState({ animationSpeed: newSpeed });
}

 resetArray() {
  if (this.state.isSorting) return;
  const array = [];
  for (let i = 0; i < this.state.arraySize; i++) {
    array.push(randomIntFromInterval(5, 500));
  }
  this.setState({ array });
}



  bubbleSort() {
    if (this.state.isSorting) return;
    this.initAudioContext(); // Ensure audio context is ready

    this.setState({ isSorting: true }, () => {
      const swaps = SortingAlgorithms.bubbleSortIterative(this.state.array);
      const arrayCopy = [...this.state.array];
      
      const animate = (remainingSwaps) => {
        if (remainingSwaps.length === 0) {
          // Play final "sorted" sound sequence
          if (this.state.soundEnabled) {
            for (let i = 0; i < 8; i++) {
              setTimeout(() => {
                this.playNote(300 + (i * 50), 0.15);
              }, i * 100);
            }
          }
          
          // Reset and remove bubble classes
          const arrayBars = document.getElementsByClassName('array-bar');
          for (let i = 0; i < arrayBars.length; i++) {
            arrayBars[i].classList.remove('bubble-comparing', 'bubble-swapping');
            arrayBars[i].style.backgroundColor = PRIMARY_COLOR;
          }
          
          this.setState({ isSorting: false });
          return;
        }

        const [i, j] = remainingSwaps.shift();
        const arrayBars = document.getElementsByClassName('array-bar');
        
        // Play sounds based on the values being compared
        this.playNote(arrayCopy[i]);
        this.playNote(arrayCopy[j]);
        
        // Clear previous classes
        for (let k = 0; k < arrayBars.length; k++) {
          arrayBars[k].classList.remove('bubble-comparing', 'bubble-swapping');
        }
        
        // Add comparison classes
        arrayBars[i].classList.add('bubble-comparing');
        arrayBars[j].classList.add('bubble-comparing');
        arrayBars[i].style.backgroundColor = BUBBLE_COMPARISON_COLOR;
        arrayBars[j].style.backgroundColor = BUBBLE_COMPARISON_COLOR;
        
        // After a brief delay, swap them
        setTimeout(() => {
          // Update comparison to swap classes
          arrayBars[i].classList.remove('bubble-comparing');
          arrayBars[j].classList.remove('bubble-comparing');
          arrayBars[i].classList.add('bubble-swapping');
          arrayBars[j].classList.add('bubble-swapping');
          
          // Swap colors
          arrayBars[i].style.backgroundColor = BUBBLE_SWAP_COLOR;
          arrayBars[j].style.backgroundColor = BUBBLE_SWAP_COLOR;
          
          // Swap the bars visually
          [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
          arrayBars[i].style.height = `${arrayCopy[i]}px`;
          arrayBars[j].style.height = `${arrayCopy[j]}px`;
          
          // Play swap sound (slightly different)
          this.playNote(arrayCopy[j], 0.2);
          
          // Reset colors after swap
          setTimeout(() => {
            arrayBars[i].classList.remove('bubble-swapping');
            arrayBars[j].classList.remove('bubble-swapping');
            arrayBars[i].style.backgroundColor = PRIMARY_COLOR;
            arrayBars[j].style.backgroundColor = PRIMARY_COLOR;
            
            // Continue with next swap
            animate(remainingSwaps);
          }, this.state.animationSpeed * 5);
        }, this.state.animationSpeed * 10);
      };
      
      animate([...swaps]);
    });
  }


  mergeSort() {
    if (this.state.isSorting) return;
    
    this.setState({ isSorting: true }, () => {
      const animations = SortingAlgorithms.mergeSortWithSteps(this.state.array);
      const arrayBars = document.getElementsByClassName('array-bar');
      
      for (let i = 0; i < animations.length; i++) {
        const isColorChange = i % 3 !== 2;
        
        if (isColorChange) {
          const [barOneIdx, barTwoIdx] = animations[i];
          const barOneStyle = arrayBars[barOneIdx].style;
          const barTwoStyle = arrayBars[barTwoIdx].style;
          const color = i % 3 === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
          
          setTimeout(() => {
            barOneStyle.backgroundColor = color;
            barTwoStyle.backgroundColor = color;
          }, i * this.state.animationSpeed);
        } else {
          setTimeout(() => {
            const [barIdx, newHeight] = animations[i];
            const barStyle = arrayBars[barIdx].style;
            barStyle.height = `${newHeight}px`;
          }, i * this.state.animationSpeed);
        }
      }
      
      // After all animations complete
      setTimeout(() => {
        this.setState({ isSorting: false });
      }, animations.length * this.state.animationSpeed);
    });
  }

  testSortingAlgorithms() {
    if (this.state.isSorting) return;
    
    for (let i = 0; i < 100; i++) {
      const array = [];
      const length = randomIntFromInterval(1, 1000);
      for (let j = 0; j < length; j++) {
        array.push(randomIntFromInterval(-1000, 1000));
      }
      const javaScriptSortedArray = array.slice().sort((a, b) => a - b);
      const mergeSortedArray = SortingAlgorithms.mergeSort(array);
      console.log(arraysAreEqual(javaScriptSortedArray, mergeSortedArray));
    }
  }

  render() {
    const { array, isSorting } = this.state;

    return (
      <div className="array-container">
        <div className="bars-container">
          {array.map((value, idx) => (
            <div
              className="array-bar"
              key={idx}
              style={{
                height: `${value}px`,
                backgroundColor: PRIMARY_COLOR,
              }}
            ></div>
          ))}
        </div>
        
        <div className="controls">
          <button 
            onClick={() => this.resetArray()} 
            disabled={isSorting}
          >
            Reset Array
          </button>
          <button 
            onClick={() => this.mergeSort()} 
            disabled={isSorting}
          >
            Merge Sort
          </button>

          <button onClick={() => this.bubbleSort()} disabled={isSorting}>
            Bubble Sort
          </button>
          <button 
            onClick={() => this.testSortingAlgorithms()} 
            disabled={isSorting}
          >
            Test Sorting Algorithms
          </button>
        </div>

         <div className="size-slider">
  <label>Array Size: {this.state.arraySize}</label>
  <input 
    type="range" 
    min="5" 
    max="500" 
    value={this.state.arraySize} 
    onChange={this.handleSizeChange} 
    disabled={isSorting}
  />
</div>

<div className="size-slider">
  <label>Animation speed: {this.state.animationSpeed}</label>
  <input 
    type="range" 
    min="5" 
    max="500" 
    value={this.state.animationSpeed} 
    onChange={this.handleSpeedChange} 
    disabled={isSorting}
  />
</div>


      </div>
    );
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}