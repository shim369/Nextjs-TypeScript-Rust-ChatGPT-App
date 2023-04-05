import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleQuestionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(event.target.value);
  }

  const handleGetAnswer = () => {
    axios.post('/api/answer', { question })
      .then(response => {
        setAnswer(response.data.answer);
      })
      .catch(error => {
        console.log('Error fetching answer:', error);
        setAnswer('Error fetching answer');
      });
  }

  useEffect(() => {
    if (typeof TextEncoder === 'undefined') {
      const util = require('util');
      global.TextEncoder = util.TextEncoder;
    }
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={inter.className}>
          ChatGPT Demo
        </h1>

        <div className={styles.flexBox}>
          <div className={styles.flexBoxInner}>
            <textarea className={styles.question} value={question} onChange={handleQuestionChange} placeholder="Enter your question here"></textarea>
            <button className={styles.button} onClick={handleGetAnswer}>Get Answer</button>
          </div>
          {answer && <p className={styles.answer}>{answer}</p>}
        </div>
      </main>
    </div>
  )
}
