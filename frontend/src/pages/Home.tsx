import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_COURSES } from '../graphql/queries/course';
import { GET_TASKS } from '../graphql/queries/task';
import { TOGGLE_TASK_COMPLETION, CREATE_TASK } from '../graphql/mutations/task';
import { CREATE_COURSE } from '../graphql/mutations/course';
import { ME_QUERY } from '../graphql/queries/me';

interface Task {
  id: number;
  title: string;
  deadline: string;
  completed: boolean;
  courseId: number;
  createdAt: string;
  course: {
    id: number;
    name: string;
  };
}

interface Course {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  tasks: { id: number; completed: boolean }[];
}

interface User {
  firstName: string;
  email: string;
}

//this is home page
const Home = () => {
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [courseFormData, setCourseFormData] = useState({ name: '', description: '' });
  const [taskFormData, setTaskFormData] = useState({ title: '', deadline: '', courseId: '' });

  const { data: userData } = useQuery<{ me: User }>(ME_QUERY);
  const { data: coursesData, loading: coursesLoading } = useQuery<{ courses: Course[] }>(GET_COURSES);
  const { data: tasksData, loading: tasksLoading } = useQuery<{ tasks: Task[] }>(GET_TASKS);
  
  const [toggleTask] = useMutation(TOGGLE_TASK_COMPLETION, {
    refetchQueries: [{ query: GET_TASKS }, { query: GET_COURSES }],
  });
  const [createCourse] = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: GET_COURSES }],
  });
  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }, { query: GET_COURSES }],
  });

  const courses = coursesData?.courses || [];
  const tasks = tasksData?.tasks || [];

  // Calculate stats
  const totalCourses = courses.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get upcoming tasks (sorted by deadline, show next 7)
  const now = new Date();
  const upcomingTasks = [...tasks]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 7);


  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse({
        variables: {
          name: courseFormData.name,
          description: courseFormData.description || null,
        },
      });
      setCourseFormData({ name: '', description: '' });
      setIsCourseModalOpen(false);
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        variables: {
          title: taskFormData.title,
          deadline: taskFormData.deadline,
          courseId: parseInt(taskFormData.courseId),
          completed: false,
        },
      });
      setTaskFormData({ title: '', deadline: '', courseId: '' });
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };
  // Get recent courses (last 4)
  const recentCourses = [...courses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const handleToggleTask = async (id: number) => {
    try {
      await toggleTask({ variables: { id } });
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCourseProgress = (course: Course) => {
    if (course.tasks.length === 0) return 0;
    const completed = course.tasks.filter((t) => t.completed).length;
    return Math.round((completed / course.tasks.length) * 100);
  };

  if (coursesLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back{userData?.me ? `, ${userData.me.firstName}` : ''}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your courses today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalCourses}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalTasks}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{completedTasks}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{pendingTasks}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h3 className="text-xl font-bold mb-2">Overall Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-white bg-opacity-20 rounded-full h-4">
                <div
                  className="bg-white h-4 rounded-full transition-all duration-300"
                  style={{ width: `${overallCompletion}%` }}
                ></div>
              </div>
            </div>
            <div className="text-3xl font-bold">{overallCompletion}%</div>
          </div>
          <p className="text-blue-100 mt-2 text-sm">
            {completedTasks} of {totalTasks} tasks completed across all courses
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks yet. Create a task to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => {
                  const status = getDeadlineStatus(task.deadline);
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border-2 ${
                        task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                      } ${status.urgent && !task.completed ? 'border-red-300' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                          className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <h4
                            className={`font-semibold ${
                              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{task.course.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                              {status.label}
                            </span>
                            <span className="text-xs text-gray-500">{formatDeadline(task.deadline)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Courses */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Courses</h2>
            {recentCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No courses yet. Create your first course!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCourses.map((course) => {
                  const progress = getCourseProgress(course);
                  return (
                    <div key={course.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">{course.name}</h4>
                        <span className="text-sm text-gray-600">{course.tasks.length} tasks</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-md font-semibold text-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Course
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl shadow-md font-semibold text-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Task
          </button>
        </div>

        {/* Create Course Modal */}
        {isCourseModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
                <button
                  onClick={() => {
                    setIsCourseModalOpen(false);
                    setCourseFormData({ name: '', description: '' });
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
                  <label htmlFor="courseName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    required
                    value={courseFormData.name}
                    onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Introduction to React"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="courseDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="courseDescription"
                    value={courseFormData.description}
                    onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the course..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCourseModalOpen(false);
                      setCourseFormData({ name: '', description: '' });
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

        {/* Create Task Modal */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Task</h2>
                <button
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setTaskFormData({ title: '', deadline: '', courseId: '' });
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

                <div className="mb-4">
                  <label htmlFor="taskCourse" className="block text-sm font-semibold text-gray-700 mb-2">
                    Course *
                  </label>
                  <select
                    id="taskCourse"
                    required
                    value={taskFormData.courseId}
                    onChange={(e) => setTaskFormData({ ...taskFormData, courseId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
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
                      setTaskFormData({ title: '', deadline: '', courseId: '' });
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

export default Home;