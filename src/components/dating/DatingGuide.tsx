import { Heart, Brain, MessageSquare, Sparkles, Target, Calendar } from 'lucide-react';

const DatingGuide = () => (
  <div className="bg-gradient-to-br from-[#ea697c] to-[#b8455c] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
    <div className="flex items-center space-x-4 mb-4">
      <Heart className="h-8 w-8 text-white" />
      <h2 className="text-xl font-semibold text-white">Understanding Dating Patterns</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Brain className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Self-Awareness</h3>
            <p className="text-white/80">Track your emotional responses and energy levels to identify patterns in your dating experiences.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Target className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Red & Green Flags</h3>
            <p className="text-white/80">Learn to recognize warning signs and positive indicators in potential partners.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <MessageSquare className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Reflection</h3>
            <p className="text-white/80">Regular journaling about your dates helps clarify what you truly want and need.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Sparkles className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Growth Mindset</h3>
            <p className="text-white/80">View each date as an opportunity to learn about yourself and refine your approach.</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Dating Tracker Benefits</h3>
        
        <div className="space-y-4">
          <div>
            <div className="text-white font-medium mb-1">Identify Patterns</div>
            <ul className="text-white/80 space-y-2">
              <li>• Recognize recurring themes in your dating experiences</li>
              <li>• Notice how different types of dates affect your energy</li>
              <li>• Track which meeting methods lead to better connections</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">Improve Decision-Making</div>
            <ul className="text-white/80 space-y-2">
              <li>• Make more informed choices about second and third dates</li>
              <li>• Recognize when someone consistently displays red flags</li>
              <li>• Identify the qualities that genuinely matter to you</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">Track Progress</div>
            <ul className="text-white/80 space-y-2">
              <li>• See how your dating experiences evolve over time</li>
              <li>• Monitor your emotional responses to different situations</li>
              <li>• Celebrate growth in your communication and boundaries</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DatingGuide;