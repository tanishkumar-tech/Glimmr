import { useState } from 'react';
import axios from 'axios';

const Recommender = () => {
  const [preferences, setPreferences] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async () => {
    const text = preferences.trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');
    // append user message
    const userMsg = { text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setPreferences('');
    
    try {
      const res = await axios.post('/api/recommend', { preferences: text, messages: [...messages, userMsg] });
      const products = Array.isArray(res.data?.recommendations) ? res.data.recommendations : [];
      setAnalysis(res.data?.analysis || null);
      setRecommendations(products);
      
      // Use AI's chat response if available
      const botReply = res.data?.chatResponse || (
        products.length > 0
          ? `I found ${products.length} matching pieces for you!`
          : 'I couldn\'t find exact matches. Try different keywords or browse our collection.'
      );
      
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
    } catch (e) {
      setError(e.response?.data?.error || 'AI service unavailable. Please try again.');
      setMessages(prev => [...prev, { text: 'Sorry, I had trouble processing your request. Please try again!', sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-gradient-to-br from-amber-50 via-white to-rose-50 border border-amber-100 rounded-2xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-primary">AI Assistant</h1>
        <p className="text-gray-600 mb-6">Ask me anything! I can help with jewelry, general questions, or just chat.</p>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="h-64 overflow-y-auto bg-white/70 border border-amber-100 rounded-lg p-3 mb-3">
              {messages.length === 0 && (
                <div className="text-gray-500 text-sm space-y-2">
                  <p className="font-semibold">💬 Ask me anything:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>"Show me elegant gold rings under ₹10,000"</li>
                    <li>"What's the capital of France?"</li>
                    <li>"Explain quantum physics simply"</li>
                    <li>"Help me write a birthday message"</li>
                    <li>"What jewelry matches a red dress?"</li>
                    <li>"How do I care for silver jewelry?"</li>
                  </ul>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`p-3 mb-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-50 border border-blue-200 ml-8' : 'bg-gray-50 border border-gray-200 mr-8'}`}>
                  <div className="text-xs font-semibold mb-1 text-gray-600">{msg.sender === 'user' ? 'You' : '🤖 AI Assistant'}</div>
                  <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                </div>
              ))}
              {loading && (
                <div className="p-3 bg-gray-50 border border-gray-200 mr-8 rounded-lg">
                  <div className="text-xs font-semibold mb-1 text-gray-600">🤖 AI Assistant</div>
                  <div className="text-sm text-gray-500">Thinking...</div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Describe what you're looking for..."
                className="flex-1 px-3 py-2 border border-amber-200 rounded"
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} disabled={loading} className="bg-primary text-white px-4 py-2 rounded hover:bg-accent transition-colors disabled:opacity-50">
                {loading ? 'Thinking…' : 'Ask AI'}
              </button>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>
          <div className="w-full md:w-80 bg-white/80 border border-amber-100 rounded-lg p-3">
            <h3 className="text-lg font-semibold mb-2">🤖 Universal AI</h3>
            <div className="text-xs text-gray-600 mb-3 space-y-1">
              <p>✨ Ask about ANYTHING:</p>
              <p>💍 Jewelry & Shopping</p>
              <p>🎓 Education & Learning</p>
              <p>💻 Tech & Coding Help</p>
              <p>🌍 General Knowledge</p>
              <p>✍️ Writing & Creative</p>
              <p>🎨 Style & Fashion</p>
            </div>
            <h4 className="text-sm font-semibold mb-2">Try these:</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Gold rings under ₹8000',
                'What is AI?',
                'Gift for anniversary',
                'Explain blockchain',
                'Diamond vs silver?',
                'Write a poem'
              ].map(q => (
                <button key={q} onClick={() => setPreferences(q)} className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">{q}</button>
              ))}
            </div>
          </div>
        </div>

        {analysis && (
          <div className="mt-6 mb-4 flex flex-wrap gap-2">
            {analysis.categories?.map(c => (
              <span key={c} className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">{c}</span>
            ))}
            {analysis.materials?.map(m => (
              <span key={m} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200">{m}</span>
            ))}
            {analysis.style?.map(s => (
              <span key={s} className="text-xs px-2 py-1 rounded bg-rose-100 text-rose-800 border border-rose-200">{s}</span>
            ))}
            {(analysis.budget_min !== null || analysis.budget_max !== null) && (
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200">Budget: {analysis.budget_min ? `₹${analysis.budget_min}` : '—'} - {analysis.budget_max ? `₹${analysis.budget_max}` : '—'}</span>
            )}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-3">Suggested Pieces</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendations.map(product => (
            <div key={product._id} className="border border-amber-100 p-4 rounded-lg shadow bg-white">
              <img src={product.images?.[0]} alt={product.name} className="w-full h-40 object-cover mb-2 rounded" />
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{product.category} • {product.material}</p>
              <p className="text-amber-700 font-bold mt-1">₹{(product.price || 0).toLocaleString('en-IN')}</p>
            </div>
          ))}
          {recommendations.length === 0 && (
            <div className="text-gray-500">No suggestions yet. Try a different prompt.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommender;
