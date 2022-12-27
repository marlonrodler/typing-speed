import React from 'react';

import './styles.css';

export default function Typing() {
    var words = ['Arroz', 'Feijão', 'Batata', 'Cenoura', 'Macarrão', 'Melancia'];

    return (
        <div className='container'>
            <div className='box-score'>
                <span className='span-score'>Score</span>
                <span className='span-score-number'>999</span>
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
                    <input className='input-typing' type='text' />
                    <button className='button-typing' type="submit">Enviar</button>
                </div>
            </div>
        </div>
    );
}