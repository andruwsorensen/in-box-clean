'use client'

export function Statistics() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>
      <p className="text-sm text-gray-600 mb-4">No clue what to put here</p>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-4xl font-bold">0</span>
          <span className="text-4xl font-bold">0</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>unsubscribed</span>
          <span>deleted</span>
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold">0</span>
          <span className="text-sm text-gray-500 ml-2">unsubscribed</span>
        </div>
      </div>
    </div>
  )
}