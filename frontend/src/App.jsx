import { useState } from 'react'

const EXPLAIN_API = 'https://nextgen-sih-1.onrender.com/explain'
const CONTENT_API = 'https://nextgen-sih-1.onrender.com/content'
const PROGRESS_API = 'https://nextgen-sih-1.onrender.com/progress'
const FOLLOW_UP_API = 'https://nextgen-sih-1.onrender.com/follow-up'
const EVALUATE_API = 'https://nextgen-sih-1.onrender.com/evaluate-answer'

// Member 5 MongoDB demo user ID
const USER_ID = '6aa12b0ccbade86ad064da80'

function App() {
  const [isListening, setIsListening] = useState(false)
  const [question, setQuestion] = useState('')
  const [language, setLanguage] = useState('English')
  const [isLoading, setIsLoading] = useState(false)

  const [showExplanation, setShowExplanation] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [apiError, setApiError] = useState('')
  const [analogy, setAnalogy] = useState('')

  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizChecked, setQuizChecked] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizResult, setQuizResult] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)

  const [imagePreview, setImagePreview] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUpAnswer, setFollowUpAnswer] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [followUpError, setFollowUpError] = useState('')

  const [relatedContent, setRelatedContent] = useState(null)

  // =========================
  // PROGRESS STATES - MEMBER 5
  // =========================

  const [progressHistory, setProgressHistory] = useState([])
  const [showProgress, setShowProgress] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressMessage, setProgressMessage] = useState('')

  // =========================
  // IMAGE UPLOAD
  // =========================

  const handleImageUpload = (event) => {
    const file = event.target.files[0]

    if (!file) return

    const imageUrl = URL.createObjectURL(file)

    setImagePreview(imageUrl)
    setSelectedImage(file)
  }

  // =========================
  // VOICE INPUT
  // =========================

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

  // =========================
  // SAVE PROGRESS - MEMBER 5
  // =========================

  const saveProgress = async (score, status) => {
    try {
      setProgressMessage('Saving your progress...')

      const response = await fetch(PROGRESS_API, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          userId: USER_ID,
          topic: question.trim(),
          status: status,
          score: score,
        }),
      })

      const data = await response.json().catch(() => null)

      console.log('Progress saved:', data)

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          'Failed to save progress'
        )
      }

      setProgressMessage('✅ Progress saved successfully!')
    } catch (error) {
      console.error('Progress save error:', error)

      setProgressMessage(
        `❌ Failed to save progress: ${error.message}`
      )
    }
  }

  // =========================
  // GET PROGRESS HISTORY
  // =========================

  const getProgressHistory = async () => {
    try {
      setProgressLoading(true)

      const response = await fetch(
        `${PROGRESS_API}/${USER_ID}`
      )

      const data = await response.json().catch(() => [])

      console.log('Progress history:', data)

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          'Failed to load progress history'
        )
      }

      setProgressHistory(
        Array.isArray(data) ? data : []
      )

      setShowProgress(true)
    } catch (error) {
      console.error('Progress history error:', error)

      alert(
        `Failed to load progress history: ${error.message}`
      )
    } finally {
      setProgressLoading(false)
    }
  }

  // =========================
  // ASK AI
  // =========================

  const handleAskAI = async () => {
    if (!question.trim() && !selectedImage) {
      alert('Please enter your question or upload an image first.')
      return
    }

    if (!question.trim()) {
      alert(
        'For now, please type your question. Image AI processing will be connected later.'
      )
      return
    }

    setIsLoading(true)
    setApiError('')
    setRelatedContent(null)
    setProgressMessage('')
    setQuizAnswer('')
    setQuizChecked(false)

    try {
      // =========================
      // STEP 1: AI EXPLANATION
      // =========================

      const response = await fetch(EXPLAIN_API, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          topic: question.trim(),
          language: language,
        }),
      })

      const data = await response.json().catch(() => null)

      console.log('Explanation API response:', data)

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          `Server error: ${response.status}`
        )
      }

      setExplanation(data)
      setAnalogy(data?.analogy || '')

      // =========================
      // STEP 2: RELATED CONTENT
      // =========================

      try {
        const contentResponse = await fetch(CONTENT_API, {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            concept: question.trim(),
          }),
        })

        const contentData =
          await contentResponse.json().catch(() => null)

        console.log('Content API response:', contentData)

        if (contentResponse.ok) {
          setRelatedContent(contentData)
        } else {
          console.log(
            'Content API error:',
            contentResponse.status,
            contentData
          )

          setRelatedContent(null)
        }
      } catch (contentError) {
        console.log(
          'Content API connection error:',
          contentError
        )

        setRelatedContent(null)
      }

      setShowExplanation(true)
    } catch (error) {
      console.error('API error:', error)

      setApiError(
        `AI server error: ${error.message}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  // =========================
  // QUIZ + SAVE PROGRESS
  // =========================

  const handleQuizCheck = async () => {
   if (!quizAnswer.trim()) {
    alert('Please write your answer first.')
    return
   }

   setQuizLoading(true)
   setQuizChecked(false)
   setQuizResult(null)
   setProgressMessage('')

   try {
    const response = await fetch(EVALUATE_API, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        topic: question.trim(),
        question: 'Can you explain the concept in your own words?',
        studentAnswer: quizAnswer.trim(),
        language: language,
      }),
    })

    const data = await response.json().catch(() => null)

    console.log('Quiz evaluation response:', data)

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        'Failed to evaluate quiz answer'
      )
    }

    setQuizResult(data)
    setQuizScore(data.score || 0)
    setQuizChecked(true)

    // Save the actual quiz result in progress
    await saveProgress(data.score, data.status)

   } catch (error) {
    console.error('Quiz evaluation error:', error)

    alert(`Quiz evaluation failed: ${error.message}`)
   } finally {
    setQuizLoading(false)
   }
  }

  // =========================
  // FOLLOW UP
  // =========================

  // =========================
// FOLLOW UP
// =========================

const handleFollowUp = async () => {
  if (!followUpQuestion.trim()) {
    alert('Please enter your follow-up question first.')
    return
  }

  try {
    setFollowUpLoading(true)
    setFollowUpError('')
    setFollowUpAnswer('')

    const response = await fetch(FOLLOW_UP_API, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        topic: question.trim(),
        question: followUpQuestion.trim(),
        language: language,
      }),
    })

    const data = await response.json().catch(() => null)

    console.log('Follow-up API response:', data)

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        `Server error: ${response.status}`
      )
    }

    setFollowUpAnswer(
      data?.answer || 'No answer received from AI.'
    )
  } catch (error) {
    console.error('Follow-up API error:', error)

    setFollowUpError(
      `Failed to get follow-up answer: ${error.message}`
    )
  } finally {
    setFollowUpLoading(false)
  }
}

  // =========================
  // RELATED VIDEOS
  // =========================

  const relatedVideos = []

  // Format 1: movie + realWorld

  if (relatedContent?.movie) {
    relatedVideos.push({
      type: 'Movie / Main Video',

      title:
        relatedContent.movie.title ||
        'Related Movie / Video',

      youtubeLink:
        relatedContent.movie.youtubeUrl ||
        relatedContent.movie.youtubeLink ||
        '',

      startTime:
        relatedContent.movie.start || 0,

      endTime:
        relatedContent.movie.end || 0,

      sceneExplanation:
        relatedContent.movie.sceneExplanation ||
        relatedContent.movie.scene_explanation ||
        '',

      conceptConnection:
        relatedContent.movie.conceptConnection ||
        relatedContent.movie.concept_connection ||
        '',
    })
  }

  if (relatedContent?.realWorld) {
    relatedVideos.push({
      type: 'Real World Example',

      title:
        relatedContent.realWorld.title ||
        'Real World Example',

      youtubeLink:
        relatedContent.realWorld.youtubeUrl ||
        relatedContent.realWorld.youtubeLink ||
        '',

      startTime:
        relatedContent.realWorld.start || 0,

      endTime:
        relatedContent.realWorld.end || 0,

      sceneExplanation:
        relatedContent.realWorld.sceneExplanation ||
        relatedContent.realWorld.scene_explanation ||
        '',

      conceptConnection:
        relatedContent.realWorld.conceptConnection ||
        relatedContent.realWorld.concept_connection ||
        '',
    })
  }

  // Format 2: related_content array

  if (
    relatedVideos.length === 0 &&
    Array.isArray(relatedContent?.related_content)
  ) {
    relatedContent.related_content.forEach((item) => {
      relatedVideos.push({
        type: item.type || 'Related Video',

        title: item.title || 'Related Video',

        youtubeLink: item.youtube_url || '',

        startTime: item.timestamp_start || '0:00',

        endTime: item.timestamp_end || '0:00',

        sceneExplanation:
          item.scene_explanation || '',

        conceptConnection:
          item.concept_connection || '',
      })
    })
  }

  // =========================
  // PROGRESS HISTORY SCREEN
  // =========================

  if (showProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">

        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={() => setShowProgress(false)}
            className="mb-6 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm"
          >
            ← Back
          </button>

          <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                📊
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  My Learning Progress
                </h1>

                <p className="text-sm text-slate-500">
                  Your completed learning topics
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-4">

              {progressHistory.length > 0 ? (

                progressHistory.map((item) => (

                  <div
                    key={item._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                      <div>

                        <h2 className="text-lg font-bold text-slate-800">
                          📚 {item.topic}
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                          Status:{' '}

                          <span className="font-semibold text-green-600">
                            {item.status}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          Score:{' '}

                          <span className="font-semibold">
                            {item.score}%
                          </span>
                        </p>

                        {item.createdAt && (

                          <p className="mt-2 text-xs text-slate-400">

                            Completed on:{' '}

                            {new Date(
                              item.createdAt
                            ).toLocaleString()}

                          </p>

                        )}

                      </div>

                      <div className="text-4xl">
                        ✅
                      </div>

                    </div>

                  </div>

                ))

              ) : (

                <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">

                  📚 No learning progress found yet.

                  <p className="mt-2 text-sm">
                    Ask AI about a topic and complete the quiz to save your progress.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>
    )
  }

  // =========================
  // EXPLANATION SCREEN
  // =========================

  if (showExplanation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8 sm:py-10">

        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={() => {
              setShowExplanation(false)
              setQuizChecked(false)
              setProgressMessage('')
            }}
            className="mb-6 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={getProgressHistory}
            disabled={progressLoading}
            className="mb-6 ml-3 rounded-xl bg-green-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-70"
          >
            {progressLoading
              ? 'Loading...'
              : '📊 My Progress'}
          </button>

          <div className="rounded-3xl bg-white p-5 shadow-xl sm:p-8">

            {/* HEADER */}

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

              <p className="mt-6 text-sm font-semibold text-slate-600">
                Your doubt
              </p>

              <div className="mt-2 rounded-2xl bg-slate-100 p-4 text-slate-800">
                {question}
              </div>

            </div>

            {/* SIMPLE EXPLANATION */}

            <div className="mt-6 rounded-2xl bg-blue-50 p-5">

              <div className="flex items-center gap-2">
                <span className="text-2xl">💡</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Simple Explanation
                </h2>
              </div>

              <p className="mt-3 leading-7 text-slate-700">
                {explanation?.simple ||
                  'No explanation available.'}
              </p>

            </div>

            {/* STEP BY STEP */}

            <div className="mt-5 rounded-2xl bg-purple-50 p-5">

              <div className="flex items-center gap-2">

                <span className="text-2xl">📌</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Step-by-Step Explanation
                </h2>

              </div>

              <div className="mt-4 space-y-3">

                {explanation?.steps?.length > 0 ? (

                  explanation.steps.map((step, index) => (

                    <div
                      key={index}
                      className="flex gap-3 rounded-xl bg-white p-3 shadow-sm"
                    >

                      <span className="font-bold text-purple-600">
                        {index + 1}
                      </span>

                      <span className="text-slate-700">
                        {step}
                      </span>

                    </div>

                  ))

                ) : (

                  <div className="rounded-xl bg-white p-3 text-slate-600">
                    No step-by-step explanation available.
                  </div>

                )}

              </div>

            </div>

            {/* EASY EXAMPLE */}

            <div className="mt-5 rounded-2xl bg-green-50 p-5">

              <div className="flex items-center gap-2">

                <span className="text-2xl">🌱</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Easy Example
                </h2>

              </div>

              <p className="mt-3 leading-7 text-slate-700">
                {analogy || 'No example available.'}
              </p>

            </div>

            {/* MOVIES AND VIDEOS */}

            <div className="mt-5 rounded-2xl bg-yellow-50 p-5">

              <div className="flex items-center gap-2">

                <span className="text-2xl">🎬</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Learn Through Movies & Videos
                </h2>

              </div>

              <div className="mt-5 space-y-5">

                {relatedVideos.length > 0 ? (

                  relatedVideos.map((video, index) => (

                    <div
                      key={index}
                      className="rounded-2xl bg-white p-5 shadow-sm"
                    >

                      <h3 className="text-lg font-bold text-slate-800">
                        {video.title}
                      </h3>

                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        {video.type}
                      </p>

                      <div className="mt-4 rounded-xl bg-slate-50 p-3">

                        <p className="font-semibold text-slate-700">
                          🎬 Scene Explanation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {video.sceneExplanation ||
                            'Scene explanation not available.'}
                        </p>

                      </div>

                      <div className="mt-3 rounded-xl bg-blue-50 p-3">

                        <p className="font-semibold text-slate-700">
                          🧠 Concept Connection
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {video.conceptConnection ||
                            'Concept explanation not available.'}
                        </p>

                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600">

                        <span>
                          ⏱️ Relevant Time:
                        </span>

                        <span className="rounded-lg bg-slate-100 px-3 py-1">
                          {video.startTime} – {video.endTime}
                        </span>

                      </div>

                      {video.youtubeLink && (

                        <a
                          href={video.youtubeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                        >
                          ▶️ Watch Related Video
                        </a>

                      )}

                    </div>

                  ))

                ) : (

                  <div className="rounded-xl bg-white p-4 text-slate-600">
                    No relevant movie or video is available for this topic yet.
                  </div>

                )}

              </div>

            </div>

            {/* LEARNING PROGRESS */}

            <div className="mt-5 rounded-2xl bg-slate-100 p-5">

              <div className="flex items-center gap-2">

                <span className="text-2xl">📊</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Learning Progress
                </h2>

              </div>

              <div className="mt-5 space-y-3">

                <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                  <span>✅</span>
                  <span>Question understood</span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                  <span>✅</span>
                  <span>Simple explanation</span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                  <span>🎬</span>
                  <span>Visual learning through videos</span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white p-3">

                  <span>
                    {quizChecked ? '✅' : '⏳'}
                  </span>

                  <span>Practice quiz</span>

                </div>

              </div>

            </div>

            {/* QUIZ */}

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
                  setProgressMessage('')
                }}

                placeholder="Write your answer here..."

                className="mt-4 h-28 w-full resize-none rounded-xl border border-slate-300 bg-white p-3 outline-none"
              />

              <button
                type="button"
                onClick={handleQuizCheck}
                disabled={quizLoading}
                className="mt-3 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-70"
              >
                {quizLoading
                 ? '🤖 Checking your answer...'
                 : 'Check Answer & Save Progress'}
              </button>

              {quizChecked && quizResult && (

                <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-700">

                  <h3 className="text-lg font-bold text-slate-800">
                    🤖 Quiz Evaluation
                  </h3>

                  <p className="mt-3">
                    <span className="font-semibold">Score:</span>{' '}
                    {quizResult.score}%
                  </p>

                  <p className="mt-2">
                    <span className="font-semibold">Status:</span>{' '}
                    {quizResult.status}
                  </p>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <p className="font-semibold">
                      💬 Feedback
                    </p>

                    <p className="mt-2 leading-6">
                      {quizResult.feedback}
                    </p>
                  </div>

                  {progressMessage && (
                    <p className="mt-3 font-semibold">
                      {progressMessage}
                    </p>
                  )}

                </div>

              )}

            </div>

            {/* FOLLOW UP */}

            <div className="mt-5 rounded-2xl bg-blue-50 p-5">

              <div className="flex items-center gap-2">

                <span className="text-2xl">💬</span>

                <h2 className="text-xl font-bold text-slate-900">
                  Ask a Follow-up Question
                </h2>

              </div>

              <textarea
                value={followUpQuestion}

                onChange={(e) => {
                  setFollowUpQuestion(e.target.value)
                  setFollowUpAnswer('')
                  setFollowUpError('')
                }}

                placeholder="Ask your follow-up question..."

                className="mt-4 h-24 w-full resize-none rounded-xl border border-slate-300 bg-white p-3 outline-none"
              />

              <button
                type="button"
                onClick={handleFollowUp}
                disabled={followUpLoading}
                className="mt-3 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-70"
              >
                {followUpLoading
                  ? '🤖 Thinking...'
                  : 'Ask Follow-up'}
              </button>

              {followUpAnswer && (

                <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm">

                  <p className="font-bold text-blue-600">
                    🤖 AI Answer
                  </p>

                  <p className="mt-2 leading-7">
                    {followUpAnswer}
                  </p>

                </div>

              )}

              {followUpError && (

                <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">

                  {followUpError}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>
    )
  }

  // =========================
  // HOME SCREEN
  // =========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">

      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

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
            simple, step-by-step explanations with real-life
            examples and visual learning.

          </p>

        </div>

        {/* ERROR */}

        {apiError && (

          <div className="mt-6 rounded-xl bg-red-50 p-4 text-center text-red-600">
            {apiError}
          </div>

        )}

        {/* MAIN CARD */}

        <div className="mt-10 rounded-3xl bg-white p-5 shadow-xl sm:p-8">

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            💬 Ask Your Doubt
          </label>

          <textarea
            value={question}

            onChange={(e) => setQuestion(e.target.value)}

            placeholder="Example: Explain photosynthesis in simple words..."

            className="h-36 w-full resize-none rounded-2xl border border-slate-300 p-4 text-slate-800 outline-none"
          />

          {/* LANGUAGE */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              🌐 Choose Learning Language
            </label>

            <select
              value={language}

              onChange={(e) =>
                setLanguage(e.target.value)
              }

              className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none"
            >

              <option>English</option>
              <option>Telugu</option>
              <option>Hindi</option>

            </select>

          </div>

          {/* IMAGE */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
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

          {/* VOICE */}

          <button
            type="button"
            onClick={startListening}

            className={`mt-5 w-full rounded-2xl border p-3 font-semibold ${
              isListening
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >

            {isListening
              ? '🎙️ Listening...'
              : '🎤 Ask Your Doubt by Voice'}

          </button>

          {/* ASK AI */}

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

          {/* MY PROGRESS */}

          <button
            type="button"
            onClick={getProgressHistory}
            disabled={progressLoading}

            className="mt-4 w-full rounded-2xl bg-green-600 py-3 font-bold text-white shadow-md transition hover:bg-green-700 disabled:opacity-70"
          >

            {progressLoading
              ? 'Loading Progress...'
              : '📊 View My Learning Progress'}

          </button>

        </div>

        {/* FEATURES */}

        <div className="mt-8 grid gap-4 sm:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 text-center shadow-md">

            <div className="text-3xl">🌐</div>

            <h3 className="mt-2 font-bold">
              Multilingual
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Learn in English, Telugu or Hindi
            </p>

          </div>

          <div className="rounded-2xl bg-white p-5 text-center shadow-md">

            <div className="text-3xl">🎤</div>

            <h3 className="mt-2 font-bold">
              Voice Input
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Ask your doubts using your voice
            </p>

          </div>

          <div className="rounded-2xl bg-white p-5 text-center shadow-md">

            <div className="text-3xl">📷</div>

            <h3 className="mt-2 font-bold">
              Image Support
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Upload questions as images
            </p>

          </div>

          <div className="rounded-2xl bg-white p-5 text-center shadow-md">

            <div className="text-3xl">🎬</div>

            <h3 className="mt-2 font-bold">
              Visual Learning
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Learn through movies and videos
            </p>

          </div>

        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          NEXTGEN • AI-powered multilingual learning assistant
        </p>

      </div>

    </div>
  )
}

export default App