import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Brain, 
  Target, 
  Briefcase, 
  DollarSign, 
  Smile, 
  Home, 
  Sparkles,
  CheckCircle,
  BookOpen,
  Calendar,
  Clock,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../ui/Button';
import { GRADIENT_COLORS } from '../ui/TileCard';

// Define the categories and their associated icons and colors
const CATEGORIES = {
  'health': {
    name: 'Physical Health',
    icon: <Target className="h-6 w-6 text-white" />,
    color: 'from-[#0068aa] to-[#004d7f]', // Deep Sky Blue to Midnight Blue (index 1)
    description: 'Activities to improve your physical wellbeing, energy, and vitality.'
  },
  'career': {
    name: 'Career & Work',
    icon: <Briefcase className="h-6 w-6 text-white" />,
    color: 'from-[#008792] to-[#006a70]', // Sea Foam Teal to Forest Blue (index 8)
    description: 'Activities to enhance your professional growth and work satisfaction.'
  },
  'relationships': {
    name: 'Relationships',
    icon: <Heart className="h-6 w-6 text-white" />,
    color: 'from-[#00789f] to-[#005a77]', // Ocean Teal to Deep Aquamarine (index 6)
    description: 'Activities to strengthen your connections with others.'
  },
  'growth': {
    name: 'Personal Growth',
    icon: <Brain className="h-6 w-6 text-white" />,
    color: 'from-[#0068aa] to-[#004d7f]', // Deep Sky Blue to Midnight Blue (index 1)
    description: 'Activities to foster self-development and learning.'
  },
  'finance': {
    name: 'Financial Wellbeing',
    icon: <DollarSign className="h-6 w-6 text-white" />,
    color: 'from-[#7b5595] to-[#5d4070]', // Lavender Grape to Plum Smoke (index 9)
    description: 'Activities to improve your financial health and security.'
  },
  'recreation': {
    name: 'Recreation & Fun',
    icon: <Smile className="h-6 w-6 text-white" />,
    color: 'from-[#ea697c] to-[#b8455c]', // Watermelon Pink to Berry Wine (index 7)
    description: 'Activities to bring more joy and play into your life.'
  },
  'environment': {
    name: 'Environment',
    icon: <Home className="h-6 w-6 text-white" />,
    color: 'from-[#B1E006] to-[#6C8300]', // Lime Zest to Olive Moss (index 3)
    description: 'Activities to enhance your living and working spaces.'
  },
  'spirituality': {
    name: 'Spirituality',
    icon: <Sparkles className="h-6 w-6 text-white" />,
    color: 'from-[#FFA600] to-[#B36B00]', // Amber Gold to Bronze Spice (index 2)
    description: 'Activities to deepen your connection to meaning and purpose.'
  }
};

// Define activities for each category
const ACTIVITIES = {
  'health': [
    {
      title: 'Morning Movement Routine',
      description: 'Start your day with 10 minutes of gentle stretching or yoga to wake up your body.',
      timeframe: 'Daily',
      difficulty: 'Easy'
    },
    {
      title: 'Hydration Challenge',
      description: 'Drink at least 8 glasses of water throughout the day, using a tracking method.',
      timeframe: 'Daily',
      difficulty: 'Easy'
    },
    {
      title: 'Sleep Hygiene Overhaul',
      description: 'Create a consistent sleep schedule and bedtime routine to improve sleep quality.',
      timeframe: 'Weekly',
      difficulty: 'Medium'
    },
    {
      title: 'Meal Preparation',
      description: 'Set aside time to prepare healthy meals for the week ahead.',
      timeframe: 'Weekly',
      difficulty: 'Medium'
    },
    {
      title: 'Physical Activity Plan',
      description: 'Establish a regular exercise routine with activities you enjoy.',
      timeframe: 'Weekly',
      difficulty: 'Medium'
    },
    {
      title: 'Health Check-up',
      description: 'Schedule and attend regular preventive health appointments.',
      timeframe: 'Yearly',
      difficulty: 'Medium'
    }
  ],
  'career': [
    {
      title: 'Skill Development',
      description: 'Identify and work on a skill that would enhance your professional capabilities.',
      timeframe: 'Weekly',
      difficulty: 'Medium'
    },
    {
      title: 'Networking Coffee',
      description: 'Schedule a virtual or in-person coffee with someone in your field.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    },
    {
      title: 'Work Environment Optimization',
      description: 'Reorganize your workspace to improve focus and productivity.',
      timeframe: 'Monthly',
      difficulty: 'Easy'
    },
    {
      title: 'Career Vision Board',
      description: 'Create a visual representation of your career goals and aspirations.',
      timeframe: 'Quarterly',
      difficulty: 'Easy'
    },
    {
      title: 'Professional Development Plan',
      description: 'Outline specific steps to advance in your career over the next year.',
      timeframe: 'Yearly',
      difficulty: 'Hard'
    },
    {
      title: 'Work-Life Balance Audit',
      description: 'Assess how well you\'re balancing work with other life areas and make adjustments.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    }
  ],
  'relationships': [
    {
      title: 'Quality Time Block',
      description: 'Schedule uninterrupted time with important people in your life.',
      timeframe: 'Weekly',
      difficulty: 'Easy'
    },
    {
      title: 'Active Listening Practice',
      description: 'During conversations, focus entirely on understanding rather than responding.',
      timeframe: 'Daily',
      difficulty: 'Medium'
    },
    {
      title: 'Appreciation Expression',
      description: 'Tell someone specifically what you appreciate about them.',
      timeframe: 'Daily',
      difficulty: 'Easy'
    },
    {
      title: 'Relationship Check-in',
      description: 'Have an intentional conversation about the state of your relationship.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    },
    {
      title: 'Boundary Setting',
      description: 'Identify and communicate a boundary that would improve a relationship.',
      timeframe: 'As Needed',
      difficulty: 'Hard'
    },
    {
      title: 'Conflict Resolution Practice',
      description: 'Address a disagreement using healthy communication techniques.',
      timeframe: 'As Needed',
      difficulty: 'Hard'
    }
  ],
  'growth': [
    {
      title: 'Learning Time',
      description: 'Dedicate 30 minutes to learning something new through books, podcasts, or courses.',
      timeframe: 'Daily',
      difficulty: 'Medium'
    },
    {
      title: 'Comfort Zone Challenge',
      description: 'Do something that stretches your abilities or confronts a fear.',
      timeframe: 'Weekly',
      difficulty: 'Hard'
    },
    {
      title: 'Reflection Journal',
      description: 'Write about your personal growth, challenges, and insights.',
      timeframe: 'Weekly',
      difficulty: 'Medium'
    },
    {
      title: 'Feedback Request',
      description: 'Ask someone you trust for constructive feedback on an area you want to improve.',
      timeframe: 'Monthly',
      difficulty: 'Hard'
    },
    {
      title: 'New Skill Acquisition',
      description: 'Begin learning a completely new skill that interests you.',
      timeframe: 'Quarterly',
      difficulty: 'Medium'
    },
    {
      title: 'Personal Growth Plan',
      description: 'Create a structured plan for your personal development goals.',
      timeframe: 'Yearly',
      difficulty: 'Medium'
    }
  ],
  'finance': [
    {
      title: 'Expense Tracking',
      description: 'Record all expenses for a week to identify spending patterns.',
      timeframe: 'Weekly',
      difficulty: 'Medium'
    },
    {
      title: 'Budget Review',
      description: 'Review and adjust your budget based on current financial situation.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    },
    {
      title: 'Financial Education',
      description: 'Spend time learning about a financial topic relevant to your situation.',
      timeframe: 'Weekly',
      difficulty: 'Medium'
    },
    {
      title: 'Automatic Savings Setup',
      description: 'Set up an automatic transfer to a savings or investment account.',
      timeframe: 'Once',
      difficulty: 'Easy'
    },
    {
      title: 'Expense Reduction Challenge',
      description: 'Identify one category where you can reduce spending this month.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    },
    {
      title: 'Financial Goals Setting',
      description: 'Define short-term and long-term financial goals with specific numbers and dates.',
      timeframe: 'Yearly',
      difficulty: 'Medium'
    }
  ],
  'recreation': [
    {
      title: 'Joy List Creation',
      description: 'Make a list of activities that bring you joy, then schedule one this week.',
      timeframe: 'Weekly',
      difficulty: 'Easy'
    },
    {
      title: 'Digital Detox',
      description: 'Set aside time without screens to engage in an analog activity you enjoy.',
      timeframe: 'Weekly',
      difficulty: 'Medium'
    },
    {
      title: 'New Experience',
      description: 'Try something you\'ve never done before just for the fun of it.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    },
    {
      title: 'Creative Expression',
      description: 'Engage in a creative activity without judgment or expectation.',
      timeframe: 'Weekly',
      difficulty: 'Easy'
    },
    {
      title: 'Play Date',
      description: 'Schedule time with friends or family focused purely on having fun together.',
      timeframe: 'Monthly',
      difficulty: 'Easy'
    },
    {
      title: 'Vacation Planning',
      description: 'Plan a getaway, even if it\'s just a weekend or staycation.',
      timeframe: 'Yearly',
      difficulty: 'Medium'
    }
  ],
  'environment': [
    {
      title: 'Decluttering Session',
      description: 'Spend 20 minutes decluttering one small area of your home or workspace.',
      timeframe: 'Weekly',
      difficulty: 'Easy'
    },
    {
      title: 'Nature Connection',
      description: 'Spend time in a natural setting, paying attention to the sensory experience.',
      timeframe: 'Weekly',
      difficulty: 'Easy'
    },
    {
      title: 'Home Improvement Project',
      description: 'Complete a small project that makes your living space more comfortable or functional.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    },
    {
      title: 'Digital Organization',
      description: 'Organize your digital files, emails, or photos to reduce digital clutter.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    },
    {
      title: 'Environmental Impact Reduction',
      description: 'Implement one new habit that reduces your environmental footprint.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    },
    {
      title: 'Sanctuary Space Creation',
      description: 'Designate and design a space in your home specifically for relaxation or reflection.',
      timeframe: 'Once',
      difficulty: 'Medium'
    }
  ],
  'spirituality': [
    {
      title: 'Mindfulness Practice',
      description: 'Spend 5-10 minutes in mindful awareness of your present experience.',
      timeframe: 'Daily',
      difficulty: 'Medium'
    },
    {
      title: 'Gratitude Ritual',
      description: 'Write down or verbally express three things you\'re grateful for.',
      timeframe: 'Daily',
      difficulty: 'Easy'
    },
    {
      title: 'Values Reflection',
      description: 'Reflect on your core values and how they\'re showing up in your life.',
      timeframe: 'Weekly',
      difficulty: 'Medium'
    },
    {
      title: 'Meaning Exploration',
      description: 'Journal about what gives your life meaning and purpose.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    },
    {
      title: 'Spiritual Reading',
      description: 'Read texts that inspire spiritual or philosophical reflection.',
      timeframe: 'Weekly',
      difficulty: 'Easy'
    },
    {
      title: 'Community Connection',
      description: 'Participate in a community that shares your spiritual or ethical values.',
      timeframe: 'Monthly',
      difficulty: 'Medium'
    }
  ]
};

// Difficulty badge colors
const DIFFICULTY_COLORS = {
  'Easy': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Hard': 'bg-red-100 text-red-800'
};

// Timeframe badge colors
const TIMEFRAME_COLORS = {
  'Daily': 'bg-blue-100 text-blue-800',
  'Weekly': 'bg-purple-100 text-purple-800',
  'Monthly': 'bg-indigo-100 text-indigo-800',
  'Quarterly': 'bg-pink-100 text-pink-800',
  'Yearly': 'bg-teal-100 text-teal-800',
  'Once': 'bg-gray-100 text-gray-800',
  'As Needed': 'bg-orange-100 text-orange-800'
};

export default function SuggestedActivities() {
  const { category } = useParams<{ category: string }>();
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [showSmartGoalModal, setShowSmartGoalModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the category info or default to health if not found
  const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES] || CATEGORIES.health;
  
  // Get activities for this category
  const activities = ACTIVITIES[category as keyof typeof ACTIVITIES] || ACTIVITIES.health;
  
  // Filter activities based on difficulty if needed
  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.difficulty.toLowerCase() === filter);

  // Check if we have insights data from the location state
  const hasInsights = location.state?.insights;

  const handleCreateSmartGoal = (activity: any) => {
    setSelectedActivity(activity);
    setShowSmartGoalModal(true);
  };

  const handleConfirmSmartGoal = () => {
    // Navigate to the goals page with pre-filled data
    navigate('/dashboard/goals', { 
      state: { 
        prefillGoal: {
          title: selectedActivity.title,
          specific: `I will ${selectedActivity.description.toLowerCase()}`,
          measurable: `I will track my progress by ${selectedActivity.timeframe === 'Daily' ? 'marking each day completed' : 'completing this activity ' + selectedActivity.timeframe.toLowerCase()}`,
          achievable: `This is a ${selectedActivity.difficulty.toLowerCase()} difficulty activity that I can accomplish with my current resources.`,
          relevant: `This activity will help improve my ${categoryInfo.name.toLowerCase()} and overall life balance.`,
          time_bound: `I will start this activity immediately and continue for the next 30 days.`,
          target_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
        }
      }
    });
  };

  const handleViewInsights = () => {
    // Navigate back to the balance wheel with the insights data
    navigate('/dashboard/balance', { 
      state: { 
        showResults: true,
        scores: location.state?.scores || []
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-6">
        <Link
          to="/dashboard/balance"
          className="inline-flex items-center text-sm hover:underline text-brand-green"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Life Balance Wheel
        </Link>
      </div>

      <div className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${categoryInfo.color} p-8 mb-12`}>
        <div className="relative z-10 flex items-center">
          <div className="bg-white/20 p-4 rounded-full mr-6">
            {categoryInfo.icon}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{categoryInfo.name} Activities</h1>
            <p className="text-lg text-white/80">
              {categoryInfo.description}
            </p>
          </div>
        </div>
      </div>

      {hasInsights && (
        <div className={`bg-gradient-to-br ${categoryInfo.color} p-4 rounded-lg mb-8`}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Your Insights</h2>
            <Button 
              onClick={handleViewInsights}
              className="bg-white text-gray-800 hover:bg-white/90"
            >
              View All Insights
            </Button>
          </div>
          <p className="text-white/80 mt-2">
            You scored {location.state?.categoryScore || 5}/10 in {categoryInfo.name}. 
            {location.state?.categoryScore < 5 
              ? " This area may need focused attention." 
              : location.state?.categoryScore < 8 
                ? " There's room for growth in this area." 
                : " You're doing well in this area."}
          </p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Suggested Activities</h2>
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'primary' : 'outline'} 
              onClick={() => setFilter('all')}
              className={filter === 'all' ? `bg-gradient-to-br ${categoryInfo.color} text-white` : ''}
              size="sm"
            >
              All
            </Button>
            <Button 
              variant={filter === 'easy' ? 'primary' : 'outline'} 
              onClick={() => setFilter('easy')}
              className={filter === 'easy' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' : ''}
              size="sm"
            >
              Easy
            </Button>
            <Button 
              variant={filter === 'medium' ? 'primary' : 'outline'} 
              onClick={() => setFilter('medium')}
              className={filter === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' : ''}
              size="sm"
            >
              Medium
            </Button>
            <Button 
              variant={filter === 'hard' ? 'primary' : 'outline'} 
              onClick={() => setFilter('hard')}
              className={filter === 'hard' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' : ''}
              size="sm"
            >
              Hard
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredActivities.map((activity, index) => {
          // Use the category color for all activity cards
          const gradientColor = categoryInfo.color;
          
          return (
            <div key={index} className={`bg-gradient-to-br ${gradientColor} rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all`}>
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-2">{activity.title}</h3>
                <p className="text-white/80 mb-4">{activity.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[activity.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
                    {activity.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${TIMEFRAME_COLORS[activity.timeframe as keyof typeof TIMEFRAME_COLORS]}`}>
                    {activity.timeframe}
                  </span>
                </div>

                <Button 
                  onClick={() => handleCreateSmartGoal(activity)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create SMART Goal
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`bg-gradient-to-br ${categoryInfo.color} p-6 rounded-lg mb-12`}>
        <h2 className="text-xl font-semibold text-white mb-4">How to Use These Activities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-5 w-5 text-white mr-2" />
              <h3 className="font-medium text-white">Start Small</h3>
            </div>
            <p className="text-white/80 text-sm">
              Choose one activity that feels manageable and start there. Small, consistent steps lead to lasting change.
            </p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <BookOpen className="h-5 w-5 text-white mr-2" />
              <h3 className="font-medium text-white">Track Your Progress</h3>
            </div>
            <p className="text-white/80 text-sm">
              Keep notes on how these activities impact your sense of balance and wellbeing over time.
            </p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <Calendar className="h-5 w-5 text-white mr-2" />
              <h3 className="font-medium text-white">Schedule It</h3>
            </div>
            <p className="text-white/80 text-sm">
              Block time in your calendar for these activities to ensure they become part of your routine.
            </p>
          </div>
        </div>
      </div>

      <div className={`bg-gradient-to-br ${categoryInfo.color} p-6 rounded-lg`}>
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-white mr-2" />
          <h2 className="text-xl font-semibold text-white">Create Your Action Plan</h2>
        </div>
        
        <p className="text-white/80 mb-6">
          For the best results, choose 1-3 activities from this list and commit to them for the next 30 days. 
          Return to your Life Balance Wheel after this period to see how these activities have impacted your sense of balance.
        </p>
        
        <div className="flex justify-center">
          <Link to="/dashboard/balance">
            <Button className="bg-white text-gray-800 hover:bg-white/90">
              Return to Life Balance Wheel
            </Button>
          </Link>
        </div>
      </div>

      {/* SMART Goal Modal */}
      {showSmartGoalModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`bg-gradient-to-br ${categoryInfo.color} rounded-lg p-6 max-w-2xl w-full`}>
            <h2 className="text-xl font-semibold text-white mb-4">Create SMART Goal</h2>
            
            <div className="mb-6">
              <p className="text-white/80 mb-4">
                You're about to create a SMART goal based on the activity:
              </p>
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">{selectedActivity.title}</h3>
                <p className="text-white/80 mb-3">{selectedActivity.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[selectedActivity.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
                    {selectedActivity.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${TIMEFRAME_COLORS[selectedActivity.timeframe as keyof typeof TIMEFRAME_COLORS]}`}>
                    {selectedActivity.timeframe}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              This will take you to the SMART Goals page where you can customize and save this goal.
              The goal will be pre-filled with details from this activity.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowSmartGoalModal(false)}
                className="border-white text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmSmartGoal}
                className="bg-white text-gray-800 hover:bg-white/90"
              >
                Create SMART Goal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}