// This page uses mock quiz data for now.

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { QUIZ_PASS_SCORE } from '../utils/constants'
import styles from './Quiz.module.css'

// Replace this with real quiz data later.
const MOCK_QUIZ = [
  {
    id: 1,
    question: 'What is the primary goal of this tutorial?',
    options: ['Entertainment only', 'Structured learning with progress tracking', 'Social networking', 'Content creation tools'],
    correctIndex: 1,
  },
  {
    id: 2,
    question: 'Which feature makes HowToob different from standard video platforms?',
    options: ['Longer videos', 'Progress tracking and AI quizzes', 'Live streaming', 'Social feeds'],
    correctIndex: 1,
  },
  {
    id: 3,
    question: 'What percentage of a video must be watched to count as "completed"?',
    options: ['50%', '75%', '90%', '100%'],
    correctIndex: 2,
  },
]

export default function Quiz() {
  const { videoId } = useParams()
  const { saveQuizScore } = useProgress()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const questions = MOCK_QUIZ
  const current = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1

  function handleSelect(optionIdx) {
    if (submitted) return
    setSelectedAnswers(prev => ({ ...prev, [current.id]: optionIdx }))
  }

  function handleNext() {
    if (!isLast) setCurrentIdx(i => i + 1)
  }

  function handleSubmit() {
    setSubmitted(true)
    const correct = questions.filter(q => selectedAnswers[q.id] === q.correctIndex).length
    const score = Math.round((correct / questions.length) * 100)
    saveQuizScore(videoId, score)
  }

  if (submitted) {
    const correct = questions.filter(q => selectedAnswers[q.id] === q.correctIndex).length
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= QUIZ_PASS_SCORE

    return (
      <div className={styles.page}>
        <div className={styles.results}>
          <span className={styles.resultEmoji} aria-hidden="true">
            {passed ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            )}
          </span>
          <h1 className={styles.resultTitle}>{passed ? 'Quiz Passed!' : 'Keep Learning!'}</h1>
          <div className={styles.scoreCircle}>
            <span className={`${styles.scoreNum} ${passed ? styles.scorePassed : styles.scoreFailed}`}>
              {score}%
            </span>
          </div>
          <p className={styles.scoreDetail}>{correct} / {questions.length} correct</p>
          <Badge variant={passed ? 'success' : 'warning'} size="md">
            {passed ? 'Passed' : `Need ${QUIZ_PASS_SCORE}% to pass`}
          </Badge>
          <div className={styles.resultActions}>
            <Button variant="secondary" onClick={() => { setSubmitted(false); setCurrentIdx(0); setSelectedAnswers({}) }}>
              Retake quiz
            </Button>
            <Button variant="primary" onClick={() => window.history.back()}>
              Back to video
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.quizCard}>
        {/* Quiz progress */}
        <div className={styles.progress}>
          <span className={styles.progressText}>Question {currentIdx + 1} of {questions.length}</span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className={styles.question}>{current.question}</h2>

        <ul className={styles.options}>
          {current.options.map((opt, idx) => (
            <li key={idx}>
              <button
                type="button"
                className={`${styles.option} ${selectedAnswers[current.id] === idx ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(idx)}
              >
                <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                {opt}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {!isLast ? (
            <Button
              variant="primary"
              disabled={selectedAnswers[current.id] == null}
              onClick={handleNext}
            >
              Next question →
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={selectedAnswers[current.id] == null}
              onClick={handleSubmit}
            >
              Submit quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
