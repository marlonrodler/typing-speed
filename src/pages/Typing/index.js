import React, { useState }  from 'react';

import './styles.css';

export default function Typing() {
    const [words, setWords] = useState(['Arroz', 'Feijão', 'Batata', 'Cenoura', 'Macarrão', 'Melancia']);
    const [score, setScore] = useState(0);

    const handleChange = async event => {
        event.preventDefault();
        var value = event.target.value;
        console.log('event.target.value:',event.target.value);
        if(words.length > 0){ 
            if (value.toLowerCase() === words[0].toLowerCase()) {
                console.log('Confirmed');
                event.target.value = '';
                console.log('words:',words);
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

    return (
        <div className='container'>
            <div className='box-score'>
                <span className='span-score'>SCORE</span>
                <span className='span-score-number'>{score}</span>
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
                    <input className='input-typing' type='text' onKeyDown={handleKeyDown} onChange={handleChange} />
                    {/* <button className='button-typing' type="submit" onClick={handleClick}>OK</button> */}
                </div>
            </div>
        </div>
    );
}