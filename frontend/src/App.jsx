
import { useState } from 'react'

function App() {
  const [isListening, setIsListening] = useState(false)
  const [question, setQuestion] = useState('')
  const [language, setLanguage] = useState('English')
  const [isLoading, setIsLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizChecked, setQuizChecked] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUpSent, setFollowUpSent] = useState(false)

  // Image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0]

    if (!file) return

    const imageUrl = URL.createObjectURL(file)

    setImagePreview(imageUrl)
    setSelectedImage(file)
  }

  // Voice input
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang =
      language === 'Telugu'
        ? 'te-IN'
        : language === 'Hindi'
          ? 'hi-IN'
          : 'en-IN'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.log('Speech error:', event.error)
      setIsListening(false)
    }

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      setQuestion(text)
    }

    recognition.start()
  }

  // Ask AI
  const handleAskAI = () => {
    if (!question.trim() && !selectedImage) {
      alert('Please enter your question or upload an image first.')
      return
    }

    setIsLoading(true)

    // Temporary frontend demo loading.
    // Backend/API will be connected later.
    setTimeout(() => {
      setIsLoading(false)
      setShowExplanation(true)
    }, 1500)
  }

  // Quiz
  const handleQuizCheck = () => {
    if (!quizAnswer.trim()) {
      alert('Please write your answer first.')
      return
    }

    setQuizChecked(true)
  }

  // Follow-up
  const handleFollowUp = () => {
    if (!followUpQuestion.trim()) {
      alert('Please enter your follow-up question first.')
      return
    }

    setFollowUpSent(true)
  }

  // Explanation screen
  if (showExplanation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-4xl">

          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setShowExplanation(false)
              setQuizChecked(false)
              setFollowUpSent(false)
            }}
            className="mb-6 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Back
          </button>

          {/* Main Explanation Card */}
          <div className="rounded-3xl bg-white p-5 shadow-xl sm:p-8">

            {/* Header */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  🧠
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    AI Explanation
                  </h1>

                  <p className="text-sm text-slate-500">
                    Learning language: {language}
                  </p>
                </div>
              </div>

              {/* Question */}
              <p className="mt-6 text-sm font-semibold text-slate-600">
                Your doubt
              </p>

              <div className="mt-2 rounded-2xl bg-slate-100 p-4 text-slate-800">
                {question || 'Question uploaded as an image'}
              </div>
            </div>

            {/* Simple Explanation */}
            <div className="mt-6 rounded-2xl bg-blue-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💡</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Simple Explanation
                </h2>
              </div>

              <p className="mt-3 leading-7 text-slate-700">
                You asked this question in {language}. A simple,
                student-friendly explanation will be generated here.
                The AI will explain the concept in an easy way so that
                it is simple to understand and remember.
              </p>
            </div>

            {/* Step-by-Step */}
            <div className="mt-5 rounded-2xl bg-purple-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📌</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Step-by-Step Explanation
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
                  <span className="font-bold text-purple-600">1</span>
                  <span className="text-slate-700">
                    Understand the main concept.
                  </span>
                </div>

                <div className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
                  <span className="font-bold text-purple-600">2</span>
                  <span className="text-slate-700">
                    Break the concept into simple parts.
                  </span>
                </div>

                <div className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
                  <span className="font-bold text-purple-600">3</span>
                  <span className="text-slate-700">
                    Connect it with an easy real-life example.
                  </span>
                </div>

                <div className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
                  <span className="font-bold text-purple-600">4</span>
                  <span className="text-slate-700">
                    Review the concept and remember the key points.
                  </span>
                </div>
              </div>
            </div>

            {/* Uploaded Image */}
            {imagePreview && (
              <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📷</span>

                  <h2 className="text-xl font-bold text-slate-900">
                    Uploaded Question
                  </h2>
                </div>

                <img
                  src={imagePreview}
                  alt="Uploaded question"
                  className="mt-4 max-h-72 w-full rounded-2xl border border-slate-200 object-contain"
                />

                {selectedImage && (
                  <p className="mt-3 text-sm text-slate-500">
                    Selected file: {selectedImage.name}
                  </p>
                )}
              </div>
            )}

            {/* Easy Example */}
            <div className="mt-5 rounded-2xl bg-green-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Easy Example
                </h2>
              </div>

              <p className="mt-3 leading-7 text-slate-700">
                The AI will provide a simple real-life example related
                to your question. This helps you connect the concept
                with something familiar and remember it more easily.
              </p>
            </div>

            {/* Movie / Song */}
            <div className="mt-5 rounded-2xl bg-yellow-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎬</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Learn Through Movies & Songs
                </h2>
              </div>

              <p className="mt-3 leading-7 text-slate-700">
                The AI can connect difficult concepts with suitable
                movie scenes or song ideas so learning becomes more
                fun, memorable, and relatable.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="text-3xl">🎥</div>

                  <h3 className="mt-3 font-bold text-slate-800">
                    Movie Connection
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    A relevant movie scene or situation can be used
                    to make the concept easier to remember.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="text-3xl">🎵</div>

                  <h3 className="mt-3 font-bold text-slate-800">
                    Song Connection
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    A suitable song connection can help students
                    remember important ideas in a creative way.
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="mt-5 rounded-2xl bg-slate-100 p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Learning Progress
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                  <span className="text-xl">✅</span>
                  <span className="text-slate-700">
                    Question understood
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                  <span className="text-xl">✅</span>
                  <span className="text-slate-700">
                    Simple explanation
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                  <span className="text-xl">✅</span>
                  <span className="text-slate-700">
                    Step-by-step explanation
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                  <span className="text-xl">⏳</span>
                  <span className="text-slate-700">
                    Practice quiz
                  </span>
                </div>
              </div>
            </div>

            {/* Quiz */}
            <div className="mt-5 rounded-2xl bg-indigo-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Quick Practice Quiz
                </h2>
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Can you explain the concept in your own words?
              </p>

              <textarea
                value={quizAnswer}
                onChange={(e) => {
                  setQuizAnswer(e.target.value)
                  setQuizChecked(false)
                }}
                placeholder="Write your answer here..."
                className="mt-4 h-28 w-full resize-none rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />

              <button
                type="button"
                onClick={handleQuizCheck}
                className="mt-3 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Check Answer
              </button>

              {quizChecked && (
                <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-700">
                  🤖 Your answer will be evaluated by AI when the
                  backend is connected.
                </div>
              )}
            </div>

            {/* Follow-up */}
            <div className="mt-5 rounded-2xl bg-blue-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Ask a Follow-up Question
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Still confused? Ask another question about this concept.
              </p>

              <textarea
                value={followUpQuestion}
                onChange={(e) => {
                  setFollowUpQuestion(e.target.value)
                  setFollowUpSent(false)
                }}
                placeholder="Ask your follow-up question..."
                className="mt-4 h-24 w-full resize-none rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              <button
                type="button"
                onClick={handleFollowUp}
                className="mt-3 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Ask Follow-up
              </button>

              {followUpSent && (
                <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-700">
                  🤖 Your follow-up question will be answered by AI
                  when the backend is connected.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Home screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="text-center">
          <div className="mb-4 text-5xl">
            🤖
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Learn Smarter with{' '}
            <span className="text-blue-600">
              NEXTGEN AI
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-slate-600">
            Ask questions in English, Telugu, or Hindi and get
            simple, step-by-step explanations with real-life examples.
          </p>
        </div>

        {/* Main Card */}
        <div className="mt-10 rounded-3xl bg-white p-5 shadow-xl sm:p-8">

          {/* Question */}
          <label className="mb-2 block text-left text-sm font-semibold text-slate-700">
            💬 Ask Your Doubt
          </label>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Explain photosynthesis in simple words..."
            className="h-36 w-full resize-none rounded-2xl border border-slate-300 p-4 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          {/* Language */}
          <div className="mt-5">
            <label className="mb-2 block text-left text-sm font-semibold text-slate-700">
              🌐 Choose Learning Language
            </label>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option>English</option>
              <option>Telugu</option>
              <option>Hindi</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="mt-5">
            <label className="mb-2 block text-left text-sm font-semibold text-slate-700">
              📷 Upload Question Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm"
            />

            {imagePreview && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Image Preview
                </p>

                <img
                  src={imagePreview}
                  alt="Uploaded question"
                  className="max-h-64 w-full rounded-2xl border border-slate-200 object-contain"
                />

                {selectedImage && (
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedImage.name}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Voice */}
          <button
            type="button"
            onClick={startListening}
            className={`mt-5 w-full rounded-2xl border p-3 font-semibold transition ${
              isListening
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isListening
              ? '🎙️ Listening...'
              : '🎤 Ask Your Doubt by Voice'}
          </button>

          {/* Ask AI */}
          <button
            type="button"
            onClick={handleAskAI}
            disabled={isLoading}
            className="mt-5 w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading
              ? '🤔 Thinking...'
              : '✨ Ask AI'}
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
            <div className="text-3xl">🌐</div>

            <h3 className="mt-2 font-bold text-slate-800">
              Multilingual
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Learn in English, Telugu or Hindi
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
            <div className="text-3xl">🎤</div>

            <h3 className="mt-2 font-bold text-slate-800">
              Voice Input
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Ask your doubts using your voice
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
            <div className="text-3xl">📷</div>

            <h3 className="mt-2 font-bold text-slate-800">
              Image Support
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Upload questions as images
            </p>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-400">
          NEXTGEN • AI-powered multilingual learning assistant
        </p>
      </div>
    </div>
  )
}

export default App