import React, { useState, useEffect } from 'react';

import './styles.css';

export default function Typing() {
    const [words, setWords] = useState(['Melancia', 'Arroz', 'Feijão', 'Batata', 'Cenoura', 'Macarrão']);
    const [word, setWord] = useState('');
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(words.length > 0 ? words[0].length : 0);
    const [intervalId, setIntervalId] = React.useState(null)
    const [inputDisabled, setInputDisabled] = useState(true);

    useEffect(() => {
        if (timer === 0) {
            handleReset();
        }
    });

    const handleReset = () => {
        setWord('');
        clearInterval(intervalId);
        setIntervalId(null);
        setInputDisabled(true);
        setTimer(words.length > 0 ? words[0].length : 0);
        setScore(0);
        setWords(['Melancia', 'Arroz', 'Feijão', 'Batata', 'Cenoura', 'Macarrão']);
    }

    const handleChange = async event => {
        event.preventDefault();
        var value = event.target.value;
        setWord(value.toLowerCase());
        if (words.length > 0) {
            if (value.toLowerCase() === words[0].toLowerCase()) {
                setWord('');
                setScore(words[0].length + score + 5);
                let lengthWord = words[0].length;
                setTimer(timer => timer + lengthWord);
                words.shift();
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
        }
    };

    const handleButtonStart = () => {
        setInputDisabled(!inputDisabled);
        if (inputDisabled) {
            const id = setInterval(() => {
                setTimer(timer => timer - 1);
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
                <button className={inputDisabled ? 'button-typing button-play' : 'button-typing button-stop'} onClick={handleButtonStart}>
                    {
                        inputDisabled ? 'PLAY' : 'STOP'
                    }
                </button>
            </div>
            <div className='box-reset'>
                <button className='button-typing button-reset' onClick={handleReset} >RESET</button>
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
                    <input value={word} className='input-typing' type='text' onKeyDown={handleKeyDown} onChange={handleChange} disabled={inputDisabled} />
                    {/* <button className='button-typing' type="submit" onClick={handleClick}>OK</button> */}
                </div>
            </div>
        </div>
    );
}