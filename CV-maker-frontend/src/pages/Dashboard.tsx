import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCV } from '../contexts/CVContext';
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  Clock,
  ArrowRight,
  Eye,
  Edit
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserCVs } = useCV();
  const userCVs = getUserCVs();
  const activeCVs = userCVs.filter(cv => cv.isActive);
  const recentCVs = userCVs.slice(0, 3);

  const stats = [
    {
      label: 'Total CVs',
      value: userCVs.length,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Active CVs',
      value: activeCVs.length,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-600 rounded-2xl p-8 text-purple">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-purple-100 text-lg">
              Ready to create or update your professional CV?
            </p>
          </div>
          <Link
            to="/cv/new"
            className="mt-4 md:mt-0 bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create New CV</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent CVs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent CVs List */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent CVs</h2>
            <Link
              to="/cvs"
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1 transition-colors duration-200"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentCVs.length > 0 ? (
            <div className="space-y-4">
              {recentCVs.map((cv) => (
                <div key={cv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {cv.firstName} {cv.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Updated {new Date(cv.updatedAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/cv/view/${cv.id}`}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/cv/edit/${cv.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No CVs created yet</p>
              <Link
                to="/cv/new"
                className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create your first CV</span>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="space-y-4">
            <Link
              to="/cv/new"
              className="block p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                  <Plus className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create New CV</h3>
                  <p className="text-sm text-gray-500">Start building a new professional CV</p>
                </div>
              </div>
            </Link>

            <Link
              to="/cvs"
              className="block p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Manage CVs</h3>
                  <p className="text-sm text-gray-500">View and edit your existing CVs</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;