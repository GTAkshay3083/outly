import { useState } from 'react';
import { X, Star, CheckCircle } from 'lucide-react';

interface Props {
  planTitle: string;
  memberId: string;
  memberName: string;
  onClose: () => void;
  onSubmit: (attendanceScore: number, vibeScore: number) => void;
}

export default function RatingModal({
  planTitle,
  memberName,
  onClose,
  onSubmit,
}: Props) {
  const [attendance, setAttendance] = useState(10);
  const [vibe, setVibe] = useState(10);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(attendance, vibe);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const overall = ((attendance + vibe) / 2).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end">
      <div className="bg-[#121214] border-t border-[#2A2A2E] rounded-t-[32px] p-6 flex flex-col max-w-md w-full mx-auto max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] tracking-widest font-extrabold text-[#FF5E3A] uppercase">Post-Outing Karma</span>
            <h2 className="text-xl font-bold text-[#F5F5F7]">Rate {memberName}</h2>
          </div>
          <button onClick={onClose} className="text-[#A1A1A6] p-1.5 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle size={48} className="text-[#1DB954] mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Rating Recorded</h3>
            <p className="text-xs text-[#A1A1A6] mt-1">
              Your feedback is anonymous and helps keep Outly squads reliable.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-[#A1A1A6] leading-relaxed">
              For outing <strong className="text-white">"{planTitle}"</strong>. Feedback is anonymous and only shown in aggregate after multiple reviews.
            </p>

            {/* Attendance Score */}
            <div className="p-4 rounded-2xl bg-[#08080A] border border-[#2A2A2E]">
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-[#F5F5F7]">Did they show up?</label>
                <span className="text-xs font-mono font-bold text-[#1DB954]">{attendance} / 10</span>
              </div>
              <p className="text-[11px] text-[#636366] mb-3">1 = flaked / no-show • 10 = on-time & reliable</p>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAttendance(val)}
                    className={`h-8 rounded-lg font-bold text-[11px] transition-all ${
                      attendance === val
                        ? 'bg-[#1DB954] text-black shadow-md'
                        : 'bg-[#1C1C1F] text-[#A1A1A6] hover:bg-[#2A2A2E]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Behaviour & Vibe Score */}
            <div className="p-4 rounded-2xl bg-[#08080A] border border-[#2A2A2E]">
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-[#F5F5F7]">Group Vibe & Respect</label>
                <span className="text-xs font-mono font-bold text-[#FF5E3A]">{vibe} / 10</span>
              </div>
              <p className="text-[11px] text-[#636366] mb-3">1 = made group uncomfortable • 10 = positive & chill</p>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setVibe(val)}
                    className={`h-8 rounded-lg font-bold text-[11px] transition-all ${
                      vibe === val
                        ? 'bg-[#FF5E3A] text-white shadow-md'
                        : 'bg-[#1C1C1F] text-[#A1A1A6] hover:bg-[#2A2A2E]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Aggregate preview */}
            <div className="p-3 rounded-xl bg-[#1C1C1F] border border-[#2A2A2E] flex justify-between items-center">
              <span className="text-[#A1A1A6] flex items-center gap-1.5 font-medium">
                <Star size={14} className="text-[#FF5E3A]" /> Outly Score Impact:
              </span>
              <span className="font-black text-sm text-white">{overall} / 10</span>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#FF5E3A] text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-[#FF5E3A]/20"
            >
              Submit Anonymous Rating
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
