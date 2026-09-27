import React, { useState } from 'react';
import { MessageSquare, Heart, Send, Sparkles, User, PenTool } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReaderReflectionsProps {
  isDark: boolean;
}

interface Reflection {
  id: string;
  author: string;
  location: string;
  message: string;
  likes: number;
  time: string;
}

export const ReaderReflections: React.FC<ReaderReflectionsProps> = ({
  isDark
}) => {
  // Starts clean with NO default/seeded reviews as requested
  const [reflections, setReflections] = useState<Reflection[]>(() => {
    try {
      const saved = localStorage.getItem('wow_reflections_clean');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    const newReflection: Reflection = {
      id: Date.now().toString(),
      author: authorName.trim(),
      location: location.trim() || 'Reader',
      message: message.trim(),
      likes: 1,
      time: 'Just now'
    };

    const updated = [newReflection, ...reflections];
    setReflections(updated);
    try {
      localStorage.setItem('wow_reflections_clean', JSON.stringify(updated));
    } catch {}

    setAuthorName('');
    setLocation('');
    setMessage('');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  const handleLike = (id: string) => {
    if (likedIds.includes(id)) return;
    setLikedIds([...likedIds, id]);
    const updated = reflections.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r);
    setReflections(updated);
    try {
      localStorage.setItem('wow_reflections_clean', JSON.stringify(updated));
    } catch {}
  };

  return (
    <section id="reflections-section" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Header (Clean - No numbers) */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B93826]/10 text-[#B93826] text-xs font-cinzel font-bold tracking-widest uppercase mb-3">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>READER COMPANION & GUESTBOOK</span>
        </div>
        <h3 className={`font-cinzel text-2xl sm:text-3xl font-extrabold tracking-wide mb-3 ${
          isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'
        }`}>
          Reader Reflections
        </h3>
        <p className="text-xs sm:text-sm text-[#6C5441] dark:text-[#C4B3A2]">
          Share your thoughts on Aratrika’s journey or leave a dedication for author Pratyay Saha.
        </p>
      </div>

      {/* Input Form Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border mb-8 shadow-lg ${
        isDark ? 'bg-[#1C1613] border-[#3E2D20]' : 'bg-white border-[#E8DFC8]'
      }`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80 font-cinzel">
                YOUR NAME *
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Srijita Das"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#B93826]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80 font-cinzel">
                CITY / LOCATION
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kalyani / New Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#B93826]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80 font-cinzel">
              YOUR THOUGHTS & REFLECTIONS *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How did the book move you?..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#B93826] resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#B93826] hover:bg-[#8B2213] text-white rounded-full text-xs font-cinzel font-bold tracking-wider flex items-center gap-2 shadow-md shadow-[#B93826]/30 transition-all hover:scale-[1.02]"
            >
              <span>POST REFLECTION</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Reflections Feed */}
      {reflections.length > 0 ? (
        <div className="space-y-4">
          {reflections.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#181310] border-[#38281B]' : 'bg-[#FAF6EF] border-[#E8DEC9]'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#B93826]/20 text-[#B93826] flex items-center justify-center text-xs font-bold font-cinzel">
                    {item.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs font-cinzel">{item.author}</h5>
                    <p className="text-[10px] opacity-60 font-sans">{item.location} · {item.time}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                    likedIds.includes(item.id)
                      ? 'bg-rose-500/20 text-rose-500 font-semibold'
                      : 'bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 text-gray-500 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${likedIds.includes(item.id) ? 'fill-current' : ''}`} />
                  <span className="font-mono text-[11px]">{item.likes}</span>
                </button>
              </div>

              <p className="text-xs leading-relaxed opacity-85 font-serif">
                "{item.message}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 px-4 rounded-2xl border ${
          isDark ? 'bg-[#181310]/60 border-[#38281B]' : 'bg-[#FAF6EF]/60 border-[#E8DEC9]'
        }`}>
          <PenTool className="w-6 h-6 mx-auto text-[#B93826] opacity-60 mb-2" />
          <p className="text-xs opacity-75 font-serif italic">
            Be the first reader to leave a note or reflection above.
          </p>
        </div>
      )}

    </section>
  );
};
