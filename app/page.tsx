"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sentences from "./data/sentences.json";

type Sentence = {
  zh: string;
  vi: string;
  pinyin: string;
};

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Home() {
  const [queue, setQueue] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [started, setStarted] = useState(false);

  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Swap mode: false = Trung → Việt, true = Việt → Trung
  const [swapMode, setSwapMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const startGame = () => {
    const shuffled = shuffleArray(
      Array.from({ length: sentences.length }, (_, i) => i)
    );
    const [first, ...rest] = shuffled;
    setQueue(rest);
    setCurrentIndex(first);
    setShowTranslation(false);
    setShowModal(false);
    setStarted(true);
    setUserInput("");
    setIsCorrect(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const nextSentence = () => {
    if (queue.length === 0) {
      setCurrentIndex(null);
      return;
    }
    const [first, ...rest] = queue;
    setCurrentIndex(first);
    setQueue(rest);
    setShowTranslation(false);
    setUserInput("");
    setIsCorrect(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClick = () => {
    if (currentIndex === null && !started) {
      startGame();
    } else if (!showTranslation) {
      setShowTranslation(true);
    } else {
      nextSentence();
    }
  };

  const skipSentence = () => nextSentence();

  const currentSentence =
    currentIndex !== null ? (sentences as Sentence[])[currentIndex] : null;

  const finished = started && queue.length === 0 && currentIndex === null;

  useEffect(() => {
    if (!finished) return;
    setTimeout(() => setShowModal(true), 0);
  }, [finished]);

  // 🔥 Hàm chuẩn hóa để bỏ dấu câu cuối câu
  const normalize = (text: string) => {
    return text
      .trim()
      .replace(/[.!?。！？]+$/gu, "") // bỏ mọi dấu câu cuối câu
      .replace(/\s+/g, " ") // bỏ nhiều khoảng trắng dư
      .toLowerCase();
  };

  // Check answer logic
  const checkAnswer = () => {
    if (!currentSentence) return;

    const correctAnswer = swapMode ? currentSentence.zh : currentSentence.vi;

    if (normalize(userInput) === normalize(correctAnswer)) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const displayedQuestion = () => {
    if (!currentSentence) return "";

    if (!showTranslation) {
      return swapMode ? currentSentence.vi : currentSentence.zh;
    }

    return swapMode ? currentSentence.zh : currentSentence.vi;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 relative">
      <h1 className="text-3xl font-bold mb-6">
        🥑🥑🥑 Kiểm tra nghĩa câu 🥑🥑🥑
      </h1>

      <div className="mb-4">
        <button
          onClick={() => setSwapMode(!swapMode)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          Swap: {swapMode ? "Việt → Trung" : "Trung → Việt"}
        </button>
      </div>

      {started && !finished && (
        <div>
          <p className="text-gray-500 text-sm mt-2">
            Còn lại: {queue.length + (currentIndex !== null ? 1 : 0)} câu
          </p>
        </div>
      )}

      <div className="p-6 bg-white rounded-2xl shadow-md min-w-96 text-center">
        {currentSentence ? (
          <div className="text-center">
            <p
              className={`text-2xl font-normal ${
                showTranslation ? "text-green-600" : "text-gray-800"
              }`}
            >
              {displayedQuestion()}
            </p>

            {/* Hiển thị pinyin khi đã xem nghĩa hoặc trả lời đúng */}
            {(showTranslation || isCorrect === true) && currentSentence && (
              <p className="text-gray-500 mt-2 text-lg italic">
                {currentSentence.pinyin}
              </p>
            )}
          </div>
        ) : !finished ? (
          <p className="text-gray-500 text-2xl">
            Click nút bên dưới để bắt đầu nạ
          </p>
        ) : null}
      </div>

      {currentSentence && (
        <div className="mt-4 flex flex-col items-center">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                if (isCorrect !== true) {
                  if (userInput.trim() === "") {
                    inputRef.current?.focus();
                    return;
                  }
                  checkAnswer();
                  return;
                }

                if (!showTranslation) {
                  setShowTranslation(true);
                } else {
                  nextSentence();
                  setTimeout(() => inputRef.current?.focus(), 0);
                }
              }
            }}
            placeholder={
              swapMode ? "Nhập câu tiếng Trung..." : "Nhập câu tiếng Việt..."
            }
            className="px-4 py-2 border rounded-lg w-80 text-center"
          />
          <button
            onClick={checkAnswer}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Kiểm tra
          </button>

          {isCorrect === true && (
            <p className="text-green-600 mt-2 text-xl">✅ Chính xác!</p>
          )}
          {isCorrect === false && (
            <p className="text-red-600 mt-2 text-xl">❌ Sai rồi, thử lại!</p>
          )}
        </div>
      )}

      <div className="flex gap-4 mt-6">
        {!finished ? (
          <>
            <button
              onClick={handleClick}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              {currentIndex === null && !started
                ? "Bắt đầu"
                : !showTranslation
                ? "Xem nghĩa"
                : "Tiếp tục"}
            </button>

            {currentIndex !== null && (
              <button
                onClick={skipSentence}
                className="px-6 py-3 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition cursor-pointer"
              >
                Bỏ qua
              </button>
            )}
          </>
        ) : (
          <button
            onClick={startGame}
            className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                🎉 Hoàn thành hết các câu!
              </h2>
              <p className="text-gray-700 mb-6">
                Hãy ấn Reset để luyện lại từ đầu nạ.
              </p>
              <button
                onClick={startGame}
                className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition cursor-pointer"
              >
                Reset
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
