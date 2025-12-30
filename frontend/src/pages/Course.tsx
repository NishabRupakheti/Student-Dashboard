import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_COURSES } from '../graphql/queries/course';
import { CREATE_COURSE, DELETE_COURSE } from '../graphql/mutations/course';

interface Task {
  id: number;
  completed: boolean;
}

interface Course {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  tasks: Task[];
}

const Course = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { loading, error, data, refetch } = useQuery<{ courses: Course[] }>(GET_COURSES);
  const [createCourse] = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: GET_COURSES }],
  });
  const [deleteCourse] = useMutation(DELETE_COURSE, {
    refetchQueries: [{ query: GET_COURSES }],
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse({
        variables: {
          name: formData.name,
          description: formData.description || null,
        },
      });
      setFormData({ name: '', description: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  const handleDeleteCourse = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteCourse({ variables: { id } });
      } catch (err) {
        console.error('Error deleting course:', err);
      }
    }
  };

  const getCompletionStats = (tasks: Task[]) => {
    if (tasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = tasks.filter((t) => t.completed).length;
    return {
      completed,
      total: tasks.length,
      percentage: Math.round((completed / tasks.length) * 100),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error loading courses: {error.message}</div>
      </div>
    );
  }

  const courses = data?.courses || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-2">Manage your courses and track your progress</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition duration-200"
          >
            + New Course
          </button>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-6">Create your first course to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const stats = getCompletionStats(course.tasks);
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">{course.name}</h3>
                      <button
                        onClick={() => handleDeleteCourse(course.id, course.name)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Delete course"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'No description provided'}
                    </p>

                    {/* Task Stats */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">
                          {stats.completed}/{stats.total} tasks
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{stats.percentage}% complete</div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Course Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCourse}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Introduction to React"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the course..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setFormData({ name: '', description: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Course;