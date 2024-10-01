'use client'

export function GetStarted() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Get Started</h2>
      <p className="text-sm text-gray-600 mb-4">
        Follow this 3 simple steps and something more, but I don't know what yet?
      </p>
      <div className="space-y-2">
        <button className="w-full py-2 px-4 bg-gray-800 text-white rounded flex items-center">
          <span className="mr-2">📝</span> Create Profile
        </button>
        <button className="w-full py-2 px-4 bg-gray-800 text-white rounded flex items-center">
          <span className="mr-2">🔔</span> Unsubscribe
        </button>
        <button className="w-full py-2 px-4 bg-gray-800 text-white rounded flex items-center">
          <span className="mr-2">🗑️</span> Delete Emails
        </button>
        <button className="w-full py-2 px-4 bg-gray-800 text-white rounded flex items-center">
          <span className="mr-2">🗑️</span> Delete Emails
        </button>
      </div>
    </div>
  )
}