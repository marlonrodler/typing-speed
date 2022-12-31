import React, { useState, useEffect, useRef } from 'react';
import ClipLoader from "react-spinners/ClipLoader";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import api from "../../services/api";

import './styles.css';

export default function Typing() {
    const [words, setWords] = useState([]);
    const [word, setWord] = useState('');
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(10);
    const [intervalId, setIntervalId] = React.useState(null)
    const [inputDisabled, setInputDisabled] = useState(true);
    const [inputResetDisabled, setInputResetDisabled] = useState(true);
    const [executeOneTime, setExecuteOneTime] = useState(false);
    const [loading, setLoading] = useState(true);
    const refInput = useRef(null);
    const refSpan = useRef(null);
    const MySwal = withReactContent(Swal);
    var count = 0;

    useEffect(() => {
        if (timer !== 0 && words.length === 0) {
            getWords();
        }

        if (timer === 0) {
            handleReset();
        }

        if (words.length >= 6) {
            disabledLoading();
        } else {
            enabledLoading();
        }
    });

    const disabledLoading = () => {
        setLoading(false);
    }

    const enabledLoading = () => {
        setLoading(true);
    }

    const handleAlert = () => {
        MySwal.fire({
            timer: 2000,
            html: `<center><b>Timer +3</b> | <b>Score +${word.length}</b></center>`,
            toast: true,
            position: 'top',
            showConfirmButton: false,
            showCloseButton: false
        });
    }

    const getWords = async () => {
        try {
            const response = await api.get(`random`);
            let value = (response.data.word).normalize("NFD").replace(/\p{Diacritic}/gu, "");
            if (response.data.word.search(' ') === -1 && (value === response.data.word)) {
                if (count <= 25) {
                    count = count + 1;
                    setWords(oldArray => [...oldArray, response.data.word]);
                    getWords();
                }
            } else {
                getWords();
            }
        } catch (error) {
        }
    }

    const handleReset = () => {
        setWord('');
        clearInterval(intervalId);
        setIntervalId(null);
        setInputDisabled(true);
        setTimer(10);
        if (timer !== 0) {
            setScore(0);
        }
        setWords([]);
        setInputResetDisabled(true);
        setExecuteOneTime(true);
    }

    const handleChange = async event => {
        event.preventDefault();
        var value = event.target.value;
        setWord(value.toLowerCase());
        validateWord(value);
    };

    const validateWord = (value) => {
        if (words.length > 0) {
            if (words.includes(value.toLowerCase())) {
                setWord('');
                setScore(value.length + score);
                setTimer(timer => timer + 3);
                setWords(words.filter(item => item !== value.toLowerCase()));
                setInputResetDisabled(false);
                if (words.length === 10) {
                    getWords();
                }
                Object.keys(refSpan).map((key, index) => {
                    if (refSpan[index] !== undefined && refSpan[index] !== null) {
                        return refSpan[index].style.background = `#FFF`;
                    }
                    return null;
                });
                handleAlert();
            } else {
                Object.keys(refSpan).map((key, index) => {
                    if (refSpan[index] !== undefined && refSpan[index] !== null) {
                        var calcWordPercent = ((value.length * 100) / (refSpan[index].firstChild.nodeValue).length);
                        if (value.toLowerCase() === (refSpan[index].firstChild.nodeValue.substring(0, value.length)).toLowerCase()) {
                            return refSpan[index].style.background = `linear-gradient(to right, #06D6A0 ${calcWordPercent}%, #FFF 0%)`;
                        } else {
                            return refSpan[index].style.background = `linear-gradient(to right, #EF476F ${calcWordPercent}%, #FFF 0%)`;
                        }
                    }
                    return null;
                });
            }
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
        }
    };

    const handleButtonStart = () => {
        setInputDisabled(!inputDisabled);
        if (inputDisabled) {
            setInputResetDisabled(false);
            if (executeOneTime) {
                setExecuteOneTime(false);
                setScore(0);
            }
            setTimeout(() => {
                refInput.current.focus();
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
                <button className='button-typing button-reset' onClick={handleReset} disabled={inputResetDisabled} >RESET</button>
            </div>
            <div className='box-timer'>
                <span className='span-timer'>TIMER</span>
                <span className='span-timer-number'>{timer}</span>
            </div>
            <div className='box-typing'>
                <ClipLoader
                    color="#666"
                    loading={loading}
                    size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
                <div className='box-words'>
                    {
                        words.length >= 6 ?
                            words.map((item, index) => {
                                if (index < 4) {
                                    return (
                                        <span ref={(span) => { refSpan[index] = span }} className='span-text' key={index}>{item}</span>
                                    );
                                } else {
                                    return null;
                                }
                            }) : "Searching words."
                    }
                </div>
                <div className='box-form'>
                    <input ref={refInput} value={word} className='input-typing' type='text' onKeyDown={handleKeyDown} onChange={handleChange} disabled={inputDisabled} />
                </div>
            </div>
        </div>
    );
}