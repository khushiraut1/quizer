import React, { useEffect, useState } from "react";
import he from "he";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [highlightedAnswer, setHighlightedAnswer] = useState(null);

  // Fetch quiz data from the API
  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=5&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.results) {
          console.error("API returned no results");
          setLoading(false);
          return;
        }

        const formatted = data.results.map((q) => {
          const options = [...q.incorrect_answers];
          const randomIndex = Math.floor(Math.random() * 4);
          options.splice(randomIndex, 0, q.correct_answer);
          return {
            question: he.decode(q.question),
            options: options.map((o) => he.decode(o)),
            answer: he.decode(q.correct_answer),
          };
        });

        setQuestions(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch quiz data:", err);
        setLoading(false);
      });
  }, []);

  // Timer logic (decrementing every second)
  useEffect(() => {
    if (timeLeft === 0) {
      handleAnswer(null); // Move to the next question if time runs out
    }
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);

    return () => clearInterval(timer); // Clear interval when component unmounts or changes
  }, [timeLeft]);

  // Handle the user's answer selection
  const handleAnswer = (selected) => {
    if (selected !== null) {
      setSelectedAnswer(selected);
      const isCorrect = selected === questions[current].answer;
      setHighlightedAnswer(isCorrect ? "correct" : "incorrect");

      if (isCorrect) {
        setScore(score + 1);
      }

      // Delay moving to the next question
      setTimeout(() => {
        const next = current + 1;
        if (next < questions.length) {
          setCurrent(next);
          setTimeLeft(30); // Reset timer for next question
          setSelectedAnswer(null); // Reset the selected answer for the next question
          setHighlightedAnswer(null); // Reset the highlighted answer
        } else {
          setShowResult(true);
        }
      }, 1000); // Delay of 1 second
    }
  };

  // Restart the quiz
  const restartQuiz = () => {
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setTimeLeft(30);
    setHighlightedAnswer(null);
    setSelectedAnswer(null);
  };

  // If still loading, display loading screen
  if (loading) {
    return (
      <div className="app">
        <h2>Loading quiz...</h2>
      </div>
    );
  }

  // Check if questions exist before rendering the quiz
  if (!questions || questions.length === 0) {
    return <div className="app">No questions available. Please try again later.</div>;
  }

  return (
    <div className="app">
      <h1>Quiz App</h1>

      {!showResult ? (
        <div className="question-card">
          <h2>
            Question {current + 1} of {questions.length}
          </h2>
          <p className="question-text">{questions[current].question}</p>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>

          <p className="timer">Time Left: {timeLeft}s</p>

          <div className="options">
            {questions[current].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className={`option-btn ${
                  selectedAnswer !== null
                    ? highlightedAnswer === "correct" && option === questions[current].answer
                      ? "correct"
                      : highlightedAnswer === "incorrect" && option !== questions[current].answer
                      ? "incorrect"
                      : ""
                    : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="result">
          <h2>Quiz Complete!</h2>
          <p>Your Score: {score} / {questions.length}</p>
          <button onClick={restartQuiz}>Try Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
