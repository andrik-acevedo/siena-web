import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, Heart, Radiation as Meditation } from 'lucide-react';
import Button from '../ui/Button';

const EXERCISE_TYPES = [
  { id: 'cbt', name: 'CBT Exercise', icon: Brain },
  { id: 'journal', name: 'Journaling', icon: BookOpen },
  { id: 'reflection', name: 'Self-Reflection', icon: Heart },
  { id: 'meditation', name: 'Meditation', icon: Meditation },
];

export default function ExerciseForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('cbt');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement exercise creation
    navigate('/dashboard/exercises');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Exercise</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exercise Type
          </label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {EXERCISE_TYPES.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setType(id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                  type === id
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                    : 'border-gray-200 hover:border-brand-blue/60 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-sm">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Exercise Content
          </label>
          <textarea
            id="content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/exercises')}
          >
            Cancel
          </Button>
          <Button type="submit">
            Create Exercise
          </Button>
        </div>
      </form>
    </div>
  );
}