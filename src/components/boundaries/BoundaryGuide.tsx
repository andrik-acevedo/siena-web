import React, { useState } from "react";
import { Shield, MessageSquare, Heart, Brain, Sparkles, X } from "lucide-react";

type BoundaryGuideProps = {
  asInlineButton?: boolean;
  defaultOpen?: boolean;
};

const GuideContent: React.FC = () => (
  <div className="bg-gradient-to-br from-[#F27C7C] to-[#E03B3B] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
    <div className="flex items-center space-x-4 mb-4">
      <Shield className="h-8 w-8 text-white" />
      <h2 className="text-xl font-semibold text-white">Understanding Boundaries</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Brain className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Self-Protection</h3>
            <p className="text-white/80">Boundaries define what's acceptable and protect your emotional wellbeing.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Heart className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Relationship Health</h3>
            <p className="text-white/80">Clear boundaries create safety and respect in all relationships.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <MessageSquare className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Communication</h3>
            <p className="text-white/80">Expressing boundaries clearly helps others understand your needs.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Sparkles className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Personal Growth</h3>
            <p className="text-white/80">Setting boundaries builds self-respect and confidence over time.</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Boundary Essentials</h3>
        <div className="space-y-4">
          <div>
            <div className="text-white font-medium mb-1">Effective Boundaries</div>
            <ul className="text-white/80 space-y-2">
              <li>• Focus on what you will do, not what others should do</li>
              <li>• Include clear, non-punitive consequences</li>
              <li>• Are communicated calmly and directly</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">Common Areas</div>
            <ul className="text-white/80 space-y-2">
              <li>• Emotional: protecting your feelings and mental space</li>
              <li>• Physical: your body, personal space, and possessions</li>
              <li>• Time: how and with whom you spend your time</li>
              <li>• Communication: how you expect to be spoken to</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">Remember</div>
            <ul className="text-white/80 space-y-2">
              <li>• Boundaries protect, not punish</li>
              <li>• It's okay to start small and build firmness</li>
              <li>• Consistency is key to effectiveness</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BoundaryGuide: React.FC<BoundaryGuideProps> = ({ asInlineButton, defaultOpen }) => {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  if (!asInlineButton) return <GuideContent />;

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
        title="Tips"
        onClick={() => setOpen(true)}
      >
        <Shield size={16} />
        Tips
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/40" aria-label="Close tips" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-2 -right-2 rounded-full bg-white text-slate-800 shadow p-2"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <GuideContent />
          </div>
        </div>
      )}
    </>
  );
};

export default BoundaryGuide;
