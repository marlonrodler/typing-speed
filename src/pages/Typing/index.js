import React, { useState, useEffect, useRef } from 'react';
import api from "../../services/api";

import './styles.css';

export default function Typing() {
    const [words, setWords] = useState([]);
    const [word, setWord] = useState('');
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(10);
    const [intervalId, setIntervalId] = React.useState(null)
    const [inputDisabled, setInputDisabled] = useState(true);
    const ref = useRef(null);

    useEffect(() => {
        if(timer !== 0 && words.length <= 1) {
            console.log('words:',words);
            console.log('entrou');
            getWords();
        }

        if (timer === 0) {
            handleReset();
        }
    });

    const getWords = async () => {
        try {
            const response = await api.get(`random`);
            setWords(oldArray => [...oldArray,response.data.word] );
        } catch (error) {
        }
    }

    const handleReset = () => {
        setWord('');
        clearInterval(intervalId);
        setIntervalId(null);
        setInputDisabled(true);
        setTimer(10);
        setScore(0);
        setWords([]);
    }

    const handleChange = async event => {
        event.preventDefault();
        var value = event.target.value;
        setWord(value.toLowerCase());
        if (words.length > 0) {
            if (value.toLowerCase() === words[0].toLowerCase()) {
                setWord('');
                setScore(words[0].length + score);
                let lengthWord = words[0].length;
                setTimer(timer => timer + (Math.round(timer / lengthWord)) + 3);
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
            setTimeout(() => {
                ref.current.focus();
            }, 1);
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
                            }) : "Searching new words."
                    }
                </div>
                <div className='box-form'>
                    <input ref={ref} value={word} className='input-typing' type='text' onKeyDown={handleKeyDown} onChange={handleChange} disabled={inputDisabled} />
                    {/* <button className='button-typing' type="submit" onClick={handleClick}>OK</button> */}
                </div>
            </div>
        </div>
    );
}