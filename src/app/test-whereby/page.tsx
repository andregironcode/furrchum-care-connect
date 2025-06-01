import TestWhereby from '@/components/TestWhereby';

export default function TestWherebyPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Whereby Integration Test</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <TestWhereby />
        </div>
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Click the "Create Test Meeting" button</li>
            <li>Wait for the meeting to be created (this may take a few seconds)</li>
            <li>Once created, click the "Open Meeting Room" link to join the meeting</li>
            <li>Verify that you can see the video call interface</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
