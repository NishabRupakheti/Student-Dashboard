import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_COURSE } from '../graphql/queries/course';
import { GET_COURSES } from '../graphql/queries/course';
import { GET_TASKS } from '../graphql/queries/task';
import { CREATE_TASK, DELETE_TASK, TOGGLE_TASK_COMPLETION } from '../graphql/mutations/task';

interface Task {
  id: number;
  title: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
}

interface Course {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  tasks: Task[];
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({ title: '', deadline: '' });

  const { loading, error, data } = useQuery<{ course: Course }>(GET_COURSE, {
    variables: { id: parseInt(courseId || '0') },
    skip: !courseId,
  });

  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: [
      { query: GET_COURSE, variables: { id: parseInt(courseId || '0') } },
      { query: GET_TASKS },
      { query: GET_COURSES },
    ],
  });

  const [toggleTask] = useMutation(TOGGLE_TASK_COMPLETION, {
    refetchQueries: [
      { query: GET_COURSE, variables: { id: parseInt(courseId || '0') } },
      { query: GET_TASKS },
      { query: GET_COURSES },
    ],
  });

  const [deleteTask] = useMutation(DELETE_TASK, {
    refetchQueries: [
      { query: GET_COURSE, variables: { id: parseInt(courseId || '0') } },
      { query: GET_TASKS },
      { query: GET_COURSES },
    ],
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        variables: {
          title: taskFormData.title,
          deadline: taskFormData.deadline,
          courseId: parseInt(courseId || '0'),
          completed: false,
        },
      });
      setTaskFormData({ title: '', deadline: '' });
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      await toggleTask({ variables: { id } });
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteTask({ variables: { id } });
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: 'text-red-600 bg-red-50', urgent: true };
    if (diffDays === 0) return { label: 'Due Today', color: 'text-orange-600 bg-orange-50', urgent: true };
    if (diffDays === 1) return { label: 'Due Tomorrow', color: 'text-yellow-600 bg-yellow-50', urgent: false };
    if (diffDays <= 7) return { label: `${diffDays} days`, color: 'text-blue-600 bg-blue-50', urgent: false };
    return { label: `${diffDays} days`, color: 'text-gray-600 bg-gray-50', urgent: false };
  };

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading course...</div>
      </div>
    );
  }

  if (error || !data?.course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Course not found</div>
          <button
            onClick={() => navigate('/course')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const course = data.course;
  const completedTasks = course.tasks.filter((t) => t.completed).length;
  const totalTasks = course.tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Sort tasks: incomplete first, then by deadline
  const sortedTasks = [...course.tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/course')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.name}</h1>
          <p className="text-gray-600 text-lg mb-6">
            {course.description || 'No description provided'}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 font-semibold">Course Progress</span>
              <span className="font-bold text-gray-900">
                {completedTasks}/{totalTasks} tasks completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">{completionPercentage}% complete</div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Task
            </button>
          </div>

          {sortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-6">Add your first task to this course</p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Add Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task) => {
                const status = getDeadlineStatus(task.deadline);
                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-lg border-2 ${
                      task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                    } ${status.urgent && !task.completed ? 'border-red-300' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <h4
                          className={`font-semibold text-lg ${
                            task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-sm text-gray-600">{formatDeadline(task.deadline)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete task"
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Task Modal */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Task</h2>
                <button
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setTaskFormData({ title: '', deadline: '' });
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

              <form onSubmit={handleCreateTask}>
                <div className="mb-4">
                  <label htmlFor="taskTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    id="taskTitle"
                    required
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Complete Chapter 3 homework"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="taskDeadline" className="block text-sm font-semibold text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    id="taskDeadline"
                    required
                    value={taskFormData.deadline}
                    onChange={(e) => setTaskFormData({ ...taskFormData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTaskModalOpen(false);
                      setTaskFormData({ title: '', deadline: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                  >
                    Add Task
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

export default CourseDetail;
