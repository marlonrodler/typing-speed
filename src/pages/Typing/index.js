import React, { useState } from 'react';

import './styles.css';

export default function Typing() {
    const [words, setWords] = useState(['Arroz', 'Feijão', 'Batata', 'Cenoura', 'Macarrão', 'Melancia']);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(60);
    const [intervalId, setIntervalId] = React.useState(null)
    const [inputDisabled, setInputDisabled] = useState(true);

    const handleChange = async event => {
        event.preventDefault();
        var value = event.target.value;
        if (words.length > 0) {
            if (value.toLowerCase() === words[0].toLowerCase()) {
                event.target.value = '';
                setScore(words[0].length + score + 5);
                words.shift();
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
        }
    };

    const changeButtonStart = (event) => {
        setInputDisabled(!inputDisabled);
        if (inputDisabled) {
            let count = timer;
            const id = setInterval(() => {
                setTimer(timer => timer - 1);
                count -= 1;

                if(count === 0) {
                    clearInterval(id);
                    setIntervalId(null);
                    setInputDisabled(true);
                    setTimer(60);
                    setScore(0);
                    setWords(['Arroz', 'Feijão', 'Batata', 'Cenoura', 'Macarrão', 'Melancia']);
                }
            }, 1000);
            setIntervalId(id);
        } else {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    }

    return (
        <div className='container'>
            <div className='box-score'>
                <span className='span-score'>SCORE</span>
                <span className='span-score-number'>{score}</span>
            </div>
            <div className='box-play'>
                <button className={inputDisabled ? 'button-typing button-play' : 'button-typing button-stop'} onClick={changeButtonStart}>
                    {
                        inputDisabled ? 'PLAY' : 'STOP'
                    }
                </button>
            </div>
            <div className='box-timer'>
                <span className='span-timer'>TIMER</span>
                <span className='span-timer-number'>{timer}</span>
            </div>
            <div className='box-typing'>
                <div className='box-words'>
                    {
                        words.length > 0 ?
                            words.map((item, index) => {
                                return (
                                    <span className='span-text' key={index}>{item}</span>
                                );
                            }) : "No item found."
                    }
                </div>
                <div className='box-form'>
                    <input className='input-typing' type='text' onKeyDown={handleKeyDown} onChange={handleChange} disabled={inputDisabled} />
                    {/* <button className='button-typing' type="submit" onClick={handleClick}>OK</button> */}
                </div>
            </div>
        </div>
    );
}